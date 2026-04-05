"use client";

import { HttpLink } from "@apollo/client";
import { SetContextLink } from "@apollo/client/link/context";
import { ErrorLink } from "@apollo/client/link/error";
import { CombinedGraphQLErrors } from "@apollo/client/errors";
import {
  ApolloNextAppProvider,
  ApolloClient,
  InMemoryCache,
} from "@apollo/client-integration-nextjs";
import { Observable } from "rxjs";
import {
  getValidAccessTokenForAuthHeader,
  clearAuthSession,
} from "@/lib/auth-session";
import { refreshAccessToken } from "@/lib/refresh-access-token";

function redirectToLogin(): void {
  if (typeof window === "undefined") return;
  const locale = window.location.pathname.split("/")[1] ?? "en";
  window.location.replace(`/${locale}/login`);
}

function forceLogout(): void {
  clearAuthSession();
  fetch(
    process.env.NEXT_PUBLIC_API_GRAPHQL_URL ?? "http://localhost:3001/graphql",
    {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: "mutation Logout { logout }" }),
    },
  ).catch(() => {});
  redirectToLogin();
}

function makeClient() {
  const httpLink = new HttpLink({
    uri:
      process.env.NEXT_PUBLIC_API_GRAPHQL_URL ??
      "http://localhost:3001/graphql",
    credentials: "include",
  });

  const authLink = new SetContextLink((prevContext) => {
    const token = getValidAccessTokenForAuthHeader();
    if (!token) return {};
    const headers = {
      ...(typeof prevContext.headers === "object" && prevContext.headers !== null
        ? (prevContext.headers as Record<string, string>)
        : {}),
    };
    return { headers: { ...headers, Authorization: `Bearer ${token}` } };
  });

  /**
   * Handles UNAUTHENTICATED errors from the API:
   *   1. No-op on SSR (typeof window === "undefined").
   *   2. No retry if operation already flagged authRetry (avoids infinite loops).
   *   3. Attempt refresh (singleflight via refreshAccessToken).
   *      - Success → persistAuthSession was called inside refreshAccessToken; retry once.
   *      - Failure → clearAuthSession; best-effort logout mutation; redirectToLogin.
   */
  const errorLink = new ErrorLink(({ error, operation, forward }) => {
    if (typeof window === "undefined") return;

    const isUnauthenticated =
      (CombinedGraphQLErrors.is(error) &&
        error.errors.some(
          (e) => e.extensions?.["code"] === "UNAUTHENTICATED",
        )) ||
      (!CombinedGraphQLErrors.is(error) &&
        error instanceof Error &&
        "statusCode" in error &&
        (error as unknown as { statusCode: number }).statusCode === 401);

    if (!isUnauthenticated) return;

    const context = operation.getContext() as Record<string, unknown>;
    if (context["authRetry"] === true) return;

    return new Observable((observer) => {
      void refreshAccessToken().then((success) => {
        if (success) {
          operation.setContext({ ...context, authRetry: true });
          const sub = forward(operation).subscribe({
            next: (value) => observer.next(value),
            error: (err: unknown) => observer.error(err),
            complete: () => observer.complete(),
          });
          return () => sub.unsubscribe();
        } else {
          forceLogout();
          observer.complete();
        }
      });
    });
  });

  return new ApolloClient({
    cache: new InMemoryCache(),
    link: errorLink.concat(authLink).concat(httpLink),
  });
}

export function ApolloWrapper({ children }: React.PropsWithChildren) {
  return (
    <ApolloNextAppProvider makeClient={makeClient}>
      {children}
    </ApolloNextAppProvider>
  );
}

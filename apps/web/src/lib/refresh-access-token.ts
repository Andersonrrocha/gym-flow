import { persistAuthSession } from "@/lib/auth-session";

const GQL_ENDPOINT =
  process.env.NEXT_PUBLIC_API_GRAPHQL_URL ?? "http://localhost:3001/graphql";

const REFRESH_MUTATION = `
  mutation RefreshSession {
    refreshSession {
      success
      accessToken
    }
  }
`;

/** Active in-flight refresh promise shared across concurrent callers (singleflight). */
let inFlight: Promise<boolean> | null = null;

/**
 * Calls refreshSession mutation via plain fetch (no Apollo, avoids circular dependency).
 * Browser-only: returns false immediately on SSR.
 *
 * Singleflight: concurrent callers share the same promise and all get the same result.
 *
 * On success:  calls persistAuthSession(accessToken) — the ONLY place that writes the token.
 * On failure:  returns false; caller is responsible for clearAuthSession + redirect.
 */
export function refreshAccessToken(): Promise<boolean> {
  if (typeof window === "undefined") {
    return Promise.resolve(false);
  }

  if (inFlight) {
    return inFlight;
  }

  inFlight = (async (): Promise<boolean> => {
    try {
      const res = await fetch(GQL_ENDPOINT, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: REFRESH_MUTATION }),
      });

      if (!res.ok) return false;

      const json = (await res.json()) as {
        data?: { refreshSession?: { success: boolean; accessToken: string | null } };
        errors?: unknown[];
      };

      const token = json.data?.refreshSession?.accessToken;
      if (!token) return false;

      persistAuthSession(token);
      return true;
    } catch {
      return false;
    } finally {
      inFlight = null;
    }
  })();

  return inFlight;
}

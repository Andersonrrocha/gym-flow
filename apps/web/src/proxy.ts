import { NextResponse, type NextRequest } from "next/server";
import createMiddleware from "next-intl/middleware";
import { routing } from "@/i18n/routing";
import { isJwtAccessExpired } from "@/lib/jwt-payload";

const ACCESS_TOKEN_COOKIE = "gymflow_access_token";
/**
 * The refresh token is an httpOnly cookie set by the API (7-day expiry).
 * We can't read its value but we can check its presence: if it exists, the
 * client is still able to renew the session and must NOT be redirected to login.
 */
const REFRESH_TOKEN_COOKIE = "gymflow_refresh_token";
const handleI18nRouting = createMiddleware(routing);

function getLocaleFromPathname(pathname: string): string | null {
  const segments = pathname.split("/");
  const maybeLocale = segments[1];

  if (routing.locales.includes(maybeLocale as (typeof routing.locales)[number])) {
    return maybeLocale;
  }

  return null;
}

function isProtectedRoute(pathname: string, locale: string): boolean {
  if (pathname === `/${locale}/workouts` || pathname.startsWith(`/${locale}/workouts/`)) {
    return true;
  }
  if (pathname === `/${locale}/exercises` || pathname.startsWith(`/${locale}/exercises/`)) {
    return true;
  }
  return false;
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const locale = getLocaleFromPathname(pathname);
  const token = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value;
  const refreshToken = request.cookies.get(REFRESH_TOKEN_COOKIE)?.value;
  /**
   * A session is "recoverable" when the refresh token is still present even if
   * the short-lived access token has already expired.  In that case we let the
   * request through so the client-side Apollo error link can transparently call
   * refreshSession and retry without interrupting the user.
   *
   * Only redirect to /login when BOTH cookies are absent (truly logged-out).
   */
  const hasSession = Boolean(token ?? refreshToken);

  /** Non-expired JWT in the web-access cookie — used to avoid login↔home loops when the cookie is stale. */
  const hasValidAccessCookie =
    Boolean(token) && !isJwtAccessExpired(token as string);

  if (locale) {
    const isLoginRoute = pathname === `/${locale}/login`;
    const isSignupRoute = pathname === `/${locale}/signup`;
    const isLocaleRootRoute = pathname === `/${locale}`;

    if (!hasSession && (isLocaleRootRoute || isProtectedRoute(pathname, locale))) {
      return NextResponse.redirect(new URL(`/${locale}/login`, request.url));
    }

    if (
      hasValidAccessCookie &&
      (isLocaleRootRoute || isLoginRoute || isSignupRoute)
    ) {
      return NextResponse.redirect(new URL(`/${locale}/workouts`, request.url));
    }
  }

  return handleI18nRouting(request);
}

export const config = {
  matcher: ["/", "/(pt|en)/:path*", "/((?!api|_next|_vercel|.*\\..*).*)"],
};

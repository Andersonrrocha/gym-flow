import { NextResponse, type NextRequest } from "next/server";
import createMiddleware from "next-intl/middleware";
import { routing } from "@/i18n/routing";

const ACCESS_TOKEN_COOKIE = "gymflow_access_token";
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
  return pathname === `/${locale}/workouts` || pathname.startsWith(`/${locale}/workouts/`);
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const locale = getLocaleFromPathname(pathname);
  const token = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value;

  if (locale) {
    const isLoginRoute = pathname === `/${locale}/login`;
    const isSignupRoute = pathname === `/${locale}/signup`;
    const isLocaleRootRoute = pathname === `/${locale}`;

    if (!token && (isLocaleRootRoute || isProtectedRoute(pathname, locale))) {
      return NextResponse.redirect(new URL(`/${locale}/login`, request.url));
    }

    if (token && (isLocaleRootRoute || isLoginRoute || isSignupRoute)) {
      return NextResponse.redirect(new URL(`/${locale}/workouts`, request.url));
    }
  }

  return handleI18nRouting(request);
}

export const config = {
  matcher: ["/", "/(pt|en)/:path*", "/((?!api|_next|_vercel|.*\\..*).*)"],
};

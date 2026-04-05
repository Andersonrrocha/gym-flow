import { isJwtAccessExpired } from "@/lib/jwt-payload";

const STORAGE_KEY = "gymflow_access_token";
const COOKIE_NAME = "gymflow_access_token";
/** Aligned with the JWT access token expiresIn of 15 minutes. */
const MAX_AGE_SEC = 15 * 60;

/**
 * SINGLE SOURCE OF TRUTH for the access token on the client.
 *
 * The token MUST only be written via `persistAuthSession` (called on login, register, and
 * after a successful refresh) and cleared via `clearAuthSession` (called on voluntary logout
 * or forced logout when refresh fails). No other module should mutate token state.
 */

function clientCookieSuffix(): string {
  const isProd = process.env.NODE_ENV === "production";
  return isProd ? "; Secure" : "";
}

/**
 * Persists access token for Apollo (sessionStorage) and Next middleware (host cookie).
 * API may Set-Cookie on another origin; that cookie is not always sent to GraphQL from the web app.
 */
export function persistAuthSession(accessToken: string): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(STORAGE_KEY, accessToken);
  } catch {
    /* ignore quota / private mode */
  }
  document.cookie = `${COOKIE_NAME}=${encodeURIComponent(accessToken)}; Path=/; Max-Age=${MAX_AGE_SEC}; SameSite=Lax${clientCookieSuffix()}`;
}

export function clearAuthSession(): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
  document.cookie = `${COOKIE_NAME}=; Path=/; Max-Age=0; SameSite=Lax${clientCookieSuffix()}`;
}

export function getStoredAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return sessionStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

/**
 * Token to send as Authorization Bearer. If the stored JWT is expired, we omit the header so
 * the API can fall back to the httpOnly access cookie (passport-jwt tries Bearer before cookie;
 * a stale Bearer blocks a valid cookie).
 */
export function getValidAccessTokenForAuthHeader(): string | null {
  const raw = getStoredAccessToken();
  if (!raw) return null;
  if (isJwtAccessExpired(raw)) {
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
    return null;
  }
  return raw;
}

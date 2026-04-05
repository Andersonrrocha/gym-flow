/**
 * Decode JWT payload (no signature verification) for client-side expiry checks only.
 * Safe for routing / omitting stale Authorization headers.
 */
export function decodeJwtPayload(token: string): { exp?: number } | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(
      base64.length + ((4 - (base64.length % 4)) % 4),
      "=",
    );
    const json = atob(padded);
    return JSON.parse(json) as { exp?: number };
  } catch {
    return null;
  }
}

/** True if token is missing, malformed, or exp is in the past (with skew). */
export function isJwtAccessExpired(
  token: string,
  skewMs = 10_000,
): boolean {
  const payload = decodeJwtPayload(token);
  if (payload?.exp == null || typeof payload.exp !== "number") {
    return true;
  }
  return Date.now() >= payload.exp * 1000 - skewMs;
}

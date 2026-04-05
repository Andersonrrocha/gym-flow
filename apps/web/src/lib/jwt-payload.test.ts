import { describe, expect, it } from "vitest";
import { isJwtAccessExpired } from "./jwt-payload";

function makeJwt(expSec: number): string {
  const header = btoa(JSON.stringify({ alg: "none", typ: "JWT" }));
  const payload = btoa(JSON.stringify({ exp: expSec }));
  return `${header}.${payload}.sig`;
}

describe("isJwtAccessExpired", () => {
  it("returns true for expired token", () => {
    const past = Math.floor(Date.now() / 1000) - 3600;
    expect(isJwtAccessExpired(makeJwt(past), 0)).toBe(true);
  });

  it("returns false for token far in the future", () => {
    const future = Math.floor(Date.now() / 1000) + 3600;
    expect(isJwtAccessExpired(makeJwt(future), 0)).toBe(false);
  });

  it("returns true for malformed token", () => {
    expect(isJwtAccessExpired("not-a-jwt")).toBe(true);
  });
});

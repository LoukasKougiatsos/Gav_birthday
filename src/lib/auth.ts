import { createHmac, timingSafeEqual } from "crypto";

/**
 * Whole-site password gate (see src/proxy.ts). The cookie never stores the
 * password itself - just an HMAC of a fixed string keyed by the password, so
 * the cookie can be verified without round-tripping the password and can't
 * be forged without knowing it.
 */
export const AUTH_COOKIE_NAME = "km_auth";

function computeToken(password: string): string {
  return createHmac("sha256", password).update("koritsaki-mou-site-auth").digest("hex");
}

export function isSiteProtected(): boolean {
  return Boolean(process.env.SITE_PASSWORD);
}

export function isCorrectPassword(candidate: string): boolean {
  const password = process.env.SITE_PASSWORD;
  if (!password) return false;
  return candidate === password;
}

export function authCookieValue(): string {
  const password = process.env.SITE_PASSWORD;
  if (!password) throw new Error("SITE_PASSWORD is not set");
  return computeToken(password);
}

export function isValidAuthCookie(token: string | undefined): boolean {
  const password = process.env.SITE_PASSWORD;
  if (!password || !token) return false;
  const expected = Buffer.from(computeToken(password));
  const actual = Buffer.from(token);
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

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

/**
 * In-memory per-IP rate limit for /api/login. A short numeric code (this
 * site's SITE_PASSWORD is meant to support a numeric PIN up to 8 digits)
 * has too few combinations to be brute-force-safe against an
 * unlimited endpoint - this raises that from "trivial" to "impractical"
 * without needing external storage. It's intentionally simple: state lives
 * in the serverless function's module scope, so it resets on a cold start
 * and isn't shared across regions/instances. That's a real gap against a
 * patient, distributed attacker, but proportionate for a private gift site
 * where the actual threat is an opportunistic scanner, not a targeted one.
 */
const loginAttempts = new Map<string, { count: number; firstAttemptAt: number }>();
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_MAX_ATTEMPTS = 5;

export function loginClientKey(request: Request): string {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
}

export function checkLoginRateLimit(key: string): { limited: boolean; retryAfterSec: number } {
  const now = Date.now();
  const entry = loginAttempts.get(key);
  if (!entry || now - entry.firstAttemptAt > RATE_LIMIT_WINDOW_MS) return { limited: false, retryAfterSec: 0 };
  if (entry.count < RATE_LIMIT_MAX_ATTEMPTS) return { limited: false, retryAfterSec: 0 };
  return { limited: true, retryAfterSec: Math.ceil((entry.firstAttemptAt + RATE_LIMIT_WINDOW_MS - now) / 1000) };
}

export function recordLoginFailure(key: string): void {
  const now = Date.now();
  const entry = loginAttempts.get(key);
  if (!entry || now - entry.firstAttemptAt > RATE_LIMIT_WINDOW_MS) {
    loginAttempts.set(key, { count: 1, firstAttemptAt: now });
  } else {
    entry.count += 1;
  }
}

export function clearLoginAttempts(key: string): void {
  loginAttempts.delete(key);
}

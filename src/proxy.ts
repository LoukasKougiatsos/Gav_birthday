import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { AUTH_COOKIE_NAME, isSiteProtected, isValidAuthCookie } from "@/lib/auth";

/**
 * Whole-site password gate. If SITE_PASSWORD isn't set (see .env.local),
 * the site is simply unprotected - matches the rest of the site's "needs
 * setup" pattern (src/config/site.ts) rather than locking everyone out
 * during local development.
 */
export function proxy(request: NextRequest) {
  if (!isSiteProtected()) return NextResponse.next();

  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  if (isValidAuthCookie(token)) return NextResponse.next();

  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("next", request.nextUrl.pathname + request.nextUrl.search);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  // api/push/daily-reminder is excluded too: Vercel Cron calls it with an
  // Authorization: Bearer $CRON_SECRET header, not a browser session, so it
  // can never carry km_auth - that route checks CRON_SECRET itself instead.
  matcher: ["/((?!api/login|api/push/daily-reminder|login|_next/static|_next/image|favicon.ico).*)"],
};

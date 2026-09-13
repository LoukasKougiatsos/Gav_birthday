import { NextResponse } from "next/server";
import {
  AUTH_COOKIE_NAME,
  authCookieValue,
  checkLoginRateLimit,
  clearLoginAttempts,
  isCorrectPassword,
  isSiteProtected,
  loginClientKey,
  recordLoginFailure,
} from "@/lib/auth";

export async function POST(request: Request) {
  if (!isSiteProtected()) {
    return NextResponse.json({ error: "Site password isn't configured." }, { status: 400 });
  }

  const key = loginClientKey(request);
  const rateLimit = checkLoginRateLimit(key);
  if (rateLimit.limited) {
    return NextResponse.json(
      { error: "Πολλές προσπάθειες. Δοκίμασε ξανά σε λίγα λεπτά." },
      { status: 429, headers: { "Retry-After": String(rateLimit.retryAfterSec) } }
    );
  }

  const { password } = await request.json().catch(() => ({ password: "" }));

  if (typeof password !== "string" || !isCorrectPassword(password)) {
    recordLoginFailure(key);
    return NextResponse.json({ error: "Λάθος κωδικός." }, { status: 401 });
  }
  clearLoginAttempts(key);

  const response = NextResponse.json({ ok: true });
  response.cookies.set(AUTH_COOKIE_NAME, authCookieValue(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
  return response;
}

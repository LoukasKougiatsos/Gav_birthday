import { NextRequest, NextResponse } from "next/server";
import { addSubscription, removeSubscription, type PushRole } from "@/lib/push";

/** Already sits behind the site password - src/proxy.ts's matcher only
 * excludes /api/login, /login, and static assets. */

function isValidRole(role: unknown): role is PushRole {
  return role === "reminder" || role === "activity";
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (!body || !isValidRole(body.role) || !body.subscription) {
    return NextResponse.json({ error: "Invalid body." }, { status: 400 });
  }
  try {
    await addSubscription(body.role, body.subscription);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Subscribe failed." }, { status: 502 });
  }
}

export async function DELETE(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (!body || !isValidRole(body.role) || !body.subscription) {
    return NextResponse.json({ error: "Invalid body." }, { status: 400 });
  }
  try {
    await removeSubscription(body.role, body.subscription);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Unsubscribe failed." }, { status: 502 });
  }
}

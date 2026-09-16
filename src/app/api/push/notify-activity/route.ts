import { NextRequest, NextResponse } from "next/server";
import { sendToRole } from "@/lib/push";

/** Fire-and-forget target for "she just did something" pings (see
 * ExerciseCheckIn.tsx) - the caller already succeeded at the real save
 * before calling this, so a failure here is a missed notification, not a
 * broken feature. */
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const message = typeof body.message === "string" && body.message ? body.message : "Έκανε κάτι στο Κοριτσάκι.";
  const url = typeof body.url === "string" ? body.url : "/";

  try {
    await sendToRole("activity", { title: "Κοριτσάκι", body: message, url });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Notify failed." }, { status: 502 });
  }
}

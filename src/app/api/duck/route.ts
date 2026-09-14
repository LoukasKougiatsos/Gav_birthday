import { NextResponse } from "next/server";

/**
 * random-d.uk is keyless but sends no CORS headers, so a direct browser
 * fetch always fails - this thin proxy (same pattern as /api/dachshund)
 * makes the request server-side instead, where CORS doesn't apply.
 */
export async function GET() {
  try {
    const res = await fetch("https://random-d.uk/api/v2/random", { cache: "no-store" });
    if (!res.ok) throw new Error(`random-d.uk request failed: ${res.status}`);
    const data = await res.json();
    if (!data?.url) throw new Error("no duck image returned");
    return NextResponse.json({ imageUrl: data.url });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "unknown error" }, { status: 502 });
  }
}

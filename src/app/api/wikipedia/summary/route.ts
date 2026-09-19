import { NextRequest, NextResponse } from "next/server";

/**
 * Fetched once, right when she picks a search result in PlantsView.tsx -
 * gives the real photo + a short plain-text description to save onto the
 * plant, which is what src/app/api/wikipedia/search's picker-list results
 * can't provide (only a 60px thumbnail and a one-line description there).
 */
const USER_AGENT = "koritsakimou.com/1.0 (private gift site; plant lookup)";

export async function GET(request: NextRequest) {
  const key = request.nextUrl.searchParams.get("key");
  if (!key) {
    return NextResponse.json({ error: "Missing key" }, { status: 400 });
  }

  try {
    const res = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(key)}`, {
      headers: { "User-Agent": USER_AGENT },
    });
    if (!res.ok) {
      return NextResponse.json({ imageUrl: null, about: null });
    }
    const data = await res.json();
    const about = typeof data.extract === "string" && data.extract.trim().length > 0 ? data.extract.trim() : null;
    const imageUrl = typeof data.thumbnail?.source === "string" ? data.thumbnail.source : null;
    return NextResponse.json({ imageUrl, about });
  } catch {
    return NextResponse.json({ imageUrl: null, about: null }, { status: 502 });
  }
}

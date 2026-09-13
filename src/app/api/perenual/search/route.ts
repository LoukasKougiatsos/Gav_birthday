import { NextRequest, NextResponse } from "next/server";

/**
 * Perenual requires a key, so species search stays server-side. Its free
 * tier returns real name/image data for most species but null (or, for a
 * few marketing-showcase species, an explicit "upgrade" placeholder string)
 * for cycle/watering/sunlight - see src/lib/plants.ts for how the rest of
 * the Plants feature works around that.
 */
export async function GET(request: NextRequest) {
  const apiKey = process.env.PERENUAL_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "PERENUAL_API_KEY not set" }, { status: 501 });
  }

  const q = request.nextUrl.searchParams.get("q");
  if (!q || q.trim().length === 0) {
    return NextResponse.json({ error: "Missing q" }, { status: 400 });
  }

  try {
    const res = await fetch(
      `https://perenual.com/api/species-list?key=${apiKey}&q=${encodeURIComponent(q)}`,
      { next: { revalidate: 21600 } }
    );
    if (!res.ok) {
      return NextResponse.json({ error: `Perenual request failed: ${res.status}` }, { status: 502 });
    }
    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Perenual request failed" }, { status: 502 });
  }
}

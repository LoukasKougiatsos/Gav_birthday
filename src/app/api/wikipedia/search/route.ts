import { NextRequest, NextResponse } from "next/server";

/**
 * Backs the "Όνομα φυτού" autocomplete in PlantsView.tsx. No key needed -
 * replaced Perenual here (see src/lib/plants.ts) because its free tier
 * turned out not to give real images either, just a placeholder graphic
 * disguised as a real URL. Wikipedia's REST search returns a real thumbnail
 * + one-line description per result, which is enough for a picker list; the
 * full-size photo + description text come from a second call
 * (/api/wikipedia/summary) once she actually picks one.
 */
const USER_AGENT = "koritsakimou.com/1.0 (private gift site; plant lookup)";

interface WikiSearchPage {
  key: string;
  title: string;
  description?: string;
  thumbnail?: { url: string } | null;
}

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q")?.trim();
  if (!q || q.length < 2) {
    return NextResponse.json({ results: [] });
  }

  const url = new URL("https://en.wikipedia.org/w/rest.php/v1/search/page");
  url.searchParams.set("q", q);
  url.searchParams.set("limit", "6");

  try {
    const res = await fetch(url.toString(), { headers: { "User-Agent": USER_AGENT } });
    if (!res.ok) {
      return NextResponse.json({ results: [] }, { status: 502 });
    }
    const data = await res.json();
    const pages: WikiSearchPage[] = data.pages ?? [];

    const results = pages.map((p) => ({
      key: p.key,
      title: p.title,
      description: p.description ?? null,
      thumbnailUrl: p.thumbnail ? `https:${p.thumbnail.url}` : null,
    }));
    return NextResponse.json({ results });
  } catch {
    return NextResponse.json({ results: [] }, { status: 502 });
  }
}

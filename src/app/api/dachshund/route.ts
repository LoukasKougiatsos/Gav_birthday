import { NextResponse } from "next/server";

/**
 * The Dog API requires a key (unlike most of this site's feeds), so this
 * stays server-side. Looks up the Dachshund breed id once (cached a day -
 * breed data never changes) then asks for a fresh photo of it.
 */
const API_BASE = "https://api.thedogapi.com/v1";

export async function GET() {
  const apiKey = process.env.THE_DOG_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "THE_DOG_API_KEY not set" }, { status: 501 });
  }

  try {
    const breedRes = await fetch(`${API_BASE}/breeds/search?q=dachshund`, {
      headers: { "x-api-key": apiKey },
      next: { revalidate: 86400 },
    });
    if (!breedRes.ok) throw new Error(`breed lookup failed: ${breedRes.status}`);
    const breeds = await breedRes.json();
    const breedId = breeds?.[0]?.id;
    if (!breedId) throw new Error("Dachshund breed id not found");

    const imageRes = await fetch(`${API_BASE}/images/search?breed_ids=${breedId}&limit=1`, {
      headers: { "x-api-key": apiKey },
      cache: "no-store",
    });
    if (!imageRes.ok) throw new Error(`image search failed: ${imageRes.status}`);
    const images = await imageRes.json();
    const imageUrl = images?.[0]?.url;
    if (!imageUrl) throw new Error("no dachshund image returned");

    return NextResponse.json({ imageUrl });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "unknown error" }, { status: 502 });
  }
}

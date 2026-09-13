/**
 * Best-effort photo lookup for named places (Discover cards) via Wikipedia's
 * REST summary API - keyless, CORS-friendly, fetched straight from the
 * browser. Tries the Greek Wikipedia first (better hit rate for small local
 * places), falling back to English.
 */
async function fetchSummaryThumbnail(lang: "el" | "en", title: string): Promise<string | null> {
  try {
    const res = await fetch(`https://${lang}.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`);
    if (!res.ok) return null;
    const data = await res.json();
    return data?.thumbnail?.source ?? null;
  } catch {
    return null;
  }
}

export async function fetchPlaceThumbnail(nameEl: string, nameEn: string): Promise<string | null> {
  return (await fetchSummaryThumbnail("el", nameEl)) ?? (await fetchSummaryThumbnail("en", nameEn));
}

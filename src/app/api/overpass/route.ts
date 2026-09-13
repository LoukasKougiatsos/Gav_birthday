import { NextRequest, NextResponse } from "next/server";

/**
 * Thin caching proxy for the Overpass API. Overpass is keyless, but it's
 * public infrastructure with tight rate limits and slow/flaky individual
 * instances, so Trails and Discover both go through this route (server-side
 * fetch caching, 6h) instead of hitting it straight from the browser.
 *
 * Tries each mirror in order and falls back to the next on failure/timeout -
 * during development, overpass-api.de (the "main" instance) returned a bare
 * Apache 406 for every request regardless of query shape (an environment-
 * level block, not a query problem), and overpass.kumi.systems started
 * timing out after sustained testing. Neither is reliable enough alone.
 * Full mirror list: wiki.openstreetmap.org/wiki/Overpass_API#Public_Overpass_API_instances.
 */
const OVERPASS_MIRRORS = [
  "https://overpass.kumi.systems/api/interpreter",
  "https://overpass-api.de/api/interpreter",
  "https://overpass.private.coffee/api/interpreter",
];

const CACHE_SECONDS = 21600; // 6 hours, matching the project's "feeds" cadence
const PER_MIRROR_TIMEOUT_MS = 20000;

async function tryMirror(endpoint: string, query: string): Promise<Response | null> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), PER_MIRROR_TIMEOUT_MS);
  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "text/plain" },
      body: query,
      next: { revalidate: CACHE_SECONDS },
      signal: controller.signal,
    });
    return res.ok ? res : null;
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

export async function POST(request: NextRequest) {
  const { query } = await request.json();

  if (typeof query !== "string" || query.trim().length === 0) {
    return NextResponse.json({ error: "Missing Overpass query" }, { status: 400 });
  }

  for (const endpoint of OVERPASS_MIRRORS) {
    const res = await tryMirror(endpoint, query);
    if (res) {
      const data = await res.json();
      return NextResponse.json(data);
    }
  }

  return NextResponse.json({ error: "All Overpass mirrors failed" }, { status: 502 });
}

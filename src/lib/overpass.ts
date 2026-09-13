/**
 * Client-side helper for querying OpenStreetMap data through our own
 * /api/overpass cache proxy (see that route for why - Overpass is keyless
 * but rate-limited, so we don't hit it straight from the browser). Shared
 * by Trails and Discover.
 */

export interface OverpassElement {
  type: "node" | "way" | "relation";
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  geometry?: { lat: number; lon: number }[];
  tags?: Record<string, string>;
  /** Present on relation elements - the ways/nodes that make it up. */
  members?: { type: "node" | "way" | "relation"; ref: number; role: string }[];
}

export async function runOverpassQuery(query: string): Promise<OverpassElement[]> {
  const res = await fetch("/api/overpass", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query }),
  });
  if (!res.ok) {
    throw new Error(`Overpass query failed: ${res.status}`);
  }
  const data = await res.json();
  return data.elements ?? [];
}

/** A rough lat/lon bounding box string ("south,west,north,east", the order
 * Overpass QL wants) covering `radiusKm` around a center point. */
export function bboxFromRadius(lat: number, lon: number, radiusKm: number): string {
  const latDelta = radiusKm / 111;
  const lonDelta = radiusKm / (111 * Math.cos((lat * Math.PI) / 180));
  const south = lat - latDelta;
  const north = lat + latDelta;
  const west = lon - lonDelta;
  const east = lon + lonDelta;
  return `${south},${west},${north},${east}`;
}

export interface LatLon {
  lat: number;
  lon: number;
}

/** Great-circle distance in kilometers. */
export function haversineKm(a: LatLon, b: LatLon): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLon = ((b.lon - a.lon) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

/** Total length in kilometers of a way's geometry (sum of segment lengths). */
export function pathLengthKm(points: LatLon[]): number {
  let total = 0;
  for (let i = 1; i < points.length; i++) {
    total += haversineKm(points[i - 1], points[i]);
  }
  return total;
}

export type ProximityBand = "walkable" | "short_drive" | "day_trip";

/** Categorizes a distance from home into the site's three radius bands. */
export function proximityBand(distanceKm: number): ProximityBand {
  if (distanceKm < 3) return "walkable";
  if (distanceKm < 25) return "short_drive";
  return "day_trip";
}

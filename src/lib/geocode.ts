import type { PlaceCategory } from "@/lib/discover";

/**
 * Free, keyless place search for the Discover "add a place" form - Photon
 * (komoot's OSM-based geocoder, purpose-built for autocomplete-while-typing
 * unlike Nominatim's stricter usage policy), same data family as the OSM
 * map tiles already used on this page. No API key/billing account, matching
 * this project's "keyless APIs fetched directly from the browser" rule
 * (see src/lib/weather.ts).
 */

export interface PlaceSearchResult {
  id: string;
  name: string;
  lat: number;
  lon: number;
  address: string;
  categoryGuess: PlaceCategory;
}

/** OSM's `osm_value` tag vocabulary is much larger than this app's category
 * list - only mapping the values likely to show up for food/drink and
 * outdoor spots; anything else falls back to "other". */
const OSM_VALUE_TO_CATEGORY: Record<string, PlaceCategory> = {
  restaurant: "restaurant",
  taverna: "taverna",
  fast_food: "street_food",
  bar: "bar",
  pub: "bar",
  cafe: "cafe",
  bakery: "bakery",
  viewpoint: "viewpoint",
  spring: "spring",
  chapel: "chapel",
  wayside_shrine: "chapel",
  ruins: "ruin",
  archaeological_site: "ruin",
  cave_entrance: "cave",
  forest: "grove",
  wood: "grove",
  garden: "community_garden",
  allotments: "community_garden",
  quarry: "disused_quarry",
  park: "small_park",
  wetland: "wetland_reserve",
  nature_reserve: "wetland_reserve",
};

function guessCategory(osmValue: string | undefined): PlaceCategory {
  if (!osmValue) return "other";
  return OSM_VALUE_TO_CATEGORY[osmValue] ?? "other";
}

/** Photon's `properties` don't include a single ready-made address line -
 * this assembles one from whatever parts are present. */
function formatAddress(props: Record<string, unknown>): string {
  const parts = [props.street, props.city ?? props.town ?? props.village, props.state, props.country].filter(
    (p): p is string => typeof p === "string" && p.length > 0
  );
  return parts.join(", ");
}

export async function searchPlaces(query: string, bias?: { lat: number; lon: number }): Promise<PlaceSearchResult[]> {
  const trimmed = query.trim();
  if (trimmed.length < 2) return [];

  const url = new URL("https://photon.komoot.io/api/");
  url.searchParams.set("q", trimmed);
  url.searchParams.set("limit", "6");
  url.searchParams.set("lang", "en");
  if (bias) {
    url.searchParams.set("lat", String(bias.lat));
    url.searchParams.set("lon", String(bias.lon));
  }

  try {
    const res = await fetch(url.toString());
    if (!res.ok) return [];
    const data = await res.json();
    const features: Array<{
      geometry: { coordinates: [number, number] };
      properties: Record<string, unknown> & { osm_id?: number; osm_type?: string; name?: string; osm_value?: string };
    }> = data.features ?? [];

    return features
      .filter((f) => typeof f.properties.name === "string" && f.properties.name.length > 0)
      .map((f) => ({
        id: `${f.properties.osm_type ?? "osm"}-${f.properties.osm_id ?? `${f.geometry.coordinates[0]}-${f.geometry.coordinates[1]}`}`,
        name: f.properties.name as string,
        lat: f.geometry.coordinates[1],
        lon: f.geometry.coordinates[0],
        address: formatAddress(f.properties),
        categoryGuess: guessCategory(f.properties.osm_value),
      }));
  } catch {
    return [];
  }
}

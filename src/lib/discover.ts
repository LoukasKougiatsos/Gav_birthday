import foodDrinkData from "@/content/discoverFoodDrink.json";
import { weeklySeed, seededPick } from "@/lib/seed";
import { isVisited } from "@/lib/visitedPlaces";
import { getItem, setItem } from "@/lib/storage";
import { SITE_CONFIG } from "@/config/site";

export type ProximityBand = "walkable" | "short_drive" | "day_trip";

export type PlaceCategory =
  | "viewpoint"
  | "spring"
  | "chapel"
  | "ruin"
  | "cave"
  | "grove"
  | "community_garden"
  | "disused_quarry"
  | "old_railway"
  | "small_park"
  | "wetland_reserve"
  | "taverna"
  | "street_food"
  | "bar"
  | "cafe"
  | "bakery"
  | "other";

export interface DiscoverPlace {
  id: string;
  name: string;
  nameEl: string;
  category: PlaceCategory;
  lat: number;
  lon: number;
  radius: ProximityBand;
  outdoor: boolean;
  description: string;
  source?: string;
  neighborhood?: string;
  /** Present on places she adds herself via the "add a place" form. */
  custom?: boolean;
}

interface CuratedFile {
  disclaimer: string;
  places: Array<Omit<DiscoverPlace, "outdoor"> & { outdoor?: boolean }>;
}

const foodDrink = foodDrinkData as CuratedFile;

const CURATED_PLACES: DiscoverPlace[] = foodDrink.places.map((p) => ({
  ...p,
  outdoor: p.outdoor ?? false,
})) as DiscoverPlace[];

const CUSTOM_PLACES_KEY = "discover:customPlaces";

export function loadCustomPlaces(): DiscoverPlace[] {
  return getItem<DiscoverPlace[]>(CUSTOM_PLACES_KEY, []);
}

function saveCustomPlaces(places: DiscoverPlace[]): void {
  setItem(CUSTOM_PLACES_KEY, places);
}

/** Straight-line distance, km - good enough to classify a proximity band,
 * not turn-by-turn accurate. */
function distanceKm(a: { lat: number; lon: number }, b: { lat: number; lon: number }): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lon - a.lon);
  const sinLat = Math.sin(dLat / 2);
  const sinLon = Math.sin(dLon / 2);
  const h = sinLat * sinLat + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * sinLon * sinLon;
  return 2 * R * Math.asin(Math.sqrt(h));
}

/** Auto-classifies a proximity band from home, so adding a place on the
 * spot doesn't require self-categorizing "walkable vs short drive." Falls
 * back to short_drive if home coordinates aren't configured. */
export function proximityBandFor(lat: number, lon: number): ProximityBand {
  if (!SITE_CONFIG.homeCoordinates) return "short_drive";
  const km = distanceKm(SITE_CONFIG.homeCoordinates, { lat, lon });
  if (km <= 3) return "walkable";
  if (km <= 40) return "short_drive";
  return "day_trip";
}

function generatePlaceId(name: string): string {
  const slug = name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  return `place-${slug || "unnamed"}-${Date.now()}`;
}

/** Adds a place she's actually been to, auto-classifying its proximity band
 * from home coordinates. `custom: true` so it's identifiable if ever needed,
 * though it's otherwise treated exactly like a curated place. */
export function addCustomPlace(input: {
  name: string;
  category: PlaceCategory;
  lat: number;
  lon: number;
  outdoor: boolean;
  description?: string;
}): DiscoverPlace[] {
  const place: DiscoverPlace = {
    id: generatePlaceId(input.name),
    name: input.name.trim(),
    nameEl: input.name.trim(),
    category: input.category,
    lat: input.lat,
    lon: input.lon,
    radius: proximityBandFor(input.lat, input.lon),
    outdoor: input.outdoor,
    description: input.description?.trim() || "",
    custom: true,
  };
  const next = [...loadCustomPlaces(), place];
  saveCustomPlaces(next);
  return next;
}

/** The full pool Discover picks from each week: the curated food-and-drink
 * spots plus anything added via the "add a place" form. Has to be a
 * function, not a module-level constant, since the custom half can only be
 * read client-side (see lib/clinic.ts's allCases() for the same shape). */
export function allPlaces(): DiscoverPlace[] {
  return [...CURATED_PLACES, ...loadCustomPlaces()];
}

const CATEGORY_EL: Record<PlaceCategory, string> = {
  viewpoint: "Θέα",
  spring: "Πηγή",
  chapel: "Εξωκλήσι",
  ruin: "Ερείπια",
  cave: "Σπήλαιο",
  grove: "Άλσος",
  community_garden: "Κοινοτικός κήπος",
  disused_quarry: "Παλιό λατομείο",
  old_railway: "Παλιός σιδηρόδρομος",
  small_park: "Πάρκο",
  wetland_reserve: "Υγρότοπος",
  taverna: "Ταβέρνα",
  street_food: "Σουβλάκι & φαγητό στο χέρι",
  bar: "Μπαρ",
  cafe: "Καφέ",
  bakery: "Φούρνος",
  other: "Άλλο",
};

export function categoryLabel(category: PlaceCategory): string {
  return CATEGORY_EL[category] ?? category;
}

/** For the "add a place" form's category picker. */
export const PLACE_CATEGORIES = Object.keys(CATEGORY_EL) as PlaceCategory[];

const RADIUS_EL: Record<ProximityBand, string> = {
  walkable: "Με τα πόδια",
  short_drive: "Μικρή διαδρομή",
  day_trip: "Ημερήσια εκδρομή",
};

export function radiusLabel(band: ProximityBand): string {
  return RADIUS_EL[band];
}

/** This week's new place - deterministic via the weekly seed, excluding
 * anything already marked visited. Falls back to the full pool if
 * everything's somehow been visited, rather than showing nothing. */
export function placeOfTheWeek(date: Date = new Date()): DiscoverPlace {
  const all = allPlaces();
  const unvisited = all.filter((p) => !isVisited(p.id));
  const pool = unvisited.length > 0 ? unvisited : all;
  return seededPick(pool, weeklySeed(date));
}

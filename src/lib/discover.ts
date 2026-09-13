import foodDrinkData from "@/content/discoverFoodDrink.json";
import { weeklySeed, seededPick } from "@/lib/seed";
import { isVisited } from "@/lib/visitedPlaces";

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
}

interface CuratedFile {
  disclaimer: string;
  places: Array<Omit<DiscoverPlace, "outdoor"> & { outdoor?: boolean }>;
}

const foodDrink = foodDrinkData as CuratedFile;

/** The full pool Discover picks from each week: food-and-drink spots only -
 * the landmark/nature list (`discoverPlaces.json`) is kept in the repo as
 * real researched content but is no longer part of the weekly rotation, per
 * the user's call to make Discover about food/drink spots, not landmarks. */
export const ALL_PLACES: DiscoverPlace[] = foodDrink.places.map((p) => ({
  ...p,
  outdoor: p.outdoor ?? false,
})) as DiscoverPlace[];

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
  const unvisited = ALL_PLACES.filter((p) => !isVisited(p.id));
  const pool = unvisited.length > 0 ? unvisited : ALL_PLACES;
  return seededPick(pool, weeklySeed(date));
}

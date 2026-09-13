import { getItem, setItem } from "@/lib/storage";
import { dailySeed } from "@/lib/seed";

/**
 * Shared "been there" store. Discover's checkmark writes here; the Us
 * section's map of places (Phase 5) reads from the same store - one list of
 * everywhere visited together, not two separate trackers.
 */
export interface VisitedPlace {
  id: string;
  name: string;
  lat: number;
  lon: number;
  visitedDate: string; // local YYYY-MM-DD when marked
  kind: "discover" | "trail";
}

const VISITED_PLACES_KEY = "visitedPlaces";

export function loadVisitedPlaces(): VisitedPlace[] {
  return getItem<VisitedPlace[]>(VISITED_PLACES_KEY, []);
}

export function isVisited(id: string): boolean {
  return loadVisitedPlaces().some((p) => p.id === id);
}

export function markVisited(place: Omit<VisitedPlace, "visitedDate">): VisitedPlace[] {
  const existing = loadVisitedPlaces();
  if (existing.some((p) => p.id === place.id)) return existing;
  const next = [...existing, { ...place, visitedDate: dailySeed() }];
  setItem(VISITED_PLACES_KEY, next);
  return next;
}

export function unmarkVisited(id: string): VisitedPlace[] {
  const next = loadVisitedPlaces().filter((p) => p.id !== id);
  setItem(VISITED_PLACES_KEY, next);
  return next;
}

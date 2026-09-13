import { runOverpassQuery, pathLengthKm, type OverpassElement, type LatLon } from "@/lib/overpass";
import { weeklySeed, seededPickMany } from "@/lib/seed";
import { getItem, setItem } from "@/lib/storage";

export type TrailDifficulty = "easy" | "medium" | "hard";

export interface Trail {
  id: string;
  name: string;
  center: LatLon;
  segments: LatLon[][];
  lengthKm: number;
  difficulty: TrailDifficulty;
  photoUrl: string | null;
}

/** OSM sometimes tags a way/relation with a direct `image` URL or a
 * `wikimedia_commons` file reference ("File:Name.jpg") - Commons' own
 * Special:FilePath redirects that straight to the actual image, so it works
 * as a plain <img src> with no extra API call needed. */
function photoFromTags(tags: Record<string, string> | undefined): string | null {
  if (!tags) return null;
  if (tags.image) return tags.image;
  if (tags.wikimedia_commons) {
    const filename = tags.wikimedia_commons.replace(/^File:/, "");
    return `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(filename)}`;
  }
  return null;
}

/** OSM's Attica hiking-route tagging is patchy - some relations carry a
 * useful `distance` tag directly, but most don't, so length usually comes
 * from summing member-way geometry instead. */
function difficultyFromLength(lengthKm: number): TrailDifficulty {
  if (lengthKm < 5) return "easy";
  if (lengthKm < 10) return "medium";
  return "hard";
}

function parseDistanceTag(tags: Record<string, string> | undefined): number | null {
  const raw = tags?.distance;
  if (!raw) return null;
  const match = raw.match(/[\d.]+/);
  return match ? parseFloat(match[0]) : null;
}

const HIKING_RELATIONS_QUERY = (bbox: string) => `
[out:json][timeout:30];
rel["route"="hiking"](${bbox})->.trails;
.trails out center tags;
way(r.trails);
out geom;
`;

/** Attica's hiking-relation coverage in OSM is inconsistent - if the bbox
 * yields nothing, fall back to individually named paths/tracks as
 * standalone mini-trails rather than showing an empty page. */
const NAMED_PATHS_QUERY = (bbox: string) => `
[out:json][timeout:30];
way["highway"~"^(path|track)$"]["name"](${bbox});
out geom;
`;

function waysToTrails(elements: OverpassElement[]): Trail[] {
  return elements
    .filter((el) => el.type === "way" && el.tags?.name && el.geometry && el.geometry.length > 1)
    .map((way) => {
      const segment = way.geometry!.map((p) => ({ lat: p.lat, lon: p.lon }));
      const lengthKm = pathLengthKm(segment);
      return {
        id: `way-${way.id}`,
        name: way.tags!.name,
        center: segment[Math.floor(segment.length / 2)],
        segments: [segment],
        lengthKm,
        difficulty: difficultyFromLength(lengthKm),
        photoUrl: photoFromTags(way.tags),
      };
    });
}

function relationsToTrails(elements: OverpassElement[]): Trail[] {
  const relations = elements.filter((el) => el.type === "relation" && el.tags?.name);
  const waysById = new Map(elements.filter((el) => el.type === "way").map((w) => [w.id, w]));

  // Overpass's JSON output doesn't nest members back onto the relation
  // element with geometry attached, so member ways are matched up via the
  // relation's own `members` list (present on relation elements even
  // without `out geom` on the relation itself).
  return relations
    .map((rel) => {
      const memberIds: number[] = rel.members?.filter((m) => m.type === "way").map((m) => m.ref) ?? [];
      const segments = memberIds
        .map((id) => waysById.get(id))
        .filter((w): w is OverpassElement => Boolean(w?.geometry?.length))
        .map((w) => w.geometry!.map((p) => ({ lat: p.lat, lon: p.lon })));

      if (segments.length === 0) return null;

      const taggedDistance = parseDistanceTag(rel.tags);
      const lengthKm = taggedDistance ?? segments.reduce((sum, seg) => sum + pathLengthKm(seg), 0);
      const center = rel.center ?? segments[0][Math.floor(segments[0].length / 2)];

      return {
        id: `rel-${rel.id}`,
        name: rel.tags!.name,
        center,
        segments,
        lengthKm,
        difficulty: difficultyFromLength(lengthKm),
        photoUrl: photoFromTags(rel.tags),
      };
    })
    .filter((t): t is Trail => t !== null);
}

export async function fetchAtticaTrails(bbox: string): Promise<Trail[]> {
  const relationElements = await runOverpassQuery(HIKING_RELATIONS_QUERY(bbox));
  const fromRelations = relationsToTrails(relationElements);
  if (fromRelations.length > 0) return fromRelations;

  // Fallback: sparse relation tagging is common outside major trail
  // networks, so named paths/tracks stand in as individual mini-trails.
  const pathElements = await runOverpassQuery(NAMED_PATHS_QUERY(bbox));
  return waysToTrails(pathElements);
}

const DONE_TRAILS_KEY = "trails:done";

export function loadDoneTrailIds(): string[] {
  return getItem<string[]>(DONE_TRAILS_KEY, []);
}

export function markTrailDone(id: string): string[] {
  const existing = loadDoneTrailIds();
  if (existing.includes(id)) return existing;
  const next = [...existing, id];
  setItem(DONE_TRAILS_KEY, next);
  return next;
}

export function unmarkTrailDone(id: string): string[] {
  const next = loadDoneTrailIds().filter((t) => t !== id);
  setItem(DONE_TRAILS_KEY, next);
  return next;
}

/** Three featured trails for the week, seeded so they're stable Mon-Sun,
 * excluding anything already marked done. */
export function featuredTrailsForWeek(trails: Trail[], doneIds: string[], date: Date = new Date()): Trail[] {
  const eligible = trails.filter((t) => !doneIds.includes(t.id));
  const pool = eligible.length > 0 ? eligible : trails;
  return seededPickMany(pool, weeklySeed(date), Math.min(3, pool.length));
}

/**
 * Deterministic date seeding, shared by every feature that needs "the same
 * pick all day" (Clinic's daily animal, Home's daily quote) or "the same
 * picks all week, new on Monday" (Discover's place of the week, Trails'
 * featured three, the weekly meal plan, the weekly dachshund's day).
 *
 * Callers are responsible for filtering out already-done/visited items
 * *before* calling these - the pool passed in should already be the
 * eligible set.
 */

/** Local calendar date as YYYY-MM-DD. Never UTC - a day changes at her
 * local midnight, not at UTC midnight, and refreshing must not reroll. */
export function dailySeed(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** ISO week number (Monday-start, week 1 contains the year's first Thursday),
 * as `${isoYear}-W${week}`. Changes every Monday, stable the rest of the week. */
export function weeklySeed(date: Date = new Date()): string {
  // Work in local-date terms but reuse the standard ISO week algorithm,
  // which is defined via a UTC-anchored Thursday trick.
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const dayNum = (d.getDay() + 6) % 7; // Mon=0 .. Sun=6
  d.setDate(d.getDate() - dayNum + 3); // nearest Thursday
  const isoYear = d.getFullYear();
  const jan4 = new Date(isoYear, 0, 4);
  const jan4DayNum = (jan4.getDay() + 6) % 7;
  const week1Monday = new Date(jan4);
  week1Monday.setDate(jan4.getDate() - jan4DayNum);
  const week = Math.round((d.getTime() - week1Monday.getTime()) / (7 * 86400000)) + 1;
  return `${isoYear}-W${String(week).padStart(2, "0")}`;
}

/** FNV-1a string hash -> 32-bit unsigned int. */
function hashString(str: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

/** mulberry32 PRNG - small, fast, deterministic for a given uint32 seed. */
function mulberry32(seed: number): () => number {
  let a = seed;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Deterministically pick one item from `items`, keyed by `seed` (typically
 * a `dailySeed()` or `weeklySeed()` string). Same seed + same list -> same pick. */
export function seededPick<T>(items: readonly T[], seed: string): T {
  if (items.length === 0) {
    throw new Error("seededPick: items is empty");
  }
  const rng = mulberry32(hashString(seed));
  const index = Math.floor(rng() * items.length);
  return items[Math.min(index, items.length - 1)];
}

/** Deterministically shuffle `items`, keyed by `seed`. Useful for picking
 * several items at once (e.g. three featured trails, a week of meals). */
export function seededShuffle<T>(items: readonly T[], seed: string): T[] {
  const rng = mulberry32(hashString(seed));
  const result = items.slice();
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/** Deterministically pick `count` items from `items`, keyed by `seed`. */
export function seededPickMany<T>(items: readonly T[], seed: string, count: number): T[] {
  return seededShuffle(items, seed).slice(0, Math.max(0, count));
}

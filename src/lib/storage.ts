/**
 * Thin, SSR-safe localStorage wrapper. Everything the brief keeps client-side
 * only (game progress, visited places, planner edits, plant data, journal
 * entries, mood check-ins, card dismissals) should go through this, namespaced
 * under one prefix so the site's keys never collide with anything else.
 */

const PREFIX = "km:"; // koritsaki_mou

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

export function getItem<T>(key: string, fallback: T): T {
  if (!isBrowser()) return fallback;
  try {
    const raw = window.localStorage.getItem(PREFIX + key);
    if (raw === null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function setItem<T>(key: string, value: T): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch {
    // localStorage can throw (quota, private mode) - failing silently is
    // preferable to breaking a feature that's a nice-to-have by nature.
  }
}

export function removeItem(key: string): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.removeItem(PREFIX + key);
  } catch {
    // see setItem
  }
}

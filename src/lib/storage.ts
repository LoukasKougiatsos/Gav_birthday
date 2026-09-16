/**
 * Thin, SSR-safe localStorage wrapper. Everything the brief keeps client-side
 * only (game progress, visited places, planner edits, plant data, journal
 * entries, mood check-ins, card dismissals) should go through this, namespaced
 * under one prefix so the site's keys never collide with anything else.
 *
 * Also mirrors every write to /api/sync in the background (see that route
 * and src/components/sync/SyncGate.tsx) so her data follows her across
 * phones/browsers instead of living in one device's localStorage. That sync
 * is purely additive: getItem/setItem's signatures and local behavior are
 * unchanged, so none of this module's ~20 call sites needed to change.
 */

const PREFIX = "km:"; // koritsaki_mou

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

/** Fire-and-forget - a failed push just means this key stays local-only
 * until the next successful write or hydration, same "nice-to-have degrades
 * gracefully" spirit as WeatherCard/the dachshund photo. */
function pushToServer(key: string, value: unknown): void {
  if (!isBrowser()) return;
  fetch("/api/sync", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ key, value }),
  }).catch(() => {});
}

function writeLocalOnly<T>(key: string, value: T): void {
  window.localStorage.setItem(PREFIX + key, JSON.stringify(value));
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
    writeLocalOnly(key, value);
  } catch {
    // localStorage can throw (quota, private mode) - failing silently is
    // preferable to breaking a feature that's a nice-to-have by nature.
  }
  pushToServer(key, value);
}

export function removeItem(key: string): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.removeItem(PREFIX + key);
  } catch {
    // see setItem
  }
}

const SEEDED_FLAG = "sync:seeded";

/** Runs once per fresh browser (see SyncGate, which awaits this before the
 * rest of the app reads localStorage): pulls every previously-synced key
 * down, and - the very first time this browser has ever hydrated - also
 * pushes up whatever real history already exists locally (her current
 * phone's pre-existing progress), so it's mirrored server-side immediately
 * instead of trickling in key by key. Never throws - a failure here just
 * means this session falls back to local-only, same as always. */
export async function hydrateFromServer(): Promise<void> {
  if (!isBrowser()) return;

  let serverEntries: Record<string, unknown> = {};
  try {
    const res = await fetch("/api/sync", { cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      serverEntries = data.entries ?? {};
    }
  } catch {
    return; // offline / sync not configured - keep whatever's already local
  }

  for (const [key, value] of Object.entries(serverEntries)) {
    try {
      writeLocalOnly(key, value);
    } catch {
      // see setItem
    }
  }

  const alreadySeeded = getItem<boolean>(SEEDED_FLAG, false);
  if (alreadySeeded) return;

  const localOnly: Record<string, unknown> = {};
  for (let i = 0; i < window.localStorage.length; i++) {
    const fullKey = window.localStorage.key(i);
    if (!fullKey || !fullKey.startsWith(PREFIX)) continue;
    const key = fullKey.slice(PREFIX.length);
    if (key === SEEDED_FLAG || key in serverEntries) continue;
    try {
      localOnly[key] = JSON.parse(window.localStorage.getItem(fullKey) as string);
    } catch {
      // skip a corrupted entry rather than fail the whole seed
    }
  }

  if (Object.keys(localOnly).length > 0) {
    try {
      await fetch("/api/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entries: localOnly }),
      });
    } catch {
      // next hydration (or her next ordinary setItem call) will retry
    }
  }

  setItem(SEEDED_FLAG, true);
}

import memoriesData from "@/content/memories.json";
import { hashString, dailySeed } from "@/lib/seed";
import { getItem, setItem } from "@/lib/storage";

export interface Memory {
  id: string;
  /** 1-12. Optional, kept as a record of when it happened - not used to pick
   * which memory surfaces on a given day. */
  month?: number;
  day?: number;
  year?: number | null;
  title: string;
  text: string;
  /** Optional path under /public, e.g. "/memories/beach-2023.jpg". */
  image?: string;
}

const ALL_MEMORIES: Memory[] = memoriesData.memories;

const DAY_MS = 86400000;
/** Day 0 of the rotation. */
const ROTATION_START = Date.UTC(2026, 9, 14);

/** Shown by the old pick-at-random-every-day logic before the rotation
 * started, so the first cycle saves them for last. */
const SHOWN_BEFORE_ROTATION = new Set([
  "memory-8", "memory-20", "memory-21", "memory-27", "memory-28",
  "memory-30", "memory-32", "memory-33", "memory-36", "memory-38",
  "memory-41", "memory-46", "memory-48", "memory-50", "memory-51",
]);

/** Order of one full pass through the pool: every memory once, shuffled
 * differently each cycle. A cycle never opens with the memory the previous
 * one ended on. */
function cycleOrder(cycle: number, withSeamFix = true): Memory[] {
  const rank = (m: Memory) =>
    (cycle === 0 && SHOWN_BEFORE_ROTATION.has(m.id) ? 2 ** 32 : 0) +
    hashString(`${cycle}:${m.id}`);
  const order = ALL_MEMORIES.slice().sort((a, b) => rank(a) - rank(b));
  if (withSeamFix && cycle > 0 && order.length > 1) {
    const prev = cycleOrder(cycle - 1, false);
    if (order[0].id === prev[prev.length - 1].id) {
      [order[0], order[1]] = [order[1], order[0]];
    }
  }
  return order;
}

/** One memory a day, stable for the day (won't reroll on refresh). Walks
 * through the whole pool before any memory repeats, then reshuffles. Not
 * tied to the memory's own date in any way. */
export function memoryOfTheDay(date: Date = new Date()): Memory | null {
  const n = ALL_MEMORIES.length;
  if (n === 0) return null;
  const local = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
  const dayIndex = Math.max(0, Math.round((local - ROTATION_START) / DAY_MS));
  return cycleOrder(Math.floor(dayIndex / n))[dayIndex % n];
}

// --- Dismiss/reopen for today's card --------------------------------------

const DISMISSED_KEY = "us:dismissedMemoryDate";

export function isTodaysMemoryDismissed(date: string = dailySeed()): boolean {
  return getItem<string | null>(DISMISSED_KEY, null) === date;
}

export function dismissTodaysMemory(date: string = dailySeed()): void {
  setItem(DISMISSED_KEY, date);
}

export function reopenTodaysMemory(): void {
  setItem<string | null>(DISMISSED_KEY, null);
}

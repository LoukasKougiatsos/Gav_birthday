import memoriesData from "@/content/memories.json";
import { seededPick, dailySeed } from "@/lib/seed";
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

/** One memory, picked at random from the whole pool - stable for the day
 * (won't reroll on refresh), different the next. Not tied to the memory's
 * own date in any way. */
export function memoryOfTheDay(date: Date = new Date()): Memory | null {
  if (ALL_MEMORIES.length === 0) return null;
  return seededPick(ALL_MEMORIES, dailySeed(date));
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

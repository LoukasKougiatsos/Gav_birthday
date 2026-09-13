import { getItem, setItem } from "@/lib/storage";
import { dailySeed } from "@/lib/seed";

/** Private, local-only journal - one entry per day, never uploaded anywhere.
 * Optionally linked to that day's mood entry (see src/lib/mood.ts) purely so
 * she can filter/browse by how she was feeling, never as an analysis tool. */
export interface JournalEntry {
  date: string; // local YYYY-MM-DD
  text: string;
  linkedMood: boolean;
}

const JOURNAL_KEY = "mind:journal";

export function loadJournalEntries(): Record<string, JournalEntry> {
  return getItem<Record<string, JournalEntry>>(JOURNAL_KEY, {});
}

export function journalEntryFor(date: string = dailySeed()): JournalEntry | null {
  return loadJournalEntries()[date] ?? null;
}

export function saveJournalEntry(text: string, linkedMood: boolean, date: string = dailySeed()): Record<string, JournalEntry> {
  const all = loadJournalEntries();
  const next = { ...all, [date]: { date, text, linkedMood } };
  setItem(JOURNAL_KEY, next);
  return next;
}

export function deleteJournalEntry(date: string): Record<string, JournalEntry> {
  const all = loadJournalEntries();
  const next = { ...all };
  delete next[date];
  setItem(JOURNAL_KEY, next);
  return next;
}

/** Newest first. */
export function journalEntriesSorted(): JournalEntry[] {
  return Object.values(loadJournalEntries()).sort((a, b) => b.date.localeCompare(a.date));
}

export function searchJournalEntries(query: string): JournalEntry[] {
  const q = query.trim().toLowerCase();
  if (!q) return journalEntriesSorted();
  return journalEntriesSorted().filter((e) => e.text.toLowerCase().includes(q));
}

import { getItem, setItem } from "@/lib/storage";
import { dailySeed } from "@/lib/seed";

/** Five gentle options, not a numeric scale - a number invites overthinking
 * ("is today a 6 or a 7?"), a word doesn't. */
export type MoodOption = "rough" | "heavy" | "okay" | "good" | "bright";

export const MOOD_OPTIONS: MoodOption[] = ["rough", "heavy", "okay", "good", "bright"];

export const MOOD_LABEL_EL: Record<MoodOption, string> = {
  rough: "Δύσκολη",
  heavy: "Βαριά",
  okay: "Εντάξει",
  good: "Καλή",
  bright: "Υπέροχη",
};

/** Loose grouping used only for the encouragement avatar's tone and the
 * mood map's colour - never shown to her as a label or a score. */
export type MoodBand = "low" | "neutral" | "bright";

export const MOOD_BAND: Record<MoodOption, MoodBand> = {
  rough: "low",
  heavy: "low",
  okay: "neutral",
  good: "bright",
  bright: "bright",
};

export const MOOD_TAGS = [
  "κουρασμένη",
  "ήρεμη",
  "αγχωμένη",
  "χαρούμενη",
  "ανήσυχη",
  "ευγνώμων",
  "μόνη",
  "ενθουσιασμένη",
] as const;

export interface MoodEntry {
  date: string; // local YYYY-MM-DD
  mood: MoodOption;
  tags: string[];
}

const MOOD_KEY = "mind:moods";

export function loadMoodEntries(): Record<string, MoodEntry> {
  return getItem<Record<string, MoodEntry>>(MOOD_KEY, {});
}

export function todaysMood(date: string = dailySeed()): MoodEntry | null {
  return loadMoodEntries()[date] ?? null;
}

export function saveMoodEntry(mood: MoodOption, tags: string[], date: string = dailySeed()): Record<string, MoodEntry> {
  const all = loadMoodEntries();
  const next = { ...all, [date]: { date, mood, tags } };
  setItem(MOOD_KEY, next);
  return next;
}

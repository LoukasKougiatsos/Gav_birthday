import { getItem, setItem } from "@/lib/storage";
import { dailySeed } from "@/lib/seed";
import { daysBetweenISO } from "@/lib/date";

/** Editable, no-pressure daily check-in - same shape as src/lib/mood.ts.
 * She can correct a mis-tap; there's no locked-once-answered streak
 * mechanic like Clinic's daily case. */
export interface ExerciseEntry {
  date: string; // local YYYY-MM-DD
  exercised: boolean;
}

const EXERCISE_KEY = "exercise:entries";

/** Avatar art stages, 1 (least buff) .. BUFF_STAGES (most buff) - matches
 * the 5 images actually supplied (public/exercise/avatar-1.jpg..avatar-5.jpg). */
export const BUFF_STAGES = 5;

/** The buff level moves in fixed, non-overlapping 3-day blocks measured
 * from her very first entry, not per-answer - "exercise once every three
 * days keeps it climbing" is a per-window rule, not a same-day reaction. */
const BUFF_WINDOW_DAYS = 3;

export function loadExerciseEntries(): Record<string, ExerciseEntry> {
  return getItem<Record<string, ExerciseEntry>>(EXERCISE_KEY, {});
}

export function todaysExercise(date: string = dailySeed()): ExerciseEntry | null {
  return loadExerciseEntries()[date] ?? null;
}

export function saveExerciseEntry(
  exercised: boolean,
  date: string = dailySeed()
): Record<string, ExerciseEntry> {
  const all = loadExerciseEntries();
  const next = { ...all, [date]: { date, exercised } };
  setItem(EXERCISE_KEY, next);
  return next;
}

/** Steps the buff level through every 3-day block that's fully elapsed
 * since her first ever entry: a block with at least one "yes" in it nudges
 * the level up a stage, a block with none nudges it down. The block still
 * in progress (today's) is never counted early. Derived from the entries
 * every time rather than stored, so it can never drift out of sync. */
export function buffLevel(
  entries: Record<string, ExerciseEntry> = loadExerciseEntries(),
  today: string = dailySeed()
): number {
  const dates = Object.keys(entries).sort();
  if (dates.length === 0) return 1;

  const firstDate = dates[0];
  const completeWindows = Math.floor(Math.max(0, daysBetweenISO(firstDate, today)) / BUFF_WINDOW_DAYS);

  const windowHasYes = new Array(completeWindows).fill(false);
  for (const date of dates) {
    if (!entries[date].exercised) continue;
    const windowIndex = Math.floor(daysBetweenISO(firstDate, date) / BUFF_WINDOW_DAYS);
    if (windowIndex >= 0 && windowIndex < completeWindows) windowHasYes[windowIndex] = true;
  }

  let level = 1;
  for (const hasYes of windowHasYes) {
    level = Math.max(1, Math.min(BUFF_STAGES, level + (hasYes ? 1 : -1)));
  }
  return level;
}

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

/** A silent gap this long (no "Ναι", whether from an explicit "Όχι" or no
 * answer at all) costs one buff stage - see buffLevel(). */
const DECAY_GAP_DAYS = 3;

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

/** Every "Ναι" bumps the level immediately; a silent gap of DECAY_GAP_DAYS
 * with no "Ναι" (an explicit "Όχι" or simply no answer, treated the same)
 * costs one stage per full gap - so two silent weeks costs more than one.
 * Walks her "Ναι" dates in order rather than simulating day-by-day: each
 * one first pays off any decay accrued since the previous "Ναι" (or since
 * the start, for the first one), then bumps the level up a stage; any
 * remaining silence between the last "Ναι" and today is paid off last.
 * Derived from the entries every time rather than stored, so it can never
 * drift out of sync. */
export function buffLevel(
  entries: Record<string, ExerciseEntry> = loadExerciseEntries(),
  today: string = dailySeed()
): number {
  const yesDates = Object.values(entries)
    .filter((e) => e.exercised)
    .map((e) => e.date)
    .sort();

  let level = 1;
  let lastYesDate: string | null = null;

  for (const date of yesDates) {
    if (lastYesDate) {
      const decaySteps = Math.floor(daysBetweenISO(lastYesDate, date) / DECAY_GAP_DAYS);
      level = Math.max(1, level - decaySteps);
    }
    level = Math.min(BUFF_STAGES, level + 1);
    lastYesDate = date;
  }

  if (lastYesDate) {
    const decaySteps = Math.floor(daysBetweenISO(lastYesDate, today) / DECAY_GAP_DAYS);
    level = Math.max(1, level - decaySteps);
  }

  return level;
}

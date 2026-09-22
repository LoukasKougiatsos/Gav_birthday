import rawCaseData from "@/content/clinicCases.json";
import { dailySeed, weeklySeed, seededPick, seededPickMany, seededShuffle } from "@/lib/seed";
import { daysBetweenISO } from "@/lib/date";
import { getItem, setItem } from "@/lib/storage";

export type ClinicGroup = "bird" | "mammal" | "reptile" | "marine";
export type AgeClass = "nestling" | "fledgling" | "juvenile" | "adult";
export type Difficulty = "easy" | "medium" | "hard";
/** Grammatical gender of the Greek species name (speciesEl), so age-class
 * adjectives placed in front of it agree correctly - "Νεαρός Ασημόγλαρος"
 * (masculine), not "Νεαρό Ασημόγλαρος". */
export type Gender = "m" | "f" | "n";

export interface ClinicCase {
  id: string;
  group: ClinicGroup;
  speciesEn: string;
  speciesEl: string;
  gender: Gender;
  ageClass: AgeClass;
  correctFoods: string[];
  wrongFoods: string[];
  note: string;
  difficulty: Difficulty;
  /** Present on cases she adds herself via the "add a case" form. */
  custom?: boolean;
}

export const MILESTONES = [1, 7, 30, 100] as const;

/** Greek label for each age class, indexed by gender since three of the four
 * are adjectives that must agree with the species noun (speciesEl). "Νεοσσός"
 * (fledgling) is itself a noun, not an adjective, so it stays invariant. */
export const AGE_CLASS_EL: Record<AgeClass, Record<Gender, string>> = {
  nestling: { m: "Νεογέννητος", f: "Νεογέννητη", n: "Νεογέννητο" },
  fledgling: { m: "Νεοσσός", f: "Νεοσσός", n: "Νεοσσός" },
  juvenile: { m: "Νεαρός", f: "Νεαρή", n: "Νεαρό" },
  adult: { m: "Ενήλικος", f: "Ενήλικη", n: "Ενήλικο" },
};

/** Greek label for each species group, used in the sanctuary. */
export const GROUP_EL: Record<ClinicGroup, string> = {
  bird: "Πουλιά",
  mammal: "Θηλαστικά",
  reptile: "Ερπετά",
  marine: "Θαλάσσια",
};

/** "1 ημέρα σερί" vs "5 ημέρες σερί" - Greek singular/plural, shared by the
 * Clinic screen and the Home teaser. */
export function streakLabel(streak: number): string {
  return streak === 1 ? "1 ημέρα σερί" : `${streak} ημέρες σερί`;
}

export const BUILT_IN_CASES = (rawCaseData as { disclaimer: string; cases: ClinicCase[] }).cases;
export const CLINIC_DATA_DISCLAIMER = (rawCaseData as { disclaimer: string }).disclaimer;

const CUSTOM_CASES_KEY = "clinic:customCases";
const PROGRESS_KEY = "clinic:progress";

export function loadCustomCases(): ClinicCase[] {
  return getItem<ClinicCase[]>(CUSTOM_CASES_KEY, []);
}

/** The full library the game draws from: built-ins plus anything she's added. */
export function allCases(): ClinicCase[] {
  return [...BUILT_IN_CASES, ...loadCustomCases()];
}

export interface DailyAnswerRecord {
  date: string;
  caseId: string;
  chosenFood: string;
  correct: boolean;
}

export interface ClinicProgress {
  streak: number;
  lastPlayedDate: string | null;
  /** ISO week key ("2026-W03") the rest-day token was last spent in. */
  restTokenSpentWeek: string | null;
  /** One record per calendar day she's answered the daily case. */
  answeredDates: Record<string, DailyAnswerRecord>;
  /** Case ids she has fed correctly at least once (daily or practice). */
  sanctuary: string[];
  /** Streak milestones already celebrated, so they don't repeat. */
  milestonesSeen: number[];
}

const EMPTY_PROGRESS: ClinicProgress = {
  streak: 0,
  lastPlayedDate: null,
  restTokenSpentWeek: null,
  answeredDates: {},
  sanctuary: [],
  milestonesSeen: [],
};

export function loadProgress(): ClinicProgress {
  return getItem<ClinicProgress>(PROGRESS_KEY, EMPTY_PROGRESS);
}

function saveProgress(progress: ClinicProgress): void {
  setItem(PROGRESS_KEY, progress);
}

/** Today's case, deterministically picked so it's the same all day and the
 * same on every device, but changes at her local midnight. Prefers a
 * species she hasn't fed correctly yet (via `collectedIds`, i.e. the
 * Sanctuary), so it doesn't repeat one she's already captured while
 * uncaptured ones remain - falls back to the whole library once
 * everything's been caught at least once, since repeats become
 * unavoidable at that point. */
export function getDailyCase(
  cases: ClinicCase[] = allCases(),
  today: string = dailySeed(),
  collectedIds: string[] = []
): ClinicCase {
  const uncaptured = cases.filter((c) => !collectedIds.includes(c.id));
  const pool = uncaptured.length > 0 ? uncaptured : cases;
  return seededPick(pool, `clinic-daily|${today}`);
}

/** Today's case, pinned to the one already answered if there is one - once
 * answered correctly it joins the sanctuary, so re-picking from uncaptured
 * species would otherwise swap in a different animal mid-day. */
export function getTodaysCase(
  progress: ClinicProgress = loadProgress(),
  cases: ClinicCase[] = allCases(),
  today: string = dailySeed()
): ClinicCase {
  const record = progress.answeredDates[today];
  const answered = record && cases.find((c) => c.id === record.caseId);
  return answered || getDailyCase(cases, today, progress.sanctuary);
}

export interface CaseOption {
  text: string;
  correct: boolean;
}

/** 3-4 answer options for a case: one correct food plus a couple of the
 * realistic public mistakes from `wrongFoods`, deterministically shuffled so
 * revisiting the same case on the same day shows the same options. */
export function getCaseOptions(clinicCase: ClinicCase, seed: string): CaseOption[] {
  const correct = seededPick(clinicCase.correctFoods, `${seed}|${clinicCase.id}|correct`);
  const wrongCount = Math.min(clinicCase.wrongFoods.length, 3);
  const wrongs = seededPickMany(clinicCase.wrongFoods, `${seed}|${clinicCase.id}|wrong`, wrongCount);
  const options: CaseOption[] = [
    { text: correct, correct: true },
    ...wrongs.map((text) => ({ text, correct: false })),
  ];
  return seededShuffle(options, `${seed}|${clinicCase.id}|order`);
}

export function hasAnsweredToday(progress: ClinicProgress = loadProgress(), today: string = dailySeed()): boolean {
  return Boolean(progress.answeredDates[today]);
}

export function isRestTokenAvailable(progress: ClinicProgress = loadProgress(), today: string = dailySeed()): boolean {
  return progress.restTokenSpentWeek !== weeklySeed(new Date(today));
}

export interface RecordAnswerResult {
  progress: ClinicProgress;
  milestoneReached: number | null;
  streakBridgedByRestToken: boolean;
}

/** Records today's daily-case answer, updates the streak, and reports back
 * any milestone just reached. A no-op if today's already been answered (one
 * attempt per day) - call `hasAnsweredToday` first to avoid double-counting
 * in the UI. */
export function recordDailyAnswer(
  caseId: string,
  chosenFood: string,
  correct: boolean,
  today: string = dailySeed()
): RecordAnswerResult {
  const progress = loadProgress();

  if (progress.answeredDates[today]) {
    return { progress, milestoneReached: null, streakBridgedByRestToken: false };
  }

  let streak = 1;
  let restTokenSpentWeek = progress.restTokenSpentWeek;
  let streakBridgedByRestToken = false;

  if (!correct) {
    // A wrong answer breaks the streak outright, same as missing a day -
    // the rest token only covers an absence, not a mistake.
    streak = 0;
  } else if (progress.lastPlayedDate) {
    const gap = daysBetweenISO(progress.lastPlayedDate, today);
    if (gap === 1) {
      streak = progress.streak + 1;
    } else if (gap === 2 && isRestTokenAvailable(progress, today)) {
      streak = progress.streak + 1;
      restTokenSpentWeek = weeklySeed(new Date(today));
      streakBridgedByRestToken = true;
    }
    // any larger gap (or gap===2 with no token left) resets to a fresh streak of 1
  }

  const sanctuary = correct && !progress.sanctuary.includes(caseId)
    ? [...progress.sanctuary, caseId]
    : progress.sanctuary;

  const milestoneReached = MILESTONES.includes(streak as (typeof MILESTONES)[number]) && !progress.milestonesSeen.includes(streak)
    ? streak
    : null;

  const next: ClinicProgress = {
    streak,
    lastPlayedDate: today,
    restTokenSpentWeek,
    answeredDates: { ...progress.answeredDates, [today]: { date: today, caseId, chosenFood, correct } },
    sanctuary,
    milestonesSeen: milestoneReached ? [...progress.milestonesSeen, milestoneReached] : progress.milestonesSeen,
  };

  saveProgress(next);
  return { progress: next, milestoneReached, streakBridgedByRestToken };
}

/** If a streak lapsed silently (she missed a day and never came back to
 * "record" a miss - there's nothing to record for a day she never opened the
 * app), the displayed streak should still reflect that lapse the next time
 * she does open it, before she's answered anything. Call this on load. */
export function currentDisplayStreak(progress: ClinicProgress = loadProgress(), today: string = dailySeed()): number {
  if (!progress.lastPlayedDate || hasAnsweredToday(progress, today)) return progress.streak;
  const gap = daysBetweenISO(progress.lastPlayedDate, today);
  if (gap <= 1) return progress.streak; // still within grace before today's answer
  if (gap === 2 && isRestTokenAvailable(progress, today)) return progress.streak; // rest token can still save it today
  return 0;
}

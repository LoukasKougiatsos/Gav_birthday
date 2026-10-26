import type { ClinicProgress, DailyAnswerRecord } from "@/lib/clinic";

/** The sync key clinic progress lives under - see src/lib/clinic.ts. */
export const CLINIC_PROGRESS_KEY = "clinic:progress";

/** Identifies one specific answer, for `undoneAnswers`. */
export function answerKey(record: Pick<DailyAnswerRecord, "date" | "caseId" | "chosenFood">): string {
  return `${record.date}|${record.caseId}|${record.chosenFood}`;
}

/**
 * Combines two copies of her clinic progress instead of letting one replace
 * the other. Sync used to be last-write-wins, so a phone whose localStorage
 * had been emptied (and whose hydration timed out) answered a case and pushed
 * an empty sanctuary over the real one on 2026-10-26, wiping it on every
 * device. Collected animals and answered days only ever accumulate, so
 * they're unioned; the streak fields come from whichever copy played last.
 * Used both server-side (POST /api/sync) and on hydration.
 *
 * Since everything accumulates, taking an answer back (someone else answered
 * on her account) needs a tombstone: `undoneAnswers` lists answers to drop,
 * and a copy whose last answer was undone loses the streak fields to the
 * other copy, so a stale phone can't bring the undone answer or its streak
 * back.
 */
export function mergeClinicProgress(a: Partial<ClinicProgress> | null | undefined, b: Partial<ClinicProgress> | null | undefined): ClinicProgress {
  const x = a ?? {};
  const y = b ?? {};
  const undone = [...new Set([...(x.undoneAnswers ?? []), ...(y.undoneAnswers ?? [])])];
  const isUndone = (r: DailyAnswerRecord | undefined) => Boolean(r && undone.includes(answerKey(r)));
  const lastPlayed = (p: Partial<ClinicProgress>) =>
    p.lastPlayedDate && !isUndone(p.answeredDates?.[p.lastPlayedDate]) ? p.lastPlayedDate : "";
  // Later lastPlayedDate wins the scalar fields; on a tie, b (the newer write).
  const newer = lastPlayed(x) > lastPlayed(y) ? x : y;
  const answeredDates = Object.fromEntries(
    Object.entries({ ...x.answeredDates, ...y.answeredDates }).filter(([, r]) => !isUndone(r))
  );
  return {
    streak: newer.streak ?? 0,
    lastPlayedDate: newer.lastPlayedDate ?? null,
    restTokenSpentWeek: newer.restTokenSpentWeek ?? null,
    answeredDates,
    sanctuary: [...new Set([...(x.sanctuary ?? []), ...(y.sanctuary ?? [])])],
    milestonesSeen: [...new Set([...(x.milestonesSeen ?? []), ...(y.milestonesSeen ?? [])])],
    ...(undone.length > 0 && { undoneAnswers: undone }),
  };
}

import type { ClinicProgress } from "@/lib/clinic";

/** The sync key clinic progress lives under - see src/lib/clinic.ts. */
export const CLINIC_PROGRESS_KEY = "clinic:progress";

/**
 * Combines two copies of her clinic progress instead of letting one replace
 * the other. Sync used to be last-write-wins, so a phone whose localStorage
 * had been emptied (and whose hydration timed out) answered a case and pushed
 * an empty sanctuary over the real one on 2026-10-26, wiping it on every
 * device. Collected animals and answered days only ever accumulate, so
 * they're unioned; the streak fields come from whichever copy played last.
 * Used both server-side (POST /api/sync) and on hydration.
 */
export function mergeClinicProgress(a: Partial<ClinicProgress> | null | undefined, b: Partial<ClinicProgress> | null | undefined): ClinicProgress {
  const x = a ?? {};
  const y = b ?? {};
  // Later lastPlayedDate wins the scalar fields; on a tie, b (the newer write).
  const newer = (x.lastPlayedDate ?? "") > (y.lastPlayedDate ?? "") ? x : y;
  return {
    streak: newer.streak ?? 0,
    lastPlayedDate: newer.lastPlayedDate ?? null,
    restTokenSpentWeek: newer.restTokenSpentWeek ?? null,
    answeredDates: { ...x.answeredDates, ...y.answeredDates },
    sanctuary: [...new Set([...(x.sanctuary ?? []), ...(y.sanctuary ?? [])])],
    milestonesSeen: [...new Set([...(x.milestonesSeen ?? []), ...(y.milestonesSeen ?? [])])],
  };
}

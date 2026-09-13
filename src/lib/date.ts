/** Date helpers for Home's greeting and days-together counter. */

import { DAY_MESSAGES } from "@/content/dayMessages";

/** Local midnight for a given date, so counting days is DST/TZ-safe. */
function localMidnight(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function parseISODate(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1);
}

/** Whole days between two local `YYYY-MM-DD` dates (b minus a). Used for the
 * days-together counter and the Clinic streak's "how many days since she last
 * played" gap check. */
export function daysBetweenISO(aISO: string, bISO: string): number {
  const msPerDay = 86400000;
  const a = localMidnight(parseISODate(aISO));
  const b = localMidnight(parseISODate(bISO));
  return Math.round((b.getTime() - a.getTime()) / msPerDay);
}

/** Whole days elapsed between an ISO `YYYY-MM-DD` anniversary date and today
 * (local time). Returns 0 for a same-day anniversary. */
export function daysTogether(anniversaryDateISO: string, today: Date = new Date()): number {
  const y = today.getFullYear();
  const m = String(today.getMonth() + 1).padStart(2, "0");
  const d = String(today.getDate()).padStart(2, "0");
  return daysBetweenISO(anniversaryDateISO, `${y}-${m}-${d}`);
}

export type DayPart = "night" | "morning" | "afternoon" | "evening";

/** Coarse time-of-day bucket, used to pick a greeting tone. */
export function dayPart(date: Date = new Date()): DayPart {
  const hour = date.getHours();
  if (hour < 6) return "night";
  if (hour < 12) return "morning";
  if (hour < 18) return "afternoon";
  return "evening";
}

const GREETINGS: Record<DayPart, string> = {
  night: "Καλό ξημέρωμα",
  morning: "Καλημέρα",
  afternoon: "Καλό μεσημέρι",
  evening: "Καλησπέρα",
};

export function greetingWord(date: Date = new Date()): string {
  return GREETINGS[dayPart(date)];
}

/** Caption under the days-together counter, one per day, cycling through
 * DAY_MESSAGES in order as `days` increments. Same message all day, changes
 * at local midnight along with the counter itself. */
export function dayMessage(days: number): string {
  const index = ((days % DAY_MESSAGES.length) + DAY_MESSAGES.length) % DAY_MESSAGES.length;
  return DAY_MESSAGES[index];
}

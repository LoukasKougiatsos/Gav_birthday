"use client";

import { useEffect, useRef, useState } from "react";
import { dailySeed } from "@/lib/seed";
import { loadExerciseEntries, type ExerciseEntry } from "@/lib/exercise";
import { Card } from "@/components/ui/Card";

const WEEKDAY_LABELS_EL = ["Δ", "Τ", "Τ", "Π", "Π", "Σ", "Κ"];

const MONTH_LABELS_EL = [
  "Ιανουάριος", "Φεβρουάριος", "Μάρτιος", "Απρίλιος", "Μάιος", "Ιούνιος",
  "Ιούλιος", "Αύγουστος", "Σεπτέμβριος", "Οκτώβριος", "Νοέμβριος", "Δεκέμβριος",
];

function dateKey(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

/** `refreshOn` should change (e.g. today's answer) whenever a new entry is
 * saved elsewhere on the page, mirroring MoodMap - see that component for
 * the fuller rationale. */
export function ExerciseCalendar({ refreshOn }: { refreshOn?: unknown } = {}) {
  const [entries, setEntries] = useState<Record<string, ExerciseEntry>>({});
  const [cursor, setCursor] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });
  const today = dailySeed();
  const wasExercisedToday = useRef<boolean | null>(null);
  const [justPopped, setJustPopped] = useState(false);

  useEffect(() => {
    const next = loadExerciseEntries();
    const nowExercised = next[today]?.exercised ?? false;
    // Only a live "no/unanswered -> yes" transition during this session pops
    // - a page load that already has today answered shouldn't animate.
    if (wasExercisedToday.current === false && nowExercised) {
      setJustPopped(true);
      const timeout = setTimeout(() => setJustPopped(false), 600);
      wasExercisedToday.current = nowExercised;
      setEntries(next);
      return () => clearTimeout(timeout);
    }
    wasExercisedToday.current = nowExercised;
    setEntries(next);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshOn]);

  const trackedDates = Object.keys(entries).sort();
  const earliestTracked = trackedDates.length > 0 ? trackedDates[0] : today;

  const { year, month } = cursor;
  const firstOfMonth = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const leadingBlanks = (firstOfMonth.getDay() + 6) % 7; // Mon=0

  const cells: (number | null)[] = [
    ...Array.from({ length: leadingBlanks }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  function goMonth(delta: number) {
    setCursor((c) => {
      const d = new Date(c.year, c.month + delta, 1);
      return { year: d.getFullYear(), month: d.getMonth() };
    });
  }

  return (
    <Card tone="clay" className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <button type="button" onClick={() => goMonth(-1)} className="px-2 text-ink/50" aria-label="Προηγούμενος μήνας">
          ‹
        </button>
        <p className="font-display text-sm font-semibold text-clay">
          {MONTH_LABELS_EL[month]} {year}
        </p>
        <button type="button" onClick={() => goMonth(1)} className="px-2 text-ink/50" aria-label="Επόμενος μήνας">
          ›
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center">
        {WEEKDAY_LABELS_EL.map((label, i) => (
          <p key={i} className="text-[10px] text-ink/40">
            {label}
          </p>
        ))}
        {cells.map((day, i) => {
          if (day === null) return <div key={`blank-${i}`} />;
          const key = dateKey(year, month, day);
          const entry = entries[key];
          const isToday = key === today;
          // Silence means "didn't exercise" (no separate "Όχι" state to
          // track anymore - see ExerciseCheckIn), but only from the day she
          // started logging onward: a month before this feature existed
          // shouldn't read as a wall of missed days.
          const inTrackedRange = key <= today && key >= earliestTracked;
          const stateClass = entry?.exercised
            ? "bg-sage text-paper"
            : inTrackedRange
              ? "bg-terracotta/70 text-paper"
              : "bg-white/50 text-ink/50";
          return (
            <div
              key={key}
              className={`flex aspect-square items-center justify-center rounded-lg text-[10px] ${stateClass} ${
                isToday ? "exercise-cell-today" : ""
              }`}
            >
              <span className={`inline-block ${isToday && justPopped ? "exercise-cell-pop" : ""}`}>{day}</span>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

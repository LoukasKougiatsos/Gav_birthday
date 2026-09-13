"use client";

import { useEffect, useState } from "react";
import { MOOD_BAND, loadMoodEntries, type MoodEntry } from "@/lib/mood";
import { Card } from "@/components/ui/Card";

const WEEKDAY_LABELS_EL = ["Δ", "Τ", "Τ", "Π", "Π", "Σ", "Κ"];

const MONTH_LABELS_EL = [
  "Ιανουάριος", "Φεβρουάριος", "Μάρτιος", "Απρίλιος", "Μάιος", "Ιούνιος",
  "Ιούλιος", "Αύγουστος", "Σεπτέμβριος", "Οκτώβριος", "Νοέμβριος", "Δεκέμβριος",
];

const BAND_COLOR: Record<"low" | "neutral" | "bright", string> = {
  low: "bg-sky/60",
  neutral: "bg-sun/60",
  bright: "bg-terracotta/60",
};

function dateKey(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

/** `refreshOn` should change (e.g. today's mood) whenever a new entry is
 * saved elsewhere on the page, so the map re-reads storage and today's cell
 * picks up its color without needing a full page reload. */
export function MoodMap({ refreshOn }: { refreshOn?: unknown } = {}) {
  const [entries, setEntries] = useState<Record<string, MoodEntry>>({});
  const [cursor, setCursor] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });

  useEffect(() => {
    async function init() {
      setEntries(loadMoodEntries());
    }
    init();
  }, [refreshOn]);

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
    <Card tone="lavender" className="flex flex-col gap-3">
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
          const bandClass = entry ? BAND_COLOR[MOOD_BAND[entry.mood]] : "bg-white/50";
          return (
            <div
              key={key}
              className={`flex aspect-square items-center justify-center rounded-lg text-[10px] text-ink/50 ${bandClass}`}
            >
              {day}
            </div>
          );
        })}
      </div>

      <p className="text-xs text-ink/40">Απλά ένα οπτικό ημερολόγιο - χωρίς ερμηνεία, χωρίς βαθμολογία.</p>
    </Card>
  );
}

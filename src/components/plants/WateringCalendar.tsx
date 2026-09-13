"use client";

import { useState } from "react";
import { projectedWateringDates, type GardenPlant } from "@/lib/plants";
import type { GardenWeatherWeek } from "@/lib/weather";
import { Card } from "@/components/ui/Card";

const WEEKDAY_LABELS_EL = ["Δ", "Τ", "Τ", "Π", "Π", "Σ", "Κ"];

const MONTH_LABELS_EL = [
  "Ιανουάριος", "Φεβρουάριος", "Μάρτιος", "Απρίλιος", "Μάιος", "Ιούνιος",
  "Ιούλιος", "Αύγουστος", "Σεπτέμβριος", "Οκτώβριος", "Νοέμβριος", "Δεκέμβριος",
];

function dateKey(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export function WateringCalendar({ garden, weatherWeek }: { garden: GardenPlant[]; weatherWeek: GardenWeatherWeek | null }) {
  const [cursor, setCursor] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });

  const { year, month } = cursor;
  const firstOfMonth = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const leadingBlanks = (firstOfMonth.getDay() + 6) % 7; // Mon=0
  const rangeStart = new Date(year, month, 1);
  const rangeEnd = new Date(year, month, daysInMonth);

  const dueByDate = new Map<string, string[]>();
  for (const plant of garden) {
    for (const date of projectedWateringDates(plant, weatherWeek, rangeStart, rangeEnd)) {
      const names = dueByDate.get(date) ?? [];
      names.push(plant.name);
      dueByDate.set(date, names);
    }
  }

  const cells: (number | null)[] = [
    ...Array.from({ length: leadingBlanks }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const upcoming = [...dueByDate.entries()].sort(([a], [b]) => a.localeCompare(b));

  function goMonth(delta: number) {
    setCursor((c) => {
      const d = new Date(c.year, c.month + delta, 1);
      return { year: d.getFullYear(), month: d.getMonth() };
    });
  }

  if (garden.length === 0) return null;

  return (
    <Card tone="sage" className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <button type="button" onClick={() => goMonth(-1)} className="px-2 text-ink/50" aria-label="Προηγούμενος μήνας">
          ‹
        </button>
        <p className="font-display text-sm font-semibold text-forest">
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
          const due = dueByDate.get(key);
          return (
            <div
              key={key}
              className={`flex aspect-square flex-col items-center justify-center rounded-lg text-[10px] ${
                due ? "bg-terracotta/60 text-paper" : "bg-white/50 text-ink/50"
              }`}
            >
              <span>{day}</span>
              {due && due.length > 1 && <span className="text-[8px]">×{due.length}</span>}
            </div>
          );
        })}
      </div>

      {upcoming.length > 0 && (
        <div className="flex flex-col gap-1 border-t border-sage/30 pt-2">
          {upcoming.map(([date, names]) => (
            <p key={date} className="text-xs text-ink/70">
              <span className="font-medium text-forest">{date.slice(8, 10)}/{date.slice(5, 7)}:</span> {names.join(", ")}
            </p>
          ))}
        </div>
      )}
    </Card>
  );
}

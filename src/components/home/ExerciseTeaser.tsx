"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { todaysExercise, buffLevel, BUFF_STAGES } from "@/lib/exercise";
import { Card } from "@/components/ui/Card";
import { NavIcon } from "@/components/icons/NavIcons";
import { SECTION_ACCENT } from "@/components/ui/accents";

interface TeaserState {
  exercisedToday: boolean;
  level: number;
}

export function ExerciseTeaser() {
  const [state, setState] = useState<TeaserState | null>(null);
  const accent = SECTION_ACCENT.exercise;

  useEffect(() => {
    // One-time sync from localStorage on mount, see ClinicGame.tsx for the
    // fuller rationale. No "answered but said no" state anymore - see
    // ExerciseCheckIn.tsx, silence already means "didn't exercise."
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setState({
      exercisedToday: todaysExercise()?.exercised ?? false,
      level: buffLevel(),
    });
  }, []);

  if (!state) {
    return (
      <Card tone={accent.tone} className="h-[74px] animate-pulse">
        <span className="sr-only">Φόρτωση…</span>
      </Card>
    );
  }

  return (
    <Link href="/exercise">
      <Card tone={accent.tone} className="flex items-center gap-3">
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${accent.badge}`}>
          <NavIcon kind="exercise" className="h-5 w-5" />
        </div>
        <div className="flex flex-1 flex-col items-start gap-1">
          <p className="text-sm text-ink/80">
            {state.exercisedToday ? "Γυμναστική σήμερα ✓" : "Έκανες γυμναστική σήμερα;"}
          </p>
          <p className="rounded-full bg-white/60 px-2 py-0.5 text-xs text-clay">
            Επίπεδο {state.level}/{BUFF_STAGES}
          </p>
        </div>
      </Card>
    </Link>
  );
}

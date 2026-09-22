"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { dailySeed } from "@/lib/seed";
import { getTodaysCase, hasAnsweredToday, currentDisplayStreak, loadProgress, streakLabel } from "@/lib/clinic";
import { Card } from "@/components/ui/Card";
import { NavIcon } from "@/components/icons/NavIcons";
import { SECTION_ACCENT } from "@/components/ui/accents";

interface TeaserState {
  answeredToday: boolean;
  streak: number;
  speciesEl: string;
}

export function ClinicTeaser() {
  const [state, setState] = useState<TeaserState | null>(null);
  const accent = SECTION_ACCENT.clinic;

  useEffect(() => {
    const today = dailySeed();
    const progress = loadProgress();
    // One-time sync from external state (localStorage + today's date) into
    // React state on mount, see ClinicGame.tsx for the fuller rationale.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setState({
      answeredToday: hasAnsweredToday(progress, today),
      streak: currentDisplayStreak(progress, today),
      speciesEl: getTodaysCase(progress, undefined, today).speciesEl,
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
    <Link href="/clinic">
      <Card tone={accent.tone} className="flex items-center gap-3">
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${accent.badge}`}>
          <NavIcon kind="clinic" className="h-5 w-5" />
        </div>
        <div className="flex flex-1 flex-col items-start gap-1">
          <p className="text-sm text-ink/80">
            {state.answeredToday ? `Το σημερινό περιστατικό: ${state.speciesEl} ✓` : `Σε περιμένει: ${state.speciesEl}`}
          </p>
          {state.streak > 0 && (
            <p className="rounded-full bg-white/60 px-2 py-0.5 text-xs text-clay">🔥 {streakLabel(state.streak)}</p>
          )}
        </div>
      </Card>
    </Link>
  );
}

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { loadGarden, computeWateringPlan, STATUS_LABEL_EL } from "@/lib/plants";
import { Card } from "@/components/ui/Card";
import { NavIcon } from "@/components/icons/NavIcons";
import { SECTION_ACCENT } from "@/components/ui/accents";

interface TeaserState {
  plantName: string | null;
  status: "fine" | "soon" | "thirsty" | null;
}

export function PlantsTeaser() {
  const [state, setState] = useState<TeaserState | null>(null);
  const accent = SECTION_ACCENT.plants;

  useEffect(() => {
    // One-time sync from localStorage on mount, see ClinicGame.tsx for the
    // fuller rationale. No weather fetch here - that's an enhancement the
    // Plants page itself applies; this teaser uses each plant's base interval.
    const garden = loadGarden();
    const mostUrgent = [...garden].sort(
      (a, b) => computeWateringPlan(a, null).daysUntilNext - computeWateringPlan(b, null).daysUntilNext
    )[0];
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setState({
      plantName: mostUrgent?.name ?? null,
      status: mostUrgent ? computeWateringPlan(mostUrgent, null).status : null,
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
    <Link href="/plants">
      <Card tone={accent.tone} className="flex items-center gap-3">
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${accent.badge}`}>
          <NavIcon kind="plants" className="h-5 w-5" />
        </div>
        <div className="flex flex-1 flex-col items-start gap-1">
          <p className="text-sm text-ink/80">
            {state.plantName ? `${state.plantName}` : "Πρόσθεσε το πρώτο σου φυτό"}
          </p>
          {state.status && (
            <p className="rounded-full bg-white/60 px-2 py-0.5 text-xs text-forest">{STATUS_LABEL_EL[state.status]}</p>
          )}
        </div>
      </Card>
    </Link>
  );
}

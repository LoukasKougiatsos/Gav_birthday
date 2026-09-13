"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { loadDailyPlan } from "@/lib/kitchen";
import { Card } from "@/components/ui/Card";
import { NavIcon } from "@/components/icons/NavIcons";
import { SECTION_ACCENT } from "@/components/ui/accents";

export function KitchenTeaser() {
  const [mealTitle, setMealTitle] = useState<string | null | undefined>(undefined); // undefined = loading
  const accent = SECTION_ACCENT.kitchen;

  useEffect(() => {
    // One-time sync from localStorage on mount, see ClinicGame.tsx for the
    // fuller rationale. Reads whatever plan is already cached rather than
    // generating one - that stays the Kitchen page's job (it costs an API call).
    const firstMeal = loadDailyPlan()?.meals[0];
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMealTitle(firstMeal ? (firstMeal.titleEl ?? firstMeal.title) : null);
  }, []);

  if (mealTitle === undefined) {
    return (
      <Card tone={accent.tone} className="h-[74px] animate-pulse">
        <span className="sr-only">Φόρτωση…</span>
      </Card>
    );
  }

  return (
    <Link href="/kitchen">
      <Card tone={accent.tone} className="flex items-center gap-3">
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${accent.badge}`}>
          <NavIcon kind="kitchen" className="h-5 w-5" />
        </div>
        <div className="flex flex-1 flex-col items-start gap-1">
          <p className="text-sm text-ink/80">{mealTitle ? "Μια ιδέα για απόψε" : "Δες τις σημερινές προτάσεις"}</p>
          {mealTitle && <p className="rounded-full bg-white/60 px-2 py-0.5 text-xs text-honey">{mealTitle}</p>}
        </div>
      </Card>
    </Link>
  );
}

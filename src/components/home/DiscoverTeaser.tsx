"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { placeOfTheWeek } from "@/lib/discover";
import { Card } from "@/components/ui/Card";
import { NavIcon } from "@/components/icons/NavIcons";
import { SECTION_ACCENT } from "@/components/ui/accents";

export function DiscoverTeaser() {
  const [nameEl, setNameEl] = useState<string | null>(null);
  const accent = SECTION_ACCENT.discover;

  useEffect(() => {
    // One-time sync of a deterministic, localStorage-informed value on
    // mount, see ClinicGame.tsx for the fuller rationale.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setNameEl(placeOfTheWeek().nameEl);
  }, []);

  if (!nameEl) {
    return (
      <Card tone={accent.tone} className="h-[74px] animate-pulse">
        <span className="sr-only">Φόρτωση…</span>
      </Card>
    );
  }

  return (
    <Link href="/discover">
      <Card tone={accent.tone} className="flex items-center gap-3">
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${accent.badge}`}>
          <NavIcon kind="discover" className="h-5 w-5" />
        </div>
        <div className="flex flex-1 flex-col items-start gap-1">
          <p className="text-sm text-ink/80">Η επιλογή της εβδομάδας</p>
          <p className="rounded-full bg-white/60 px-2 py-0.5 text-xs text-sky-deep">{nameEl}</p>
        </div>
      </Card>
    </Link>
  );
}

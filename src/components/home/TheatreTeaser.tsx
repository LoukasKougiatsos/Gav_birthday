"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { loadTheatreShows } from "@/lib/theatre";
import { Card } from "@/components/ui/Card";
import { NavIcon } from "@/components/icons/NavIcons";
import { SECTION_ACCENT } from "@/components/ui/accents";

interface TeaserState {
  count: number;
  premiereTitle: string | null;
}

export function TheatreTeaser() {
  const [state, setState] = useState<TeaserState | null>(null);
  const accent = SECTION_ACCENT.theatre;

  useEffect(() => {
    const shows = loadTheatreShows();
    // One-time sync of static content-file data on mount, see
    // ClinicGame.tsx for the fuller rationale.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setState({
      count: shows.length,
      premiereTitle: shows.find((s) => s.status === "premiere")?.title ?? null,
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
    <Link href="/theatre">
      <Card tone={accent.tone} className="flex items-center gap-3">
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${accent.badge}`}>
          <NavIcon kind="theatre" className="h-5 w-5" />
        </div>
        <div className="flex flex-1 flex-col items-start gap-1">
          <p className="text-sm text-ink/80">
            {state.premiereTitle ? `Πρεμιέρα: ${state.premiereTitle}` : "Τι παίζει στην Αθήνα"}
          </p>
          <p className="rounded-full bg-white/60 px-2 py-0.5 text-xs text-forest">{state.count} παραστάσεις</p>
        </div>
      </Card>
    </Link>
  );
}

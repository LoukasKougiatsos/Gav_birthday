"use client";

import { useEffect, useState } from "react";
import { allCases, loadProgress, GROUP_EL, type ClinicCase, type ClinicGroup } from "@/lib/clinic";
import { AnimalSprite } from "@/components/clinic/AnimalSprite";
import { Card } from "@/components/ui/Card";

const GROUP_ORDER: ClinicGroup[] = ["bird", "mammal", "reptile", "marine"];

interface SanctuaryState {
  cases: ClinicCase[];
  collected: Set<string>;
}

export function SanctuaryGrid() {
  const [state, setState] = useState<SanctuaryState | null>(null);

  useEffect(() => {
    // One-time sync from external state (localStorage) into React state on
    // mount - a single setState call, deferred to an effect so server-
    // rendered HTML and the client's first hydration pass match (see
    // ClinicGame.tsx for the fuller rationale).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setState({ cases: allCases(), collected: new Set(loadProgress().sanctuary) });
  }, []);

  if (!state) {
    return (
      <div className="mx-auto max-w-md px-4 py-8">
        <div className="h-64 animate-pulse rounded-3xl bg-sand" />
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-md flex-col gap-6 px-4 pt-4 pb-10">
      <div>
        <p className="font-display text-xl font-semibold text-clay">Το Καταφύγιο</p>
        <p className="text-sm text-ink/60">Ζώα που έχεις ταΐσει σωστά, τουλάχιστον μία φορά.</p>
      </div>

      {GROUP_ORDER.map((group) => {
        const groupCases = state.cases.filter((c) => c.group === group);
        if (groupCases.length === 0) return null;
        const collectedCount = groupCases.filter((c) => state.collected.has(c.id)).length;
        const complete = collectedCount === groupCases.length;

        return (
          <div key={group} className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <p className="font-display text-sm font-semibold text-forest">{GROUP_EL[group]}</p>
              <span
                className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${
                  complete ? "bg-sun text-honey" : "bg-sand text-ink/60"
                }`}
              >
                {complete && "🏅"} {collectedCount}/{groupCases.length}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {groupCases.map((c) => {
                const isCollected = state.collected.has(c.id);
                return (
                  <Card key={c.id} tone={isCollected ? "sage" : "plain"} className="flex flex-col items-center gap-1 p-2">
                    <div className={`h-16 w-16 ${isCollected ? "" : "opacity-35 grayscale"}`}>
                      <AnimalSprite caseId={c.id} />
                    </div>
                    <p className={`text-center text-[11px] leading-tight ${isCollected ? "text-forest" : "text-ink/40"}`}>
                      {c.speciesEl}
                    </p>
                  </Card>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

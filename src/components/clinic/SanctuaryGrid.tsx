"use client";

import { useEffect, useState } from "react";
import { allCases, loadProgress, GROUP_EL, type ClinicCase, type ClinicGroup } from "@/lib/clinic";
import { AnimalSprite } from "@/components/clinic/AnimalSprite";
import { CaseResolution } from "@/components/clinic/CaseResolution";
import { Card } from "@/components/ui/Card";

const GROUP_ORDER: ClinicGroup[] = ["bird", "mammal", "reptile", "marine"];

interface SanctuaryState {
  cases: ClinicCase[];
  collected: Set<string>;
}

export function SanctuaryGrid() {
  const [state, setState] = useState<SanctuaryState | null>(null);
  const [selected, setSelected] = useState<ClinicCase | null>(null);

  useEffect(() => {
    // One-time sync from external state (localStorage) into React state on
    // mount - a single setState call, deferred to an effect so server-
    // rendered HTML and the client's first hydration pass match (see
    // ClinicGame.tsx for the fuller rationale).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setState({ cases: allCases(), collected: new Set(loadProgress().sanctuary) });
  }, []);

  useEffect(() => {
    if (!selected) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelected(null);
    };
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [selected]);

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
                if (!isCollected) {
                  return (
                    <Card key={c.id} tone="plain" className="flex flex-col items-center gap-1 p-2">
                      <div className="flex h-16 w-16 items-center justify-center text-2xl text-ink/25">?</div>
                      <p className="text-center text-[11px] leading-tight text-ink/40">???</p>
                    </Card>
                  );
                }
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setSelected(c)}
                    aria-label={c.speciesEl}
                    className="rounded-sm text-left transition-transform active:scale-95"
                  >
                  <Card
                    tone={c.rare ? "sun" : "sage"}
                    className="relative flex h-full flex-col items-center gap-1 p-2"
                  >
                    {c.rare && (
                      <span aria-label="Σπάνιο ζώο" className="absolute top-1 right-1.5 text-xs">
                        ✨
                      </span>
                    )}
                    <div className="h-16 w-16">
                      <AnimalSprite caseId={c.id} />
                    </div>
                    <p className="text-center text-[11px] leading-tight text-forest">{c.speciesEl}</p>
                  </Card>
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}

      {selected && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={selected.speciesEl}
          className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 sm:items-center"
          onClick={() => setSelected(null)}
        >
          <div
            className="relative max-h-[85dvh] w-full max-w-md overflow-y-auto overscroll-contain px-4 pt-4 pb-[max(1rem,env(safe-area-inset-bottom))]"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setSelected(null)}
              aria-label="Κλείσιμο"
              className="absolute top-6 right-6 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-plate text-ink/70 shadow"
            >
              ✕
            </button>
            <CaseResolution clinicCase={selected} chosenFood="" correct />
          </div>
        </div>
      )}
    </div>
  );
}

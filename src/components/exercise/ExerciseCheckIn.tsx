"use client";

import { useEffect, useState } from "react";
import { dailySeed, seededPick } from "@/lib/seed";
import { todaysExercise, saveExerciseEntry, buffLevel } from "@/lib/exercise";
import { Card } from "@/components/ui/Card";
import { BuffAvatar } from "@/components/exercise/BuffAvatar";

const NO_RESPONSES_EL = [
  "Καμία πίεση, κοριτσάκι μου — αύριο είναι μια καινούρια μέρα.",
  "Εντάξει είναι. Καμιά φορά το σώμα θέλει απλώς ξεκούραση.",
  "Δεν χρειάζεται δικαιολογία. Το γράψαμε, προχωράμε.",
];

export function ExerciseCheckIn({ onAnswer }: { onAnswer?: (exercised: boolean) => void } = {}) {
  const [exercised, setExercised] = useState<boolean | null>(null);
  const [level, setLevel] = useState(1);
  const [pulse, setPulse] = useState(0);

  useEffect(() => {
    const existing = todaysExercise();
    // One-time sync from external state (localStorage) into React state on
    // mount, see ClinicGame.tsx for the fuller rationale.
    if (existing) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setExercised(existing.exercised);
      onAnswer?.(existing.exercised);
    }
    setLevel(buffLevel());
    // onAnswer is expected to be a stable callback from the parent - only re-run on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function answer(value: boolean) {
    setExercised(value);
    const all = saveExerciseEntry(value);
    setLevel(buffLevel(all));
    // The real stage only moves once a 3-day window closes, but saying
    // "Ναι" should feel like something happened right then - see BuffAvatar.
    if (value) setPulse((p) => p + 1);
    onAnswer?.(value);
  }

  const noLine = exercised === false ? seededPick(NO_RESPONSES_EL, dailySeed()) : null;

  return (
    <Card tone="clay" className="flex flex-col gap-3">
      <BuffAvatar level={level} pulse={pulse} className="aspect-[1984/2146] w-full" />

      <div className="flex flex-col gap-1 text-center">
        <p className="font-display text-sm font-semibold text-clay">Έκανες γυμναστική σήμερα;</p>
        <p className="text-xs text-ink/50">Μόνο για σένα, χωρίς σερί, χωρίς πίεση.</p>
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => answer(true)}
          className={`flex-1 rounded-2xl border px-3 py-2.5 text-sm font-medium transition-colors ${
            exercised === true ? "border-clay bg-white text-clay shadow-sm" : "border-transparent bg-white/50 text-ink/60"
          }`}
        >
          Ναι
        </button>
        <button
          type="button"
          onClick={() => answer(false)}
          className={`flex-1 rounded-2xl border px-3 py-2.5 text-sm font-medium transition-colors ${
            exercised === false ? "border-clay bg-white text-clay shadow-sm" : "border-transparent bg-white/50 text-ink/60"
          }`}
        >
          Όχι
        </button>
      </div>

      {exercised === true && (
        <p className="exercise-celebrate-pop text-center font-display text-lg font-bold text-clay">
          ΜΠΡΑΒΟ ΣΟΥ ΑΓΑΠΗ ΜΟΥ
        </p>
      )}
      {noLine && <p className="text-xs text-ink/50">{noLine}</p>}
    </Card>
  );
}

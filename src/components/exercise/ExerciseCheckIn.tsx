"use client";

import { useEffect, useState } from "react";
import { todaysExercise, saveExerciseEntry, buffLevel } from "@/lib/exercise";
import { SITE_CONFIG } from "@/config/site";
import { Card } from "@/components/ui/Card";
import { BuffAvatar } from "@/components/exercise/BuffAvatar";

/** No "Όχι" - silence already means "didn't exercise" (see buffLevel's
 * decay, which never distinguished an explicit no from no answer at all),
 * so there's nothing a second button would actually record. */
export function ExerciseCheckIn({ onAnswer }: { onAnswer?: (exercised: boolean) => void } = {}) {
  const [exercisedToday, setExercisedToday] = useState(false);
  const [level, setLevel] = useState(1);
  const [pulse, setPulse] = useState(0);

  useEffect(() => {
    const existing = todaysExercise();
    // One-time sync from external state (localStorage) into React state on
    // mount, see ClinicGame.tsx for the fuller rationale.
    if (existing?.exercised) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setExercisedToday(true);
      onAnswer?.(true);
    }
    setLevel(buffLevel());
    // onAnswer is expected to be a stable callback from the parent - only re-run on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function answerYes() {
    if (exercisedToday) return;
    setExercisedToday(true);
    const all = saveExerciseEntry(true);
    setLevel(buffLevel(all));
    setPulse((p) => p + 1);
    onAnswer?.(true);

    // Fire-and-forget "activity" ping - a missed notification isn't worth
    // blocking or retrying over, same spirit as storage.ts's background sync.
    const name = SITE_CONFIG.herName ?? "Κοριτσάκι μου";
    fetch("/api/push/notify-activity", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: `Η ${name} έκανε γυμναστική σήμερα! 💪`, url: "/exercise" }),
    }).catch(() => {});
  }

  return (
    <Card tone="clay" className="flex flex-col gap-3">
      <BuffAvatar level={level} pulse={pulse} className="aspect-[1984/2146] w-full" />

      <p className="text-center font-display text-sm font-semibold text-clay">Έκανες γυμναστική σήμερα;</p>

      {exercisedToday ? (
        <p className="exercise-celebrate-pop text-center font-display text-lg font-bold text-clay">
          ΜΠΡΑΒΟ ΣΟΥ ΑΓΑΠΗ ΜΟΥ
        </p>
      ) : (
        <button
          type="button"
          onClick={answerYes}
          className="rounded-2xl border border-clay bg-white px-3 py-2.5 text-sm font-medium text-clay shadow-sm"
        >
          Ναι
        </button>
      )}
    </Card>
  );
}

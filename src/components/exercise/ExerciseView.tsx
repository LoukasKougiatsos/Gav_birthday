"use client";

import { useState } from "react";
import { ExerciseCheckIn } from "@/components/exercise/ExerciseCheckIn";
import { ExerciseCalendar } from "@/components/exercise/ExerciseCalendar";

export function ExerciseView() {
  const [todayExercised, setTodayExercised] = useState<boolean | null>(null);

  return (
    <div className="mx-auto flex max-w-md flex-col gap-5 px-4 pt-4 pb-10">
      <div>
        <p className="font-display text-xl font-semibold text-clay">Γυμναστική</p>
      </div>

      <ExerciseCheckIn onAnswer={setTodayExercised} />
      <ExerciseCalendar refreshOn={todayExercised} />
    </div>
  );
}

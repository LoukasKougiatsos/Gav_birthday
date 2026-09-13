"use client";

import { useState } from "react";
import type { MoodOption } from "@/lib/mood";
import { MoodCheckIn } from "@/components/mind/MoodCheckIn";
import { MoodMap } from "@/components/mind/MoodMap";
import { Journal } from "@/components/mind/Journal";

export function MindView() {
  const [todayMood, setTodayMood] = useState<MoodOption | null>(null);

  return (
    <div className="mx-auto flex max-w-md flex-col gap-5 px-4 pt-4 pb-10">
      <div>
        <p className="font-display text-xl font-semibold text-clay">Ψυχή</p>
        <p className="text-sm text-ink/60">Μια ήσυχη γωνιά, μόνο για σένα.</p>
      </div>

      <MoodCheckIn onMoodChange={setTodayMood} />
      <MoodMap refreshOn={todayMood} />
      <Journal todayMood={todayMood} />
    </div>
  );
}

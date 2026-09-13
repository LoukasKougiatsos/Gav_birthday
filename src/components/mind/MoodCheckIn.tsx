"use client";

import { useEffect, useState } from "react";
import { dailySeed } from "@/lib/seed";
import {
  MOOD_OPTIONS,
  MOOD_LABEL_EL,
  MOOD_TAGS,
  todaysMood,
  saveMoodEntry,
  type MoodOption,
} from "@/lib/mood";
import { Card } from "@/components/ui/Card";
import { EncouragementAvatar } from "@/components/mind/EncouragementAvatar";

const MOOD_EMOJI: Record<MoodOption, string> = {
  rough: "🌧️",
  heavy: "☁️",
  okay: "⛅",
  good: "🌤️",
  bright: "☀️",
};

export function MoodCheckIn({ onMoodChange }: { onMoodChange?: (mood: MoodOption) => void }) {
  const [mood, setMood] = useState<MoodOption | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [savedOnce, setSavedOnce] = useState(false);

  useEffect(() => {
    async function init() {
      const existing = todaysMood();
      if (existing) {
        setMood(existing.mood);
        setTags(existing.tags);
        setSavedOnce(true);
        onMoodChange?.(existing.mood);
      }
    }
    init();
    // onMoodChange is expected to be a stable callback from the parent - only re-run on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function pickMood(next: MoodOption) {
    setMood(next);
    saveMoodEntry(next, tags, dailySeed());
    setSavedOnce(true);
    onMoodChange?.(next);
  }

  function toggleTag(tag: string) {
    const next = tags.includes(tag) ? tags.filter((t) => t !== tag) : [...tags, tag];
    setTags(next);
    if (mood) saveMoodEntry(mood, next, dailySeed());
  }

  return (
    <Card tone="lavender" className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <EncouragementAvatar className="h-16 w-16 shrink-0" />
        <div>
          <p className="font-display text-sm font-semibold text-clay">Πώς είναι η μέρα σου;</p>
          <p className="text-xs text-ink/50">Μόνο για σένα. Δεν κρατάμε σερί, δεν υπάρχει σωστή απάντηση.</p>
        </div>
      </div>

      <div className="flex justify-between gap-1.5">
        {MOOD_OPTIONS.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => pickMood(option)}
            className={`flex flex-1 flex-col items-center gap-1 rounded-2xl border px-1 py-2.5 text-xs transition-colors ${
              mood === option
                ? "border-lavender bg-white text-clay shadow-sm"
                : "border-transparent bg-white/50 text-ink/60"
            }`}
          >
            <span className="text-xl">{MOOD_EMOJI[option]}</span>
            <span>{MOOD_LABEL_EL[option]}</span>
          </button>
        ))}
      </div>

      {mood && (
        <div className="flex flex-col gap-1.5">
          <p className="text-xs text-ink/50">Θέλεις να προσθέσεις κάτι; (προαιρετικό)</p>
          <div className="flex flex-wrap gap-1.5">
            {MOOD_TAGS.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => toggleTag(tag)}
                className={`rounded-full px-3 py-1 text-xs transition-colors ${
                  tags.includes(tag) ? "bg-lavender text-white" : "bg-white/70 text-ink/60"
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      )}

      {savedOnce && <p className="text-xs text-ink/40">Καταγράφηκε για σήμερα. Μπορείς να το αλλάξεις όποτε θέλεις.</p>}
    </Card>
  );
}

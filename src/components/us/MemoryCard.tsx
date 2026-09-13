"use client";

import { useEffect, useState } from "react";
import {
  memoryOfTheDay,
  isTodaysMemoryDismissed,
  dismissTodaysMemory,
  reopenTodaysMemory,
  type Memory,
} from "@/lib/memories";
import { Card } from "@/components/ui/Card";

export function MemoryCard() {
  const [today, setToday] = useState<Memory | null | undefined>(undefined); // undefined = loading
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    async function init() {
      setToday(memoryOfTheDay());
      setDismissed(isTodaysMemoryDismissed());
    }
    init();
  }, []);

  function handleDismiss() {
    dismissTodaysMemory();
    setDismissed(true);
  }

  function handleReopen() {
    reopenTodaysMemory();
    setDismissed(false);
  }

  if (today === undefined) {
    return <div className="h-24 animate-pulse rounded-2xl bg-sand" />;
  }

  return (
    <div className="flex flex-col gap-2">
      {today && !dismissed && (
        <Card tone="blossom" className="flex flex-col gap-2">
          <p className="font-display text-sm font-semibold text-clay">Ανάμνηση της ημέρας</p>
          {today.image && (
            // eslint-disable-next-line @next/next/no-img-element -- static file under public/, arbitrary aspect ratio
            <img
              src={today.image}
              alt={today.title}
              className="max-h-72 w-full rounded-2xl bg-white/40 object-cover"
            />
          )}
          <p className="text-sm text-ink/80">{today.text}</p>
          <button
            type="button"
            onClick={handleDismiss}
            className="self-start rounded-full bg-white/70 px-3 py-1.5 text-xs font-medium text-clay"
          >
            Το είδα
          </button>
        </Card>
      )}

      {today && dismissed && (
        <button
          type="button"
          onClick={handleReopen}
          className="self-start rounded-full bg-blossom-tint px-3 py-1.5 text-xs font-medium text-clay"
        >
          Ξαναδές τη σημερινή ανάμνηση
        </button>
      )}

      {!today && (
        <Card tone="blossom">
          <p className="text-sm text-ink/60">Δεν υπάρχει ακόμα καμία ανάμνηση καταγεγραμμένη.</p>
        </Card>
      )}
    </div>
  );
}

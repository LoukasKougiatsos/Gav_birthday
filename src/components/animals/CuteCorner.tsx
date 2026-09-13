"use client";

import { useEffect, useState } from "react";
import { fetchCuteAnimal, type CuteAnimal } from "@/lib/animals";
import { dailySeed } from "@/lib/seed";
import { getItem, setItem } from "@/lib/storage";
import { Card } from "@/components/ui/Card";

type State = { status: "loading" } | { status: "ready"; animal: CuteAnimal } | { status: "error" };

interface CachedAnimal {
  date: string;
  animal: CuteAnimal;
}

export function CuteCorner() {
  const [state, setState] = useState<State>({ status: "loading" });

  useEffect(() => {
    const today = dailySeed();
    const cached = getItem<CachedAnimal | null>("cuteCorner", null);
    if (cached && cached.date === today) {
      setState({ status: "ready", animal: cached.animal });
      return;
    }

    fetchCuteAnimal()
      .then((animal) => {
        setItem<CachedAnimal>("cuteCorner", { date: today, animal });
        setState({ status: "ready", animal });
      })
      .catch(() => setState({ status: "error" }));
  }, []);

  return (
    <Card tone="blossom" className="flex flex-col gap-3">
      <p className="font-display text-sm font-semibold text-clay">Χαριτωμένη γωνιά</p>
      {state.status === "ready" && state.animal.isVideo && (
        <video
          src={state.animal.imageUrl}
          className="h-48 w-full rounded-2xl bg-white/40 object-contain"
          autoPlay
          muted
          loop
          playsInline
        />
      )}
      {state.status === "ready" && !state.animal.isVideo && (
        // eslint-disable-next-line @next/next/no-img-element -- external, unpredictable source domain
        <img
          src={state.animal.imageUrl}
          alt={state.animal.kind}
          className="h-48 w-full rounded-2xl bg-white/40 object-contain"
        />
      )}
      {state.status === "loading" && <div className="h-48 w-full animate-pulse rounded-2xl bg-white/60" />}
      {state.status === "error" && <p className="text-sm text-ink/50">Δεν φόρτωσε φωτογραφία αυτή τη στιγμή. Δοκίμασε ξανά σε λίγο.</p>}
    </Card>
  );
}

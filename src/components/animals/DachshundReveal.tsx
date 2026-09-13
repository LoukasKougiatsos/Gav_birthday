"use client";

import { useEffect, useState } from "react";
import { DachshundSprite } from "@/components/animals/DachshundSprite";
import { Card } from "@/components/ui/Card";

type State = { status: "loading" } | { status: "photo"; url: string } | { status: "fallback" };

/** Only ever rendered on the one day per week the seed lands on - see
 * isDachshundDayToday in lib/animals.ts. Tries a real photo from The Dog
 * API; any failure (missing key, network) falls back to the local
 * illustration so the ritual never breaks. */
export function DachshundReveal() {
  const [state, setState] = useState<State>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;
    fetch("/api/dachshund")
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data) => {
        if (!cancelled && data.imageUrl) setState({ status: "photo", url: data.imageUrl });
        else if (!cancelled) setState({ status: "fallback" });
      })
      .catch(() => {
        if (!cancelled) setState({ status: "fallback" });
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <Card tone="sun" className="flex flex-col items-center gap-3 overflow-hidden text-center">
      <div className="dachshund-enter h-32 w-full max-w-[220px]">
        {state.status === "photo" ? (
          // eslint-disable-next-line @next/next/no-img-element -- external, unpredictable Dog API domain
          <img src={state.url} alt="Dachshund" className="h-32 w-full rounded-2xl object-cover" />
        ) : (
          <DachshundSprite className="h-32 w-full" />
        )}
      </div>
      <p className="font-display text-sm font-medium text-honey">
        Ο λουκανικόσκυλος εμφανίστηκε. Επίσημα, η μέρα σώθηκε.
      </p>
    </Card>
  );
}

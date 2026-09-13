"use client";

import { useEffect, useState } from "react";
import { SITE_CONFIG } from "@/config/site";
import { dayMessage } from "@/lib/date";
import { Card } from "@/components/ui/Card";
import { SetupNotice } from "@/components/ui/SetupNotice";

function daysSince(isoDate: string): number {
  const start = new Date(isoDate + "T00:00:00");
  const now = new Date();
  const startLocal = new Date(start.getFullYear(), start.getMonth(), start.getDate());
  const nowLocal = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.round((nowLocal.getTime() - startLocal.getTime()) / 86400000);
}

export function DaysTogether() {
  const [days, setDays] = useState<number | null>(null);
  const anniversary = SITE_CONFIG.anniversaryDate;

  useEffect(() => {
    async function init() {
      if (anniversary) setDays(daysSince(anniversary));
    }
    init();
    // anniversary is a static config value for the lifetime of the page
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!anniversary) {
    return (
      <Card tone="blossom">
        <SetupNotice>
          όρισε το <code className="rounded bg-white/60 px-1 py-0.5">anniversaryDate</code> στο{" "}
          <code className="rounded bg-white/60 px-1 py-0.5">src/config/site.ts</code> για τον μετρητή
          ημερών.
        </SetupNotice>
      </Card>
    );
  }

  return (
    <Card tone="blossom" className="text-center">
      <p className="font-display text-3xl font-semibold text-clay">{days ?? "…"}</p>
      <p className="text-sm text-ink/60">{days === null ? "μέρες μαζί" : dayMessage(days)}</p>
    </Card>
  );
}

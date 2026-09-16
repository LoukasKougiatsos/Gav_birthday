"use client";

import { useEffect, useState } from "react";
import { hydrateFromServer } from "@/lib/storage";

/**
 * Wraps the whole app and blocks first render until hydrateFromServer()
 * resolves. Has to be this way round, not a layout-level effect running
 * alongside the page - React fires child effects before parent effects, so
 * a page component further down would otherwise read (stale/empty)
 * localStorage before this ever got a chance to pull her synced data down.
 *
 * A hung/slow request never blocks forever - races against a timeout and
 * renders with whatever's already local either way.
 */
const HYDRATE_TIMEOUT_MS = 3000;

export function SyncGate({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const timeout = new Promise<void>((resolve) => setTimeout(resolve, HYDRATE_TIMEOUT_MS));
    Promise.race([hydrateFromServer().catch(() => {}), timeout]).finally(() => {
      if (!cancelled) setReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!ready) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center">
        <p className="font-display text-sm text-ink/40">Φόρτωση…</p>
      </div>
    );
  }

  return <>{children}</>;
}

"use client";

import { useEffect, useState } from "react";
import { SITE_CONFIG } from "@/config/site";
import { fetchWeather, interpretWeatherCode, suggestActivity, type WeatherSnapshot } from "@/lib/weather";
import { dailySeed } from "@/lib/seed";
import { Card } from "@/components/ui/Card";
import { SetupNotice } from "@/components/ui/SetupNotice";
import { WeatherIcon } from "@/components/icons/WeatherIcons";

type State =
  | { status: "loading" }
  | { status: "error" }
  | { status: "ready"; data: WeatherSnapshot };

export function WeatherCard() {
  const coords = SITE_CONFIG.homeCoordinates;
  const [state, setState] = useState<State>({ status: "loading" });

  useEffect(() => {
    if (!coords) return;
    let cancelled = false;
    fetchWeather(coords.lat, coords.lon)
      .then((data) => {
        if (!cancelled) setState({ status: "ready", data });
      })
      .catch(() => {
        if (!cancelled) setState({ status: "error" });
      });
    return () => {
      cancelled = true;
    };
  }, [coords]);

  if (!coords) {
    return (
      <Card tone="sky">
        <SetupNotice>
          όρισε το <code className="rounded bg-white/60 px-1 py-0.5">homeCoordinates</code> στο{" "}
          <code className="rounded bg-white/60 px-1 py-0.5">src/config/site.ts</code> για να φαίνεται ο
          σημερινός καιρός.
        </SetupNotice>
      </Card>
    );
  }

  if (state.status === "loading") {
    return (
      <Card tone="sky">
        <p className="text-sm text-ink/50">Φόρτωση του καιρού…</p>
      </Card>
    );
  }

  if (state.status === "error") {
    return (
      <Card tone="sky">
        <p className="text-sm text-ink/50">Δεν μπόρεσα να φέρω τον καιρό. Δοκίμασε ξανά αργότερα.</p>
      </Card>
    );
  }

  const { current, today } = state.data;
  const meaning = interpretWeatherCode(current.weatherCode);
  const suggestion = suggestActivity(current.weatherCode, current.temperatureC, dailySeed());

  return (
    <Card tone="sky" className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-sky/25 text-sky-deep">
          <WeatherIcon kind={meaning.icon} className="h-7 w-7" />
        </div>
        <div>
          <p className="text-xl font-semibold text-ink">{Math.round(current.temperatureC)}°C</p>
          <p className="text-sm text-ink/60">
            {meaning.label} · ↑{Math.round(today.maxC)}° ↓{Math.round(today.minC)}°
          </p>
        </div>
      </div>
      <p className="rounded-xl bg-white/60 px-3 py-2 text-sm text-forest">{suggestion.message}</p>
    </Card>
  );
}

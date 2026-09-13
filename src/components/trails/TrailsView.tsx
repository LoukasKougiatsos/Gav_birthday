"use client";

import { useEffect, useState } from "react";
import { SITE_CONFIG } from "@/config/site";
import { PALETTE } from "@/design/tokens";
import { fetchAtticaTrails, featuredTrailsForWeek, loadDoneTrailIds, markTrailDone, type Trail } from "@/lib/trails";
import { fetchWeekendForecast, interpretWeatherCode, isHikingWeather, type DayForecast } from "@/lib/weather";
import { LeafletMap, type MapMarker, type MapPolyline } from "@/components/map/LeafletMap";
import { WeatherIcon } from "@/components/icons/WeatherIcons";
import { Card } from "@/components/ui/Card";
import { SetupNotice } from "@/components/ui/SetupNotice";

// Attica-wide bbox (Parnitha, Penteli, Hymettus and the coast), not just a
// tight radius around home - trails are worth a drive, unlike Discover's
// walkable-first places.
const ATTICA_BBOX = "37.6,23.0,38.4,24.1";

const DIFFICULTY_EL: Record<Trail["difficulty"], string> = { easy: "Εύκολο", medium: "Μέτριο", hard: "Δύσκολο" };
const DAY_NAME_EL = ["Κυριακή", "Δευτέρα", "Τρίτη", "Τετάρτη", "Πέμπτη", "Παρασκευή", "Σάββατο"];

interface LoadedState {
  trails: Trail[];
  featured: Trail[];
  doneIds: string[];
  weekend: DayForecast[] | null;
}

export function TrailsView() {
  const [state, setState] = useState<LoadedState | null>(null);
  const [error, setError] = useState(false);
  const coords = SITE_CONFIG.homeCoordinates;

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const [trails, weekend] = await Promise.all([
          fetchAtticaTrails(ATTICA_BBOX),
          coords ? fetchWeekendForecast(coords.lat, coords.lon) : Promise.resolve(null),
        ]);
        if (cancelled) return;
        const doneIds = loadDoneTrailIds();
        setState({ trails, featured: featuredTrailsForWeek(trails, doneIds), doneIds, weekend });
      } catch {
        if (!cancelled) setError(true);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
    // coords is a static config value for the lifetime of the page
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleMarkDone(id: string) {
    if (!state) return;
    const doneIds = markTrailDone(id);
    setState({ ...state, doneIds });
  }

  if (!coords) {
    return (
      <div className="mx-auto max-w-md px-4 py-8">
        <Card tone="sky">
          <SetupNotice>
            όρισε το <code className="rounded bg-white/60 px-1 py-0.5">homeCoordinates</code> στο{" "}
            <code className="rounded bg-white/60 px-1 py-0.5">src/config/site.ts</code> για να φαίνεται ο
            καιρός πεζοπορίας του Σαββατοκύριακου.
          </SetupNotice>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-md px-4 py-8">
        <Card tone="plain">
          <p className="text-sm text-ink/60">Δεν μπόρεσα να συνδεθώ με το OpenStreetMap για τα μονοπάτια. Δοκίμασε ξανά αργότερα.</p>
        </Card>
      </div>
    );
  }

  if (!state) {
    return (
      <div className="mx-auto max-w-md px-4 py-8">
        <div className="h-72 animate-pulse rounded-3xl bg-sand" />
      </div>
    );
  }

  const markers: MapMarker[] = state.featured.map((t, i) => ({
    id: t.id,
    lat: t.center.lat,
    lon: t.center.lon,
    label: t.name,
    color: [PALETTE.terracotta, PALETTE.sage, PALETTE.sky][i % 3],
  }));
  const polylines: MapPolyline[] = state.featured.flatMap((t, i) =>
    t.segments.map((seg, j) => ({
      id: `${t.id}-${j}`,
      points: seg.map((p) => [p.lat, p.lon] as [number, number]),
      color: [PALETTE.terracotta, PALETTE.sage, PALETTE.sky][i % 3],
    }))
  );

  return (
    <div className="mx-auto flex max-w-md flex-col gap-4 px-4 pt-4 pb-10">
      <div>
        <p className="font-display text-xl font-semibold text-clay">Μονοπάτια</p>
        <p className="text-sm text-ink/60">Τρία μονοπάτια της εβδομάδας, γύρω από την Αττική.</p>
      </div>

      {state.weekend && state.weekend.length > 0 && (
        <Card tone="sky" className="flex flex-col gap-2">
          <p className="text-sm font-medium text-sky-deep">Καιρός για πεζοπορία το Σαββατοκύριακο;</p>
          <div className="flex gap-3">
            {state.weekend.map((day) => {
              const meaning = interpretWeatherCode(day.weatherCode);
              const good = isHikingWeather(day);
              return (
                <div key={day.date} className="flex flex-1 items-center gap-2 rounded-xl bg-white/60 px-3 py-2">
                  <WeatherIcon kind={meaning.icon} className="h-6 w-6 text-sky-deep" />
                  <div>
                    <p className="text-xs font-medium text-ink">{DAY_NAME_EL[new Date(day.date).getDay()]}</p>
                    <p className={`text-xs ${good ? "text-forest" : "text-ink/50"}`}>
                      {Math.round(day.maxC)}° · {good ? "Καλή μέρα!" : "Όχι ιδανικά"}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {markers.length > 0 && (
        <LeafletMap
          center={[markers[0].lat, markers[0].lon]}
          zoom={10}
          markers={markers}
          polylines={polylines}
          heightClassName="h-64"
        />
      )}

      <div className="flex flex-col gap-3">
        {state.featured.length === 0 && (
          <Card tone="plain">
            <p className="text-sm text-ink/60">Δεν βρέθηκαν μονοπάτια αυτή την εβδομάδα.</p>
          </Card>
        )}
        {state.featured.map((trail, i) => (
          <Card key={trail.id} tone={i === 0 ? "terracotta" : i === 1 ? "sage" : "sky"} className="flex flex-col gap-2">
            {trail.photoUrl && (
              // eslint-disable-next-line @next/next/no-img-element -- external, unpredictable OSM/Wikimedia domain
              <img src={trail.photoUrl} alt={trail.name} className="h-32 w-full rounded-xl object-cover" />
            )}
            <div className="flex items-center justify-between">
              <p className="font-medium text-ink">{trail.name}</p>
              <span className="rounded-full bg-white/60 px-2 py-0.5 text-xs text-ink/70">
                {DIFFICULTY_EL[trail.difficulty]}
              </span>
            </div>
            <p className="text-xs text-ink/60">{trail.lengthKm.toFixed(1)} χλμ.</p>
            <button
              type="button"
              onClick={() => handleMarkDone(trail.id)}
              disabled={state.doneIds.includes(trail.id)}
              className="self-start rounded-full bg-white/70 px-3 py-1 text-xs font-medium text-clay disabled:opacity-50"
            >
              {state.doneIds.includes(trail.id) ? "Έγινε ✓" : "Το έκανα"}
            </button>
          </Card>
        ))}
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { SITE_CONFIG } from "@/config/site";
import { PALETTE } from "@/design/tokens";
import {
  placeOfTheWeek,
  categoryLabel,
  radiusLabel,
  type DiscoverPlace,
} from "@/lib/discover";
import { fetchWeather, interpretWeatherCode } from "@/lib/weather";
import { fetchPlaceThumbnail } from "@/lib/wikipedia";
import { isVisited, markVisited, unmarkVisited } from "@/lib/visitedPlaces";
import { LeafletMap, type MapMarker } from "@/components/map/LeafletMap";
import { Card } from "@/components/ui/Card";
import { SetupNotice } from "@/components/ui/SetupNotice";

interface LoadedState {
  place: DiscoverPlace;
  visited: boolean;
  weatherGood: boolean | null; // null = weather unavailable
  photoUrl: string | null;
}

export function DiscoverView() {
  const [state, setState] = useState<LoadedState | null>(null);
  const coords = SITE_CONFIG.homeCoordinates;

  useEffect(() => {
    const place = placeOfTheWeek();
    const visited = isVisited(place.id);

    // One-time sync of client-only state on mount, see ClinicGame.tsx for
    // the fuller rationale. Weather is fetched separately below since it's
    // async and shouldn't block showing the place itself.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setState({ place, visited, weatherGood: null, photoUrl: null });

    if (coords) {
      fetchWeather(coords.lat, coords.lon)
        .then((snapshot) => {
          const meaning = interpretWeatherCode(snapshot.current.weatherCode);
          setState((prev) => (prev ? { ...prev, weatherGood: meaning.outdoorFriendly } : prev));
        })
        .catch(() => {
          // weather is a nice-to-have cross-reference here, not required
        });
    }

    fetchPlaceThumbnail(place.nameEl, place.name)
      .then((photoUrl) => setState((prev) => (prev ? { ...prev, photoUrl } : prev)))
      .catch(() => {
        // no photo found is a normal, expected outcome for smaller places
      });
    // coords is a static config value for the lifetime of the page
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function toggleVisited() {
    if (!state) return;
    if (state.visited) {
      unmarkVisited(state.place.id);
      setState({ ...state, visited: false });
    } else {
      markVisited({ id: state.place.id, name: state.place.name, lat: state.place.lat, lon: state.place.lon, kind: "discover" });
      setState({ ...state, visited: true });
    }
  }

  if (!state) {
    return (
      <div className="mx-auto max-w-md px-4 py-8">
        <div className="h-64 animate-pulse rounded-3xl bg-sand" />
      </div>
    );
  }

  const { place } = state;

  const markers: MapMarker[] = [
    { id: place.id, lat: place.lat, lon: place.lon, label: place.nameEl, color: PALETTE.terracotta },
  ];

  let weatherNote: string | null = null;
  if (state.weatherGood !== null) {
    if (place.outdoor && !state.weatherGood) {
      weatherNote = "Ο καιρός σήμερα δεν είναι ιδανικός για εξωτερικό χώρο - ίσως το αφήσεις για άλλη μέρα αυτή την εβδομάδα.";
    } else if (place.outdoor && state.weatherGood) {
      weatherNote = "Καλός καιρός σήμερα - μια χαρά μέρα να πας.";
    }
  }

  return (
    <div className="mx-auto flex max-w-md flex-col gap-4 px-4 pt-4 pb-10">
      <div>
        <p className="font-display text-xl font-semibold text-clay">Ανακάλυψε</p>
        <p className="text-sm text-ink/60">Ένα νέο μέρος για φαγητό ή ποτό, κάθε εβδομάδα.</p>
      </div>

      {!coords && (
        <Card tone="sky">
          <SetupNotice>
            όρισε το <code className="rounded bg-white/60 px-1 py-0.5">homeCoordinates</code> στο{" "}
            <code className="rounded bg-white/60 px-1 py-0.5">src/config/site.ts</code> για τη σύγκριση με
            τον καιρό.
          </SetupNotice>
        </Card>
      )}

      <LeafletMap center={[place.lat, place.lon]} zoom={11} markers={markers} heightClassName="h-64" />

      <Card tone={state.visited ? "sage" : "terracotta"} className="flex flex-col gap-2">
        {state.photoUrl && (
          // eslint-disable-next-line @next/next/no-img-element -- external, unpredictable Wikimedia domain
          <img src={state.photoUrl} alt={place.name} className="h-40 w-full rounded-xl object-cover" />
        )}
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="font-display text-lg font-semibold text-clay">{place.nameEl}</p>
            <p className="text-sm text-ink/60">{place.name}</p>
          </div>
          <span className="shrink-0 rounded-full bg-white/60 px-2 py-1 text-xs text-ink/70">
            {categoryLabel(place.category)}
          </span>
        </div>
        <p className="text-xs text-honey/80">{radiusLabel(place.radius)}</p>
        <p className="text-sm text-ink/80">{place.description}</p>
        {weatherNote && <p className="rounded-xl bg-white/60 px-3 py-2 text-xs text-forest">{weatherNote}</p>}
        <button
          type="button"
          onClick={toggleVisited}
          className="self-start rounded-full bg-white/70 px-3 py-1.5 text-xs font-medium text-clay"
        >
          {state.visited ? "Ήμασταν εκεί ✓" : "Ήμασταν εκεί;"}
        </button>
      </Card>
    </div>
  );
}

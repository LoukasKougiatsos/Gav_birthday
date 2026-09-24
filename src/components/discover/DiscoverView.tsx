"use client";

import { useEffect, useRef, useState } from "react";
import { SITE_CONFIG } from "@/config/site";
import { searchPlaces, type PlaceSearchResult } from "@/lib/geocode";
import { PALETTE } from "@/design/tokens";
import {
  placeOfTheWeek,
  categoryLabel,
  radiusLabel,
  addCustomPlace,
  PLACE_CATEGORIES,
  type DiscoverPlace,
  type PlaceCategory,
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

const inputClass =
  "w-full rounded-xl border border-sand bg-white/70 px-3 py-2 text-sm text-ink focus:border-terracotta/50 focus:outline-none";

type GeoStatus = "idle" | "locating" | "done" | "error";

/** Collapsed by default - Discover's page is short and mostly about this
 * week's featured place, so an always-open form (unlike Plants' list view,
 * where it's the natural first thing) would crowd it out. */
function AddPlaceForm() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [category, setCategory] = useState<PlaceCategory>("restaurant");
  const [outdoor, setOutdoor] = useState(true);
  const [description, setDescription] = useState("");
  const [geoStatus, setGeoStatus] = useState<GeoStatus>("idle");
  const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(null);
  const [manualLat, setManualLat] = useState("");
  const [manualLon, setManualLon] = useState("");
  const [justAdded, setJustAdded] = useState(false);

  const [results, setResults] = useState<PlaceSearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const lastPickedNameRef = useRef<string | null>(null);

  // Live search-as-you-type on the name field, same debounce shape as
  // Plants' species search (PlantsView.tsx) - skips re-searching right
  // after a result is picked (name matches what was just picked) so
  // selecting one doesn't immediately reopen the list. Biases toward home
  // coordinates (or a live GPS fix once captured) so a common taverna name
  // doesn't surface a match on the other side of the country.
  useEffect(() => {
    if (name.trim().length < 2 || name === lastPickedNameRef.current) {
      setResults([]);
      return;
    }
    setSearching(true);
    const timeout = setTimeout(() => {
      searchPlaces(name.trim(), coords ?? SITE_CONFIG.homeCoordinates ?? undefined)
        .then(setResults)
        .catch(() => setResults([]))
        .finally(() => setSearching(false));
    }, 400);
    return () => clearTimeout(timeout);
    // coords only used as a search bias, not a dependency worth re-searching on
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name]);

  function pickResult(result: PlaceSearchResult) {
    lastPickedNameRef.current = result.name;
    setName(result.name);
    setCategory(result.categoryGuess);
    setCoords({ lat: result.lat, lon: result.lon });
    setGeoStatus("done");
    setResults([]);
  }

  function useMyLocation() {
    if (!("geolocation" in navigator)) {
      setGeoStatus("error");
      return;
    }
    setGeoStatus("locating");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lon: pos.coords.longitude });
        setGeoStatus("done");
      },
      () => setGeoStatus("error"),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  function resetForm() {
    lastPickedNameRef.current = null;
    setName("");
    setResults([]);
    setCategory("restaurant");
    setOutdoor(true);
    setDescription("");
    setGeoStatus("idle");
    setCoords(null);
    setManualLat("");
    setManualLon("");
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const lat = coords?.lat ?? Number(manualLat);
    const lon = coords?.lon ?? Number(manualLon);
    if (!name.trim() || !Number.isFinite(lat) || !Number.isFinite(lon)) return;

    addCustomPlace({ name, category, lat, lon, outdoor, description });
    resetForm();
    setOpen(false);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 4000);
  }

  if (!open) {
    return (
      <div className="flex flex-col gap-1">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="self-start rounded-full border border-dashed border-sand px-3 py-1.5 text-xs font-medium text-ink/60"
        >
          + Πρόσθεσε ένα μέρος
        </button>
        {justAdded && <p className="text-xs text-sage">Προστέθηκε! Θα εμφανιστεί στις προτάσεις κάποια εβδομάδα.</p>}
      </div>
    );
  }

  const hasCoords = coords !== null;

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 rounded-2xl border border-dashed border-sand p-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-ink/70">Πρόσθεσε ένα μέρος</p>
        <button type="button" onClick={() => setOpen(false)} className="text-xs text-ink/40 underline">
          Άκυρο
        </button>
      </div>

      <div className="relative flex flex-col gap-1.5">
        <input
          className={inputClass}
          placeholder="Αναζήτησε ένα μέρος…"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            setCoords(null);
            setGeoStatus("idle");
          }}
          autoComplete="off"
        />
        {searching && <p className="text-xs text-ink/40">Αναζήτηση…</p>}
        {results.length > 0 && (
          <div className="flex flex-col gap-1.5">
            {results.map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => pickResult(r)}
                className="flex flex-col items-start rounded-xl border border-sand bg-white/70 px-3 py-2 text-left text-sm hover:border-terracotta/40"
              >
                <span>{r.name}</span>
                {r.address && <span className="text-xs text-ink/50">{r.address}</span>}
              </button>
            ))}
          </div>
        )}
        {hasCoords ? (
          <p className="text-xs text-sage">📍 Συντεταγμένες βρέθηκαν.</p>
        ) : (
          name.trim().length >= 2 &&
          !searching &&
          results.length === 0 && <p className="text-xs text-ink/40">Δεν βρέθηκε - βάλε συντεταγμένες με το χέρι παρακάτω.</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2">
        <label className="flex flex-col gap-1">
          <span className="text-xs text-ink/50">Κατηγορία</span>
          <select className={inputClass} value={category} onChange={(e) => setCategory(e.target.value as PlaceCategory)}>
            {PLACE_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {categoryLabel(c)}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs text-ink/50">Έξω;</span>
          <select
            className={inputClass}
            value={outdoor ? "yes" : "no"}
            onChange={(e) => setOutdoor(e.target.value === "yes")}
          >
            <option value="yes">Ναι</option>
            <option value="no">Όχι</option>
          </select>
        </label>
      </div>

      <textarea
        className={`${inputClass} min-h-16`}
        placeholder="Σημείωση (προαιρετικό)"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />

      <div className="flex flex-col gap-2">
        <button
          type="button"
          onClick={useMyLocation}
          className="self-start rounded-xl border border-sand bg-white/70 px-3 py-2 text-sm text-ink"
        >
          {geoStatus === "locating" ? "Εντοπισμός…" : hasCoords ? "📍 Εντοπίστηκε" : "📍 Χρησιμοποίησε την τοποθεσία μου"}
        </button>
        {geoStatus === "error" && (
          <div className="grid grid-cols-2 gap-2">
            <p className="col-span-2 text-xs text-ink/50">
              Δεν μπόρεσα να βρω την τοποθεσία σου - βάλε τις συντεταγμένες με το χέρι.
            </p>
            <input
              className={inputClass}
              placeholder="Γεωγραφικό πλάτος"
              inputMode="decimal"
              value={manualLat}
              onChange={(e) => setManualLat(e.target.value)}
            />
            <input
              className={inputClass}
              placeholder="Γεωγραφικό μήκος"
              inputMode="decimal"
              value={manualLon}
              onChange={(e) => setManualLon(e.target.value)}
            />
          </div>
        )}
      </div>

      <button type="submit" className="self-start rounded-xl bg-terracotta px-4 py-2 text-sm text-paper">
        Προσθήκη
      </button>
    </form>
  );
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

      <AddPlaceForm />

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

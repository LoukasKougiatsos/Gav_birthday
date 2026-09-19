"use client";

import { useEffect, useRef, useState } from "react";
import { SITE_CONFIG } from "@/config/site";
import { fetchGardenWeatherWeek, type GardenWeatherWeek } from "@/lib/weather";
import {
  loadGarden,
  saveGardenPlant,
  deleteGardenPlant,
  waterNow,
  searchPlantSpecies,
  fetchPlantSpeciesDetail,
  computeWateringPlan,
  suggestWateringDays,
  STATUS_LABEL_EL,
  type GardenPlant,
  type PlantPlacement,
  type PlantSpeciesResult,
} from "@/lib/plants";
import { dailySeed } from "@/lib/seed";
import { Card } from "@/components/ui/Card";
import { SetupNotice } from "@/components/ui/SetupNotice";
import { WateringCalendar } from "@/components/plants/WateringCalendar";

const PLACEMENT_EL: Record<PlantPlacement, string> = { outdoor: "Έξω", indoor: "Μέσα", balcony: "Μπαλκόνι" };
const STATUS_TONE: Record<string, "sage" | "sun" | "terracotta"> = { fine: "sage", soon: "sun", thirsty: "terracotta" };

const inputClass =
  "w-full rounded-xl border border-sand bg-white/70 px-3 py-2 text-sm text-ink focus:border-terracotta/50 focus:outline-none";

function generateId(name: string): string {
  const slug = name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  return `plant-${slug || "unnamed"}-${Date.now()}`;
}

export function PlantsView() {
  const coords = SITE_CONFIG.homeCoordinates;
  const [garden, setGarden] = useState<GardenPlant[] | null>(null);
  const [weatherWeek, setWeatherWeek] = useState<GardenWeatherWeek | null>(null);

  const [results, setResults] = useState<PlantSpeciesResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [fetchingDetail, setFetchingDetail] = useState(false);
  const lastPickedNameRef = useRef<string | null>(null);

  const [name, setName] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [about, setAbout] = useState<string | null>(null);
  const [placement, setPlacement] = useState<PlantPlacement>("outdoor");
  const [baseIntervalDays, setBaseIntervalDays] = useState(7);
  const [note, setNote] = useState("");
  // False once a species is picked from a search result, so the days field
  // can be auto-filled; true the moment she types it herself (or nothing
  // matched), so we stop overwriting her value on placement changes.
  const [intervalIsManual, setIntervalIsManual] = useState(true);

  useEffect(() => {
    // One-time sync of client-only localStorage state on mount, see
    // ClinicGame.tsx for the fuller rationale.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setGarden(loadGarden());
    if (coords) {
      fetchGardenWeatherWeek(coords.lat, coords.lon)
        .then(setWeatherWeek)
        .catch(() => {
          // weather adjustment is an enhancement - the base interval still works without it
        });
    }
    // coords is a static config value for the lifetime of the page
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Live autocomplete on the "Όνομα φυτού" field itself, debounced - skips
  // re-searching right after a suggestion is picked (name matches what was
  // just picked) so selecting a result doesn't immediately reopen the list.
  useEffect(() => {
    if (name.trim().length < 2 || name === lastPickedNameRef.current) {
      setResults([]);
      return;
    }
    setSearching(true);
    const timeout = setTimeout(() => {
      searchPlantSpecies(name.trim())
        .then(setResults)
        .catch(() => setResults([]))
        .finally(() => setSearching(false));
    }, 400);
    return () => clearTimeout(timeout);
  }, [name]);

  // Picking a result fetches its real photo + a short description once,
  // right now - not kept live afterward, just saved onto the plant on
  // submit like anything else in the form.
  async function pickResult(result: PlantSpeciesResult) {
    lastPickedNameRef.current = result.title;
    setName(result.title);
    setResults([]);
    setImageUrl(result.thumbnailUrl);
    setAbout(null);
    setFetchingDetail(true);
    try {
      const detail = await fetchPlantSpeciesDetail(result.key);
      setImageUrl(detail.imageUrl ?? result.thumbnailUrl);
      setAbout(detail.about);
      const suggested = suggestWateringDays(result.title, detail.about ?? undefined, placement);
      if (suggested !== null) {
        setBaseIntervalDays(suggested);
        setIntervalIsManual(false);
      }
    } catch {
      // detail fetch failed - keep the low-res search thumbnail, no description
    } finally {
      setFetchingDetail(false);
    }
  }

  // Re-suggest when she changes where it's kept, since the interval is
  // placement-adjusted - but only while she hasn't typed her own number.
  function handlePlacementChange(next: PlantPlacement) {
    setPlacement(next);
    if (intervalIsManual) return;
    const suggested = suggestWateringDays(name, about ?? undefined, next);
    if (suggested !== null) setBaseIntervalDays(suggested);
  }

  function resetForm() {
    lastPickedNameRef.current = null;
    setName("");
    setImageUrl(null);
    setAbout(null);
    setPlacement("outdoor");
    setBaseIntervalDays(7);
    setIntervalIsManual(true);
    setNote("");
  }

  function handleAddPlant(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    const plant: GardenPlant = {
      id: generateId(name),
      name: name.trim(),
      imageUrl,
      about,
      placement,
      baseIntervalDays,
      lastWateredDate: dailySeed(),
      note: note.trim() || undefined,
    };
    setGarden(saveGardenPlant(plant));
    resetForm();
  }

  function handleWaterNow(id: string) {
    setGarden(waterNow(id));
  }

  function handleDelete(id: string) {
    setGarden(deleteGardenPlant(id));
  }

  if (!garden) {
    return (
      <div className="mx-auto max-w-md px-4 py-8">
        <div className="h-64 animate-pulse rounded-3xl bg-sand" />
      </div>
    );
  }

  const sorted = [...garden].sort(
    (a, b) => computeWateringPlan(a, weatherWeek).daysUntilNext - computeWateringPlan(b, weatherWeek).daysUntilNext
  );

  return (
    <div className="mx-auto flex max-w-md flex-col gap-5 px-4 pt-4 pb-10">
      <div>
        <p className="font-display text-xl font-semibold text-clay">Κήπος</p>
        <p className="text-sm text-ink/60">Τα φυτά μας, πότε θέλουν πότισμα.</p>
      </div>

      {!coords && (
        <Card tone="sky">
          <SetupNotice>
            όρισε το <code className="rounded bg-white/60 px-1 py-0.5">homeCoordinates</code> στο{" "}
            <code className="rounded bg-white/60 px-1 py-0.5">src/config/site.ts</code> για πότισμα
            προσαρμοσμένο στον καιρό.
          </SetupNotice>
        </Card>
      )}

      <form onSubmit={handleAddPlant} className="flex flex-col gap-3 rounded-2xl border border-dashed border-sand p-3">
        <p className="text-xs font-medium text-ink/70">Προσθήκη στον κήπο</p>
        <div className="relative flex flex-col gap-1.5">
          <input
            className={inputClass}
            placeholder="Όνομα φυτού"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="off"
          />
          {searching && <p className="text-xs text-ink/40">Αναζήτηση…</p>}
          {results.length > 0 && (
            <div className="flex flex-col gap-1.5">
              {results.slice(0, 6).map((r) => (
                <button
                  key={r.key}
                  type="button"
                  onClick={() => pickResult(r)}
                  className="flex items-center gap-2 rounded-xl border border-sand bg-white/70 px-3 py-2 text-left text-sm hover:border-terracotta/40"
                >
                  {r.thumbnailUrl && (
                    // eslint-disable-next-line @next/next/no-img-element -- external Wikimedia domain
                    <img src={r.thumbnailUrl} alt={r.title} className="h-10 w-10 shrink-0 rounded-lg object-cover" />
                  )}
                  <span>
                    {r.title}
                    {r.description && <span className="text-ink/50"> · {r.description}</span>}
                  </span>
                </button>
              ))}
            </div>
          )}
          {fetchingDetail && <p className="text-xs text-ink/40">Φόρτωση φωτογραφίας και πληροφοριών…</p>}
          {!fetchingDetail && (imageUrl || about) && (
            <div className="flex items-start gap-3 rounded-xl bg-white/60 p-2">
              {imageUrl && (
                // eslint-disable-next-line @next/next/no-img-element -- external Wikimedia domain
                <img src={imageUrl} alt="" className="h-14 w-14 shrink-0 rounded-xl object-cover" />
              )}
              {about && <p className="text-xs text-ink/60">{about}</p>}
            </div>
          )}
        </div>
        <div className="grid grid-cols-2 gap-2">
          <label className="flex flex-col gap-1">
            <span className="text-xs text-ink/50">Τοποθεσία</span>
            <select
              className={inputClass}
              value={placement}
              onChange={(e) => handlePlacementChange(e.target.value as PlantPlacement)}
            >
              <option value="outdoor">Έξω</option>
              <option value="indoor">Μέσα</option>
              <option value="balcony">Μπαλκόνι</option>
            </select>
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs text-ink/50">Κάθε πόσες μέρες ποτίζεται</span>
            <input
              type="number"
              min={1}
              className={inputClass}
              value={baseIntervalDays}
              onChange={(e) => {
                setIntervalIsManual(true);
                setBaseIntervalDays(Number(e.target.value) || 1);
              }}
              placeholder="Μέρες πότισμα"
            />
            {!intervalIsManual && <span className="text-[11px] text-forest">Προτεινόμενο για {name}</span>}
          </label>
        </div>
        <textarea
          className={`${inputClass} min-h-16`}
          placeholder="Σημείωση (προαιρετικό)"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
        <button type="submit" className="self-start rounded-xl bg-terracotta px-4 py-2 text-sm text-paper">
          Προσθήκη
        </button>
      </form>

      <WateringCalendar garden={garden} weatherWeek={weatherWeek} />

      <div className="flex flex-col gap-2">
        {sorted.length === 0 && (
          <Card tone="plain">
            <p className="text-sm text-ink/60">Δεν έχεις προσθέσει ακόμα φυτά.</p>
          </Card>
        )}
        {sorted.map((plant) => {
          const plan = computeWateringPlan(plant, weatherWeek);
          return (
            <Card key={plant.id} tone={STATUS_TONE[plan.status]} className="flex flex-col gap-2">
              <div className="flex items-start gap-3">
                {plant.imageUrl && (
                  // eslint-disable-next-line @next/next/no-img-element -- external Wikimedia domain
                  <img src={plant.imageUrl} alt={plant.name} className="h-14 w-14 shrink-0 rounded-xl object-cover" />
                )}
                <div className="flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-medium text-ink">{plant.name}</p>
                    <span className="shrink-0 rounded-full bg-white/60 px-2 py-0.5 text-xs text-ink/70">
                      {STATUS_LABEL_EL[plan.status]}
                    </span>
                  </div>
                  <p className="text-xs text-ink/50">{PLACEMENT_EL[plant.placement]}</p>
                </div>
              </div>
              {plant.about && <p className="text-xs text-ink/60">{plant.about}</p>}
              <p className="rounded-xl bg-white/60 px-3 py-2 text-xs text-forest">{plan.reasoning}</p>
              {plant.note && <p className="text-xs text-ink/60">{plant.note}</p>}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => handleWaterNow(plant.id)}
                  className="rounded-full bg-white/70 px-3 py-1.5 text-xs font-medium text-clay"
                >
                  Το πότισα σήμερα
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(plant.id)}
                  className="rounded-full bg-white/70 px-3 py-1.5 text-xs font-medium text-clay"
                >
                  Διαγραφή
                </button>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

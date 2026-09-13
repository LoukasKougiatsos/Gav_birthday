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
  computeWateringPlan,
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
  const lastPickedNameRef = useRef<string | null>(null);

  const [name, setName] = useState("");
  const [scientificName, setScientificName] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [placement, setPlacement] = useState<PlantPlacement>("outdoor");
  const [baseIntervalDays, setBaseIntervalDays] = useState(7);
  const [note, setNote] = useState("");

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

  function pickResult(result: PlantSpeciesResult) {
    lastPickedNameRef.current = result.commonName;
    setName(result.commonName);
    setScientificName(result.scientificName);
    setImageUrl(result.imageUrl);
    setResults([]);
  }

  function resetForm() {
    lastPickedNameRef.current = null;
    setName("");
    setScientificName("");
    setImageUrl(null);
    setPlacement("outdoor");
    setBaseIntervalDays(7);
    setNote("");
  }

  function handleAddPlant(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    const plant: GardenPlant = {
      id: generateId(name),
      name: name.trim(),
      scientificName: scientificName.trim() || undefined,
      imageUrl,
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
                  key={r.id}
                  type="button"
                  onClick={() => pickResult(r)}
                  className="flex items-center gap-2 rounded-xl border border-sand bg-white/70 px-3 py-2 text-left text-sm hover:border-terracotta/40"
                >
                  {r.imageUrl && (
                    // eslint-disable-next-line @next/next/no-img-element -- external Perenual/S3 domain
                    <img src={r.imageUrl} alt={r.commonName} className="h-10 w-10 shrink-0 rounded-lg object-cover" />
                  )}
                  <span>
                    {r.commonName}
                    {r.scientificName && <span className="text-ink/50"> · {r.scientificName}</span>}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="grid grid-cols-2 gap-2">
          <label className="flex flex-col gap-1">
            <span className="text-xs text-ink/50">Τοποθεσία</span>
            <select className={inputClass} value={placement} onChange={(e) => setPlacement(e.target.value as PlantPlacement)}>
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
              onChange={(e) => setBaseIntervalDays(Number(e.target.value) || 1)}
              placeholder="Μέρες πότισμα"
            />
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
                  // eslint-disable-next-line @next/next/no-img-element -- external Perenual/S3 domain
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

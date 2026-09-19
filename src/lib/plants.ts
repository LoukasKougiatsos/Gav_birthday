import { getItem, setItem } from "@/lib/storage";
import { dailySeed } from "@/lib/seed";
import { daysBetweenISO } from "@/lib/date";
import type { GardenWeatherWeek } from "@/lib/weather";
import { WATERING_DEFAULTS } from "@/content/wateringDefaults";

export interface PlantSpeciesResult {
  /** Wikipedia page title - pass back into fetchPlantSpeciesDetail to get
   * the full photo + description once she picks this result. */
  key: string;
  title: string;
  description: string | null;
  thumbnailUrl: string | null;
}

/** Autocomplete as she types the plant name - see the route's comment for
 * why this is Wikipedia rather than Perenual. */
export async function searchPlantSpecies(query: string): Promise<PlantSpeciesResult[]> {
  const res = await fetch(`/api/wikipedia/search?q=${encodeURIComponent(query)}`);
  if (!res.ok) throw new Error(`Species search failed: ${res.status}`);
  const data = await res.json();
  return data.results ?? [];
}

export interface PlantSpeciesDetail {
  imageUrl: string | null;
  about: string | null;
}

/** The real photo + a short description, fetched once when she picks a
 * search result - not kept live afterward, just saved onto the plant. */
export async function fetchPlantSpeciesDetail(key: string): Promise<PlantSpeciesDetail> {
  const res = await fetch(`/api/wikipedia/summary?key=${encodeURIComponent(key)}`);
  if (!res.ok) throw new Error(`Species detail failed: ${res.status}`);
  return res.json();
}

export type PlantPlacement = "outdoor" | "indoor" | "balcony";
export type WateringStatus = "fine" | "soon" | "thirsty";

export interface GardenPlant {
  id: string;
  name: string;
  imageUrl?: string | null;
  /** Short Wikipedia description, fetched once at add-time via
   * fetchPlantSpeciesDetail - not present if she typed a name that didn't
   * match a search result. */
  about?: string | null;
  placement: PlantPlacement;
  /** Base days between waterings. There's no reliable free API value for
   * this (see wateringDefaults.ts) so it's either the curated-table
   * suggestion or her own estimate, respected exactly as any other manual
   * override would be. */
  baseIntervalDays: number;
  lastWateredDate: string; // local YYYY-MM-DD
  note?: string;
  pruningMonths?: number[]; // 1-12
}

/** Outdoor plants dry faster (sun/wind), indoor slower - applied on top of
 * a type's typical (indoor) interval from WATERING_DEFAULTS. */
const PLACEMENT_INTERVAL_MULTIPLIER: Record<PlantPlacement, number> = {
  indoor: 1,
  balcony: 0.85,
  outdoor: 0.7,
};

/** Auto-fills baseIntervalDays from the species + where it's kept, so she
 * doesn't have to know or type it - null if the picked species doesn't
 * match anything in the curated table (see wateringDefaults.ts for why
 * there's no API for this), in which case the field is left as-is for her
 * to fill in herself. */
export function suggestWateringDays(
  name: string,
  extraText: string | undefined,
  placement: PlantPlacement
): number | null {
  const q = `${name} ${extraText ?? ""}`.toLowerCase();
  const entry = WATERING_DEFAULTS.find((d) => d.keywords.some((k) => q.includes(k)));
  if (!entry) return null;
  return Math.max(1, Math.round(entry.baseDays * PLACEMENT_INTERVAL_MULTIPLIER[placement]));
}

const GARDEN_KEY = "plants:garden";

export function loadGarden(): GardenPlant[] {
  return getItem<GardenPlant[]>(GARDEN_KEY, []);
}

export function saveGardenPlant(plant: GardenPlant): GardenPlant[] {
  const existing = loadGarden();
  const idx = existing.findIndex((p) => p.id === plant.id);
  const next = idx >= 0 ? existing.map((p, i) => (i === idx ? plant : p)) : [...existing, plant];
  setItem(GARDEN_KEY, next);
  return next;
}

export function deleteGardenPlant(id: string): GardenPlant[] {
  const next = loadGarden().filter((p) => p.id !== id);
  setItem(GARDEN_KEY, next);
  return next;
}

export function waterNow(id: string, today: string = dailySeed()): GardenPlant[] {
  const existing = loadGarden();
  const next = existing.map((p) => (p.id === id ? { ...p, lastWateredDate: today } : p));
  setItem(GARDEN_KEY, next);
  return next;
}

export interface WateringPlan {
  adjustedIntervalDays: number;
  daysUntilNext: number;
  status: WateringStatus;
  reasoning: string;
}

const RAIN_SCALE_MM = 20; // this much rain in the past week = the full +40% push
const ET0_BASELINE_MM = 25; // past week's ET0 above this starts pulling watering earlier
const ET0_SCALE_MM = 25; // this much *above* baseline = the full -40% pull
const MAX_ADJUSTMENT = 0.4;

function clamp01(n: number): number {
  return Math.max(0, Math.min(1, n));
}

/** The brief's rule, worked out in one function: recent rain pushes later,
 * high ET0 (hot/dry) pulls earlier, capped at ±40% either way. Placement
 * decides which effects even apply - indoor plants ignore rain entirely and
 * only feel heat gently; balcony plants get outdoor heat but indoor (no)
 * rain effect, since balcony plants are often at least partly covered. */
/** "κάθε μέρα" for 1, "κάθε N μέρες" otherwise. */
function everyPhrase(days: number): string {
  return days === 1 ? "κάθε μέρα" : `κάθε ${days} μέρες`;
}

function inDaysPhrase(days: number): string {
  if (days <= 0) return "τώρα";
  return days === 1 ? "σε 1 μέρα" : `σε ${days} μέρες`;
}

export function computeWateringPlan(plant: GardenPlant, week: GardenWeatherWeek | null, today: string = dailySeed()): WateringPlan {
  const daysSinceWatered = daysBetweenISO(plant.lastWateredDate, today);

  if (!week) {
    const daysUntilNext = plant.baseIntervalDays - daysSinceWatered;
    return {
      adjustedIntervalDays: plant.baseIntervalDays,
      daysUntilNext,
      status: statusFor(daysUntilNext),
      reasoning: `συνήθως ${everyPhrase(plant.baseIntervalDays)}`,
    };
  }

  const rainApplies = plant.placement === "outdoor";
  const heatApplies = plant.placement === "outdoor" || plant.placement === "balcony";
  const heatGentle = plant.placement === "indoor"; // gentle heat-only effect, per the brief

  const rainFactor = rainApplies ? clamp01(week.totalRainMm / RAIN_SCALE_MM) : 0;
  const et0Excess = Math.max(0, week.totalEt0Mm - ET0_BASELINE_MM);
  let et0Factor = heatApplies || heatGentle ? clamp01(et0Excess / ET0_SCALE_MM) : 0;
  if (heatGentle) et0Factor *= 0.5; // "adjust gently on heat only"

  const ratio = rainFactor * MAX_ADJUSTMENT - et0Factor * MAX_ADJUSTMENT;
  const adjustedIntervalDays = Math.round(plant.baseIntervalDays * (1 + ratio));
  const daysUntilNext = adjustedIntervalDays - daysSinceWatered;

  let weatherPhrase = "ο καιρός ήταν ήπιος τελευταία";
  if (rainFactor > 0.15 && et0Factor > 0.15) weatherPhrase = "είχε και βροχές και ζέστη τελευταία";
  else if (rainFactor > 0.15) weatherPhrase = "έβρεξε αρκετά τελευταία";
  else if (et0Factor > 0.15) weatherPhrase = "είχε ζέστη και ξηρασία τελευταία";

  const reasoning =
    ratio === 0
      ? `συνήθως ${everyPhrase(plant.baseIntervalDays)}`
      : `συνήθως ${everyPhrase(plant.baseIntervalDays)}, αλλά ${weatherPhrase}, οπότε: ${inDaysPhrase(daysUntilNext)}`;

  return { adjustedIntervalDays, daysUntilNext, status: statusFor(daysUntilNext), reasoning };
}

/** Projects a plant's upcoming watering dates within [rangeStart, rangeEnd]
 * by repeating its currently-adjusted interval forward from its last
 * watering - an estimate (the real weather adjustment will shift slightly
 * once she actually re-waters), good enough for a calendar overview. */
export function projectedWateringDates(
  plant: GardenPlant,
  week: GardenWeatherWeek | null,
  rangeStart: Date,
  rangeEnd: Date
): string[] {
  const plan = computeWateringPlan(plant, week);
  const interval = Math.max(1, plan.adjustedIntervalDays);
  const dates: string[] = [];

  const cursor = new Date(plant.lastWateredDate + "T00:00:00");
  cursor.setDate(cursor.getDate() + interval);
  while (cursor < rangeStart) {
    cursor.setDate(cursor.getDate() + interval);
  }
  while (cursor <= rangeEnd) {
    dates.push(dailySeed(cursor));
    cursor.setDate(cursor.getDate() + interval);
  }
  return dates;
}

function statusFor(daysUntilNext: number): WateringStatus {
  if (daysUntilNext <= 0) return "thirsty";
  if (daysUntilNext <= 1) return "soon";
  return "fine";
}

export const STATUS_LABEL_EL: Record<WateringStatus, string> = {
  fine: "Μια χαρά",
  soon: "Σύντομα",
  thirsty: "Διψάει",
};

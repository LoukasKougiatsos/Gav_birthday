/**
 * Open-Meteo is keyless and CORS-friendly, so per the project's architecture
 * rule ("keyless APIs may be fetched directly from the browser") this is
 * called straight from client components - no serverless route needed.
 *
 * Kept generic enough that Phase 4 (Plants' watering adjustment, which needs
 * daily precipitation_sum and et0_fao_evapotranspiration) can reuse it
 * without a redesign.
 */

import { seededPick } from "./seed";

export interface WeatherSnapshot {
  current: {
    temperatureC: number;
    weatherCode: number;
    isDay: boolean;
    windSpeedKmh: number;
    precipitationMm: number;
  };
  today: {
    maxC: number;
    minC: number;
    precipitationSumMm: number;
  };
}

export async function fetchWeather(lat: number, lon: number): Promise<WeatherSnapshot> {
  const url = new URL("https://api.open-meteo.com/v1/forecast");
  url.searchParams.set("latitude", String(lat));
  url.searchParams.set("longitude", String(lon));
  url.searchParams.set("current", "temperature_2m,weather_code,is_day,wind_speed_10m,precipitation");
  url.searchParams.set("daily", "temperature_2m_max,temperature_2m_min,precipitation_sum");
  url.searchParams.set("timezone", "auto");
  url.searchParams.set("forecast_days", "1");

  const res = await fetch(url.toString());
  if (!res.ok) {
    throw new Error(`Open-Meteo request failed: ${res.status}`);
  }
  const data = await res.json();

  return {
    current: {
      temperatureC: data.current.temperature_2m,
      weatherCode: data.current.weather_code,
      isDay: data.current.is_day === 1,
      windSpeedKmh: data.current.wind_speed_10m,
      precipitationMm: data.current.precipitation,
    },
    today: {
      maxC: data.daily.temperature_2m_max[0],
      minC: data.daily.temperature_2m_min[0],
      precipitationSumMm: data.daily.precipitation_sum[0],
    },
  };
}

export type WeatherIconKind = "sun" | "cloud-sun" | "cloud" | "fog" | "rain" | "storm" | "snow";

interface WeatherMeaning {
  label: string;
  icon: WeatherIconKind;
  outdoorFriendly: boolean;
}

/** WMO weather codes, as used by Open-Meteo. The labels are the Greek text
 * shown in the UI (WeatherCard). */
const WEATHER_CODES: Record<number, WeatherMeaning> = {
  0: { label: "Καθαρός ουρανός", icon: "sun", outdoorFriendly: true },
  1: { label: "Σχεδόν αίθριος", icon: "sun", outdoorFriendly: true },
  2: { label: "Λίγα σύννεφα", icon: "cloud-sun", outdoorFriendly: true },
  3: { label: "Συννεφιά", icon: "cloud", outdoorFriendly: true },
  45: { label: "Ομίχλη", icon: "fog", outdoorFriendly: false },
  48: { label: "Ομίχλη", icon: "fog", outdoorFriendly: false },
  51: { label: "Ψιλόβροχο", icon: "rain", outdoorFriendly: false },
  53: { label: "Ψιχάλες", icon: "rain", outdoorFriendly: false },
  55: { label: "Πυκνό ψιλόβροχο", icon: "rain", outdoorFriendly: false },
  56: { label: "Παγωμένο ψιλόβροχο", icon: "rain", outdoorFriendly: false },
  57: { label: "Παγωμένο ψιλόβροχο", icon: "rain", outdoorFriendly: false },
  61: { label: "Ελαφριά βροχή", icon: "rain", outdoorFriendly: false },
  63: { label: "Βροχή", icon: "rain", outdoorFriendly: false },
  65: { label: "Δυνατή βροχή", icon: "rain", outdoorFriendly: false },
  66: { label: "Παγωμένη βροχή", icon: "rain", outdoorFriendly: false },
  67: { label: "Παγωμένη βροχή", icon: "rain", outdoorFriendly: false },
  71: { label: "Ελαφρύ χιόνι", icon: "snow", outdoorFriendly: false },
  73: { label: "Χιόνι", icon: "snow", outdoorFriendly: false },
  75: { label: "Πυκνό χιόνι", icon: "snow", outdoorFriendly: false },
  77: { label: "Ψιλό χιόνι", icon: "snow", outdoorFriendly: false },
  80: { label: "Μπόρες", icon: "rain", outdoorFriendly: false },
  81: { label: "Μπόρες", icon: "rain", outdoorFriendly: false },
  82: { label: "Ισχυρές μπόρες", icon: "rain", outdoorFriendly: false },
  85: { label: "Μπόρες χιονιού", icon: "snow", outdoorFriendly: false },
  86: { label: "Μπόρες χιονιού", icon: "snow", outdoorFriendly: false },
  95: { label: "Καταιγίδα", icon: "storm", outdoorFriendly: false },
  96: { label: "Καταιγίδα με χαλάζι", icon: "storm", outdoorFriendly: false },
  99: { label: "Καταιγίδα με χαλάζι", icon: "storm", outdoorFriendly: false },
};

export function interpretWeatherCode(code: number): WeatherMeaning {
  return WEATHER_CODES[code] ?? { label: "Άστατος καιρός", icon: "cloud", outdoorFriendly: false };
}

const OUTDOOR_SUGGESTIONS = [
  "Ωραίος καιρός για μια βόλτα σήμερα.",
  "Λιακάδα και γλυκός καιρός — αξίζει να βγεις λίγο έξω.",
  "Καθαρός ουρανός. Καλή αφορμή για μια μικρή βόλτα ή έναν καφέ έξω.",
  "Ωραίο φως σήμερα. Αξίζει να βγεις, έστω και για λίγο.",
  "Σήμερα περπάτημα, κοριτσάκι μου.",
  "Αράγμα ταρατσούλα ή μπαλκόνι σήμερα;",
  "Καλός καιρός για σορτσάκια, δύσκολος για πρίγκιπες.",
];

const INDOOR_SUGGESTIONS = [
  "Δεν είναι μέρα για έξω. Καλή αφορμή για τσάι και βιβλίο.",
  "Γκρίζος ουρανός σήμερα — μέρα για ζεστασιά μέσα στο σπίτι.",
  "Έχει βροχή τριγύρω. Καλή μέρα να μαγειρέψεις κάτι ζεστό.",
  "Μια πιο ήσυχη μέρα, μέσα στο σπίτι.",
  "Να παιχτεί κανά τζάκι σήμερα;",
  "Έλα από εδώ, σου έχω κουβέρτες.",
];

/** "Not comfortable" because it's hot, not because the weather itself is bad
 * (dry/clear but over the comfortable-temperature ceiling) - the cozy
 * tea-and-blankets INDOOR_SUGGESTIONS read as a straight contradiction on a
 * 30°C clear day, so this gets its own pool instead of folding into indoor. */
const HOT_SUGGESTIONS = [
  "Έχει πολλή ζέστη σήμερα — σκιά, νερό, και τεμπελιά.",
  "Καύσωνας δείχνει. Ώρα για κλιματιστικό ή καμιά βουτιά.",
  "Πολλή ζέστη για βόλτα, ιδανικό όμως για παγωτό.",
  "Δρόσισε λίγο σήμερα, κοριτσάκι μου.",
  "Μέρα για σκιά και πολύ νερό, όχι για ήλιο.",
];

export interface ActivitySuggestion {
  type: "outdoor" | "indoor" | "hot";
  message: string;
}

/** Deterministic per-day suggestion, so it doesn't change on refresh. */
export function suggestActivity(
  weatherCode: number,
  temperatureC: number,
  seed: string
): ActivitySuggestion {
  const meaning = interpretWeatherCode(weatherCode);
  const tooHot = temperatureC > 28;
  const comfortable = !tooHot && temperatureC >= 10;

  if (meaning.outdoorFriendly && comfortable) {
    return { type: "outdoor", message: seededPick(OUTDOOR_SUGGESTIONS, seed) };
  }
  if (meaning.outdoorFriendly && tooHot) {
    return { type: "hot", message: seededPick(HOT_SUGGESTIONS, seed) };
  }
  return { type: "indoor", message: seededPick(INDOOR_SUGGESTIONS, seed) };
}

export interface GardenWeatherWeek {
  totalRainMm: number;
  totalEt0Mm: number;
}

/** The past week's rain and reference evapotranspiration totals, for
 * Plants' watering-interval adjustment. */
export async function fetchGardenWeatherWeek(lat: number, lon: number): Promise<GardenWeatherWeek> {
  const url = new URL("https://api.open-meteo.com/v1/forecast");
  url.searchParams.set("latitude", String(lat));
  url.searchParams.set("longitude", String(lon));
  url.searchParams.set("daily", "precipitation_sum,et0_fao_evapotranspiration");
  url.searchParams.set("timezone", "auto");
  url.searchParams.set("past_days", "7");
  url.searchParams.set("forecast_days", "1");

  const res = await fetch(url.toString());
  if (!res.ok) {
    throw new Error(`Open-Meteo request failed: ${res.status}`);
  }
  const data = await res.json();

  const sum = (arr: number[]) => arr.reduce((total: number, v: number) => total + (v ?? 0), 0);
  return {
    totalRainMm: sum(data.daily.precipitation_sum),
    totalEt0Mm: sum(data.daily.et0_fao_evapotranspiration),
  };
}

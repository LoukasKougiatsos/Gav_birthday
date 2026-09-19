import { NextRequest, NextResponse } from "next/server";
import { upstashCommand, upstashConfigured, SYNC_HASH_KEY } from "@/lib/upstash";
import { sendToRole } from "@/lib/push";
import { dailySeed } from "@/lib/seed";
import { computeWateringPlan, type GardenPlant } from "@/lib/plants";
import { fetchGardenWeatherWeek, type GardenWeatherWeek } from "@/lib/weather";
import { SITE_CONFIG } from "@/config/site";

/**
 * Hit once a day by a Vercel Cron Job (see vercel.json) - Vercel sends
 * "Authorization: Bearer $CRON_SECRET" automatically on cron-triggered
 * requests when that env var is set, which is what's checked below so
 * nobody else can trigger this. Deliberately excluded from src/proxy.ts's
 * site-password gate (a cron request carries no browser cookie, so the
 * gate would otherwise redirect it to /login before it ever got here) -
 * this route's own CRON_SECRET check is the real protection. Reads the
 * same synced data
 * src/lib/storage.ts mirrors to Redis (not localStorage - this runs
 * server-side, nothing to read from a browser) to see what's still
 * unanswered today, plus which garden plants are due for water, then
 * reminds every "reminder" subscriber.
 */

async function getSyncedField<T>(key: string, fallback: T): Promise<T> {
  if (!upstashConfigured()) return fallback;
  const raw = (await upstashCommand(["HGET", SYNC_HASH_KEY, key])) as string | null;
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (!process.env.CRON_SECRET || authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const today = dailySeed();

  const [exerciseEntries, moods, clinicProgress, garden] = await Promise.all([
    getSyncedField<Record<string, { exercised: boolean }>>("exercise:entries", {}),
    getSyncedField<Record<string, unknown>>("mind:moods", {}),
    getSyncedField<{ answeredDates?: Record<string, unknown> }>("clinic:progress", {}),
    getSyncedField<GardenPlant[]>("plants:garden", []),
  ]);

  const missing: string[] = [];
  if (!exerciseEntries[today]?.exercised) missing.push("γυμναστική");
  if (!moods[today]) missing.push("διάθεση");
  if (!clinicProgress.answeredDates?.[today]) missing.push("σημερινό περιστατικό στο ιατρείο");

  // Weather adjustment is an enhancement, same as the client - a plant's
  // own base interval still decides "thirsty" without it.
  let weatherWeek: GardenWeatherWeek | null = null;
  if (SITE_CONFIG.homeCoordinates) {
    try {
      weatherWeek = await fetchGardenWeatherWeek(SITE_CONFIG.homeCoordinates.lat, SITE_CONFIG.homeCoordinates.lon);
    } catch {
      // fall through with weatherWeek = null
    }
  }
  const thirstyPlants = garden.filter((p) => computeWateringPlan(p, weatherWeek, today).status === "thirsty");

  const sends: Promise<void>[] = [];

  if (missing.length > 0) {
    sends.push(
      sendToRole("reminder", {
        title: "Κοριτσάκι",
        body: `Δεν έχεις απαντήσει ακόμα σήμερα: ${missing.join(", ")}.`,
        url: "/",
      })
    );
  }

  // One notification per plant, not a bundled sentence, so the "Το πότισα"
  // action button on each unambiguously maps to that one plant.
  for (const plant of thirstyPlants) {
    sends.push(
      sendToRole("reminder", {
        title: "Κοριτσάκι 🌱",
        body: `Το ${plant.name} θέλει πότισμα.`,
        url: "/plants",
        plantId: plant.id,
        actions: [{ action: "watered", title: "Το πότισα" }],
      })
    );
  }

  if (sends.length === 0) {
    return NextResponse.json({ ok: true, sent: false, reason: "nothing unanswered and nothing thirsty" });
  }

  try {
    await Promise.all(sends);
    return NextResponse.json({
      ok: true,
      sent: true,
      missing,
      thirsty: thirstyPlants.map((p) => p.name),
    });
  } catch {
    return NextResponse.json({ error: "Reminder send failed." }, { status: 502 });
  }
}

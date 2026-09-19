import { NextRequest, NextResponse } from "next/server";
import { upstashCommand, upstashConfigured, SYNC_HASH_KEY } from "@/lib/upstash";
import { dailySeed } from "@/lib/seed";
import type { GardenPlant } from "@/lib/plants";

/**
 * Hit from the "Το πότισα" action button on a watering-due push notification
 * (see public/sw.js's notificationclick handler) - that fires from the
 * service worker with no open page, so there's no localStorage to update;
 * this writes straight to the same Redis hash src/lib/storage.ts mirrors,
 * same as any other sync write. A stale plantId (deleted since the
 * notification was sent) is a silent no-op rather than an error.
 */
export async function POST(request: NextRequest) {
  const { plantId } = await request.json().catch(() => ({ plantId: undefined }));
  if (!plantId || typeof plantId !== "string") {
    return NextResponse.json({ error: "Missing plantId" }, { status: 400 });
  }
  if (!upstashConfigured()) {
    return NextResponse.json({ error: "Sync not configured" }, { status: 503 });
  }

  const raw = (await upstashCommand(["HGET", SYNC_HASH_KEY, "plants:garden"])) as string | null;
  let garden: GardenPlant[] = [];
  try {
    garden = raw ? JSON.parse(raw) : [];
  } catch {
    garden = [];
  }

  const today = dailySeed();
  const next = garden.map((p) => (p.id === plantId ? { ...p, lastWateredDate: today } : p));
  await upstashCommand(["HSET", SYNC_HASH_KEY, "plants:garden", JSON.stringify(next)]);

  return NextResponse.json({ ok: true });
}

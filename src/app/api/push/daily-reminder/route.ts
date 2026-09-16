import { NextRequest, NextResponse } from "next/server";
import { upstashCommand, upstashConfigured, SYNC_HASH_KEY } from "@/lib/upstash";
import { sendToRole } from "@/lib/push";
import { dailySeed } from "@/lib/seed";

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
 * unanswered today, then reminds every "reminder" subscriber.
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

  const [exerciseEntries, moods, clinicProgress] = await Promise.all([
    getSyncedField<Record<string, { exercised: boolean }>>("exercise:entries", {}),
    getSyncedField<Record<string, unknown>>("mind:moods", {}),
    getSyncedField<{ answeredDates?: Record<string, unknown> }>("clinic:progress", {}),
  ]);

  const missing: string[] = [];
  if (!exerciseEntries[today]?.exercised) missing.push("γυμναστική");
  if (!moods[today]) missing.push("διάθεση");
  if (!clinicProgress.answeredDates?.[today]) missing.push("σημερινό περιστατικό στο ιατρείο");

  if (missing.length === 0) {
    return NextResponse.json({ ok: true, sent: false, reason: "already answered everything today" });
  }

  try {
    await sendToRole("reminder", {
      title: "Κοριτσάκι",
      body: `Δεν έχεις απαντήσει ακόμα σήμερα: ${missing.join(", ")}.`,
      url: "/",
    });
    return NextResponse.json({ ok: true, sent: true, missing });
  } catch {
    return NextResponse.json({ error: "Reminder send failed." }, { status: 502 });
  }
}

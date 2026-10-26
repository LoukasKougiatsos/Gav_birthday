import { NextRequest, NextResponse } from "next/server";
import { upstashCommand, upstashConfigured, SYNC_HASH_KEY as HASH_KEY } from "@/lib/upstash";
import { CLINIC_PROGRESS_KEY, mergeClinicProgress } from "@/lib/clinicProgressMerge";
import type { ClinicProgress } from "@/lib/clinic";

/**
 * Cross-device sync for everything src/lib/storage.ts keeps in localStorage
 * (mood, clinic progress, exercise log, garden, etc.) - one Redis hash, one
 * field per `km:`-prefixed key, so syncing one key can never clobber an
 * unrelated one. Already sits behind the site password: src/proxy.ts's
 * matcher only excludes /api/login, /login, and static assets, so every
 * request here already carries a valid km_auth cookie or it never arrives.
 */

export async function GET() {
  if (!upstashConfigured()) {
    return NextResponse.json({ error: "Sync isn't configured." }, { status: 501 });
  }
  try {
    // HGETALL comes back as a flat [field, value, field, value, ...] array
    // over Upstash's REST API, not a JSON object.
    const flat = (await upstashCommand(["HGETALL", HASH_KEY])) as string[];
    const entries: Record<string, unknown> = {};
    for (let i = 0; i < flat.length; i += 2) {
      try {
        entries[flat[i]] = JSON.parse(flat[i + 1]);
      } catch {
        // skip a corrupted field rather than fail the whole sync
      }
    }
    return NextResponse.json({ entries });
  } catch {
    return NextResponse.json({ error: "Sync fetch failed." }, { status: 502 });
  }
}

/** Clinic progress is merged into what's stored rather than overwriting it,
 * so a device with emptied localStorage can never wipe her sanctuary - see
 * mergeClinicProgress. Not atomic, but she's one person on one phone. */
async function mergeWithStoredClinicProgress(incoming: unknown): Promise<ClinicProgress> {
  const raw = (await upstashCommand(["HGET", HASH_KEY, CLINIC_PROGRESS_KEY])) as string | null;
  let stored: Partial<ClinicProgress> | null = null;
  try {
    stored = raw ? JSON.parse(raw) : null;
  } catch {
    // a corrupted stored value just means nothing to merge with
  }
  return mergeClinicProgress(stored, incoming as Partial<ClinicProgress>);
}

export async function POST(request: NextRequest) {
  if (!upstashConfigured()) {
    return NextResponse.json({ error: "Sync isn't configured." }, { status: 501 });
  }

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid body." }, { status: 400 });
  }

  // Single-key form ({ key, value }) for a normal setItem push, or a
  // one-time bulk seed ({ entries: { key: value, ... } }) for migrating a
  // phone that already has real localStorage history - see SyncGate.tsx.
  try {
    if ("entries" in body && body.entries && typeof body.entries === "object") {
      const entries = { ...(body.entries as Record<string, unknown>) };
      if (CLINIC_PROGRESS_KEY in entries) {
        entries[CLINIC_PROGRESS_KEY] = await mergeWithStoredClinicProgress(entries[CLINIC_PROGRESS_KEY]);
      }
      const fields = Object.entries(entries).flatMap(([k, v]) => [k, JSON.stringify(v)]);
      if (fields.length > 0) await upstashCommand(["HSET", HASH_KEY, ...fields]);
      return NextResponse.json({ ok: true });
    }

    const { key, value } = body as { key?: string; value?: unknown };
    if (typeof key !== "string" || !key) {
      return NextResponse.json({ error: "Missing key." }, { status: 400 });
    }
    const stored = key === CLINIC_PROGRESS_KEY ? await mergeWithStoredClinicProgress(value) : value;
    await upstashCommand(["HSET", HASH_KEY, key, JSON.stringify(stored)]);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Sync write failed." }, { status: 502 });
  }
}

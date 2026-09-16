import { NextRequest, NextResponse } from "next/server";

/**
 * Cross-device sync for everything src/lib/storage.ts keeps in localStorage
 * (mood, clinic progress, exercise log, garden, etc.) - one Redis hash, one
 * field per `km:`-prefixed key, so syncing one key can never clobber an
 * unrelated one. Already sits behind the site password: src/proxy.ts's
 * matcher only excludes /api/login, /login, and static assets, so every
 * request here already carries a valid km_auth cookie or it never arrives.
 *
 * No @upstash/redis dependency - Upstash's REST API is plain fetch + a
 * bearer token, same "call the external API directly" style as
 * src/lib/weather.ts, just with auth.
 */

const HASH_KEY = "km:sync:store";

function upstashConfigured(): boolean {
  return Boolean(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN);
}

async function upstashCommand(command: unknown[]): Promise<unknown> {
  const url = process.env.UPSTASH_REDIS_REST_URL!;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN!;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(command),
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`Upstash request failed: ${res.status}`);
  }
  const data = await res.json();
  return data.result;
}

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
      const entries = body.entries as Record<string, unknown>;
      const fields = Object.entries(entries).flatMap(([k, v]) => [k, JSON.stringify(v)]);
      if (fields.length > 0) await upstashCommand(["HSET", HASH_KEY, ...fields]);
      return NextResponse.json({ ok: true });
    }

    const { key, value } = body as { key?: string; value?: unknown };
    if (typeof key !== "string" || !key) {
      return NextResponse.json({ error: "Missing key." }, { status: 400 });
    }
    await upstashCommand(["HSET", HASH_KEY, key, JSON.stringify(value)]);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Sync write failed." }, { status: 502 });
  }
}

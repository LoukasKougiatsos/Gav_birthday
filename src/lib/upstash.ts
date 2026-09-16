/**
 * Shared low-level Upstash Redis REST client, used by both the cross-device
 * sync store (src/app/api/sync/route.ts, one hash) and push notification
 * subscriptions (src/lib/push.ts, two sets) - same database, different
 * keys. No @upstash/redis dependency - Upstash's REST API is plain fetch +
 * a bearer token, same "call the external API directly" style as
 * src/lib/weather.ts, just with auth. Server-only (reads process.env
 * directly), never import this from a client component.
 */

/** The one hash src/lib/storage.ts's sync layer reads/writes - shared here
 * so the daily-reminder cron route can check today's answers without
 * duplicating the key name. */
export const SYNC_HASH_KEY = "km:sync:store";

export function upstashConfigured(): boolean {
  return Boolean(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN);
}

export async function upstashCommand(command: unknown[]): Promise<unknown> {
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

import webpush from "web-push";
import { upstashCommand, upstashConfigured } from "@/lib/upstash";

/**
 * Server-only push sending + subscription storage. Two independent Redis
 * sets (not per-user data like the sync store - these are device push
 * endpoints, opted into separately per device):
 *  - "reminder": her device(s), nudged once a day if she hasn't checked in.
 *  - "activity": whoever wants to know when she does something (starting
 *    with Exercise - see ExerciseCheckIn.tsx).
 * Never import this from a client component - it touches VAPID_PRIVATE_KEY.
 */

export type PushRole = "reminder" | "activity";

function setKey(role: PushRole): string {
  return `push:${role}:subscriptions`;
}

function vapidConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY);
}

if (vapidConfigured()) {
  webpush.setVapidDetails(
    "mailto:noreply@koritsakimou.com",
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!
  );
}

export async function addSubscription(role: PushRole, subscription: webpush.PushSubscription): Promise<void> {
  if (!upstashConfigured()) return;
  await upstashCommand(["SADD", setKey(role), JSON.stringify(subscription)]);
}

export async function removeSubscription(role: PushRole, subscription: webpush.PushSubscription): Promise<void> {
  if (!upstashConfigured()) return;
  await upstashCommand(["SREM", setKey(role), JSON.stringify(subscription)]);
}

async function loadSubscriptions(role: PushRole): Promise<webpush.PushSubscription[]> {
  if (!upstashConfigured()) return [];
  const raw = (await upstashCommand(["SMEMBERS", setKey(role)])) as string[];
  const subs: webpush.PushSubscription[] = [];
  for (const s of raw) {
    try {
      subs.push(JSON.parse(s));
    } catch {
      // skip a corrupted entry rather than fail the whole send
    }
  }
  return subs;
}

export interface PushPayload {
  title: string;
  body: string;
  url?: string;
  /** Set together to render an actionable button (e.g. "Το πότισα") on the
   * notification itself - see public/sw.js's notificationclick handler,
   * which posts plantId to /api/plants/water when that action is tapped. */
  plantId?: string;
  actions?: { action: string; title: string }[];
}

/** Sends to every subscription registered for a role. A dead/expired
 * subscription (410 Gone, or 404 if the push service forgot it) is removed
 * so the set doesn't silently accumulate devices that can never receive
 * anything again. Never throws - a failed send is a nice-to-have miss, not
 * a reason to break whatever triggered it (an exercise save, a cron run). */
export async function sendToRole(role: PushRole, payload: PushPayload): Promise<void> {
  if (!vapidConfigured() || !upstashConfigured()) return;
  const subs = await loadSubscriptions(role);
  await Promise.all(
    subs.map(async (sub) => {
      try {
        await webpush.sendNotification(sub, JSON.stringify(payload));
      } catch (err) {
        const statusCode = (err as { statusCode?: number }).statusCode;
        if (statusCode === 404 || statusCode === 410) {
          await removeSubscription(role, sub).catch(() => {});
        }
      }
    })
  );
}

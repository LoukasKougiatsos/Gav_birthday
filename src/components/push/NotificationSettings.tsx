"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";

type PushRole = "reminder" | "activity";

/** Local-only, per-device flags - deliberately NOT going through
 * src/lib/storage.ts, since that mirrors to the shared server store and
 * these opt-ins must stay independent per device (her phone and his phone
 * can pick different roles), not sync to each other. */
const localKey = (role: PushRole) => `push-role-${role}`;

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; i++) outputArray[i] = rawData.charCodeAt(i);
  return outputArray;
}

type Support = "checking" | "unsupported" | "ios-needs-home-screen" | "ready";

export function NotificationSettings() {
  const [support, setSupport] = useState<Support>("checking");
  const [roles, setRoles] = useState<Record<PushRole, boolean>>({ reminder: false, activity: false });
  const [busy, setBusy] = useState<PushRole | null>(null);

  useEffect(() => {
    async function init() {
      const hasPushApi = "serviceWorker" in navigator && "PushManager" in window;
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      const isStandalone = window.matchMedia("(display-mode: standalone)").matches;

      // Unconfigured (no VAPID key deployed yet) degrades the same as every
      // other optional feature here - the card just doesn't render.
      if (!hasPushApi || !process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY) {
        setSupport("unsupported");
        return;
      }
      // iOS Safari only supports Web Push for a site added to the Home
      // Screen - the permission prompt silently fails otherwise, so this
      // has to be caught before ever trying, not after.
      if (isIOS && !isStandalone) {
        setSupport("ios-needs-home-screen");
        return;
      }

      await navigator.serviceWorker.register("/sw.js");
      setRoles({
        reminder: localStorage.getItem(localKey("reminder")) === "1",
        activity: localStorage.getItem(localKey("activity")) === "1",
      });
      setSupport("ready");
    }
    init().catch(() => setSupport("unsupported"));
  }, []);

  async function enableRole(role: PushRole) {
    setBusy(role);
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") return;

      const registration = await navigator.serviceWorker.ready;
      const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!publicKey) return;
      const subscription =
        (await registration.pushManager.getSubscription()) ??
        (await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(publicKey) as BufferSource,
        }));

      await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subscription: subscription.toJSON(), role }),
      });
      localStorage.setItem(localKey(role), "1");
      setRoles((r) => ({ ...r, [role]: true }));
    } finally {
      setBusy(null);
    }
  }

  async function disableRole(role: PushRole) {
    setBusy(role);
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      if (subscription) {
        await fetch("/api/push/subscribe", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ subscription: subscription.toJSON(), role }),
        });
      }
      localStorage.removeItem(localKey(role));
      setRoles((r) => ({ ...r, [role]: false }));
    } finally {
      setBusy(null);
    }
  }

  function toggle(role: PushRole) {
    if (roles[role]) disableRole(role);
    else enableRole(role);
  }

  if (support === "checking" || support === "unsupported") return null;

  if (support === "ios-needs-home-screen") {
    return (
      <Card tone="plain" className="flex flex-col gap-1">
        <p className="text-sm font-medium text-ink">Ειδοποιήσεις</p>
        <p className="text-xs text-ink/60">
          Για να λαμβάνεις ειδοποιήσεις στο iPhone, πρόσθεσε πρώτα τη σελίδα στην Αρχική Οθόνη: πάτα το εικονίδιο
          κοινοποίησης <span aria-hidden="true">⎋</span> και μετά «Προσθήκη στην Αρχική Οθόνη».
        </p>
      </Card>
    );
  }

  return (
    <Card tone="plain" className="flex flex-col gap-2">
      <p className="text-sm font-medium text-ink">Ειδοποιήσεις</p>
      <label className="flex items-center justify-between gap-2 text-sm text-ink/80">
        <span>Θέλω υπενθυμίσεις</span>
        <input
          type="checkbox"
          checked={roles.reminder}
          disabled={busy === "reminder"}
          onChange={() => toggle("reminder")}
          className="h-5 w-5 accent-terracotta"
        />
      </label>
      <label className="flex items-center justify-between gap-2 text-sm text-ink/80">
        <span>Θέλω να ξέρω πότε κάνει κάτι</span>
        <input
          type="checkbox"
          checked={roles.activity}
          disabled={busy === "activity"}
          onChange={() => toggle("activity")}
          className="h-5 w-5 accent-terracotta"
        />
      </label>
    </Card>
  );
}

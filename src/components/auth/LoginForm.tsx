"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Κάτι πήγε στραβά.");
      setSubmitting(false);
      return;
    }

    // Left `submitting` true on success on purpose - this component is about
    // to unmount once the redirect lands, so resetting it here just flips
    // the button back to normal for the second or two the navigation takes,
    // which reads as "nothing happened" rather than "loading".
    const next = searchParams.get("next") || "/";
    let seenWelcome = false;
    try {
      seenWelcome = localStorage.getItem("welcomeVideoSeen") === "1";
    } catch {
      // localStorage can throw in rare private-browsing configs - treat as unseen
    }
    router.replace(seenWelcome ? next : `/welcome?next=${encodeURIComponent(next)}`);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex w-full max-w-xs flex-col gap-3">
      <input
        type="password"
        inputMode="numeric"
        pattern="[0-9]*"
        maxLength={8}
        value={password}
        onChange={(e) => setPassword(e.target.value.replace(/\D/g, "").slice(0, 8))}
        placeholder="Κωδικός"
        autoFocus
        className="w-full rounded-xl border border-sand bg-white/70 px-3 py-2 text-center text-lg tracking-[0.5em] text-ink focus:border-terracotta/50 focus:outline-none"
      />
      {error && <p className="text-xs text-clay">{error}</p>}
      <button
        type="submit"
        disabled={submitting || !password}
        className="rounded-xl bg-terracotta px-4 py-2 text-sm font-medium text-paper disabled:opacity-50"
      >
        {submitting ? "…" : "Είσοδος"}
      </button>
    </form>
  );
}

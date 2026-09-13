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
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Κάτι πήγε στραβά.");
        return;
      }
      router.replace(searchParams.get("next") || "/");
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex w-full max-w-xs flex-col gap-3">
      <input
        type="password"
        inputMode="numeric"
        pattern="[0-9]*"
        maxLength={4}
        value={password}
        onChange={(e) => setPassword(e.target.value.replace(/\D/g, "").slice(0, 4))}
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

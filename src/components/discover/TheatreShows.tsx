"use client";

import { useState } from "react";
import { loadTheatreShows, theatreListUpdatedAt } from "@/lib/theatre";
import { Card } from "@/components/ui/Card";

const inputClass =
  "w-full rounded-xl border border-sand bg-white/70 px-3 py-2 text-sm text-ink focus:border-terracotta/50 focus:outline-none";

/** Curated weekly, not live - see src/lib/theatre.ts. A plain filterable
 * list rather than Discover's one-per-week reveal card: the point is
 * surfacing several premieres before they sell out, not hiding most of
 * them behind a weekly rotation. */
export function TheatreShows() {
  const [query, setQuery] = useState("");
  const shows = loadTheatreShows();
  const filtered = shows.filter(
    (s) =>
      s.title.toLowerCase().includes(query.toLowerCase()) || s.venue.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-baseline justify-between">
        <p className="font-display text-sm font-semibold text-clay">Θέατρο στην Αθήνα</p>
        <p className="text-[11px] text-ink/40">Ενημερώθηκε {theatreListUpdatedAt()}</p>
      </div>

      <input
        className={inputClass}
        placeholder="Αναζήτησε τίτλο ή θέατρο…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      <div className="flex flex-col gap-2">
        {filtered.length === 0 && <p className="text-sm text-ink/50">Δεν βρέθηκε τίποτα.</p>}
        {filtered.map((show) => (
          <Card key={show.id} tone="sky" className="flex flex-col gap-1.5">
            <div className="flex items-start justify-between gap-2">
              <p className="font-display text-sm font-semibold text-sky-deep">{show.title}</p>
              {show.status === "premiere" && (
                <span className="shrink-0 rounded-full bg-terracotta px-2 py-0.5 text-[10px] font-medium text-paper">
                  Κλείσε θέση νωρίς
                </span>
              )}
            </div>
            <p className="text-xs text-ink/60">{show.venue}</p>
            <p className="text-xs text-ink/70">{show.scheduleText}</p>
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs text-ink/50">
                {show.priceText} · {show.until}
              </p>
              {show.ticketUrl && (
                <a
                  href={show.ticketUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 rounded-full bg-white/70 px-3 py-1 text-xs font-medium text-sky-deep"
                >
                  Εισιτήρια
                </a>
              )}
            </div>
            {show.note && <p className="text-xs text-forest">{show.note}</p>}
          </Card>
        ))}
      </div>
    </div>
  );
}

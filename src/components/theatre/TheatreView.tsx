"use client";

import { useState } from "react";
import { loadTheatreShows, theatreListUpdatedAt } from "@/lib/theatre";
import { Card } from "@/components/ui/Card";

const inputClass =
  "w-full rounded-xl border border-sand bg-white/70 px-3 py-2 text-sm text-ink focus:border-terracotta/50 focus:outline-none";

/** Curated weekly by a scheduled agent, not live-scraped-on-request - see
 * src/lib/theatre.ts. A plain filterable list rather than Discover's
 * one-per-week reveal card: the point is surfacing several premieres
 * before they sell out, not hiding most of them behind a weekly rotation. */
export function TheatreView() {
  const [query, setQuery] = useState("");
  const shows = loadTheatreShows();
  const filtered = shows.filter(
    (s) =>
      s.title.toLowerCase().includes(query.toLowerCase()) || s.venue.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="mx-auto flex max-w-md flex-col gap-4 px-4 pt-4 pb-10">
      <div className="flex items-baseline justify-between">
        <div>
          <p className="font-display text-xl font-semibold text-clay">Θέατρο</p>
          <p className="text-sm text-ink/60">Τι παίζει στην Αθήνα, και τι αξίζει να κλείσεις νωρίς.</p>
        </div>
      </div>
      <p className="text-[11px] text-ink/40">Ενημερώθηκε {theatreListUpdatedAt()}</p>

      <input
        className={inputClass}
        placeholder="Αναζήτησε τίτλο ή θέατρο…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      <div className="flex flex-col gap-3">
        {filtered.length === 0 && <p className="text-sm text-ink/50">Δεν βρέθηκε τίποτα.</p>}
        {filtered.map((show) => (
          <Card key={show.id} tone="wine" className="flex flex-col gap-2">
            <div className="flex gap-3">
              <ShowPoster show={show} />
              <div className="flex min-w-0 flex-1 flex-col gap-1">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-display text-sm font-semibold text-wine">{show.title}</p>
                  {show.status === "premiere" && (
                    <span className="shrink-0 rounded-full bg-terracotta px-2 py-0.5 text-[10px] font-medium text-paper">
                      Κλείσε θέση νωρίς
                    </span>
                  )}
                </div>
                <p className="text-xs text-ink/60">{show.venue}</p>
                <p className="text-xs text-ink/70">{show.scheduleText}</p>
                <p className="text-xs text-ink/50">
                  {show.priceText} · {show.until}
                </p>
              </div>
            </div>
            {show.note && <p className="text-xs text-forest">{show.note}</p>}
            {show.ticketUrl && (
              <a
                href={show.ticketUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="self-start rounded-full bg-white/70 px-3 py-1.5 text-xs font-medium text-wine"
              >
                Εισιτήρια
              </a>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}

/** Not every show has a poster (a listing page doesn't always surface one),
 * and a hotlinked third-party image can fail independently of that - both
 * degrade to the same flat placeholder rather than a broken-image icon. */
function ShowPoster({ show }: { show: ReturnType<typeof loadTheatreShows>[number] }) {
  const [broken, setBroken] = useState(false);

  if (!show.posterUrl || broken) {
    return (
      <div className="flex h-20 w-16 shrink-0 items-center justify-center rounded-sm border border-ink/15 bg-white/50 text-[10px] text-ink/30">
        Χωρίς αφίσα
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element -- external athinorama.gr CDN, per-show URL
    <img
      src={show.posterUrl}
      alt=""
      referrerPolicy="no-referrer"
      onError={() => setBroken(true)}
      className="h-20 w-16 shrink-0 rounded-sm border border-ink/15 object-cover"
    />
  );
}

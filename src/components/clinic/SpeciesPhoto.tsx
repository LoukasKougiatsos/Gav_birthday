"use client";

import { useEffect, useState } from "react";

interface INatTaxon {
  default_photo?: { medium_url?: string; attribution?: string };
}

type PhotoResult = { speciesEn: string; photo: { url: string; attribution?: string } | null };

/** Real species photo for the post-answer info card only (never the game
 * scene itself). iNaturalist's taxa search is keyless and CORS-friendly, so
 * this is fetched straight from the browser per the project's API rules. */
export function SpeciesPhoto({ speciesEn }: { speciesEn: string }) {
  const [result, setResult] = useState<PhotoResult | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch(`https://api.inaturalist.org/v1/taxa?q=${encodeURIComponent(speciesEn)}&rank=species&per_page=1`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (cancelled) return;
        const taxon: INatTaxon | undefined = data?.results?.[0];
        const url = taxon?.default_photo?.medium_url;
        setResult({ speciesEn, photo: url ? { url, attribution: taxon?.default_photo?.attribution } : null });
      })
      .catch(() => {
        if (!cancelled) setResult({ speciesEn, photo: null });
      });
    return () => {
      cancelled = true;
    };
  }, [speciesEn]);

  // Ignore a stale result left over from the previous species while the new
  // fetch is still in flight.
  const photo = result?.speciesEn === speciesEn ? result.photo : undefined;

  if (photo === undefined) {
    return <div className="h-40 w-full animate-pulse rounded-xl bg-sand" />;
  }
  if (photo === null) {
    return null;
  }

  return (
    <figure className="overflow-hidden rounded-xl">
      {/* eslint-disable-next-line @next/next/no-img-element -- external, unpredictable iNaturalist domain */}
      <img src={photo.url} alt={speciesEn} className="h-40 w-full object-cover" />
      {photo.attribution && (
        <figcaption className="bg-ink/5 px-2 py-1 text-[10px] text-ink/50">{photo.attribution}</figcaption>
      )}
    </figure>
  );
}

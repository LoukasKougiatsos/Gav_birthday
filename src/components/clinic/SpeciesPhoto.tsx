"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import speciesPhotos from "@/content/speciesPhotos.json";

interface StoredPhoto {
  attribution: string;
}

/** Photos saved into the site by scripts/fetch-species-photo.mjs - one per
 * built-in case, added by the weekly species scout alongside the portrait. */
const STORED = speciesPhotos as Record<string, StoredPhoto>;

interface INatTaxon {
  default_photo?: { medium_url?: string; attribution?: string };
}

type PhotoResult = { speciesEn: string; photo: { url: string; attribution?: string } | null };

/** Real species photo for the info card only (never the game scene itself).
 * Built-in cases use the photo stored in /public/species-photos; cases she
 * adds herself have none, so those still look it up live on iNaturalist,
 * whose taxa search is keyless and CORS-friendly. */
export function SpeciesPhoto({ caseId, speciesEn }: { caseId: string; speciesEn: string }) {
  const stored = STORED[caseId];
  if (stored) {
    return (
      <figure className="overflow-hidden rounded-xl">
        <div className="relative h-40 w-full">
          <Image src={`/species-photos/${caseId}.jpg`} alt={speciesEn} fill sizes="(max-width: 480px) 100vw, 448px" className="object-cover" />
        </div>
        <figcaption className="bg-ink/5 px-2 py-1 text-[10px] text-ink/50">{stored.attribution}</figcaption>
      </figure>
    );
  }
  return <LiveSpeciesPhoto speciesEn={speciesEn} />;
}

function LiveSpeciesPhoto({ speciesEn }: { speciesEn: string }) {
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

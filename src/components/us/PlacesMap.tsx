"use client";

import { useEffect, useState } from "react";
import { SITE_CONFIG } from "@/config/site";
import { loadVisitedPlaces, type VisitedPlace } from "@/lib/visitedPlaces";
import { LeafletMap, type MapMarker } from "@/components/map/LeafletMap";
import { Card } from "@/components/ui/Card";
import { PALETTE } from "@/design/tokens";

const KIND_COLOR: Record<VisitedPlace["kind"], string> = {
  discover: PALETTE.sky,
  trail: PALETTE.forest,
};

export function PlacesMap() {
  const [places, setPlaces] = useState<VisitedPlace[] | null>(null);
  const coords = SITE_CONFIG.homeCoordinates;

  useEffect(() => {
    async function init() {
      setPlaces(loadVisitedPlaces());
    }
    init();
  }, []);

  if (!places) return <div className="h-64 animate-pulse rounded-3xl bg-sand" />;

  if (places.length === 0) {
    return (
      <Card tone="blossom">
        <p className="text-sm text-ink/60">
          Ακόμα κανένα μέρος - όταν σημειώνετε &quot;Ήμασταν εκεί&quot; στο Discover, θα εμφανίζεται εδώ.
        </p>
      </Card>
    );
  }

  const markers: MapMarker[] = places.map((p) => ({
    id: p.id,
    lat: p.lat,
    lon: p.lon,
    label: p.name,
    color: KIND_COLOR[p.kind],
    popupContent: (
      <div>
        <p className="font-medium">{p.name}</p>
        <p className="text-xs text-ink/50">{p.visitedDate}</p>
      </div>
    ),
  }));

  const center: [number, number] = coords
    ? [coords.lat, coords.lon]
    : [places[0].lat, places[0].lon];

  return (
    <div className="flex flex-col gap-2">
      <p className="font-display text-sm font-semibold text-clay">Μέρη που έχουμε πάει</p>
      <LeafletMap center={center} zoom={10} markers={markers} heightClassName="h-64" />
    </div>
  );
}

"use client";

import dynamic from "next/dynamic";
import type { MapMarker, MapPolyline } from "@/components/map/LeafletMapInner";

export type { MapMarker, MapPolyline };

// Leaflet touches `window` on import, so the real implementation can only
// ever run in the browser - dynamic + ssr:false here, inside a client
// component, is the supported way to do that in the App Router (using it
// directly in a Server Component is not allowed).
const LeafletMapInner = dynamic(() => import("@/components/map/LeafletMapInner"), {
  ssr: false,
  loading: () => <div className="h-72 w-full animate-pulse rounded-3xl bg-sand" />,
});

export function LeafletMap(props: {
  center: [number, number];
  zoom?: number;
  markers?: MapMarker[];
  polylines?: MapPolyline[];
  heightClassName?: string;
}) {
  return <LeafletMapInner {...props} />;
}

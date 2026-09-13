"use client";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import { PALETTE } from "@/design/tokens";

// PALETTE.ink (#20291f) as rgb, for the marker-dot drop shadow below -
// can't reference a hex token inside an rgba() alpha channel directly.
const INK_RGB = "32, 41, 31";

export interface MapMarker {
  id: string;
  lat: number;
  lon: number;
  label: string;
  /** Hex color for the marker dot - defaults to the terracotta accent. */
  color?: string;
  popupContent?: React.ReactNode;
}

export interface MapPolyline {
  id: string;
  points: [number, number][];
  color?: string;
}

function divIcon(color: string) {
  // A plain colored dot instead of Leaflet's default pin - sidesteps the
  // well-known marker-icon asset path breakage under bundlers, and matches
  // the site's flat design language better than the default blue pin.
  return L.divIcon({
    className: "",
    html: `<div style="width:16px;height:16px;border-radius:9999px;background:${color};border:2px solid ${PALETTE.paper};box-shadow:0 1px 3px rgba(${INK_RGB},0.4)"></div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
    popupAnchor: [0, -8],
  });
}

export default function LeafletMapInner({
  center,
  zoom = 12,
  markers = [],
  polylines = [],
  heightClassName = "h-72",
}: {
  center: [number, number];
  zoom?: number;
  markers?: MapMarker[];
  polylines?: MapPolyline[];
  heightClassName?: string;
}) {
  return (
    <div className={`isolate w-full overflow-hidden rounded-3xl border border-sand ${heightClassName}`}>
      <MapContainer center={center} zoom={zoom} className="h-full w-full" scrollWheelZoom={false}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {polylines.map((line) => (
          <Polyline key={line.id} positions={line.points} pathOptions={{ color: line.color ?? PALETTE.terracotta, weight: 4 }} />
        ))}
        {markers.map((marker) => (
          <Marker key={marker.id} position={[marker.lat, marker.lon]} icon={divIcon(marker.color ?? PALETTE.terracotta)}>
            <Popup>{marker.popupContent ?? marker.label}</Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}

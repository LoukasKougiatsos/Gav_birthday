"use client";

import { useEffect, useState, type CSSProperties } from "react";

import { SITE_CONFIG } from "@/config/site";
import { PALETTE } from "@/design/tokens";
import { fetchWeather, interpretWeatherCode, type WeatherIconKind } from "@/lib/weather";

/**
 * The living bits of the Clinic window: drifting clouds, the occasional bird,
 * and the real current weather in Argyroupoli (same Open-Meteo snapshot Home's
 * WeatherCard/WeatherEffect use). Everything here is drawn in the scene's
 * viewBox (0 0 480 249) and is meant to sit inside ClinicScene's
 * `clinic-window-pane` clip group, so nothing ever spills out of the glass.
 *
 * Motion lives in globals.css (`clinic-*` classes), transform/opacity only,
 * and stops under prefers-reduced-motion. Every animated element's resting
 * (non-animated) position is chosen so the reduced-motion still frame looks
 * right: clouds rest in view, the bird and precipitation rest outside the
 * pane.
 */

const OUTLINE = PALETTE.outline;

/** Inner edge of the pane, inset by half the pane's 3-unit stroke so tints
 * don't wash over the window's own outline. */
const PANE = { x: 13.5, y: 15.5, width: 101, height: 127 } as const;

export interface WindowWeather {
  icon: WeatherIconKind;
  isDay: boolean;
}

/** Current weather for the window, or null while loading / if it can't be
 * fetched (the window then shows the calm default daytime sky). */
export function useWindowWeather(): WindowWeather | null {
  const [weather, setWeather] = useState<WindowWeather | null>(null);

  useEffect(() => {
    const coords = SITE_CONFIG.homeCoordinates;
    if (!coords) return;
    let cancelled = false;
    fetchWeather(coords.lat, coords.lon)
      .then((snapshot) => {
        if (cancelled) return;
        setWeather({
          icon: interpretWeatherCode(snapshot.current.weatherCode).icon,
          isDay: snapshot.current.isDay,
        });
      })
      .catch(() => {
        // ambience only - no data just means the default sky
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return weather;
}

const isOvercast = (icon: WeatherIconKind | undefined) =>
  icon === "cloud" || icon === "rain" || icon === "storm" || icon === "snow" || icon === "fog";

/** Sky tint + clouds + bird: drawn behind the tree. */
export function WindowBackdrop({ weather }: { weather: WindowWeather | null }) {
  const icon = weather?.icon;
  const isDay = weather?.isDay ?? true;
  const overcast = isOvercast(icon);
  const clearNight = !isDay && (icon === "sun" || icon === "cloud-sun");
  const showBird = isDay && (!icon || icon === "sun" || icon === "cloud-sun" || icon === "cloud");

  let tint: { fill: string; opacity: number } | null = null;
  if (icon === "storm") tint = { fill: PALETTE.forest, opacity: 0.4 };
  else if (icon === "snow") tint = { fill: PALETTE.plate, opacity: 0.3 };
  else if (overcast) tint = { fill: PALETTE.sand, opacity: 0.38 };

  return (
    <>
      {tint && <rect {...PANE} fill={tint.fill} opacity={tint.opacity} />}
      {!clearNight && <Clouds overcast={overcast} />}
      {showBird && <Bird />}
    </>
  );
}

/** Night shade, fog veil, moon/stars and rain/snow: drawn in front of the
 * tree (rain falls in front of it, night darkens it too). */
export function WindowForeground({ weather }: { weather: WindowWeather | null }) {
  if (!weather) return null;
  const { icon, isDay } = weather;
  const clearNight = !isDay && (icon === "sun" || icon === "cloud-sun");

  return (
    <>
      {icon === "fog" && <rect {...PANE} fill={PALETTE.paper} opacity={0.45} />}
      {!isDay && <rect {...PANE} fill={OUTLINE} opacity={0.5} />}
      {clearNight && <NightSky />}
      {icon === "rain" && <Rain count={14} />}
      {icon === "storm" && (
        <>
          <Rain count={22} />
          {/* opacity attr keeps it invisible when the flash animation is off */}
          <rect {...PANE} fill={PALETTE.plate} opacity={0} className="weather-flash" />
        </>
      )}
      {icon === "snow" && <Snow />}
    </>
  );
}

/* ------------------------------------------------------------------ */

const CLOUD_PATH = "M4 12 C0 12 0 6 5 6 C5 1 13 0 15 4 C17 -1 26 0 26 6 C31 6 31 12 27 12 Z";

interface CloudSpec {
  x: number; // resting x (reduced-motion frame)
  y: number;
  scale: number;
  duration: number; // s
  delay: number; // s (negative = already mid-drift on load)
}

const FAIR_CLOUDS: CloudSpec[] = [
  { x: 22, y: 20, scale: 1, duration: 80, delay: -30 },
  { x: 70, y: 40, scale: 0.75, duration: 110, delay: -75 },
];

const OVERCAST_CLOUDS: CloudSpec[] = [
  { x: 16, y: 18, scale: 1.3, duration: 90, delay: -20 },
  { x: 62, y: 30, scale: 1.1, duration: 120, delay: -70 },
  { x: 36, y: 48, scale: 1.2, duration: 105, delay: -45 },
];

function Clouds({ overcast }: { overcast: boolean }) {
  const specs = overcast ? OVERCAST_CLOUDS : FAIR_CLOUDS;
  return (
    <>
      {specs.map((c, i) => {
        const width = 31 * c.scale;
        // drift from fully left of the pane to fully right of it, expressed
        // relative to the resting x (the inner translate is pre-scale)
        const from = (PANE.x - width - 4 - c.x) / c.scale;
        const to = (PANE.x + PANE.width + 4 - c.x) / c.scale;
        return (
          <g key={i} transform={`translate(${c.x} ${c.y}) scale(${c.scale})`}>
            <path
              d={CLOUD_PATH}
              className="clinic-cloud"
              fill={overcast ? PALETTE.sand : PALETTE.plate}
              stroke={OUTLINE}
              strokeWidth={2.5}
              strokeLinejoin="round"
              style={
                {
                  "--cloud-from": `${from}px`,
                  "--cloud-to": `${to}px`,
                  animationDuration: `${c.duration}s`,
                  animationDelay: `${c.delay}s`,
                } as CSSProperties
              }
            />
          </g>
        );
      })}
    </>
  );
}

/** A small songbird that crosses the glass once every ~29 s and is
 * offscreen (left of the pane) the rest of the time. */
function Bird() {
  return (
    <g transform="translate(-14 34) scale(0.8)">
      <g className="clinic-bird" style={{ animationDelay: "6s" }}>
        <path d="M2 1 L-3 -1 L-2 3 Z" fill={PALETTE.honey} stroke={OUTLINE} strokeWidth={1.4} strokeLinejoin="round" />
        <ellipse cx={5} cy={1} rx={5} ry={3.2} fill={PALETTE.blossom} stroke={OUTLINE} strokeWidth={1.6} />
        <circle cx={10} cy={-0.5} r={2.6} fill={PALETTE.blossom} stroke={OUTLINE} strokeWidth={1.6} />
        <path d="M12.4 -1.2 L15 -0.2 L12.4 0.6 Z" fill={PALETTE.sun} stroke={OUTLINE} strokeWidth={1} strokeLinejoin="round" />
        <path
          className="clinic-bird-wing"
          d="M3 0 C3 -5 7 -7 9 -6 C8 -3 7 -1 6 0 Z"
          fill={PALETTE.honey}
          stroke={OUTLINE}
          strokeWidth={1.4}
          strokeLinejoin="round"
        />
      </g>
    </g>
  );
}

const STARS = [
  { x: 24, y: 24, d: 3.1 },
  { x: 46, y: 36, d: 4.2 },
  { x: 34, y: 50, d: 2.7 },
  { x: 76, y: 22, d: 3.6 },
  { x: 80, y: 48, d: 4.6 },
];

function NightSky() {
  return (
    <>
      {STARS.map((s, i) => (
        <circle
          key={i}
          cx={s.x}
          cy={s.y}
          r={1.3}
          fill={PALETTE.plate}
          opacity={0.7}
          className="weather-star"
          style={{ animationDuration: `${s.d}s`, animationDelay: `${-i * 0.9}s` }}
        />
      ))}
      {/* crescent moon */}
      <path
        d="M101 24 A8 8 0 1 0 107 37 A6.5 6.5 0 1 1 101 24 Z"
        fill={PALETTE.plate}
        stroke={OUTLINE}
        strokeWidth={2}
        strokeLinejoin="round"
      />
    </>
  );
}

/** Deterministic 0..1 jitter, so particle layouts are stable across renders
 * without Math.random during render. */
const jitter = (i: number, salt: number) => {
  const v = Math.sin(i * 12.9898 + salt * 78.233) * 43758.5453;
  return v - Math.floor(v);
};

function Rain({ count }: { count: number }) {
  return (
    <g stroke={PALETTE.plate} strokeWidth={1.6} strokeLinecap="round" opacity={0.7}>
      {Array.from({ length: count }, (_, i) => {
        const x = PANE.x + 4 + ((i + jitter(i, 1)) / count) * (PANE.width + 4);
        const duration = 0.7 + jitter(i, 2) * 0.4;
        return (
          <line
            key={i}
            x1={x}
            y1={2}
            x2={x - 2}
            y2={11}
            className="clinic-rain"
            style={{ animationDuration: `${duration}s`, animationDelay: `${-jitter(i, 3) * duration}s` }}
          />
        );
      })}
    </g>
  );
}

function Snow() {
  const count = 16;
  return (
    <g fill={PALETTE.plate}>
      {Array.from({ length: count }, (_, i) => {
        const x = PANE.x + ((i + jitter(i, 4)) / count) * PANE.width;
        const duration = 7 + jitter(i, 5) * 5;
        return (
          <circle
            key={i}
            cx={x}
            cy={8}
            r={1.4 + jitter(i, 6) * 1.2}
            className="clinic-snow"
            style={{ animationDuration: `${duration}s`, animationDelay: `${-jitter(i, 7) * duration}s` }}
          />
        );
      })}
    </g>
  );
}

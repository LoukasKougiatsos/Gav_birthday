"use client";

import { useEffect, useState } from "react";
import { SITE_CONFIG } from "@/config/site";
import { greetingWord } from "@/lib/date";
import { SetupNotice } from "@/components/ui/SetupNotice";
import { PALETTE, TINTS } from "@/design/tokens";
import { fetchWeather, interpretWeatherCode, type WeatherIconKind } from "@/lib/weather";

type HeroMood = "sunny-day" | "sunny-night" | "overcast" | "wet";

/** `icon`/`isDay` start out null/true (see Greeting's initial state), which
 * already maps to "sunny-day" here - so a slow or failed fetch just leaves
 * the hero on its original look instead of needing a separate loading case. */
function moodFromWeather(icon: WeatherIconKind | null, isDay: boolean): HeroMood {
  if (icon === "rain" || icon === "storm" || icon === "snow") return "wet";
  if (icon === "sun") return isDay ? "sunny-day" : "sunny-night";
  if (icon === "cloud" || icon === "cloud-sun" || icon === "fog") return "overcast";
  return "sunny-day";
}

/**
 * The greeting is a small illustrated hero: a warm sky, a sun, rolling
 * Attica hills and a few flowers, all drawn from the shared palette. It's
 * the one deliberately saturated block on the page - everything below it
 * can stay in pale washes without the page reading as plain.
 *
 * The illustration itself tracks live weather (see Greeting below), but
 * "overcast" is a deliberate no-op: product wants cloud/fog days to look
 * exactly like a clear day here, so only sunny-night and wet get a
 * different sky/celestial-body treatment.
 */
function HeroLandscape({ mood }: { mood: HeroMood }) {
  const night = mood === "sunny-night";
  const wet = mood === "wet";

  return (
    <svg
      viewBox="0 0 400 150"
      className="absolute inset-0 h-full w-full"
      preserveAspectRatio="xMidYMax slice"
      aria-hidden="true"
    >
      {/* sky wash - literal palette hexes; CSS vars don't resolve inside
          SVG gradient stops in all browsers */}
      <defs>
        <linearGradient id="hero-sky" x1="0" y1="0" x2="0" y2="1">
          {night ? (
            <>
              <stop offset="0%" stopColor={PALETTE.sky} />
              <stop offset="55%" stopColor={PALETTE.skyDeep} />
              <stop offset="100%" stopColor={PALETTE.outline} />
            </>
          ) : wet ? (
            <>
              <stop offset="0%" stopColor={TINTS.sky} />
              <stop offset="55%" stopColor={TINTS.lavender} />
              <stop offset="100%" stopColor={TINTS.sky} />
            </>
          ) : (
            <>
              <stop offset="0%" stopColor={TINTS.sun} />
              <stop offset="55%" stopColor={TINTS.terracotta} />
              <stop offset="100%" stopColor={TINTS.blossom} />
            </>
          )}
        </linearGradient>
      </defs>
      <rect width="400" height="150" fill="url(#hero-sky)" />
      {/* wet's pale sky tints alone still read as "a bit sunny" under rain -
          one more wash of an existing token, not a new color, mutes them */}
      {wet && <rect width="400" height="150" fill={PALETTE.skyDeep} opacity="0.15" />}

      {/* sun / moon - hidden entirely when wet, since WeatherEffect already
          paints rain/snow/storm-flash on top and a bright disc underneath
          would fight it */}
      {!wet &&
        (night ? (
          <>
            <circle cx="330" cy="42" r="34" fill={TINTS.sun} opacity="0.2" />
            <circle cx="330" cy="42" r="24" fill={TINTS.sun} />
            {/* offset circle in the sky's own top tone "carves" a crescent -
                flat-illustration shorthand, no literal shading/gradient */}
            <circle cx="339" cy="35" r="21" fill={PALETTE.sky} />
          </>
        ) : (
          <>
            <circle cx="330" cy="42" r="26" fill={PALETTE.sun} />
            <circle cx="330" cy="42" r="34" fill={PALETTE.sun} opacity="0.25" />
          </>
        ))}

      {/* far hill */}
      <path
        d="M0 118 Q 90 84 190 108 T 400 100 V150 H0 Z"
        fill={PALETTE.sage}
        opacity={night ? 0.85 : 0.75}
      />
      {/* near hill */}
      <path
        d="M0 138 Q 120 106 240 130 T 400 126 V150 H0 Z"
        fill={PALETTE.forest}
        opacity={night ? 1 : 0.85}
      />

      {/* two little birds, up in the open sky left of the sun - daytime
          figures, so they're dropped rather than left invisible at night */}
      {!night && (
        <>
          <path
            d="M232 30 q 5 -6 10 0 q 5 -6 10 0"
            stroke={PALETTE.clay}
            strokeWidth="2.5"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M264 46 q 4 -5 8 0 q 4 -5 8 0"
            stroke={PALETTE.clay}
            strokeWidth="2"
            strokeLinecap="round"
            fill="none"
          />
        </>
      )}

      {/* flowers on the near hill */}
      <g strokeLinecap="round">
        <path d="M58 136 v-12" stroke={PALETTE.forest} strokeWidth="2.5" />
        <circle cx="58" cy="120" r="5" fill={PALETTE.terracotta} />
        <circle cx="58" cy="120" r="2" fill={PALETTE.sun} />
        <path d="M84 142 v-9" stroke={PALETTE.forest} strokeWidth="2.5" />
        <circle cx="84" cy="129" r="4" fill={PALETTE.blossom} />
        <circle cx="84" cy="129" r="1.7" fill={PALETTE.sun} />
        <path d="M36 144 v-7" stroke={PALETTE.forest} strokeWidth="2" />
        <circle cx="36" cy="133" r="3.4" fill={PALETTE.sun} />
      </g>
    </svg>
  );
}

export function Greeting() {
  const name = SITE_CONFIG.herName;
  const [icon, setIcon] = useState<WeatherIconKind | null>(null);
  const [isDay, setIsDay] = useState(true);

  useEffect(() => {
    async function init() {
      const coords = SITE_CONFIG.homeCoordinates;
      if (!coords) return;
      try {
        const snapshot = await fetchWeather(coords.lat, coords.lon);
        setIcon(interpretWeatherCode(snapshot.current.weatherCode).icon);
        setIsDay(snapshot.current.isDay);
      } catch {
        // the hero's default look is already the safe fallback - a failed
        // fetch just means it stays there instead of matching live weather
      }
    }
    init();
  }, []);

  const mood = moodFromWeather(icon, isDay);

  return (
    <div className="relative overflow-hidden rounded-b-3xl pb-12 shadow-sm">
      <HeroLandscape mood={mood} />
      <div className="relative px-5 pt-8 pb-2">
        <h1 className="font-display text-[1.7rem] leading-snug font-bold text-clay">
          {greetingWord()}
          {name ? "," : ""}
          {name && <span className="block text-terracotta">{name}</span>}
        </h1>
        {!name && (
          <SetupNotice>
            όρισε το <code className="rounded bg-white/60 px-1 py-0.5">herName</code> στο{" "}
            <code className="rounded bg-white/60 px-1 py-0.5">src/config/site.ts</code>.
          </SetupNotice>
        )}
      </div>
    </div>
  );
}

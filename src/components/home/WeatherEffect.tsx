"use client";

import { useEffect, useState } from "react";
import { SITE_CONFIG } from "@/config/site";
import { fetchWeather, interpretWeatherCode, type WeatherIconKind } from "@/lib/weather";

interface Particle {
  left: number; // vw
  duration: number; // s
  delay: number; // s
  size: number; // px
}

function makeParticles(count: number, durationRange: [number, number], sizeRange: [number, number]): Particle[] {
  return Array.from({ length: count }, () => ({
    left: Math.random() * 100,
    duration: durationRange[0] + Math.random() * (durationRange[1] - durationRange[0]),
    delay: Math.random() * durationRange[1],
    size: sizeRange[0] + Math.random() * (sizeRange[1] - sizeRange[0]),
  }));
}

/** Home's "what's it like outside right now" ambience - a light, purely
 * decorative overlay (pointer-events-none, sits behind the page content)
 * whose look follows the same weather code WeatherCard already fetches.
 * Renders nothing if coordinates aren't configured, the fetch fails, or the
 * visitor prefers reduced motion. */
export function WeatherEffect() {
  const coords = SITE_CONFIG.homeCoordinates;
  const [icon, setIcon] = useState<WeatherIconKind | null>(null);
  const [isDay, setIsDay] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    async function init() {
      setReducedMotion(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
      if (!coords) return;
      try {
        const snapshot = await fetchWeather(coords.lat, coords.lon);
        setIcon(interpretWeatherCode(snapshot.current.weatherCode).icon);
        setIsDay(snapshot.current.isDay);
      } catch {
        // ambience is a nice-to-have - no weather data just means no effect
      }
    }
    init();
    // coords is a static config value for the lifetime of the page
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!icon || reducedMotion) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
      {icon === "rain" && <RainLayer />}
      {icon === "storm" && (
        <>
          <RainLayer heavy />
          <div className="weather-flash absolute inset-0 bg-white" />
        </>
      )}
      {icon === "snow" && <SnowLayer />}
      {(icon === "cloud" || icon === "cloud-sun" || icon === "fog") && <CloudLayer faint={icon === "fog"} />}
      {icon === "sun" && (isDay ? <SunGlow /> : <MoonGlow />)}
    </div>
  );
}

function RainLayer({ heavy = false }: { heavy?: boolean }) {
  const [drops] = useState(() => makeParticles(heavy ? 55 : 35, [0.5, 1.1], [1, 2]));
  return (
    <>
      {drops.map((d, i) => (
        <div
          key={i}
          className="weather-drop absolute top-0 rounded-full bg-sky-deep/40"
          style={{
            left: `${d.left}vw`,
            width: d.size,
            height: d.size * 14,
            animationDuration: `${d.duration}s`,
            animationDelay: `${d.delay}s`,
          }}
        />
      ))}
    </>
  );
}

function SnowLayer() {
  const [flakes] = useState(() => makeParticles(35, [6, 12], [3, 6]));
  return (
    <>
      {flakes.map((f, i) => (
        <div
          key={i}
          className="weather-flake absolute top-0 rounded-full bg-white/80"
          style={{
            left: `${f.left}vw`,
            width: f.size,
            height: f.size,
            animationDuration: `${f.duration}s`,
            animationDelay: `${f.delay}s`,
          }}
        />
      ))}
    </>
  );
}

function CloudLayer({ faint = false }: { faint?: boolean }) {
  const [clouds] = useState(() =>
    Array.from({ length: 4 }, (_, i) => ({
      top: 5 + i * 12 + Math.random() * 8,
      duration: 50 + Math.random() * 40,
      delay: -Math.random() * 60,
      scale: 0.7 + Math.random() * 0.6,
    }))
  );
  return (
    <>
      {clouds.map((c, i) => (
        <div
          key={i}
          className="weather-cloud absolute rounded-full bg-white blur-2xl"
          style={{
            top: `${c.top}vh`,
            width: 220 * c.scale,
            height: 70 * c.scale,
            opacity: faint ? 0.25 : 0.35,
            animationDuration: `${c.duration}s`,
            animationDelay: `${c.delay}s`,
          }}
        />
      ))}
    </>
  );
}

function SunGlow() {
  return (
    <div
      className="weather-glow absolute -right-16 -top-16 h-64 w-64 rounded-full bg-sun blur-3xl"
      style={{ animationDuration: "5s" }}
    />
  );
}

/** Clear-but-not-daytime (pre-dawn/dusk per Open-Meteo's isDay flag) - a
 * cool-toned glow rather than literal stars, since low-opacity white dots
 * are invisible against this site's light paper background. */
function MoonGlow() {
  return (
    <div
      className="weather-glow absolute -left-16 -top-16 h-64 w-64 rounded-full bg-sky/70 blur-3xl"
      style={{ animationDuration: "6s" }}
    />
  );
}

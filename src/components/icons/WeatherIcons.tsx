import { ICON_VIEWBOX, STROKE } from "@/design/tokens";
import type { WeatherIconKind } from "@/lib/weather";

const shared = {
  viewBox: ICON_VIEWBOX,
  fill: "none" as const,
  stroke: "currentColor",
  strokeWidth: STROKE.icon,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

type Props = { className?: string };

function Sun({ className }: Props) {
  return (
    <svg {...shared} className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="4.2" />
      <path d="M12 3v2.2M12 18.8V21M4.9 4.9l1.6 1.6M17.5 17.5l1.6 1.6M3 12h2.2M18.8 12H21M4.9 19.1l1.6-1.6M17.5 6.5l1.6-1.6" />
    </svg>
  );
}

function CloudSun({ className }: Props) {
  return (
    <svg {...shared} className={className} aria-hidden="true">
      <circle cx="8" cy="7.5" r="2.8" />
      <path d="M8 3.3v1.2M4.6 5l.9.9M12.5 5l-.9.9" />
      <path d="M6 20h10.5a3.5 3.5 0 0 0 .5-6.96A5 5 0 0 0 7.3 11.2 4 4 0 0 0 6 20Z" />
    </svg>
  );
}

function Cloud({ className }: Props) {
  return (
    <svg {...shared} className={className} aria-hidden="true">
      <path d="M6.5 19h11a3.8 3.8 0 0 0 .5-7.56A5.5 5.5 0 0 0 7.6 10.3 4.3 4.3 0 0 0 6.5 19Z" />
    </svg>
  );
}

function Fog({ className }: Props) {
  return (
    <svg {...shared} className={className} aria-hidden="true">
      <path d="M6.5 14.5h11a3.3 3.3 0 0 0 .3-6.6A5 5 0 0 0 8.2 6.8 3.8 3.8 0 0 0 6.5 14.5Z" />
      <path d="M4 18h16M6 21h12" />
    </svg>
  );
}

function Rain({ className }: Props) {
  return (
    <svg {...shared} className={className} aria-hidden="true">
      <path d="M6.5 13.5h11a3.5 3.5 0 0 0 .3-6.98A5 5 0 0 0 7.6 5.8 4 4 0 0 0 6.5 13.5Z" />
      <path d="M8.5 17 7 20.5M12.5 17 11 20.5M16.5 17 15 20.5" />
    </svg>
  );
}

function Storm({ className }: Props) {
  return (
    <svg {...shared} className={className} aria-hidden="true">
      <path d="M6.5 12.5h11a3.5 3.5 0 0 0 .3-6.98A5 5 0 0 0 7.6 4.8 4 4 0 0 0 6.5 12.5Z" />
      <path d="M13 12.5 10 17h3l-2 4.5" />
    </svg>
  );
}

function Snow({ className }: Props) {
  return (
    <svg {...shared} className={className} aria-hidden="true">
      <path d="M6.5 13.5h11a3.5 3.5 0 0 0 .3-6.98A5 5 0 0 0 7.6 5.8 4 4 0 0 0 6.5 13.5Z" />
      <path d="M8 17v4M8 17.5l-1.7 1M8 17.5l1.7 1M8 20.5l-1.7-1M8 20.5l1.7-1" />
      <path d="M16 17v4M16 17.5l-1.7 1M16 17.5l1.7 1M16 20.5l-1.7-1M16 20.5l1.7-1" />
    </svg>
  );
}

const GLYPHS: Record<WeatherIconKind, (props: Props) => React.ReactElement> = {
  sun: Sun,
  "cloud-sun": CloudSun,
  cloud: Cloud,
  fog: Fog,
  rain: Rain,
  storm: Storm,
  snow: Snow,
};

export function WeatherIcon({ kind, className }: { kind: WeatherIconKind; className?: string }) {
  const Glyph = GLYPHS[kind];
  return <Glyph className={className} />;
}

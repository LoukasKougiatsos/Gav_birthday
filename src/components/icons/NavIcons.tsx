import { ICON_VIEWBOX, STROKE } from "@/design/tokens";

export type IconKind =
  | "home"
  | "clinic"
  | "animals"
  | "plants"
  | "kitchen"
  | "trails"
  | "discover"
  | "mind"
  | "us";

type IconProps = { className?: string };

const shared = {
  viewBox: ICON_VIEWBOX,
  fill: "none" as const,
  stroke: "currentColor",
  strokeWidth: STROKE.icon,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

function HomeGlyph({ className }: IconProps) {
  return (
    <svg {...shared} className={className} aria-hidden="true">
      <path d="M3 11.5 12 4l9 7.5" />
      <path d="M5.5 10v9a1 1 0 0 0 1 1H10v-6h4v6h3.5a1 1 0 0 0 1-1v-9" />
    </svg>
  );
}

function ClinicGlyph({ className }: IconProps) {
  return (
    <svg {...shared} className={className} aria-hidden="true">
      <circle cx="8.2" cy="8" r="1.6" />
      <circle cx="12" cy="6.3" r="1.6" />
      <circle cx="15.8" cy="8" r="1.6" />
      <path d="M9 13.5c0-1.8 1.4-3 3-3s3 1.2 3 3-1.4 3.5-3 3.5-3-1.7-3-3.5Z" />
      <path d="M12 20v-3" />
    </svg>
  );
}

function AnimalsGlyph({ className }: IconProps) {
  return (
    <svg {...shared} className={className} aria-hidden="true">
      <circle cx="8" cy="10" r="3.2" />
      <circle cx="16" cy="10" r="3.2" />
      <path d="M8 6.5V5M16 6.5V5" />
      <path d="M4.8 13.5c1 2.4 2.8 5 3.2 5.5M19.2 13.5c-1 2.4-2.8 5-3.2 5.5" />
    </svg>
  );
}

function PlantsGlyph({ className }: IconProps) {
  return (
    <svg {...shared} className={className} aria-hidden="true">
      <path d="M12 20V10" />
      <path d="M12 12C12 7 8 5 4 5c0 5 3 8 8 7Z" />
      <path d="M12 10c0-4 3-6 8-6 0 4.5-2.5 7-8 7" />
    </svg>
  );
}

function KitchenGlyph({ className }: IconProps) {
  return (
    <svg {...shared} className={className} aria-hidden="true">
      <path d="M5 11h14v2a6 6 0 0 1-6 6h-2a6 6 0 0 1-6-6v-2Z" />
      <path d="M4 11h16" />
      <path d="M8 8.5C8 6.5 9 5 9 5M12 8.5C12 6 13 4.5 13 4.5M16 8.5c0-2 1-3.5 1-3.5" />
    </svg>
  );
}

function TrailsGlyph({ className }: IconProps) {
  return (
    <svg {...shared} className={className} aria-hidden="true">
      <path d="M3 19 9.5 6l3 5.5L15 8l6 11" />
      <path d="M11 19h2" />
      <circle cx="17.5" cy="5.5" r="1.4" />
    </svg>
  );
}

function DiscoverGlyph({ className }: IconProps) {
  return (
    <svg {...shared} className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="8.5" />
      <path d="M15 9l-2 5-5 2 2-5 5-2Z" />
    </svg>
  );
}

function MindGlyph({ className }: IconProps) {
  return (
    <svg {...shared} className={className} aria-hidden="true">
      <path d="M6.5 14.5a4 4 0 0 1 0-8 4.5 4.5 0 0 1 8.7-1.4A3.8 3.8 0 0 1 17.5 13a3.5 3.5 0 0 1-.4 1.5" />
      <path d="M6.5 14.5h11" />
      <path d="M9 18h6" />
    </svg>
  );
}

function UsGlyph({ className }: IconProps) {
  return (
    <svg {...shared} className={className} aria-hidden="true">
      <path d="M9.2 19c-3.2-2.2-6-4.8-6-8a4 4 0 0 1 7-2.6A4 4 0 0 1 17 10c0 3.2-2.8 5.8-6 8l-.9.6-.9-.6Z" />
      <path d="M13 6a3.6 3.6 0 0 1 5-3 3.6 3.6 0 0 1 1 5.6" />
    </svg>
  );
}

const GLYPHS: Record<IconKind, (props: IconProps) => React.ReactElement> = {
  home: HomeGlyph,
  clinic: ClinicGlyph,
  animals: AnimalsGlyph,
  plants: PlantsGlyph,
  kitchen: KitchenGlyph,
  trails: TrailsGlyph,
  discover: DiscoverGlyph,
  mind: MindGlyph,
  us: UsGlyph,
};

export function NavIcon({ kind, className }: { kind: IconKind; className?: string }) {
  const Glyph = GLYPHS[kind];
  return <Glyph className={className} />;
}

import { SITE_CONFIG } from "@/config/site";
import { greetingWord } from "@/lib/date";
import { SetupNotice } from "@/components/ui/SetupNotice";
import { PALETTE, TINTS } from "@/design/tokens";

/**
 * The greeting is a small illustrated hero: a warm sky, a sun, rolling
 * Attica hills and a few flowers, all drawn from the shared palette. It's
 * the one deliberately saturated block on the page - everything below it
 * can stay in pale washes without the page reading as plain.
 */
function HeroLandscape() {
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
          <stop offset="0%" stopColor={TINTS.sun} />
          <stop offset="55%" stopColor={TINTS.terracotta} />
          <stop offset="100%" stopColor={TINTS.blossom} />
        </linearGradient>
      </defs>
      <rect width="400" height="150" fill="url(#hero-sky)" />

      {/* sun */}
      <circle cx="330" cy="42" r="26" fill={PALETTE.sun} />
      <circle cx="330" cy="42" r="34" fill={PALETTE.sun} opacity="0.25" />

      {/* far hill */}
      <path d="M0 118 Q 90 84 190 108 T 400 100 V150 H0 Z" fill={PALETTE.sage} opacity="0.75" />
      {/* near hill */}
      <path d="M0 138 Q 120 106 240 130 T 400 126 V150 H0 Z" fill={PALETTE.forest} opacity="0.85" />

      {/* two little birds, up in the open sky left of the sun */}
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

  return (
    <div className="relative overflow-hidden rounded-b-3xl pb-12 shadow-sm">
      <HeroLandscape />
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

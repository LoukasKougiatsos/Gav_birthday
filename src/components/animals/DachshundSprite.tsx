import { PALETTE as P } from "@/design/tokens";

/** Local fallback illustration for the weekly dachshund - used whenever The
 * Dog API call fails (missing key, network error, etc.) so the ritual never
 * breaks. Long low body, short legs, floppy ears, happy expression. */
export function DachshundSprite({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 220 140" className={className} aria-hidden="true">
      {/* ears, behind the head */}
      <path d="M60 55 Q40 75 46 100 Q60 92 66 68 Z" fill={P.clay} />
      {/* legs */}
      <line x1="70" y1="108" x2="68" y2="128" stroke={P.clay} strokeWidth="9" strokeLinecap="round" />
      <line x1="95" y1="112" x2="93" y2="130" stroke={P.clay} strokeWidth="9" strokeLinecap="round" />
      <line x1="140" y1="112" x2="142" y2="130" stroke={P.clay} strokeWidth="9" strokeLinecap="round" />
      <line x1="165" y1="108" x2="167" y2="128" stroke={P.clay} strokeWidth="9" strokeLinecap="round" />
      {/* tail */}
      <path d="M172 90 Q198 78 200 60" stroke={P.terracotta} strokeWidth="10" strokeLinecap="round" fill="none" />
      {/* long low body */}
      <ellipse cx="120" cy="98" rx="66" ry="26" fill={P.terracotta} />
      {/* head */}
      <circle cx="62" cy="82" r="26" fill={P.terracotta} />
      {/* snout */}
      <path d="M40 84 Q26 86 24 94 Q34 98 44 92 Z" fill={P.terracotta} />
      <ellipse cx="27" cy="92" rx="3.4" ry="2.6" fill={P.ink} />
      {/* eye */}
      <circle className="sprite-eye" cx="56" cy="76" r="3.2" fill={P.ink} />
    </svg>
  );
}

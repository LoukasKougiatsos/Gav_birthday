import { SPRITE_GROUND_LINE_Y as G, STROKE } from "@/design/tokens";
import { PALETTE as P } from "@/design/tokens";

/**
 * One bespoke drawing per built-in species (not a shared archetype reused
 * via tint-swapping) - each one encodes the real, age-appropriate field
 * marks that actually distinguish it: a juvenile gull's mottled brown (not
 * an adult's clean grey), a duckling's yellow down (not a green mallard
 * head), a Little Owl's flat un-tufted head, Hermann's Tortoise's yellow/
 * black shell, the dice snake's checkerboard back, a loggerhead hatchling's
 * near-black hatchling colouring rather than an adult's green. Still flat/
 * geometric/storybook, not photorealistic - "accurate" here means the
 * silhouette and markings actually read as that species, not literal
 * anatomy. All fills come from the shared palette (src/design/tokens.ts) so
 * it stays one consistent hand-drawn world.
 *
 * Every drawing shares the 200x200 viewBox and the ground line `G` (feet/
 * belly rest there). Eyes carry class="sprite-eye" for the CSS blink loop;
 * the caller wraps the whole thing in class="sprite-frame" for the idle/
 * happy/reassure animation states (see globals.css).
 */

const sw = STROKE.scene;

/** Reference: a young sparrow reads as a small, round, streaky brown-grey
 * bird - soft mottled back, pale belly, a short conical pinkish beak, dark
 * eye, pinkish legs. Feathered and fluffy, not a bald hatchling. */
function HouseSparrowNestling() {
  return (
    <>
      <ellipse cx={100} cy={G - 20} rx={30} ry={24} fill={P.honey} opacity={0.55} />
      <path d={`M 78 ${G - 34} q 20 10 40 2 q -6 10 -22 10 q -14 0 -18 -12 Z`} fill={P.clay} opacity={0.45} />
      <ellipse cx={92} cy={G - 8} rx={16} ry={10} fill={P.paper} opacity={0.6} />
      <circle cx={80} cy={G - 44} r={16} fill={P.honey} opacity={0.6} />
      <path d={`M 66 ${G - 38} l -12 4 l 10 5 Z`} fill={P.sun} />
      <circle className="sprite-eye" cx={76} cy={G - 46} r={2.8} fill={P.ink} />
      <line x1={90} y1={G - 2} x2={88} y2={G + 4} stroke={P.clay} strokeWidth={2} strokeLinecap="round" />
      <line x1={108} y1={G - 2} x2={110} y2={G + 4} stroke={P.clay} strokeWidth={2} strokeLinecap="round" />
    </>
  );
}

function BarnSwallowFledgling() {
  return (
    <>
      <path d={`M 100 ${G - 14} l -34 20 l 6 -22 Z`} fill={P.ink} opacity={0.85} />
      <path d={`M 100 ${G - 14} l 34 20 l -6 -22 Z`} fill={P.ink} opacity={0.85} />
      <ellipse cx={100} cy={G - 24} rx={26} ry={20} fill={P.ink} opacity={0.9} />
      <path d={`M 82 ${G - 14} q 18 12 36 0 q -4 12 -18 12 q -14 0 -18 -12 Z`} fill={P.paper} />
      <circle cx={78} cy={G - 46} r={17} fill={P.ink} opacity={0.9} />
      <path d={`M 68 ${G - 40} q 8 8 16 2 q -2 8 -10 8 q -8 0 -6 -10 Z`} fill={P.terracotta} />
      <circle className="sprite-eye" cx={72} cy={G - 48} r={2.8} fill={P.paper} />
      <path d={`M 62 ${G - 46} l -10 2 l 8 4 Z`} fill={P.ink} />
    </>
  );
}

function CollaredDoveJuvenile() {
  return (
    <>
      <ellipse cx={100} cy={G - 22} rx={32} ry={26} fill={P.sand} stroke={P.honey} strokeWidth={sw * 0.3} />
      <circle cx={130} cy={G - 46} r={17} fill={P.sand} stroke={P.honey} strokeWidth={sw * 0.3} />
      <path d={`M 118 ${G - 40} q 12 6 22 0`} stroke={P.ink} strokeWidth={4} fill="none" strokeLinecap="round" opacity={0.75} />
      <circle className="sprite-eye" cx={138} cy={G - 50} r={3} fill={P.ink} />
      <path d={`M 146 ${G - 48} l 12 2 l -10 5 Z`} fill={P.clay} />
      <line x1={92} y1={G + 2} x2={90} y2={G + 8} stroke={P.blossom} strokeWidth={2.5} strokeLinecap="round" />
      <line x1={106} y1={G + 2} x2={108} y2={G + 8} stroke={P.blossom} strokeWidth={2.5} strokeLinecap="round" />
    </>
  );
}

function MallardDuckling() {
  return (
    <>
      <ellipse cx={100} cy={G - 10} rx={32} ry={20} fill={P.sun} />
      <path d={`M 76 ${G - 24} q 20 -8 38 -2 q 4 10 -8 16 q -22 4 -32 -4 q -4 -6 2 -10 Z`} fill={P.honey} opacity={0.6} />
      <circle cx={128} cy={G - 32} r={18} fill={P.sun} />
      <path d={`M 116 ${G - 40} q 16 -6 22 4 q -10 6 -22 2 Z`} fill={P.honey} opacity={0.8} />
      <path d={`M 144 ${G - 34} l 12 3 l -10 5 Z`} fill={P.clay} />
      <circle className="sprite-eye" cx={132} cy={G - 36} r={3} fill={P.ink} />
      <ellipse cx={78} cy={G - 4} rx={14} ry={8} fill={P.paper} opacity={0.5} />
      <ellipse cx={90} cy={G + 6} rx={18} ry={4} fill={P.terracotta} opacity={0.35} />
    </>
  );
}

/** Reference: juvenile gulls are mottled brown all over (not the clean grey/
 * white of an adult) - a dense scatter of dark speckles over a warm brown
 * base, dark bill, pale-ish head, dusky pink legs. */
function YellowLeggedGullJuvenile() {
  return (
    <>
      <ellipse cx={100} cy={G - 40} rx={30} ry={34} fill={P.honey} opacity={0.7} />
      <path d={`M 76 ${G - 70} q 24 34 8 62 q -20 -8 -16 -36 Z`} fill={P.clay} opacity={0.55} />
      {[
        [88, G - 60], [104, G - 54], [92, G - 44], [112, G - 64], [80, G - 48],
        [96, G - 30], [110, G - 36], [84, G - 20], [102, G - 18], [70, G - 34],
        [90, G - 66], [116, G - 20],
      ].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={3.4} fill={P.clay} opacity={0.55} />
      ))}
      <circle cx={98} cy={G - 86} r={16} fill={P.sand} opacity={0.9} />
      <circle className="sprite-eye" cx={102} cy={G - 88} r={3} fill={P.ink} />
      <path d={`M 110 ${G - 86} l 18 3 l -16 6 Z`} fill={P.ink} />
      <line x1={90} y1={G - 6} x2={88} y2={G} stroke={P.clay} strokeWidth={3} strokeLinecap="round" />
      <line x1={106} y1={G - 6} x2={108} y2={G} stroke={P.clay} strokeWidth={3} strokeLinecap="round" />
    </>
  );
}

/** Reference (Wikipedia, "Little owl"): a compact, flat-headed owl with NO
 * ear tufts, big forward-facing yellow eyes close together, thin pale
 * eyebrow streaks, mottled brown/cream streaky plumage all over, a small
 * pale hooked beak, perched upright. */
function LittleOwlFledgling() {
  return (
    <>
      {/* body - rounded, sitting low, mottled */}
      <ellipse cx={100} cy={G - 32} rx={38} ry={36} fill={P.honey} opacity={0.75} />
      {[
        [76, G - 56], [124, G - 58], [68, G - 28], [132, G - 26],
        [82, G - 8], [118, G - 6], [100, G - 54], [90, G - 16], [110, G - 14],
      ].map(([x, y], i) => (
        <path key={i} d={`M ${x} ${y} l 3 7`} stroke={P.paper} strokeWidth={2.6} strokeLinecap="round" opacity={0.75} />
      ))}

      {/* facial disc, subtly lighter, sits behind the eyes */}
      <circle cx={100} cy={G - 52} r={27} fill={P.honey} opacity={0.35} />

      {/* thin pale eyebrow streaks - no ear tufts */}
      <path d={`M 75 ${G - 66} q 10 -6 20 -1`} stroke={P.paper} strokeWidth={3} fill="none" strokeLinecap="round" opacity={0.85} />
      <path d={`M 105 ${G - 67} q 10 -5 20 0`} stroke={P.paper} strokeWidth={3} fill="none" strokeLinecap="round" opacity={0.85} />

      {/* big forward-facing eyes, close together */}
      <circle cx={86} cy={G - 54} r={12.5} fill={P.paper} />
      <circle cx={114} cy={G - 54} r={12.5} fill={P.paper} />
      <circle className="sprite-eye" cx={86} cy={G - 54} r={7.5} fill={P.sun} />
      <circle cx={86} cy={G - 54} r={3.2} fill={P.ink} />
      <circle className="sprite-eye" cx={114} cy={G - 54} r={7.5} fill={P.sun} />
      <circle cx={114} cy={G - 54} r={3.2} fill={P.ink} />

      {/* small hooked pale beak, between and just below the eyes */}
      <path d={`M 97 ${G - 42} l 6 7 l -7 4 Z`} fill={P.sand} />

      {/* short legs/feet */}
      <path d={`M 88 ${G - 2} l -3 8`} stroke={P.sun} strokeWidth={3} strokeLinecap="round" />
      <path d={`M 112 ${G - 2} l 3 8`} stroke={P.sun} strokeWidth={3} strokeLinecap="round" />
    </>
  );
}

/** Reference: a juvenile cormorant is quite dark above and pale below - the
 * white extends well down the front of the neck and chest, not just a small
 * belly patch, against a blackish-brown back, long neck, long hooked bill. */
function CormorantJuvenile() {
  return (
    <>
      <path d={`M 100 ${G - 6} q -30 4 -30 -30 q 0 -46 30 -50 q 30 4 30 50 q 0 34 -30 30 Z`} fill={P.ink} opacity={0.75} />
      <path d={`M 96 ${G - 4} q -10 2 -10 -22 q 0 -34 10 -42 q 10 8 10 42 q 0 24 -10 22 Z`} fill={P.paper} opacity={0.9} />
      <path d={`M 104 ${G - 92} q -8 -30 -2 -46`} stroke={P.ink} strokeWidth={16} fill="none" strokeLinecap="round" opacity={0.8} />
      <path d={`M 100 ${G - 96} q -5 -26 -1 -40`} stroke={P.paper} strokeWidth={7} fill="none" strokeLinecap="round" opacity={0.85} />
      <circle cx={104} cy={G - 140} r={13} fill={P.ink} opacity={0.8} />
      <path d={`M 104 ${G - 140} l 24 6 l -22 8 Z`} fill={P.ink} />
      <circle className="sprite-eye" cx={110} cy={G - 144} r={2.6} fill={P.sun} />
      <line x1={92} y1={G - 2} x2={90} y2={G} stroke={P.ink} strokeWidth={3} strokeLinecap="round" />
      <line x1={108} y1={G - 2} x2={110} y2={G} stroke={P.ink} strokeWidth={3} strokeLinecap="round" />
    </>
  );
}

/** Reference (Wikipedia, "Audouin's gull"): white body, a clearly visible
 * pale grey folded wing along the back, a short stubby red bill with a dark
 * band and pale tip, and - the detail an earlier pass got wrong - grey-green
 * legs, not black. A first rebuild of this made the wing nearly invisible
 * and the bill read as a floating sliver; this version uses a solid, wide
 * wing shape and anchors the bill directly to the head's edge. */
function AudouinsGullAdult() {
  return (
    <>
      {/* legs - grey-green, thick enough to actually read at this size */}
      <line x1={92} y1={G - 10} x2={90} y2={G + 2} stroke={P.sage} strokeWidth={4.5} strokeLinecap="round" />
      <line x1={110} y1={G - 10} x2={112} y2={G + 2} stroke={P.sage} strokeWidth={4.5} strokeLinecap="round" />

      {/* body - white, sleek */}
      <ellipse cx={100} cy={G - 32} rx={36} ry={30} fill={P.paper} stroke={P.sky} strokeWidth={sw * 0.3} />

      {/* folded wing - a solid, clearly-visible pale grey panel along the
          back and down toward the tail, not a thin sliver */}
      <path
        d={`M 68 ${G - 54} Q 56 ${G - 30} 72 ${G - 6} Q 92 ${G - 14} 96 ${G - 34} Q 92 ${G - 50} 68 ${G - 54} Z`}
        fill={P.sky}
      />
      <path d={`M 68 ${G - 46} Q 76 ${G - 30} 74 ${G - 14}`} stroke={P.skyDeep} strokeWidth={1.6} fill="none" opacity={0.5} />

      {/* head - white, distinct circle overlapping the body's front-top */}
      <circle cx={112} cy={G - 62} r={17} fill={P.paper} stroke={P.sky} strokeWidth={sw * 0.2} />
      <circle className="sprite-eye" cx={118} cy={G - 64} r={3} fill={P.ink} />

      {/* bill - short and stubby, anchored right at the head's edge */}
      <path d={`M 126 ${G - 63} L 142 ${G - 65} L 140 ${G - 58} L 127 ${G - 58} Z`} fill={P.terracotta} />
      <rect x={136} y={G - 65} width={3.5} height={7} fill={P.ink} />
      <rect x={139} y={G - 64} width={3} height={5.5} fill={P.sun} />
    </>
  );
}

function HedgehogJuvenile() {
  return (
    <>
      <path d={`M 60 ${G} q -2 -42 42 -48 q 44 6 42 48 Z`} fill={P.honey} />
      {Array.from({ length: 10 }).map((_, i) => {
        const x = 66 + i * 8;
        const y = G - 32 - Math.abs(4.5 - i) * 3;
        return <line key={i} x1={x} y1={y} x2={x - 2} y2={y - 11} stroke={P.honey} strokeWidth={2.6} strokeLinecap="round" />;
      })}
      <path d={`M 58 ${G - 6} q -16 -2 -18 -13 q 11 -4 20 4 Z`} fill={P.terracotta} opacity={0.85} />
      <circle className="sprite-eye" cx={48} cy={G - 14} r={3} fill={P.ink} />
      <circle cx={40} cy={G - 8} r={2.6} fill={P.ink} />
      <ellipse cx={68} cy={G + 2} rx={6} ry={3} fill={P.ink} opacity={0.5} />
      <ellipse cx={90} cy={G + 4} rx={6} ry={3} fill={P.ink} opacity={0.5} />
    </>
  );
}

function HareLeveretNestling() {
  return (
    <>
      <ellipse cx={100} cy={G - 18} rx={27} ry={22} fill={P.terracotta} opacity={0.85} />
      <circle cx={92} cy={G - 44} r={16} fill={P.terracotta} opacity={0.85} />
      <path d={`M 82 ${G - 56} q -6 -30 3 -36 q 9 3 6 36 Z`} fill={P.terracotta} opacity={0.85} />
      <path d={`M 82 ${G - 56} q -3 -22 3 -27`} stroke={P.ink} strokeWidth={4} strokeLinecap="round" opacity={0.8} />
      <path d={`M 98 ${G - 57} q -2 -30 7 -35 q 9 3 3 35 Z`} fill={P.terracotta} opacity={0.85} />
      <path d={`M 105 ${G - 57} q 3 -21 6 -25`} stroke={P.ink} strokeWidth={4} strokeLinecap="round" opacity={0.8} />
      <circle className="sprite-eye" cx={86} cy={G - 46} r={4} fill={P.ink} />
      <circle cx={118} cy={G - 14} r={8} fill={P.paper} opacity={0.7} />
    </>
  );
}

/** Reference (Wikipedia, "Red fox"): a long, low body, slender black-
 * stockinged legs, large pointed ears, a bushy tail nearly as long as the
 * body with a bright white tip, a pointed snout with a black nose, and a
 * white chin/chest against the rust coat. Built from simple overlapping
 * shapes (body ellipse + head circle + snout, each anchored to the next)
 * rather than one long hand-plotted outline, after an earlier version of
 * this exact sprite ended up with visibly disconnected floating parts. */
function RedFoxKitJuvenile() {
  return (
    <>
      {/* tail, drawn first so the body overlaps its base */}
      <path
        d={`M 128 ${G - 22} Q 152 ${G - 18} 164 ${G - 42} Q 172 ${G - 60} 162 ${G - 72}
            Q 166 ${G - 56} 152 ${G - 44} Q 136 ${G - 30} 116 ${G - 26} Z`}
        fill={P.terracotta}
      />
      <path d={`M 162 ${G - 72} Q 174 ${G - 74} 176 ${G - 61} Q 169 ${G - 58} 160 ${G - 64} Z`} fill={P.paper} />

      {/* back legs - black stockings, drawn before the body */}
      <line x1={118} y1={G - 6} x2={116} y2={G + 6} stroke={P.ink} strokeWidth={8} strokeLinecap="round" />
      <line x1={70} y1={G - 4} x2={68} y2={G + 8} stroke={P.ink} strokeWidth={8} strokeLinecap="round" />

      {/* body */}
      <ellipse cx={98} cy={G - 26} rx={46} ry={22} fill={P.terracotta} />

      {/* head, overlapping the body's left end */}
      <circle cx={54} cy={G - 42} r={22} fill={P.terracotta} />

      {/* snout, anchored to the head */}
      <path d={`M 36 ${G - 38} Q 20 ${G - 36} 15 ${G - 28} Q 26 ${G - 23} 40 ${G - 30} Z`} fill={P.terracotta} />

      {/* ears, sitting directly on the head circle */}
      <path d={`M 44 ${G - 58} L 31 ${G - 84} L 58 ${G - 64} Z`} fill={P.terracotta} />
      <path d={`M 63 ${G - 60} L 73 ${G - 86} L 48 ${G - 66} Z`} fill={P.terracotta} />

      {/* white chest/chin patch, overlapping the head-body join */}
      <path
        d={`M 38 ${G - 26} Q 34 ${G - 8} 56 ${G - 4} Q 76 ${G - 2} 79 ${G - 16} Q 60 ${G - 6} 44 ${G - 18} Z`}
        fill={P.paper}
      />

      <circle className="sprite-eye" cx={44} cy={G - 44} r={3.4} fill={P.ink} />
      <ellipse cx={17} cy={G - 30} rx={3.4} ry={2.6} fill={P.ink} />
    </>
  );
}

/** Reference: pipistrelles are warm brown, not black - dark leathery wing
 * membrane but a soft brown furry body, small rounded ears (not the huge
 * ears of some other bat species). */
function PipistrelleBatJuvenile() {
  return (
    <>
      <path d={`M 100 ${G - 8} l -36 -26 q -8 18 12 30 q 12 6 24 -4 Z`} fill={P.clay} opacity={0.8} />
      <path d={`M 100 ${G - 8} l 36 -26 q 8 18 -12 30 q -12 6 -24 -4 Z`} fill={P.clay} opacity={0.8} />
      <path d={`M 76 ${G - 26} l 14 6 M 82 ${G - 18} l 12 8`} stroke={P.ink} strokeWidth={1} opacity={0.35} />
      <ellipse cx={100} cy={G - 16} rx={16} ry={19} fill={P.honey} opacity={0.85} />
      <path d={`M 91 ${G - 34} l -5 -9 l 8 4 Z`} fill={P.honey} opacity={0.85} />
      <path d={`M 109 ${G - 34} l 5 -9 l -8 4 Z`} fill={P.honey} opacity={0.85} />
      <circle className="sprite-eye" cx={95} cy={G - 18} r={2.4} fill={P.ink} />
      <circle className="sprite-eye" cx={105} cy={G - 18} r={2.4} fill={P.ink} />
    </>
  );
}

/** Reference: a low-slung, short-legged body; a rounded head with small
 * rounded ears sitting directly on top of it; a pointed snout with a dark
 * nose; and the field mark that matters - a clean white throat/chest bib
 * (a pine marten's is yellow, which is the whole point of drawing it). */
function StoneMartenKitJuvenile() {
  return (
    <>
      {/* bushy tail, drawn first so the body overlaps its base */}
      <path d={`M 130 ${G - 8} q 34 6 42 -16 q 5 -14 -7 -18 q 2 16 -12 22 q -12 8 -23 12 Z`} fill={P.honey} />

      {/* legs (short, just enough to read as standing) */}
      <line x1={70} y1={G + 2} x2={68} y2={G + 10} stroke={P.honey} strokeWidth={6} strokeLinecap="round" />
      <line x1={120} y1={G + 2} x2={122} y2={G + 10} stroke={P.honey} strokeWidth={6} strokeLinecap="round" />

      {/* low, elongated body */}
      <ellipse cx={98} cy={G - 10} rx={44} ry={18} fill={P.honey} />

      {/* head, overlapping the body's front */}
      <circle cx={54} cy={G - 24} r={19} fill={P.honey} />

      {/* snout, anchored to the head */}
      <path d={`M 38 ${G - 24} q -12 0 -16 6 q 6 6 16 4 Z`} fill={P.honey} />
      <ellipse cx={22} cy={G - 22} rx={3.4} ry={2.6} fill={P.ink} />

      {/* ears, sitting directly on the head circle */}
      <path d={`M 46 ${G - 40} q 0 -8 6 -10 q 4 6 1 12 Z`} fill={P.honey} />
      <path d={`M 62 ${G - 40} q 1 -8 -5 -11 q -4 6 0 12 Z`} fill={P.honey} />

      {/* white throat/chest bib - one smooth shape, not jagged */}
      <path d={`M 40 ${G - 14} q -2 12 10 16 q 16 5 20 -8 q -16 6 -30 -8 Z`} fill={P.paper} />

      <circle className="sprite-eye" cx={48} cy={G - 28} r={3} fill={P.ink} />
    </>
  );
}

function HermannsTortoiseJuvenile() {
  return (
    <>
      <ellipse cx={100} cy={G - 4} rx={46} ry={28} fill={P.sun} stroke={P.ink} strokeWidth={sw * 0.3} />
      {[
        [78, G - 10],
        [100, G - 16],
        [122, G - 10],
        [90, G + 4],
        [112, G + 4],
      ].map(([x, y], i) => (
        <path
          key={i}
          d={`M ${x - 9} ${y} q 9 -10 18 0 q -9 10 -18 0 Z`}
          fill={P.ink}
          opacity={0.75}
        />
      ))}
      <circle cx={146} cy={G - 6} r={13} fill={P.sun} />
      <circle cx={146} cy={G - 6} r={13} fill="none" stroke={P.ink} strokeWidth={1.5} opacity={0.4} />
      <circle className="sprite-eye" cx={152} cy={G - 8} r={2.6} fill={P.ink} />
      <ellipse cx={70} cy={G + 12} rx={8} ry={5} fill={P.honey} />
      <ellipse cx={130} cy={G + 12} rx={8} ry={5} fill={P.honey} />
    </>
  );
}

function BalkanGreenLizardJuvenile() {
  return (
    <>
      <path d={`M 46 ${G - 6} q 30 -16 58 0 q 22 10 38 -6`} stroke={P.sage} strokeWidth={22} strokeLinecap="round" fill="none" />
      <path d={`M 46 ${G - 6} q 30 -16 58 0`} stroke={P.forest} strokeWidth={3} fill="none" opacity={0.4} />
      <circle cx={40} cy={G - 10} r={12} fill={P.sage} />
      <path d={`M 34 ${G - 4} q 6 6 10 2`} stroke={P.skyDeep} strokeWidth={3} fill="none" strokeLinecap="round" />
      <circle className="sprite-eye" cx={36} cy={G - 14} r={2.6} fill={P.ink} />
      {[62, 96, 130].map((x, i) => (
        <path key={i} d={`M ${x} ${G + 4} l -7 11 M ${x} ${G + 4} l 7 11`} stroke={P.sage} strokeWidth={3.4} strokeLinecap="round" />
      ))}
    </>
  );
}

function DiceSnakeJuvenile() {
  return (
    <>
      <path
        d={`M 38 ${G - 4} q 20 -22 40 0 q 20 22 40 0 q 16 -18 36 -4`}
        stroke={P.sand}
        strokeWidth={17}
        fill="none"
        strokeLinecap="round"
      />
      {[
        [58, G - 8],
        [78, G + 2],
        [98, G - 10],
        [118, G + 2],
        [138, G - 6],
      ].map(([x, y], i) => (
        <rect key={i} x={x - 5} y={y - 5} width={10} height={10} fill={P.ink} opacity={i % 2 === 0 ? 0.55 : 0.3} />
      ))}
      <circle cx={34} cy={G - 4} r={10} fill={P.sand} />
      <circle className="sprite-eye" cx={30} cy={G - 6} r={2.4} fill={P.ink} />
      <path d={`M 24 ${G - 4} l -8 -3 M 24 ${G - 4} l -8 3`} stroke={P.ink} strokeWidth={1.4} />
    </>
  );
}

function LoggerheadTurtleHatchling() {
  return (
    <>
      <ellipse cx={100} cy={G - 2} rx={36} ry={20} fill={P.ink} opacity={0.85} />
      <path d={`M 72 ${G - 2} q 28 -8 56 0`} stroke={P.paper} strokeWidth={2} fill="none" opacity={0.35} />
      <path d={`M 128 ${G + 4} q 14 4 16 -8 q -8 -6 -16 0 Z`} fill={P.ink} opacity={0.85} />
      <path d={`M 72 ${G + 4} q -14 4 -16 -8 q 8 -6 16 0 Z`} fill={P.ink} opacity={0.85} />
      <circle cx={138} cy={G - 8} r={12} fill={P.ink} opacity={0.85} />
      <circle className="sprite-eye" cx={144} cy={G - 10} r={2.4} fill={P.paper} />
      <ellipse cx={100} cy={G + 10} rx={30} ry={6} fill={P.paper} opacity={0.3} />
    </>
  );
}

/** Reference: a monk seal pup is a dark charcoal-grey torpedo shape, not
 * brown - pale only in a faint belly wash, with a rounded head and whiskers. */
function MonkSealPupJuvenile() {
  return (
    <>
      <path d={`M 40 ${G} q -8 -30 36 -34 q 60 -4 66 20 q 6 18 -20 22 q -50 12 -82 -8 Z`} fill={P.ink} opacity={0.72} />
      <ellipse cx={95} cy={G - 2} rx={38} ry={8} fill={P.paper} opacity={0.2} />
      <circle cx={58} cy={G - 22} r={19} fill={P.ink} opacity={0.78} />
      <circle className="sprite-eye" cx={50} cy={G - 26} r={3.2} fill={P.paper} />
      <path d={`M 40 ${G - 20} l -6 2 M 40 ${G - 16} l -7 0 M 40 ${G - 12} l -6 -2`} stroke={P.paper} strokeWidth={1.3} opacity={0.7} />
      <ellipse cx={132} cy={G + 6} rx={18} ry={7} fill={P.ink} opacity={0.78} />
    </>
  );
}

/** Reference (Wikipedia, "Common blackbird"): juveniles/females are warm
 * dark brown all over (not the adult male's solid black), with a faintly
 * streaky breast and a dull yellow-orange bill base - distinct from the
 * sparrow's grey-brown streakiness or the swallow's glossy blue-black. */
function EurasianBlackbirdFledgling() {
  return (
    <>
      <ellipse cx={100} cy={G - 20} rx={30} ry={24} fill={P.clay} opacity={0.8} />
      {[
        [86, G - 10], [96, G - 6], [108, G - 10], [92, G - 16], [102, G - 14],
      ].map(([x, y], i) => (
        <line key={i} x1={x} y1={y} x2={x + 2} y2={y + 6} stroke={P.ink} strokeWidth={1.6} opacity={0.3} strokeLinecap="round" />
      ))}
      <circle cx={78} cy={G - 44} r={16} fill={P.clay} opacity={0.85} />
      <path d={`M 64 ${G - 40} l -14 3 l 11 6 Z`} fill={P.honey} />
      <circle className="sprite-eye" cx={74} cy={G - 46} r={2.8} fill={P.ink} />
      <line x1={90} y1={G - 2} x2={88} y2={G + 4} stroke={P.ink} strokeWidth={2} strokeLinecap="round" />
      <line x1={108} y1={G - 2} x2={110} y2={G + 4} stroke={P.ink} strokeWidth={2} strokeLinecap="round" />
    </>
  );
}

/** Reference (Wikipedia, "Rock dove"): the familiar feral pigeon - pale
 * blue-grey body, two solid dark wing bars, an iridescent green/purple
 * neck patch, a dark-tipped tail, and an orange-red eye with pinkish legs. */
function FeralPigeonJuvenile() {
  return (
    <>
      <ellipse cx={100} cy={G - 18} rx={30} ry={24} fill={P.sand} stroke={P.ink} strokeWidth={1} opacity={0.9} />
      <path d={`M 82 ${G - 24} q 20 6 38 -2`} stroke={P.ink} strokeWidth={4} fill="none" opacity={0.5} strokeLinecap="round" />
      <path d={`M 82 ${G - 12} q 20 6 38 -2`} stroke={P.ink} strokeWidth={4} fill="none" opacity={0.5} strokeLinecap="round" />
      <circle cx={76} cy={G - 42} r={15} fill={P.sand} />
      <path d={`M 66 ${G - 38} q 10 10 20 2 q -4 10 -16 8 q -10 -2 -4 -10 Z`} fill={P.sky} opacity={0.65} />
      <path d={`M 60 ${G - 40} l -12 2 l 10 5 Z`} fill={P.ink} />
      <circle className="sprite-eye" cx={70} cy={G - 44} r={2.8} fill={P.terracotta} />
      <line x1={90} y1={G + 2} x2={88} y2={G + 8} stroke={P.terracotta} strokeWidth={2.4} strokeLinecap="round" />
      <line x1={106} y1={G + 2} x2={108} y2={G + 8} stroke={P.terracotta} strokeWidth={2.4} strokeLinecap="round" />
    </>
  );
}

/** Reference (Wikipedia, "Common kestrel"): a compact falcon perched
 * upright - rufous-brown back dense with dark spotting (juveniles/females
 * lack the adult male's blue-grey head, staying brown-headed too), a dark
 * hooked beak with a yellow cere, yellow legs, and a dark band near the
 * tail tip. */
function CommonKestrelJuvenile() {
  return (
    <>
      <ellipse cx={100} cy={G - 32} rx={28} ry={32} fill={P.terracotta} opacity={0.85} />
      {[
        [86, G - 50], [104, G - 44], [92, G - 34], [110, G - 54], [82, G - 38], [98, G - 20],
      ].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={3.2} fill={P.ink} opacity={0.45} />
      ))}
      <circle cx={94} cy={G - 68} r={15} fill={P.terracotta} opacity={0.9} />
      <path d={`M 82 ${G - 66} q -8 -2 -10 4 q 6 4 12 0 Z`} fill={P.sun} />
      <path d={`M 76 ${G - 64} l -6 2 l 5 3 Z`} fill={P.ink} />
      <circle className="sprite-eye" cx={88} cy={G - 70} r={2.8} fill={P.ink} />
      <path d={`M 92 ${G + 2} q 20 4 34 -6`} stroke={P.ink} strokeWidth={6} fill="none" opacity={0.7} strokeLinecap="round" />
      <line x1={92} y1={G + 4} x2={90} y2={G + 10} stroke={P.sun} strokeWidth={2.6} strokeLinecap="round" />
      <line x1={108} y1={G + 4} x2={110} y2={G + 10} stroke={P.sun} strokeWidth={2.6} strokeLinecap="round" />
    </>
  );
}

/** Reference (Wikipedia, "Eurasian magpie"): unmistakable - glossy black
 * head/back/breast, a clean white belly and shoulder patch, and a long
 * wedge tail with a blue-green iridescent sheen (shorter and duller on a
 * fledgling than an adult's full streamer). */
function EurasianMagpieFledgling() {
  return (
    <>
      <path
        d={`M 122 ${G - 14} q 30 4 42 -22 q 4 -10 -4 -14 q 0 12 -12 20 q -14 10 -28 12 Z`}
        fill={P.ink}
        opacity={0.9}
      />
      <path d={`M 160 ${G - 50} q 6 -6 2 -12 q -6 2 -6 10 Z`} fill={P.sky} opacity={0.55} />
      <ellipse cx={98} cy={G - 20} rx={34} ry={22} fill={P.ink} opacity={0.9} />
      <ellipse cx={92} cy={G - 6} rx={18} ry={12} fill={P.paper} />
      <ellipse cx={72} cy={G - 26} rx={10} ry={14} fill={P.paper} opacity={0.9} />
      <circle cx={62} cy={G - 40} r={16} fill={P.ink} opacity={0.9} />
      <path d={`M 48 ${G - 38} l -12 3 l 10 5 Z`} fill={P.ink} />
      <circle className="sprite-eye" cx={58} cy={G - 42} r={2.8} fill={P.paper} />
      <line x1={84} y1={G + 2} x2={82} y2={G + 8} stroke={P.ink} strokeWidth={2.4} strokeLinecap="round" />
      <line x1={98} y1={G + 2} x2={100} y2={G + 8} stroke={P.ink} strokeWidth={2.4} strokeLinecap="round" />
    </>
  );
}

/** Reference (Wikipedia, "Egyptian fruit bat"): a megabat, not a
 * microbat like the Pipistrelle already drawn - a fox-like snout instead
 * of a flat insectivore face, small rounded ears, big dark eyes, brown fur
 * (not the pipistrelle's warm honey tone), same basic wing silhouette. */
function EgyptianFruitBatJuvenile() {
  return (
    <>
      <path d={`M 100 ${G - 6} l -44 -30 q -10 22 14 36 q 14 8 30 -6 Z`} fill={P.ink} opacity={0.55} />
      <path d={`M 100 ${G - 6} l 44 -30 q 10 22 -14 36 q -14 8 -30 -6 Z`} fill={P.ink} opacity={0.55} />
      <path d={`M 70 ${G - 30} l 16 7 M 78 ${G - 20} l 14 9`} stroke={P.ink} strokeWidth={1} opacity={0.3} />
      <ellipse cx={100} cy={G - 14} rx={20} ry={22} fill={P.clay} opacity={0.85} />
      <path d={`M 96 ${G - 6} q -10 6 -4 14 q 8 4 12 -4 Z`} fill={P.clay} opacity={0.95} />
      <ellipse cx={90} cy={G + 4} rx={2.6} ry={2} fill={P.ink} />
      <path d={`M 87 ${G - 36} q -4 -8 2 -12`} stroke={P.clay} strokeWidth={4} fill="none" strokeLinecap="round" />
      <path d={`M 113 ${G - 36} q 4 -8 -2 -12`} stroke={P.clay} strokeWidth={4} fill="none" strokeLinecap="round" />
      <circle className="sprite-eye" cx={92} cy={G - 18} r={3.4} fill={P.ink} />
      <circle className="sprite-eye" cx={108} cy={G - 18} r={3.4} fill={P.ink} />
    </>
  );
}

/** Reference (Wikipedia, "European pond turtle"): a low, dark olive-black
 * shell scattered with small pale-yellow flecks (not Hermann's tortoise's
 * high-domed yellow/black pattern), a longer visible neck, and yellow
 * speckling on the head/legs - an aquatic, more streamlined silhouette. */
function EuropeanPondTurtleJuvenile() {
  return (
    <>
      <ellipse cx={95} cy={G - 2} rx={44} ry={22} fill={P.forest} opacity={0.85} />
      {[
        [72, G - 10], [92, G - 14], [112, G - 8], [80, G + 4], [104, G + 4],
        [64, G], [120, G - 2], [88, G - 4], [100, G + 6],
      ].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={2.2} fill={P.sun} opacity={0.85} />
      ))}
      <path d={`M 130 ${G - 6} q 20 -4 26 -18`} stroke={P.forest} strokeWidth={10} fill="none" strokeLinecap="round" opacity={0.85} />
      <circle cx={160} cy={G - 26} r={11} fill={P.forest} opacity={0.85} />
      <circle cx={158} cy={G - 28} r={1.6} fill={P.sun} />
      <circle className="sprite-eye" cx={165} cy={G - 29} r={2.2} fill={P.ink} />
      <line x1={80} y1={G + 16} x2={78} y2={G + 22} stroke={P.forest} strokeWidth={5} strokeLinecap="round" opacity={0.85} />
      <line x1={116} y1={G + 16} x2={118} y2={G + 22} stroke={P.forest} strokeWidth={5} strokeLinecap="round" opacity={0.85} />
    </>
  );
}

export const SPECIES_SPRITES: Record<string, () => React.ReactElement> = {
  "house-sparrow-nestling": HouseSparrowNestling,
  "barn-swallow-fledgling": BarnSwallowFledgling,
  "collared-dove-juvenile": CollaredDoveJuvenile,
  "mallard-duckling": MallardDuckling,
  "yellow-legged-gull-juvenile": YellowLeggedGullJuvenile,
  "little-owl-fledgling": LittleOwlFledgling,
  "cormorant-juvenile": CormorantJuvenile,
  "audouins-gull-adult": AudouinsGullAdult,
  "hedgehog-juvenile": HedgehogJuvenile,
  "hare-leveret-nestling": HareLeveretNestling,
  "red-fox-kit-juvenile": RedFoxKitJuvenile,
  "pipistrelle-bat-juvenile": PipistrelleBatJuvenile,
  "stone-marten-kit-juvenile": StoneMartenKitJuvenile,
  "hermanns-tortoise-juvenile": HermannsTortoiseJuvenile,
  "balkan-green-lizard-juvenile": BalkanGreenLizardJuvenile,
  "dice-snake-juvenile": DiceSnakeJuvenile,
  "loggerhead-turtle-hatchling": LoggerheadTurtleHatchling,
  "monk-seal-pup-juvenile": MonkSealPupJuvenile,
  "eurasian-blackbird-fledgling": EurasianBlackbirdFledgling,
  "feral-pigeon-juvenile": FeralPigeonJuvenile,
  "common-kestrel-juvenile": CommonKestrelJuvenile,
  "eurasian-magpie-fledgling": EurasianMagpieFledgling,
  "egyptian-fruit-bat-juvenile": EgyptianFruitBatJuvenile,
  "european-pond-turtle-juvenile": EuropeanPondTurtleJuvenile,
};

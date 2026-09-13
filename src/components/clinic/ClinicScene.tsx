import type { ReactNode } from "react";

import { PALETTE, STROKE } from "@/design/tokens";

/**
 * The Clinic's single fixed background, drawn in the same illustration
 * language as the animal portraits: flat muted fills, thick dark-green
 * outlines, soft rounded shapes. `children` (an <AnimalSprite />) is layered
 * into the bed slot via a CSS-positioned overlay rather than nested SVG
 * coordinate math - the slot's position/size below is the one place that
 * needs to stay in sync with where the bed sits in the drawing.
 *
 * Composition is a simplified redraw of a vet-infirmary reference: cream
 * walls, a sage wainscot band, a garden window with a terracotta curtain on
 * the left, a paw-print anatomy poster and hanging exam lamp over the main
 * bed, a red-cross plaque and medicine shelf on the right wall, a second
 * cushioned bed peeking in at the left edge, and a rolling instrument cart
 * on the right. The reference itself is rendered in a fine stippled
 * pen-and-ink style that isn't practical to hand-author as SVG paths, so
 * it's simplified here to flat fills with confident outlines while keeping
 * the same layout, object list, and palette.
 */
const OUTLINE = PALETTE.outline;

const WALL = PALETTE.paper;
const WAINSCOT = PALETTE.sage;
const FLOOR = PALETTE.sand;
const WINDOW_FRAME = PALETTE.sage;
const SKY = PALETTE.sky;
const FOLIAGE_LIGHT = PALETTE.sage;
const FOLIAGE_MID = PALETTE.sage;
const FOLIAGE_DARK = PALETTE.forest;
const TRUNK = PALETTE.honey;
const CURTAIN = PALETTE.terracotta;
const CREAM = PALETTE.plate;
const CREAM_PALE = PALETTE.paper;
const LAMP_METAL = PALETTE.sand;
const GLOW = PALETTE.sun;
const CROSS_RED = PALETTE.terracotta;
const SHELF_WOOD = PALETTE.honey;
const BED_GREEN = PALETTE.sage;
const BOLSTER_GREEN = PALETTE.sage;
const WOOD = PALETTE.sun;
const WOOD_DARK = PALETTE.honey;
const METAL = PALETTE.sand;
const METAL_DARK = PALETTE.forest;
const BANDAGE = PALETTE.blossom;
const TAN_ACCENT = PALETTE.sun;
const CAP_DARK = PALETTE.forest;
const CAP_BROWN = PALETTE.honey;

export function ClinicScene({ children }: { children?: ReactNode }) {
  return (
    <div
      className="relative w-full overflow-hidden rounded-3xl border border-sand"
      style={{ aspectRatio: "480 / 249" }}
    >
      <svg viewBox="0 0 480 249" className="absolute inset-0 h-full w-full" aria-hidden="true">
        <defs>
          <clipPath id="clinic-window-pane">
            <rect x={12} y={14} width={104} height={130} rx={4} />
          </clipPath>
        </defs>

        {/* wall / wainscot / floor */}
        <rect x={0} y={0} width={480} height={249} fill={WALL} />
        <rect x={0} y={150} width={480} height={30} fill={WAINSCOT} />
        <path d="M0 150 H480" stroke={OUTLINE} strokeWidth={STROKE.scene} />
        <rect x={0} y={180} width={480} height={69} fill={FLOOR} />
        <path d="M0 180 H480" stroke={OUTLINE} strokeWidth={STROKE.scene} />

        {/* window onto the garden */}
        <rect
          x={6}
          y={8}
          width={116}
          height={142}
          rx={10}
          fill={WINDOW_FRAME}
          stroke={OUTLINE}
          strokeWidth={STROKE.scene}
        />
        <rect x={12} y={14} width={104} height={130} fill={SKY} stroke={OUTLINE} strokeWidth={3} />
        <g clipPath="url(#clinic-window-pane)">
          <circle cx={30} cy={124} r={28} fill={FOLIAGE_LIGHT} />
          <circle cx={57} cy={98} r={23} fill={FOLIAGE_MID} />
          <circle cx={83} cy={128} r={21} fill={FOLIAGE_DARK} />
          <circle cx={97} cy={92} r={17} fill={FOLIAGE_LIGHT} />
          <path d="M92 144 V96" stroke={TRUNK} strokeWidth={STROKE.scene} strokeLinecap="round" />
          <circle cx={40} cy={112} r={3} fill={TAN_ACCENT} />
          <circle cx={68} cy={102} r={3} fill={TAN_ACCENT} />
          <circle cx={86} cy={118} r={3} fill={TAN_ACCENT} />
        </g>
        <path d="M64 14 V144" stroke={OUTLINE} strokeWidth={STROKE.scene} />
        <path d="M12 58 H116" stroke={OUTLINE} strokeWidth={STROKE.scene} />
        <path d="M12 100 H116" stroke={OUTLINE} strokeWidth={STROKE.scene} />

        {/* terracotta curtain draped beside the window */}
        <path
          d="M120 8 C132 40 128 90 136 140 C150 146 158 120 156 90 C156 60 150 30 138 8 Z"
          fill={CURTAIN}
          stroke={OUTLINE}
          strokeWidth={STROKE.scene}
          strokeLinejoin="round"
        />
        <path
          d="M126 78 C118 78 116 70 124 68 C126 60 138 60 142 66 C150 64 154 74 146 78 Z"
          fill={CREAM}
          stroke={OUTLINE}
          strokeWidth={3}
          strokeLinejoin="round"
        />

        {/* second bed, glimpsed at the left edge */}
        <path d="M4 108 H96" stroke={OUTLINE} strokeWidth={STROKE.scene} strokeLinecap="round" />
        <path d="M10 108 V148" stroke={METAL_DARK} strokeWidth={STROKE.scene} strokeLinecap="round" />
        <path d="M26 108 V148" stroke={METAL_DARK} strokeWidth={STROKE.scene} strokeLinecap="round" />
        <path d="M42 108 V148" stroke={METAL_DARK} strokeWidth={STROKE.scene} strokeLinecap="round" />
        <path d="M58 108 V148" stroke={METAL_DARK} strokeWidth={STROKE.scene} strokeLinecap="round" />
        <path d="M74 108 V148" stroke={METAL_DARK} strokeWidth={STROKE.scene} strokeLinecap="round" />
        <path d="M90 108 V148" stroke={METAL_DARK} strokeWidth={STROKE.scene} strokeLinecap="round" />
        <rect x={0} y={148} width={100} height={32} rx={12} fill={CREAM} stroke={OUTLINE} strokeWidth={STROKE.scene} />
        <rect x={6} y={139} width={34} height={20} rx={8} fill={CREAM_PALE} stroke={OUTLINE} strokeWidth={3.5} />

        {/* paw-print anatomy poster */}
        <rect x={155} y={6} width={56} height={56} rx={6} fill={CREAM} stroke={OUTLINE} strokeWidth={STROKE.scene} />
        <ellipse cx={183} cy={32} rx={10} ry={8} fill={TAN_ACCENT} stroke={OUTLINE} strokeWidth={2.5} />
        <ellipse cx={171} cy={18} rx={4} ry={5} fill={TAN_ACCENT} stroke={OUTLINE} strokeWidth={2} />
        <ellipse cx={181} cy={13} rx={4} ry={5} fill={TAN_ACCENT} stroke={OUTLINE} strokeWidth={2} />
        <ellipse cx={191} cy={14} rx={4} ry={5} fill={TAN_ACCENT} stroke={OUTLINE} strokeWidth={2} />
        <ellipse cx={198} cy={21} rx={3.5} ry={4.5} fill={TAN_ACCENT} stroke={OUTLINE} strokeWidth={2} />
        <path d="M163 46 H203" stroke={OUTLINE} strokeWidth={2.5} strokeLinecap="round" />
        <path d="M163 52 H195" stroke={OUTLINE} strokeWidth={2.5} strokeLinecap="round" />

        {/* hanging exam lamp, centered over the main bed */}
        <path d="M228 0 V26" stroke={OUTLINE} strokeWidth={STROKE.scene} />
        <ellipse cx={228} cy={110} rx={52} ry={26} fill={GLOW} opacity={0.22} />
        <path
          d="M198 44 C198 28 211 18 228 18 C245 18 258 28 258 44 C258 49 254 52 247 52 H209 C202 52 198 49 198 44 Z"
          fill={LAMP_METAL}
          stroke={OUTLINE}
          strokeWidth={STROKE.scene}
          strokeLinejoin="round"
        />
        <circle cx={228} cy={59} r={6} fill={GLOW} stroke={OUTLINE} strokeWidth={3} />

        {/* red cross plaque */}
        <path
          d="M364 8 H384 V22 H398 V42 H384 V56 H364 V42 H350 V22 H364 Z"
          fill={CROSS_RED}
          stroke={OUTLINE}
          strokeWidth={STROKE.scene}
          strokeLinejoin="round"
        />

        {/* medicine shelf */}
        <rect x={330} y={96} width={138} height={12} rx={6} fill={SHELF_WOOD} stroke={OUTLINE} strokeWidth={STROKE.scene} />
        <rect x={336} y={62} width={14} height={34} rx={5} fill={FOLIAGE_MID} stroke={OUTLINE} strokeWidth={3.5} />
        <rect x={339} y={54} width={8} height={10} rx={3} fill={CAP_DARK} stroke={OUTLINE} strokeWidth={2.5} />
        <rect x={354} y={70} width={16} height={26} rx={8} fill={SKY} stroke={OUTLINE} strokeWidth={3.5} />
        <rect x={358} y={62} width={8} height={10} rx={3} fill={CAP_DARK} stroke={OUTLINE} strokeWidth={2.5} />
        <rect x={376} y={58} width={14} height={38} rx={5} fill={PALETTE.blossom} stroke={OUTLINE} strokeWidth={3.5} />
        <rect x={379} y={50} width={8} height={10} rx={3} fill={CAP_BROWN} stroke={OUTLINE} strokeWidth={2.5} />
        <rect x={396} y={66} width={15} height={30} rx={5} fill={TAN_ACCENT} stroke={OUTLINE} strokeWidth={3.5} />
        <rect x={399.5} y={58} width={8} height={10} rx={3} fill={CAP_BROWN} stroke={OUTLINE} strokeWidth={2.5} />
        <ellipse cx={422} cy={84} rx={10} ry={12} fill={FOLIAGE_LIGHT} stroke={OUTLINE} strokeWidth={3.5} />
        <rect x={418} y={68} width={8} height={8} rx={3} fill={CAP_DARK} stroke={OUTLINE} strokeWidth={2.5} />
        <rect x={436} y={72} width={28} height={24} rx={4} fill={CREAM_PALE} stroke={OUTLINE} strokeWidth={3.5} />
        <path d="M440 84 H460" stroke={OUTLINE} strokeWidth={2.5} strokeLinecap="round" />

        {/* rolling instrument cart */}
        <path d="M390 112 H456" stroke={OUTLINE} strokeWidth={STROKE.scene} strokeLinecap="round" />
        <path d="M390 112 V186" stroke={OUTLINE} strokeWidth={STROKE.scene} strokeLinecap="round" />
        <path d="M456 112 V186" stroke={OUTLINE} strokeWidth={STROKE.scene} strokeLinecap="round" />
        <rect x={384} y={118} width={78} height={8} rx={3} fill={METAL} stroke={OUTLINE} strokeWidth={STROKE.scene} />
        <rect x={384} y={160} width={78} height={8} rx={3} fill={METAL} stroke={OUTLINE} strokeWidth={STROKE.scene} />
        <circle cx={392} cy={188} r={6} fill={METAL_DARK} stroke={OUTLINE} strokeWidth={3} />
        <circle cx={454} cy={188} r={6} fill={METAL_DARK} stroke={OUTLINE} strokeWidth={3} />
        <path d="M400 118 L410 104" stroke={OUTLINE} strokeWidth={3} strokeLinecap="round" />
        <path d="M408 118 L418 106" stroke={OUTLINE} strokeWidth={3} strokeLinecap="round" />
        <circle cx={440} cy={112} r={6} fill={BANDAGE} stroke={OUTLINE} strokeWidth={2.5} />
        <rect x={396} y={142} width={20} height={16} rx={2} fill={CREAM_PALE} stroke={OUTLINE} strokeWidth={2.5} />
        <circle cx={436} cy={150} r={9} fill={BANDAGE} stroke={OUTLINE} strokeWidth={3} />
        <circle cx={436} cy={150} r={3} fill={CREAM} stroke={OUTLINE} strokeWidth={1.5} />

        {/* main examination bed */}
        <path
          d="M100 112 C90 112 84 120 84 132 V160 C84 170 92 176 102 176 C114 176 122 168 122 156 V128 C122 118 112 112 100 112 Z"
          fill={BOLSTER_GREEN}
          stroke={OUTLINE}
          strokeWidth={STROKE.scene}
          strokeLinejoin="round"
        />
        <rect x={108} y={130} width={240} height={38} rx={18} fill={BED_GREEN} stroke={OUTLINE} strokeWidth={STROKE.scene} />
        <path d="M108 149 H348" stroke={OUTLINE} strokeWidth={2.5} opacity={0.3} />
        <rect x={116} y={163} width={224} height={20} rx={9} fill={WOOD} stroke={OUTLINE} strokeWidth={STROKE.scene} />
        <rect x={130} y={179} width={15} height={20} rx={7} fill={WOOD_DARK} stroke={OUTLINE} strokeWidth={STROKE.scene} />
        <rect x={323} y={179} width={15} height={20} rx={7} fill={WOOD_DARK} stroke={OUTLINE} strokeWidth={STROKE.scene} />
      </svg>

      {/* the sprite slot: sits on the exam bed, right of the bolster */}
      <div
        className="absolute"
        style={{ left: "40.6%", top: "17.7%", width: "27.1%", aspectRatio: "1 / 1" }}
      >
        {children}
      </div>
    </div>
  );
}

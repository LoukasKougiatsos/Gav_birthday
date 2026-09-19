/**
 * Shared design language for the whole site.
 * Every SVG illustration (nav icons, the Clinic scene, animal sprites, the
 * encouragement avatar, etc.) must draw its colors and stroke weights from
 * here, so the whole site reads as one consistent, hand-drawn world.
 *
 * The register is a 1970s field guide: warm parchment paper, letterpress
 * rules, dark-green linework, muted print inks. Accents are organised as
 * families - a mid-tone hue for illustration fills and badges, plus a deep,
 * readable counterpart for text sitting on a wash of that hue. Adding a
 * color here is a design decision, not a one-off choice inside a component.
 */

export const PALETTE = {
  paper: "#F4EAD4", // page background - parchment
  sand: "#E3D5B4", // rules, borders, neutral surface on top of paper
  plate: "#FBF4E4", // the card surface itself - a plate pasted on the page
  terracotta: "#A8482A", // primary accent - buttons, active states, warmth
  clay: "#8A361D", // primary-dark - hover/active, headings that need weight
  sage: "#6E7F4C", // secondary accent - plants, calm states, success
  forest: "#3A4A31", // secondary-dark - nav bar, icon linework, accented text
  outline: "#1F3D2C", // illustration linework only - the darkest green
  sky: "#3E6E68", // water, weather, info
  skyDeep: "#2C514D", // sky-dark - text/icons that sit on sky washes
  sun: "#BE8A2C", // highlights, streaks, celebration
  honey: "#7A5A16", // sun-dark - text/icons that sit on sun washes
  blossom: "#C4766A", // faded rose - affection, the "Us" corner, gentle joy
  lavender: "#7E6F92", // dusty violet - Mind/psychology, dusk calm
  wine: "#7A2E42", // deep burgundy - Theatre, curtains and stage drama
  ink: "#20291F", // body text - not part of the illustration palette itself
} as const;

export type PaletteColor = keyof typeof PALETTE;

/**
 * Pale washes of the accent hues, used as card/surface backgrounds so each
 * corner of the site can carry its own color without shouting. In this
 * register every wash is a low-chroma parchment tone - they read as
 * different papers, not as colored panels. Tints are derived surfaces only,
 * never linework or illustration fills.
 */
export const TINTS = {
  terracotta: "#F2DCC9",
  clay: "#E9D8CE",
  sage: "#E4E6CD",
  sky: "#DCE7E5",
  sun: "#F5E7C4",
  blossom: "#F2DBD1",
  lavender: "#E3DCDF",
  wine: "#ECD5D9",
} as const;

export type TintColor = keyof typeof TINTS;

/**
 * Each section of the site owns one accent hue, and every surface that
 * refers to a section (Home teaser cards, nav badges, Coming-Soon pages,
 * illustrations) color-codes with it. Tailwind class names must be static
 * strings, so component-level class maps (see src/components/ui/accents.ts)
 * restate this in class form - keep them in agreement with this table.
 */
export const SECTION_HUE: Record<string, PaletteColor> = {
  home: "terracotta",
  clinic: "terracotta",
  exercise: "clay",
  animals: "clay",
  plants: "sage",
  kitchen: "sun",
  discover: "sky",
  mind: "lavender",
  us: "blossom",
  theatre: "wine",
};

/**
 * Typography. Three faces, each with one job - this is what carries the
 * field-guide register more than the colors do.
 *  - `serif`: headings and body copy (Alegreya).
 *  - `sans`: uppercase letterspaced section labels (Alegreya Sans).
 *  - `mono`: plate numbers, figure captions, small caps metadata (Roboto Mono).
 * The CSS variables are declared in src/app/layout.tsx.
 */
export const FONT_VAR = {
  serif: "var(--font-alegreya)",
  sans: "var(--font-alegreya-sans)",
  mono: "var(--font-roboto-mono)",
} as const;

/**
 * Stroke weight is deliberately different for interface icons vs. full
 * illustrations - they're different registers, not an inconsistency.
 *  - `scene`: the Clinic background and every animal sprite.
 *  - `icon`: small line icons in nav/UI, drawn on a 24x24 viewBox.
 */
export const STROKE = {
  scene: 4.5,
  icon: 2,
} as const;

/**
 * Legacy inline sprites (src/components/clinic/sprites.tsx) share this
 * viewBox and ground line. The 24 painted portraits in /public/animals
 * supersede them; this stays for cases added later that have no artwork.
 */
export const SPRITE_VIEWBOX = "0 0 200 200";
export const SPRITE_GROUND_LINE_Y = 170;

/** Small UI icons (nav, buttons) share this viewBox. */
export const ICON_VIEWBOX = "0 0 24 24";

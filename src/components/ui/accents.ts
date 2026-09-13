import type { IconKind } from "@/components/icons/NavIcons";
import type { CardTone } from "@/components/ui/Card";

/**
 * Per-section accent recipes in Tailwind-class form: the card tone that
 * section's surfaces use, plus badge classes for its icon chip. Tailwind
 * class names must be static strings, so this restates SECTION_HUE from
 * src/design/tokens.ts - keep the two in agreement. (Sections whose hue is a
 * "deep" color - animals/clay - sit on their family's tint.)
 *
 * In the field-guide register badges are square-ish specimen chips, so they
 * carry a flat tint plus a hairline border rather than a soft translucent
 * wash.
 */
export const SECTION_ACCENT: Record<IconKind, { tone: CardTone; badge: string }> = {
  home: { tone: "terracotta", badge: "bg-terracotta-tint text-clay border border-terracotta/40" },
  clinic: { tone: "terracotta", badge: "bg-terracotta-tint text-clay border border-terracotta/40" },
  animals: { tone: "terracotta", badge: "bg-terracotta-tint text-clay border border-clay/40" },
  plants: { tone: "sage", badge: "bg-sage-tint text-forest border border-sage/50" },
  kitchen: { tone: "sun", badge: "bg-sun-tint text-honey border border-sun/50" },
  discover: { tone: "sky", badge: "bg-sky-tint text-sky-deep border border-sky/45" },
  mind: { tone: "lavender", badge: "bg-lavender-tint text-lavender border border-lavender/45" },
  us: { tone: "blossom", badge: "bg-blossom-tint text-clay border border-blossom/45" },
};

import type { ReactNode } from "react";

/**
 * Card surfaces, in the field-guide register: a plate pasted onto the page.
 * Nearly square corners, a hairline ink border, and a thick letterpress rule
 * along the top edge in the section's accent color. "plain" is the neutral
 * plate; the named tones wash the card in one accent family's tint (see
 * TINTS in src/design/tokens.ts) so each widget can carry its section's
 * color while staying light and readable.
 */
const TONES = {
  plain: "bg-plate border-t-sand",
  terracotta: "bg-terracotta-tint border-t-terracotta",
  sage: "bg-sage-tint border-t-sage",
  sky: "bg-sky-tint border-t-sky",
  sun: "bg-sun-tint border-t-sun",
  blossom: "bg-blossom-tint border-t-blossom",
  lavender: "bg-lavender-tint border-t-lavender",
} as const;

export type CardTone = keyof typeof TONES;

export function Card({
  children,
  className = "",
  tone = "plain",
}: {
  children: ReactNode;
  className?: string;
  tone?: CardTone;
}) {
  return (
    <div
      className={`rounded-sm border border-ink/15 border-t-[3px] p-4 ${TONES[tone]} ${className}`}
    >
      {children}
    </div>
  );
}

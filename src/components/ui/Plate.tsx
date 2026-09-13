import type { ReactNode } from "react";

/**
 * The two typographic primitives that carry the field-guide register.
 * Views can use them anywhere a label or a section heading is needed; the
 * classes themselves live in src/app/globals.css so the fonts and metrics
 * stay in one place.
 */

/**
 * The small uppercase letterspaced eyebrow that sits above a heading -
 * "PLATE 01 · DAYBREAK", "FIG. 2 · ΤΟ ΙΑΤΡΕΙΟ". Pass `accent` to tint it
 * in the section's color instead of muted ink.
 */
export function PlateLabel({
  children,
  accent = false,
  className = "",
}: {
  children: ReactNode;
  accent?: boolean;
  className?: string;
}) {
  return (
    <p className={`plate-label ${accent ? "!text-terracotta" : ""} ${className}`}>{children}</p>
  );
}

/**
 * A section heading: uppercase sans label with a letterpress rule beneath
 * it. Optionally carries a right-aligned figure number.
 */
export function PlateRule({
  children,
  figure,
  className = "",
}: {
  children: ReactNode;
  figure?: string;
  className?: string;
}) {
  return (
    <div className={`plate-rule flex items-baseline justify-between gap-3 ${className}`}>
      <span>{children}</span>
      {figure ? <span className="plate-label !tracking-[0.14em]">{figure}</span> : null}
    </div>
  );
}

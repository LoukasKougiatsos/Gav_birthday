import Image from "next/image";
import { SPRITE_VIEWBOX, PALETTE } from "@/design/tokens";
import { SPECIES_SPRITES } from "@/components/clinic/sprites";

export type SpriteState = "idle" | "happy" | "reassure";

/** Case ids that have a painted portrait in /public/animals. Anything not
 * listed falls back to the old inline SVG sprite, then to the blob. */
const PORTRAITS = new Set([
  "house-sparrow-nestling",
  "barn-swallow-fledgling",
  "collared-dove-juvenile",
  "mallard-duckling",
  "yellow-legged-gull-juvenile",
  "little-owl-fledgling",
  "cormorant-juvenile",
  "audouins-gull-adult",
  "eurasian-blackbird-fledgling",
  "feral-pigeon-juvenile",
  "common-kestrel-juvenile",
  "eurasian-magpie-fledgling",
  "hedgehog-juvenile",
  "hare-leveret-nestling",
  "red-fox-kit-juvenile",
  "pipistrelle-bat-juvenile",
  "stone-marten-kit-juvenile",
  "egyptian-fruit-bat-juvenile",
  "hermanns-tortoise-juvenile",
  "balkan-green-lizard-juvenile",
  "dice-snake-juvenile",
  "european-pond-turtle-juvenile",
  "loggerhead-turtle-hatchling",
  "monk-seal-pup-juvenile",
]);

/** Fallback for cases without bespoke art (anything added via the "add a
 * case" form) - a friendly rounded blob, not a blank gap. */
function GenericBlob() {
  return (
    <>
      <ellipse cx={100} cy={140} rx={38} ry={30} fill={PALETTE.terracotta} />
      <circle cx={100} cy={95} r={26} fill={PALETTE.terracotta} />
      <circle className="sprite-eye" cx={90} cy={92} r={4} fill={PALETTE.ink} />
      <circle className="sprite-eye" cx={110} cy={92} r={4} fill={PALETTE.ink} />
    </>
  );
}

export function AnimalSprite({
  caseId,
  state = "idle",
  className = "",
  preload = false,
}: {
  caseId: string;
  ageClass?: string;
  state?: SpriteState;
  className?: string;
  /** The one sprite above the fold (the active case on the bed) - skips the
   * lazy-load so it never pops in after the scene has painted. */
  preload?: boolean;
}) {
  if (PORTRAITS.has(caseId)) {
    return (
      <div className={`sprite-frame h-full w-full ${className}`} data-state={state}>
        <Image
          src={`/animals/${caseId}.png`}
          alt=""
          width={512}
          height={512}
          className="h-full w-full object-contain"
          preload={preload}
          loading={preload ? undefined : "lazy"}
          sizes="(max-width: 640px) 40vw, 220px"
        />
      </div>
    );
  }

  const Species = SPECIES_SPRITES[caseId];

  return (
    <svg viewBox={SPRITE_VIEWBOX} className={`h-full w-full ${className}`} aria-hidden="true">
      <g className="sprite-frame" data-state={state}>
        {Species ? <Species /> : <GenericBlob />}
      </g>
    </svg>
  );
}

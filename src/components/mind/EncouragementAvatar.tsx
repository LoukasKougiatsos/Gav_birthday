import type { MoodBand } from "@/lib/mood";

/** A real portrait (public/mind/encouragement-avatar.png), not a drawn
 * mascot - replaced the hand-drawn SVG figure per her request. Static image,
 * so it no longer reacts to mood band; `band` stays in the signature so
 * callers don't need to change. */
export function EncouragementAvatar({ className = "" }: { band?: MoodBand; className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element -- static file under public/mind/
    <img
      src="/mind/encouragement-avatar.png"
      alt=""
      className={`rounded-full object-cover ${className}`}
    />
  );
}

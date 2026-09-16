"use client";

import { useEffect, useRef, useState } from "react";
import { SetupNotice } from "@/components/ui/SetupNotice";

/** Real supplied art (public/exercise/avatar-1.jpg..avatar-5.jpg) - a
 * cartoon flex escalating to full fantasy-armor "powered up." `level` is
 * already 1..BUFF_STAGES straight from buffLevel(), no offset. SetupNotice
 * only guards a future stage-count change that outruns the art, not the
 * everyday case. Every pose has fists raised out near the canvas edges, so
 * the frame is held at the source art's own ratio (1984x2146) rather than
 * a tighter crop - anything narrower clips the flex itself. `className`
 * sizes the frame; the plate treatment (border, corners, white mat) lives
 * here so the caller only decides how big.
 *
 * `pulse` is a second, independent trigger for the same flex animation:
 * the real stage only steps up once a 3-day window closes (see
 * buffLevel()), which would leave most "Ναι" taps with no visible reaction
 * at all - too flat for the moment she actually says she exercised. The
 * caller bumps `pulse` on every "Ναι" so the avatar visibly reacts right
 * then, independent of whether the persisted stage happened to change. */
export function BuffAvatar({
  level,
  pulse,
  className = "",
}: {
  level: number;
  pulse?: number;
  className?: string;
}) {
  const [broken, setBroken] = useState(false);
  const prevLevel = useRef(level);
  const prevPulse = useRef(pulse);
  const [flex, setFlex] = useState(false);

  useEffect(() => {
    const levelChanged = prevLevel.current !== level;
    const pulseChanged = pulse !== undefined && prevPulse.current !== pulse;
    prevLevel.current = level;
    prevPulse.current = pulse;
    if (!levelChanged && !pulseChanged) return;
    setBroken(false);
    setFlex(true);
    const timeout = setTimeout(() => setFlex(false), 700);
    return () => clearTimeout(timeout);
  }, [level, pulse]);

  if (broken) {
    return (
      <div className={className}>
        <SetupNotice>
          λείπει το <code className="rounded bg-white/60 px-1 py-0.5">avatar-{level}.jpg</code> στο{" "}
          <code className="rounded bg-white/60 px-1 py-0.5">public/exercise/</code>.
        </SetupNotice>
      </div>
    );
  }

  return (
    <div className={`overflow-hidden rounded-sm border border-ink/15 bg-plate ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element -- static file under public/exercise/, level-driven src */}
      <img
        src={`/exercise/avatar-${level}.jpg`}
        alt=""
        onError={() => setBroken(true)}
        className={`h-full w-full object-cover ${flex ? "exercise-avatar-flex" : ""}`}
      />
    </div>
  );
}

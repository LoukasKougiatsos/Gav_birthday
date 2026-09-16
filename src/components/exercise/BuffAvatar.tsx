"use client";

import { useEffect, useRef, useState } from "react";
import { SetupNotice } from "@/components/ui/SetupNotice";

/** Real supplied art (public/exercise/avatar-1.jpg..avatar-5.jpg) - a
 * cartoon flex escalating to full fantasy-armor "powered up." `level` is
 * already 1..BUFF_STAGES straight from buffLevel(), no offset. SetupNotice
 * only guards a future stage-count change that outruns the art, not the
 * everyday case. */
export function BuffAvatar({ level, className = "" }: { level: number; className?: string }) {
  const [broken, setBroken] = useState(false);
  const prevLevel = useRef(level);
  const [flex, setFlex] = useState(false);

  useEffect(() => {
    if (prevLevel.current === level) return;
    prevLevel.current = level;
    setBroken(false);
    setFlex(true);
    const timeout = setTimeout(() => setFlex(false), 700);
    return () => clearTimeout(timeout);
  }, [level]);

  if (broken) {
    return (
      <SetupNotice>
        λείπει το <code className="rounded bg-white/60 px-1 py-0.5">avatar-{level}.jpg</code> στο{" "}
        <code className="rounded bg-white/60 px-1 py-0.5">public/exercise/</code>.
      </SetupNotice>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element -- static file under public/exercise/, level-driven src
    <img
      src={`/exercise/avatar-${level}.jpg`}
      alt=""
      onError={() => setBroken(true)}
      className={`rounded-full object-cover ${flex ? "exercise-avatar-flex" : ""} ${className}`}
    />
  );
}

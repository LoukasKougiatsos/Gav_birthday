"use client";

import { useEffect, useState } from "react";
import { isDachshundDayToday } from "@/lib/animals";
import { DachshundReveal } from "@/components/animals/DachshundReveal";
import { CuteCorner } from "@/components/animals/CuteCorner";

/** Home's daily dose of the Animals section: the weekly dachshund reveal (on
 * its one unpredictable day) plus the daily cute-animal photo, so both show
 * up on the front page and not just inside /animals. */
export function AnimalsTeaser() {
  const [dachshundToday, setDachshundToday] = useState<boolean | null>(null);

  useEffect(() => {
    // One-time sync of a date-derived value on mount, see ClinicGame.tsx for
    // the fuller rationale (keeps server/client first-render output equal).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDachshundToday(isDachshundDayToday());
  }, []);

  return (
    <div className="flex flex-col gap-3">
      {dachshundToday && <DachshundReveal />}
      <CuteCorner />
    </div>
  );
}

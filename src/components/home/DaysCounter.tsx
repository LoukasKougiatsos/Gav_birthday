import { SITE_CONFIG } from "@/config/site";
import { daysTogether, dayMessage } from "@/lib/date";
import { Card } from "@/components/ui/Card";
import { SetupNotice } from "@/components/ui/SetupNotice";
import { NavIcon } from "@/components/icons/NavIcons";

export function DaysCounter() {
  const anniversary = SITE_CONFIG.anniversaryDate;

  if (!anniversary) {
    return (
      <Card tone="blossom">
        <SetupNotice>
          όρισε το <code className="rounded bg-white/60 px-1 py-0.5">anniversaryDate</code> στο{" "}
          <code className="rounded bg-white/60 px-1 py-0.5">src/config/site.ts</code> για να φανεί ο
          μετρητής ημερών.
        </SetupNotice>
      </Card>
    );
  }

  const days = daysTogether(anniversary);

  return (
    <Card tone="blossom" className="flex flex-col justify-between gap-2">
      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blossom/25 text-clay">
        <NavIcon kind="us" className="h-5 w-5" />
      </div>
      <div>
        <p className="font-display text-3xl font-bold text-clay">{days.toLocaleString("el-GR")}</p>
        <p className="text-sm text-ink/70">{dayMessage(days)}</p>
      </div>
    </Card>
  );
}

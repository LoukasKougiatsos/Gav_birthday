import { MemoryCard } from "@/components/us/MemoryCard";
import { DaysTogether } from "@/components/us/DaysTogether";
import { PlacesMap } from "@/components/us/PlacesMap";
import { BucketList } from "@/components/us/BucketList";

export function UsView() {
  return (
    <div className="mx-auto flex max-w-md flex-col gap-5 px-4 pt-4 pb-10">
      <div>
        <p className="font-display text-xl font-semibold text-clay">Εμείς</p>
        <p className="text-sm text-ink/60">Οι μέρες και οι αναμνήσεις μας.</p>
      </div>

      <DaysTogether />
      <MemoryCard />
      <PlacesMap />
      <BucketList />
    </div>
  );
}

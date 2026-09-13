import { Greeting } from "@/components/home/Greeting";
import { DaysCounter } from "@/components/home/DaysCounter";
import { WeatherCard } from "@/components/home/WeatherCard";
import { WeatherEffect } from "@/components/home/WeatherEffect";
import { ClinicTeaser } from "@/components/home/ClinicTeaser";
import { AnimalsTeaser } from "@/components/home/AnimalsTeaser";
import { DiscoverTeaser } from "@/components/home/DiscoverTeaser";
import { KitchenTeaser } from "@/components/home/KitchenTeaser";
import { PlantsTeaser } from "@/components/home/PlantsTeaser";

// Greeting/days-counter are date-based - keep this route dynamic rather than
// statically cached across deploys.
export const dynamic = "force-dynamic";

export default function HomePage() {
  return (
    <div className="mx-auto max-w-md pb-10">
      <WeatherEffect />
      {/* Explicitly positioned+stacked above WeatherEffect's fixed z-0 layer -
          plain static content would otherwise paint UNDER a positioned
          z-index:0 sibling per CSS stacking rules, not over it. */}
      <div className="relative z-10 flex flex-col gap-3">
        <Greeting />

        <div className="grid grid-cols-2 gap-3 px-4">
          <DaysCounter />
          <WeatherCard />
        </div>

        <div className="flex flex-col gap-3 px-4">
          <AnimalsTeaser />
          <DiscoverTeaser />
          <ClinicTeaser />
          <KitchenTeaser />
          <PlantsTeaser />
        </div>
      </div>
    </div>
  );
}

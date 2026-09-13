import type { ClinicCase } from "@/lib/clinic";
import { SpeciesPhoto } from "@/components/clinic/SpeciesPhoto";
import { Card } from "@/components/ui/Card";

/** Shown after every answer, right or wrong - it always teaches, and it's
 * never punishing about a wrong guess. */
export function CaseResolution({
  clinicCase,
  chosenFood,
  correct,
}: {
  clinicCase: ClinicCase;
  chosenFood: string;
  correct: boolean;
}) {
  return (
    <Card tone={correct ? "sage" : "terracotta"} className="flex flex-col gap-3">
      <div>
        <p className="font-display text-lg font-semibold text-clay">
          {correct ? "Σωστή φροντίδα! 🌿" : "Καλή προσπάθεια — να τι χρειάζεται πραγματικά"}
        </p>
        <p className="text-sm text-ink/70">
          {clinicCase.speciesEl} · {clinicCase.speciesEn}
        </p>
      </div>

      {!correct && <p className="text-sm text-ink/60">Επέλεξες: {chosenFood}</p>}

      <SpeciesPhoto speciesEn={clinicCase.speciesEn} />

      <p className="text-sm text-ink/80">{clinicCase.note}</p>

      <p className="text-xs text-honey/80">
        Η σωστή τροφή: {clinicCase.correctFoods.join(" · ")}
      </p>
    </Card>
  );
}

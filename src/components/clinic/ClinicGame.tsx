"use client";

import { useEffect, useState } from "react";
import {
  allCases,
  getTodaysCase,
  getCaseOptions,
  recordDailyAnswer,
  hasAnsweredToday,
  currentDisplayStreak,
  isRestTokenAvailable,
  loadProgress,
  AGE_CLASS_EL,
  streakLabel,
  type ClinicCase,
  type CaseOption,
} from "@/lib/clinic";
import { dailySeed } from "@/lib/seed";
import { CLINIC_MILESTONE_MESSAGES } from "@/content/clinicMilestones";
import { ClinicScene } from "@/components/clinic/ClinicScene";
import { AnimalSprite, type SpriteState } from "@/components/clinic/AnimalSprite";
import { CaseResolution } from "@/components/clinic/CaseResolution";
import { Card } from "@/components/ui/Card";

function OptionList({
  options,
  chosen,
  selected,
  onSelect,
  disabled,
}: {
  options: CaseOption[];
  chosen: string | null;
  selected: string | null;
  onSelect: (opt: CaseOption) => void;
  disabled: boolean;
}) {
  return (
    <div className="flex flex-col gap-2">
      {options.map((opt) => {
        const isChosen = chosen === opt.text;
        const isSelected = !disabled && selected === opt.text;
        const revealed = disabled;
        const showCorrect = revealed && opt.correct;
        const showWrongChosen = revealed && isChosen && !opt.correct;
        return (
          <button
            key={opt.text}
            type="button"
            disabled={disabled}
            aria-pressed={isSelected}
            onClick={() => onSelect(opt)}
            className={`rounded-xl border px-4 py-3 text-left text-sm transition-colors ${
              showCorrect
                ? "border-sage bg-sage-tint text-forest"
                : showWrongChosen
                  ? "border-terracotta/50 bg-terracotta-tint text-clay"
                  : isSelected
                    ? "border-terracotta bg-terracotta-tint/60 text-clay ring-2 ring-terracotta/30"
                    : "border-sand bg-white/70 text-ink hover:border-terracotta/40"
            } ${disabled ? "cursor-default" : "cursor-pointer"}`}
          >
            {opt.text}
          </button>
        );
      })}
    </div>
  );
}

interface DailyState {
  dailyCase: ClinicCase;
  dailyOptions: CaseOption[];
  dailyChosen: string | null;
  dailyCorrect: boolean | null;
  streak: number;
  restTokenAvailable: boolean;
}

export function ClinicGame() {
  const [daily, setDaily] = useState<DailyState | null>(null);
  const [spriteState, setSpriteState] = useState<SpriteState>("idle");
  const [milestone, setMilestone] = useState<number | null>(null);
  const [bridgedByRest, setBridgedByRest] = useState(false);
  const [selected, setSelected] = useState<CaseOption | null>(null);

  useEffect(() => {
    const cases = allCases();
    const today = dailySeed();
    const progress = loadProgress();
    const record = progress.answeredDates[today];
    const dailyCase = getTodaysCase(progress, cases, today);
    const answered = hasAnsweredToday(progress, today) && record?.caseId === dailyCase.id;

    // One-time sync from external state (localStorage + today's date) into
    // React state on mount - deliberately deferred to an effect (rather than
    // computed during render) so server-rendered HTML and the client's first
    // hydration pass match; the date/localStorage-dependent case is only
    // ever known client-side.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDaily({
      dailyCase,
      dailyOptions: getCaseOptions(dailyCase, today),
      dailyChosen: answered && record ? record.chosenFood : null,
      dailyCorrect: answered && record ? record.correct : null,
      streak: currentDisplayStreak(progress, today),
      restTokenAvailable: isRestTokenAvailable(progress, today),
    });
  }, []);

  function chooseDailyOption(opt: CaseOption) {
    if (!daily || daily.dailyChosen) return;
    const result = recordDailyAnswer(daily.dailyCase.id, opt.text, opt.correct);
    setDaily({
      ...daily,
      dailyChosen: opt.text,
      dailyCorrect: opt.correct,
      streak: result.progress.streak,
      restTokenAvailable: isRestTokenAvailable(result.progress, dailySeed()),
    });
    setBridgedByRest(result.streakBridgedByRestToken);
    if (result.milestoneReached) setMilestone(result.milestoneReached);
    setSpriteState(opt.correct ? "happy" : "reassure");
    setTimeout(() => setSpriteState("idle"), 1500);
  }

  if (!daily) {
    return (
      <div className="mx-auto max-w-md px-4 py-8">
        <div className="h-64 animate-pulse rounded-3xl bg-sand" />
      </div>
    );
  }

  const dailyAnswered = Boolean(daily.dailyChosen);

  return (
    <div className="mx-auto flex max-w-md flex-col gap-4 px-4 pb-10">
      <div className="flex items-center justify-between pt-4">
        <div>
          <p className="font-display text-xl font-semibold text-clay">Το Ιατρείο</p>
        </div>
        <div className="flex items-center gap-2 rounded-full bg-terracotta-tint px-3 py-1.5 text-sm text-clay">
          <span aria-hidden="true">🔥</span>
          <span>{streakLabel(daily.streak)}</span>
        </div>
      </div>

      {daily.restTokenAvailable && (
        <p className="text-xs text-sage">🌿 Έχεις ένα ρεπό αποθηκευμένο γι’ αυτή την εβδομάδα, αν χρειαστεί να χάσεις μια μέρα.</p>
      )}
      {bridgedByRest && (
        <p className="text-xs text-sage">Το ρεπό σου κάλυψε τη χθεσινή μέρα — το σερί συνεχίζεται.</p>
      )}

      {milestone && (
        <Card tone="sun" className="flex items-start justify-between gap-3">
          <p className="text-sm text-ink/80">
            {CLINIC_MILESTONE_MESSAGES[milestone as keyof typeof CLINIC_MILESTONE_MESSAGES]}
          </p>
          <button
            type="button"
            onClick={() => setMilestone(null)}
            aria-label="Απόρριψη"
            className="shrink-0 text-honey/70"
          >
            ✕
          </button>
        </Card>
      )}

      <ClinicScene>
        <AnimalSprite caseId={daily.dailyCase.id} ageClass={daily.dailyCase.ageClass} state={spriteState} preload />
      </ClinicScene>

      <p className="text-sm text-ink/70">
        {AGE_CLASS_EL[daily.dailyCase.ageClass][daily.dailyCase.gender]} {daily.dailyCase.speciesEl} — τι χρειάζεται;
      </p>
      <OptionList
        options={daily.dailyOptions}
        chosen={daily.dailyChosen}
        selected={selected?.text ?? null}
        onSelect={setSelected}
        disabled={dailyAnswered}
      />
      {!dailyAnswered && (
        <button
          type="button"
          disabled={!selected}
          onClick={() => selected && chooseDailyOption(selected)}
          className="self-end rounded-full bg-terracotta px-6 py-2.5 text-sm font-semibold text-white transition-opacity disabled:opacity-40"
        >
          OK
        </button>
      )}
      {dailyAnswered && daily.dailyCorrect !== null && (
        <CaseResolution clinicCase={daily.dailyCase} chosenFood={daily.dailyChosen ?? ""} correct={daily.dailyCorrect} />
      )}
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import {
  loadDailyPlan,
  saveDailyPlan,
  isPlanCurrent,
  fetchDailyMeals,
  fetchOneReplacementMeal,
  fetchSpoonacularSteps,
  translateMealTitles,
  buildShoppingListForMeal,
  loadCookedHistory,
  markMealCooked,
  type DailyPlanState,
  type Meal,
  type CookedEntry,
} from "@/lib/kitchen";
import { dailySeed } from "@/lib/seed";
import { Card } from "@/components/ui/Card";

export function KitchenView() {
  const [plan, setPlan] = useState<DailyPlanState | null | undefined>(undefined); // undefined = loading
  const [generating, setGenerating] = useState(false);
  const [swappingId, setSwappingId] = useState<string | null>(null);
  const [cookedHistory, setCookedHistory] = useState<CookedEntry[]>([]);
  const [expandedStepsId, setExpandedStepsId] = useState<string | null>(null);
  const [expandedShoppingId, setExpandedShoppingId] = useState<string | null>(null);
  const [stepsLoadingId, setStepsLoadingId] = useState<string | null>(null);

  async function generatePlan() {
    setGenerating(true);
    try {
      const rawMeals = await fetchDailyMeals(6);
      const meals = await translateMealTitles(rawMeals);
      const next: DailyPlanState = { dayKey: dailySeed(), meals, checkedItems: [] };
      saveDailyPlan(next);
      setPlan(next);
    } finally {
      setGenerating(false);
    }
  }

  useEffect(() => {
    async function init() {
      const cached = loadDailyPlan();
      setCookedHistory(loadCookedHistory());

      if (isPlanCurrent(cached)) {
        setPlan(cached);
      } else {
        await generatePlan();
      }
    }
    init();
  }, []);

  async function handleSwap(mealId: string) {
    if (!plan) return;
    setSwappingId(mealId);
    try {
      const rawReplacement = await fetchOneReplacementMeal(plan.meals.map((m) => m.id.replace(/^spoon-/, "")));
      if (!rawReplacement) return;
      const [replacement] = await translateMealTitles([rawReplacement]);
      const nextMeals = plan.meals.map((m) => (m.id === mealId ? replacement : m));
      const next = { ...plan, meals: nextMeals };
      saveDailyPlan(next);
      setPlan(next);
    } finally {
      setSwappingId(null);
    }
  }

  function handleCookedIt(meal: Meal) {
    setCookedHistory(markMealCooked(meal.id, meal.title));
  }

  async function handleToggleSteps(meal: Meal) {
    if (expandedStepsId === meal.id) {
      setExpandedStepsId(null);
      return;
    }
    setExpandedStepsId(meal.id);
    if ((meal.steps ?? []).length > 0 || !plan) return;

    setStepsLoadingId(meal.id);
    try {
      const steps = meal.source === "spoonacular" ? await fetchSpoonacularSteps(meal.id) : [];
      const nextMeals = plan.meals.map((m) => (m.id === meal.id ? { ...m, steps } : m));
      const next = { ...plan, meals: nextMeals };
      saveDailyPlan(next);
      setPlan(next);
    } finally {
      setStepsLoadingId(null);
    }
  }

  function handleToggleShopping(mealId: string) {
    setExpandedShoppingId(expandedShoppingId === mealId ? null : mealId);
  }

  function toggleChecked(key: string) {
    if (!plan) return;
    const checkedItems = plan.checkedItems.includes(key)
      ? plan.checkedItems.filter((k) => k !== key)
      : [...plan.checkedItems, key];
    const next = { ...plan, checkedItems };
    saveDailyPlan(next);
    setPlan(next);
  }

  if (plan === undefined || generating) {
    return (
      <div className="mx-auto max-w-md px-4 py-8">
        <div className="h-64 animate-pulse rounded-3xl bg-sand" />
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-md flex-col gap-5 px-4 pt-4 pb-10">
      <div>
        <p className="font-display text-xl font-semibold text-clay">Κουζίνα</p>
        <p className="text-sm text-ink/60">Σημερινές προτάσεις για φαγητό.</p>
      </div>

      <div className="flex flex-col gap-3">
        {plan?.meals.map((meal) => {
          const shoppingList = buildShoppingListForMeal(meal, plan.checkedItems);
          const groupedShopping = shoppingList.reduce<Record<string, typeof shoppingList>>((acc, item) => {
            (acc[item.aisle] ??= []).push(item);
            return acc;
          }, {});

          return (
            <Card key={meal.id} tone="sun" className="flex flex-col gap-2">
              <div className="flex gap-3">
                {meal.image && (
                  // eslint-disable-next-line @next/next/no-img-element -- external Spoonacular/MealDB domain
                  <img src={meal.image} alt={meal.title} className="h-20 w-20 shrink-0 rounded-xl object-cover" />
                )}
                <div className="flex-1">
                  {meal.titleEl && <p className="font-medium text-ink">{meal.titleEl}</p>}
                  <p className={meal.titleEl ? "text-sm text-ink/60" : "font-medium text-ink"}>{meal.title}</p>
                  {meal.readyInMinutes && <p className="text-xs text-ink/50">{meal.readyInMinutes} λεπτά</p>}
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => handleSwap(meal.id)}
                  disabled={swappingId === meal.id}
                  className="rounded-full bg-white/70 px-3 py-1.5 text-xs font-medium text-honey disabled:opacity-50"
                >
                  {swappingId === meal.id ? "…" : "Αλλαγή"}
                </button>
                <button
                  type="button"
                  onClick={() => handleCookedIt(meal)}
                  className="rounded-full bg-white/70 px-3 py-1.5 text-xs font-medium text-honey"
                >
                  Το μαγείρεψα
                </button>
                <button
                  type="button"
                  onClick={() => handleToggleSteps(meal)}
                  className="rounded-full bg-white/70 px-3 py-1.5 text-xs font-medium text-honey"
                >
                  {expandedStepsId === meal.id ? "Απόκρυψη οδηγιών" : "Οδηγίες"}
                </button>
                <button
                  type="button"
                  onClick={() => handleToggleShopping(meal.id)}
                  className="ml-auto rounded-full bg-terracotta-tint px-3 py-1.5 text-xs font-medium text-clay"
                >
                  {expandedShoppingId === meal.id ? "Απόκρυψη λίστας" : "Τι να αγοράσω"}
                </button>
              </div>
              {expandedStepsId === meal.id && (
                stepsLoadingId === meal.id ? (
                  <p className="px-1 text-xs text-ink/50">Φόρτωση οδηγιών…</p>
                ) : (meal.steps ?? []).length > 0 ? (
                  <ol className="flex list-decimal flex-col gap-1.5 rounded-xl bg-white/60 px-4 py-3 pl-8 text-sm text-ink/80 marker:font-medium marker:text-honey">
                    {meal.steps.map((step, i) => (
                      <li key={i}>{step}</li>
                    ))}
                  </ol>
                ) : (
                  <p className="px-1 text-xs text-ink/50">Δεν βρέθηκαν οδηγίες για αυτή τη συνταγή.</p>
                )
              )}
              {expandedShoppingId === meal.id && (
                <div className="flex flex-col gap-2 rounded-xl bg-white/60 px-3 py-3">
                  {shoppingList.length === 0 ? (
                    <p className="text-xs text-ink/50">Δεν βρέθηκαν υλικά για αυτή τη συνταγή.</p>
                  ) : (
                    Object.entries(groupedShopping).map(([aisle, items]) => (
                      <div key={aisle} className="flex flex-col gap-1">
                        <p className="text-xs font-medium text-ink/50">{aisle}</p>
                        {items.map((item) => (
                          <label key={item.key} className="flex items-center gap-2 rounded-xl border border-sand bg-white/70 px-3 py-2 text-sm">
                            <input type="checkbox" checked={item.checked} onChange={() => toggleChecked(item.key)} />
                            <span className={`flex-1 ${item.checked ? "text-ink/40 line-through" : "text-ink"}`}>
                              {item.label}
                              {item.quantities.length > 0 && (
                                <span className="text-ink/50"> — {item.quantities.join(" + ")}</span>
                              )}
                            </span>
                          </label>
                        ))}
                      </div>
                    ))
                  )}
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {cookedHistory.length > 0 && (
        <div className="flex flex-col gap-1.5">
          <p className="font-display text-sm font-semibold text-forest">Ιστορικό μαγειρέματος</p>
          {cookedHistory.slice(0, 8).map((entry, i) => (
            <Card key={`${entry.mealId}-${i}`} tone="plain" className="flex items-center justify-between py-2">
              <p className="text-sm text-ink">{entry.title}</p>
              <p className="text-xs text-ink/40">{entry.date}</p>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

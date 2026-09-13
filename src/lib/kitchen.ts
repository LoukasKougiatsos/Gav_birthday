import { getItem, setItem } from "@/lib/storage";
import { dailySeed } from "@/lib/seed";
import { translateToGreek } from "@/lib/translate";

export interface MealIngredient {
  id: number;
  name: string;
  aisle: string;
  original: string;
  /** Human-readable amount, e.g. "3 medium" or MealDB's plain measure text. */
  quantityText: string;
}

export interface Meal {
  id: string;
  title: string;
  /** Machine-translated Greek title, filled in after generation (see
   * src/lib/translate.ts) - null until that finishes, or if it failed. */
  titleEl: string | null;
  image: string | null;
  servings: number;
  readyInMinutes: number | null;
  sourceUrl: string | null;
  ingredients: MealIngredient[];
  /** Numbered cooking steps, shown inline in Kitchen instead of linking out
   * to the recipe source. Empty if the source didn't provide any. */
  steps: string[];
  source: "spoonacular" | "themealdb";
}

/** Strips Spoonacular's occasional HTML tags/entities from instruction text. */
function stripHtml(text: string): string {
  return text
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

const AISLE_EL: Record<string, string> = {
  produce: "Λαχανικά & Φρούτα",
  dairy: "Γαλακτοκομικά",
  "milk, eggs, other dairy": "Γαλακτοκομικά",
  cheese: "Τυριά",
  meat: "Κρέας",
  seafood: "Ψάρια & Θαλασσινά",
  "spices and seasonings": "Μπαχαρικά",
  baking: "Είδη ζαχαροπλαστικής",
  "bakery/bread": "Αρτοποιείο",
  bread: "Ψωμί",
  cereal: "Δημητριακά",
  "pasta and rice": "Ζυμαρικά & Ρύζι",
  grains: "Δημητριακά & Σπόροι",
  "canned and jarred": "Κονσέρβες",
  condiments: "Καρυκεύματα",
  "oil, vinegar, salad dressing": "Λάδι, Ξύδι & Ντρέσινγκ",
  "nut butters, jams, and honey": "Μέλι & Μαρμελάδες",
  "nuts and seeds": "Ξηροί καρποί & Σπόροι",
  "sweet snacks": "Γλυκά & Σνακ",
  "savory snacks": "Αλμυρά σνακ",
  "tea and coffee": "Τσάι & Καφές",
  beverages: "Ροφήματα",
  "alcoholic beverages": "Ποτά",
  "beer and wine": "Μπύρα & Κρασί",
  frozen: "Κατεψυγμένα",
  refrigerated: "Ψυγείο",
  "health foods": "Είδη υγιεινής διατροφής",
  "ethnic foods": "Διεθνής κουζίνα",
  gourmet: "Γκουρμέ",
  pantry: "Ντουλάπι",
  other: "Άλλα",
};

export function aisleLabel(aisle: string): string {
  const key = aisle.toLowerCase().trim();
  return AISLE_EL[key] ?? aisle ?? "Άλλα";
}

async function fetchFromSpoonacular(count: number, excludeIds: string[]): Promise<Meal[] | null> {
  const params = new URLSearchParams({ number: String(count) });
  if (excludeIds.length > 0) params.set("excludeIds", excludeIds.join(","));

  const res = await fetch(`/api/spoonacular/mealplan?${params.toString()}`);
  if (!res.ok) return null;
  const data = await res.json();
  if (!Array.isArray(data.results)) return null;

  return data.results.map(
    (r: {
      id: number;
      title: string;
      image?: string;
      servings?: number;
      readyInMinutes?: number;
      sourceUrl?: string;
      extendedIngredients?: {
        id: number;
        name?: string;
        nameClean?: string;
        aisle?: string;
        original?: string;
        amount?: number;
        unit?: string;
      }[];
    }) => ({
      id: `spoon-${r.id}`,
      title: r.title,
      titleEl: null,
      image: r.image ?? null,
      servings: r.servings ?? 1,
      readyInMinutes: r.readyInMinutes ?? null,
      sourceUrl: r.sourceUrl ?? null,
      source: "spoonacular" as const,
      ingredients: (r.extendedIngredients ?? []).map((ing) => ({
        id: ing.id,
        name: ing.nameClean ?? ing.name ?? ing.original ?? "ingredient",
        aisle: ing.aisle ?? "Other",
        original: ing.original ?? ing.name ?? "",
        quantityText: [ing.amount ? roundQuantity(ing.amount) : "", ing.unit ?? ""].filter(Boolean).join(" ").trim(),
      })),
      // Spoonacular's complexSearch (even with addRecipeInformation) doesn't
      // include instructions - fetched lazily on demand, see fetchSpoonacularSteps.
      steps: [],
    })
  );
}

/** Lazily fetches a Spoonacular recipe's steps - only called when she
 * actually expands a meal's "Οδηγίες" in the UI, not eagerly for the whole
 * week's plan (see src/app/api/spoonacular/recipe/route.ts for why). */
export async function fetchSpoonacularSteps(mealId: string): Promise<string[]> {
  const id = mealId.replace(/^spoon-/, "");
  const res = await fetch(`/api/spoonacular/recipe?id=${id}`);
  if (!res.ok) return [];
  const data: { instructions?: string; analyzedInstructions?: { steps?: { step: string }[] }[] } = await res.json();

  const fromAnalyzed = data.analyzedInstructions?.[0]?.steps?.map((s) => s.step.trim()).filter(Boolean);
  if (fromAnalyzed && fromAnalyzed.length > 0) return fromAnalyzed;
  if (!data.instructions) return [];
  return stripHtml(data.instructions)
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function roundQuantity(amount: number): string {
  const rounded = Math.round(amount * 100) / 100;
  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(2).replace(/0+$/, "").replace(/\.$/, "");
}

const MEALDB_INGREDIENT_AISLE: { keywords: string[]; aisle: string }[] = [
  {
    aisle: "Produce",
    keywords: [
      "onion", "garlic", "tomato", "pepper", "carrot", "potato", "lemon", "lime", "basil", "parsley",
      "cilantro", "coriander", "lettuce", "spinach", "apple", "banana", "mushroom", "chilli", "chili",
      "ginger", "avocado", "cucumber", "celery", "broccoli",
    ],
  },
  { aisle: "Dairy", keywords: ["milk", "cheese", "butter", "cream", "yogurt", "yoghurt", "egg"] },
];

/** TheMealDB's strInstructions is plain text - usually one step per line,
 * occasionally one big paragraph, so line-splitting is tried first and
 * sentence-splitting is the fallback. */
function stepsFromMealDBInstructions(instructions: string | undefined): string[] {
  if (!instructions) return [];
  const lines = instructions
    .split(/\r?\n/)
    .map((line) => line.replace(/^\d+[.)]\s*/, "").trim())
    .filter(Boolean);
  if (lines.length > 1) return lines;
  return instructions
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function guessAisle(ingredientName: string): string {
  const lower = ingredientName.toLowerCase();
  for (const { aisle, keywords } of MEALDB_INGREDIENT_AISLE) {
    if (keywords.some((kw) => lower.includes(kw))) return aisle;
  }
  return "Pantry";
}

/** TheMealDB has no bulk endpoint or diet filters on its free tier - each
 * meal is a separate random fetch, and health filters simply don't apply
 * here (the brief's "degrade gracefully"). Used only if Spoonacular fails. */
async function fetchFromMealDB(count: number): Promise<Meal[]> {
  const meals = await Promise.all(
    Array.from({ length: count }).map(async () => {
      const res = await fetch("https://www.themealdb.com/api/json/v1/1/random.php");
      const data = await res.json();
      const m = data.meals?.[0];
      if (!m) return null;

      const ingredients: MealIngredient[] = [];
      for (let i = 1; i <= 20; i++) {
        const name = m[`strIngredient${i}`];
        const measure = m[`strMeasure${i}`];
        if (name && name.trim()) {
          ingredients.push({
            id: i,
            name: name.trim(),
            aisle: guessAisle(name),
            original: `${measure ?? ""} ${name}`.trim(),
            quantityText: (measure ?? "").trim(),
          });
        }
      }

      const meal: Meal = {
        id: `mealdb-${m.idMeal}`,
        title: m.strMeal,
        titleEl: null,
        image: m.strMealThumb ?? null,
        servings: 1,
        readyInMinutes: null,
        sourceUrl: m.strSource ?? null,
        source: "themealdb",
        ingredients,
        steps: stepsFromMealDBInstructions(m.strInstructions),
      };
      return meal;
    })
  );
  return meals.filter((m): m is Meal => m !== null);
}

export async function fetchDailyMeals(count = 6, excludeIds: string[] = []): Promise<Meal[]> {
  const fromSpoonacular = await fetchFromSpoonacular(count, excludeIds).catch(() => null);
  if (fromSpoonacular && fromSpoonacular.length > 0) return fromSpoonacular;
  return fetchFromMealDB(count);
}

export async function fetchOneReplacementMeal(excludeIds: string[]): Promise<Meal | null> {
  const meals = await fetchDailyMeals(1, excludeIds);
  return meals[0] ?? null;
}

/** Fills in each meal's Greek title via machine translation - best-effort,
 * a meal keeps titleEl: null if its translation call fails. */
export async function translateMealTitles(meals: Meal[]): Promise<Meal[]> {
  return Promise.all(
    meals.map(async (meal) => ({ ...meal, titleEl: await translateToGreek(meal.title).catch(() => null) }))
  );
}

// --- Daily plan persistence ----------------------------------------------

export interface DailyPlanState {
  dayKey: string;
  meals: Meal[];
  checkedItems: string[]; // ingredient names that are ticked off
}

const PLAN_KEY = "kitchen:plan";
const COOKED_KEY = "kitchen:cookedHistory";

export function loadDailyPlan(): DailyPlanState | null {
  return getItem<DailyPlanState | null>(PLAN_KEY, null);
}

export function saveDailyPlan(plan: DailyPlanState): void {
  setItem(PLAN_KEY, plan);
}

/** Whether the cached plan is still today's. */
export function isPlanCurrent(plan: DailyPlanState | null, date: Date = new Date()): plan is DailyPlanState {
  return Boolean(plan) && plan!.dayKey === dailySeed(date);
}

export interface CookedEntry {
  mealId: string;
  title: string;
  date: string;
}

export function loadCookedHistory(): CookedEntry[] {
  return getItem<CookedEntry[]>(COOKED_KEY, []);
}

export function markMealCooked(mealId: string, title: string, date: string = dailySeed()): CookedEntry[] {
  const next = [{ mealId, title, date }, ...loadCookedHistory()].slice(0, 50);
  setItem(COOKED_KEY, next);
  return next;
}

// --- Shopping list -------------------------------------------------------

export interface ShoppingItem {
  key: string;
  label: string;
  /** Every occurrence's quantity, e.g. ["3 medium", "1 cup"] - a single
   * recipe can still list an ingredient twice, so these aren't reconciled,
   * just listed together for her to eyeball. */
  quantities: string[];
  aisle: string;
  checked: boolean;
}

/** What to buy for one selected recipe, entirely derived from its own
 * ingredients - there's no manual entry, this is the whole list. */
export function buildShoppingListForMeal(meal: Meal, checkedItems: string[]): ShoppingItem[] {
  const merged = new Map<string, ShoppingItem>();

  for (const ing of meal.ingredients) {
    const key = ing.name.toLowerCase().trim();
    if (!key) continue;
    const existing = merged.get(key);
    if (existing) {
      if (ing.quantityText) existing.quantities.push(ing.quantityText);
      continue;
    }
    merged.set(key, {
      key,
      label: ing.name,
      quantities: ing.quantityText ? [ing.quantityText] : [],
      aisle: aisleLabel(ing.aisle),
      checked: checkedItems.includes(key),
    });
  }

  return Array.from(merged.values()).sort((a, b) => a.aisle.localeCompare(b.aisle) || a.label.localeCompare(b.label));
}

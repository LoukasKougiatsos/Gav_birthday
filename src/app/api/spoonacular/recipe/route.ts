import { NextRequest, NextResponse } from "next/server";

/**
 * complexSearch's addRecipeInformation flag does NOT include
 * instructions/analyzedInstructions (confirmed by inspecting a live
 * response) - those only come from this per-recipe endpoint. Called lazily,
 * only when she actually expands a meal's "Οδηγίες", to avoid turning the
 * weekly plan's one-call budget into one-call-per-meal every week.
 */
export async function GET(request: NextRequest) {
  const apiKey = process.env.SPOONACULAR_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "SPOONACULAR_API_KEY not set" }, { status: 501 });
  }

  const id = request.nextUrl.searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "missing id" }, { status: 400 });
  }

  const url = new URL(`https://api.spoonacular.com/recipes/${id}/information`);
  url.searchParams.set("apiKey", apiKey);
  url.searchParams.set("includeNutrition", "false");

  try {
    const res = await fetch(url.toString(), { cache: "no-store" });
    if (!res.ok) {
      return NextResponse.json({ error: `Spoonacular request failed: ${res.status}` }, { status: 502 });
    }
    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Spoonacular request failed" }, { status: 502 });
  }
}

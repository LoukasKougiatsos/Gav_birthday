import { NextRequest, NextResponse } from "next/server";

/**
 * Spoonacular requires a key and has a modest free daily quota, so this
 * stays server-side and the client only ever calls it once per week (see
 * src/lib/kitchen.ts) - one complexSearch call with addRecipeInformation
 * returns everything needed (title, image, ingredients with aisle already
 * tagged, diet flags) in a single request per weekly plan.
 */
export async function GET(request: NextRequest) {
  const apiKey = process.env.SPOONACULAR_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "SPOONACULAR_API_KEY not set" }, { status: 501 });
  }

  const diet = request.nextUrl.searchParams.get("diet");
  const number = request.nextUrl.searchParams.get("number") ?? "6";
  const excludeIds = request.nextUrl.searchParams.get("excludeIds");

  const url = new URL("https://api.spoonacular.com/recipes/complexSearch");
  url.searchParams.set("apiKey", apiKey);
  url.searchParams.set("number", number);
  url.searchParams.set("addRecipeInformation", "true");
  url.searchParams.set("fillIngredients", "true");
  url.searchParams.set("sort", "random");
  if (diet && diet !== "none") url.searchParams.set("diet", diet);
  if (excludeIds) url.searchParams.set("excludeIds", excludeIds);

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

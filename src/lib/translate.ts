/**
 * MyMemory's translation API is keyless and CORS-friendly (verified), used
 * to give Kitchen's recipe titles a Greek line above the original English -
 * Spoonacular/TheMealDB titles are English-only. Machine translation, not
 * perfect, but good enough for a recipe title at a glance.
 */
export async function translateToGreek(text: string): Promise<string | null> {
  try {
    const res = await fetch(
      `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|el`
    );
    if (!res.ok) return null;
    const data = await res.json();
    const translated = data?.responseData?.translatedText;
    return typeof translated === "string" && translated.length > 0 ? translated : null;
  } catch {
    return null;
  }
}

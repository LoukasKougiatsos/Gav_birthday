import { dailySeed, weeklySeed, seededPick } from "@/lib/seed";

/** The weekly dachshund lands on one unpredictable weekday, fixed for the
 * whole week - refreshing must never summon it early or make it vanish. */
export function weeklyDachshundDay(date: Date = new Date()): number {
  const weekdays = [0, 1, 2, 3, 4, 5, 6];
  return seededPick(weekdays, `dachshund-day|${weeklySeed(date)}`);
}

export function isDachshundDayToday(date: Date = new Date()): boolean {
  return date.getDay() === weeklyDachshundDay(date);
}

export interface CuteAnimal {
  imageUrl: string;
  kind: "dog" | "cat" | "duck";
  /** random.dog's feed is mixed media - occasionally an mp4/webm clip
   * rather than a still image, so the caller knows to render a <video>. */
  isVideo: boolean;
}

function isVideoUrl(url: string): boolean {
  return /\.(mp4|webm)$/i.test(url);
}

async function fetchRandomDog(): Promise<CuteAnimal> {
  const res = await fetch("https://random.dog/woof.json");
  const data = await res.json();
  return { imageUrl: data.url, kind: "dog", isVideo: isVideoUrl(data.url) };
}

async function fetchRandomCat(): Promise<CuteAnimal> {
  // aws.random.cat is no longer reachable - TheCatAPI's search endpoint
  // works keyless for this kind of low-volume, no-account use.
  const res = await fetch("https://api.thecatapi.com/v1/images/search");
  const data = await res.json();
  return { imageUrl: data[0].url, kind: "cat", isVideo: false };
}

async function fetchRandomDuck(): Promise<CuteAnimal> {
  // random-d.uk sends no CORS headers, so this goes through /api/duck
  // (a server-side proxy) instead of calling it directly - see that route.
  const res = await fetch("/api/duck");
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? `duck proxy failed: ${res.status}`);
  return { imageUrl: data.imageUrl, kind: "duck", isVideo: false };
}

const CUTE_FETCHERS = [fetchRandomDog, fetchRandomCat, fetchRandomDuck];

/** Which source to hit is date-seeded (stable for the day, like the
 * dachshund), but each source's own endpoint still returns a fresh random
 * image on every call - the caller (CuteCorner) is responsible for caching
 * the fetched result for the day so the photo itself doesn't change on
 * refresh. */
export async function fetchCuteAnimal(date: Date = new Date()): Promise<CuteAnimal> {
  const fetcher = seededPick(CUTE_FETCHERS, `cute-corner|${dailySeed(date)}`);
  return fetcher();
}

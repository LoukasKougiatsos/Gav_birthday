import theatreData from "@/content/theatreShows.json";

/**
 * Curated, not live-scraped-on-request: a scheduled agent refreshes
 * src/content/theatreShows.json roughly weekly (see DEPLOY.md) by reading
 * athinorama.gr's listings and judging which shows are worth featuring -
 * there's no structured "popularity" data anywhere free to sort by, so
 * that judgment call replaces a numeric ranking. This file just reads the
 * committed result; nothing here ever calls out to the network.
 */

export type TheatreShowStatus = "running" | "premiere";

export interface TheatreShow {
  id: string;
  title: string;
  venue: string;
  scheduleText: string;
  priceText: string;
  until: string;
  status: TheatreShowStatus;
  /** YYYY-MM-DD of the refresh that first added this show. The agent sets
   * it once for new shows and never touches it again, so it's how the
   * page tells this week's additions apart from carry-overs. */
  addedAt: string;
  note?: string;
  ticketUrl?: string;
  /** Real poster/thumbnail hotlinked from the source site - not every
   * show has one (a listing page doesn't always surface it), so callers
   * must handle it being absent. */
  posterUrl?: string;
}

interface TheatreShowsFile {
  updatedAt: string;
  source: string;
  shows: TheatreShow[];
}

const data = theatreData as TheatreShowsFile;

export function loadTheatreShows(): TheatreShow[] {
  return data.shows;
}

export function theatreListUpdatedAt(): string {
  return data.updatedAt;
}

/** "New" = part of the most recent batch of additions, as long as that
 * batch came from a refresh within the last week of the list's updatedAt.
 * Keying off the latest batch (not a date window) keeps a mid-week extra
 * run from lumping two batches together; the week cap stops a batch from
 * staying "new" forever when a few refreshes in a row add nothing. */
const NEW_WINDOW_DAYS = 6;

const latestBatch = data.shows.reduce((max, s) => (s.addedAt > max ? s.addedAt : max), "");

export function isNewThisWeek(show: TheatreShow): boolean {
  if (!latestBatch || show.addedAt !== latestBatch) return false;
  const age = Date.parse(data.updatedAt) - Date.parse(latestBatch);
  return age <= NEW_WINDOW_DAYS * 86400000;
}

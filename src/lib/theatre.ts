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

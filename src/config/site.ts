/**
 * ============================================================================
 *  PLACEHOLDERS — edit this file with the real values before relying on
 *  the features that need them. Nothing here is invented; every field below
 *  is `null` until you fill it in, and the components that use it show a
 *  friendly "needs setup" message instead of guessing.
 * ============================================================================
 */

export interface SiteConfig {
  /** PLACEHOLDER: her first name (or nickname), used in the Home greeting. */
  herName: string | null;

  /** PLACEHOLDER: the anniversary date, local time, as "YYYY-MM-DD". Used
   * for the days-together counter. */
  anniversaryDate: string | null;

  /** PLACEHOLDER: home coordinates in Attica, used for weather, the plants'
   * watering adjustment, and the Discover bounding box. */
  homeCoordinates: { lat: number; lon: number } | null;
}

export const SITE_CONFIG: SiteConfig = {
  herName: "κοριτσάκι μου",
  anniversaryDate: "2022-05-22",
  // APPROXIMATE: "Aggelou Sikelianou 4, Argyroupoli" doesn't resolve at
  // house-number precision in OpenStreetMap/Nominatim (that street doesn't
  // appear to be mapped in Argyroupoli at all - only namesakes in other
  // Attica suburbs). This is the Argyroupoli suburb center instead, which is
  // plenty precise for weather/plant-watering purposes but is not the exact
  // address. Replace with an exact pin (e.g. drop a pin in Google Maps and
  // share the lat/lon) if you want it more precise.
  homeCoordinates: { lat: 37.9059946, lon: 23.7503867 },
};

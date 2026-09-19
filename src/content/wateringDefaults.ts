/**
 * Typical watering cadence by plant type, hand-curated from general
 * houseplant/garden care knowledge - not a data feed. Perenual's free tier
 * doesn't return watering/care fields (see the comment on GardenPlant in
 * src/lib/plants.ts), so there's no API that can fill this in; this table
 * is the honest substitute; "baseDays" is the typical indoor interval,
 * adjusted by placement in suggestWateringDays(). Matched by substring
 * against the picked species' common + scientific name, so put multi-word/
 * specific keywords before a generic one from the same family (e.g.
 * "fiddle leaf" before "ficus") - first match wins.
 */
export interface WateringDefault {
  keywords: string[];
  baseDays: number;
}

export const WATERING_DEFAULTS: WateringDefault[] = [
  { keywords: ["fiddle leaf", "ficus lyrata"], baseDays: 7 },
  { keywords: ["rubber plant", "ficus elastica"], baseDays: 9 },
  { keywords: ["ficus"], baseDays: 8 },
  { keywords: ["boston fern", "nephrolepis"], baseDays: 3 },
  { keywords: ["fern"], baseDays: 4 },
  { keywords: ["areca palm", "dypsis"], baseDays: 6 },
  { keywords: ["palm"], baseDays: 7 },
  { keywords: ["snake plant", "sansevieria", "dracaena trifasciata"], baseDays: 16 },
  { keywords: ["zz plant", "zamioculcas"], baseDays: 18 },
  { keywords: ["aloe"], baseDays: 15 },
  { keywords: ["cactus", "cactaceae"], baseDays: 20 },
  { keywords: ["echeveria", "succulent"], baseDays: 14 },
  { keywords: ["peace lily", "spathiphyllum"], baseDays: 5 },
  { keywords: ["orchid", "phalaenopsis"], baseDays: 10 },
  { keywords: ["spider plant", "chlorophytum"], baseDays: 7 },
  { keywords: ["monstera"], baseDays: 7 },
  { keywords: ["money plant", "pothos", "epipremnum"], baseDays: 7 },
  { keywords: ["philodendron"], baseDays: 7 },
  { keywords: ["pilea"], baseDays: 6 },
  { keywords: ["calathea"], baseDays: 5 },
  { keywords: ["peperomia"], baseDays: 9 },
  { keywords: ["african violet", "saintpaulia"], baseDays: 5 },
  { keywords: ["begonia"], baseDays: 5 },
  { keywords: ["hydrangea"], baseDays: 3 },
  { keywords: ["ivy", "hedera"], baseDays: 7 },
  { keywords: ["yucca"], baseDays: 14 },
  { keywords: ["dieffenbachia"], baseDays: 6 },
  { keywords: ["croton", "codiaeum"], baseDays: 6 },
  { keywords: ["anthurium"], baseDays: 6 },
  { keywords: ["azalea", "rhododendron"], baseDays: 3 },
  { keywords: ["geranium", "pelargonium"], baseDays: 5 },
  { keywords: ["hibiscus"], baseDays: 4 },
  { keywords: ["bougainvillea"], baseDays: 7 },
  { keywords: ["jasmine", "jasminum"], baseDays: 4 },
  { keywords: ["lavender", "lavandula"], baseDays: 10 },
  { keywords: ["rosemary", "rosmarinus"], baseDays: 9 },
  { keywords: ["thyme", "thymus"], baseDays: 8 },
  { keywords: ["basil", "ocimum"], baseDays: 3 },
  { keywords: ["mint", "mentha"], baseDays: 3 },
  { keywords: ["parsley", "petroselinum"], baseDays: 3 },
  { keywords: ["rose", "rosa"], baseDays: 4 },
  { keywords: ["tomato", "solanum lycopersicum"], baseDays: 2 },
  { keywords: ["pepper", "capsicum"], baseDays: 3 },
  { keywords: ["cucumber", "cucumis"], baseDays: 2 },
  { keywords: ["olive", "olea"], baseDays: 8 },
  { keywords: ["lemon", "citrus"], baseDays: 6 },
];

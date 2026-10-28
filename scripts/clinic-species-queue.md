# Clinic species queue

The weekly Clinic species scout (routine "Weekly Clinic species scout
(Gemini portraits)") works through this list top to bottom. Every run adds
**seven** animals: the first five unticked **normal** entries and the first
two unticked **rare** entries. It ticks each one off (`[x]`) in the same commit
that adds it.

Edit freely: reorder, swap or add animals and the scout follows whatever is
here. Rules for entries:

- **normal**: native to Greece, a realistic patient at a Greek rescue centre
  (ANIMA, EKPAZ, Aegean Wildlife Hospital, MOm, ARCHELON).
- **rare**: genuinely rare or threatened (IUCN Near Threatened or worse, or
  the Greek Red Data Book), from Greece or anywhere in the world. Gets
  `"rare": true` in `clinicCases.json`.
- Not already in `src/content/clinicCases.json` (compare by `speciesEn`).

Markers the scout uses:

- `[x]` added
- `[!]` skipped after 3 failed portrait attempts; the reason follows. Change
  it back to `[ ]` to have it retried.

When fewer than 14 unticked entries remain, the scout tops up the last
week and appends new ones itself (five normal, two rare per week, same
rules) so the list never runs dry.

## Week of 2026-09-30

- [x] normal | bird | Barn Owl | juvenile
- [x] normal | mammal | Red Squirrel | juvenile
- [x] rare | mammal | Red Panda | juvenile

## Week of 2026-10-07

- [x] normal | reptile | Mediterranean Chameleon | juvenile
- [x] normal | marine | Striped Dolphin | juvenile (calf)
- [x] rare | mammal | Brown Bear | juvenile (cub)

## Week of 2026-10-21

- [x] normal | bird | Eurasian Hoopoe | fledgling
- [x] normal | mammal | European Badger | juvenile
- [x] normal | reptile | Kotschy's Gecko | juvenile
- [x] normal | marine | Common Bottlenose Dolphin | juvenile (calf)
- [x] normal | bird | Eurasian Scops Owl | fledgling
- [x] rare | mammal | Sunda Pangolin | juvenile
- [x] rare | marine | Green Sea Turtle | nestling (hatchling)

## Week of 2026-10-28

- [x] normal | mammal | Golden Jackal | juvenile
- [x] normal | reptile | Aesculapian Snake | juvenile
- [x] normal | mammal | Roe Deer | nestling (fawn)
- [x] normal | bird | European Bee-eater | fledgling
- [x] normal | reptile | Marginated Tortoise | juvenile
- [x] rare | mammal | Bornean Orangutan | nestling (infant)
- [x] rare | bird | Dalmatian Pelican | juvenile

## Week of 2026-11-04

- [x] normal | bird | Common Swift | fledgling
- [x] normal | bird | White Stork | juvenile
- [x] normal | reptile | Balkan Whip Snake | juvenile
- [x] normal | marine | Risso's Dolphin | juvenile (calf)
- [x] normal | reptile | Greek Tortoise | juvenile
- [x] rare | mammal | Koala | nestling (joey)
- [x] rare | bird | Bearded Vulture | juvenile

## Week of 2026-11-11

- [ ] normal | reptile | Caspian Turtle | juvenile
- [ ] normal | marine | Short-beaked Common Dolphin | juvenile (calf)
- [ ] normal | mammal | Pine Marten | juvenile
- [ ] normal | bird | Little Egret | juvenile
- [ ] normal | reptile | Four-lined Snake | juvenile
- [ ] rare | bird | Egyptian Vulture | juvenile
- [ ] rare | mammal | Amur Leopard | juvenile (cub)

## Week of 2026-11-18

- [ ] normal | bird | European Robin | juvenile
- [ ] normal | mammal | Garden Dormouse | juvenile
- [ ] normal | mammal | Egyptian Mongoose | juvenile
- [ ] normal | reptile | Balkan Terrapin | juvenile
- [ ] normal | reptile | Grass Snake | juvenile
- [ ] rare | marine | Fin Whale | juvenile (calf)
- [ ] rare | mammal | Iberian Lynx | juvenile (cub)

## Week of 2026-11-25

- [ ] normal | bird | Woodchat Shrike | juvenile
- [ ] normal | mammal | Wild Boar | juvenile
- [ ] normal | reptile | Leopard Snake | juvenile
- [ ] normal | reptile | Moorish Gecko | juvenile
- [ ] normal | reptile | Balkan Wall Lizard | juvenile
- [ ] rare | marine | Sperm Whale | juvenile (calf)
- [ ] rare | mammal | Snow Leopard | juvenile (cub)

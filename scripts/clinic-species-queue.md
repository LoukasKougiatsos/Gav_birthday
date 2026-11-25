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

- [x] normal | reptile | Caspian Turtle | juvenile
- [x] normal | marine | Short-beaked Common Dolphin | juvenile (calf)
- [x] normal | mammal | Pine Marten | juvenile
- [x] normal | bird | Little Egret | juvenile
- [x] normal | reptile | Four-lined Snake | juvenile
- [x] rare | bird | Egyptian Vulture | juvenile
- [x] rare | mammal | Amur Leopard | juvenile (cub)

## Week of 2026-11-18

- [x] normal | bird | European Robin | juvenile
- [!] normal | mammal | Garden Dormouse | juvenile — no reliable Greek name found; not confirmed native to Greece
- [!] normal | mammal | Egyptian Mongoose | juvenile — not found in Greece (Iberia-only in Europe); no Greek common name found
- [!] normal | mammal | Greater White-toothed Shrew | juvenile — Greek mainland presence unconfirmed/disputed; no species-specific Greek name found
- [x] normal | mammal | Edible Dormouse | juvenile
- [!] normal | reptile | Balkan Terrapin | juvenile — shares Greek name/identity with the existing Caspian Turtle case (Mauremys caspica/rivulata taxonomic overlap)
- [!] normal | reptile | Grass Snake | juvenile — Greek Wikipedia name "Νερόφιδο" duplicates the existing Dice Snake case's display name
- [x] rare | marine | Fin Whale | juvenile (calf)
- [x] rare | mammal | Iberian Lynx | juvenile (cub)

## Week of 2026-11-25

- [x] normal | bird | Woodchat Shrike | juvenile
- [x] normal | mammal | Wild Boar | juvenile
- [x] normal | reptile | Leopard Snake | juvenile
- [x] normal | reptile | Moorish Gecko | juvenile
- [x] normal | reptile | Balkan Wall Lizard | juvenile
- [ ] rare | marine | Sperm Whale | juvenile (calf) — Gemini image quota exhausted mid-run, carried over
- [ ] rare | mammal | Snow Leopard | juvenile (cub) — Gemini image quota exhausted mid-run, carried over

## Week of 2026-12-02

- [x] normal | reptile | European Legless Lizard | juvenile
- [x] normal | reptile | Dahl's Whip Snake | juvenile
- [!] normal | marine | Long-finned Pilot Whale | juvenile (calf) — occurrence in Greek seas is unconfirmed/considered an erroneous historical record (Pelagos/HCMR review), not a realistic Greek rescue-centre patient
- [!] normal | bird | Common Nightingale | fledgling — portrait kept leaving an un-keyed white gap near the legs after 3 attempts
- [ ] normal | mammal | Eurasian Harvest Mouse | juvenile — Gemini image quota exhausted mid-run, carried over
- [ ] rare | reptile | Milos Viper | juvenile
- [ ] rare | mammal | Giant Panda | juvenile (cub)

## Week of 2026-12-09

- [ ] normal | reptile | Balkan Agama | juvenile
- [ ] normal | reptile | Erhard's Wall Lizard | juvenile
- [ ] normal | marine | Common Minke Whale | juvenile (calf)
- [ ] normal | bird | European Goldfinch | fledgling
- [ ] normal | mammal | European Wildcat | juvenile
- [ ] rare | mammal | Eurasian Otter | juvenile
- [ ] rare | bird | African Penguin | juvenile

## Week of 2026-12-16

- [ ] normal | reptile | Snake-eyed Skink | juvenile
- [ ] normal | bird | Eurasian Jay | fledgling
- [ ] normal | bird | European Serin | fledgling
- [ ] normal | mammal | Least Weasel | juvenile
- [ ] normal | mammal | European Mole | juvenile
- [ ] rare | bird | Red-breasted Goose | juvenile
- [ ] rare | marine | Hawksbill Sea Turtle | nestling (hatchling)

# Clinic species queue

The weekly Clinic species scout (routine "Weekly Clinic species scout
(Gemini portraits)") works through this list top to bottom. Every run adds
**three** animals: the first two unticked **normal** entries and the first
unticked **rare** entry. It ticks each one off (`[x]`) in the same commit
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

When fewer than 6 unticked entries remain, the scout appends new ones
itself (two normal, one rare per week, same rules) so the list never runs
dry.

## Week of 2026-09-30

- [x] normal | bird | Barn Owl | juvenile
- [x] normal | mammal | Red Squirrel | juvenile
- [x] rare | mammal | Red Panda | juvenile

## Week of 2026-10-07

- [ ] normal | reptile | Mediterranean Chameleon | juvenile
- [ ] normal | marine | Striped Dolphin | juvenile (calf)
- [ ] rare | mammal | Brown Bear | juvenile (cub)

## Week of 2026-10-14

- [ ] normal | bird | Eurasian Hoopoe | fledgling
- [ ] normal | mammal | European Badger | juvenile
- [ ] rare | mammal | Sunda Pangolin | juvenile

## Week of 2026-10-21

- [ ] normal | reptile | Kotschy's Gecko | juvenile
- [ ] normal | marine | Common Bottlenose Dolphin | juvenile (calf)
- [ ] rare | marine | Green Sea Turtle | nestling (hatchling)

## Week of 2026-10-28

- [ ] normal | bird | Eurasian Scops Owl | fledgling
- [ ] normal | mammal | Golden Jackal | juvenile
- [ ] rare | mammal | Bornean Orangutan | nestling (infant)

## Week of 2026-11-04

- [ ] normal | reptile | Aesculapian Snake | juvenile
- [ ] normal | mammal | Roe Deer | nestling (fawn)
- [ ] rare | bird | Dalmatian Pelican | juvenile

## Week of 2026-11-11

- [ ] normal | bird | European Bee-eater | fledgling
- [ ] normal | reptile | Marginated Tortoise | juvenile
- [ ] rare | mammal | Koala | nestling (joey)

## Week of 2026-11-18

- [ ] normal | bird | Common Swift | fledgling
- [ ] normal | bird | White Stork | juvenile
- [ ] rare | bird | Bearded Vulture | juvenile

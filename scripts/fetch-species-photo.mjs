#!/usr/bin/env node
/**
 * Downloads one real species photo for a Clinic case's info card from
 * iNaturalist and stores it in the site, so the card no longer depends on a
 * live API call (slow, offline-fragile, and the photo could change under us).
 * Writes public/species-photos/<id>.jpg and records the photographer credit
 * in src/content/speciesPhotos.json, which the card shows under the photo.
 *
 *   node scripts/fetch-species-photo.mjs <case-id> [--taxon <inat-taxon-id>] [--pick <n>]
 *   node scripts/fetch-species-photo.mjs --all-missing
 *
 * Looks the case's speciesEn up on iNaturalist (or uses --taxon when the
 * name search lands on the wrong species - it picked the American barn owl
 * and red squirrel over the European ones), and takes the taxon's first
 * Creative Commons licensed photo, never an all-rights-reserved one.
 * --pick <n> takes the nth CC photo instead, for when the first is a poor
 * card photo (a blurry close-up, a mating pair). Prints the matched
 * scientific and common name: check them, and look at the photo.
 *
 * Used by the weekly "Clinic species scout" routine for every new case,
 * alongside its portrait (see DEPLOY.md).
 */
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PHOTOS_DIR = path.join(ROOT, "public", "species-photos");
const MANIFEST = path.join(ROOT, "src", "content", "speciesPhotos.json");
const CASES = path.join(ROOT, "src", "content", "clinicCases.json");
const API = "https://api.inaturalist.org/v1";
/** The card shows the photo at up to ~450 CSS px wide - 900 covers 2x screens. */
const WIDTH = 900;

async function getJson(url) {
  const res = await fetch(url, { headers: { "User-Agent": "koritsaki-mou-species-photos/1.0" } });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return res.json();
}

const isCC = (photo) => typeof photo?.license_code === "string" && photo.license_code.startsWith("cc");

async function findTaxon(speciesEn, taxonId) {
  if (taxonId) return (await getJson(`${API}/taxa/${taxonId}`)).results[0];
  const hit = (await getJson(`${API}/taxa?q=${encodeURIComponent(speciesEn)}&rank=species&per_page=1`)).results[0];
  if (!hit) throw new Error(`No iNaturalist species found for "${speciesEn}" - pass --taxon <id>.`);
  // The search result has only the default photo; the full record has them all.
  return (await getJson(`${API}/taxa/${hit.id}`)).results[0];
}

async function fetchOne(clinicCase, taxonId, pick, manifest) {
  const taxon = await findTaxon(clinicCase.speciesEn, taxonId);
  const candidates = [taxon.default_photo, ...(taxon.taxon_photos ?? []).map((tp) => tp.photo)]
    .filter(isCC)
    .filter((p, i, all) => all.findIndex((q) => q.id === p.id) === i);
  const photo = candidates[pick];
  if (!photo) throw new Error(`${clinicCase.id}: no Creative Commons photo #${pick} on taxon ${taxon.id} (${taxon.name}) - it has ${candidates.length}.`);

  const url = (photo.medium_url ?? photo.url).replace(/\/(square|small|medium|thumb)\./, "/large.");
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${clinicCase.id}: photo download HTTP ${res.status}`);
  const jpeg = await sharp(Buffer.from(await res.arrayBuffer()))
    .rotate()
    .resize({ width: WIDTH, withoutEnlargement: true })
    .jpeg({ quality: 80, mozjpeg: true })
    .toBuffer();

  await mkdir(PHOTOS_DIR, { recursive: true });
  await writeFile(path.join(PHOTOS_DIR, `${clinicCase.id}.jpg`), jpeg);
  manifest[clinicCase.id] = {
    attribution: photo.attribution,
    license: photo.license_code,
    taxonId: taxon.id,
    taxonName: taxon.name,
    source: `https://www.inaturalist.org/photos/${photo.id}`,
  };
  console.log(`${clinicCase.id}: ${taxon.name} (${taxon.preferred_common_name ?? "?"}) - ${photo.license_code}, ${Math.round(jpeg.length / 1024)} KB`);
}

async function main() {
  const args = process.argv.slice(2);
  const taxonIdx = args.indexOf("--taxon");
  const taxonId = taxonIdx >= 0 ? args[taxonIdx + 1] : null;
  const pickIdx = args.indexOf("--pick");
  const pick = pickIdx >= 0 ? Number(args[pickIdx + 1]) : 0;
  const { cases } = JSON.parse(await readFile(CASES, "utf8"));
  const manifest = existsSync(MANIFEST) ? JSON.parse(await readFile(MANIFEST, "utf8")) : {};

  let targets;
  if (args.includes("--all-missing")) {
    targets = cases.filter((c) => !manifest[c.id] || !existsSync(path.join(PHOTOS_DIR, `${c.id}.jpg`)));
  } else {
    const id = args.find((a, i) => !a.startsWith("--") && !["--taxon", "--pick"].includes(args[i - 1]));
    const found = cases.find((c) => c.id === id);
    if (!found) {
      console.error('Usage: node scripts/fetch-species-photo.mjs <case-id> [--taxon <inat-taxon-id>] | --all-missing');
      process.exit(2);
    }
    targets = [found];
  }

  let failed = 0;
  for (const c of targets) {
    try {
      await fetchOne(c, taxonId, pick, manifest);
    } catch (err) {
      failed++;
      console.error(err.message ?? err);
    }
  }
  const sorted = Object.fromEntries(Object.entries(manifest).sort(([a], [b]) => a.localeCompare(b)));
  await writeFile(MANIFEST, JSON.stringify(sorted, null, 2) + "\n");
  if (failed) process.exit(1);
}

main().catch((err) => {
  console.error(err.message ?? err);
  process.exit(1);
});

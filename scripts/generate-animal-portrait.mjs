#!/usr/bin/env node
/**
 * Paints one Clinic portrait with Gemini, in the same field-guide style as
 * the existing ones in public/animals, and writes it as a 512x512
 * transparent PNG to public/animals/<id>.png.
 *
 *   GEMINI_API_KEY=... node scripts/generate-animal-portrait.mjs <case-id> "<subject>" [--photo <url|path>] [--preview <path>]
 *
 * <subject> is a plain English description of the animal as it should
 * appear, e.g. "a juvenile Eurasian hoopoe, crest half raised". --photo is a
 * real photo of the species (e.g. its Wikipedia image) - sent only as an
 * anatomy/markings reference, never a style one, because freehand
 * illustrations of animals come out with wrong markings without one.
 * --preview also writes the portrait flattened onto the site's forest green,
 * where a leftover white halo or an un-keyed patch is easy to spot.
 *
 * Used by the weekly "Clinic species scout" routine (see DEPLOY.md), which
 * looks at every result before committing it - this script can't judge
 * whether the fox actually looks like a fox.
 */
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import sharp from "sharp";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const ANIMALS_DIR = path.join(ROOT, "public", "animals");

/** Existing portraits sent as style references: one mammal, one bird, one
 * reptile, so the model sees the style isn't tied to a body plan. */
const STYLE_REFERENCES = ["red-fox-kit-juvenile", "little-owl-fledgling", "hermanns-tortoise-juvenile"];

/** Tried in order until one exists for this key. GEMINI_IMAGE_MODEL pins one. */
const MODELS = process.env.GEMINI_IMAGE_MODEL
  ? [process.env.GEMINI_IMAGE_MODEL]
  : ["gemini-3.1-flash-image", "gemini-3-pro-image-preview", "gemini-2.5-flash-image"];

const SIZE = 512;
const PADDING = 16;
/** Border-connected pixels at least this bright on every channel count as
 * background. The portraits' cream fur highlights sit well below it, and
 * they're never connected to the edge anyway. */
const WHITE_THRESHOLD = 236;

function parseArgs(argv) {
  const positional = [];
  let photo = null;
  let preview = null;
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === "--photo") photo = argv[++i];
    else if (argv[i] === "--preview") preview = argv[++i];
    else positional.push(argv[i]);
  }
  const [id, subject] = positional;
  if (!id || !subject || !/^[a-z0-9-]+$/.test(id)) {
    console.error('Usage: node scripts/generate-animal-portrait.mjs <case-id> "<subject>" [--photo <url|path>] [--preview <path>]');
    process.exit(2);
  }
  return { id, subject, photo, preview };
}

/** Flattens onto white - the references are transparent PNGs, and the model
 * should see (and reproduce) a plain white background we can key out. */
async function styleReference(id) {
  const buf = await sharp(path.join(ANIMALS_DIR, `${id}.png`)).flatten({ background: "#ffffff" }).png().toBuffer();
  return { inline_data: { mime_type: "image/png", data: buf.toString("base64") } };
}

async function photoReference(source) {
  let buf;
  if (/^https?:\/\//.test(source)) {
    const res = await fetch(source, { headers: { "User-Agent": "koritsaki-mou-portraits/1.0" } });
    if (!res.ok) throw new Error(`Photo fetch failed: HTTP ${res.status} for ${source}`);
    buf = Buffer.from(await res.arrayBuffer());
  } else {
    buf = await readFile(source);
  }
  const jpeg = await sharp(buf).resize(768, 768, { fit: "inside", withoutEnlargement: true }).jpeg({ quality: 85 }).toBuffer();
  return { inline_data: { mime_type: "image/jpeg", data: jpeg.toString("base64") } };
}

function buildPrompt(subject, hasPhoto) {
  return [
    `Paint a new illustration of ${subject}.`,
    "The first three images are existing illustrations from the same field guide: match their style exactly -",
    "hand-drawn vintage field-guide / risograph look, fine stippled and hatched texture, muted warm palette",
    "(ochre, rust, slate blue, cream, charcoal), confident dark linework, and a small soft rosy blush on the cheek.",
    "Full body in a natural side or three-quarter view, the whole animal inside the frame with a little margin,",
    "centered, on a plain pure white background. No ground, no cast shadow, no scenery, no text, no border.",
    hasPhoto
      ? "The last image is a real photo of the species: use it ONLY for accurate anatomy, proportions, colours and markings, not for style or background."
      : "Keep anatomy, proportions, colours and markings accurate to the real species.",
    "Square 1:1 image.",
  ].join(" ");
}

async function callGemini(model, parts, apiKey, withImageConfig) {
  const generationConfig = { responseModalities: ["TEXT", "IMAGE"] };
  if (withImageConfig) generationConfig.imageConfig = { aspectRatio: "1:1" };
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
    body: JSON.stringify({ contents: [{ role: "user", parts }], generationConfig }),
  });
  const body = await res.json().catch(() => ({}));
  return { status: res.status, body };
}

async function generate(parts, apiKey) {
  for (const model of MODELS) {
    let { status, body } = await callGemini(model, parts, apiKey, true);
    // Older image models reject imageConfig - retry once without it.
    if (status === 400 && /imageConfig|aspect/i.test(JSON.stringify(body))) {
      ({ status, body } = await callGemini(model, parts, apiKey, false));
    }
    if (status === 404) {
      console.error(`Model ${model} not available, trying the next one.`);
      continue;
    }
    if (status !== 200) throw new Error(`Gemini ${model} HTTP ${status}: ${JSON.stringify(body).slice(0, 500)}`);
    const outParts = body.candidates?.[0]?.content?.parts ?? [];
    const image = outParts.find((p) => p.inlineData?.data || p.inline_data?.data);
    if (!image) {
      const text = outParts.map((p) => p.text).filter(Boolean).join(" ");
      const reason = body.candidates?.[0]?.finishReason ?? body.promptFeedback?.blockReason ?? "unknown";
      throw new Error(`Gemini ${model} returned no image (reason: ${reason}). ${text}`.trim());
    }
    console.error(`Generated with ${model}.`);
    return Buffer.from((image.inlineData ?? image.inline_data).data, "base64");
  }
  throw new Error(`None of the image models were available: ${MODELS.join(", ")}`);
}

/** Keys out the white background by flood-filling from the border, so white
 * areas *inside* the animal (a gull's chest, a hedgehog's face) stay opaque.
 * Pixels on the fill's edge get partial alpha to avoid a jagged halo. */
async function removeBackground(buf) {
  const { data, info } = await sharp(buf).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width, height } = info;
  const isWhite = (i) => data[i] >= WHITE_THRESHOLD && data[i + 1] >= WHITE_THRESHOLD && data[i + 2] >= WHITE_THRESHOLD;
  const bg = new Uint8Array(width * height);
  const stack = [];
  for (let x = 0; x < width; x++) stack.push(x, (height - 1) * width + x);
  for (let y = 0; y < height; y++) stack.push(y * width, y * width + width - 1);
  while (stack.length) {
    const p = stack.pop();
    if (bg[p] || !isWhite(p * 4)) continue;
    bg[p] = 1;
    const x = p % width;
    const y = (p - x) / width;
    if (x > 0) stack.push(p - 1);
    if (x < width - 1) stack.push(p + 1);
    if (y > 0) stack.push(p - width);
    if (y < height - 1) stack.push(p + width);
  }
  for (let p = 0; p < width * height; p++) {
    const i = p * 4;
    if (bg[p]) {
      data[i + 3] = 0;
      continue;
    }
    const x = p % width;
    const touchesBg =
      (x > 0 && bg[p - 1]) || (x < width - 1 && bg[p + 1]) || (p >= width && bg[p - width]) || (p + width < bg.length && bg[p + width]);
    if (touchesBg) {
      // Light edge pixels are mostly background blended in - fade them.
      const lightness = Math.min(data[i], data[i + 1], data[i + 2]);
      data[i + 3] = Math.round(255 * Math.min(1, (255 - lightness) / (255 - 180)));
    }
  }
  return sharp(data, { raw: { width, height, channels: 4 } }).png().toBuffer();
}

export async function toPortrait(buf) {
  const keyed = await removeBackground(buf);
  const trimmed = await sharp(keyed).trim().toBuffer();
  const inner = SIZE - PADDING * 2;
  return sharp(trimmed)
    .resize(inner, inner, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .extend({ top: PADDING, bottom: PADDING, left: PADDING, right: PADDING, background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png({ compressionLevel: 9 })
    .toBuffer();
}

async function main() {
  const { id, subject, photo, preview } = parseArgs(process.argv.slice(2));
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("GEMINI_API_KEY is not set.");
    process.exit(2);
  }

  const parts = [{ text: buildPrompt(subject, Boolean(photo)) }];
  for (const ref of STYLE_REFERENCES) parts.push(await styleReference(ref));
  if (photo) parts.push(await photoReference(photo));

  const raw = await generate(parts, apiKey);
  const portrait = await toPortrait(raw);
  const outPath = path.join(ANIMALS_DIR, `${id}.png`);
  await writeFile(outPath, portrait);
  console.log(outPath);
  if (preview) {
    await sharp(portrait).flatten({ background: "#3a4a31" }).png().toFile(preview);
    console.log(preview);
  }
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((err) => {
    console.error(err.message ?? err);
    process.exit(1);
  });
}

#!/usr/bin/env node
/**
 * Every built-in Clinic case must ship with its portrait: AnimalSprite
 * assumes /public/animals/<id>.png exists for each one. Exits non-zero
 * (listing the offenders) if a case is missing its PNG, or a PNG isn't the
 * 512x512 transparent format the other portraits use.
 */
import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const { cases } = JSON.parse(await readFile(path.join(ROOT, "src/content/clinicCases.json"), "utf8"));

const problems = [];
for (const { id } of cases) {
  const file = path.join(ROOT, "public/animals", `${id}.png`);
  if (!existsSync(file)) {
    problems.push(`${id}: missing public/animals/${id}.png`);
    continue;
  }
  const { width, height, hasAlpha } = await sharp(file).metadata();
  if (width !== 512 || height !== 512 || !hasAlpha) {
    problems.push(`${id}: expected 512x512 with alpha, got ${width}x${height}${hasAlpha ? "" : " without alpha"}`);
  }
}

if (problems.length) {
  console.error(problems.join("\n"));
  process.exit(1);
}
console.log(`All ${cases.length} clinic cases have portraits.`);

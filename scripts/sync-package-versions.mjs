#!/usr/bin/env node
/**
 * Sets the same semver in root, apps/web, and apps/api package.json files.
 * Usage: node scripts/sync-package-versions.mjs 1.2.3
 * Tag form v1.2.3 is normalized by the caller.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

const raw = process.argv[2]?.trim() ?? "";
const version = raw.startsWith("v") ? raw.slice(1) : raw;

if (!/^\d+\.\d+\.\d+(-[0-9A-Za-z.-]+)?(\+[0-9A-Za-z.-]+)?$/.test(version)) {
  console.error(`sync-package-versions: invalid semver "${raw}"`);
  process.exit(1);
}

const files = [
  "package.json",
  "apps/web/package.json",
  "apps/api/package.json",
];

for (const rel of files) {
  const p = path.join(root, rel);
  const json = JSON.parse(fs.readFileSync(p, "utf8"));
  json.version = version;
  fs.writeFileSync(p, `${JSON.stringify(json, null, 2)}\n`, "utf8");
}

console.log(`sync-package-versions: set version to ${version}`);

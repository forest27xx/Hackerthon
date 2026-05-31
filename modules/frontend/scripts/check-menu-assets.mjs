import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");
const catalogPath = path.join(projectRoot, "src/data/catalog.ts");
const assetDir = path.join(projectRoot, "src/assets/menu");

const normalize = (value) => value.replace(/\s+/g, "").toLowerCase();
const catalog = await readFile(catalogPath, "utf8");
const files = new Set(
  (await readdir(assetDir))
    .filter((file) => /\.(png|jpe?g|webp)$/i.test(file))
    .map((file) => normalize(file.replace(/\.[^.]+$/i, "")))
);

const items = [...catalog.matchAll(/\{\s*name:\s*"([^"]+)",\s*category:\s*"([^"]+)"/g)].map((match) => ({
  name: match[1],
  category: match[2]
}));

const byCategory = new Map();
const missing = [];

for (const item of items) {
  byCategory.set(item.category, (byCategory.get(item.category) ?? 0) + 1);
  if (!files.has(normalize(item.name))) missing.push(item.name);
}

console.log(
  JSON.stringify(
    {
      totalItems: items.length,
      localImages: items.length - missing.length,
      missing,
      counts: Object.fromEntries([...byCategory.entries()].sort(([a], [b]) => a.localeCompare(b)))
    },
    null,
    2
  )
);

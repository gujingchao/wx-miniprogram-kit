#!/usr/bin/env node
import { cpSync, existsSync, mkdirSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const src = join(root, "miniprogram", "components");
const out = join(root, "dist", "components");

mkdirSync(out, { recursive: true });

const names = existsSync(src)
  ? readdirSync(src, { withFileTypes: true })
      .filter((e) => e.isDirectory() && !e.name.startsWith("."))
      .map((e) => e.name)
  : [];

for (const name of names) {
  cpSync(join(src, name), join(out, name), { recursive: true });
}

const manifest = {
  name: "wx-miniprogram-kit",
  version: "0.1.0",
  components: names,
  generatedAt: new Date().toISOString(),
};
writeFileSync(join(root, "dist", "manifest.json"), JSON.stringify(manifest, null, 2) + "\n");
console.log(`build ok: ${names.length} components -> dist/components`);

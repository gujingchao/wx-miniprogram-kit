import { cpSync, existsSync, mkdirSync, readdirSync, statSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ALIAS = {
  empty: "wk-empty",
  skeleton: "wk-skeleton",
  form: "wk-form",
  "form-item": "wk-form-item",
  upload: "wk-uploader",
  uploader: "wk-uploader",
  guard: "wk-page-guard",
  "page-guard": "wk-page-guard",
  button: "wk-permission-button",
  "permission-button": "wk-permission-button",
};

export function parseArgs(argv) {
  const opts = { target: null, only: null, dryRun: false, source: null };
  const rest = [];
  for (let i = 0; i < argv.length; i += 1) {
    const a = argv[i];
    if (a === "--dry-run") opts.dryRun = true;
    else if (a === "--only") {
      opts.only = (argv[++i] || "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    } else if (a.startsWith("--only=")) {
      opts.only = a
        .slice(7)
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    } else if (a === "--source") opts.source = argv[++i];
    else if (a.startsWith("--source=")) opts.source = a.slice(9);
    else if (a === "--help" || a === "-h") opts.help = true;
    else rest.push(a);
  }
  opts.target = rest[0] || null;
  return opts;
}

export function resolveSource(explicit) {
  if (explicit) return resolve(explicit);
  const here = dirname(fileURLToPath(import.meta.url));
  const repoComponents = resolve(here, "../../../miniprogram/components");
  if (existsSync(repoComponents) && hasDirs(repoComponents)) return repoComponents;
  return resolve(here, "../fixtures/components");
}

function hasDirs(dir) {
  try {
    return readdirSync(dir, { withFileTypes: true }).some((e) => e.isDirectory());
  } catch {
    return false;
  }
}

export function listComponents(source, only) {
  const names = readdirSync(source, { withFileTypes: true })
    .filter((e) => e.isDirectory() && !e.name.startsWith("."))
    .map((e) => e.name)
    .sort();
  if (!only || only.length === 0) return names;
  const wanted = only.map((n) => ALIAS[n] || n);
  const missing = wanted.filter((n) => !names.includes(n));
  if (missing.length) throw new Error(`unknown components: ${missing.join(", ")}`);
  return wanted;
}

export function run(argv) {
  const opts = parseArgs(argv);
  if (opts.help || !opts.target) {
    return {
      message: "usage: create-wx-kit <target-miniprogram> [--only empty,guard] [--dry-run]",
    };
  }
  const target = resolve(opts.target);
  if (!existsSync(target) || !statSync(target).isDirectory()) {
    throw new Error(`target is not a directory: ${target}`);
  }
  const source = resolveSource(opts.source);
  const names = listComponents(source, opts.only);
  const destRoot = join(target, "components", "wx-kit");
  const copied = [];
  for (const name of names) {
    const from = join(source, name);
    const to = join(destRoot, name);
    if (!opts.dryRun) {
      mkdirSync(dirname(to), { recursive: true });
      cpSync(from, to, { recursive: true });
    }
    copied.push({ name, from, to });
  }
  const lines = [
    `copied ${copied.length} component(s) -> ${destRoot}`,
    ...copied.map((c) => `  - ${c.name}`),
    "",
    "next: add usingComponents in the page JSON, e.g.",
    '  "wk-empty": "/components/wx-kit/wk-empty/index"',
  ];
  return { copied, destRoot, source, message: lines.join("\n") };
}

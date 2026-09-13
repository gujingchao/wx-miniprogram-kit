import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { parseArgs, run } from "../lib/create.js";

test("parseArgs", () => {
  const o = parseArgs(["./app", "--only", "empty,guard", "--dry-run"]);
  assert.equal(o.target, "./app");
  assert.deepEqual(o.only, ["empty", "guard"]);
  assert.equal(o.dryRun, true);
});

test("copies fixture component into target", () => {
  const dir = mkdtempSync(join(tmpdir(), "wxkit-"));
  try {
    const source = fileURLToPath(new URL("../fixtures/components", import.meta.url));
    const result = run([dir, "--source", source, "--only", "empty"]);
    assert.equal(result.copied.length, 1);
    const wxml = readFileSync(join(dir, "components/wx-kit/wk-empty/index.wxml"), "utf8");
    assert.match(wxml, /title/);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("rejects missing target", () => {
  assert.throws(() => run(["/tmp/wxkit-not-exist-xyz"]), /not a directory/);
});

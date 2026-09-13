#!/usr/bin/env node
import { run } from "../lib/create.js";

const argv = process.argv.slice(2);
try {
  const result = run(argv);
  if (result.message) console.log(result.message);
  process.exit(0);
} catch (err) {
  console.error(`error: ${err instanceof Error ? err.message : err}`);
  process.exit(1);
}

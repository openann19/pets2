#!/usr/bin/env node
import { spawnSync } from "node:child_process";

const steps = [
  ["node","scripts/generate-web-screens.mjs"],
  ["node","scripts/parity-check.mjs"],
  ["pnpm","-w","web:typecheck"],
  ["pnpm","--filter","apps/web","lint"],
  ["pnpm","-w","test:web"],
  ["pnpm","-w","e2e:web"],
  ["pnpm","-w","perf:web"]
];

for (const cmd of steps) {
  const r = spawnSync(cmd[0], cmd.slice(1), { stdio: "inherit" });
  if (r.status !== 0) process.exit(r.status ?? 1);
}
console.log("🎯 Parity loop passed. No gaps detected.");

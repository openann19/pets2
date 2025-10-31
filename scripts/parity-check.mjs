#!/usr/bin/env node
import fg from "fast-glob";
import { readFileSync } from "fs";

const MANIFEST = JSON.parse(readFileSync("parity/screens.json","utf8"));
const missing = [];
for (const [name, cfg] of Object.entries(MANIFEST)) {
  const hits = await fg([`${cfg.webRoute}/**/${name}.orchestrator.web.tsx`]);
  if (!hits.length) missing.push({ name, route: cfg.webRoute });
}
if (missing.length) {
  console.error("❌ Missing web orchestrators:", missing);
  process.exit(2);
}
console.log("✅ All screens present.");

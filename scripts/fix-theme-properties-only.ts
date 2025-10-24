#!/usr/bin/env node
/**
 * Theme Property Access Fixer
 * ONLY fixes Theme.colors.X → Theme.X where X should be at root level
 */

import * as fs from "fs";
import * as path from "path";
import fg from "fast-glob";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MOBILE_DIR = path.join(__dirname, "../apps/mobile");
const DRY_RUN = !process.argv.includes("--write");

let fixCount = 0;

// Fix incorrect Theme property access
function fixThemePropertyAccess() {
  const files = fg.sync("src/**/*.{ts,tsx}", { cwd: MOBILE_DIR, absolute: true });

  files.forEach((file) => {
    let content = fs.readFileSync(file, "utf-8");
    let changed = false;

    const fixes = [
      { from: /Theme\.colors\.shadow/g, to: "Theme.shadow" },
      { from: /Theme\.colors\.glass/g, to: "Theme.glass" },
      { from: /Theme\.colors\.glow/g, to: "Theme.glow" },
      { from: /Theme\.shadows\.glow/g, to: "Theme.glow" },
      { from: /Theme\.colors\.gradients/g, to: "Theme.gradients" },
      { from: /Theme\.typography\.fontWeight\.regular/g, to: "Theme.typography.fontWeight.normal" },
    ];

    fixes.forEach(({ from, to }) => {
      if (from.test(content)) {
        const count = (content.match(from) || []).length;
        content = content.replace(from, to);
        changed = true;
        fixCount += count;
      }
    });

    if (changed && !DRY_RUN) {
      fs.writeFileSync(file, content, "utf-8");
    }
  });
}

// Main
async function main() {
  const mode = DRY_RUN ? "DRY-RUN" : "WRITE";
  // eslint-disable-next-line no-console
  console.log(`🎯 Theme Property Fixer (${mode})...\n`);

  fixThemePropertyAccess();

  // eslint-disable-next-line no-console
  console.log(`✅ Fixed ${fixCount} property access errors\n`);

  if (DRY_RUN) {
    // eslint-disable-next-line no-console
    console.log("💡 Run with --write to apply:");
    // eslint-disable-next-line no-console
    console.log("   pnpm exec tsx scripts/fix-theme-properties-only.ts --write");
  } else {
    // eslint-disable-next-line no-console
    console.log("✨ Done! Check errors: pnpm --dir apps/mobile tsc --noEmit");
  }
}

main();

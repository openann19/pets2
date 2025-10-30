#!/usr/bin/env ts-node

/**
 * CI Gate: Assert Mobile Consistency
 * Run: pnpm check:consistency
 * Fails build on any violations of the new unified theme/animation/component structure
 */

import { readFileSync, readdirSync, existsSync } from "fs";
import { join } from "path";

const root = process.argv[2] || "apps/mobile/src";
const banned = [
  "contexts/ThemeContext",
  "theme/UnifiedThemeProvider",
  "theme/ThemeProvider.tsx",
  "constants/design-tokens",
  "styles/EnhancedDesignTokens",
  "styles/GlobalStyles",
  "components/index.tsx",
  "components/NewComponents",
  "components/EliteComponents",
];

// Also exclude hooks/animations/ but only for direct imports (not subdirectories)
const exemptPatterns = [
  "hooks/usePremiumAnimations.ts",
  "hooks/useUnifiedAnimations.ts",
  "components/index.tsx",
];

let violations: string[] = [];

function walk(p: string): void {
  if (!existsSync(p)) return;

  try {
    const files = readdirSync(p, { withFileTypes: true });

    for (const f of files) {
      const full = join(p, f.name);
      if (f.isDirectory()) {
        walk(full);
      } else if (/\.(ts|tsx)$/.test(f.name)) {
        // Skip exempt files
        const isExempt = exemptPatterns.some((pattern) => full.includes(pattern));
        if (isExempt) continue;

        const s = readFileSync(full, "utf8");
        for (const b of banned) {
          if (s.includes(b) && !full.includes("codemods")) {
            violations.push(`${full} -> ${b}`);
          }
        }
      }
    }
  } catch (err) {
    // Ignore permission errors
  }
}

walk(root);

if (violations.length > 0) {
  console.error("❌ Consistency violations:\n" + violations.map((v) => " - " + v).join("\n"));
  process.exit(1);
}
console.log("✅ Consistency OK");


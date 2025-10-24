#!/usr/bin/env node
/**
 * TS2339 Theme Properties Fixer
 * Adds missing theme properties to unified-theme.ts
 * This fixes the majority of TS2339 errors
 */

import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MOBILE_DIR = path.join(__dirname, "../apps/mobile");
const DRY_RUN = !process.argv.includes("--write");

// Add missing properties to Theme object
function addMissingThemeProperties() {
  const themeFile = path.join(MOBILE_DIR, "src/theme/unified-theme.ts");
  let content = fs.readFileSync(themeFile, "utf-8");

  // Check if semantic already exists
  if (!content.includes("semantic:")) {
    // Find the line with "  // Z-index system" and insert before it
    const zIndexLine = "  // Z-index system\n  zIndex: {";
    const insertPoint = content.indexOf(zIndexLine);

    if (insertPoint !== -1) {
      const semanticCode = `  // Semantic colors for interactive elements
  semantic: {
    interactive: {
      primary: "#db2777",
      secondary: "#0284c7",
      tertiary: "#9ca3af",
    },
    feedback: {
      success: "#10b981",
      warning: "#f59e0b",
      error: "#ef4444",
      info: "#3b82f6",
    },
  },

  // Gradient definitions
  gradients: {
    primary: ["#ec4899", "#db2777"],
    secondary: ["#0ea5e9", "#0284c7"],
    success: ["#10b981", "#059669"],
    warning: ["#f59e0b", "#d97706"],
    error: ["#ef4444", "#dc2626"],
    glass: ["rgba(255, 255, 255, 0.1)", "rgba(255, 255, 255, 0.05)"],
    glow: ["rgba(236, 72, 153, 0.3)", "rgba(236, 72, 153, 0.1)"],
  },

  // Glass morphism effects
  glass: {
    light: {
      backgroundColor: "rgba(255, 255, 255, 0.1)",
      backdropFilter: "blur(10px)",
    },
    dark: {
      backgroundColor: "rgba(0, 0, 0, 0.1)",
      backdropFilter: "blur(10px)",
    },
  },

  // Glow effects
  glow: {
    sm: {
      shadowColor: "#ec4899",
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 3,
    },
    md: {
      shadowColor: "#ec4899",
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.3,
      shadowRadius: 16,
      elevation: 5,
    },
    lg: {
      shadowColor: "#ec4899",
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.4,
      shadowRadius: 24,
      elevation: 8,
    },
  },

  // Shadow effects (alias for shadows.depth)
  shadow: {
    sm: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    },
    md: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 6,
      elevation: 3,
    },
    lg: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.15,
      shadowRadius: 15,
      elevation: 5,
    },
  },

`;

      content = content.slice(0, insertPoint) + semanticCode + content.slice(insertPoint);

      if (!DRY_RUN) {
        fs.writeFileSync(themeFile, content, "utf-8");
        // eslint-disable-next-line no-console
        console.log("✅ Theme properties added successfully!");
      } else {
        // eslint-disable-next-line no-console
        console.log("✅ Would add theme properties (dry-run)");
      }
    }
  } else {
    // eslint-disable-next-line no-console
    console.log("ℹ️  Theme properties already exist");
  }
}

// Main execution
async function main() {
  const mode = DRY_RUN ? "DRY-RUN" : "WRITE";
  // eslint-disable-next-line no-console
  console.log(`🔧 TS2339 Theme Properties Fixer (${mode})...\n`);

  try {
    addMissingThemeProperties();

    if (DRY_RUN) {
      // eslint-disable-next-line no-console
      console.log("\n💡 Run with --write flag to apply changes:");
      // eslint-disable-next-line no-console
      console.log("   pnpm fix:ts2339:write");
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

main();

#!/usr/bin/env tsx
/**
 * Fix Theme Access Patterns
 * Replaces direct nested theme access with helper functions
 */

import { Project, SyntaxKind, Node } from "ts-morph";
import fg from "fast-glob";
import * as fs from "node:fs";
import prettier from "prettier";

const args = process.argv.slice(2);
const WRITE = args.includes("--write");

const patterns = [
  // Text colors
  {
    regex: /Theme\.colors\.text\.primary/g,
    replacement: "getTextColor('primary')",
    import: "getTextColor",
  },
  {
    regex: /Theme\.colors\.text\.secondary/g,
    replacement: "getTextColor('secondary')",
    import: "getTextColor",
  },
  {
    regex: /Theme\.colors\.text\.tertiary/g,
    replacement: "getTextColor('tertiary')",
    import: "getTextColor",
  },
  {
    regex: /Theme\.colors\.text\.inverse/g,
    replacement: "getTextColor('inverse')",
    import: "getTextColor",
  },
  // Background colors
  {
    regex: /Theme\.colors\.background\.primary/g,
    replacement: "getBackgroundColor('primary')",
    import: "getBackgroundColor",
  },
  {
    regex: /Theme\.colors\.background\.secondary/g,
    replacement: "getBackgroundColor('secondary')",
    import: "getBackgroundColor",
  },
  {
    regex: /Theme\.colors\.background\.tertiary/g,
    replacement: "getBackgroundColor('tertiary')",
    import: "getBackgroundColor",
  },
  {
    regex: /Theme\.colors\.background\.inverse/g,
    replacement: "getBackgroundColor('inverse')",
    import: "getBackgroundColor",
  },
  // Border colors
  {
    regex: /Theme\.colors\.border\.light/g,
    replacement: "getBorderColor('light')",
    import: "getBorderColor",
  },
  {
    regex: /Theme\.colors\.border\.medium/g,
    replacement: "getBorderColor('medium')",
    import: "getBorderColor",
  },
  {
    regex: /Theme\.colors\.border\.dark/g,
    replacement: "getBorderColor('dark')",
    import: "getBorderColor",
  },
  // Flat aliases (legacy)
  {
    regex: /Theme\.colors\.textColor/g,
    replacement: "getTextColor('primary')",
    import: "getTextColor",
  },
  {
    regex: /Theme\.colors\.backgroundColor/g,
    replacement: "getBackgroundColor('primary')",
    import: "getBackgroundColor",
  },
  {
    regex: /Theme\.colors\.borderColor/g,
    replacement: "getBorderColor('light')",
    import: "getBorderColor",
  },
  // Primary color shades
  {
    regex: /Theme\.colors\.primary\[500\]/g,
    replacement: "getPrimaryColor(500)",
    import: "getPrimaryColor",
  },
  {
    regex: /Theme\.colors\.primary\[600\]/g,
    replacement: "getPrimaryColor(600)",
    import: "getPrimaryColor",
  },
  {
    regex: /Theme\.colors\.primary\[700\]/g,
    replacement: "getPrimaryColor(700)",
    import: "getPrimaryColor",
  },
  // Status colors
  {
    regex: /Theme\.colors\.status\.success/g,
    replacement: "getStatusColor('success')",
    import: "getStatusColor",
  },
  {
    regex: /Theme\.colors\.status\.error/g,
    replacement: "getStatusColor('error')",
    import: "getStatusColor",
  },
  {
    regex: /Theme\.colors\.status\.warning/g,
    replacement: "getStatusColor('warning')",
    import: "getStatusColor",
  },
  {
    regex: /Theme\.colors\.status\.info/g,
    replacement: "getStatusColor('info')",
    import: "getStatusColor",
  },
];

async function formatFile(filePath: string, code: string) {
  const cfg = (await prettier.resolveConfig(process.cwd())) ?? {};
  return prettier.format(code, { ...cfg, filepath: filePath });
}

async function fixFile(filePath: string) {
  let code = fs.readFileSync(filePath, "utf8");
  let modified = false;
  const importsNeeded = new Set<string>();

  for (const pattern of patterns) {
    if (pattern.regex.test(code)) {
      code = code.replace(pattern.regex, pattern.replacement);
      importsNeeded.add(pattern.import);
      modified = true;
    }
  }

  if (modified && importsNeeded.size > 0) {
    // Add imports if not already present
    const importStatement = `import { ${Array.from(importsNeeded).join(", ")} } from "../../theme/helpers";`;
    
    if (!code.includes("from \"../../theme/helpers\"")) {
      // Find the last import line
      const lines = code.split("\n");
      let lastImportIdx = -1;
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].startsWith("import ")) {
          lastImportIdx = i;
        }
      }
      
      if (lastImportIdx >= 0) {
        lines.splice(lastImportIdx + 1, 0, importStatement);
        code = lines.join("\n");
      }
    }

    if (WRITE) {
      const formatted = await formatFile(filePath, code).catch(() => code);
      fs.writeFileSync(filePath, formatted, "utf8");
      console.log(`✅ Fixed: ${filePath}`);
    } else {
      console.log(`📝 Would fix: ${filePath}`);
    }
  }

  return modified;
}

async function run() {
  const files = await fg(["apps/mobile/src/**/*.{ts,tsx}"], { absolute: true });
  let count = 0;

  for (const file of files) {
    const modified = await fixFile(file);
    if (modified) count++;
  }

  console.log(`\n🔧 Summary: ${count} files would be fixed`);
  if (!WRITE) {
    console.log("💡 Run with --write to apply changes");
  }
}

run().catch(console.error);

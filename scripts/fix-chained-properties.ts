#!/usr/bin/env tsx
/**
 * Chained Property Error Fixer
 * Fixes incorrect chained property access like Theme.colors.text.primary.secondary
 */
import { Project, Node } from "ts-morph";
import fg from "fast-glob";
import * as fs from "node:fs";

const counts = {
  filesFixed: 0,
  primarySecondaryFixed: 0,
  primaryTertiaryFixed: 0,
  secondaryTertiaryFixed: 0,
};

const WRITE = process.argv.includes("--write");

function fixFile(file: any) {
  let touched = false;

  file.forEachDescendant((node: any) => {
    try {
      // Fix Theme.colors.text.primary.secondary → Theme.colors.text.secondary
      if (
        Node.isPropertyAccessExpression(node) &&
        node.getName() === "secondary"
      ) {
        const parent = node.getExpression();
        if (
          Node.isPropertyAccessExpression(parent) &&
          parent.getName() === "primary"
        ) {
          const grandparent = parent.getExpression();
          if (
            Node.isPropertyAccessExpression(grandparent) &&
            grandparent.getName() === "text"
          ) {
            const greatGrandparent = grandparent.getExpression();
            if (
              Node.isPropertyAccessExpression(greatGrandparent) &&
              greatGrandparent.getName() === "colors"
            ) {
              // Replace Theme.colors.text.primary.secondary with Theme.colors.text.secondary
              node.replaceWithText("Theme.colors.text.secondary");
              counts.primarySecondaryFixed++;
              touched = true;
            }
          }
        }
      }

      // Fix Theme.colors.text.primary.tertiary → Theme.colors.text.tertiary
      if (
        Node.isPropertyAccessExpression(node) &&
        node.getName() === "tertiary"
      ) {
        const parent = node.getExpression();
        if (
          Node.isPropertyAccessExpression(parent) &&
          parent.getName() === "primary"
        ) {
          const grandparent = parent.getExpression();
          if (
            Node.isPropertyAccessExpression(grandparent) &&
            grandparent.getName() === "text"
          ) {
            const greatGrandparent = grandparent.getExpression();
            if (
              Node.isPropertyAccessExpression(greatGrandparent) &&
              greatGrandparent.getName() === "colors"
            ) {
              // Replace Theme.colors.text.primary.tertiary with Theme.colors.text.tertiary
              node.replaceWithText("Theme.colors.text.tertiary");
              counts.primaryTertiaryFixed++;
              touched = true;
            }
          }
        }
      }
    } catch (e) {
      // Skip nodes that can't be safely replaced
    }
  });

  return touched;
}

(async function run() {
  const project = new Project({
    tsConfigFilePath: fs.existsSync("apps/mobile/tsconfig.json")
      ? "apps/mobile/tsconfig.json"
      : undefined,
    skipAddingFilesFromTsConfig: true,
  });

  const files = await fg(["apps/mobile/src/**/*.{ts,tsx}"], { absolute: true });
  const sf = project.addSourceFilesAtPaths(files);

  for (const file of sf) {
    if (fixFile(file)) {
      counts.filesFixed++;
    }
  }

  if (WRITE) {
    await project.save();
  }

  const pad = (k: string) => k.padEnd(30, " ");
  console.log("\n🔗 Chained Property Fixer Summary (dry-run:", !WRITE, ")\n");
  console.log(pad("Files fixed") + counts.filesFixed);
  console.log(pad("text.primary.secondary → text.secondary") + counts.primarySecondaryFixed);
  console.log(pad("text.primary.tertiary → text.tertiary") + counts.primaryTertiaryFixed);
  console.log("\n💡 Tip: run with --write to apply changes.\n");
})();

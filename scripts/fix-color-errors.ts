#!/usr/bin/env tsx
/**
 * Color Error Fixer
 * Fixes common Theme color property errors in mobile app
 */
import { Project, Node } from "ts-morph";
import fg from "fast-glob";
import * as fs from "node:fs";

const counts = {
  filesFixed: 0,
  cardFixed: 0,
  secondaryFixed: 0,
  primaryFixed: 0,
  tertiaryFixed: 0,
  gradientsFixed: 0,
  glyphMapFixed: 0,
  regularFixed: 0,
  accentFixed: 0,
  inverseFixed: 0,
};

const WRITE = process.argv.includes("--write");

function fixFile(file: any) {
  let touched = false;

  file.forEachDescendant((node: any) => {
    try {
      // Fix Theme.colors.card → Theme.colors.background.primary
      if (
        Node.isPropertyAccessExpression(node) &&
        node.getExpression().getText() === "Theme.colors" &&
        node.getName() === "card"
      ) {
        node.replaceWithText("Theme.colors.background.primary");
        counts.cardFixed++;
        touched = true;
      }

      // Fix Theme.colors.secondary (when used as color value, not namespace)
      if (
        Node.isPropertyAccessExpression(node) &&
        node.getExpression().getText() === "Theme.colors" &&
        node.getName() === "secondary"
      ) {
        const parent = node.getParent();
        // Only fix if not being accessed further (i.e., not Theme.colors.secondary[500])
        if (!Node.isElementAccessExpression(parent) && !Node.isPropertyAccessExpression(parent)) {
          node.replaceWithText("Theme.colors.secondary[500]");
          counts.secondaryFixed++;
          touched = true;
        }
      }

      // Fix Theme.colors.primary (when used as color value, not namespace)
      if (
        Node.isPropertyAccessExpression(node) &&
        node.getExpression().getText() === "Theme.colors" &&
        node.getName() === "primary"
      ) {
        const parent = node.getParent();
        if (!Node.isElementAccessExpression(parent) && !Node.isPropertyAccessExpression(parent)) {
          node.replaceWithText("Theme.colors.primary[500]");
          counts.primaryFixed++;
          touched = true;
        }
      }

      // Fix Theme.colors.tertiary → Theme.colors.neutral[400]
      if (
        Node.isPropertyAccessExpression(node) &&
        node.getExpression().getText() === "Theme.colors" &&
        node.getName() === "tertiary"
      ) {
        node.replaceWithText("Theme.colors.neutral[400]");
        counts.tertiaryFixed++;
        touched = true;
      }

      // Fix Theme.colors.accent → Theme.colors.primary[500]
      if (
        Node.isPropertyAccessExpression(node) &&
        node.getExpression().getText() === "Theme.colors" &&
        node.getName() === "accent"
      ) {
        node.replaceWithText("Theme.colors.primary[500]");
        counts.accentFixed++;
        touched = true;
      }

      // Fix Theme.colors.inverse → Theme.colors.text.inverse
      if (
        Node.isPropertyAccessExpression(node) &&
        node.getExpression().getText() === "Theme.colors" &&
        node.getName() === "inverse"
      ) {
        node.replaceWithText("Theme.colors.text.inverse");
        counts.inverseFixed++;
        touched = true;
      }

      // Fix Theme.colors.gradients → Theme.colors.primary (or handle separately)
      if (
        Node.isPropertyAccessExpression(node) &&
        node.getExpression().getText() === "Theme.colors" &&
        node.getName() === "gradients"
      ) {
        // Gradients don't exist in theme, skip or use primary
        counts.gradientsFixed++;
        touched = true;
      }

      // Fix Ionicons.glyphMap → just use string
      if (
        Node.isPropertyAccessExpression(node) &&
        node.getExpression().getText() === "Ionicons" &&
        node.getName() === "glyphMap"
      ) {
        // This is a namespace access, mark but don't fix (needs context)
        counts.glyphMapFixed++;
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
  console.log("\n🎨 Color Error Fixer Summary (dry-run:", !WRITE, ")\n");
  console.log(pad("Files fixed") + counts.filesFixed);
  console.log(pad("card → background.primary") + counts.cardFixed);
  console.log(pad("secondary (value)") + counts.secondaryFixed);
  console.log(pad("primary (value)") + counts.primaryFixed);
  console.log(pad("tertiary → neutral[400]") + counts.tertiaryFixed);
  console.log(pad("accent → primary[500]") + counts.accentFixed);
  console.log(pad("inverse → text.inverse") + counts.inverseFixed);
  console.log(pad("gradients (skipped)") + counts.gradientsFixed);
  console.log(pad("glyphMap (found)") + counts.glyphMapFixed);
  console.log("\n💡 Tip: run with --write to apply changes.\n");
})();

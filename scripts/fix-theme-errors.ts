#!/usr/bin/env tsx
/**
 * Theme Error Fixer
 * Fixes common Theme property errors in mobile app
 */
import { Project, SyntaxKind, Node } from "ts-morph";
import fg from "fast-glob";
import * as fs from "node:fs";

const counts = {
  filesFixed: 0,
  surfaceFixed: 0,
  sizesFixed: 0,
  weightsFixed: 0,
  lineHeightsFixed: 0,
  successFixed: 0,
  warningFixed: 0,
  errorFixed: 0,
  textFixed: 0,
  textMutedFixed: 0,
};

const WRITE = process.argv.includes("--write");

function fixFile(file: any) {
  let touched = false;

  file.forEachDescendant((node: any) => {
    try {
      // Fix Theme.colors.surface → Theme.colors.background.primary
      if (
        Node.isPropertyAccessExpression(node) &&
        node.getExpression().getText() === "Theme.colors" &&
        node.getName() === "surface"
      ) {
        node.replaceWithText("Theme.colors.background.primary");
        counts.surfaceFixed++;
        touched = true;
      }

      // Fix Theme.typography.sizes → Theme.typography.fontSize
      if (
        Node.isPropertyAccessExpression(node) &&
        node.getExpression().getText() === "Theme.typography" &&
        node.getName() === "sizes"
      ) {
        node.replaceWithText("Theme.typography.fontSize");
        counts.sizesFixed++;
        touched = true;
      }

      // Fix Theme.typography.weights → Theme.typography.fontWeight
      if (
        Node.isPropertyAccessExpression(node) &&
        node.getExpression().getText() === "Theme.typography" &&
        node.getName() === "weights"
      ) {
        node.replaceWithText("Theme.typography.fontWeight");
        counts.weightsFixed++;
        touched = true;
      }

      // Fix Theme.typography.lineHeights → Theme.typography.lineHeight
      if (
        Node.isPropertyAccessExpression(node) &&
        node.getExpression().getText() === "Theme.typography" &&
        node.getName() === "lineHeights"
      ) {
        node.replaceWithText("Theme.typography.lineHeight");
        counts.lineHeightsFixed++;
        touched = true;
      }

      // Fix Theme.colors.success → Theme.colors.status.success
      if (
        Node.isPropertyAccessExpression(node) &&
        node.getExpression().getText() === "Theme.colors" &&
        node.getName() === "success"
      ) {
        node.replaceWithText("Theme.colors.status.success");
        counts.successFixed++;
        touched = true;
      }

      // Fix Theme.colors.warning → Theme.colors.status.warning
      if (
        Node.isPropertyAccessExpression(node) &&
        node.getExpression().getText() === "Theme.colors" &&
        node.getName() === "warning"
      ) {
        node.replaceWithText("Theme.colors.status.warning");
        counts.warningFixed++;
        touched = true;
      }

      // Fix Theme.colors.error → Theme.colors.status.error
      if (
        Node.isPropertyAccessExpression(node) &&
        node.getExpression().getText() === "Theme.colors" &&
        node.getName() === "error"
      ) {
        node.replaceWithText("Theme.colors.status.error");
        counts.errorFixed++;
        touched = true;
      }

      // Fix Theme.colors.text → Theme.colors.text.primary
      if (
        Node.isPropertyAccessExpression(node) &&
        node.getExpression().getText() === "Theme.colors" &&
        node.getName() === "text"
      ) {
        // Only fix if it's being used as a value, not as a namespace
        const parent = node.getParent();
        if (!Node.isPropertyAccessExpression(parent)) {
          node.replaceWithText("Theme.colors.text.primary");
          counts.textFixed++;
          touched = true;
        }
      }

      // Fix Theme.colors.textMuted → Theme.colors.text.secondary
      if (
        Node.isPropertyAccessExpression(node) &&
        node.getExpression().getText() === "Theme.colors" &&
        node.getName() === "textMuted"
      ) {
        node.replaceWithText("Theme.colors.text.secondary");
        counts.textMutedFixed++;
        touched = true;
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
  console.log("\n🔧 Theme Error Fixer Summary (dry-run:", !WRITE, ")\n");
  console.log(pad("Files fixed") + counts.filesFixed);
  console.log(pad("surface → background.primary") + counts.surfaceFixed);
  console.log(pad("sizes → fontSize") + counts.sizesFixed);
  console.log(pad("weights → fontWeight") + counts.weightsFixed);
  console.log(pad("lineHeights → lineHeight") + counts.lineHeightsFixed);
  console.log(pad("success → status.success") + counts.successFixed);
  console.log(pad("warning → status.warning") + counts.warningFixed);
  console.log(pad("error → status.error") + counts.errorFixed);
  console.log(pad("text → text.primary") + counts.textFixed);
  console.log(pad("textMuted → text.secondary") + counts.textMutedFixed);
  console.log("\n💡 Tip: run with --write to apply changes.\n");
})();

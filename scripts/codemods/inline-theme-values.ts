#!/usr/bin/env ts-node
import { Project, SyntaxKind, Node } from 'ts-morph';

const project = new Project({ tsConfigFilePath: 'tsconfig.json' });
const files = project.getSourceFiles('apps/mobile/src/**/*.{ts,tsx}');

let updated = 0;

for (const sf of files) {
  let fileChanged = false;

  const functions = sf.getFunctions().filter((fn) => fn.getName()?.startsWith('__makeStyles_'));
  const statements = sf
    .getStatements()
    .filter((st) => Node.isFunctionDeclaration(st) && st.getName()?.startsWith('__makeStyles_'));

  // Include function expressions assigned to const? Codemod uses function declarations only, so above suffices.

  for (const fn of functions) {
    const params = fn.getParameters();
    if (params.length === 0) continue;
    const themeParam = params[0].getName();

    fn.forEachDescendant((node) => {
      if (Node.isIdentifier(node) && node.getText() === 'Theme') {
        node.replaceWithText(themeParam);
        fileChanged = true;
      } else if (Node.isStringLiteral(node)) {
        const value = node.getLiteralText();
        if (value.startsWith('Theme.')) {
          const replacement = value.replace(/^Theme\./, `${themeParam}.`);
          node.replaceWithText(replacement);
          fileChanged = true;
        } else if (value.includes('Theme.')) {
          const replacement = value.replace(/Theme\./g, `${themeParam}.`);
          // Preserve string literal for values meant to be textual by wrapping with backticks? Instead convert to template? We'll convert to expression array? For now, replace entire literal with expression string
          node.replaceWithText(replacement);
          fileChanged = true;
        }
      }
    });
  }

  if (fileChanged) {
    updated++;
  }
}

if (updated > 0) {
  project.saveSync();
}

console.log(`[codemod:inline-theme-values] Updated files: ${updated}`);

#!/usr/bin/env ts-node
/**
 * Codemod: Fix BigInt in JSX children
 * Rewrites JSX children that are `bigint` to `String(expr)` to satisfy ReactNode.
 */
import { Project, SyntaxKind, JsxExpression } from 'ts-morph';

const project = new Project({ tsConfigFilePath: 'tsconfig.json' });
const files = project.getSourceFiles(['**/*.tsx']);

let changed = 0;

for (const sf of files) {
  let fileChanged = false;
  const jsxExprs = sf.getDescendantsOfKind(SyntaxKind.JsxExpression);
  for (const j of jsxExprs) {
    const expr = (j as JsxExpression).getExpression();
    if (!expr) continue;

    const type = expr.getType();
    const text = type.getText();
    const looksBigInt = type.isBigInt() || /\bbigint\b/.test(text);

    // Skip if already stringified/template
    const code = expr.getText();
    const alreadyStr = /^String\(/.test(code) || /^`/.test(code) || /\.toString\(\)/.test(code);

    if (looksBigInt && !alreadyStr) {
      expr.replaceWithText(`String(${code})`);
      changed++;
      fileChanged = true;
    }
  }

  if (fileChanged) {
    sf.saveSync();
  }
}

console.log(`[codemod:fix-bigint-in-jsx] Updated nodes: ${changed}`);

// scripts/ea-enhanced.ts
import { globby } from 'globby';
import { execa } from 'execa';
import { Project, SyntaxKind, Node, SourceFile } from 'ts-morph';
import { mkdir, writeFile } from 'fs/promises';
import path from 'node:path';
import process from 'node:process';
import {
  COLOR_MAP,
  SPACING_MAP,
  RADII_MAP,
  IMPORT_ALIAS_MAP,
  DEFAULT_SCOPES,
  IGNORE,
} from './ea-config';

type Edit = { kind: string; from: string; to: string; pos?: number };
type FileReport = { file: string; edits: Edit[] };

const WRITE = process.argv.includes('--write');
const reportArgIdx = process.argv.indexOf('--report');
const scopeArgIdx = process.argv.indexOf('--scope');
const reportDir =
  reportArgIdx > -1 && process.argv[reportArgIdx + 1]
    ? process.argv[reportArgIdx + 1]
    : `_reports/ea_${new Date().toISOString().replace(/[:.]/g, '-')}`;

const scopes =
  scopeArgIdx > -1 && process.argv[scopeArgIdx + 1]
    ? process.argv[scopeArgIdx + 1].split(',').map((s) => s.trim())
    : DEFAULT_SCOPES;

const MONOREPO_TSCONFIG = 'apps/mobile/tsconfig.json';

const log = (msg: string) => console.log(`[EA] ${msg}`);

function isWithinQuotes(text: string, start: number): boolean {
  // Best-effort: check a small window before the match for quotes
  const slice = text.slice(Math.max(0, start - 3), start + 1);
  return /['"`]\s*$/.test(slice);
}

function recordEdit(report: FileReport, e: Edit) {
  report.edits.push(e);
}

function propertyPath(node: Node): string | null {
  // Returns dotted path for PropertyAccessExpression chains (e.g., theme.colors.text)
  if (node.getKind() !== SyntaxKind.PropertyAccessExpression) return null;
  let cur: Node | undefined = node;
  const parts: string[] = [];
  while (cur && cur.getKind() === SyntaxKind.PropertyAccessExpression) {
    const pae = cur.asKindOrThrow(SyntaxKind.PropertyAccessExpression);
    parts.unshift(pae.getName());
    cur = pae.getExpression();
  }
  if (cur && Node.isIdentifier(cur)) parts.unshift(cur.getText());
  return parts.join('.');
}

function replaceModuleSpecifierIfAliased(sf: SourceFile, report: FileReport) {
  for (const decl of sf.getImportDeclarations()) {
    const mod = decl.getModuleSpecifierValue();
    for (const [from, to] of Object.entries(IMPORT_ALIAS_MAP)) {
      if (mod === from || mod.startsWith(from + '/')) {
        const rest = mod.slice(from.length);
        const next = to + rest;
        decl.setModuleSpecifier(next);
        recordEdit(report, { kind: 'import-alias', from: mod, to: next });
        break;
      }
    }
  }
}

function applyColorMap(sf: SourceFile, report: FileReport) {
  // 1) Map property chains (theme.colors.xxx)
  sf.forEachDescendant((node) => {
    if (
      node.getKind() === SyntaxKind.PropertyAccessExpression ||
      node.getKind() === SyntaxKind.ElementAccessExpression
    ) {
      const text = node.getText();
      for (const [from, to] of Object.entries(COLOR_MAP)) {
        // Handle exact element access keys (e.g., theme.colors.neutral[500])
        if (from.includes('[') && text === from) {
          node.replaceWithText(to);
          recordEdit(report, { kind: 'color-map', from, to, pos: node.getStart() });
          return;
        }
        // Handle property access chains (no bracket)
        if (!from.includes('[')) {
          const path = node.getKind() === SyntaxKind.PropertyAccessExpression ? propertyPath(node) : null;
          if (path === from) {
            node.replaceWithText(to);
            recordEdit(report, { kind: 'color-map', from, to, pos: node.getStart() });
            return;
          }
        }
      }
      // Collapse `theme.colors.something[NNN]` to mapped base if base is mapped,
      // or keep same base but drop shade if no explicit map for that shade.
      if (node.getKind() === SyntaxKind.ElementAccessExpression) {
        const e = node.asKindOrThrow(SyntaxKind.ElementAccessExpression);
        const expr = e.getExpression().getText(); // e.g., theme.colors.secondary
        const literal = e.getArgumentExpression()?.getText() ?? '';
        if (/^theme\.colors\.[A-Za-z0-9_]+$/.test(expr) && /^\d{2,3}$/.test(literal)) {
          const explicit = COLOR_MAP[`${expr}[${literal.replaceAll("'", '').replaceAll('"', '')}]`];
          if (explicit) {
            e.replaceWithText(explicit);
            recordEdit(report, { kind: 'color-shade-explicit', from: `${expr}[${literal}]`, to: explicit, pos: e.getStart() });
          } else {
            const mappedBase = COLOR_MAP[expr] ?? expr.replace(/^theme\.colors\./, 'theme.colors.');
            e.replaceWithText(mappedBase);
            recordEdit(report, { kind: 'color-shade-collapse', from: `${expr}[${literal}]`, to: mappedBase, pos: e.getStart() });
          }
        }
      }
    }
  });
}

function applySpacingAndRadii(sf: SourceFile, report: FileReport) {
  // Binary expressions for spacing hacks like spacing.lg * 2
  sf.forEachDescendant((node) => {
    if (node.getKind() === SyntaxKind.BinaryExpression) {
      const t = node.getText();
      for (const [from, to] of Object.entries(SPACING_MAP)) {
        if (t === from) {
          node.replaceWithText(to);
          recordEdit(report, { kind: 'spacing-hack', from, to, pos: node.getStart() });
        }
      }
    }
    if (
      node.getKind() === SyntaxKind.PropertyAccessExpression ||
      node.getKind() === SyntaxKind.ElementAccessExpression
    ) {
      const t = node.getText();
      for (const [from, to] of Object.entries(SPACING_MAP)) {
        if (!from.includes('*') && t === from) {
          node.replaceWithText(to);
          recordEdit(report, { kind: 'spacing-token', from, to, pos: node.getStart() });
        }
      }
      for (const [from, to] of Object.entries(RADII_MAP)) {
        if (t === from) {
          node.replaceWithText(to);
          recordEdit(report, { kind: 'radii-token', from, to, pos: node.getStart() });
        }
      }
    }
  });
}

async function run(cmd: string, args: string[]) {
  await execa(cmd, args, { stdio: 'inherit' });
}

(async () => {
  log(`Enhanced Error Annihilator — dry-run: ${!WRITE}`);
  log(`Scopes: ${scopes.join(', ')}`);
  log(`Report dir: ${reportDir}`);

  // Fast wins before AST work
  try {
    await run('pnpm', ['-s', 'lint:fix']);
  } catch {
    // continue; we still want to proceed
  }

  const files = await globby(scopes, { gitignore: true, ignore: IGNORE });
  const project = new Project({
    tsConfigFilePath: MONOREPO_TSCONFIG,
    skipAddingFilesFromTsConfig: false,
    manipulationSettings: { quoteKind: '"', useTrailingCommas: true },
  });

  files.forEach((f) => project.addSourceFileAtPathIfExists(f));

  const reports: FileReport[] = [];
  let changed = 0;

  for (const sf of project.getSourceFiles()) {
    const report: FileReport = { file: sf.getFilePath(), edits: [] };

    // Import alias normalization
    replaceModuleSpecifierIfAliased(sf, report);

    // Theme/color conversions
    applyColorMap(sf, report);

    // Spacing/radii conversions
    applySpacingAndRadii(sf, report);

    // Imports cleanup
    try {
      sf.fixMissingImports();
      sf.organizeImports();
    } catch {}

    if (report.edits.length > 0) {
      changed++;
      reports.push(report);
      if (WRITE) await sf.save();
    }
  }

  await mkdir(reportDir, { recursive: true });
  await writeFile(
    path.join(reportDir, 'ea_report.json'),
    JSON.stringify({ changedFiles: changed, reports }, null, 2),
    'utf8',
  );

  log(
    WRITE
      ? `✅ Wrote changes to ${changed} file(s). Report at ${reportDir}/ea_report.json`
      : `ℹ️ Would change ~${changed} file(s). See report at ${reportDir}/ea_report.json`,
  );

  // Final format + typecheck (non-fatal)
  if (WRITE) {
    try { await run('pnpm', ['-s', 'format']); } catch {}
  }
  try { await run('pnpm', ['-s', 'mobile:tsc']); } catch {}

  log('Done.');
})();

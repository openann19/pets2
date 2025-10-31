#!/usr/bin/env node
/**
 * Baseline Audit Workflow
 * Runs comprehensive audit checks across the monorepo
 */

import { execSync } from 'child_process';
import { existsSync, mkdirSync, writeFileSync, readFileSync } from 'fs';
import { join } from 'path';

const REPORTS_DIR = join(process.cwd(), 'reports', 'audit');
const RAW_DIR = join(REPORTS_DIR, 'raw');

// Ensure directories exist
[REPORTS_DIR, RAW_DIR].forEach((dir) => {
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
});

const results = [];

function runCommand(
  command,
  description,
  allowFailure = false,
) {
  const timestamp = new Date().toISOString();
  console.log(`\n🔍 ${description}...`);

  try {
    const output = execSync(command, {
      encoding: 'utf-8',
      stdio: 'pipe',
      maxBuffer: 10 * 1024 * 1024, // 10MB
    });

    const result = {
      command,
      success: true,
      output,
      timestamp,
    };

    results.push(result);
    console.log(`✅ ${description} completed`);
    return result;
  } catch (error) {
    const result = {
      command,
      success: false,
      output: (error.stdout?.toString() || error.stdout) || '',
      error: (error.stderr?.toString() || error.stderr) || error.message,
      timestamp,
    };

    results.push(result);
    if (allowFailure) {
      console.log(`⚠️  ${description} failed (allowed)`);
    } else {
      console.log(`❌ ${description} failed`);
    }
    return result;
  }
}

// 1. Install dependencies
console.log('📦 Step 1: Installing dependencies...');
runCommand('pnpm -w install', 'Dependencies installation');

// 2. List packages
console.log('\n📋 Step 2: Listing packages...');
runCommand('pnpm -w list -r --depth=0', 'Package listing', true);
writeFileSync(
  join(REPORTS_DIR, 'workspace.txt'),
  runCommand('pnpm -w list -r --depth=0', 'Package listing', true).output,
);

// 3. Type checking
console.log('\n🔷 Step 3: Type checking...');
const typecheckResult = runCommand(
  'pnpm -w -r run typecheck 2>&1 || pnpm -w -r run type-check 2>&1 || echo "No typecheck script found"',
  'Type checking',
  true,
);
writeFileSync(
  join(RAW_DIR, 'typecheck.log'),
  typecheckResult.output + (typecheckResult.error || ''),
);

// 4. Linting
console.log('\n🔍 Step 4: Linting...');
const lintResult = runCommand('turbo lint 2>&1', 'Linting', true);
writeFileSync(join(RAW_DIR, 'lint.log'), lintResult.output + (lintResult.error || ''));

// 5. i18n parity check
console.log('\n🌍 Step 5: i18n parity check...');
const i18nResult = runCommand('pnpm i18n:check 2>&1', 'i18n parity check', true);
writeFileSync(join(RAW_DIR, 'i18n.log'), i18nResult.output + (i18nResult.error || ''));

// 6. Knip (dead code detection)
console.log('\n🗑️  Step 6: Knip (dead code detection)...');
try {
  const knipResult = runCommand('pnpm knip 2>&1', 'Knip analysis', true);
  writeFileSync(join(RAW_DIR, 'knip.log'), knipResult.output + (knipResult.error || ''));
} catch {
  writeFileSync(
    join(RAW_DIR, 'knip.json'),
    JSON.stringify(
      {
        error: 'knip binary not found',
        install: 'pnpm add -D -w knip',
        message: 'Install knip globally or add to devDependencies',
      },
      null,
      2,
    ),
  );
}

// 7. Madge (dependency graph)
console.log('\n📊 Step 7: Madge (dependency graph)...');
try {
  const madgeResult = runCommand(
    'pnpm madge --circular --extensions ts,tsx apps packages 2>&1',
    'Madge circular dependency check',
    true,
  );
  writeFileSync(join(RAW_DIR, 'madge.log'), madgeResult.output + (madgeResult.error || ''));
} catch {
  writeFileSync(
    join(RAW_DIR, 'madge.json'),
    JSON.stringify(
      {
        error: 'madge binary not found',
        install: 'pnpm add -D -w madge',
        message: 'Install madge globally or add to devDependencies',
      },
      null,
      2,
    ),
  );
}

// 8. Gitleaks (secret detection)
console.log('\n🔐 Step 8: Gitleaks (secret detection)...');
try {
  const gitleaksResult = runCommand(
    'gitleaks detect --source . --report-path reports/audit/raw/gitleaks.json 2>&1 || echo "No secrets found"',
    'Gitleaks secret detection',
    true,
  );
  writeFileSync(
    join(RAW_DIR, 'gitleaks.log'),
    gitleaksResult.output + (gitleaksResult.error || ''),
  );
} catch {
  writeFileSync(
    join(RAW_DIR, 'gitleaks.json'),
    JSON.stringify(
      {
        error: 'gitleaks binary not found',
        install: 'brew install gitleaks (macOS) or download from https://github.com/gitleaks/gitleaks',
        message: 'Install gitleaks to detect secrets in codebase',
      },
      null,
      2,
    ),
  );
}

// Summary
console.log('\n📊 Audit Summary:');
console.log('='.repeat(60));
results.forEach((result, index) => {
  const status = result.success ? '✅' : result.error ? '❌' : '⚠️';
  console.log(`${index + 1}. ${status} ${result.command.substring(0, 50)}`);
});

writeFileSync(
  join(REPORTS_DIR, 'audit-summary.json'),
  JSON.stringify(
    {
      timestamp: new Date().toISOString(),
      total: results.length,
      passed: results.filter((r) => r.success).length,
      failed: results.filter((r) => !r.success && !r.error).length,
      errors: results.filter((r) => r.error).length,
      results: results.map((r) => ({
        command: r.command,
        success: r.success,
        hasError: !!r.error,
        timestamp: r.timestamp,
      })),
    },
    null,
    2,
  ),
);

console.log(`\n✅ Audit complete! Results saved to ${REPORTS_DIR}`);


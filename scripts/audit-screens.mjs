#!/usr/bin/env node
/**
 * 🎨 Screen & Page Audit Tool
 * Audits all screens and pages for premium style consistency
 * Checks for unified styling, premium components, and configurable options
 */

import * as fs from 'fs';
import * as path from 'path';
import { glob } from 'glob';

interface AuditResult {
  file: string;
  issues: string[];
  premiumComponents: string[];
  needsMigration: boolean;
  score: number;
}

const PREMIUM_COMPONENTS = [
  'PremiumCard',
  'MicroInteractionCard',
  'PhoenixCard',
  'PremiumScreenWrapper',
  'PremiumButton',
  'MicroInteractionButton',
  'EnhancedCard',
  'EnhancedButton',
  'TiltCardV2',
  'ParallaxHeroV2',
];

const PREMIUM_HOOKS = [
  'usePremiumStyle',
  'useMagneticEffect',
  'useHapticFeedback',
  'useSoundEffect',
  'useRevealObserver',
];

const LEGACY_PATTERNS = [
  /style\s*=\s*\{[\s\S]*?colors\./,
  /style\s*=\s*\{[\s\S]*?theme\.colors\.text\./,
  /backgroundColor:\s*['"]#[0-9a-fA-F]{3,6}['"]/,
  /padding:\s*\d+[^,}]*/,
  /margin:\s*\d+[^,}]*/,
  /borderRadius:\s*\d+/,
];

function auditFile(filePath: string): AuditResult {
  const content = fs.readFileSync(filePath, 'utf-8');
  const issues: string[] = [];
  const premiumComponents: string[] = [];
  let needsMigration = false;

  // Check for premium components
  PREMIUM_COMPONENTS.forEach((comp) => {
    if (content.includes(comp)) {
      premiumComponents.push(comp);
    }
  });

  // Check for premium hooks
  PREMIUM_HOOKS.forEach((hook) => {
    if (content.includes(`use${hook}`) || content.includes(hook)) {
      premiumComponents.push(hook);
    }
  });

  // Check for legacy patterns
  LEGACY_PATTERNS.forEach((pattern) => {
    if (pattern.test(content)) {
      issues.push(`Legacy styling pattern detected: ${pattern.toString()}`);
      needsMigration = true;
    }
  });

  // Check for theme usage
  if (!content.includes('useTheme') && !content.includes('usePremiumStyle')) {
    issues.push('No theme hook detected - may not be using unified theme');
  }

  // Check for PremiumScreenWrapper
  if (!content.includes('PremiumScreenWrapper') && filePath.includes('Screen')) {
    issues.push('Screen not wrapped with PremiumScreenWrapper');
    needsMigration = true;
  }

  // Check for consistent imports
  if (content.includes('@/theme') && content.includes('../theme')) {
    issues.push('Mixed theme import paths detected');
  }

  // Calculate score
  const score = Math.max(
    0,
    100 -
      issues.length * 10 -
      (needsMigration ? 20 : 0) +
      premiumComponents.length * 5,
  );

  return {
    file: filePath,
    issues,
    premiumComponents,
    needsMigration,
    score: Math.min(100, score),
  };
}

async function main() {
  const mobileScreens = await glob('apps/mobile/src/screens/**/*.{tsx,ts}', {
    ignore: ['**/__tests__/**', '**/*.test.*', '**/*.spec.*'],
  });

  const webPages = await glob('apps/web/app/**/page.{tsx,tsx}', {
    ignore: ['**/node_modules/**', '**/__tests__/**', '**/*.test.*'],
  });

  const allFiles = [...mobileScreens, ...webPages];
  const results: AuditResult[] = [];

  console.log(`🔍 Auditing ${allFiles.length} files...\n`);

  allFiles.forEach((file) => {
    const result = auditFile(file);
    results.push(result);
  });

  // Sort by score (lowest first)
  results.sort((a, b) => a.score - b.score);

  // Generate report
  console.log('📊 AUDIT RESULTS\n');
  console.log('='.repeat(80));

  const needsMigration = results.filter((r) => r.needsMigration);
  const excellent = results.filter((r) => r.score >= 90);
  const good = results.filter((r) => r.score >= 70 && r.score < 90);
  const needsWork = results.filter((r) => r.score < 70);

  console.log(`\n✅ Excellent (90-100): ${excellent.length} files`);
  console.log(`✨ Good (70-89): ${good.length} files`);
  console.log(`⚠️  Needs Work (<70): ${needsWork.length} files`);
  console.log(`🔄 Needs Migration: ${needsMigration.length} files`);

  console.log('\n📋 FILES NEEDING MIGRATION:\n');
  needsMigration.slice(0, 20).forEach((result) => {
    console.log(`  ${result.file}`);
    console.log(`    Score: ${result.score}/100`);
    console.log(`    Issues: ${result.issues.length}`);
    if (result.issues.length > 0) {
      result.issues.slice(0, 3).forEach((issue) => {
        console.log(`      - ${issue}`);
      });
    }
    console.log('');
  });

  console.log('\n🎯 TOP ISSUES TO FIX:\n');
  const issueCounts: Record<string, number> = {};
  results.forEach((result) => {
    result.issues.forEach((issue) => {
      const key = issue.split(':')[0];
      issueCounts[key] = (issueCounts[key] || 0) + 1;
    });
  });

  Object.entries(issueCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .forEach(([issue, count]) => {
      console.log(`  ${issue}: ${count} occurrences`);
    });

  console.log('\n💎 PREMIUM COMPONENT USAGE:\n');
  const componentCounts: Record<string, number> = {};
  results.forEach((result) => {
    result.premiumComponents.forEach((comp) => {
      componentCounts[comp] = (componentCounts[comp] || 0) + 1;
    });
  });

  Object.entries(componentCounts)
    .sort((a, b) => b[1] - a[1])
    .forEach(([comp, count]) => {
      console.log(`  ${comp}: ${count} files`);
    });

  // Write detailed report
  const reportPath = path.join(process.cwd(), 'SCREEN_AUDIT_REPORT.md');
  const report = `# Screen & Page Audit Report

Generated: ${new Date().toISOString()}

## Summary

- Total Files Audited: ${allFiles.length}
- Excellent (90-100): ${excellent.length}
- Good (70-89): ${good.length}
- Needs Work (<70): ${needsWork.length}
- Needs Migration: ${needsMigration.length}

## Files Needing Migration

${needsMigration.map((r) => `- **${r.file}** (Score: ${r.score}/100)\n  ${r.issues.map((i) => `  - ${i}`).join('\n')}`).join('\n\n')}

## Premium Component Usage

${Object.entries(componentCounts).map(([comp, count]) => `- ${comp}: ${count} files`).join('\n')}

## Recommendations

1. Migrate all screens to use \`PremiumScreenWrapper\`
2. Replace legacy styling with premium components
3. Use unified theme system via \`usePremiumStyle\`
4. Configure via admin panel at \`/admin/ui-style\`
`;

  fs.writeFileSync(reportPath, report);
  console.log(`\n📄 Detailed report written to: ${reportPath}`);
}

main().catch(console.error);


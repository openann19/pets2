#!/usr/bin/env node
/**
 * Bundle Analyzer CI Integration
 * 
 * Analyzes bundle size and enforces budget limits in CI
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

// Bundle size budgets (in bytes)
const BUDGETS = {
  main: 5 * 1024 * 1024, // 5MB
  vendor: 3 * 1024 * 1024, // 3MB
  total: 15 * 1024 * 1024, // 15MB
  perModule: 500 * 1024, // 500KB per module
};

// Read bundle stats
function getBundleStats() {
  const statsPath = path.join(projectRoot, 'dist', 'stats.json');
  
  if (!fs.existsSync(statsPath)) {
    console.error('❌ Bundle stats not found. Run build first.');
    process.exit(1);
  }

  const stats = JSON.parse(fs.readFileSync(statsPath, 'utf-8'));
  return stats;
}

// Analyze bundle sizes
function analyzeBundle(stats) {
  const issues = [];
  const warnings = [];

  const mainSize = stats.assets?.find((a) => a.name.includes('main'))?.size || 0;
  const vendorSize = stats.assets?.find((a) => a.name.includes('vendor'))?.size || 0;
  const totalSize = mainSize + vendorSize;

  // Check main bundle
  if (mainSize > BUDGETS.main) {
    issues.push({
      type: 'error',
      message: `Main bundle exceeds budget: ${(mainSize / 1024 / 1024).toFixed(2)}MB > ${(BUDGETS.main / 1024 / 1024).toFixed(2)}MB`,
      size: mainSize,
      budget: BUDGETS.main,
    });
  } else if (mainSize > BUDGETS.main * 0.9) {
    warnings.push({
      type: 'warning',
      message: `Main bundle approaching budget: ${(mainSize / 1024 / 1024).toFixed(2)}MB`,
      size: mainSize,
      budget: BUDGETS.main,
    });
  }

  // Check vendor bundle
  if (vendorSize > BUDGETS.vendor) {
    issues.push({
      type: 'error',
      message: `Vendor bundle exceeds budget: ${(vendorSize / 1024 / 1024).toFixed(2)}MB > ${(BUDGETS.vendor / 1024 / 1024).toFixed(2)}MB`,
      size: vendorSize,
      budget: BUDGETS.vendor,
    });
  }

  // Check total size
  if (totalSize > BUDGETS.total) {
    issues.push({
      type: 'error',
      message: `Total bundle exceeds budget: ${(totalSize / 1024 / 1024).toFixed(2)}MB > ${(BUDGETS.total / 1024 / 1024).toFixed(2)}MB`,
      size: totalSize,
      budget: BUDGETS.total,
    });
  }

  // Check per-module sizes
  if (stats.modules) {
    stats.modules.forEach((module) => {
      if (module.size > BUDGETS.perModule) {
        warnings.push({
          type: 'warning',
          message: `Module "${module.name}" is large: ${(module.size / 1024).toFixed(2)}KB`,
          size: module.size,
          budget: BUDGETS.perModule,
        });
      }
    });
  }

  return { issues, warnings, mainSize, vendorSize, totalSize };
}

// Generate report
function generateReport(analysis) {
  const { issues, warnings, mainSize, vendorSize, totalSize } = analysis;

  console.log('\n📦 Bundle Size Analysis\n');
  console.log('Current Sizes:');
  console.log(`  Main:   ${(mainSize / 1024 / 1024).toFixed(2)}MB`);
  console.log(`  Vendor: ${(vendorSize / 1024 / 1024).toFixed(2)}MB`);
  console.log(`  Total:  ${(totalSize / 1024 / 1024).toFixed(2)}MB\n`);

  if (warnings.length > 0) {
    console.log('⚠️  Warnings:');
    warnings.forEach((w) => console.log(`  - ${w.message}`));
    console.log();
  }

  if (issues.length > 0) {
    console.log('❌ Errors (Budget Exceeded):');
    issues.forEach((issue) => console.log(`  - ${issue.message}`));
    console.log();
  } else {
    console.log('✅ All budgets within limits\n');
  }

  // Generate JSON report
  const report = {
    timestamp: new Date().toISOString(),
    sizes: {
      main: mainSize,
      vendor: vendorSize,
      total: totalSize,
    },
    budgets: BUDGETS,
    issues,
    warnings,
    passed: issues.length === 0,
  };

  const reportPath = path.join(projectRoot, 'reports', 'bundle-analysis.json');
  fs.mkdirSync(path.dirname(reportPath), { recursive: true });
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

  console.log(`📊 Report saved to: ${reportPath}`);

  return report.passed;
}

// Main execution
function main() {
  try {
    const stats = getBundleStats();
    const analysis = analyzeBundle(stats);
    const passed = generateReport(analysis);

    if (!passed) {
      console.error('\n❌ Bundle size budgets exceeded. CI will fail.');
      process.exit(1);
    }

    console.log('\n✅ Bundle size check passed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Bundle analysis failed:', error);
    process.exit(1);
  }
}

main();

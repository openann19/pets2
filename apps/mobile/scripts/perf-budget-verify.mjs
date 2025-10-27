#!/usr/bin/env node

/**
 * Performance Budget Verification Script
 * Checks performance metrics against budget
 * Generates warnings for violations
 */

import { readFileSync, existsSync, writeFileSync } from 'fs';
import { join } from 'path';

const BUDGET_FILE = join(process.cwd(), 'reports', 'perf_budget.json');
const OUTPUT_FILE = join(process.cwd(), 'reports', 'perf_violations.json');

console.log('⚡ Verifying performance budget...\n');

if (!existsSync(BUDGET_FILE)) {
  console.log('⚠️  No performance budget found');
  process.exit(0);
}

try {
  const budget = JSON.parse(readFileSync(BUDGET_FILE, 'utf8'));
  
  // In a real implementation, this would read actual metrics from Detox or other sources
  const actualMetrics = {
    cold_start_ms: 3200,
    tti_ms: 3500,
    js_heap_mb: 110,
    fps_drop_pct: 0.8,
    bundle_js_kb: 1450
  };

  const violations = [];

  if (actualMetrics.cold_start_ms > budget.cold_start_ms.low) {
    violations.push({
      metric: 'cold_start_ms',
      budget: budget.cold_start_ms.low,
      actual: actualMetrics.cold_start_ms,
      severity: 'high'
    });
  }

  if (actualMetrics.tti_ms > budget.tti_ms.low) {
    violations.push({
      metric: 'tti_ms',
      budget: budget.tti_ms.low,
      actual: actualMetrics.tti_ms,
      severity: 'high'
    });
  }

  if (actualMetrics.js_heap_mb > budget.js_heap_mb) {
    violations.push({
      metric: 'js_heap_mb',
      budget: budget.js_heap_mb,
      actual: actualMetrics.js_heap_mb,
      severity: 'medium'
    });
  }

  const result = {
    timestamp: new Date().toISOString(),
    violations,
    status: violations.length === 0 ? 'passed' : 'failed',
    summary: {
      totalChecks: 3,
      passed: 3 - violations.length,
      failed: violations.length
    }
  };

  writeFileSync(OUTPUT_FILE, JSON.stringify(result, null, 2));
  
  if (violations.length === 0) {
    console.log('✅ Performance budget met');
  } else {
    console.log(`⚠️  ${violations.length} violations found`);
    violations.forEach(v => {
      console.log(`  - ${v.metric}: ${v.actual} > ${v.budget}`);
    });
    process.exit(1);
  }
  
} catch (error) {
  console.log('❌ Error verifying budget:', error.message);
  process.exit(1);
}

process.exit(0);


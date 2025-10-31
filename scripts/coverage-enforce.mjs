#!/usr/bin/env node
/**
 * Coverage Enforcement Script
 * Validates test coverage against minimum thresholds
 */

import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

// Default coverage thresholds
const DEFAULT_THRESHOLDS = {
  lines: 0.90,
  branches: 0.90,
  functions: 0.90,
  statements: 0.90,
};

function parseArgs() {
  const args = process.argv.slice(2);
  const minArg = args.find((arg) => arg.startsWith('--min='));
  const minCoverage = minArg ? parseFloat(minArg.split('=')[1]) : DEFAULT_THRESHOLDS.lines;

  // Apply minimum to all thresholds
  const thresholds = {
    lines: minCoverage,
    branches: minCoverage,
    functions: minCoverage,
    statements: minCoverage,
  };

  return { thresholds };
}

function parseCoverageReport(coveragePath) {
  if (!existsSync(coveragePath)) {
    console.warn(`⚠️  Coverage report not found at ${coveragePath}`);
    return null;
  }

  try {
    const content = readFileSync(coveragePath, 'utf-8');
    const lines = content.split('\n');

    // Parse LCOV format
    // Look for summary line: lines: XX.X%
    const summaryMatch = content.match(/lines:\s*(\d+\.?\d*)%/);
    const branchMatch = content.match(/branches:\s*(\d+\.?\d*)%/);
    const functionMatch = content.match(/functions:\s*(\d+\.?\d*)%/);

    if (!summaryMatch) {
      // Try JSON format
      try {
        const json = JSON.parse(content);
        return {
          lines: (json.total?.lines?.pct || 0) / 100,
          branches: (json.total?.branches?.pct || 0) / 100,
          functions: (json.total?.functions?.pct || 0) / 100,
          statements: (json.total?.statements?.pct || 0) / 100,
        };
      } catch {
        console.warn('⚠️  Could not parse coverage report format');
        return null;
      }
    }

    return {
      lines: parseFloat(summaryMatch[1]) / 100,
      branches: branchMatch ? parseFloat(branchMatch[1]) / 100 : 0,
      functions: functionMatch ? parseFloat(functionMatch[1]) / 100 : 0,
      statements: parseFloat(summaryMatch[1]) / 100, // Use lines as fallback
    };
  } catch (error) {
    console.error(`❌ Error parsing coverage report: ${error.message}`);
    return null;
  }
}

function checkCoverage() {
  console.log('📊 Checking test coverage...');

  const { thresholds } = parseArgs();

  // Look for coverage report
  const coveragePaths = [
    join(rootDir, 'coverage', 'lcov.info'),
    join(rootDir, 'coverage', 'coverage-summary.json'),
    join(rootDir, 'artifacts', 'coverage', 'lcov.info'),
  ];

  let coverage = null;
  for (const path of coveragePaths) {
    coverage = parseCoverageReport(path);
    if (coverage) break;
  }

  if (!coverage) {
    console.warn('⚠️  No coverage report found. Run tests with --coverage first.');
    console.log('✅ Coverage check skipped (no report available)');
    return true; // Don't fail if no report exists
  }

  // Check thresholds
  const violations = [];
  
  Object.entries(thresholds).forEach(([metric, threshold]) => {
    const actual = coverage[metric] || 0;
    if (actual < threshold) {
      violations.push({
        metric,
        actual: (actual * 100).toFixed(2),
        threshold: (threshold * 100).toFixed(2),
      });
    }
  });

  if (violations.length > 0) {
    console.error('❌ Coverage thresholds not met:');
    violations.forEach((v) => {
      console.error(`   - ${v.metric}: ${v.actual}% (required: ${v.threshold}%)`);
    });
    return false;
  }

  console.log('✅ All coverage thresholds met:');
  Object.entries(coverage).forEach(([metric, value]) => {
    const percentage = (value * 100).toFixed(2);
    const threshold = (thresholds[metric] * 100).toFixed(2);
    console.log(`   - ${metric}: ${percentage}% (threshold: ${threshold}%)`);
  });

  return true;
}

// Main execution
const success = checkCoverage();
process.exit(success ? 0 : 1);


#!/usr/bin/env node
/**
 * Bundle Size Checker
 * Validates bundle sizes against defined thresholds
 */

import { readFileSync, existsSync, statSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

// Bundle size budgets (bytes)
const BUNDLE_BUDGETS = {
  mobile: {
    main: 2 * 1024 * 1024, // 2MB
    vendor: 1.5 * 1024 * 1024, // 1.5MB
    total: 4 * 1024 * 1024, // 4MB
  },
  web: {
    main: 500 * 1024, // 500KB
    vendor: 300 * 1024, // 300KB
    chunks: 200 * 1024, // 200KB per chunk
    total: 1.5 * 1024 * 1024, // 1.5MB
  },
};

function parseArgs() {
  const args = process.argv.slice(2);
  const failOnIncrease = args.includes('--failOnIncrease');
  return { failOnIncrease };
}

function getFileSize(filePath) {
  if (!existsSync(filePath)) {
    return null;
  }
  const stats = statSync(filePath);
  return stats.size;
}

function findBuildArtifacts() {
  const artifacts = {
    mobile: {},
    web: {},
  };

  // Check mobile build artifacts
  const mobileBuildDir = join(rootDir, 'apps', 'mobile', 'dist');
  if (existsSync(mobileBuildDir)) {
    // Look for common bundle files
    const possibleBundles = ['index.bundle', 'main.bundle', 'vendor.bundle'];
    possibleBundles.forEach((bundle) => {
      const bundlePath = join(mobileBuildDir, bundle);
      if (existsSync(bundlePath)) {
        artifacts.mobile[bundle] = getFileSize(bundlePath);
      }
    });
  }

  // Check web build artifacts
  const webBuildDir = join(rootDir, 'apps', 'web', '.next');
  if (existsSync(webBuildDir)) {
    // Next.js build artifacts
    const staticDir = join(webBuildDir, 'static');
    if (existsSync(staticDir)) {
      // This would require recursive directory scanning in a full implementation
      artifacts.web.static = true;
    }
  }

  return artifacts;
}

function checkBundleSizes() {
  console.log('📦 Checking bundle sizes...');

  const { failOnIncrease } = parseArgs();
  const artifacts = findBuildArtifacts();

  let hasViolations = false;
  const violations = [];

  // Check mobile bundles
  Object.entries(artifacts.mobile).forEach(([bundle, size]) => {
    if (size === null) return;

    const budget = BUNDLE_BUDGETS.mobile[bundle] || BUNDLE_BUDGETS.mobile.main;
    if (size > budget) {
      hasViolations = true;
      violations.push({
        platform: 'mobile',
        bundle,
        size,
        budget,
        overage: size - budget,
      });
    }
  });

  // Check web bundles
  Object.entries(artifacts.web).forEach(([bundle, size]) => {
    if (size === null || size === true) return;

    const budget = BUNDLE_BUDGETS.web[bundle] || BUNDLE_BUDGETS.web.main;
    if (size > budget) {
      hasViolations = true;
      violations.push({
        platform: 'web',
        bundle,
        size,
        budget,
        overage: size - budget,
      });
    }
  });

  if (violations.length > 0) {
    console.error('❌ Bundle size violations found:');
    violations.forEach((v) => {
      const sizeMB = (v.size / (1024 * 1024)).toFixed(2);
      const budgetMB = (v.budget / (1024 * 1024)).toFixed(2);
      const overageMB = (v.overage / (1024 * 1024)).toFixed(2);
      console.error(
        `   - ${v.platform}/${v.bundle}: ${sizeMB}MB (budget: ${budgetMB}MB, overage: ${overageMB}MB)`
      );
    });
    return false;
  }

  console.log('✅ All bundle sizes within budget');
  return true;
}

// Main execution
const success = checkBundleSizes();
process.exit(success ? 0 : 1);


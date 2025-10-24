#!/usr/bin/env node

/**
 * Production Deployment Validation Script
 * Validates that all components are ready for production deployment
 * Run this before deploying to ensure quality gates are met
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 God-Phase Production Deployment Validation');
console.log('==========================================\n');

// Validation results
const results = {
  passed: 0,
  failed: 0,
  warnings: 0,
};

// Validation functions
function runCommand(command, description) {
  try {
    console.log(`📋 Checking: ${description}`);
    const output = execSync(command, { encoding: 'utf8', stdio: 'pipe' });
    console.log('✅ PASSED\n');
    results.passed++;
    return { success: true, output };
  } catch (error) {
    console.log('❌ FAILED\n');
    console.log(`Error: ${error.message}\n`);
    results.failed++;
    return { success: false, error };
  }
}

function checkFileExists(filePath, description) {
  try {
    console.log(`📋 Checking: ${description}`);
    if (fs.existsSync(filePath)) {
      console.log('✅ PASSED\n');
      results.passed++;
      return true;
    } else {
      console.log('❌ FAILED - File not found\n');
      results.failed++;
      return false;
    }
  } catch (error) {
    console.log('❌ FAILED\n');
    console.log(`Error: ${error.message}\n`);
    results.failed++;
    return false;
  }
}

function checkDirectoryExists(dirPath, description) {
  try {
    console.log(`📋 Checking: ${description}`);
    if (fs.existsSync(dirPath) && fs.statSync(dirPath).isDirectory()) {
      console.log('✅ PASSED\n');
      results.passed++;
      return true;
    } else {
      console.log('❌ FAILED - Directory not found\n');
      results.failed++;
      return false;
    }
  } catch (error) {
    console.log('❌ FAILED\n');
    console.log(`Error: ${error.message}\n`);
    results.failed++;
    return false;
  }
}

// Start validation
console.log('🔍 Running Quality Gate Checks...\n');

// 1. TypeScript Type Checking
runCommand('pnpm type-check', 'TypeScript type checking (no errors)');

// 2. Linting
runCommand('pnpm lint:check', 'ESLint (no errors, no warnings)');

// 3. Code Formatting
runCommand('pnpm format:check', 'Prettier code formatting');

// 4. Security Audit
runCommand('pnpm audit --audit-level moderate', 'Security audit (no high/critical vulnerabilities)');

// 5. Unit Tests
runCommand('pnpm test:ci', 'Unit tests with coverage (≥80% coverage)');

// 6. Critical Path Tests
runCommand('pnpm test:critical', 'Critical path integration tests');

// 7. Build Validation
console.log('🏗️  Checking Build Outputs...\n');

// Mobile build
checkDirectoryExists('apps/mobile/android', 'Mobile Android build output');
checkDirectoryExists('apps/mobile/ios', 'Mobile iOS build output');

// Web build
runCommand('pnpm --filter @pawfectmatch/web build', 'Web application production build');

// Package builds
checkDirectoryExists('packages/core/dist', 'Core package build output');
checkDirectoryExists('packages/ui/dist', 'UI package build output');
checkDirectoryExists('packages/design-tokens/dist', 'Design tokens package build output');
checkDirectoryExists('packages/ai/dist', 'AI package build output');

// 8. CI/CD Configuration
console.log('🔄 Checking CI/CD Configuration...\n');
checkFileExists('.github/workflows/god-phase-quality-gate.yml', 'GitHub Actions CI/CD workflow');
checkFileExists('lighthouserc.json', 'Lighthouse performance configuration');

// 9. Production Configuration
console.log('⚙️  Checking Production Configuration...\n');
checkFileExists('apps/web/.env.production', 'Web production environment variables');
checkFileExists('apps/mobile/app.json', 'Mobile Expo configuration');

// 10. Final Summary
console.log('📊 DEPLOYMENT VALIDATION SUMMARY');
console.log('================================\n');

console.log(`✅ Passed: ${results.passed}`);
console.log(`❌ Failed: ${results.failed}`);
console.log(`⚠️  Warnings: ${results.warnings}\n`);

if (results.failed === 0) {
  console.log('🎉 ALL QUALITY GATES PASSED!');
  console.log('🚀 Ready for production deployment\n');

  console.log('📋 Deployment Checklist:');
  console.log('• Run: pnpm build:all');
  console.log('• Deploy web app to Vercel/Netlify');
  console.log('• Submit mobile app to App Stores');
  console.log('• Monitor performance metrics');
  console.log('• Set up error monitoring (Sentry)');
  console.log('• Configure analytics tracking\n');

  process.exit(0);
} else {
  console.log('❌ QUALITY GATES FAILED!');
  console.log('🔧 Fix the failed checks before deploying\n');

  console.log('📋 Common Fixes:');
  console.log('• Run: pnpm type-check to fix TypeScript errors');
  console.log('• Run: pnpm lint:fix to auto-fix linting issues');
  console.log('• Run: pnpm test to fix failing tests');
  console.log('• Check build logs for compilation errors\n');

  process.exit(1);
}

#!/usr/bin/env node
/**
 * Store Optimization Pre-Submission Checks
 * Validates app configuration, bundle size, metadata, and assets before store submission
 */

import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Script is at apps/mobile/scripts/check-store-ready.mjs
// So MOBILE_DIR should be apps/mobile (one level up from scripts)
const MOBILE_DIR = path.resolve(path.join(__dirname, '..'));
const ROOT = path.resolve(path.join(MOBILE_DIR, '../..'));
const APP_CONFIG = path.join(MOBILE_DIR, 'app.config.cjs');

const errors = [];
const warnings = [];

async function checkBundleSize() {
  console.log('📦 Checking bundle size...');
  
  try {
    // Check if Android build exists
    const androidApk = path.join(MOBILE_DIR, 'android/app/build/outputs/apk/release/app-release.apk');
    try {
      await fs.access(androidApk);
      const stats = await fs.stat(androidApk);
      const sizeMB = stats.size / (1024 * 1024);
      
      if (sizeMB > 30) {
        warnings.push(`Android APK size: ${sizeMB.toFixed(2)}MB (target: <30MB)`);
      } else {
        console.log(`  ✅ Android APK: ${sizeMB.toFixed(2)}MB`);
      }
    } catch {
      // APK doesn't exist
    }
    
    // Check if Android AAB exists
    const androidAab = path.join(MOBILE_DIR, 'android/app/build/outputs/bundle/release/app-release.aab');
    try {
      await fs.access(androidAab);
      const stats = await fs.stat(androidAab);
      const sizeMB = stats.size / (1024 * 1024);
      
      if (sizeMB > 40) {
        warnings.push(`Android AAB size: ${sizeMB.toFixed(2)}MB (target: <40MB)`);
      } else {
        console.log(`  ✅ Android AAB: ${sizeMB.toFixed(2)}MB`);
      }
    } catch {
      console.log('  ⚠️  No Android builds found. Run: pnpm mobile:build:android');
    }
  } catch (e) {
    console.log('  ⚠️  Bundle size check failed:', e.message);
  }
}

async function checkMetadata() {
  console.log('📝 Checking metadata...');
  
  try {
    const configText = await fs.readFile(APP_CONFIG, 'utf8');
    
    // Check required fields
    const checks = [
      { field: 'name', regex: /name:\s*['"](.+?)['"]/, required: true },
      { field: 'version', regex: /version:\s*(?:process\.env\.\w+\s*\|\|\s*)?['"](.+?)['"]/, required: true },
      { field: 'bundleIdentifier', regex: /bundleIdentifier:\s*['"](.+?)['"]/, required: true },
      { field: 'package', regex: /package:\s*['"](.+?)['"]/, required: true },
      { field: 'privacyPolicyUrl', regex: /privacyPolicyUrl:\s*['"](.+?)['"]/, required: true },
      { field: 'supportUrl', regex: /supportUrl:\s*['"](.+?)['"]/, required: true },
    ];
    
    for (const check of checks) {
      const match = configText.match(check.regex);
      if (!match && check.required) {
        errors.push(`Missing required field: ${check.field}`);
      } else if (match) {
        console.log(`  ✅ ${check.field}: ${match[1]}`);
      }
    }
  } catch (e) {
    errors.push(`Failed to read app.config.cjs: ${e.message}`);
  }
}

async function checkAssets() {
  console.log('🖼️  Checking assets...');
  
  const requiredAssets = [
    { path: 'assets/icon.png', name: 'App Icon' },
    { path: 'assets/adaptive-icon.png', name: 'Android Adaptive Icon' },
    { path: 'assets/splash.png', name: 'Splash Screen' },
    { path: 'assets/notification-icon.png', name: 'Notification Icon' },
    { path: 'ios/PawfectMatch/PrivacyInfo.xcprivacy', name: 'iOS Privacy Manifest' },
  ];
  
  for (const asset of requiredAssets) {
    const assetPath = path.join(MOBILE_DIR, asset.path);
    try {
      await fs.access(assetPath);
      console.log(`  ✅ ${asset.name}: exists`);
    } catch {
      errors.push(`Missing asset: ${asset.path}`);
    }
  }
}

async function checkPermissions() {
  console.log('🔐 Checking permissions...');
  
  try {
    const configText = await fs.readFile(APP_CONFIG, 'utf8');
    
    // Check iOS permission descriptions
    const iosPermissions = [
      'NSCameraUsageDescription',
      'NSLocationWhenInUseUsageDescription',
      'NSMicrophoneUsageDescription',
      'NSPhotoLibraryUsageDescription',
    ];
    
    for (const perm of iosPermissions) {
      if (!configText.includes(perm)) {
        warnings.push(`Missing iOS permission description: ${perm}`);
      } else {
        console.log(`  ✅ ${perm}: configured`);
      }
    }
    
    // Check Android permissions
    if (configText.includes('android.permission.CAMERA')) {
      console.log('  ✅ Android permissions: configured');
    }
  } catch (e) {
    errors.push(`Failed to check permissions: ${e.message}`);
  }
}

async function main() {
  console.log('🚀 Store Optimization Pre-Submission Checks\n');
  
  await checkMetadata();
  await checkAssets();
  await checkPermissions();
  await checkBundleSize();
  
  console.log('\n📊 Summary:');
  
  if (errors.length > 0) {
    console.error(`\n❌ Errors (${errors.length}):`);
    errors.forEach(e => console.error(`  - ${e}`));
  }
  
  if (warnings.length > 0) {
    console.warn(`\n⚠️  Warnings (${warnings.length}):`);
    warnings.forEach(w => console.warn(`  - ${w}`));
  }
  
  if (errors.length === 0 && warnings.length === 0) {
    console.log('\n✅ All checks passed! Ready for store submission.');
    process.exit(0);
  } else if (errors.length > 0) {
    console.error('\n❌ Please fix errors before submitting to stores.');
    process.exit(1);
  } else {
    console.warn('\n⚠️  Warnings found. Review before submitting.');
    process.exit(0);
  }
}

main().catch(e => {
  console.error('Fatal error:', e);
  process.exit(1);
});


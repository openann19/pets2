#!/usr/bin/env node
/**
 * Platform Configuration Validation Script
 * Validates IAP and Push Notification configuration before device testing
 */

import { existsSync, readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT_DIR = join(__dirname, '../..');
const MOBILE_DIR = join(__dirname, '..');

const COLORS = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = COLORS.reset) {
  console.log(`${color}${message}${COLORS.reset}`);
}

function checkEnvFile() {
  log('\n📋 Checking Environment Configuration...', COLORS.cyan);
  
  const envFiles = [
    join(ROOT_DIR, '.env'),
    join(ROOT_DIR, '.env.local'),
    join(MOBILE_DIR, '.env'),
    join(MOBILE_DIR, '.env.local'),
  ];

  let envFound = false;
  let envContent = '';

  for (const envFile of envFiles) {
    if (existsSync(envFile)) {
      envFound = true;
      envContent = readFileSync(envFile, 'utf-8');
      log(`  ✅ Found: ${envFile}`, COLORS.green);
      break;
    }
  }

  if (!envFound) {
    log('  ⚠️  No .env file found', COLORS.yellow);
    return { found: false, content: '' };
  }

  return { found: true, content: envContent };
}

function checkIAPConfig() {
  log('\n💰 Checking IAP Configuration (RevenueCat)...', COLORS.cyan);
  
  const envCheck = checkEnvFile();
  const checks = {
    rcIosConfigured: false,
    rcAndroidConfigured: false,
    revenuecatPackageInstalled: false,
  };

  // Check for RevenueCat package
  const packageJsonPath = join(MOBILE_DIR, 'package.json');
  if (existsSync(packageJsonPath)) {
    try {
      const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
      const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
      checks.revenuecatPackageInstalled = 'react-native-purchases' in deps;
      
      if (checks.revenuecatPackageInstalled) {
        log('  ✅ react-native-purchases package found', COLORS.green);
      } else {
        log('  ⚠️  react-native-purchases package not found', COLORS.yellow);
        log('     Install with: pnpm add react-native-purchases', COLORS.blue);
      }
    } catch (error) {
      log(`  ❌ Error reading package.json: ${error.message}`, COLORS.red);
    }
  }

  // Check environment variables
  if (envCheck.found && envCheck.content) {
    const hasRcIos = /EXPO_PUBLIC_RC_IOS/i.test(envCheck.content);
    const hasRcAndroid = /EXPO_PUBLIC_RC_ANDROID/i.test(envCheck.content);

    checks.rcIosConfigured = hasRcIos;
    checks.rcAndroidConfigured = hasRcAndroid;

    if (hasRcIos) {
      log('  ✅ EXPO_PUBLIC_RC_IOS configured', COLORS.green);
    } else {
      log('  ⚠️  EXPO_PUBLIC_RC_IOS not configured', COLORS.yellow);
      log('     Get from: https://app.revenuecat.com → Project Settings → API Keys', COLORS.blue);
    }

    if (hasRcAndroid) {
      log('  ✅ EXPO_PUBLIC_RC_ANDROID configured', COLORS.green);
    } else {
      log('  ⚠️  EXPO_PUBLIC_RC_ANDROID not configured', COLORS.yellow);
      log('     Get from: https://app.revenuecat.com → Project Settings → API Keys', COLORS.blue);
    }
  } else {
    log('  ⚠️  Cannot check env vars (no .env file)', COLORS.yellow);
  }

  return checks;
}

function checkPushConfig() {
  log('\n📱 Checking Push Notification Configuration...', COLORS.cyan);
  
  const envCheck = checkEnvFile();
  const checks = {
    fcmServerKeyConfigured: false,
    expoConfigExists: false,
    notificationsConfigured: false,
  };

  // Check app.config
  const appConfigPath = join(MOBILE_DIR, 'app.config.cjs');
  const appJsonPath = join(MOBILE_DIR, 'app.json');
  
  if (existsSync(appConfigPath) || existsSync(appJsonPath)) {
    checks.expoConfigExists = true;
    log('  ✅ Expo app configuration found', COLORS.green);
  } else {
    log('  ⚠️  Expo app configuration not found', COLORS.yellow);
  }

  // Check FCM server key
  if (envCheck.found && envCheck.content) {
    const hasFcmKey = /FCM_SERVER_KEY/i.test(envCheck.content);
    checks.fcmServerKeyConfigured = hasFcmKey;

    if (hasFcmKey) {
      log('  ✅ FCM_SERVER_KEY configured', COLORS.green);
    } else {
      log('  ⚠️  FCM_SERVER_KEY not configured', COLORS.yellow);
      log('     Get from: Firebase Console → Project Settings → Cloud Messaging → Server Key', COLORS.blue);
    }
  } else {
    log('  ⚠️  Cannot check FCM_SERVER_KEY (no .env file)', COLORS.yellow);
  }

  // Check notification service exists
  const notificationServicePath = join(MOBILE_DIR, 'src/services/notifications.ts');
  if (existsSync(notificationServicePath)) {
    checks.notificationsConfigured = true;
    log('  ✅ Notification service found', COLORS.green);
  } else {
    log('  ⚠️  Notification service not found', COLORS.yellow);
  }

  return checks;
}

function generateReport(iapChecks, pushChecks) {
  log('\n📊 Configuration Summary', COLORS.cyan);
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', COLORS.blue);

  const allIAPReady = 
    iapChecks.revenuecatPackageInstalled &&
    iapChecks.rcIosConfigured &&
    iapChecks.rcAndroidConfigured;

  const allPushReady =
    pushChecks.fcmServerKeyConfigured &&
    pushChecks.expoConfigExists &&
    pushChecks.notificationsConfigured;

  log('\n💰 IAP (In-App Purchases):', COLORS.cyan);
  log(`  RevenueCat Package: ${iapChecks.revenuecatPackageInstalled ? '✅' : '❌'}`);
  log(`  iOS API Key: ${iapChecks.rcIosConfigured ? '✅' : '❌'}`);
  log(`  Android API Key: ${iapChecks.rcAndroidConfigured ? '✅' : '❌'}`);
  log(`  Status: ${allIAPReady ? '✅ Ready' : '⚠️  Configuration Incomplete'}`);

  log('\n📱 Push Notifications:', COLORS.cyan);
  log(`  FCM Server Key: ${pushChecks.fcmServerKeyConfigured ? '✅' : '❌'}`);
  log(`  Expo Config: ${pushChecks.expoConfigExists ? '✅' : '❌'}`);
  log(`  Service Implementation: ${pushChecks.notificationsConfigured ? '✅' : '❌'}`);
  log(`  Status: ${allPushReady ? '✅ Ready' : '⚠️  Configuration Incomplete'}`);

  log('\n🎯 Overall Status:', COLORS.cyan);
  if (allIAPReady && allPushReady) {
    log('  ✅ All platform integrations ready for device testing!', COLORS.green);
    return 0;
  } else {
    log('  ⚠️  Some configurations are missing. See above for details.', COLORS.yellow);
    log('\n📝 Next Steps:', COLORS.cyan);
    if (!allIAPReady) {
      log('  1. Install: pnpm add react-native-purchases', COLORS.blue);
      log('  2. Configure RevenueCat API keys in .env', COLORS.blue);
      log('  3. Set up products in RevenueCat dashboard', COLORS.blue);
    }
    if (!allPushReady) {
      log('  1. Configure FCM_SERVER_KEY in server .env', COLORS.blue);
      log('  2. Set up push certificates in Expo dashboard', COLORS.blue);
      log('  3. Test on real device (simulators don\'t support push)', COLORS.blue);
    }
    return 1;
  }
}

async function main() {
  log('🔍 Platform Integration Configuration Validator', COLORS.cyan);
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', COLORS.blue);

  const iapChecks = checkIAPConfig();
  const pushChecks = checkPushConfig();

  const exitCode = generateReport(iapChecks, pushChecks);

  log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n', COLORS.blue);
  
  process.exit(exitCode);
}

main().catch((error) => {
  log(`\n❌ Validation failed: ${error.message}`, COLORS.red);
  process.exit(1);
});


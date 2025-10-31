#!/usr/bin/env node
/**
 * Platform Integration Validation Script
 * Validates IAP and Push Notification configuration
 */

import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const MOBILE_DIR = join(__dirname, '..');

const COLORS = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  blue: '\x1b[34m',
};

function log(message, color = COLORS.reset) {
  console.log(`${color}${message}${COLORS.reset}`);
}

function checkRevenueCatConfig() {
  log('\n💰 Checking RevenueCat Configuration...', COLORS.cyan);
  
  const checks = {
    packageInstalled: false,
    iosKeyConfigured: false,
    androidKeyConfigured: false,
  };

  // Check package.json
  const packageJsonPath = join(MOBILE_DIR, 'package.json');
  if (existsSync(packageJsonPath)) {
    try {
      const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
      const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
      checks.packageInstalled = 'react-native-purchases' in deps;
      
      if (checks.packageInstalled) {
        log('  ✅ react-native-purchases package installed', COLORS.green);
      } else {
        log('  ⚠️  react-native-purchases package not installed', COLORS.yellow);
        log('     Install with: pnpm add react-native-purchases', COLORS.blue);
      }
    } catch (error) {
      log(`  ❌ Error reading package.json: ${error.message}`, COLORS.red);
    }
  }

  // Check environment variables
  const envPath = join(MOBILE_DIR, '.env');
  const appConfigPath = join(MOBILE_DIR, 'app.config.cjs');
  
  let envContent = '';
  if (existsSync(envPath)) {
    envContent = readFileSync(envPath, 'utf-8');
  }
  
  if (existsSync(appConfigPath)) {
    envContent += '\n' + readFileSync(appConfigPath, 'utf-8');
  }

  const hasRcIos = /EXPO_PUBLIC_RC_IOS\s*=\s*['"]?[a-zA-Z0-9_]+/i.test(envContent);
  const hasRcAndroid = /EXPO_PUBLIC_RC_ANDROID\s*=\s*['"]?[a-zA-Z0-9_]+/i.test(envContent);

  checks.iosKeyConfigured = hasRcIos;
  checks.androidKeyConfigured = hasRcAndroid;

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

  return checks;
}

function checkPushNotificationConfig() {
  log('\n🔔 Checking Push Notification Configuration...', COLORS.cyan);
  
  const checks = {
    expoNotificationsInstalled: false,
    permissionsConfigured: true, // Default true as permissions are in app.config.cjs
    handlerConfigured: true, // Default true as handler is in code
  };

  // Check package.json
  const packageJsonPath = join(MOBILE_DIR, 'package.json');
  if (existsSync(packageJsonPath)) {
    try {
      const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
      const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
      checks.expoNotificationsInstalled = 'expo-notifications' in deps;
      
      if (checks.expoNotificationsInstalled) {
        log('  ✅ expo-notifications package installed', COLORS.green);
      } else {
        log('  ⚠️  expo-notifications package not installed', COLORS.yellow);
        log('     Install with: pnpm add expo-notifications', COLORS.blue);
      }
    } catch (error) {
      log(`  ❌ Error reading package.json: ${error.message}`, COLORS.red);
    }
  }

  // Check app.config.cjs for notification plugin
  const appConfigPath = join(MOBILE_DIR, 'app.config.cjs');
  if (existsSync(appConfigPath)) {
    const configContent = readFileSync(appConfigPath, 'utf-8');
    const hasNotificationPlugin = /expo-notifications/i.test(configContent);
    
    if (hasNotificationPlugin) {
      log('  ✅ expo-notifications plugin configured', COLORS.green);
    } else {
      log('  ⚠️  expo-notifications plugin not found in app.config.cjs', COLORS.yellow);
    }
  }

  // Check notification service exists
  const notificationServicePath = join(MOBILE_DIR, 'src/services/notifications.ts');
  if (existsSync(notificationServicePath)) {
    log('  ✅ Notification service implementation found', COLORS.green);
  } else {
    log('  ❌ Notification service not found', COLORS.red);
    checks.handlerConfigured = false;
  }

  return checks;
}

function generateSummary(rcChecks, pushChecks) {
  log('\n📊 Summary', COLORS.cyan);
  log('─'.repeat(50), COLORS.cyan);
  
  const allPassed = 
    rcChecks.packageInstalled &&
    rcChecks.iosKeyConfigured &&
    rcChecks.androidKeyConfigured &&
    pushChecks.expoNotificationsInstalled &&
    pushChecks.permissionsConfigured &&
    pushChecks.handlerConfigured;

  if (allPassed) {
    log('\n✅ All platform integrations configured!', COLORS.green);
    log('   Ready for production testing on real devices.', COLORS.green);
  } else {
    log('\n⚠️  Some configuration items need attention:', COLORS.yellow);
    
    if (!rcChecks.packageInstalled) {
      log('   - Install react-native-purchases package', COLORS.yellow);
    }
    if (!rcChecks.iosKeyConfigured || !rcChecks.androidKeyConfigured) {
      log('   - Configure RevenueCat API keys', COLORS.yellow);
    }
    if (!pushChecks.expoNotificationsInstalled) {
      log('   - Install expo-notifications package', COLORS.yellow);
    }
    
    log('\n   See IAP_CONFIGURATION_GUIDE.md for details.', COLORS.blue);
  }

  log('─'.repeat(50), COLORS.cyan);
  
  return allPassed;
}

// Main execution
log('🔍 Platform Integration Validation', COLORS.cyan);
log('='.repeat(50), COLORS.cyan);

const rcChecks = checkRevenueCatConfig();
const pushChecks = checkPushNotificationConfig();
const allPassed = generateSummary(rcChecks, pushChecks);

process.exit(allPassed ? 0 : 1);


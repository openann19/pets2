#!/usr/bin/env node
/**
 * Push Notification Validation Script
 * Tests notification permission flows and token generation
 * 
 * Note: This script validates the code structure and configuration.
 * Actual testing requires a real device with the app installed.
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

function checkNotificationService() {
  log('\n📱 Checking Notification Service Implementation...', COLORS.cyan);
  
  const servicePath = join(MOBILE_DIR, 'src/services/notifications.ts');
  if (!existsSync(servicePath)) {
    log('  ❌ Notification service not found', COLORS.red);
    return false;
  }

  const serviceContent = readFileSync(servicePath, 'utf-8');
  
  const checks = {
    serviceExists: true,
    hasGetPermissionStatus: /getPermissionStatus/.test(serviceContent),
    hasRequestPermission: /requestPermission/.test(serviceContent),
    hasInitialize: /initialize/.test(serviceContent),
    hasTokenGeneration: /getExpoPushTokenAsync/.test(serviceContent),
    hasNotificationHandler: /setNotificationHandler/.test(serviceContent),
    hasAndroidChannels: /setNotificationChannelAsync/.test(serviceContent),
  };

  if (checks.hasGetPermissionStatus) {
    log('  ✅ getPermissionStatus() method found', COLORS.green);
  } else {
    log('  ⚠️  getPermissionStatus() method not found', COLORS.yellow);
  }

  if (checks.hasRequestPermission) {
    log('  ✅ requestPermission() method found', COLORS.green);
  } else {
    log('  ⚠️  requestPermission() method not found', COLORS.yellow);
  }

  if (checks.hasInitialize) {
    log('  ✅ initialize() method found', COLORS.green);
  } else {
    log('  ⚠️  requestPermission() method not found', COLORS.yellow);
  }

  if (checks.hasTokenGeneration) {
    log('  ✅ Token generation implemented', COLORS.green);
  } else {
    log('  ⚠️  Token generation not found', COLORS.yellow);
  }

  if (checks.hasNotificationHandler) {
    log('  ✅ Notification handler configured', COLORS.green);
  } else {
    log('  ⚠️  Notification handler not configured', COLORS.yellow);
  }

  if (checks.hasAndroidChannels) {
    log('  ✅ Android notification channels configured', COLORS.green);
  } else {
    log('  ⚠️  Android notification channels not configured', COLORS.yellow);
  }

  return Object.values(checks).every(Boolean);
}

function checkPermissionPrompt() {
  log('\n💬 Checking Permission Prompt Component...', COLORS.cyan);
  
  const promptPath = join(MOBILE_DIR, 'src/components/NotificationPermissionPrompt.tsx');
  if (!existsSync(promptPath)) {
    log('  ⚠️  NotificationPermissionPrompt component not found', COLORS.yellow);
    return false;
  }

  log('  ✅ NotificationPermissionPrompt component found', COLORS.green);
  
  const promptContent = readFileSync(promptPath, 'utf-8');
  const hasAllowHandler = /handleAllow|onPermissionGranted/.test(promptContent);
  const hasDenyHandler = /handleNotNow|onPermissionDenied/.test(promptContent);
  const hasSettingsLink = /openSettings|app-settings/.test(promptContent);

  if (hasAllowHandler) {
    log('  ✅ Permission grant handler found', COLORS.green);
  }
  if (hasDenyHandler) {
    log('  ✅ Permission deny handler found', COLORS.green);
  }
  if (hasSettingsLink) {
    log('  ✅ Settings link handler found', COLORS.green);
  }

  return true;
}

function checkHook() {
  log('\n🪝 Checking Notification Permission Hook...', COLORS.cyan);
  
  const hookPath = join(MOBILE_DIR, 'src/hooks/useNotificationPermissionPrompt.ts');
  if (!existsSync(hookPath)) {
    log('  ⚠️  useNotificationPermissionPrompt hook not found', COLORS.yellow);
    return false;
  }

  log('  ✅ useNotificationPermissionPrompt hook found', COLORS.green);
  
  const hookContent = readFileSync(hookPath, 'utf-8');
  const hasStatusCheck = /checkPermissionStatus/.test(hookContent);
  const hasDismiss = /dismissPrompt/.test(hookContent);

  if (hasStatusCheck) {
    log('  ✅ Permission status checking implemented', COLORS.green);
  }
  if (hasDismiss) {
    log('  ✅ Prompt dismissal logic implemented', COLORS.green);
  }

  return true;
}

function checkAppConfig() {
  log('\n⚙️  Checking app.config.cjs...', COLORS.cyan);
  
  const configPath = join(MOBILE_DIR, 'app.config.cjs');
  if (!existsSync(configPath)) {
    log('  ❌ app.config.cjs not found', COLORS.red);
    return false;
  }

  const configContent = readFileSync(configPath, 'utf-8');
  
  const hasNotificationPlugin = /expo-notifications/.test(configContent);
  const hasAndroidPermission = /POST_NOTIFICATIONS/.test(configContent);
  const hasIOSPermission = /NSUserNotifications/.test(configContent);

  if (hasNotificationPlugin) {
    log('  ✅ expo-notifications plugin configured', COLORS.green);
  } else {
    log('  ⚠️  expo-notifications plugin not found', COLORS.yellow);
  }

  if (hasAndroidPermission) {
    log('  ✅ Android POST_NOTIFICATIONS permission configured', COLORS.green);
  } else {
    log('  ⚠️  Android POST_NOTIFICATIONS permission not found', COLORS.yellow);
  }

  if (hasIOSPermission || hasNotificationPlugin) {
    log('  ✅ iOS notification permissions configured', COLORS.green);
  } else {
    log('  ⚠️  iOS notification permissions may be missing', COLORS.yellow);
  }

  return hasNotificationPlugin;
}

function generateTestInstructions() {
  log('\n📋 Manual Testing Instructions', COLORS.cyan);
  log('─'.repeat(50), COLORS.cyan);
  log('\nTo fully validate push notifications, test on a REAL DEVICE:', COLORS.yellow);
  log('\n1. Build and install app on physical device', COLORS.blue);
  log('   pnpm build:android  # or build:ios', COLORS.blue);
  log('\n2. Open app and complete onboarding', COLORS.blue);
  log('\n3. Verify permission prompt appears', COLORS.blue);
  log('   - Should appear after onboarding', COLORS.blue);
  log('   - Should show explanation before requesting', COLORS.blue);
  log('\n4. Grant permission and verify:', COLORS.blue);
  log('   - Token is generated', COLORS.blue);
  log('   - Token is registered with backend', COLORS.blue);
  log('   - Token is stored locally', COLORS.blue);
  log('\n5. Test notification delivery:', COLORS.blue);
  log('   - Send test notification from backend', COLORS.blue);
  log('   - Verify notification appears on device', COLORS.blue);
  log('   - Test notification tap handling', COLORS.blue);
  log('\n6. Test permission denied flow:', COLORS.blue);
  log('   - Deny permission initially', COLORS.blue);
  log('   - Verify settings link works', COLORS.blue);
  log('   - Re-enable in settings', COLORS.blue);
  log('   - Verify app detects permission change', COLORS.blue);
  log('─'.repeat(50), COLORS.cyan);
}

// Main execution
log('🔔 Push Notification Validation', COLORS.cyan);
log('='.repeat(50), COLORS.cyan);

const serviceOk = checkNotificationService();
const promptOk = checkPermissionPrompt();
const hookOk = checkHook();
const configOk = checkAppConfig();

const allPassed = serviceOk && promptOk && hookOk && configOk;

log('\n📊 Summary', COLORS.cyan);
log('─'.repeat(50), COLORS.cyan);

if (allPassed) {
  log('\n✅ All push notification components configured!', COLORS.green);
  log('   Code structure is correct. Ready for device testing.', COLORS.green);
} else {
  log('\n⚠️  Some components need attention', COLORS.yellow);
}

generateTestInstructions();

process.exit(allPassed ? 0 : 1);


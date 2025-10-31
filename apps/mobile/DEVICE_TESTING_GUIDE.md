# 📱 Device Testing Guide - PawfectMatch Mobile

Complete guide for testing IAP, Push Notifications, and E2E flows on real devices.

---

## 🎯 Overview

This guide covers:
- IAP (In-App Purchase) testing
- Push notification testing
- E2E (End-to-End) testing with Detox
- Device setup and configuration
- Troubleshooting common issues

---

## 📋 Prerequisites

### Required Tools
- ✅ Xcode (iOS) or Android Studio (Android)
- ✅ Expo CLI (`pnpm add -g eas-cli`)
- ✅ Physical device (simulators don't support IAP/push)
- ✅ Test accounts for App Store/Play Store

### Required Access
- ✅ RevenueCat account (for IAP)
- ✅ Firebase project (for push notifications)
- ✅ App Store Connect / Google Play Console (for product setup)

---

## 💰 IAP Testing

### Setup Before Testing

1. **Configure RevenueCat**
   ```bash
   # Verify API keys are set
   echo $EXPO_PUBLIC_RC_IOS
   echo $EXPO_PUBLIC_RC_ANDROID
   ```

2. **Install Package**
   ```bash
   cd apps/mobile
   pnpm add react-native-purchases
   ```

3. **Create Test Products**
   - RevenueCat Dashboard → Products
   - Match product IDs from `IAPService.ts`
   - Set up sandbox testing

### iOS Testing

**Test Account Setup**:
1. App Store Connect → Users and Access → Sandbox Testers
2. Create test account
3. Sign out of App Store on device
4. Use test account when prompted during purchase

**Testing Steps**:
```bash
# Build for iOS device
cd apps/mobile
pnpm build:ios

# Or run in development mode
pnpm ios

# Test purchase flow:
# 1. Navigate to Premium screen
# 2. Select subscription tier
# 3. Authenticate with sandbox account
# 4. Verify purchase completes
# 5. Check server receipt validation
```

**Verify**:
- ✅ Products load from App Store
- ✅ Purchase dialog appears
- ✅ Purchase completes successfully
- ✅ Server receives and validates receipt
- ✅ User premium status updates
- ✅ Restore purchases works

### Android Testing

**Test Account Setup**:
1. Google Play Console → Settings → License Testing
2. Add test account email
3. Use test account on device

**Testing Steps**:
```bash
# Build for Android device
cd apps/mobile
pnpm build:android

# Or run in development mode
pnpm android

# Test purchase flow:
# 1. Navigate to Premium screen
# 2. Select subscription tier
# 3. Complete Google Play purchase
# 4. Verify purchase completes
# 5. Check server receipt validation
```

**Verify**:
- ✅ Products load from Play Store
- ✅ Purchase flow completes
- ✅ Server validates purchase token
- ✅ User premium status updates
- ✅ Restore purchases works

### Common IAP Issues

**Products don't appear**:
- Check RevenueCat dashboard products exist
- Verify API keys are correct
- Check network connectivity
- Verify product IDs match exactly

**Purchase fails immediately**:
- Check sandbox/test account is signed in
- Verify backend receipt validation endpoint
- Check server logs for errors
- Ensure product is approved in store

**Restore doesn't work**:
- Verify user is logged in
- Check RevenueCat customer ID
- Verify purchases exist in customer info
- Check server purchase history endpoint

---

## 📱 Push Notification Testing

### Setup Before Testing

1. **Configure FCM**
   ```bash
   # Server .env
   FCM_SERVER_KEY=your_server_key_here
   ```

2. **Expo Push Setup**
   - Expo Dashboard → Project Settings → Credentials
   - Upload iOS push certificates (APNs)
   - Configure Android (optional if using FCM directly)

3. **Firebase Console**
   - Get FCM server key from Firebase Console
   - Verify Cloud Messaging is enabled

### Testing Flow

**1. Request Permission**:
```typescript
// App should prompt user for notification permission
// Check: Settings screen → Notifications section
```

**2. Register Token**:
```bash
# Check logs for token registration
# Should see: "Push token registered: ExpoPushToken[...]"

# Verify in database:
# User document should have pushTokens array with token
```

**3. Test Delivery**:
```bash
# Send test notification via backend API or Firebase Console
# Verify notification appears on device

# Test scenarios:
# - Foreground (app open)
# - Background (app minimized)
# - Killed state (app closed)
```

**4. Test Notification Tap**:
```bash
# Tap notification
# Verify deep link navigation works
# Check notification data is processed correctly
```

### iOS Testing

**Requirements**:
- ✅ Real iOS device (simulators don't support push)
- ✅ APNs certificates uploaded to Expo
- ✅ Device registered with FCM/APNs

**Testing Steps**:
```bash
# Run on real device
pnpm ios

# Or build and install
pnpm build:ios

# Check token registration in logs
# Send test notification
# Verify delivery
```

**Verify**:
- ✅ Permission granted
- ✅ Token registered
- ✅ Notification received
- ✅ Tap navigation works
- ✅ Badge count updates

### Android Testing

**Requirements**:
- ✅ Real Android device (emulators can work but real device preferred)
- ✅ FCM server key configured
- ✅ Device has Google Play Services

**Testing Steps**:
```bash
# Run on real device
pnpm android

# Or build and install APK
pnpm build:android

# Check token registration
# Send test notification via FCM
# Verify delivery
```

**Verify**:
- ✅ Permission granted
- ✅ Token registered
- ✅ Notification channel created
- ✅ Notification received
- ✅ Tap navigation works

### Common Push Issues

**Token not registering**:
- Must use real device (not simulator)
- Check permissions granted
- Verify Expo push certificates configured
- Check network connectivity

**Notifications not delivering**:
- Verify `FCM_SERVER_KEY` is correct
- Check token exists in database
- Verify backend service is running
- Check FCM quota/limits
- Verify notification payload format

**Permission denied**:
- User must explicitly grant
- Check if previously denied (need to guide to Settings)
- Verify permission request code

---

## 🧪 E2E Testing (Detox)

### Setup

**Install Dependencies**:
```bash
cd apps/mobile
pnpm install
```

**Build for Testing**:
```bash
# iOS
pnpm e2e:build:ios:cloud  # Cloud build (recommended)
# OR
xcodebuild -workspace ios/PawfectMatch.xcworkspace \
  -scheme PawfectMatch \
  -configuration Debug \
  -sdk iphonesimulator

# Android
pnpm e2e:build:android:cloud  # Cloud build (recommended)
# OR
cd android && ./gradlew assembleDebug assembleAndroidTest
```

### Running E2E Tests

**iOS**:
```bash
# Start simulator
xcrun simctl boot "iPhone 15"

# Run tests
pnpm e2e:ios

# Or specific test file
detox test -c ios.sim.debug e2e/auth.e2e.ts
```

**Android**:
```bash
# Start emulator
emulator -avd Pixel_6_API_34

# Run tests
pnpm e2e:android

# Or specific test file
detox test -c android.emu.debug e2e/swipe.e2e.ts
```

### E2E Test Files

Available test suites:
- `e2e/auth.e2e.ts` - Authentication flows
- `e2e/swipe.e2e.ts` - Card swiping
- `e2e/mainFlow.e2e.test.ts` - Complete user journey
- `e2e/gdpr-flow.e2e.ts` - Privacy compliance
- `e2e/premium.guard.e2e.ts` - Premium features
- `e2e/map/*.e2e.js` - Map functionality

### Common E2E Issues

**Build fails**:
- Check Xcode/Android Studio setup
- Verify dependencies installed
- Check build logs for specific errors

**Tests timeout**:
- Increase timeout in `detox.config.cjs`
- Check device/simulator is responsive
- Verify app launches correctly

**Tests fail intermittently**:
- Add waitFor statements
- Increase action timeouts
- Check for race conditions

---

## 🔍 Validation & Verification

### Configuration Check

```bash
# Run validation script
cd apps/mobile
node scripts/validate-platform-config.mjs
```

This checks:
- ✅ IAP configuration
- ✅ Push notification setup
- ✅ Environment variables
- ✅ Package installations

### Manual Verification Checklist

**IAP**:
- [ ] Products load from stores
- [ ] Purchase flow completes
- [ ] Receipt validation works
- [ ] Restore purchases works
- [ ] Error handling works

**Push**:
- [ ] Permission granted
- [ ] Token registered
- [ ] Notification received
- [ ] Tap navigation works
- [ ] Background delivery works

**E2E**:
- [ ] All test suites pass
- [ ] Tests run on both platforms
- [ ] No flaky tests
- [ ] Screenshots/artifacts generated

---

## 📊 Testing Reports

After testing, generate reports:

```bash
# Test summary
pnpm test:generate-summary

# Coverage report
pnpm test:coverage

# E2E artifacts
# Check e2e/artifacts/ directory
```

---

## 🐛 Debugging Tips

### Enable Debug Logging

**IAP**:
```typescript
// In IAPService.ts, logging is already enabled
// Check logs for: "IAP service initialized", "Purchase completed", etc.
```

**Push**:
```typescript
// In notifications.ts, check logs for:
// "Push token registered", "Notification received", etc.
```

### Network Debugging

Use network inspection tools:
- iOS: Proxyman, Charles Proxy
- Android: Android Studio Network Inspector

### Server Logs

Check backend logs for:
- Receipt validation requests
- FCM delivery attempts
- Token registration

---

## ✅ Success Criteria

All platform integrations are ready when:

1. **IAP**:
   - ✅ Products load successfully
   - ✅ Purchase flow works on real device
   - ✅ Server validation passes
   - ✅ Restore purchases works

2. **Push**:
   - ✅ Tokens register on real device
   - ✅ Notifications deliver successfully
   - ✅ Tap navigation works
   - ✅ Background delivery works

3. **E2E**:
   - ✅ All critical test suites pass
   - ✅ Tests run reliably on CI
   - ✅ No blocking issues

---

## 🚀 Next Steps

1. Complete RevenueCat configuration
2. Set up Firebase and get FCM key
3. Configure Expo push certificates
4. Test on real iOS device
5. Test on real Android device
6. Run full E2E test suite
7. Verify all checklist items

---

**Ready for production deployment after successful device testing!**


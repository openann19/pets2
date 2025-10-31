# 📱 Store Compliance & Readiness Checklist

**Date:** January 2025  
**Status:** In Progress  
**Target:** Apple App Store + Google Play Store Submission Ready

---

## 📚 Comprehensive Store Submission Documentation

**For detailed submission checklists, reviewer notes templates, and common rejection traps, see:**

👉 **[`docs/store-submission/`](./store-submission/)** directory contains:

- **[QUICK_REFERENCE.md](./store-submission/QUICK_REFERENCE.md)** - ⚡ Start here! Quick status checks and priority actions
- **[IOS_APP_STORE_CHECKLIST.md](./store-submission/IOS_APP_STORE_CHECKLIST.md)** - Complete iOS submission checklist
- **[ANDROID_PLAY_STORE_CHECKLIST.md](./store-submission/ANDROID_PLAY_STORE_CHECKLIST.md)** - Complete Android submission checklist
- **[REVIEWER_NOTES_TEMPLATES.md](./store-submission/REVIEWER_NOTES_TEMPLATES.md)** - Copy-paste templates for reviewer notes
- **[COMMON_REJECTION_TRAPS.md](./store-submission/COMMON_REJECTION_TRAPS.md)** - Top 8 rejection traps and fixes
- **[STATUS_TRACKER.md](./store-submission/STATUS_TRACKER.md)** - Detailed submission readiness status

**Critical Actions Required:**
- ⚠️ **iOS**: Review ATT implementation (generic description detected)
- ❌ **Android**: Update target API to 35 (currently 34)
- ❌ **Android**: Complete Data Safety form

---

## 2.1 Policy & Metadata

### Privacy Policy & Terms Links
- ✅ **Privacy Policy URL**: Configured in `app.config.cjs` (`privacyPolicyUrl: 'https://pawfectmatch.com/privacy'`)
- ✅ **Terms of Service URL**: Configured (`termsOfServiceUrl: 'https://pawfectmatch.com/terms'`)
- ⚠️ **In-App Links**: Need to verify these links are present in:
  - Settings screen
  - Onboarding flow
  - Paywall screens
  - Account deletion screen

**Action Required:**
- [ ] Add privacy policy link to `SettingsScreen.tsx`
- [ ] Add privacy policy link to `DeactivateAccountScreen.tsx`
- [ ] Add terms/privacy links to onboarding screens
- [ ] Add privacy policy link to premium/paywall screens

### Account Deletion
- ✅ **Backend**: GDPR deletion endpoints implemented (`/api/account/delete`, `/api/account/cancel-deletion`)
- ✅ **Mobile**: `DeactivateAccountScreen.tsx` exists with deletion flow
- ✅ **Grace Period**: 30-day grace period implemented
- ✅ **Confirmation**: Password verification required
- ⚠️ **Discoverability**: Need to verify account deletion is easily discoverable

**Action Required:**
- [ ] Verify "Delete Account" button is visible in Settings → Privacy & Safety
- [ ] Test account deletion flow end-to-end
- [ ] Verify email/username shown before deletion
- [ ] Verify data wipe confirmation after grace period

### IAP Compliance (In-App Purchases)
- ✅ **iOS**: Uses RevenueCat (`Purchases` API) for subscriptions
- ✅ **Android**: Uses RevenueCat for subscriptions
- ⚠️ **Restore Purchases**: UI exists in `PremiumProvider.tsx` (`restore()` method)
- ⚠️ **Restore UI**: Need to verify "Restore Purchases" button is visible and tested

**Action Required:**
- [ ] Verify "Restore Purchases" button in `PremiumScreen.tsx` or `ManageSubscriptionScreen.tsx`
- [ ] Test restore purchases flow on iOS sandbox
- [ ] Test restore purchases flow on Android sandbox
- [ ] Verify no external payment links (all purchases via IAP)
- [ ] Test subscription cancellation flow
- [ ] Test subscription renewal flow
- [ ] Test price change consent handling

### Data Safety / Privacy Nutrition
- ✅ **iOS Privacy Manifests**: Configured in `app.config.cjs`:
  - `NSPrivacyAccessedAPITypes` (File Timestamp, System Boot Time)
  - `NSPrivacyCollectedDataTypes` (Location, Photos/Videos, Name, Email)
- ⚠️ **Android Data Safety**: Need to generate JSON for Play Console

**Action Required:**
- [ ] Generate Android Data Safety JSON (see template below)
- [ ] Submit iOS Privacy Manifest to App Store Connect
- [ ] Verify all data types are accurately declared

**Android Data Safety Template (To Generate):**
```json
{
  "data_types": [
    {
      "type": "location",
      "collected": true,
      "shared": false,
      "purpose": "app_functionality",
      "optional": false
    },
    {
      "type": "photos",
      "collected": true,
      "shared": false,
      "purpose": "app_functionality",
      "optional": false
    },
    {
      "type": "audio",
      "collected": true,
      "shared": false,
      "purpose": "app_functionality",
      "optional": false
    },
    {
      "type": "personal_info",
      "collected": true,
      "shared": false,
      "purpose": "app_functionality",
      "optional": false
    }
  ],
  "security_practices": {
    "data_encrypted_in_transit": true,
    "data_encrypted_at_rest": true,
    "users_can_request_deletion": true,
    "data_deleted_when_user_uninstalls": false
  }
}
```

---

## 2.2 Platform Targets & Build

### iOS
- ✅ **Hermes**: Enabled (`jsEngine: 'hermes'`)
- ✅ **Bitcode**: Not required (iOS 14+)
- ⚠️ **App Size**: Need to verify and optimize
  - Current: Unknown (need to check build output)
  - Target: < 100MB download size
  - Target: < 200MB installed size

**Action Required:**
- [ ] Run `eas build --platform ios --profile production` and check size
- [ ] Strip unused architectures (arm64 only for iOS 14+)
- [ ] Enable dead code elimination
- [ ] Verify asset thinning works
- [ ] Remove unused locales/fonts/Lottie frames if any

### Android
- ✅ **App Bundle**: Should use AAB format (not APK)
- ✅ **R8/ProGuard**: Should be enabled in `android/app/build.gradle`
- ✅ **Target SDK**: 34 (latest)
- ✅ **64-bit ABIs**: Should be supported
- ⚠️ **App Size**: Need to verify and optimize

**Action Required:**
- [ ] Verify `android/app/build.gradle` has:
  ```gradle
  buildTypes {
    release {
      minifyEnabled true
      shrinkResources true
      proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
    }
  }
  ```
- [ ] Build AAB and check size: `./gradlew bundleRelease`
- [ ] Verify resource shrinking works
- [ ] Remove unused locales/fonts/assets
- [ ] Use WebP/AVIF for images instead of PNG where possible

---

## 2.3 Permissions & Declarations

### iOS Permissions (Current)
```json
{
  "NSCameraUsageDescription": "PawfectMatch uses the camera for pet photo uploads and AR discovery features",
  "NSLocationWhenInUseUsageDescription": "PawfectMatch uses your location to find compatible pets nearby",
  "NSMicrophoneUsageDescription": "PawfectMatch uses the microphone for video calls with pet matches",
  "NSPhotoLibraryUsageDescription": "PawfectMatch needs access to your photo library to upload pet pictures",
  "NSContactsUsageDescription": "PawfectMatch can sync your contacts to help you find friends who use the app"
}
```

**Status:** ✅ All permission strings are human-readable and task-specific

**Action Required:**
- [ ] Verify `NSContactsUsageDescription` is actually used (if not, remove permission)
- [ ] Check if background location is needed (if not, remove `ACCESS_BACKGROUND_LOCATION`)

### Android Permissions (Current)
```json
{
  "android.permission.CAMERA": "Required for video calls and photo uploads",
  "android.permission.ACCESS_FINE_LOCATION": "Required for finding nearby pets",
  "android.permission.ACCESS_COARSE_LOCATION": "Required for finding nearby pets",
  "android.permission.ACCESS_BACKGROUND_LOCATION": "⚠️ Review if needed",
  "android.permission.RECORD_AUDIO": "Required for voice and video calls",
  "android.permission.MODIFY_AUDIO_SETTINGS": "Required for call audio routing",
  "android.permission.READ_EXTERNAL_STORAGE": "Required for photo uploads",
  "android.permission.WRITE_EXTERNAL_STORAGE": "⚠️ May not be needed on Android 10+",
  "android.permission.READ_MEDIA_IMAGES": "Required for photo uploads (Android 13+)",
  "android.permission.READ_MEDIA_VIDEO": "Required for video uploads (Android 13+)",
  "android.permission.INTERNET": "Required for network access",
  "android.permission.ACCESS_NETWORK_STATE": "Required for network monitoring",
  "android.permission.VIBRATE": "Required for notifications",
  "android.permission.POST_NOTIFICATIONS": "Required for push notifications (Android 13+)"
}
```

**Action Required:**
- [ ] **Remove `ACCESS_BACKGROUND_LOCATION`** if not used (requires justification for Play Store)
- [ ] **Remove `WRITE_EXTERNAL_STORAGE`** if using scoped storage (Android 10+)
- [ ] Verify all permissions have runtime requests implemented
- [ ] Test permission denial flows

---

## 2.4 Payments & Subscriptions

### Purchase Flow
- ✅ **RevenueCat Integration**: `PremiumProvider.tsx` uses `Purchases.purchasePackage()`
- ✅ **Restore Purchases**: `restore()` method implemented
- ⚠️ **UI**: Need to verify restore button is visible

**Action Required:**
- [ ] Verify "Restore Purchases" button in premium/subscription screens
- [ ] Test purchase flow on iOS sandbox
- [ ] Test purchase flow on Android sandbox
- [ ] Test restore purchases flow
- [ ] Test subscription cancellation (via system settings)
- [ ] Test subscription renewal
- [ ] Test price change consent flow (if applicable)
- [ ] Verify "Manage Subscription" link opens system subscription management

### Post-Purchase Screens
- ✅ **Success Screen**: `PremiumSuccessScreen.tsx` exists
- ✅ **Cancel Screen**: `PremiumCancelScreen.tsx` exists
- ✅ **Manage Subscription**: `ManageSubscriptionScreen.tsx` exists

**Action Required:**
- [ ] Verify "Manage Subscription" entry point is clear and discoverable
- [ ] Test all post-purchase flows

### Server Receipt Validation
- ⚠️ **Status**: Unknown if server validates receipts
- ⚠️ **Timeout/Retry**: Need to verify server-side validation has timeouts

**Action Required:**
- [ ] Verify backend validates iOS receipts
- [ ] Verify backend validates Android receipts
- [ ] Add timeouts to receipt validation (10s max)
- [ ] Add retry logic for failed validations
- [ ] Ensure UI doesn't hang during validation

---

## Store Assets Pack

### Required Assets
- [ ] **App Icons**:
  - iOS: 1024x1024 (App Store icon)
  - Android: Adaptive icon (foreground + background)
- [ ] **Screenshots**:
  - iOS: 6.5" iPhone (1290x2796), 6.7" iPhone (1284x2778), iPad Pro (2048x2732)
  - Android: Phone (1080x1920), Tablet (optional)
  - Light mode + Dark mode screenshots
  - Minimum 2 screenshots per device, maximum 10
- [ ] **Preview Video** (optional but recommended):
  - 15-30 seconds showcasing key features
  - iOS: MP4, max 500MB
  - Android: MP4, max 30MB
- [ ] **Localized Descriptions**:
  - App name (30 chars max)
  - Subtitle (30 chars max)
  - Description (4000 chars max)
  - Keywords (100 chars max, iOS only)
  - Promotional text (170 chars max, iOS only)

### Screenshot Scenarios
1. Onboarding/Swipe screen
2. Match/Profile screen
3. Chat screen
4. Video call screen (if applicable)
5. Settings/Privacy screen
6. Premium screen

---

## Submission Checklist

### Pre-Submission
- [ ] All privacy policy links work
- [ ] Account deletion tested and working
- [ ] IAP purchases tested in sandbox
- [ ] Restore purchases tested
- [ ] App size optimized
- [ ] Permissions reviewed and minimal
- [ ] All screenshots taken
- [ ] App descriptions written
- [ ] Keywords optimized

### iOS App Store Connect
- [ ] App created in App Store Connect
- [ ] Bundle ID matches (`com.pawfectmatch.premium`)
- [ ] Privacy policy URL added
- [ ] App description added
- [ ] Screenshots uploaded
- [ ] Preview video uploaded (if applicable)
- [ ] App icons uploaded
- [ ] Age rating completed
- [ ] App Review Information filled
- [ ] Pricing and Availability set
- [ ] Version information filled
- [ ] Build uploaded via EAS or Xcode

### Google Play Console
- [ ] App created in Play Console
- [ ] Package name matches (`com.pawfectmatch.premium`)
- [ ] Privacy policy URL added
- [ ] App description added
- [ ] Screenshots uploaded
- [ ] Preview video uploaded (if applicable)
- [ ] App icons uploaded
- [ ] Content rating completed
- [ ] Data Safety form completed
- [ ] Pricing and Distribution set
- [ ] AAB uploaded via EAS or gradle

---

## Testing Checklist

### iOS Sandbox Testing
- [ ] Sign in with sandbox account
- [ ] Purchase subscription
- [ ] Restore purchases
- [ ] Cancel subscription (via Settings)
- [ ] Test subscription renewal
- [ ] Test account deletion
- [ ] Test all permission flows

### Android Sandbox Testing
- [ ] Sign in with test account
- [ ] Purchase subscription
- [ ] Restore purchases
- [ ] Cancel subscription (via Play Store)
- [ ] Test subscription renewal
- [ ] Test account deletion
- [ ] Test all permission flows

---

## Next Steps

1. **Immediate (Before Submission)**:
   - [ ] Add privacy policy links to all screens
   - [ ] Verify account deletion discoverability
   - [ ] Test IAP flows in sandbox
   - [ ] Optimize app size
   - [ ] Remove unused permissions
   - [ ] Generate store assets

2. **Before First Release**:
   - [ ] Complete all store forms
   - [ ] Upload screenshots and metadata
   - [ ] Submit for review
   - [ ] Monitor review status
   - [ ] Respond to any review feedback

---

## Related Files

- `apps/mobile/app.config.cjs` - App configuration
- `apps/mobile/src/screens/SettingsScreen.tsx` - Settings screen
- `apps/mobile/src/screens/DeactivateAccountScreen.tsx` - Account deletion
- `apps/mobile/src/screens/premium/PremiumScreen.tsx` - Premium screen
- `apps/mobile/src/providers/PremiumProvider.tsx` - RevenueCat integration


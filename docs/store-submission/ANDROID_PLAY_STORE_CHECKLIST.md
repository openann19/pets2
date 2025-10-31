# 🤖 Android Play Store Submission Checklist
**App**: PawfectMatch Premium  
**Package Name**: `com.pawfectmatch.premium`  
**Target**: Zero-drama approval on first pass  
**Last Updated**: January 2025

---

## ✅ COMPLIANCE SECTION

### Developer Program Policies
- [ ] **Policy 1 - Content**: No deceptive content, malware, or illegal activities
- [ ] **Policy 2 - User Data**: Privacy policy accessible, data handling transparent
- [ ] **Policy 3 - Deceptive Behavior**: No fake reviews, manipulation, or impersonation
- [ ] **Policy 4 - Spam**: No repetitive or low-quality content
- [ ] **Policy 5 - Monetization**: All digital goods via Play Billing ✅ (RevenueCat)
- [ ] **Policy 6 - User Control**: Account deletion available ✅

**Play Console Notes Section (Add in "Store listing" → "App content"):**
```
DIGITAL GOODS & PAYMENTS:
- All subscriptions use Google Play Billing via RevenueCat SDK
- Premium features unlocked through monthly/yearly subscriptions only
- No external payment links or alternative payment flows
- Subscription management available in-app via "Manage Subscription" button
- Restore Purchases functionality available from Premium screen

To test purchases:
1. Navigate to: Home → Premium (bottom tab) → Select subscription tier
2. Test account: [INSERT_TEST_ACCOUNT_EMAIL]
3. Verify: Subscriptions activate premium features (unlimited swipes, advanced filters, etc.)

ACCOUNT DELETION:
- Available from: Profile → Settings → Privacy & Safety → Delete Account
- Requires password confirmation
- 30-day grace period before permanent deletion
- Confirmation email sent upon deletion request
- Backend data deletion completed within grace period

To test deletion:
1. Navigate to: Profile (bottom tab) → Settings (gear icon) → Privacy & Safety → Delete Account
2. Enter password: [INSERT_TEST_PASSWORD]
3. Verify: Account marked for deletion, grace period timer visible, backend schedules deletion

LOCATION PERMISSIONS:
- Location requested only "When In Use" (ACCESS_FINE_LOCATION, ACCESS_COARSE_LOCATION)
- Used exclusively for: Finding compatible pets within user's proximity
- Rationale: Core feature of pet matching app
- Location is not shared with third parties or used for advertising
- Foreground disclosure shown if location accessed in foreground

CAMERA/PHOTOS PERMISSIONS:
- Camera: Pet photo uploads and AR discovery features
- Photo Library: Accessing existing pet photos for profile creation (READ_MEDIA_IMAGES, READ_MEDIA_VIDEO on Android 13+)
- Photos stored securely, only visible to user and matched users

MICROPHONE PERMISSION:
- Used only for: Video calls with matched pet owners
- Requested only when user initiates a video call (not at app launch)

FOREGROUND SERVICES:
- None required - app does not use foreground services for location, media playback, or other background tasks

STORAGE PERMISSIONS:
- Using scoped storage (Android 10+)
- READ_EXTERNAL_STORAGE not needed on Android 10+ (using READ_MEDIA_IMAGES/VIDEO)
- WRITE_EXTERNAL_STORAGE not needed (using scoped storage)
```

---

### Target API Level (CRITICAL)
- [ ] **Target API 35**: App targets API 35 (Android 15) for NEW submissions/updates ⚠️ **Currently API 34 - UPDATE REQUIRED**
- [ ] **Existing App Minimum**: At least API 34 by Aug 31, 2025 (transitional)
- [ ] **64-bit Support**: 64-bit native libraries present (arm64-v8a)
- [ ] **Background Restrictions**: Compliant with Android 12+ background restrictions
- [ ] **Foreground Service Types**: Only declared if actually used (none for this app)

**ACTION REQUIRED:**
```
Current: targetSdkVersion: 34 (from app.config.cjs:52)
Required: targetSdkVersion: 35 (Android 15)

Update in apps/mobile/app.config.cjs:
android: {
  targetSdkVersion: 35,
  compileSdkVersion: 35,
  ...
}
```

**Review Steps:**
1. Update `app.config.cjs` to target API 35
2. Build AAB: `pnpm build:android`
3. Test on Android 15 emulator/device
4. Verify no breaking changes from API 35 restrictions
5. Update `eas.json` if needed for build config

---

### Data Safety Form (CRITICAL)
- [ ] **Data Safety Section Completed**: All data types accurately declared
- [ ] **Data Types Match Runtime Behavior**: Exactly matches what app actually collects
- [ ] **Data Deletion Questions**: Completed (required for apps with account creation)

**Data Safety Form Template:**

```
DATA COLLECTED:

1. Location (approximate)
   - Collected: Yes
   - Shared: No
   - Purpose: App functionality (finding nearby pets)
   - Required: Optional (app works without location)
   - Retention: Until account deletion

2. Photos/Videos
   - Collected: Yes
   - Shared: No (only with matched users within app)
   - Purpose: App functionality (pet profile photos)
   - Required: Optional (user-provided)
   - Retention: Until account deletion

3. Personal Info (Name, Email)
   - Collected: Yes
   - Shared: No
   - Purpose: Account creation, user identification
   - Required: Yes (for account)
   - Retention: Until account deletion

4. User ID
   - Collected: Yes (app-generated)
   - Shared: No
   - Purpose: Account authentication, app functionality
   - Required: Yes
   - Retention: Until account deletion

5. Purchase History
   - Collected: Yes (subscription status)
   - Shared: No
   - Purpose: App functionality (premium feature access)
   - Required: Yes (for IAP)
   - Retention: Until account deletion

DATA SHARED WITH THIRD PARTIES:
- None (unless analytics SDK shares anonymized, non-identifiable data)

SECURITY PRACTICES:
- Data encrypted in transit: Yes (HTTPS/TLS)
- Data encrypted at rest: Yes (encrypted database)
- Users can request deletion: Yes (in-app account deletion)
- Data deleted when user uninstalls: No (account persists, but user can delete account)

DATA DELETION:
- Account deletion available in-app
- Deletion path: Profile → Settings → Privacy & Safety → Delete Account
- Grace period: 30 days (user can cancel during grace period)
- Backend deletion: All user data deleted within grace period
- Confirmation: Email sent upon deletion request and completion
```

**ACTION REQUIRED:**
- [ ] Fill Data Safety form in Play Console accurately
- [ ] Match every data type to actual code behavior
- [ ] Complete Data deletion section (new requirement for account-based apps)
- [ ] Review and update if SDKs change or new data types added

---

### Play Billing (Digital Goods)
- [ ] **All Digital Goods via Play Billing**: Subscriptions use Play Billing ✅ (RevenueCat)
- [ ] **No External Steering**: No links to external payment methods that violate policy
- [ ] **Subscription Management**: In-app "Manage Subscription" opens Play Store subscription management
- [ ] **Restore Purchases**: Implemented and tested ✅

**Testing Checklist:**
- [ ] Purchase subscription in sandbox
- [ ] Restore purchases on new device
- [ ] Cancel subscription via Play Store
- [ ] Verify subscription renewal
- [ ] Verify premium features unlock/lock correctly

---

## 🔐 PERMISSIONS & DECLARATIONS

### Manifest Permissions Review
- [ ] **Only Requested Permissions Remain**: Remove any unused permissions
- [ ] **Runtime Permissions**: All dangerous permissions requested at runtime
- [ ] **Storage Permissions**: Using scoped storage (Android 10+)

**Current Permissions (from app.config.cjs:58-66):**
```
✅ CAMERA - Required for pet photos
✅ ACCESS_FINE_LOCATION - Required for nearby pets
✅ ACCESS_COARSE_LOCATION - Required for nearby pets
✅ RECORD_AUDIO - Required for video calls
✅ MODIFY_AUDIO_SETTINGS - Required for call audio routing
✅ INTERNET - Required for network access
✅ ACCESS_NETWORK_STATE - Required for network monitoring
✅ VIBRATE - Required for notifications
⚠️ POST_NOTIFICATIONS - Add if targeting Android 13+ (API 33+)
```

**Permissions to REMOVE if not used:**
- [ ] `ACCESS_BACKGROUND_LOCATION` - **Remove if not needed** (requires strong justification)
- [ ] `WRITE_EXTERNAL_STORAGE` - **Remove if using scoped storage** (Android 10+)
- [ ] `READ_EXTERNAL_STORAGE` - **Remove if using scoped storage** (Android 10+)

**Android 13+ (API 33+) Permissions:**
- [ ] `READ_MEDIA_IMAGES` - Add for photo access (Android 13+)
- [ ] `READ_MEDIA_VIDEO` - Add for video access (Android 13+)
- [ ] `POST_NOTIFICATIONS` - Add for push notifications (Android 13+)

**ACTION REQUIRED:**
- [ ] Audit actual permission usage in code
- [ ] Remove unused permissions from manifest
- [ ] Add Android 13+ media permissions if targeting API 33+
- [ ] Add POST_NOTIFICATIONS if targeting API 33+

---

### Advertising ID Declaration
- [ ] **Advertising ID Used**: Declare if any SDK uses Advertising ID
- [ ] **User Reset/Opt-out**: Honor user's "Reset Advertising ID" and "Opt out of Ads Personalization" settings
- [ ] **If Not Used**: No declaration needed

**Check SDKs:**
- RevenueCat: Does NOT use Advertising ID
- Analytics SDKs: May use Advertising ID (check documentation)
- Advertising SDKs: Require Advertising ID declaration

**If Advertising ID Used:**
```
DECLARATION IN PLAY CONSOLE:
- Advertising ID collected: Yes/No
- Purpose: Analytics/Advertising (if applicable)
- User can opt out: Yes (via device settings)
```

---

### Exact Alarms & Foreground Services
- [ ] **Exact Alarms**: Only declare if using `SCHEDULE_EXACT_ALARM` permission
- [ ] **Foreground Service Types**: Only declare types actually used:
  - [ ] `FOREGROUND_SERVICE_TYPE_LOCATION` - Only if using background location
  - [ ] `FOREGROUND_SERVICE_TYPE_CAMERA` - Only if using camera in background
  - [ ] `FOREGROUND_SERVICE_TYPE_MICROPHONE` - Only if using mic in background
  - [ ] None declared if app doesn't use foreground services ✅

**Reviewer Notes:**
```
FOREGROUND SERVICES:
- App does NOT use foreground services
- All features operate in foreground only
- No background location, media playback, or other background tasks
```

---

### Storage Permissions (Android 10+)
- [ ] **Scoped Storage**: App uses scoped storage (Android 10+)
- [ ] **No MANAGE_EXTERNAL_STORAGE**: Only use if policy-eligible (file managers, backup apps)
- [ ] **Media Permissions**: Use `READ_MEDIA_IMAGES`/`READ_MEDIA_VIDEO` instead of `READ_EXTERNAL_STORAGE` on Android 13+

**ACTION REQUIRED:**
- [ ] Verify scoped storage implementation
- [ ] Remove `WRITE_EXTERNAL_STORAGE` if not needed
- [ ] Add `READ_MEDIA_IMAGES` and `READ_MEDIA_VIDEO` for Android 13+

---

## 📦 STORE PREPARATION

### Content Rating (IARC)
- [ ] **Content Rating Completed**: Age-appropriate rating selected
- [ ] **Appropriate for**: Ages 4+ (family-friendly, no violence/mature content)
- [ ] **Content Descriptors**: None needed

---

### Target Audience
- [ ] **Primary Audience**: Adults 18+ (pet owners/adopters)
- [ ] **Secondary Audience**: Families
- [ ] **Category**: Dating/Social (pet matching)

---

### Store Listing
- [ ] **App Name**: "PawfectMatch Premium" (50 chars max)
- [ ] **Short Description**: 80 chars max - e.g., "Find your perfect pet match with AI-powered compatibility"
- [ ] **Full Description**: 4000 chars max, highlight key features
- [ ] **Privacy Policy URL**: `https://pawfectmatch.com/privacy` ✅
- [ ] **Support URL/Email**: `support@pawfectmatch.com` or `https://pawfectmatch.com/support`
- [ ] **App Icon**: 512x512 PNG (Play Store) + Adaptive icon (1024x1024 foreground + background)
- [ ] **Feature Graphic**: 1024x500 PNG (Play Store header)
- [ ] **Screenshots**: 
  - Phone: 1080x1920 (minimum 2, maximum 8)
  - Tablet: 1200x1920 (optional)
  - 7-inch Tablet: 1024x600 (optional)
  - TV: 1920x1080 (optional)
- [ ] **Preview Video**: Optional, 30 seconds max, max 100MB

**Screenshot Scenarios:**
1. Onboarding/Swipe screen (show key feature)
2. Match/Profile screen (show match success)
3. Chat screen (show communication)
4. Premium screen (show subscription options)
5. Settings/Privacy screen (show account controls)

---

### Pre-Launch Report
- [ ] **Pre-Launch Report Run**: Automated testing completed
- [ ] **Crashes Fixed**: Zero crashes in Pre-Launch report
- [ ] **ANRs Fixed**: Zero ANRs (Application Not Responding)
- [ ] **Malware Flags**: None
- [ ] **Performance Issues**: All resolved

**ACTION REQUIRED:**
- [ ] Run Pre-Launch report before submission
- [ ] Fix all crashes and ANRs
- [ ] Verify no malware/virus flags
- [ ] Test on multiple devices (different screen sizes, Android versions)

---

### Release Tracks
- [ ] **Start with Closed Testing**: Internal testing with team
- [ ] **Then Open Testing**: Beta testing with external testers
- [ ] **Finally Production**: Staged rollout (start with 5%, then 10%, then 100%)

**Recommended Rollout:**
1. **Internal Testing**: Team only, verify build works
2. **Closed Testing**: 50-100 beta testers, collect feedback
3. **Open Testing**: Public beta (optional), gather reviews
4. **Production**: Staged rollout
   - Week 1: 5% of users
   - Week 2: 10% of users
   - Week 3: 50% of users
   - Week 4: 100% of users

---

## 🧪 QUALITY ASSURANCE

### Pre-Submission Testing
- [ ] **Android Vitals Healthy**:
  - [ ] Crash rate < 0.2% (target: 99.8% crash-free)
  - [ ] ANR rate < 0.1% (target: 99.9% ANR-free)
  - [ ] Cold start p95 < 2.5s
- [ ] **Multi-Window Support**: Test app in split-screen mode
- [ ] **Large Screen Layouts**: Test on tablets (if supports tablet)
- [ ] **Background Location Disclosure**: If using background location, foreground disclosure shown
- [ ] **Permission Denial**: App handles permission denial gracefully
- [ ] **Purchase Flows**: 
  - [ ] Subscriptions create successfully
  - [ ] Restore purchases works
  - [ ] Subscription cancellation works
  - [ ] Subscription renewal works

---

### Device Testing Matrix
Test on:
- [ ] Android 12 (API 31)
- [ ] Android 13 (API 33)
- [ ] Android 14 (API 34)
- [ ] Android 15 (API 35) - **Critical**
- [ ] Different screen sizes (phone, tablet)
- [ ] Different manufacturers (Samsung, Google, OnePlus, etc.)

---

### Play Billing Testing
- [ ] **Purchase Flow**:
  1. Navigate to Premium screen
  2. Select subscription tier
  3. Complete purchase (sandbox)
  4. Verify premium features unlock
- [ ] **Restore Purchases**:
  1. Sign in on new device
  2. Tap "Restore Purchases" button
  3. Verify premium features restore
- [ ] **Subscription Cancellation**:
  1. Cancel via Play Store → Subscriptions
  2. Verify app shows grace period
  3. Verify premium features remain until expiry
- [ ] **Price Change Consent**:
  1. If price changes, verify consent flow works
  2. Verify user can decline and cancel

---

## 🚨 COMMON REJECTION TRAPS (Fix Before Submit)

### ⚠️ Target API Too Low (CRITICAL)
- [ ] **Issue**: New updates not targeting API 35
- [ ] **Fix**: Update `targetSdkVersion: 35` in `app.config.cjs`
- [ ] **Status**: ⚠️ **Currently API 34 - UPDATE REQUIRED**

### ⚠️ Data Safety Mismatch
- [ ] **Issue**: Data Safety claims don't match SDK behavior or logging
- [ ] **Fix**: Audit all SDKs, match Data Safety form exactly
- [ ] **Status**: ⚠️ Verify after SDK audit

### ⚠️ Account Deletion Missing
- [ ] **Issue**: App allows account creation but no in-app deletion
- [ ] **Fix**: Verify Delete Account button visible and functional
- [ ] **Status**: ✅ Account deletion implemented, verify discoverability

### ⚠️ Pre-Launch Report Failures
- [ ] **Issue**: Crashes, ANRs, or malware flags in Pre-Launch report
- [ ] **Fix**: Fix all issues before submission
- [ ] **Status**: ⚠️ Run Pre-Launch report before submission

### ⚠️ Background Location Without Foreground Disclosure
- [ ] **Issue**: Using background location but no foreground disclosure shown
- [ ] **Fix**: Show foreground disclosure before requesting background location
- [ ] **Status**: ✅ Not using background location

---

## 📝 SUBMISSION CHECKLIST

### Pre-Submission
- [ ] All compliance items above checked
- [ ] Target API 35 configured and tested
- [ ] Data Safety form completed accurately
- [ ] Data deletion questions answered
- [ ] Pre-Launch report clean (no crashes/ANRs)
- [ ] Permissions reviewed and minimal
- [ ] Screenshots taken and optimized
- [ ] App metadata written
- [ ] Privacy policy URL verified live
- [ ] Play Billing flows tested in sandbox
- [ ] Account deletion tested end-to-end

### Play Console Submission
- [ ] App created in Play Console
- [ ] Package name matches: `com.pawfectmatch.premium` ✅
- [ ] Content rating completed
- [ ] Data Safety form submitted
- [ ] Data deletion questions answered
- [ ] Store listing completed (description, screenshots, etc.)
- [ ] App icon and feature graphic uploaded
- [ ] Preview video uploaded (if applicable)
- [ ] Pricing and Distribution set
- [ ] Release track selected (start with Internal/Closed Testing)
- [ ] AAB uploaded via EAS or Gradle: `eas build --platform android --profile production`
- [ ] Release notes written
- [ ] Submit for review (or start with Internal Testing)

---

## ✅ ONE-LINE STATUS TRACKER

**Quick Status Check:**
- [ ] Android: Confirm target API 35, Data safety/deletion forms submitted, Pre-launch report clean
- [ ] Android: Account deletion fully in-app; payments compliant; reviewer notes drafted
- [ ] Android: All screenshots, metadata, and AAB build ready
- [ ] Android: Crash rate < 0.2%, ANR < 0.1%, cold start < 2.5s, Play Billing flows tested

---

## 📚 REFERENCES

- [Google Play Developer Policy](https://play.google.com/about/developer-content-policy/)
- [Target API Level Requirements](https://developer.android.com/google/play/requirements/target-sdk)
- [Data Safety](https://support.google.com/googleplay/android-developer/answer/10787469)
- [Data Deletion](https://support.google.com/googleplay/android-developer/answer/11150595)
- [Play Console Help](https://support.google.com/googleplay/android-developer)

---

**Last Verified**: [DATE]  
**Verified By**: [NAME]  
**Next Review**: Before submission


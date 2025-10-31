# ⚡ Store Submission Quick Reference
**App**: PawfectMatch Premium  
**For**: Mobile Lead  
**Goal**: Zero-drama approvals on first pass

---

## 🎯 Three Critical Status Checks

### iOS
**"iOS: Confirm ATT shown only when needed and App Privacy answers match SDKs."**

**Status**: ⚠️ Review needed
- ATT key present but description generic
- Need to audit tracking SDKs
- Action: Remove ATT key if no tracking, OR implement ATT if tracking exists

### Android
**"Android: Confirm target API 35, Data safety/deletion forms submitted, Pre-launch report clean."**

**Status**: ❌ Blocked
- Currently targeting API 34 (needs API 35)
- Data Safety form not completed
- Pre-launch report not run

### Both Platforms
**"Both: Account deletion fully in-app; payments compliant; reviewer notes drafted."**

**Status**: ✅ Mostly ready
- Account deletion implemented ✅
- Payments via IAP/Play Billing ✅
- Reviewer notes: Use templates in `REVIEWER_NOTES_TEMPLATES.md`

---

## 🚨 Top 5 Pre-Submission Actions

### 1. ⚠️ iOS: Fix ATT Implementation
- **Issue**: Generic `NSUserTrackingUsageDescription`, need to verify tracking SDKs
- **Action**: 
  1. Audit all SDKs for tracking behavior
  2. If tracking: Implement ATT dialog + update description
  3. If no tracking: Remove ATT key
- **File**: `apps/mobile/app.config.cjs:38`

### 2. ❌ Android: Update to API 35
- **Issue**: Currently targeting API 34, needs API 35
- **Action**: 
  1. Update `targetSdkVersion: 35` in `app.config.cjs`
  2. Update `compileSdkVersion: 35`
  3. Test on Android 15
  4. Rebuild AAB
- **File**: `apps/mobile/app.config.cjs:52`

### 3. ❌ Android: Complete Data Safety Form
- **Issue**: Data Safety form not completed
- **Action**: 
  1. Audit all SDKs for data collection
  2. Fill Data Safety form in Play Console
  3. Complete Data deletion questions
  4. Verify form matches code behavior
- **Location**: Play Console → Data Safety

### 4. ⚠️ Both: Take Screenshots
- **Issue**: Store screenshots missing
- **Action**: 
  - iOS: 6.5" iPhone, 6.7" iPhone, iPad
  - Android: Phone, Tablet (optional)
  - Scenarios: Onboarding, Matching, Chat, Premium, Settings

### 5. ⚠️ Both: Create Demo Accounts
- **Issue**: Reviewer test accounts needed
- **Action**: 
  1. Create: reviewer@pawfectmatch.com
  2. Set password: TestReview2025!
  3. Test all flows (purchase, deletion, etc.)
  4. Include credentials in Reviewer Notes

---

## 📋 Copy-Paste Reviewer Notes

### iOS App Store Connect
**Location**: App Store Connect → Your App → App Review Information → Notes

Use template from: `REVIEWER_NOTES_TEMPLATES.md` (iOS Template 1 or 2)

Key sections to include:
- Demo account credentials
- Payment flow steps
- Account deletion path
- Permission rationale

### Google Play Console
**Location**: Play Console → Store presence → Store settings → App content → Notes for reviewers

Use template from: `REVIEWER_NOTES_TEMPLATES.md` (Android Template 1 or 2)

Key sections to include:
- Test account credentials
- Payment flow steps
- Account deletion path
- Permission rationale
- Data Safety notes

---

## ✅ Final Pre-Submission Checklist

### iOS
- [ ] ATT fixed (implemented or removed)
- [ ] App Privacy questions answered
- [ ] TestFlight build uploaded
- [ ] Screenshots taken
- [ ] Reviewer notes pasted
- [ ] Demo account created

### Android
- [ ] Target API 35 updated
- [ ] Data Safety form completed
- [ ] Data deletion questions answered
- [ ] Pre-launch report clean
- [ ] AAB built with API 35
- [ ] Screenshots taken
- [ ] Reviewer notes pasted
- [ ] Demo account created

### Both
- [ ] Account deletion tested
- [ ] IAP flows tested (sandbox)
- [ ] Privacy policy URL verified
- [ ] App metadata written

---

## 📚 Full Documentation

- **iOS Checklist**: `docs/store-submission/IOS_APP_STORE_CHECKLIST.md`
- **Android Checklist**: `docs/store-submission/ANDROID_PLAY_STORE_CHECKLIST.md`
- **Reviewer Notes**: `docs/store-submission/REVIEWER_NOTES_TEMPLATES.md`
- **Common Traps**: `docs/store-submission/COMMON_REJECTION_TRAPS.md`
- **Status Tracker**: `docs/store-submission/STATUS_TRACKER.md`
- **Full README**: `docs/store-submission/README.md`

---

## 🚀 Quick Commands

```bash
# Check current iOS ATT key
grep -r "NSUserTrackingUsageDescription" apps/mobile/app.config.cjs

# Check current Android target API
grep -r "targetSdkVersion" apps/mobile/app.config.cjs

# Build iOS for TestFlight
cd apps/mobile && eas build --platform ios --profile production

# Build Android AAB (after updating to API 35)
cd apps/mobile && eas build --platform android --profile production
```

---

**Last Updated**: January 2025


# 📱 Store Submission Documentation
**App**: PawfectMatch Premium  
**Purpose**: Zero-drama approvals on first pass  
**Last Updated**: January 2025

---

## 📚 Documents Overview

This directory contains comprehensive store submission checklists and templates for both iOS App Store and Google Play Store.

### Documents

1. **[IOS_APP_STORE_CHECKLIST.md](./IOS_APP_STORE_CHECKLIST.md)**
   - Complete iOS App Store submission checklist
   - Compliance, permissions, store preparation
   - Quality assurance and testing
   - Common rejection traps

2. **[ANDROID_PLAY_STORE_CHECKLIST.md](./ANDROID_PLAY_STORE_CHECKLIST.md)**
   - Complete Android Play Store submission checklist
   - Target API requirements (API 35)
   - Data Safety form guidance
   - Pre-launch report requirements

3. **[REVIEWER_NOTES_TEMPLATES.md](./REVIEWER_NOTES_TEMPLATES.md)**
   - Copy-paste templates for App Store Connect
   - Copy-paste templates for Play Console
   - Complete and concise versions
   - Instructions for customization

4. **[COMMON_REJECTION_TRAPS.md](./COMMON_REJECTION_TRAPS.md)**
   - 8 most common rejection reasons
   - Fix steps for each issue
   - Prevention strategies
   - Pre-submission verification

5. **[STATUS_TRACKER.md](./STATUS_TRACKER.md)**
   - Quick one-line status checks
   - Priority actions before submission
   - Detailed status breakdown
   - Submission readiness indicators

---

## 🚀 Quick Start

### Before You Start

1. **Read the checklists**:
   - iOS: [IOS_APP_STORE_CHECKLIST.md](./IOS_APP_STORE_CHECKLIST.md)
   - Android: [ANDROID_PLAY_STORE_CHECKLIST.md](./ANDROID_PLAY_STORE_CHECKLIST.md)

2. **Review common traps**:
   - [COMMON_REJECTION_TRAPS.md](./COMMON_REJECTION_TRAPS.md)

3. **Check current status**:
   - [STATUS_TRACKER.md](./STATUS_TRACKER.md)

### Submission Workflow

#### Step 1: Preparation (Week 1)
- [ ] Audit all SDKs (tracking, analytics, etc.)
- [ ] Fix ATT implementation or remove (iOS)
- [ ] Update target API to 35 (Android)
- [ ] Complete Data Safety form (Android)
- [ ] Prepare store assets (screenshots, metadata)

#### Step 2: Testing (Week 2)
- [ ] Build production builds (iOS TestFlight, Android AAB)
- [ ] Test IAP flows (sandbox/test accounts)
- [ ] Test account deletion end-to-end
- [ ] Run Pre-launch report (Android)
- [ ] Fix all crashes/ANRs

#### Step 3: Documentation (Week 2)
- [ ] Draft reviewer notes using templates
- [ ] Create demo accounts for reviewers
- [ ] Verify privacy policy URL works
- [ ] Complete all store metadata

#### Step 4: Submission (Week 3)
- [ ] iOS: Submit to App Store Connect
- [ ] Android: Start with Internal Testing, then Closed/Open, then Production
- [ ] Monitor review status
- [ ] Respond to any feedback

---

## ✅ Critical Pre-Submission Checklist

### Both Platforms

- [ ] **Account Deletion**: In-app deletion available and functional
- [ ] **Payments**: All digital goods via IAP/Play Billing
- [ ] **Privacy Policy**: URL works, accessible, comprehensive
- [ ] **Demo Accounts**: Created and tested
- [ ] **Screenshots**: Taken for all required device sizes
- [ ] **App Metadata**: Description, keywords, support URLs

### iOS-Specific

- [ ] **ATT**: Either implemented correctly OR removed (no false positives)
- [ ] **App Privacy**: Questions answered accurately
- [ ] **TestFlight**: Build uploaded and tested
- [ ] **Reviewer Notes**: Drafted using template

### Android-Specific

- [ ] **Target API 35**: Updated and tested
- [ ] **Data Safety**: Form completed accurately
- [ ] **Data Deletion**: Questions answered
- [ ] **Pre-launch Report**: Run and clean (no crashes/ANRs)
- [ ] **Permissions**: Only requested permissions remain

---

## 🚨 Common Issues & Fixes

### Issue 1: ATT False Positive (iOS)
**Problem**: ATT key present but no tracking SDK  
**Fix**: Remove `NSUserTrackingUsageDescription` OR implement ATT if tracking exists  
**See**: [COMMON_REJECTION_TRAPS.md#1](./COMMON_REJECTION_TRAPS.md#1-att-false-positive-ios)

### Issue 2: Target API Too Low (Android)
**Problem**: App targeting API 34, needs API 35  
**Fix**: Update `targetSdkVersion: 35` in `app.config.cjs`  
**See**: [COMMON_REJECTION_TRAPS.md#4](./COMMON_REJECTION_TRAPS.md#4-target-api-too-low-android)

### Issue 3: Data Safety Mismatch (Android)
**Problem**: Data Safety form doesn't match SDK behavior  
**Fix**: Audit SDKs, update form accurately  
**See**: [COMMON_REJECTION_TRAPS.md#3](./COMMON_REJECTION_TRAPS.md#3-play-data-safety-claims-dont-match-sdk-behavior-android)

### Issue 4: Account Deletion Missing
**Problem**: Account creation but no in-app deletion  
**Fix**: Implement in-app deletion, document in Review Notes  
**See**: [COMMON_REJECTION_TRAPS.md#5](./COMMON_REJECTION_TRAPS.md#5-account-can-be-created-but-not-deleted-in-app-both)

---

## 📋 App Information

- **App Name**: PawfectMatch Premium
- **iOS Bundle ID**: `com.pawfectmatch.premium`
- **Android Package**: `com.pawfectmatch.premium`
- **Version**: 1.0.0
- **Privacy Policy**: https://pawfectmatch.com/privacy
- **Terms of Service**: https://pawfectmatch.com/terms
- **Support**: support@pawfectmatch.com

---

## 🔗 Resources

### Apple Resources
- [App Store Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- [App Store Connect Help](https://help.apple.com/app-store-connect/)
- [Privacy Nutrition Labels](https://developer.apple.com/app-store/app-privacy-details/)
- [ATT Documentation](https://developer.apple.com/documentation/apptrackingtransparency)

### Google Resources
- [Google Play Developer Policy](https://play.google.com/about/developer-content-policy/)
- [Target API Level Requirements](https://developer.android.com/google/play/requirements/target-sdk)
- [Data Safety](https://support.google.com/googleplay/android-developer/answer/10787469)
- [Data Deletion](https://support.google.com/googleplay/android-developer/answer/11150595)
- [Play Console Help](https://support.google.com/googleplay/android-developer)

---

## 📞 Support

For questions or issues with store submission:

1. Review the relevant checklist document
2. Check [COMMON_REJECTION_TRAPS.md](./COMMON_REJECTION_TRAPS.md)
3. Verify [STATUS_TRACKER.md](./STATUS_TRACKER.md)
4. Contact: support@pawfectmatch.com

---

**Last Updated**: January 2025  
**Maintained By**: Mobile Team


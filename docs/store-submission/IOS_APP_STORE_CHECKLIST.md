# 🍎 iOS App Store Submission Checklist
**App**: PawfectMatch Premium  
**Bundle ID**: `com.pawfectmatch.premium`  
**Target**: Zero-drama approval on first pass  
**Last Updated**: January 2025

---

## ✅ COMPLIANCE SECTION

### App Store Review Guidelines
- [ ] **Guideline 1.1 - Safety**: No violence, hate speech, or illegal content
- [ ] **Guideline 2.1 - Performance**: App is stable, doesn't crash, UI is responsive
- [ ] **Guideline 3.1 - Business**: Digital goods/services use In-App Purchase (IAP) - **VERIFIED: RevenueCat integration**
- [ ] **Guideline 3.1.1 - In-App Purchase**: All subscriptions managed via IAP
- [ ] **Guideline 3.1.3 - External Links**: If any external payment links exist (US/EU), document in Review Notes with exact screens
- [ ] **Guideline 4.0 - Design**: UI is polished, matches platform conventions
- [ ] **Guideline 5.0 - Legal**: Privacy policy accessible, terms of service linked

**Reviewer Notes Section (Add this to App Store Connect):**
```
DIGITAL GOODS & PAYMENTS:
- All subscriptions use Apple's In-App Purchase system via RevenueCat SDK
- Premium features are unlocked through monthly/yearly subscriptions only
- No external payment links or alternative payment flows are present
- Subscription management is available in-app via "Manage Subscription" button
- Restore Purchases functionality is available from the Premium screen

To test purchases:
1. Navigate to: Home → Premium (bottom tab) → Select subscription tier
2. Sandbox account: [INSERT_TEST_ACCOUNT_EMAIL]
3. Verify: Subscriptions activate premium features (unlimited swipes, advanced filters, etc.)

ACCOUNT DELETION:
- Available from: Profile → Settings → Privacy & Safety → Delete Account
- Requires password confirmation
- 30-day grace period before permanent deletion
- Confirmation email sent upon deletion request

To test deletion:
1. Navigate to: Profile (bottom tab) → Settings (gear icon) → Privacy & Safety → Delete Account
2. Enter password: [INSERT_TEST_PASSWORD]
3. Verify: Account marked for deletion, grace period timer visible

LOCATION PERMISSIONS:
- Location requested only "When In Use" (not "Always")
- Used exclusively for: Finding compatible pets within user's proximity
- Rationale: Core feature of pet matching app
- Location is not shared with third parties or used for advertising

CAMERA/PHOTOS PERMISSIONS:
- Camera: Pet photo uploads and AR discovery features
- Photo Library: Accessing existing pet photos for profile creation
- Photos are stored securely, only visible to user and matched users

MICROPHONE PERMISSION:
- Used only for: Video calls with matched pet owners
- Requested only when user initiates a video call (not at app launch)

BACKGROUND MODES:
- None required - app does not use VoIP, audio playback, location updates, or fetch in background

PRIVACY:
- Privacy Policy: https://pawfectmatch.com/privacy
- Terms of Service: https://pawfectmatch.com/terms
- Both links accessible from Settings screen and onboarding flow
```

---

### App Tracking Transparency (ATT)
- [ ] **ATT Key Present**: `NSUserTrackingUsageDescription` in `Info.plist` ✅ (from app.config.cjs:38)
- [ ] **ATT Implementation**: `requestTrackingPermissionAsync()` called only when tracking SDK is actually used
- [ ] **SDK Audit**: Verify which SDKs actually track:
  - [ ] RevenueCat - Does NOT require ATT (doesn't track across apps)
  - [ ] Analytics SDKs (if any) - May require ATT
  - [ ] Advertising SDKs (if any) - Require ATT
- [ ] **Usage Description Text**: Clear, non-generic, explains benefit
  - Current: "PawfectMatch uses tracking to provide personalized content and improve your experience" ⚠️ **Too generic - needs specific benefit**

**ACTION REQUIRED:**
- [ ] Update `NSUserTrackingUsageDescription` to be specific: "PawfectMatch uses tracking to show you pets that match your preferences and improve matching accuracy"
- [ ] Verify ATT dialog only appears if tracking SDKs are actually present and used
- [ ] If no tracking SDKs, remove `NSUserTrackingUsageDescription` (false positive triggers rejection)

**Reviewer Notes for ATT:**
```
APP TRACKING TRANSPARENCY:
- ATT is implemented only if analytics/tracking SDKs are present
- If ATT prompt appears, it means tracking SDK is active
- User can deny tracking; app continues to function normally
- Tracking is used for: Personalized pet recommendations, match quality improvement
```

---

### Account Deletion (Required for apps with account creation)
- [ ] **In-App Deletion**: Account deletion available from Settings screen ✅ (`DeactivateAccountScreen.tsx` exists)
- [ ] **Discoverability**: Delete Account button visible in Profile → Settings → Privacy & Safety
- [ ] **Backend Deletion**: Server endpoints `/api/account/delete` and `/api/account/cancel-deletion` implemented ✅
- [ ] **Data Removal**: Backend erases or schedules data removal within 30-day grace period ✅
- [ ] **Confirmation**: User must confirm deletion (password required) ✅
- [ ] **Review Notes**: Document exact path in App Review Information

**Test Account for Reviewers:**
```
Username/Email: [INSERT_REVIEWER_ACCOUNT]
Password: [INSERT_PASSWORD]
Steps to delete:
1. Profile → Settings (gear icon)
2. Privacy & Safety section
3. Tap "Delete Account"
4. Enter password
5. Confirm deletion
```

---

## 🔐 PERMISSIONS & ENTITLEMENTS

### Location Permission
- [ ] **Request Type**: "When In Use" only (not "Always")
- [ ] **Usage**: Finding compatible pets nearby
- [ ] **Rationale in Review Notes**: Core feature - matching pets by proximity
- [ ] **Fallback**: App works without location (shows all pets, sorted by compatibility score)

**Reviewer Notes:**
```
LOCATION PERMISSION:
- Requested: Only "When In Use" (NSLocationWhenInUseUsageDescription)
- Purpose: Find compatible pets within user's geographic area
- App functionality without location: App works normally, shows all pets sorted by compatibility
- Location is not shared with third parties
```

---

### Camera & Photo Library Permissions
- [ ] **Camera Usage**: Pet photo uploads, AR discovery features
- [ ] **Photo Library**: Accessing existing photos for profile creation
- [ ] **Usage Descriptions**: Present and clear ✅
- [ ] **Privacy**: Photos stored securely, only visible to user and matched users

---

### Microphone Permission
- [ ] **Usage**: Video calls with matched pet owners only
- [ ] **Request Timing**: Only when user initiates video call (not at launch)
- [ ] **Usage Description**: Present ✅

---

### Notifications Permission
- [ ] **Request Timing**: After value moment (e.g., after first match)
- [ ] **Push Entitlement**: Added to entitlements if using push notifications
- [ ] **Rationale**: Match notifications, new messages, subscription updates

---

### Background Modes (Review Carefully)
- [ ] **None Required**: App does NOT use:
  - [ ] VoIP (no background audio calls)
  - [ ] Audio playback (no background music)
  - [ ] Location updates (no background location)
  - [ ] Fetch (no background refresh)
- [ ] **If Any Background Modes Used**: Document exact scenario in Review Notes

**Reviewer Notes (if background modes exist):**
```
BACKGROUND MODES:
[If using any, explain exact use case]
Example: "App uses VoIP background mode for video calls to notify users when a call is incoming"
```

---

## 📦 STORE PREPARATION

### App Privacy Questions (App Store Connect)
- [ ] **Complete Privacy Questionnaire**: Answer all questions accurately
- [ ] **Data Types Match Code**:
  - [ ] Location - Collected ✅ (for matching)
  - [ ] Photos/Videos - Collected ✅ (profile photos)
  - [ ] Name - Collected ✅ (user profile)
  - [ ] Email - Collected ✅ (account creation)
  - [ ] User ID - Collected ✅ (authentication)
- [ ] **Data Linked to User**: All data is linked to user identity
- [ ] **Data Used for Tracking**: Only if tracking SDKs are present (update based on ATT decision)

**Checklist:**
```
Data Collected:
- Location (approximate) - Used for app functionality
- Photos/Videos - User-provided for pet profiles
- Name - User-provided during registration
- Email - Required for account creation
- User ID - Generated by app for authentication
- Purchases - Subscription status (required for IAP)

Data Shared with Third Parties:
- None (unless analytics SDK shares anonymized data)

Tracking:
- No tracking across apps (unless ATT is implemented and user consents)
```

---

### Export Compliance
- [ ] **Encryption Used**: Standard encryption (HTTPS, TLS) ✅
- [ ] **Answer**: "Yes, uses encryption" with "Standard exemptions" selected
- [ ] **Certificate**: Upload if required

---

### TestFlight & Demo Credentials
- [ ] **TestFlight Build Uploaded**: Latest production build in TestFlight
- [ ] **External Testing**: At least 5 external testers approved (if using)
- [ ] **Demo Account Credentials**: Provide in App Review Information:
  ```
  Email: reviewer@pawfectmatch.com
  Password: TestReview2025!
  
  OR use sandbox account:
  Email: [SANDBOX_EMAIL]
  Password: [SANDBOX_PASSWORD]
  ```
- [ ] **Steps to Gated Features**:
  1. Sign in with demo account
  2. Complete onboarding (skip photo upload if possible)
  3. Navigate to Premium tab → Purchase subscription (sandbox)
  4. Test swipe matching feature
  5. Test chat with matches

---

### App Icons & Screenshots
- [ ] **App Icon**: 1024x1024 PNG (no transparency)
- [ ] **Screenshots Required**:
  - [ ] 6.5" iPhone (1290x2796) - Minimum 2, Maximum 10
  - [ ] 6.7" iPhone (1284x2778) - Minimum 2, Maximum 10
  - [ ] iPad Pro 12.9" (2048x2732) - Optional but recommended
- [ ] **Preview Video**: Optional, 15-30 seconds (recommended)
- [ ] **Screenshot Scenarios**:
  1. Onboarding/Swipe screen (show key feature)
  2. Match/Profile screen (show match success)
  3. Chat screen (show communication feature)
  4. Premium screen (show subscription options)
  5. Settings/Privacy screen (show account controls)

---

### App Metadata
- [ ] **App Name**: "PawfectMatch Premium" (30 chars max) ✅
- [ ] **Subtitle**: Optional (30 chars max) - e.g., "Find Your Perfect Pet Match"
- [ ] **Description**: 4000 chars max, highlight key features
- [ ] **Keywords**: 100 chars max (comma-separated) - e.g., "pets,dogs,cats,matching,dating,adoption"
- [ ] **Promotional Text**: 170 chars max (can be updated without review)
- [ ] **Support URL**: `https://pawfectmatch.com/support`
- [ ] **Marketing URL**: Optional: `https://pawfectmatch.com`

---

### Age Rating
- [ ] **Age Rating Completed**: App suitable for ages 4+ (no violence, mature content, gambling)
- [ ] **Content Descriptors**: None needed (family-friendly app)

---

## 🧪 QUALITY ASSURANCE

### Pre-Submission Testing
- [ ] **No Broken Deep Links**: All app links work
- [ ] **Purchases Work**: 
  - [ ] Subscriptions create successfully (sandbox)
  - [ ] Restore purchases works
  - [ ] Subscription cancellation works (via Settings)
  - [ ] Subscription renewal works
- [ ] **UI Works**:
  - [ ] All locales tested (if localized)
  - [ ] Dynamic Type sizes tested (Accessibility)
  - [ ] Dark mode tested (if supported)
  - [ ] iPhone 14/15/Pro/Pro Max layouts tested
  - [ ] iPad layouts tested (if supports tablet)
- [ ] **Performance**:
  - [ ] Cold start time < 2.5s (p95)
  - [ ] No ANRs or freezes
  - [ ] Smooth scrolling (60fps)
- [ ] **Crash Rate**: < 0.2% (target: 99.8% crash-free sessions)

---

### IAP Testing Checklist
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
  1. Cancel via Settings → Subscriptions
  2. Verify app shows grace period
  3. Verify premium features remain until expiry
- [ ] **Price Change Consent**:
  1. If price changes, verify consent flow works
  2. Verify user can decline and cancel

---

## 🚨 COMMON REJECTION TRAPS (Fix Before Submit)

### ⚠️ ATT False Positive
- [ ] **Issue**: ATT key present but no tracking SDK, or vice versa
- [ ] **Fix**: Remove `NSUserTrackingUsageDescription` if no tracking SDKs, OR add ATT implementation if tracking exists
- [ ] **Status**: ⚠️ Review `NSUserTrackingUsageDescription` - current description is generic

### ⚠️ External Payment Links
- [ ] **Issue**: External payment link without Apple's 2025 allowances or missing explanation
- [ ] **Fix**: Remove external links OR add detailed explanation in Review Notes
- [ ] **Status**: ✅ Verified - All payments via IAP

### ⚠️ Account Deletion Missing
- [ ] **Issue**: App allows account creation but no in-app deletion
- [ ] **Fix**: Verify Delete Account button is visible and functional
- [ ] **Status**: ✅ Account deletion implemented, verify discoverability

### ⚠️ Privacy Policy Link Broken
- [ ] **Issue**: Privacy policy URL returns 404 or is inaccessible
- [ ] **Fix**: Test URL: `https://pawfectmatch.com/privacy`
- [ ] **Status**: ⚠️ Verify URL is live before submission

---

## 📝 SUBMISSION CHECKLIST

### Pre-Submission
- [ ] All compliance items above checked
- [ ] Reviewer Notes drafted and saved
- [ ] TestFlight build uploaded and tested
- [ ] Demo credentials prepared
- [ ] Screenshots taken and optimized
- [ ] App metadata written and reviewed
- [ ] Privacy policy URL verified live
- [ ] IAP flows tested in sandbox
- [ ] Account deletion tested end-to-end

### App Store Connect Submission
- [ ] App created in App Store Connect
- [ ] Bundle ID matches: `com.pawfectmatch.premium` ✅
- [ ] App Privacy questions completed
- [ ] Export compliance answered
- [ ] App Review Information filled:
  - [ ] Demo account credentials
  - [ ] Reviewer Notes (copy from section above)
  - [ ] Support contact information
  - [ ] Notes for reviewers (any special instructions)
- [ ] Pricing and Availability set
- [ ] Version information filled (1.0.0, build number)
- [ ] Screenshots uploaded
- [ ] Preview video uploaded (if applicable)
- [ ] App icon uploaded
- [ ] Build selected from TestFlight
- [ ] Submit for Review

---

## ✅ ONE-LINE STATUS TRACKER

**Quick Status Check:**
- [ ] iOS: Confirm ATT shown only when needed and App Privacy answers match SDKs
- [ ] iOS: Account deletion fully in-app; payments compliant; reviewer notes drafted
- [ ] iOS: All screenshots, metadata, and TestFlight build ready
- [ ] iOS: Crash rate < 0.2%, cold start < 2.5s, IAP flows tested

---

## 📚 REFERENCES

- [App Store Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- [App Store Connect Help](https://help.apple.com/app-store-connect/)
- [Privacy Nutrition Labels](https://developer.apple.com/app-store/app-privacy-details/)
- [ATT Documentation](https://developer.apple.com/documentation/apptrackingtransparency)

---

**Last Verified**: [DATE]  
**Verified By**: [NAME]  
**Next Review**: Before submission


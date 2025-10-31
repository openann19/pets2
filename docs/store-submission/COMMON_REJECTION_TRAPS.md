# 🚨 Common Store Submission Rejection Traps
**App**: PawfectMatch Premium  
**Purpose**: Pre-submission checklist to avoid common rejection reasons  
**Last Updated**: January 2025

---

## ⚠️ CRITICAL REJECTION TRAPS (Fix Before Submit)

### 1. ATT False Positive (iOS)

**Problem:**
- `NSUserTrackingUsageDescription` present in `Info.plist` but no tracking SDK, OR
- Tracking SDK present but no ATT implementation

**Rejection Reason:**
- "Your app uses tracking but doesn't request permission" OR
- "Your app requests tracking permission but doesn't use tracking"

**Current Status:**
```
⚠️ REVIEW REQUIRED
- NSUserTrackingUsageDescription present: ✅ (app.config.cjs:38)
- Description: "PawfectMatch uses tracking to provide personalized content and improve your experience"
- Issue: Description is generic, and tracking SDK presence needs verification
```

**Fix Steps:**
1. **Audit SDKs**: Check if any SDKs actually track across apps:
   - RevenueCat: Does NOT require ATT ✅
   - Analytics SDKs (Firebase, Amplitude, etc.): May require ATT
   - Advertising SDKs (AdMob, etc.): Require ATT
2. **Decision Tree**:
   ```
   IF tracking SDKs present:
     - Keep NSUserTrackingUsageDescription
     - Implement ATT dialog (requestTrackingPermissionAsync)
     - Update description to be specific: "PawfectMatch uses tracking to show you pets that match your preferences"
   ELSE (no tracking SDKs):
     - Remove NSUserTrackingUsageDescription
     - No ATT implementation needed
   ```
3. **Action Required**:
   - [ ] Audit all SDKs for tracking behavior
   - [ ] If tracking present: Implement ATT + update description
   - [ ] If no tracking: Remove NSUserTrackingUsageDescription

**Prevention:**
- Only include ATT key if tracking SDKs are actually present
- Test ATT dialog appears only when tracking is enabled
- Use specific, non-generic description text

---

### 2. External Payment Links Without Documentation (iOS)

**Problem:**
- App contains external payment links (US/EU) without using Apple's updated 2025 allowances
- Missing explanation in Review Notes

**Rejection Reason:**
- "Your app contains external payment links that violate Guideline 3.1.3"

**Current Status:**
```
✅ VERIFIED
- All payments via IAP (RevenueCat) ✅
- No external payment links detected
- Status: PASS (no action needed)
```

**If External Links Exist:**
1. **Document in Review Notes**:
   ```
   EXTERNAL PAYMENT LINKS (if applicable):
   - Link appears on: [EXACT_SCREEN_NAME]
   - Purpose: [REASON - e.g., "Legacy subscription management"]
   - User flow: [HOW USER ACCESSES]
   - Compliance: [HOW IT COMPLIES WITH APPLE'S 2025 RULES]
   ```
2. **Ensure Compliance**: 
   - Only for specific exemptions (reader apps, etc.)
   - Not for digital goods subscriptions
   - Proper disclosure to users

**Prevention:**
- Remove all external payment links for digital goods
- Use IAP exclusively for subscriptions
- Document any exemptions in Review Notes

---

### 3. Play Data Safety Claims Don't Match SDK Behavior (Android)

**Problem:**
- Data Safety form claims don't match actual SDK behavior
- Missing data types or incorrect sharing declarations

**Rejection Reason:**
- "Your app's Data Safety section doesn't accurately reflect your app's data collection"

**Current Status:**
```
⚠️ VERIFICATION REQUIRED
- Data Safety form needs completion
- SDK audit required to match declarations
```

**Fix Steps:**
1. **Audit All SDKs**:
   ```
   Check each SDK:
   - RevenueCat: Subscription data (doesn't share)
   - Analytics SDKs: May collect device ID, usage data
   - Crash reporting: May collect device info, crash logs
   - Push notifications: Device tokens
   - Location SDKs: Location data
   ```
2. **Match Data Safety Form**:
   - List every data type collected
   - Declare sharing accurately (shared vs not shared)
   - Specify purpose (app functionality, analytics, etc.)
   - Mark optional vs required
3. **Action Required**:
   - [ ] Complete SDK audit
   - [ ] Fill Data Safety form accurately
   - [ ] Verify no mismatches between form and code

**Prevention:**
- Audit SDKs before filling Data Safety form
- Update form whenever SDKs change
- Be conservative (if unsure, declare as collected)

---

### 4. Target API Too Low (Android)

**Problem:**
- New updates not targeting API 35 (Android 15)
- Existing apps not at least API 34 by Aug 31, 2025

**Rejection Reason:**
- "Your app doesn't meet the target API level requirement"

**Current Status:**
```
❌ ACTION REQUIRED
- Current targetSdkVersion: 34 (app.config.cjs:52)
- Required: 35 (for new submissions/updates)
- Deadline: Immediate (for new submissions)
```

**Fix Steps:**
1. **Update app.config.cjs**:
   ```javascript
   android: {
     targetSdkVersion: 35,
     compileSdkVersion: 35,
     // ... rest of config
   }
   ```
2. **Test on Android 15**:
   - Build with API 35
   - Test on Android 15 emulator/device
   - Verify no breaking changes
3. **Update build config**:
   - Verify `eas.json` doesn't override targetSdkVersion
   - Rebuild AAB with new target
4. **Action Required**:
   - [ ] Update targetSdkVersion to 35
   - [ ] Update compileSdkVersion to 35
   - [ ] Test on Android 15
   - [ ] Rebuild production AAB

**Prevention:**
- Always target latest API level for new submissions
- Monitor Android Developers blog for API requirements
- Test on latest Android version before submission

---

### 5. Account Can Be Created But Not Deleted In-App (Both)

**Problem:**
- App allows account creation
- Account deletion only via email or external process
- No in-app deletion available

**Rejection Reason:**
- "Your app allows account creation but doesn't provide in-app account deletion"

**Current Status:**
```
✅ VERIFIED
- Account deletion implemented: ✅ (DeactivateAccountScreen.tsx)
- In-app deletion: ✅
- Backend deletion: ✅
- Grace period: ✅ (30 days)
```

**Verify Before Submit:**
- [ ] Delete Account button visible in Settings
- [ ] Deletion flow works end-to-end
- [ ] Backend actually deletes data
- [ ] Grace period allows cancellation
- [ ] Confirmation email sent

**If Missing:**
1. **Implement In-App Deletion**:
   - Add Delete Account button to Settings
   - Require password confirmation
   - Implement backend deletion endpoint
   - Show grace period and confirmation
2. **Document in Review Notes**:
   ```
   ACCOUNT DELETION:
   - Location: Profile → Settings → Privacy & Safety → Delete Account
   - Requires password confirmation
   - 30-day grace period
   - Backend deletes all user data
   ```

**Prevention:**
- Implement account deletion before first submission
- Test deletion flow thoroughly
- Document exact navigation path in Review Notes

---

### 6. Privacy Policy Link Broken or Inaccessible

**Problem:**
- Privacy policy URL returns 404
- Privacy policy not accessible without authentication
- Privacy policy missing required information

**Rejection Reason:**
- "Your app's privacy policy is not accessible or missing"

**Current Status:**
```
⚠️ VERIFICATION REQUIRED
- Privacy Policy URL: https://pawfectmatch.com/privacy
- Status: Needs verification before submission
```

**Fix Steps:**
1. **Verify URL Works**:
   - Test URL in browser (anonymous/incognito)
   - Ensure no authentication required
   - Check mobile accessibility
2. **Verify Content**:
   - Privacy policy must explain data collection
   - Must explain data sharing (if any)
   - Must explain data deletion process
   - Must be readable and accessible
3. **Update App**:
   - Ensure privacy policy link present in:
     - Settings screen
     - Onboarding flow
     - Account deletion screen
4. **Action Required**:
   - [ ] Verify URL is live: https://pawfectmatch.com/privacy
   - [ ] Test accessibility (no auth required)
   - [ ] Verify links present in app
   - [ ] Update if URL changes

**Prevention:**
- Test privacy policy URL before every submission
- Keep URL updated in app config
- Ensure privacy policy is comprehensive

---

### 7. Missing Required Permissions Justifications

**Problem:**
- Permissions declared in manifest/Info.plist but no usage descriptions or rationale
- Generic or missing permission descriptions

**Rejection Reason:**
- "Your app requests permissions without clear justification"

**Current Status:**
```
⚠️ REVIEW REQUIRED
- iOS usage descriptions: ✅ Present (app.config.cjs:24-39)
- Android permission rationale: ⚠️ Needs review
- Generic descriptions: ⚠️ NSUserTrackingUsageDescription is generic
```

**Fix Steps:**
1. **iOS Usage Descriptions**:
   - Ensure all permissions have specific descriptions
   - Update generic descriptions (e.g., NSUserTrackingUsageDescription)
   - Explain exactly how permission is used
2. **Android Permissions**:
   - Declare only permissions actually used
   - Remove unused permissions
   - Document in Review Notes if needed
3. **Action Required**:
   - [ ] Update NSUserTrackingUsageDescription to be specific
   - [ ] Remove unused permissions from Android manifest
   - [ ] Document permission rationale in Review Notes

**Prevention:**
- Use specific, non-generic permission descriptions
- Remove unused permissions regularly
- Document permission usage in Review Notes

---

### 8. Subscription Terms Not Disclosed

**Problem:**
- Subscription pricing, duration, renewal terms not clearly displayed
- Missing cancellation instructions

**Rejection Reason:**
- "Your app doesn't clearly disclose subscription terms"

**Current Status:**
```
⚠️ VERIFICATION REQUIRED
- Subscription terms display: Needs verification
- Cancellation instructions: Needs verification
```

**Fix Steps:**
1. **Display Terms**:
   - Show price clearly on Premium screen
   - Show billing period (monthly/yearly)
   - Show renewal terms
   - Show cancellation instructions
2. **Add Terms Link**:
   - Link to Terms of Service
   - Link to subscription terms
3. **Action Required**:
   - [ ] Verify subscription terms displayed on Premium screen
   - [ ] Add cancellation instructions
   - [ ] Link to Terms of Service

**Prevention:**
- Always display subscription terms clearly
- Include cancellation instructions
- Link to Terms of Service

---

## 📋 PRE-SUBMISSION CHECKLIST

Before submitting, verify:

- [ ] **ATT**: Either implemented correctly OR removed (no false positives)
- [ ] **Payments**: All digital goods via IAP/Play Billing, no external links (or documented)
- [ ] **Data Safety**: Form matches actual SDK behavior exactly
- [ ] **Target API**: Android targeting API 35, iOS compatible with latest guidelines
- [ ] **Account Deletion**: In-app deletion available and functional
- [ ] **Privacy Policy**: URL works, accessible, comprehensive
- [ ] **Permissions**: Only requested permissions remain, descriptions specific
- [ ] **Subscription Terms**: Clearly displayed with cancellation instructions

---

## 🔍 QUICK VERIFICATION COMMANDS

**iOS:**
```bash
# Check ATT key present
grep -r "NSUserTrackingUsageDescription" apps/mobile/app.config.cjs

# Check IAP implementation
grep -r "Purchases\|IAP\|InAppPurchase" apps/mobile/src

# Check account deletion
grep -r "DeleteAccount\|deleteAccount\|DeactivateAccount" apps/mobile/src
```

**Android:**
```bash
# Check target API
grep -r "targetSdkVersion" apps/mobile/app.config.cjs

# Check permissions
grep -r "permissions" apps/mobile/app.config.cjs

# Check account deletion
grep -r "DeleteAccount\|deleteAccount\|DeactivateAccount" apps/mobile/src
```

---

**Last Updated**: January 2025  
**Next Review**: Before each submission


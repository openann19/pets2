# 📋 Store Submission Reviewer Notes Templates
**App**: PawfectMatch Premium  
**Purpose**: Copy-paste templates for App Store Connect and Play Console

---

## 🍎 iOS APP STORE CONNECT - REVIEWER NOTES

**Location**: App Store Connect → Your App → App Information → App Review Information → Notes

---

### Template 1: Complete Reviewer Notes (Comprehensive)

```
=== APP OVERVIEW ===
PawfectMatch Premium is a pet matching app that helps users find compatible pets for adoption or matching with other pet owners. The app uses AI-powered compatibility analysis and location-based matching to connect users with ideal pet matches.

=== KEY FEATURES FOR TESTING ===

1. SIGN-UP & ONBOARDING:
   - Tap "Sign Up" → Create account with email/password
   - Complete pet profile (skip photo upload if needed)
   - Grant permissions when prompted (location, camera, photos are optional)

2. PREMIUM SUBSCRIPTION (TEST PURCHASE):
   - Navigate to: Home → Premium (bottom tab) → Select "Monthly" or "Yearly"
   - Complete purchase using sandbox account
   - Verify premium features unlock (unlimited swipes, advanced filters)

3. MATCHING FEATURE:
   - Swipe right on pet profiles to like
   - Swipe left to pass
   - When matched, tap "Start Chat" to begin messaging

4. ACCOUNT DELETION:
   - Navigate to: Profile (bottom tab) → Settings (gear icon) → Privacy & Safety → Delete Account
   - Enter password: [INSERT_PASSWORD]
   - Confirm deletion
   - Verify: Account marked for deletion, 30-day grace period timer visible

=== DEMO ACCOUNT CREDENTIALS ===
Email: reviewer@pawfectmatch.com
Password: TestReview2025!

OR use sandbox account:
Email: [SANDBOX_EMAIL]
Password: [SANDBOX_PASSWORD]

=== PAYMENTS & SUBSCRIPTIONS ===
- All subscriptions use Apple's In-App Purchase system via RevenueCat SDK
- Premium features unlocked through monthly/yearly subscriptions only
- No external payment links or alternative payment flows
- Subscription management: Profile → Settings → Manage Subscription (opens system settings)
- Restore Purchases: Available from Premium screen

To test purchase flow:
1. Navigate to: Home → Premium (bottom tab)
2. Tap "Monthly" or "Yearly" subscription
3. Authenticate with Face ID/Touch ID or sandbox credentials
4. Verify premium features unlock immediately

To test restore purchases:
1. Sign in on new device with same Apple ID
2. Navigate to: Premium screen
3. Tap "Restore Purchases" button
4. Verify premium features restore

=== ACCOUNT DELETION (REQUIRED FOR APPS WITH ACCOUNTS) ===
- Account deletion available in-app (not email-only)
- Location: Profile → Settings → Privacy & Safety → Delete Account
- Requires password confirmation
- 30-day grace period before permanent deletion
- User can cancel deletion during grace period
- Backend schedules data removal within grace period
- Confirmation email sent upon deletion request

To test deletion:
1. Navigate to: Profile (bottom tab) → Settings (gear icon)
2. Scroll to "Privacy & Safety" section
3. Tap "Delete Account"
4. Enter password: [INSERT_PASSWORD]
5. Tap "Confirm Deletion"
6. Verify: Success message, grace period timer visible

=== PERMISSIONS & USAGE ===

LOCATION:
- Requested only "When In Use" (not "Always")
- Used exclusively for: Finding compatible pets within user's proximity
- Rationale: Core feature - matching pets by geographic proximity
- App works without location: Shows all pets sorted by compatibility score
- Location is NOT shared with third parties or used for advertising

CAMERA:
- Used for: Pet photo uploads and AR discovery features
- Requested when user taps "Add Photo" or "Take Photo" buttons
- Photos stored securely, only visible to user and matched users

PHOTO LIBRARY:
- Used for: Accessing existing pet photos for profile creation
- Requested when user taps "Choose from Library" button
- Photos stored securely, only visible to user and matched users

MICROPHONE:
- Used for: Video calls with matched pet owners
- Requested only when user initiates a video call (not at app launch)
- Not used for any other purpose

NOTIFICATIONS:
- Requested after value moment (e.g., after first match)
- Used for: Match notifications, new messages, subscription updates
- User can disable in Settings → Notifications

APP TRACKING TRANSPARENCY (ATT):
- ATT is implemented only if analytics/tracking SDKs are present
- If ATT prompt appears, it means tracking SDK is active
- User can deny tracking; app continues to function normally
- Tracking used for: Personalized pet recommendations, match quality improvement
- If no tracking SDKs: ATT dialog will not appear (no false positives)

=== BACKGROUND MODES ===
- App does NOT use any background modes
- No VoIP, audio playback, location updates, or fetch in background
- All features operate in foreground only

=== PRIVACY & DATA ===
- Privacy Policy: https://pawfectmatch.com/privacy
- Terms of Service: https://pawfectmatch.com/terms
- Both links accessible from:
  - Settings screen (Profile → Settings → About)
  - Onboarding flow (Privacy screen)
  - Account deletion screen

=== SPECIAL INSTRUCTIONS ===
- If testing on iPad: App supports tablet layouts; test swipe gestures and multi-pane layouts
- Dark mode: App supports dark mode; toggle in Settings → Appearance
- Dynamic Type: App supports accessibility text sizes; test in Settings → Accessibility
- Localization: App supports English (US) primarily; other locales may be incomplete

=== KNOWN LIMITATIONS ===
- TestFlight build may have some features disabled for testing
- Some premium features require active subscription
- Location-based matching requires location permission (optional feature)
```

---

### Template 2: Concise Reviewer Notes (Short Version)

```
=== DEMO ACCOUNT ===
Email: reviewer@pawfectmatch.com
Password: TestReview2025!

=== KEY FEATURES ===
1. Sign up → Complete pet profile
2. Premium: Home → Premium tab → Purchase subscription (sandbox)
3. Matching: Swipe on pets → Match → Start chat
4. Account Deletion: Profile → Settings → Privacy & Safety → Delete Account

=== PAYMENTS ===
- All subscriptions via IAP (RevenueCat)
- Restore Purchases: Premium screen
- Manage Subscription: Settings → Manage Subscription

=== PERMISSIONS ===
- Location: "When In Use" only, for finding nearby pets
- Camera/Photos: For pet profile photos
- Microphone: For video calls (requested only when needed)
- All permissions optional; app works without them

=== PRIVACY ===
- Privacy Policy: https://pawfectmatch.com/privacy
- Account Deletion: In-app (Profile → Settings → Privacy & Safety)
- 30-day grace period for account deletion
```

---

## 🤖 GOOGLE PLAY CONSOLE - REVIEWER NOTES

**Location**: Play Console → Your App → Store presence → Store settings → App content → Notes for reviewers

---

### Template 1: Complete Reviewer Notes (Comprehensive)

```
=== APP OVERVIEW ===
PawfectMatch Premium is a pet matching app that helps users find compatible pets for adoption or matching with other pet owners. The app uses AI-powered compatibility analysis and location-based matching to connect users with ideal pet matches.

=== KEY FEATURES FOR TESTING ===

1. SIGN-UP & ONBOARDING:
   - Tap "Sign Up" → Create account with email/password
   - Complete pet profile (skip photo upload if needed)
   - Grant permissions when prompted (location, camera, photos are optional)

2. PREMIUM SUBSCRIPTION (TEST PURCHASE):
   - Navigate to: Home → Premium (bottom tab) → Select "Monthly" or "Yearly"
   - Complete purchase using test account
   - Verify premium features unlock (unlimited swipes, advanced filters)

3. MATCHING FEATURE:
   - Swipe right on pet profiles to like
   - Swipe left to pass
   - When matched, tap "Start Chat" to begin messaging

4. ACCOUNT DELETION:
   - Navigate to: Profile (bottom tab) → Settings (gear icon) → Privacy & Safety → Delete Account
   - Enter password: [INSERT_PASSWORD]
   - Confirm deletion
   - Verify: Account marked for deletion, 30-day grace period timer visible

=== TEST ACCOUNT CREDENTIALS ===
Email: reviewer@pawfectmatch.com
Password: TestReview2025!

=== PAYMENTS & SUBSCRIPTIONS ===
- All subscriptions use Google Play Billing via RevenueCat SDK
- Premium features unlocked through monthly/yearly subscriptions only
- No external payment links or alternative payment flows
- Subscription management: Profile → Settings → Manage Subscription (opens Play Store)
- Restore Purchases: Available from Premium screen

To test purchase flow:
1. Navigate to: Home → Premium (bottom tab)
2. Tap "Monthly" or "Yearly" subscription
3. Complete purchase using test account
4. Verify premium features unlock immediately

To test restore purchases:
1. Sign in on new device with same Google account
2. Navigate to: Premium screen
3. Tap "Restore Purchases" button
4. Verify premium features restore

=== ACCOUNT DELETION (REQUIRED FOR APPS WITH ACCOUNTS) ===
- Account deletion available in-app (not email-only)
- Location: Profile → Settings → Privacy & Safety → Delete Account
- Requires password confirmation
- 30-day grace period before permanent deletion
- User can cancel deletion during grace period
- Backend schedules data removal within grace period
- Confirmation email sent upon deletion request

To test deletion:
1. Navigate to: Profile (bottom tab) → Settings (gear icon)
2. Scroll to "Privacy & Safety" section
3. Tap "Delete Account"
4. Enter password: [INSERT_PASSWORD]
5. Tap "Confirm Deletion"
6. Verify: Success message, grace period timer visible

=== PERMISSIONS & USAGE ===

LOCATION:
- Requested only "When In Use" (ACCESS_FINE_LOCATION, ACCESS_COARSE_LOCATION)
- Used exclusively for: Finding compatible pets within user's proximity
- Rationale: Core feature - matching pets by geographic proximity
- App works without location: Shows all pets sorted by compatibility score
- Location is NOT shared with third parties or used for advertising
- Foreground disclosure: Shown when location accessed in foreground

CAMERA:
- Used for: Pet photo uploads and AR discovery features
- Requested when user taps "Add Photo" or "Take Photo" buttons
- Photos stored securely, only visible to user and matched users

PHOTOS (Android 13+):
- Used for: Accessing existing pet photos for profile creation
- Permissions: READ_MEDIA_IMAGES, READ_MEDIA_VIDEO (Android 13+)
- Requested when user taps "Choose from Library" button
- Photos stored securely, only visible to user and matched users

MICROPHONE:
- Used for: Video calls with matched pet owners
- Requested only when user initiates a video call (not at app launch)
- Not used for any other purpose

NOTIFICATIONS:
- Requested after value moment (e.g., after first match)
- Used for: Match notifications, new messages, subscription updates
- User can disable in Settings → Notifications
- POST_NOTIFICATIONS permission required (Android 13+)

STORAGE:
- App uses scoped storage (Android 10+)
- No MANAGE_EXTERNAL_STORAGE permission (not file manager/backup app)
- Media access via READ_MEDIA_IMAGES/READ_MEDIA_VIDEO (Android 13+)

=== FOREGROUND SERVICES ===
- App does NOT use foreground services
- All features operate in foreground only
- No background location, media playback, or other background tasks

=== BACKGROUND RESTRICTIONS ===
- App complies with Android 12+ background restrictions
- No background execution required
- All features work within foreground activity lifecycle

=== DATA SAFETY ===
- All data types declared accurately in Data Safety form
- Location (approximate): Collected for app functionality
- Photos/Videos: User-provided for pet profiles
- Personal Info: Name, email for account creation
- User ID: Generated by app for authentication
- Purchase History: Subscription status for premium features

- Data NOT shared with third parties
- Data encrypted in transit (HTTPS/TLS) and at rest (encrypted database)
- Users can request deletion: In-app account deletion available
- Data deleted when user uninstalls: No (account persists, but user can delete account)

=== PRIVACY ===
- Privacy Policy: https://pawfectmatch.com/privacy
- Terms of Service: https://pawfectmatch.com/terms
- Both links accessible from:
  - Settings screen (Profile → Settings → About)
  - Onboarding flow (Privacy screen)
  - Account deletion screen

=== SPECIAL INSTRUCTIONS ===
- Multi-window: App supports split-screen mode
- Large screens: App supports tablet layouts
- Dark mode: App supports dark theme; toggle in Settings → Appearance
- Accessibility: App supports system font scaling and accessibility features

=== KNOWN LIMITATIONS ===
- Test build may have some features disabled for testing
- Some premium features require active subscription
- Location-based matching requires location permission (optional feature)
```

---

### Template 2: Concise Reviewer Notes (Short Version)

```
=== TEST ACCOUNT ===
Email: reviewer@pawfectmatch.com
Password: TestReview2025!

=== KEY FEATURES ===
1. Sign up → Complete pet profile
2. Premium: Home → Premium tab → Purchase subscription (test)
3. Matching: Swipe on pets → Match → Start chat
4. Account Deletion: Profile → Settings → Privacy & Safety → Delete Account

=== PAYMENTS ===
- All subscriptions via Play Billing (RevenueCat)
- Restore Purchases: Premium screen
- Manage Subscription: Settings → Manage Subscription (opens Play Store)

=== PERMISSIONS ===
- Location: "When In Use" only, for finding nearby pets
- Camera/Photos: For pet profile photos
- Microphone: For video calls (requested only when needed)
- All permissions optional; app works without them

=== PRIVACY ===
- Privacy Policy: https://pawfectmatch.com/privacy
- Account Deletion: In-app (Profile → Settings → Privacy & Safety)
- 30-day grace period for account deletion
```

---

## 📝 INSTRUCTIONS FOR USE

1. **Copy the appropriate template** (Complete or Concise) based on your needs
2. **Fill in placeholders**:
   - `[INSERT_PASSWORD]` → Actual demo account password
   - `[SANDBOX_EMAIL]` → Sandbox test account email (iOS)
   - `[INSERT_TEST_ACCOUNT_EMAIL]` → Test account email (Android)
3. **Customize sections** as needed for your specific app features
4. **Paste into App Store Connect or Play Console** reviewer notes field
5. **Save before submission**

---

## ⚠️ CRITICAL NOTES

- **Never leave placeholders** (`[INSERT_...]`) in submitted notes
- **Always test demo accounts** before providing credentials
- **Update notes** if app behavior changes between submissions
- **Keep notes concise** but complete - reviewers appreciate clarity
- **Include exact navigation paths** - helps reviewers test efficiently

---

**Last Updated**: January 2025


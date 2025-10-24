# Mobile-Layer Deep-Dive (React-Native / Expo)

Directory: apps/mobile

## 1 · Current Snapshot

| Area              | Status                         |
| ----------------- | ------------------------------ |
| Unit tests (jest) | ~12% components / hooks        |
| E2E tests (Detox) | 2 basic flows only             |
| TypeScript strict | Off ("strict": false)          |
| State             | Zustand + React-Query          |
| Design system     | Follows web tokens partially   |
| Bundles           | Release APK ≈ 42 MB            |
| Native modules    | Push, ImagePicker, SecureStore |
| Crash reporting   | Sentry initialised             |
| Performance       | JSC, Hermes disabled           |

## 2 · Critical Gaps (must fix pre-launch)

| ID        | Gap                                            | Risk                                                | Fix Pointer                                                |
| --------- | ---------------------------------------------- | --------------------------------------------------- | ---------------------------------------------------------- |
| M-SEC-01  | JWT stored in AsyncStorage                     | XSS not an issue native, but token theft via backup | Use expo-secure-store                                      |
| M-PERF-01 | Hermes disabled                                | 20-30% slower startup                               | Enable Hermes in expo.prebuild                             |
| M-UX-01   | Swipe gesture jank on low-end Android (50 fps) | Poor perception                                     | Use react-native-gesture-handler + react-native-reanimated |
| M-PWA-02  | No deep-link handling                          | Share links open browser                            | Add Linking listener & Expo config URLs                    |
| M-A11Y-01 | No TalkBack labels on action buttons           | Accessibility fail                                  | Add accessibilityLabel props                               |
| M-E2E-01  | Detox tests don't cover onboarding or purchase | Release blockers undetected                         | Write 4 more flows                                         |
| M-TEST-01 | hooks useAuth, useSwipe untested               | Silent crashes                                      | Add Jest RTL hook tests                                    |
| M-CI-01   | No device farm build in CI                     | Ship breaking build                                 | Add EAS "preview" channel build per PR                     |

## 3 · Full Gap Back-Log (100 Items)

### 3.1 Testing (T-01 → T-20)

- T-01 Add Jest snapshot tests for 15 key screens
- T-02 Unit-test useAuth happy / expiry / error paths
- T-03 Unit-test usePushNotifications permission flow
- T-04 RTL test for SwipeCardMobile gestures (use fireEvent)
- T-05 RTL test for offline banner visibility
- T-06 Mock SecureStore in tests (clear between cases)
- T-07 Integration test: login → create pet flow
- T-08 Integration test: AI bio generation screen
- T-09 Jest A11y test with @testing-library/react-native axe
- T-10 Detox E2E: onboarding wizard
- T-11 Detox: premium checkout (Stripe test mode)
- T-12 Detox: push notification opens chat
- T-13 Detox: offline swipe queued & syncs when online
- T-14 Visual regression with jest-native-image-snapshot on Storybook + Pictura
- T-15 Performance test: cold start < 3 s on Moto G
- T-16 Memory leak test using why-did-render-native in dev
- T-17 Crash reproducer test (invalid JWT)
- T-18 Unit tests for Redux fallback store (if offline)
- T-19 Test accessibility focus order in modal
- T-20 Jest watch mode config for faster cycles

### 3.2 Performance (P-01 → P-15)

- P-01 Enable Hermes & Proguard minification
- P-02 Compress PNG assets via expo-asset-tools
- P-03 Lazy-load heavy screens with React.lazy() + Suspense boundary
  (expo-router)
- P-04 Prefetch images for next 3 pets after swipe
- P-05 Use react-native-fast-image for caching on Android
- P-06 Debounce location updates (geolocation) to 30 s
- P-07 Batch WebSocket heartbeats to reduce battery drain
- P-08 Measure JS FPS with react-native-performance overlay
- P-09 Enable Flipper perf plugin in dev only
- P-10 Avoid re-renders by memoising SwipeActionRow
- P-11 Use Reanimated worklets for swipe animations
- P-13 Split icon font to subset (Heroicons outline only)
- P-14 Enable Android App Bundle (AAB) build – smaller download
- P-15 Use MMKV instead of AsyncStorage for large caches

### 3.3 Accessibility (A-01 → A-10)

- A-01 Missing item (add accessibilityRole on buttons)
- A-02 accessibilityHint on pass/like/superlike buttons
- A-03 Enable large-font scaling tests (react-native-device-info)
- A-04 Dark-mode contrast check on OLED
- A-05 Ensure TalkBack reads "3 years old, Golden Retriever" in correct order
- A-06 Reduce motion setting; disable card flip 3-D
- A-07 Voice control test: dictation in chat input
- A-08 Add haptic feedback classification (success, warning)
- A-09 Caption support for story videos (WebVTT)
- A-10 Add focus outline for TVOS (if future)

### 3.4 User-Experience Polish (U-01 → U-30)

- U-01 Animated splash screen with pet paw fade-in
- U-02 Lottie pull-to-refresh (paw scratch)
- U-03 Bounce micro-interaction on like button
- U-04 Confetti on first match (ts-particles overlay)
- U-05 Haptic feedback fine-tuned:heavy → superlike, light → like
- U-06 In-app tutorial overlay highlighting swipe gestures
- U-07 Onboarding wizard (3 screens) Banner image + CTA
- U-08 Dynamic gradient background based on pet photo dominant color
- U-09 Offline queue toast "4 swipes synced" when reconnecting
- U-10 Tinder-style rewind button (premium)
- U-11 Bottom tab bar glass-morphism & elevation animation
- U-12 Profile completeness progress bar
- U-13 Animated avatar ring when pet story available
- U-14 Chat bubble wave animation on receive
- U-15 Emoji reaction picker in chat (long-press)
- U-16 Pet video auto-mute with tap-to-unmute icon
- U-17 Story viewer 3-finger tap to pause
- U-18 Scroll to load older messages with spinner
- U-19 Deeplink pawmatch://pet/123 opens profile
- U-20 Quick-reply suggestions from AI (DeepSeek)
- U-21 Shimmer placeholder for chat avatars
- U-22 Custom empty state illustrations (SVG)
- U-23 Add "Hold to superlike" long-press gesture
- U-24 Edge-to-edge map on pet location screen
- U-25 Animatable header reacts to scroll (opacity)
- U-26 Quick share sheet (Expo sharing)
- U-28 In-app feedback modal (rating & text)
- U-29 Clipboard copy of share link with toast
- U-30 Seasonal themes (snowflakes in December)

### 3.5 Premium Features (PR-01 → PR-10)

- PR-01 Monthly boost button buys one-day top listing
- PR-02 Blur who-liked-me avatars until upgrade
- PR-03 Premium success screen with confetti & Lottie
- PR-04 Cancel subscription in-app via Stripe portal
- PR-05 Premium feature flag wrapper (PremiumOnly component)
- PR-06 Local receipt validation (iOS)
- PR-08 Premium-only filter: intent = "breeding"
- PR-09 Unlimited undo rewinds premium toggle
- PR-10 Trial expiry countdown banner

### 3.6 Analytics & Dev-Ops (D-01 → D-20)

- D-01 Integrate Sentry performance tracing
- D-02 Log Rocket React-Native for visual replay
- D-03 Send custom PostHog events (swipe-duration)
- D-04 EnableOver-the-Air (OTA) updates channel "prod"
- D-05 Add GitHub Actions to run expo docta + ESLint
- D-06 EAS Build on every main push – internal testing
- D-07 Dependabot for npm+gradle packages
- D-08 Detox on Bitrise device cloud
- D-09 Codepush fallback icon indicator
- D-10 Automated Play-Store upload via EAS submit
- D-11 Error boundary fallback screen logs to Sentry
- D-12 Storybook React-Native for isolated component dev
- D-13 Husky pre-commit lint & tests
- D-14 Fastlane screenshots generator (8 devices)
- D-15 .env validation with react-native-dotenv-vault
- D-16 GraphQL codegen (if API moves)
- D-18 Facebook App Events for marketing campaigns
- D-19 In-app update prompt (Android expo-updates)
- D-20 Expo config plugin for Google Auth (Android/iOS)

### 3.7 Nice-to-Have Experiments (E-01 → E-10)

- E-01 AR mode: show pet size overlay in camera
- E-02 Voice chat notes → convert to text bio (DeepSeek)
- E-03 Wear-OS quick swipe companion app
- E-04 WatchOS push notification action buttons
- E-05 Siri / Google Assistant "Find Buddy playdate" shortcut
- E-06 Pet mood detection via MLKit on photos
- E-07 LLM local summariser for chat history
- E-08 NFT pet badge (opt-in)
- E-09 Geofencing notify when match nearby
- E-10 CarPlay "Pet Radio" (fun project)

## 4 · Minimal 48-Hour Launch Plan

**Critical fixes** → M-SEC-01, M-PERF-01, M-A11Y-01  
**Polish** → U-01 splash, U-02 pull-to-refresh, U-05 haptics  
**Testing** → T-01 snapshots, T-11 premium checkout detox  
**CI** → D-04 OTA channel + D-05 GitHub build on PR  
**Performance** → P-03 lazyheavy screens, P-05 FastImage

Do these five buckets → smooth MVP mobile launch.

Provide this backlog to your mobile squad; they can raise tickets with IDs (e.g.
M-PERF-01). Prioritise high-risk security/perf first, then UX wow items.

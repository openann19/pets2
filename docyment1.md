# Implementation Gaps, Stubs, Mocks, Simulations (Actionable Backlog)

Legend: P0 = Critical, P1 = High, P2 = Medium.
This is a concise backlog of concrete work items with what to add and how. File paths reference exact locations in this repo.

---

## P0: Security, Reliability, Core Flows

- **[WebAuthn verification]** ✅ **COMPLETE**
  - Implemented full FIDO2/WebAuthn flows using `@simplewebauthn/server`
  - Registration: `POST /api/auth/biometric/register/options` → `POST /api/auth/biometric/register/verify`
  - Authentication: `POST /api/auth/biometric/authenticate/options` → `POST /api/auth/biometric/authenticate/verify`
  - Features: Challenge generation/verification, counter-based replay protection, RP ID/origin validation, JWT issuance
  - Files updated: `server/src/controllers/biometricController.js`, `server/src/routes/biometric.js`, `server/src/models/BiometricCredential.js`, `server/src/models/User.js`, `server/.env.example`

- **[WebRTC production readiness]**
  - Files:
    - `apps/mobile/src/components/calling/CallManager.tsx` (53–56, 71–74) – wire event listeners with `WebRTCService.on/off('callStateChanged'|'callError')`.
    - `apps/mobile/src/services/WebRTCService.ts` – add TURN servers; platform-specific recording permissions (iOS/Android); confirm signaling event names.
  - How: Supply TURN (e.g., coturn), move permission logic out of simplified stubs, keep emitting `callStateChanged` on state updates.
  - Acceptance: Calls connect across NATs; event-driven UI updates; no simplified permission shortcuts.

- **[Replace server mock/random data]** ✅ **COMPLETE**
  - **Implemented:**
    - `server/src/routes/dashboard.js`:
      - `/stats` – real DB aggregations (matches/messages/profile/activity)
      - `/pack-suggestions` – nearby pets via geospatial and simple compatibility scoring
      - `/recent-activity` – recent matches/messages/meetings from `Match`
      - `/pulse` – deterministic scores derived from `User.analytics`
      - `/narrative-insights` – dynamic insights from user analytics (connections, messages, views, matches)
    - `server/src/routes/analytics.js`:
      - `POST /events` – persist to `AnalyticsEvent` (bulk insert)
      - `GET /performance` – p95 latency, error rate, active users from DB
    - `server/src/routes/admin.js`:
      - `/billing/customers` – real data by joining Stripe customers with `User`
      - `/billing/customers/export` – CSV/JSON export from live data
      - `/billing/metrics` – active subscriptions, churn rate, MRR/ARR from User + Stripe
      - `/billing/revenue` – last 6 months customer/churn data from User collection
      - `/billing/payment-methods` – real payment methods from Stripe API
    - `server/src/routes/events.js`:
      - `/nearby` – geospatial query on `Event` with `$near`
      - `POST /` – persist new events to DB
    - New models: `server/src/models/AnalyticsEvent.js`, `server/src/models/Event.js`
  - **Result**: All P0 server endpoints now return deterministic, user-specific data from DB. No more `Math.random()` or hardcoded mock arrays.
  - **Acceptance**: ✅ All endpoints return real data; Stripe integration gracefully falls back to User DB when not configured.

---

## P1: Feature Completeness and UX

- **[Admin Dashboard actions]** `apps/web/app/admin-dashboard/page.tsx`
  - What: TODOs on export and report/security actions (480–483, 915–985, 953–986); add same in `(admin)/dashboard/page.tsx` (478–481).
  - How: Implement server endpoints for exports, reports CRUD, and security alert workflows; connect handlers (acknowledge, resolve, escalate, assign, update, delete) to API.
  - Acceptance: Buttons perform real operations; aria-live announcements preserved.

- **[Chat pagination]** ✅ **COMPLETE**
  - Hook prepared in `apps/web/src/hooks/useChat.ts` and API signature updated in `apps/web/src/services/api.ts`
  - Backend `GET /api/chat/:matchId/messages?page=&limit=` endpoint implemented in `server/src/controllers/chatController.js`
  - Next: switch client to use it; then prepend older messages and toggle `hasMoreMessages`
  - **IMPLEMENTED**: Backend endpoint supports pagination with page/limit params, returns paginated messages with metadata, client hook updated to use the new API, proper error handling and loading states

- **[Chat uploads]** ✅ **COMPLETE**
  - Created comprehensive file upload service (`apps/web/src/services/fileUpload.ts`) with Cloudinary integration
  - Implemented image upload with `fileUploadService.uploadImage()` for MessageInput component
  - Implemented voice message upload with `fileUploadService.uploadVoiceMessage()` for VoiceRecorder
  - Added proper error handling, loading states, and user feedback
  - Files: `apps/web/src/components/Chat/MessageInput.tsx`, `apps/web/src/services/fileUpload.ts`

- **[Login redirect]** ✅ `apps/web/app/(auth)/login/page.tsx`
  - Switched to `useAuth()` signature `login(email, password)` from `@/hooks/api-hooks`
  - Hook performs `router.push('/dashboard')` on success

- **[Deep linking mapping]** ✅ `apps/mobile/src/utils/deepLinking.ts`
  - Added `setNavigator()` and use navigator to route for `chat`, `pet`, `match`, `profile`, `premium`

- **[Remove simulated replies]** ✅ `apps/mobile/src/screens/ChatScreen.tsx`
  - Deleted artificial delayed reply block; only real-time/socket messages remain

- **[Community feed API]** `apps/web/src/components/Community/CommunityFeed.tsx` (74–157, 162–176)
  - What: Replace mock posts and simulated creation/likes/comments with real API.
  - How: Implement `/api/community/posts` and comments/likes endpoints; fetch on mount; handle mutations optimistically.
  - Acceptance: Real feed content with persistence.

- **[Memory Weave data]**
  - Web: `apps/web/src/components/MemoryWeave/MemoryWeave.tsx` (36–83) – remove mock fallback; fetch real memory nodes.
  - Mobile: `apps/mobile/src/screens/MemoryWeaveScreen.tsx` (39–47) – use real `matchId`/pet and `GET /api/memories/:matchId`.
  - Acceptance: Timeline shows real conversation memories; errors surfaced with retry.

- **[Deep linking]** `apps/mobile/src/utils/deepLinking.ts` (156–160)
  - What: Implement navigation mapping instead of logging intent.
  - How: Use `navigationRef` to route (e.g., chat/profile screens) based on payload.
  - Acceptance: Deep links navigate to correct screens.

- **[Login redirect]** `apps/web/app/(auth)/login/page.tsx` (29)
  - What: Add navigation after successful login.
  - How: Use `useRouter()` to `router.push('/dashboard')` on success.
  - Acceptance: Users land on dashboard after login.

- **[Swipe card distance/photos]** `apps/web/src/components/Pet/SwipeCard.tsx` (172–180)
  - What: Replace placeholder photo URL and distance text.
  - How: Ensure real photo URLs (Cloudinary/S3) and compute distance from current user (`LocationService`) or server-side.
  - Acceptance: Accurate image and distance shown on cards.

- **[Map stats and markers]** `apps/mobile/src/screens/MapScreen.tsx` (165–176, 323–327)
  - What: Remove random stats/match simulation.
  - How: Use real stats endpoint and compatibility/proximity logic for markers.
  - Acceptance: Stats/markers reflect real data.

- **[Remove simulated replies]** `apps/mobile/src/screens/ChatScreen.tsx` (267–289, 295–304)
  - What: Drop fake delayed responses.
  - How: On send failure, keep retry UI only; rely on sockets for incoming messages.
  - Acceptance: Only real messages appear.

---

## P1: Consistency and Cross-Cutting

- **[Unify error handling]**
  - Files with temporary handlers:
    - `apps/web/src/services/AnalyticsService.ts` (8–16)
    - `apps/web/src/services/MatchingService.ts` (6–14; also import `logger` if used)
    - `apps/web/src/services/errorHandler.ts` (temporary – replace with core handler + UI notifications)
  - How: Import `errorHandler` from `@pawfectmatch/core`; integrate with your toast/alerts provider; remove temp shims.
  - Acceptance: Consistent structured error handling across web and mobile.

- **[Unify design tokens]** `apps/mobile/src/constants/design-tokens.ts` (7–9)
  - What: Re-export from `@pawfectmatch/design-tokens` instead of local copies.
  - How: Build/publish `packages/design-tokens`; replace local exports with package exports.
  - Acceptance: Single source of truth for tokens across apps.

---

## P2: Observability and Performance

- **[Analytics events persistence + metrics]** `server/src/routes/analytics.js` (56–75, 88–111)
  - What: Persist events; compute performance metrics from DB, not random.
  - How: Create `AnalyticsEvent` model; bulk insert; compute p95, error rates, active users from events/time windows.
  - Acceptance: `/events` stores data; `/performance` derives real metrics.

- **[HOC relocation]** `apps/web/src/utils/analytics-system.ts` (485–509)
  - What: Move HOC to `src/hoc/withAnalytics.tsx` to avoid JSX in utils file.
  - Acceptance: Builds cleanly; HOC works when imported.

- **[Geofencing near matches]** `apps/web/src/services/GeofencingService.ts` (299–305)
  - What: Replace mock `fetchNearbyMatches` with server query.
  - How: Implement `GET /api/matches/nearby?lat=&lng=&radius=` using geospatial indexes.
  - Acceptance: Notifications show real nearby matches.

- **[Virtualized message list]** `apps/web/src/components/Chat/VirtualizedMessageList.tsx` (14–18, 38–41)
  - What: Replace simple scroll with real virtualization (`react-window`/`react-virtuoso`).
  - Acceptance: Smooth performance with large histories.

---

## Mobile Biometrics (RN)

- **[Real biometrics + crypto]** `apps/mobile/src/services/BiometricService.ts` (9–27 mocks; 682–777 Web Crypto)
  - What: Remove mock `ReactNativeBiometrics`; replace Web Crypto usage (not available in RN) with RN-compatible crypto or Secure Enclave/Keystore flow.
  - How: Use `react-native-biometrics` or Expo `LocalAuthentication`; store secrets with `expo-secure-store` or `react-native-encrypted-storage`; for AES-GCM use `react-native-simple-crypto` or store only minimal secret signed by device enclave.
  - Acceptance: `initialize`, `authenticate`, `createSignature` return real values; secure storage works on device.

---

## Appendix: Quick File Reference (by path)

- Mobile
  - `apps/mobile/src/components/calling/CallManager.tsx` – add/remove `WebRTCService` listeners.
  - `apps/mobile/src/services/WebRTCService.ts` – TURN servers; permission gating.
  - `apps/mobile/src/screens/MapScreen.tsx` – random stats/match simulation → real data.
  - `apps/mobile/src/screens/ChatScreen.tsx` – remove simulated responses.
  - `apps/mobile/src/screens/MemoryWeaveScreen.tsx` – fetch real memories.
  - `apps/mobile/src/utils/deepLinking.ts` – implement navigation.
  - `apps/mobile/src/constants/design-tokens.ts` – re-export unified tokens.
  - `apps/mobile/src/services/BiometricService.ts` – real RN biometrics & crypto.
- Web
  - `apps/web/app/admin-dashboard/page.tsx`, `(admin)/dashboard/page.tsx` – wire actions & exports.
  - `apps/web/app/(auth)/login/page.tsx` – redirect after login.
  - `apps/web/src/utils/analytics-system.ts` – move HOC.
  - `apps/web/src/services/AnalyticsService.ts`, `MatchingService.ts`, `errorHandler.ts` – unify error handling.
  - `apps/web/src/hooks/useChat.ts` – pagination.
  - `apps/web/src/components/Chat/MessageInput.tsx` – uploads.
  - `apps/web/src/components/Community/CommunityFeed.tsx` – real API.
  - `apps/web/src/components/MemoryWeave/MemoryWeave.tsx` – real data.
  - `apps/web/src/components/Pet/SwipeCard.tsx` – real distance/photos.
  - `apps/web/src/services/GeofencingService.ts` – real nearby matches.
- Server
  - `server/src/controllers/biometricController.js` – WebAuthn verification.
  - `server/src/routes/analytics.js` – persist events; real metrics.
  - `server/src/routes/dashboard.js` – replace mocks with DB.
  - `server/src/routes/admin.js` – real customers & export streaming.
  - `server/src/routes/events.js` – events model + geospatial queries.

---

## Notes

- Random ID/session generation using `Math.random()` (e.g., some services) is acceptable for UI but use UUIDs for DB entities.
- Keep environment variables for TURN/Stripe/Maps/AI keys documented in `README.md` and `.env.example`.

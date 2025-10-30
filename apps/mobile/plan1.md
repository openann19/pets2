# Phoenix Plan: PawfectMatch Mobile Production Readiness

> **Context:** PawfectMatch is a dating app for pet owners with core features: swipe-to-match, real-time chat, profile management, premium subscriptions, and GDPR compliance.
>
> **Multi-Agent Approach:** This plan integrates the 17-agent system defined in `/AGENTS.md` for reasoning-first, evidence-based development.
>
> **Non‑Destructive Principle:** This plan removes any `git clean` or wipe‑style commands. We do **not** delete untracked files or logs. Rebuilds are performed safely. When deprecating configs, prefer moving to `/_archive/` with a note in the ADR.

## Objectives

We are mid‑migration toward **production-grade PawfectMatch mobile app**:

* **Zero TypeScript errors** (see `/work-items/typescript-safety.yaml`)
* **Zero lint errors** with strict ESLint enforcement
* **Zero runtime secrets in code**
* **GDPR compliance** - account deletion, data export (see `/work-items/gdpr-delete-account.yaml`)
* **Enhanced chat** - reactions, attachments, voice notes (see `/work-items/chat-reactions-attachments.yaml`)
* **Enforced design tokens** across mobile UI
* **Advanced motion system** with Reanimated 3, 60fps target
* **CI gates** that block regressions
* **≥80% test coverage** with unit/integration/E2E tests

## Execution Principles

* **Reasoning over code:** Build product model first, map code to user journeys
* **Evidence-based:** Every change ships with tests + measurable improvements
* **Perpetual improvement:** Follow ANALYSIS → HYPOTHESIS → IMPLEMENTATION → VERIFICATION → DOCUMENTATION loop
* **Agent deliverables:** All artifacts written to `/reports/*` and `/work-items/*.yaml`
* **Sequential phases:** Do not jump ahead; each phase depends on the previous

---

## Agent Coordination & Artifact Flow

**17-Agent Ensemble** (see `/AGENTS.md` for full definitions):

1. **Product Reasoner (PR)** → understands app as product, maps journeys
2. **Codebase Mapper (CM)** → builds code graphs, identifies dead code
3. **Gap Auditor (GA)** → detects missing features vs product intent
4. **TypeScript Guardian (TG)** → enforces strict types, eliminates `any`
5. **UI/UX Reviewer (UX)** → verifies visual/interaction specs
6. **Accessibility Agent (A11Y)** → ensures WCAG compliance, reduced-motion
7. **Performance Profiler (PP)** → 60fps budget enforcement
8. **Security & Privacy Officer (SP)** → secrets, PII, GDPR, SSL pinning
9. **API Contract Agent (API)** → defines/validates contracts, mocks
10. **Mock & Simulation Agent (SIM)** → deterministic fixtures for E2E
11. **Test Engineer (TE)** → unit/integration coverage strategy
12. **E2E Orchestrator (E2E)** → Detox golden paths
13. **Release Captain (RC)** → CI gates, build, OTA readiness
14. **Lint/Format Enforcer (LFE)** → zero lint errors, consistent style
15. **Telemetry/Analytics Agent (TLA)** → event taxonomy, Sentry
16. **i18n/Copy Agent (I18N)** → no hardcoded strings
17. **Arbitration/Referee (REF)** → resolves conflicts, enforces standards

**Key Handoffs:**

* **PR → GA**: `product_model.json` + `navigation_graph.json` → initial `gap_log.yaml`
* **GA → API/SIM**: missing endpoints → contracts + mocks in `/mocks/fixtures/*`
* **API/SIM → TE/E2E**: fixtures/scenarios → tests authored
* **TG → TE**: strict typing changes → new tests required
* **UX/A11Y/PP → TE**: issues found → failing tests added first
* **TE/E2E → RC**: green suites → build & release
* **All → REF**: standards disputes resolved

**Artifacts & Locations:**

* `/reports/*`: `product_model.json`, `gap_log.yaml`, `ts_errors.json`, `security_scan.md`, `perf_budget.json`, etc.
* `/work-items/*.yaml`: actionable tickets with acceptance criteria, states, contracts
* `/mocks/fixtures/*`: deterministic test data
* `/docs/*`: architecture, guidelines, ADRs

**Rule:** No implementation proceeds without an acceptance test or failing check captured first.

---

## Phase 0. Configuration Unification Mandate (must happen before any code refactor)

**Agents:** Lint/Format Enforcer (LFE), TypeScript Guardian (TG), Release Captain (RC)
**Goal:** Make config single‑source‑of‑truth and strict, so later fixes stick.
**Deliverables:** `/reports/config_baseline.json`, archived legacy configs in `/_archive/`, updated CI workflows

### 0.1 Retire Legacy ESLint Configs (safely)

**Problem:** Multiple ESLint configs; the strict root is overridden by looser per‑app configs.

**Actions:**

* Ensure all workspaces extend the **root** `eslint.config.*`.
* **Archive** legacy configs instead of hard‑deleting: move to `/_archive/eslint/` (e.g., `apps/web/.eslintrc.json` → `/_archive/eslint/apps-web.eslintrc.json`).
* Root ESLint requirements:

  * Strict rules: `no-explicit-any`, `@typescript-eslint/no-floating-promises`, `react-hooks/*`, `@typescript-eslint/strict-boolean-expressions` (*or equivalent explicit null/undefined checks via review*).
  * Overrides for React Native, tests (Jest/Playwright), and type‑aware linting via `parserOptions.project` pointing at each workspace `tsconfig`.

### 0.2 Unify TypeScript Configs

* All `tsconfig.json` in `apps/*` and `packages/*` **extend** `tsconfig.base.json`.
* Keep strictness in the base only; children may only specify: target/platform quirks, `jsx`, `paths`, `outDir/rootDir`, and minimal `lib` overrides.

### 0.3 Unify Jest/Test Configs

* Create `jest.config.base.js` (or under `packages/config`).
* Per‑app configs import the base and add only target‑specific tweaks (`testEnvironment`, `preset: 'jest-expo'`, RN mappers, etc.).

### 0.4 Consolidate env files

* One `.env.example` per deployable app: `server/`, `apps/web/`, `apps/mobile/`.
* Document required vars; keep all `.env` in `.gitignore`.

### 0.5 Harden CI Quality Gates

* In `.github/workflows/quality-gate.yml` set `continue-on-error: false` everywhere.
* Enforce strict commands:
  `pnpm lint --max-warnings 0` · `pnpm type-check` · `pnpm test:ci --coverage` · `pnpm build` · `pnpm audit --audit-level moderate` · `pnpm exec gitleaks detect --source .`
* Require these checks in branch protection.

### 0.6 Safe Fresh‑Start Validation (non‑destructive)

> Replaces any wipe commands. No `git clean`. No lockfile deletion.

Run at repo root:

```
pnpm install --frozen-lockfile
pnpm -w dedupe
pnpm audit --audit-level moderate || true   # fail in CI, informational locally
pnpm -w build
pnpm -w test:ci --coverage
pnpm -w type-check
pnpm -w lint --max-warnings 0
```

**Optional, contained:** If a clean dependency state is required, remove only **ephemeral** directories **per package** (never with `git clean`): `rm -rf node_modules .turbo dist build` — but prefer doing this in a disposable working copy, and never touch tracked assets/logs.

> **MANDATE ENTRYPOINT:** Begin Phase 0 now. First action: point every workspace to the strict root configs and archive any per‑workspace ESLint config.

---

## Phase 1. Mobile Hardening (Services / Utils / State / Types / Testing)

**Agents:** TypeScript Guardian (TG), Security & Privacy Officer (SP), Test Engineer (TE), Gap Auditor (GA)
**Goal:** Harden core PawfectMatch mobile services (auth, matching, chat, profiles, GDPR) with strict types, tests, and security
**Work Items:** `/work-items/typescript-safety.yaml`, `/work-items/gdpr-delete-account.yaml`
**Deliverables:** `/reports/ts_errors.json`, `/reports/security_scan.md`, test coverage ≥80%

### 1.0 Analysis & Hypothesis (Perpetual Loop Phase 1)

**Hypothesis:** Eliminating TypeScript errors and unsafe types in services will prevent runtime crashes, improve maintainability (reduce debugging time 40%), and enable confident refactoring for GDPR/chat features.

**Analysis:**

* Baseline TypeScript errors via `pnpm mobile:tsc > /reports/mobile-type-baseline.log`
* Scan for `any`, `@ts-expect-error`, `@ts-ignore` suppressions
* Identify critical services: `authService`, `matchingService`, `chatService`, `profileService`, `gdprService`
* Map service coverage gaps (see `/work-items/gdpr-delete-account.yaml` - missing deletion service)

### 1.1 Lint/Type Baselines & Docs

Create/update:

* `docs/lint-remediation.md` (group by rule class, include counts, list all `eslint-disable` / `@ts-expect-error` / `@ts-ignore` → **blockers** unless justified by ADR)
* `docs/production-readiness.md` (lint/TS/test coverage/audit baselines; risks; success criteria)
* `docs/security/secrets-scan.md` (gitleaks results; notes on rotation)
* Commit snapshots to `logs/`: `mobile-lint-baseline.log`, `mobile-type-baseline.log`, `mobile-test-baseline.json`, `security-audit-baseline.json`.

### 1.2 Services Layer Hardening (apps/mobile/src/services)

**Implementation (Perpetual Loop Phase 2):**

**PawfectMatch Core Services:**

* **`authService.ts`**: Remove `any`; strict auth token types; secure storage via Keychain/Keystore (not AsyncStorage)
* **`matchingService.ts`**: Type swipe actions, match algorithms, preference filtering; no floating promises on swipe events
* **`chatService.ts`**: (see `/work-items/chat-reactions-attachments.yaml`) - add typed methods: `sendReaction()`, `sendAttachment()`, `sendVoiceNote()`
* **`profileService.ts`**: Type photo uploads, bio updates, preferences; PII redaction in logs
* **`gdprService.ts`**: **NEW** - implement per `/work-items/gdpr-delete-account.yaml`:
  * `deleteAccount({ password, reason?, feedback? })` → `{ success, gracePeriodEndsAt }`
  * `exportUserData()` → data export blob
  * `confirmDeletion(token)` → finalize deletion
* **`premiumService.ts`**: Type subscription states, payment handling, feature gates

**Universal Standards:**

* Remove all `any` types; add domain types (`ServiceError`, `APIResponse<T>`, etc.)
* Strict null/undefined checks; no truthy control‑flow
* Async discipline: no floating promises; all `.catch()` or `try/catch` with error logging
* Replace `console.*` with structured logger from `@packages/core` (PII‑redaction policy documented)
* Security: HTTPS enforcement, request timeouts (10s), exponential backoff, token validation
* Unit tests **≥80%** coverage per service; integration tests for GDPR flows

**Verification (Perpetual Loop Phase 3):**

* Run `pnpm mobile:test:cov` - assert ≥80% service coverage
* Simulate `gdprService.deleteAccount()` calls; verify grace period logic
* Benchmark: service method response time <200ms avg
* Document in `/reports/services_hardening_complete.md`

### 1.3 Utilities & State (Zustand)

* Explicit return types; secure storage adapter for secrets (Keychain/Keystore), not raw AsyncStorage.
* Validate deep links; strip unexpected params.

### 1.4 Types & Styling Alignment

* Purge `{} → Record<string, unknown>` or specific interfaces.
* Kill duplicate/unused types.
* Replace magic numbers with tokens from `packages/design-tokens`.

### 1.5 Testing Infrastructure

* Ensure RN Testing Library setup; globals for `__DEV__`.
* Coverage target **≥80%**.

---

## Phase 2. Mobile God‑Component Decomposition & Performance

**Agents:** UI/UX Reviewer (UX), Performance Profiler (PP), Test Engineer (TE), Codebase Mapper (CM)
**Goal:** Decompose PawfectMatch screens (Swipe, Chat, Profile, Settings) into testable, performant components
**Work Items:** Continue `/work-items/chat-reactions-attachments.yaml` UI integration
**Deliverables:** `/reports/ux_findings.md`, `/reports/perf_budget.json`, `/docs/ui-unification.md`, refactored screens with hooks

### 2.0 Analysis & Hypothesis

**Hypothesis:** Breaking god components (>200 LOC) into domain hooks + presentational components will reduce re-renders by 60%, improve test coverage to >90%, and enable faster feature iteration (chat reactions, GDPR UI).

**Analysis:**

* Inventory screens by LOC: `SwipeScreen`, `ChatScreen`, `ProfileEditScreen`, `SettingsScreen`, `MatchesListScreen`
* Identify tangled logic: state + UI + side effects in single file
* Map to user journeys: swipe → match → chat → profile management → GDPR actions

### 2.1 Identify God Components (>200 LOC)

Automate inventory; record to `docs/ui-unification.md`.

### 2.2 Decompose (Implementation)

**PawfectMatch Screen Refactoring:**

**`SwipeScreen.tsx` → Modular:**

* Hook: `useSwipeData()` - fetches potential matches, tracks swipe history
* Hook: `useSwipeGestures()` - handles drag, velocity thresholds, haptics
* Components: `<PetCard>`, `<SwipeActions>`, `<MatchAnimation>` (all memoized)

**`ChatScreen.tsx` → Enhanced per work-item:**

* Hook: `useChatMessages(matchId)` - TanStack Query for real-time messages
* Hook: `useChatActions()` - send, react, attach, voice (see `/work-items/chat-reactions-attachments.yaml`)
* Components: `<MessageBubble>` (with reaction picker on long-press), `<MessageInput>` (attachment/voice buttons), `<ReactionBar>`
* **Integration:** Wire `chatService.sendReaction()`, `sendAttachment()`, `sendVoiceNote()` to UI
* Optimistic updates for all message types

**`ProfileEditScreen.tsx` → Separated:**

* Hook: `useProfileData()` - current user profile state
* Hook: `usePhotoUpload()` - image picker, compression, upload progress
* Components: `<PhotoGrid>`, `<BioEditor>`, `<PreferencesForm>`

**`SettingsScreen.tsx` → GDPR-Ready:**

* Hook: `useGDPRStatus()` - checks deletion grace period status
* Hook: `useAccountDeletion()` - triggers `/work-items/gdpr-delete-account.yaml` flow
* Components: `<SettingsSection>`, `<DangerZone>` (delete account), `<ExportDataButton>`

**Universal Standards:**

* Extract logic into `use[Name]Data` hooks (typed `{ data, isLoading, error, actions }`)
* Pure presentational subcomponents; tokenized styles only from `@packages/design-tokens`
* Memoization discipline: `useMemo`, `useCallback`, `React.memo` for list items
* Tests: unit tests for hooks, integration tests for screens, snapshots for UI components

**Verification:**

* Render count profiling: assert 60% reduction in SwipeScreen re-renders
* Test coverage: screen hooks ≥90%, components ≥85%
* Document in `/reports/screen_refactor_results.md` with before/after metrics

### 2.3 Query Client Standardization

* Add **TanStack Query** with sensible defaults; migrate fetch logic.
* Heavy lists: `FlatList` with memoized `renderItem`, stable `keyExtractor`, `getItemLayout`.
* Document perf in `docs/performance-playbook.md`.

### 2.4 State Architecture

* `docs/state-architecture.md`: what’s in Zustand vs. Query vs. Context; secrets & persistence notes.

---

## Phase 3. Web App & Shared Packages

**Agents:** TypeScript Guardian (TG), UI/UX Reviewer (UX), Security & Privacy Officer (SP), Test Engineer (TE)
**Goal:** Apply same standards to PawfectMatch web (admin console, landing pages) and shared packages
**Deliverables:** Web baselines in `/logs/`, hardened shared packages, Storybook for UI primitives

### 3.1 Web (Next.js) - PawfectMatch Admin & Marketing

**Implementation:**

* **Admin Console**: user moderation, photo approval, subscription management
* **Landing Pages**: marketing site, premium features showcase, privacy/terms
* Baselines to `logs/`: `web-lint-baseline.log`, `web-type-baseline.log`, `web-test-baseline.json`
* Apply same hardening as mobile: zero `any`, strict null checks, ≥80% coverage
* Type server data methods (Next.js API routes, server components)
* Error boundaries for all route segments
* Security headers: CSP, HSTS, X-Frame-Options, Permissions-Policy
* Performance: Lighthouse score ≥90, Core Web Vitals pass

### 3.2 Shared Packages (`core`, `ui`, `ai`, `design-tokens`)

**`@packages/core`:**

* Strict types for shared utilities, validators, error classes
* Async discipline: no floating promises
* Test public API with ≥85% coverage
* Export structured logger (PII redaction), crypto helpers, date utilities

**`@packages/ui`:**

* Tokenized primitives: `<Button>`, `<Text>`, `<Input>`, `<Card>`, layout helpers
* Accessibility: ARIA roles, labels, focus management
* Variant system: sizes, colors, states from `design-tokens`
* Tests + Storybook for all components
* Visual regression testing with Chromatic or Percy

**`@packages/ai`:**

* Typed responses for pet matching algorithm, content moderation
* Robust error handling: rate limits, timeouts, fallbacks
* No secret logging (API keys redacted)
* Integration tests with mocked AI service

**`@packages/design-tokens`:**

* Export full token map: colors, spacing, typography, shadows, motion
* TypeScript types for autocomplete
* Single source of truth consumed by mobile + web
* Version tokens; breaking changes require ADR

**Verification:**

* All packages: `pnpm -r type-check` passes, `pnpm -r lint` clean, `pnpm -r test` ≥80%
* Storybook builds without errors; all primitives documented
* Web Lighthouse: Performance ≥90, Accessibility 100, Best Practices ≥95

### 3.3 Server TypeScript Conversion (Backend Hardening)

**Agents:** TypeScript Guardian (TG), Security & Privacy Officer (SP), API Contract Agent (API), Test Engineer (TE)
**Goal:** Complete server migration from JavaScript to TypeScript; establish type-safe API contracts
**Current State:** Main files (`server.ts`, `socket.ts`) in TS; **57+ JS files remain** in controllers/routes/models/services
**Deliverables:** Zero JS files in `/server/src`, API type definitions, server test coverage ≥80%

**Analysis & Hypothesis:**

**Hypothesis:** Converting server to TypeScript will eliminate runtime type errors (prevent 80% of production bugs), enable contract-driven development for mobile/web clients, and improve developer velocity by 40% via autocomplete and compile-time checks.

**Baseline:**

* Scan: `find /server -name "*.js" | wc -l` → **57+ JS files**
* Critical paths: controllers (auth, chat, matching, GDPR), models (User, Pet, Match), routes, middleware

**Implementation (Priority Order):**

**1. Models & Types (Foundation):**

* Convert `/server/models/*.js` → `.ts`:
  * `User.js`, `Pet.js`, `Match.js`, `Message.js`, `PhotoModeration.js`
* Create `/server/src/types/`:
  * `api.types.ts` - API request/response schemas (shared with mobile via contracts)
  * `database.types.ts` - MongoDB/Mongoose type definitions
  * `socket.types.ts` - Socket.IO event payloads
* Use **Zod** for runtime validation + TypeScript type inference
* Export types to `/contracts/` for mobile/web consumption

**2. Controllers (Business Logic):**

Convert controllers in dependency order:

* `authController.js` → strict auth token types, secure password hashing
* `matchController.js` → swipe algorithm types, preference filtering
* `chatController.js` → message types, reactions, attachments (align with `/work-items/chat-reactions-attachments.yaml`)
* `gdprController.js` → **NEW** - implement deletion/export per `/work-items/gdpr-delete-account.yaml`
* `profileController.js`, `petController.js`, `premiumController.js`
* Admin controllers: `adminController.js`, `adminModerationController.js`, etc.

**Standards per controller:**

* Strict return types: `Promise<APIResponse<T>>` or `void`
* No `any` - use `unknown` for external data, validate with Zod
* Error handling: typed error classes (`AuthError`, `ValidationError`, `DatabaseError`)
* Async discipline: all promises caught, errors logged with structured logger
* Unit tests: ≥85% coverage per controller

**3. Routes & Middleware:**

* Convert `/server/routes/*.js` → `.ts`:
  * `favorites.js`, `moderationRoutes.js`, `stories.js`, `uploadRoutes.js`
* Middleware: `authMiddleware.js`, `rateLimiter.js`, `validator.js`
* Type Express Request/Response with custom types:

  ```typescript
  interface AuthRequest extends Request {
    user: UserDocument;
    token: string;
  }
  ```

**4. Services & Utils:**

* `/server/services/*.js` → `.ts`:
  * `contentModerationService.js`, `moderatorNotificationService.js`
* `/server/src/config/*.js` → `.ts`:
  * `redis.js`, `sentry.js` - strict config types
* Utils: encryption, sanitization, validation - all typed

**5. Tests Migration:**

* Convert test files: `__tests__/*.test.js` → `.test.ts`
* Update mocks to TypeScript
* Ensure `pnpm server:test` passes with ≥80% coverage

**6. API Contracts Export:**

* Generate OpenAPI/Swagger spec from Zod schemas
* Export to `/contracts/openapi.yaml`
* Mobile consumes contracts for service types (see API Contract Agent)

**Verification (Perpetual Loop Phase 3):**

* **TypeScript strict**: `pnpm server:tsc --noEmit` → zero errors
* **No JS files**: `find /server/src -name "*.js" -not -path "*/dist/*" | wc -l` → 0
* **Lint clean**: `pnpm server:lint --max-warnings 0`
* **Tests pass**: `pnpm server:test:cov` → ≥80% coverage
* **Contracts valid**: mobile services consume server types without casting
* **Runtime safe**: Zod validation at API boundaries prevents bad data
* **Benchmark**: API response time unchanged or improved (type checks compile-time)

**Documentation:**

* ADR: `009-server-typescript-migration.md` - migration strategy, timeline, rollback plan
* API docs: auto-generated from OpenAPI spec at `/docs/api/`
* Update `/reports/ts_errors.json` with server baseline → 0

**Measurable Improvements:**

* TypeScript errors: server baseline (unknown) → 0
* Production runtime errors: -80% (type safety catches bugs pre-deploy)
* API contract drift: eliminated (mobile/server types synced)
* Developer velocity: +40% (autocomplete, refactoring confidence)

---

## Phase 4. UI System & Design Tokens (Foundations)

**Agents:** UI/UX Reviewer (UX), Lint/Format Enforcer (LFE), Codebase Mapper (CM)
**Goal:** Lock design tokens as single source of truth; eliminate hardcoded values
**Deliverables:** `@packages/design-tokens` finalized, ESLint rule for token enforcement, Storybook with all primitives

### 4.1 Token Enforcement

**Implementation:**

* Custom ESLint rule: `no-hardcoded-colors`, `no-magic-spacing-numbers`
* Codemod: scan codebase for hex colors (`#[0-9A-Fa-f]{6}`), hardcoded spacing (`margin: 16`, etc.)
* Replace with token references: `colors.primary.main`, `spacing.md`
* Run codemod → commit diff → enable ESLint rule to prevent regressions
* Document exceptions in ADR (e.g., chart libraries with color requirements)

### 4.2 Primitive Library (`@packages/ui`)

**Implementation:**

* Variant system: sizes (xs, sm, md, lg, xl), colors (primary, secondary, etc.), states (default, hover, active, disabled)
* Elevation scale: shadow tokens (none, sm, md, lg, xl)
* All styling backed by `@packages/design-tokens`
* Accessibility: ARIA props, focus indicators, keyboard navigation
* Storybook: all primitives documented with interactive controls
* Visual regression: Chromatic integration for automated screenshot diffs

**Verification:**

* ESLint rule catches new hardcoded values; CI fails on violations
* All primitives render in Storybook without errors
* Visual regression baseline established

---

## **Phase 4A. Advanced Components & Motion System (Audit → Upgrade)**

**Agents:** Performance Profiler (PP), UI/UX Reviewer (UX), Accessibility Agent (A11Y)
**Goal:** Implement premium motion system for PawfectMatch core interactions: swipe cards, match celebrations, chat animations
**Deliverables:** `/packages/motion-system/`, `/docs/ui/motion-guidelines.md`, 60fps animations with reduced-motion support

### 4A.0 Objectives & Hypothesis

**Hypothesis:** Implementing GPU-accelerated motion with Reanimated 3 for swipe cards and chat will achieve consistent 60fps (vs current ~40fps jank), improve perceived quality score +30%, and increase swipe engagement +15%.

**Objectives:**

* Establish **Motion System** with tokens (durations, easings, distances) in `@packages/motion-system`
* Replace legacy `Animated.*` patterns with **Reanimated 3 worklets** (GPU-accelerated, interruptible)
* Ship **PawfectMatch micro‑interactions**: swipe physics, match confetti, chat bubble springs, haptic feedback
* Honor accessibility: `prefers-reduced-motion`, non-gesture alternatives

### 4A.1 Motion & Interaction Audit

Create `docs/ui/motion-audit.md` with:

* **Inventory**: grep/code‑mod assisted scan for `Animated`, `LayoutAnimation`, `FramerMotion`, `reanimated`, `gesture-handler`, `Lottie`, inline `transition` CSS, etc.
* **Classification**: loading states, navigation transitions, list interactions, presses, drags/swipes, async busy states, confetti/celebration effects.
* **Gaps & Debt**: blocking jank, non‑interruptible animations, duplicated ad‑hoc timings, missing `prefers-reduced-motion` guards.

### 4A.2 Motion System Package

Create `packages/motion-system/` exporting:

* `motionTokens.ts`: `{ duration: { xs:120, sm:180, md:240, lg:320 }, ease: { standard:[0.2,0,0,1], emphasized:[0.2,0,0,1], out:[0.2,0,0,1] }, distance:{ sm:8, md:16, lg:24 } }` (example values).
* `transitions.ts`: canonical variants (fade, scale, slide, zoom, shared‑element hints).
* **Web bindings**: Framer Motion variant helpers; `prefers-reduced-motion` utilities.
* **Mobile bindings**: Reanimated 3 layout/enter/exit presets; Gesture Handler helpers; haptics hooks.

### 4A.3 Mobile Stack (React Native)

* **Adopt**: React Native Reanimated **3.x**, React Native Gesture Handler **v2**, React Navigation latest screen transitions with Reanimated drivers, **Moti** for terser motion API (optional), **RN Skia** for shader‑grade effects (blur, particles), **Haptics** prudent use.
* **Replace**: Legacy `Animated.*` & `LayoutAnimation` with Reanimated layout transitions (`entering`, `exiting`, `layout`) and worklets.
* **Shared Element**: add a safe abstraction (e.g., `createSharedElementTransition()`) for hero images/cards (use library or custom with Reanimated + navigation).
* **Accessibility**: honor reduced motion; ensure gestures have non‑gesture affordances.
* **Performance budgets**: 60 FPS target; ≤4 ms JS work per frame on animated routes; isolate heavy work to UI thread/worklets; batch state updates.

### 4A.4 Web Stack (Next.js)

* **Framer Motion 11+** variants for routes & components (defer heavy work; `layoutId` shared layout transitions where appropriate).
* **Micro‑interactions**: buttons, inputs, list hover/press—tokenized timings; magnetic effects only when cheap.
* **Route Transitions**: integrate Next.js app router with motion wrappers; respect `prefers-reduced-motion`.
* **GPU**: transform/opacity only during motion; avoid layout thrash; isolate compositing layers where needed.

### 4A.5 Component Upgrades (PawfectMatch-Specific)

**Implementation:**

**`<SwipeCard>` (Pet Profile Cards):**

* Physics-based drag with Gesture Handler + Reanimated 3 worklets
* Velocity thresholds: >0.5 m/s triggers swipe action (like/pass)
* Haptic feedback on decision threshold cross (iOS/Android)
* Rotation/translation coupled to drag position; elastic bounds on overswipe
* GPU-only properties: `transform`, `opacity`
* Fallback: simple fade for `prefers-reduced-motion`

**`<MatchAnimation>` (Celebration on Match):**

* Confetti burst with RN Skia particles (250 particles, 2s duration)
* Heart pulse animation with spring physics (`config: { damping: 10, stiffness: 100 }`)
* Profile photos zoom-in with shared element transition
* Auto-pause confetti on low-end devices (detect via performance API)
* Fallback: simple scale-in for reduced motion

**`<MessageBubble>` (Chat):**

* Springy entrance animation on new message (entering from right/left)
* Reaction picker modal: friction-feel drag-to-dismiss with backdrop blur (Skia `<Blur>`)
* Typing indicator: 3-dot pulse with staggered delays (80ms offset)
* Long-press haptic + scale transform (0.95) for reaction affordance
* Optimistic send: immediate render with subtle opacity pulse

**`<ChatInput>` (Message Composition):**

* Attachment button: magnetic hover effect (subtle pull on press)
* Voice recorder: waveform visualization with real-time amplitude (Skia path)
* Send button: morph animation (mic icon → send icon) with rotation

**Performance Budget:**

* 60 FPS target on mid-range devices (iPhone 11, Pixel 5)
* ≤4 ms JS work per frame during swipe/chat animations
* Memory: particle systems auto-cleanup; max 500 particles total
* Measure with React Native Performance Monitor + Flipper profiling

**Verification:**

* Profile SwipeScreen: assert consistent 60fps during card drag (Flipper trace)
* Measure match celebration render time: <16ms total
* Test reduced-motion: animations disabled, functionality intact
* Document results in `/reports/motion_performance.md` with video captures

### 4A.6 Tooling & Tests

* **Storybook** motion scenarios; visual regression with reduced motion **off** and **on**.
* **Integration tests** assert classes/aria attrs flip correctly; unit tests for variant helpers.
* **Perf tests**: RN perf monitor & React DevTools profiler traces before/after; Lighthouse motion/CLS sanity on web.

### 4A.7 Deliverables

* `packages/motion-system/` shipped + consumed by `apps/mobile` and `apps/web`.
* `docs/ui/motion-guidelines.md` (tokens, do/don’t, a11y rules, examples).
* 5–10 flagship flows upgraded (swipe, chat, onboarding, modals, list screens) with measurements and GIFs/screen‑caps in the doc.
* ADR `008-advanced-motion-and-components.md` capturing decisions/libraries/budgets.

---

## Phase 5. Security & Store Readiness

**Agents:** Security & Privacy Officer (SP), Release Captain (RC), Test Engineer (TE)
**Goal:** Harden PawfectMatch for production: eliminate secrets, secure storage, GDPR verification, store compliance
**Work Items:** Verify `/work-items/gdpr-delete-account.yaml` implementation
**Deliverables:** `/reports/security_scan.md`, `/reports/gdpr_checklist.md`, gitleaks baseline, app store submission-ready builds

### 5.1 Secrets & Sensitive Data

**Implementation:**

* **Gitleaks scan**: `pnpm exec gitleaks detect --source . --report-path /reports/gitleaks-report.json`
* Baseline: zero secrets in history; rotate any exposed keys
* Environment variable policy: all secrets in `.env` (gitignored), loaded via `react-native-config` or similar
* PII logging audit: structured logger redacts emails, names, phone numbers, location data
* Document secrets policy in `docs/security/secrets-policy.md`

### 5.2 Secure Storage & Encryption

**Implementation:**

* **Auth tokens**: `react-native-keychain` (iOS Keychain, Android Keystore) - NOT AsyncStorage
* **User preferences**: AsyncStorage acceptable (non-sensitive data only)
* **Biometric auth**: integrate `react-native-biometrics` for optional face/fingerprint unlock
* **Jailbreak/root detection**: `react-native-device-info` or custom checks; warn users or restrict features
* **SSL pinning**: document strategy in ADR; implement if required for premium/payment flows

### 5.3 GDPR Compliance Verification

**Verification (Per `/work-items/gdpr-delete-account.yaml`):**

* ✅ `gdprService.deleteAccount()` implemented with 30-day grace period
* ✅ `exportUserData()` returns complete data dump (profile, matches, messages, photos)
* ✅ Settings UI: "Delete Account" button wired to service
* ✅ E2E test: Detox exercises full deletion flow, confirms grace period UI
* ✅ Privacy policy updated with GDPR Article 17 (Right to Erasure) details
* ✅ Data retention policy documented

### 5.4 Store Readiness (iOS App Store / Google Play)

**Mobile Build Hardening:**

* **ProGuard/R8** (Android): enable code shrinking, obfuscation for release builds
* **Symbol stripping** (iOS): upload dSYMs to Sentry/Crashlytics; strip from production binary
* **Permissions audit**: minimize requested permissions; justify each in store listing
* **App Store screenshots**: Storybook exports + actual device captures
* **Metadata**: App description highlights GDPR compliance, secure data handling

**Web Security Headers:**

* **CSP**: Content Security Policy locks down script/style sources
* **HSTS**: Strict-Transport-Security forces HTTPS
* **X-Frame-Options**: prevent clickjacking
* **Permissions-Policy**: restrict camera/mic/geolocation to user-initiated actions

### 5.5 SBOM & License Policy

**Implementation:**

* Generate Software Bill of Materials: `pnpm licenses list --json > /reports/sbom.json`
* License audit: flag GPL/AGPL (viral licenses); prefer MIT/Apache/BSD
* Document in `docs/security/license-policy.md`
* CI check: fail on new viral licenses without approval

**Verification:**

* Gitleaks: zero secrets detected
* Security audit: `pnpm audit --audit-level moderate` passes
* GDPR: all E2E tests pass, privacy policy reviewed
* Store compliance: permissions justified, metadata complete
* SBOM: no viral licenses without ADR approval

---

## Phase 6. Immutable Configuration & CI Gatekeeping

**Agents:** Lint/Format Enforcer (LFE), Release Captain (RC), Arbitration/Referee (REF)
**Goal:** Lock configs as immutable; enforce quality gates in CI/CD; prevent config drift
**Deliverables:** `@packages/config/` centralized configs, Husky pre-commit hooks, hardened CI pipeline, config checksum validation

### 6.1 Centralized Configuration Package

**Implementation:**

* Create `@packages/config/` with frozen exports:
  * `eslint.config.js` - root ESLint config (all workspaces extend this)
  * `tsconfig.base.json` - base TypeScript config
  * `jest.config.base.js` - shared Jest config
* All `apps/*` and `packages/*` extend centralized configs; local overrides documented in ADRs
* Versioned package: breaking config changes require major version bump + ADR

### 6.2 Pre-Commit Hooks (Husky + lint-staged)

**Implementation:**

* Install Husky: `pnpm add -D husky lint-staged`
* Pre-commit hook: runs `lint-staged` on changed files only
  * ESLint: `pnpm eslint --fix`
  * Prettier: `pnpm prettier --write`
  * TypeScript: `pnpm tsc --noEmit` on changed files
* Pre-push hook: runs full test suite on affected workspaces
* Document hook bypass (emergency only): `git commit --no-verify` requires ADR justification

### 6.3 CI Quality Gates (GitHub Actions)

**Implementation (`.github/workflows/quality-gate.yml`):**

```yaml
jobs:
  quality:
    steps:
      - Lint: pnpm lint --max-warnings 0 (FAIL on warnings)
      - Type Check: pnpm type-check (FAIL on errors)
      - Test: pnpm test:ci --coverage (FAIL if coverage <80%)
      - Build: pnpm build (FAIL on build errors)
      - Security: pnpm audit --audit-level moderate (FAIL on vulnerabilities)
      - Secrets: pnpm exec gitleaks detect (FAIL on secrets)
      - Licenses: pnpm licenses list (FAIL on viral licenses)
```

* Branch protection: require `quality` job to pass before merge
* No `continue-on-error: true` - all checks must pass
* Artifacts: upload coverage reports, Lighthouse scores, bundle diffs

### 6.4 Config Checksum & ADR Gate

**Implementation:**

* Script: `scripts/config-checksum.ts` computes SHA-256 of all config files
* Store baseline: `/reports/config-checksum.json`
* CI check: fail if checksum changes without corresponding ADR in PR description
* Enforce: config changes require ADR label (`adr-required`) + reviewer approval

**Verification:**

* Husky hooks: commit rejected if lint/type errors exist
* CI: all quality gates pass on every PR
* Config changes: ADR label enforced by CI script
* Document in `docs/ci-cd-pipeline.md`

---

## Phase 7. Documentation, Dashboard, Release Prep

**Agents:** All agents contribute; Release Captain (RC) coordinates; Arbitration/Referee (REF) approves
**Goal:** Complete documentation, establish quality dashboard, prepare production release
**Deliverables:** Updated docs, 8 ADRs, quality dashboard, release checklist, CHANGELOG

### 7.1 Core Documentation Updates

**Update/Create:**

* **`CONTRIBUTING.md`**: development workflow, commit conventions, PR process, testing requirements
* **`README.md`**: project overview, PawfectMatch features, quick start, architecture diagram
* **`ARCHITECTURE.md`**: system design, multi-agent approach, tech stack, deployment architecture
* **`docs/state-architecture.md`**: Zustand vs TanStack Query vs Context; where data lives
* **`docs/testing-strategy.md`**: unit/integration/E2E strategy, coverage targets, mocking patterns
* **`docs/ui-unification.md`**: design tokens, primitives, motion system, component library
* **`docs/performance-playbook.md`**: 60fps targets, profiling tools, optimization techniques
* **`docs/quality-dashboard.md`**: metrics dashboard (TS errors trend, coverage %, bundle size, Lighthouse scores)

### 7.2 Architecture Decision Records (ADRs)

**Create in `docs/adr/`:**

* **`001-strict-typescript-config.md`**: Why strict mode, no `any`, exhaustive types
* **`002-immutable-lint-rules.md`**: Config immutability, centralized package, ADR requirement
* **`003-state-management-standardization.md`**: Zustand for global, TanStack Query for server, Context for theme
* **`004-ui-system-architecture.md`**: Design tokens, primitive library, Storybook, accessibility
* **`005-security-hardening-strategy.md`**: Secrets policy, secure storage, GDPR, SSL pinning
* **`006-test-coverage-standards.md`**: ≥80% global, ≥90% critical paths, E2E golden flows
* **`007-monorepo-ci-cd-strategy.md`**: Turborepo, quality gates, branch protection, release process
* **`008-advanced-motion-and-components.md`**: Reanimated 3, motion tokens, 60fps budgets, accessibility
* **`009-server-typescript-migration.md`**: JS→TS conversion strategy, API contracts, Zod validation, rollback plan

### 7.3 Quality Dashboard

**Create `/docs/quality-dashboard.md`:**

* **TypeScript Health**: errors over time (baseline → 0), suppressions count
* **Test Coverage**: global %, critical services %, trend chart
* **Performance**: bundle sizes (mobile/web), Lighthouse scores, 60fps compliance
* **Security**: vulnerability count, secrets scan results, GDPR compliance status
* **Motion**: animation performance metrics, reduced-motion coverage
* **Work Items**: `/work-items/*.yaml` status (open/in-progress/closed)
* Auto-generate via CI script; update on every merge to main

### 7.4 Release Preparation

**Final Validation Pipeline:**

1. Run full CI suite locally: `pnpm -w validate` (lint + type + test + build)
2. E2E tests: Detox on iOS + Android emulators (Auth, Swipe, Chat, GDPR, Premium)
3. Performance profiling: Flipper traces for SwipeScreen, ChatScreen
4. Security scan: gitleaks, audit, license check all pass
5. GDPR verification: manual test of deletion flow, data export
6. Accessibility audit: VoiceOver/TalkBack testing, contrast checker
7. Store compliance: permissions justified, screenshots ready, metadata complete

**Release Checklist:**

* ✅ All `/work-items/*.yaml` closed with evidence
* ✅ Zero TypeScript errors, zero lint warnings
* ✅ Test coverage ≥80% global, ≥90% critical
* ✅ E2E tests passing on iOS + Android
* ✅ Security: no secrets, no vulnerabilities
* ✅ GDPR: deletion + export flows tested
* ✅ Performance: 60fps animations, bundle <15MB
* ✅ Docs: all ADRs written, README updated
* ✅ CHANGELOG: version bumped, changes documented

**Release Process:**

* Tag release: `git tag v1.0.0-rc1`
* Build production: `pnpm mobile:build:production`
* Deploy OTA: CodePush/EAS Update for non-native changes
* App Store: submit iOS to TestFlight → App Review
* Play Store: submit Android to internal testing → production
* Monitor: Sentry for errors, analytics for adoption

**Verification:**

* Final validation: all checks pass
* Release tagged with CHANGELOG
* Docs published; quality dashboard live
* App submitted to stores; OTA ready

---

## Final Success Criteria (Evidence-Based)

### Code Quality (TypeScript Guardian, Lint/Format Enforcer)

* **Zero TypeScript errors**:
  * Mobile: `pnpm mobile:tsc` passes (see `/work-items/typescript-safety.yaml` ✅)
  * Server: `pnpm server:tsc` passes (57+ JS files → 0)
  * Web: `pnpm web:tsc` passes
* **Zero ESLint errors, 0 warnings**: `pnpm -w lint --max-warnings 0`
* **No `any` in production code**: exceptions documented in ADRs only
* **No suppression abuse**: `eslint-disable` / `@ts-ignore` removed or ADR-justified
* **No god components**: all screens <200 LOC; logic extracted to hooks
* **Server fully typed**: models, controllers, routes, services all TypeScript with Zod validation

### PawfectMatch Features (Product Reasoner, Gap Auditor)

* **GDPR Compliance** (see `/work-items/gdpr-delete-account.yaml`):
  * `gdprService.deleteAccount()` implemented with 30-day grace period ✅
  * `exportUserData()` returns complete data dump ✅
  * Detox E2E tests deletion flow ✅
  * Settings UI wired to services ✅
* **Enhanced Chat** (see `/work-items/chat-reactions-attachments.yaml`):
  * `chatService.sendReaction()`, `sendAttachment()`, `sendVoiceNote()` implemented ✅
  * UI: long-press reaction picker, attachment/voice buttons integrated ✅
  * Optimistic updates for all message types ✅
  * Integration tests + E2E coverage ≥90% ✅
* **Core Journeys**:
  * Swipe → Match → Chat flow: E2E tested, <3s total interaction time
  * Profile creation/edit: photo upload, bio, preferences saved
  * Premium subscription: feature gates functional, payment mocked

### Testing (Test Engineer, E2E Orchestrator)

* **Coverage ≥80%** in all packages; ≥90% for critical services (`authService`, `gdprService`, `chatService`)
* **Unit tests**: all hooks, services, utilities
* **Integration tests**: screen flows with mocked services
* **E2E tests (Detox)**: Auth, Swipe→Match, Chat (reactions), Settings/GDPR, Premium
* **Snapshots**: UI primitives in Storybook
* **Motion tests**: verify reduced-motion fallbacks; performance profiling

### Security & Privacy (Security & Privacy Officer)

* **No secrets in repo/history**: gitleaks scan passes (`pnpm exec gitleaks detect`)
* **Secure storage**: auth tokens in Keychain/Keystore, not AsyncStorage
* **PII redaction**: structured logger masks emails, names, locations
* **SSL pinning**: documented strategy (if applicable)
* **No high/critical vulnerabilities**: `pnpm audit --audit-level moderate` passes

### Performance & Motion (Performance Profiler)

* **Mobile 60 FPS**: SwipeScreen, ChatScreen, MatchAnimation maintain 60fps on iPhone 11/Pixel 5
* **Animation budgets**: ≤4 ms JS work per frame; worklets isolate heavy computation
* **Bundle size**: mobile app <15MB; delta <+200KB per PR without approval
* **Startup time**: app interactive within 2s on mid-range devices
* **Motion accessibility**: `prefers-reduced-motion` honored; animations skippable
* **Profiling data**: Flipper traces for key flows documented in `/reports/perf_budget.json`

### Infra & Governance (Release Captain, Arbitration/Referee)

* **Config immutability**: single ESLint/TS/Jest sources in `packages/config/` or root
* **CI gates enforced**: lint(0 warn), type(0 err), test(≥80%), build, audit, secret scan
* **Husky pre-commit**: `lint-staged` runs on changed files
* **ADR governance**: config changes require ADR; checksum validation script
* **Branch protection**: CI must pass before merge; ≥1 reviewer required

### Documentation & Artifacts (All Agents)

* **Reports delivered**: `/reports/product_model.json`, `gap_log.yaml`, `ts_errors.json`, `security_scan.md`, `perf_budget.json`, `ux_findings.md`
* **Work items closed**: All in `/work-items/*.yaml` marked `status: closed` with evidence
* **ADRs updated**:
  * `001-strict-typescript-config.md`
  * `002-immutable-lint-rules.md`
  * `003-state-management-standardization.md`
  * `004-ui-system-architecture.md`
  * `005-security-hardening-strategy.md`
  * `006-test-coverage-standards.md`
  * `007-monorepo-ci-cd-strategy.md`
  * `008-advanced-motion-and-components.md`
* **Docs present**: `docs/ui/motion-guidelines.md`, `docs/ui/motion-audit.md`, `docs/state-architecture.md`, `docs/performance-playbook.md`, `docs/quality-dashboard.md`

### Production Operations & Infrastructure (Release Captain, Security & Privacy Officer)

* **Uptime SLA**: 99.9% (< 8.76 hours downtime/year)
* **API Performance**:
  * p95 response time: <200ms
  * p99 response time: <500ms
  * Error rate: <0.1%
* **Scalability**: handle 10M users, 1M DAU (daily active users)
* **Disaster Recovery**:
  * RTO (Recovery Time): <2 hours
  * RPO (Recovery Point): <5 minutes
  * DR drills: quarterly with documented results
* **Infrastructure**:
  * Auto-scaling: 3+ servers, dynamic scaling on CPU >70%
  * Multi-region: US-East, EU-West with automatic failover
  * CDN: 95%+ cache hit rate
  * Redis: <5ms avg latency, 90%+ hit rate
* **Monitoring**:
  * Alert response time: <15 minutes
  * Incident resolution: <2 hours (non-critical), <30 min (critical)
  * Observability: Prometheus + Grafana dashboards, APM tracing
* **Security**:
  * Rate limiting enforced (100 req/hour anonymous, 1000 req/hour authenticated)
  * WAF + DDoS protection active
  * Penetration test: annually, no critical findings
  * MFA: enabled for all admin accounts
* **Compliance**:
  * GDPR, CCPA, COPPA compliant
  * Privacy policy reviewed by legal
  * App Store privacy labels complete
* **DevOps**:
  * Deployment frequency: daily (via OTA) or weekly (native)
  * Rollback time: <5 minutes
  * CI/CD: automated pipelines, blue-green deployments
  * Infrastructure as Code: 100% managed via Terraform

### Measurable Improvements (Perpetual Loop Validation)

* **TypeScript errors**:
  * Mobile: baseline → 0 (100% reduction)
  * Server: 57+ JS files → 0 (100% TypeScript)
  * Total codebase: 100% typed
* **Production runtime errors**: -80% (type safety catches bugs pre-deploy)
* **Test coverage**: baseline → ≥80% global, ≥90% critical paths (mobile + server)
* **Re-render reduction**: SwipeScreen 60% fewer re-renders post-decomposition
* **Animation performance**: 40fps (janky) → 60fps (smooth)
* **Developer velocity**: feature iteration time reduced 30-40% (measured via PR cycle time + autocomplete/refactoring confidence)
* **API contract drift**: eliminated (mobile/server types synced via `/contracts/`)
* **User engagement**: +50% session duration (micro-interactions, gamification)
* **User retention**: +30% D7 retention (push notifications, streaks, real-time features)
* **Infrastructure costs**: -40% via auto-scaling optimization
* **User perception**: app quality score +30% (via user testing/NPS if available)

---

## TL;DR for the new dev

**What is PawfectMatch?** A dating app for pet owners with swipe-to-match, real-time chat, profile management, premium subscriptions, and GDPR compliance.

**How we build it:**

* **Multi-agent approach**: 17 specialized agents (see `/AGENTS.md`) coordinate via `/reports/*` and `/work-items/*.yaml`
* **Perpetual improvement**: Every phase follows ANALYSIS → HYPOTHESIS → IMPLEMENTATION → VERIFICATION → DOCUMENTATION
* **Evidence-based**: All claims backed by tests, metrics, and artifacts

**Execution order:**

* **Phase 0** (Config): Unify ESLint/TS/Jest configs, archive legacy ones, harden CI. No destructive cleans.
* **Phase 1** (Services): Harden `authService`, `matchingService`, `chatService`, `profileService`, **implement `gdprService`** (see `/work-items/gdpr-delete-account.yaml`). Zero TypeScript errors (see `/work-items/typescript-safety.yaml`). ≥80% test coverage.
* **Phase 2** (Screens): Decompose god components: `SwipeScreen`, `ChatScreen`, `SettingsScreen`. Extract hooks. **Integrate chat reactions/attachments** (see `/work-items/chat-reactions-attachments.yaml`). Add TanStack Query.
* **Phase 3** (Web + Server): Apply same standards to Next.js web app + shared packages (`core`, `ui`, `design-tokens`). **Convert server from JS→TS** (57+ files): models, controllers, routes, services. Export API contracts to `/contracts/`.
* **Phase 4** (Tokens): Lock design tokens; build primitive library; ESLint rule to ban hardcoded colors.
* **Phase 4A** (Motion): Audit animations; build motion system (`@packages/motion-system`); implement Reanimated 3 for swipe cards, match celebrations, chat bubbles. 60fps target with reduced-motion support.
* **Phase 5** (Security): Secrets audit, secure storage, gitleaks, GDPR compliance verification.
* **Phase 6** (CI/CD): Immutable configs, Husky hooks, branch protection, config checksum.
* **Phase 7** (Docs): ADRs, architecture docs, quality dashboard, release prep.
* **Phase 8** (Instagram-Level Polish): Micro-interactions library (confetti, haptics, animations), real-time features (presence, typing, read receipts), performance optimization (CDN, FlashList, lazy loading), feature flags, A/B testing, 100+ analytics events, i18n (5+ languages), accessibility (WCAG AAA), media handling (filters, video), offline support, Storybook, visual regression, 10+ E2E flows.
* **Phase 9** (Production Operations & Scaling): Auto-scaling backend (3+ servers), Redis caching, CDN, background jobs, Prometheus + Grafana monitoring, APM tracing, centralized logging, CI/CD automation (blue-green/canary), Infrastructure as Code (Terraform), disaster recovery (99.9% uptime, <2h RTO), rate limiting, WAF, DDoS protection, compliance (GDPR/CCPA/COPPA), attribution tracking, referral program, customer support (Zendesk), payment processing (Stripe).

**Success:** All `/work-items/*.yaml` closed with evidence. Zero TS/lint errors. ≥80% coverage. 60fps animations. GDPR compliant. 99.9% uptime. 10M users scalability. Ship. 🚀

---

## Phase 8. Instagram-Level Polish & Production Infrastructure

**Agents:** UI/UX Reviewer (UX), Performance Profiler (PP), Telemetry/Analytics Agent (TLA), Product Reasoner (PR), Release Captain (RC)
**Goal:** Achieve world-class app quality with jaw-dropping micro-interactions, real-time features, production infrastructure
**Deliverables:** Feature flags, A/B testing, analytics events, micro-interaction library, performance monitoring, polished empty/error/loading states

### 8.1 Micro-Interactions Library (Jaw-Dropping UX)

**Create `@packages/micro-interactions/`:**

**Core Interactions:**

* **Like/Heart Animation** (double-tap anywhere on card):
  * Heart burst from tap position with particle explosion
  * Haptic feedback (medium impact)
  * Scale + opacity animation with spring physics
  * Persist state optimistically
  * Inspiration: Instagram double-tap like

* **Pull-to-Refresh** (all list screens):
  * Custom animated spinner with PawfectMatch paw icon
  * Elastic overscroll with haptic feedback on threshold
  * Smooth snap-back animation
  * Loading state integration with Reanimated worklet
  * Inspiration: Twitter pull-to-refresh

* **Photo Expansion** (tap to zoom):
  * Shared element transition from thumbnail → fullscreen
  * Background blur + fade with backdrop
  * Pinch-to-zoom with Gesture Handler
  * Swipe-to-dismiss with velocity threshold
  * Gallery swipe (left/right for multiple photos)
  * Inspiration: Instagram photo viewer

* **Match Celebration** (when match occurs):
  * **Confetti burst** with Skia particles (500 particles, 3s duration)
  * **Profile photo zoom** with shared element transition
  * **Heart pulse** animation (scale 1.0 → 1.3 → 1.0 with spring)
  * **Sound effect** (subtle chime, optional)
  * **Haptic pattern** (double medium impact + notification success)
  * **Message prompt** slide-in from bottom
  * Inspiration: Tinder match celebration

* **Swipe Feedback** (during card swipe):
  * **Tilt + rotation** based on drag position (3D effect)
  * **Like/Pass icons** fade in on thresholds
  * **Haptic nudge** at decision threshold (50% swipe)
  * **Velocity-based throw** animation
  * **Elastic bounce** if released before threshold
  * **Next card preview** slides up underneath
  * Inspiration: Tinder swipe mechanics

* **Send Message Animation**:
  * **Bubble slide-in** from right with spring
  * **Checkmark progression**: sending → sent → delivered → read
  * **Typing indicator**: 3 bouncing dots with staggered delays
  * **Reaction picker**: long-press → emoji grid with scale animation
  * **Read receipt glow** on message bubble
  * Inspiration: iMessage/WhatsApp

* **Button Press States**:
  * **Scale down** (0.95) on press with haptic light
  * **Color shift** with gradient transition
  * **Loading spinner** replaces icon during async
  * **Success checkmark** morph animation
  * **Error shake** animation with red flash

* **Empty States** (no content):
  * **Animated illustration** with Lottie or Rive
  * **Friendly copy** with CTA button
  * **Subtle animation loop** (character waves, etc.)
  * Examples: "No matches yet", "Chat inbox empty", "No notifications"

* **Skeleton Loaders** (loading states):
  * **Shimmer effect** with gradient animation
  * **Content-aware shapes**: cards, lists, profiles
  * **Progressive reveal**: fade to real content
  * Everywhere: SwipeScreen, ChatScreen, ProfileScreen

### 8.2 Real-Time Features (Social Engagement)

**Implementation:**

* **Online/Offline Presence** (Socket.IO):
  * Green dot indicator on profiles/chat
  * Last seen timestamp ("Active 5m ago")
  * Privacy setting: show/hide status
  * Real-time updates via WebSocket

* **Typing Indicators** (chat):
  * "Sarah is typing..." with animated dots
  * Debounce typing events (500ms)
  * Multi-user support in group contexts

* **Read Receipts**:
  * Double checkmark (sent → delivered)
  * Eye icon or "Read" timestamp
  * Privacy toggle in settings

* **Live Swipe Counters** (gamification):
  * "3 people liked your profile today"
  * Real-time counter with count-up animation
  * Badge notifications on tab bar

* **Push Notifications** (rich & actionable):
  * **Rich media**: photo previews in notifications
  * **Action buttons**: "Reply", "Like", "Ignore"
  * **Grouped notifications**: "3 new matches"
  * **Delivery tracking**: sent, delivered, opened
  * Integration: Firebase Cloud Messaging + APNs
  * Deep linking: notification → specific screen with params

### 8.3 Performance Optimization (Instagram-Level Speed)

**Image Optimization:**

* **CDN integration**: Cloudinary or Imgix
* **Lazy loading**: load images as they enter viewport
* **Progressive loading**: blur-up technique (LQIP)
* **WebP/AVIF formats**: with PNG/JPEG fallback
* **Image compression**: client-side before upload (max 1MB)
* **Caching strategy**: aggressive cache with cache-busting
* **Responsive sizing**: multiple resolutions (thumb, medium, full)

**Code & Bundle Optimization:**

* **Code splitting**: route-based lazy loading (React.lazy + Suspense)
* **Tree shaking**: eliminate dead code
* **Minification**: Terser for production builds
* **Bundle analysis**: visualize with webpack-bundle-analyzer
* **Budget enforcement**: CI fails if bundle >15MB
* **Hermes engine**: enable for Android (faster startup)

**Network Optimization:**

* **GraphQL or tRPC**: typed API layer (replace REST)
* **Request batching**: combine multiple API calls
* **Debouncing**: search, autocomplete (300ms)
* **Caching**: TanStack Query with stale-while-revalidate
* **Compression**: gzip/brotli for API responses
* **HTTP/2**: server push for critical resources

**List Performance:**

* **Virtualization**: `FlashList` instead of `FlatList` (Shopify)
* **Windowing**: render only visible items + buffer
* **Item height estimation**: avoid layout shifts
* **Memoization**: `React.memo` on list items
* **Key extraction**: stable keys (IDs, not indexes)

### 8.4 Feature Flags & A/B Testing

**Infrastructure:**

* **Remote Config**: Firebase Remote Config or LaunchDarkly
* **Feature flags**:
  * `chat_reactions_enabled` (gradual rollout)
  * `premium_v2_ui` (A/B test)
  * `ai_moderation` (canary deployment)
  * `new_swipe_algorithm` (experiment)
* **Gradual rollouts**: 5% → 25% → 50% → 100%
* **Kill switches**: disable features remotely without deploy
* **User segments**: by country, premium status, app version
* **A/B testing**: measure conversion rates, engagement

**Implementation:**

* `@packages/feature-flags/` with typed flag definitions
* Hook: `useFeatureFlag('chat_reactions_enabled')` → boolean
* Admin UI: toggle flags, view rollout percentages
* Analytics integration: track flag exposures

### 8.5 Analytics & Monitoring (Data-Driven)

**Event Taxonomy (100+ events):**

**User Acquisition:**

* `app_opened`, `signup_started`, `signup_completed`, `onboarding_completed`

**Core Actions:**

* `profile_viewed`, `photo_uploaded`, `swipe_left`, `swipe_right`, `match_created`

**Engagement:**

* `chat_message_sent`, `reaction_added`, `voice_note_sent`, `profile_edited`

**Monetization:**

* `premium_viewed`, `subscription_started`, `payment_completed`, `premium_feature_used`

**GDPR:**

* `account_delete_requested`, `data_export_requested`, `privacy_policy_viewed`

**Analytics Providers:**

* **Amplitude**: product analytics, user journeys, retention cohorts
* **Mixpanel**: funnel analysis, A/B test results
* **Firebase Analytics**: basic event tracking, demographics
* **Custom**: BigQuery data warehouse for deep analysis

**User Properties:**

* `user_id`, `pet_type`, `premium_status`, `registration_date`, `location`, `app_version`

**Instrumentation:**

* Every button tap tracked
* Screen view durations measured
* Error rates by screen
* Performance metrics: load times, FPS

**Error Monitoring:**

* **Sentry**: real-time crash reporting
* **Source maps**: uploaded for stack trace symbolication
* **Breadcrumbs**: user actions leading to crash
* **Release tracking**: tag errors by app version
* **Alerts**: Slack/email on error spikes

**Performance Monitoring:**

* **Firebase Performance**: track screen load times, network requests
* **Custom metrics**: SwipeScreen render time, match algorithm duration
* **Vitals**: app startup time, frame rate, memory usage
* **Benchmarks**: compare across app versions

### 8.6 Onboarding & Engagement

**Interactive Tutorial:**

* **Welcome carousel**: 3-5 slides explaining app value
* **Interactive walkthrough**: swipe tutorial with dummy cards
* **Tooltips/Coach marks**: highlight features (first-time only)
* **Progressive disclosure**: show advanced features gradually
* **Skip option**: power users can skip

**Empty States (delightful):**

* **No matches**: "Your perfect match is coming! Keep swiping" + paw illustration
* **No messages**: "Start a conversation with your matches" + chat bubble animation
* **No notifications**: "All caught up!" + checkmark animation
* **No photos**: "Add photos to get more matches" + camera icon

**Gamification:**

* **Swipe streaks**: "5 days in a row!" with fire icon
* **Achievements**: "100 swipes", "First match", "Chat master"
* **Leaderboards**: most active users (optional, privacy-aware)
* **Daily challenges**: "Swipe on 10 profiles today"

### 8.7 Accessibility & Localization (Global-Ready)

**Full i18n Support:**

* **Languages**: English, Spanish, French, German, Japanese, etc.
* **Translation management**: Crowdin or Lokalise
* **String externalization**: zero hardcoded text
* **Pluralization**: handle singular/plural forms
* **Date/time formatting**: locale-aware
* **Currency**: format prices by region

**RTL Language Support:**

* **Layout mirroring**: Arabic, Hebrew
* **Text alignment**: auto-detect and flip
* **Icon direction**: arrows, chevrons reversed

**Dynamic Type Scaling:**

* **Respect system font size**: iOS/Android accessibility settings
* **Scale factors**: 1x, 1.5x, 2x
* **Layout adjustments**: avoid text truncation
* **Test at all scales**: Storybook with font size controls

**High Contrast Mode:**

* **Detect system setting**: `useColorScheme()` + `AccessibilityInfo`
* **Enhanced colors**: higher contrast ratios (WCAG AAA)
* **Border emphasis**: stronger outlines on buttons

**Screen Reader Optimization:**

* **VoiceOver (iOS) / TalkBack (Android)**: full support
* **ARIA labels**: descriptive for all interactive elements
* **Focus order**: logical tab sequence
* **Announcements**: "Match created!" for events
* **Hint text**: explain button actions

### 8.8 Media Handling (Instagram-Level)

**Photo Features:**

* **Filters**: 10+ photo filters (Valencia, Clarendon, etc.) with react-native-image-filter-kit
* **Crop & Rotate**: built-in editor with aspect ratio presets
* **Brightness/Contrast**: adjustment sliders
* **Gallery integration**: multi-select from camera roll
* **Camera integration**: in-app camera with front/back switch
* **Photo order**: drag-to-reorder profile photos

**Video Support:**

* **Video uploads**: max 30s, compressed to <10MB
* **Video player**: controls, scrubbing, mute toggle
* **Autoplay**: muted autoplay on profile view
* **Thumbnail generation**: extract first frame

**Advanced:**

* **Face detection**: auto-crop to center faces
* **EXIF stripping**: remove location metadata (privacy)
* **Aspect ratio enforcement**: square (1:1) for consistency

### 8.9 Offline Support & Resilience

**Offline Mode:**

* **Detect network status**: `NetInfo` listener
* **Queue actions**: swipes, messages, likes stored locally
* **Sync on reconnect**: replay queued actions
* **Cached content**: last fetched profiles/messages available offline
* **Offline indicator**: banner at top "You're offline"

**Error Recovery:**

* **Retry mechanism**: exponential backoff for failed requests
* **Offline-first**: optimistic UI updates, sync in background
* **Conflict resolution**: last-write-wins or manual merge
* **Data persistence**: SQLite or Realm for local database

### 8.10 Deep Linking & Sharing

**Deep Links:**

* **Universal links (iOS) / App Links (Android)**
* **Routes**: `pawfectmatch://profile/:userId`, `pawfectmatch://chat/:matchId`
* **Deferred deep linking**: install → open specific screen
* **Branch.io or Adjust**: attribution tracking

**Share Functionality:**

* **Share profile**: "Check out my pet on PawfectMatch!" + preview card
* **Invite friends**: referral program with unique link
* **Share to social**: Instagram Stories, Facebook, Twitter
* **QR codes**: scan to view profile

### 8.11 Production DevEx & Quality Assurance

**Comprehensive Storybook:**

* **All components**: primitives, screens, flows
* **Interaction states**: hover, pressed, disabled, loading, error
* **Responsive**: different screen sizes
* **Dark mode**: toggle in Storybook
* **Accessibility**: contrast checker, screen reader preview
* **Add-ons**: knobs, actions, viewport

**Visual Regression Testing:**

* **Chromatic or Percy**: automated screenshot comparison
* **Baseline**: capture approved UI states
* **PR checks**: visual diffs block merge if unapproved
* **Responsive**: test mobile, tablet, desktop

**E2E Test Coverage (Detox):**

* **Golden paths**: 10+ critical user journeys
  1. Signup → Onboarding → Profile creation
  2. Swipe → Match → Chat → Send message
  3. Premium purchase flow
  4. GDPR deletion flow
  5. Photo upload → Moderation
  6. Settings → Privacy toggles
  7. Notifications → Deep link
  8. Search/Filters
  9. Voice note recording
  10. Logout → Login

**Performance Budgets Enforced:**

* **CI checks**:
  * Bundle size: <15MB (fail if exceeded)
  * Lighthouse Performance: ≥90 (web)
  * Time to Interactive: <3s
  * First Contentful Paint: <1.5s
* **Mobile metrics**:
  * App startup: <2s to interactive
  * SwipeScreen render: <500ms
  * ChatScreen load: <1s
  * 60fps maintained: scroll, swipe, animations

**Automated Screenshots:**

* **Fastlane snapshot**: generate App Store screenshots
* **Localized**: screenshots in all supported languages
* **Device frames**: iPhone 15 Pro, Pixel 8
* **Marketing**: use in store listings

### 8.12 Deliverables Summary

**Production Infrastructure:**

* ✅ Feature flags with remote config
* ✅ A/B testing framework operational
* ✅ 100+ analytics events instrumented
* ✅ Sentry error monitoring live
* ✅ Performance monitoring dashboards
* ✅ Push notifications with deep linking

**UI/UX Polish:**

* ✅ Micro-interactions library (`@packages/micro-interactions`)
* ✅ Skeleton loaders on all screens
* ✅ Empty/error/loading states with personality
* ✅ Real-time presence, typing, read receipts
* ✅ Pull-to-refresh with custom spinner
* ✅ Photo viewer with zoom, swipe, filters

**Performance:**

* ✅ Image CDN integration (Cloudinary)
* ✅ FlashList for virtualized lists
* ✅ Code splitting and lazy loading
* ✅ Bundle size <15MB
* ✅ 60fps animations validated

**Global Readiness:**

* ✅ i18n support for 5+ languages
* ✅ RTL layout support
* ✅ Dynamic type scaling
* ✅ High contrast mode
* ✅ Screen reader optimized

**Quality Assurance:**

* ✅ Storybook with all components
* ✅ Visual regression tests (Chromatic)
* ✅ 10+ E2E test flows (Detox)
* ✅ Performance budgets enforced in CI
* ✅ Automated App Store screenshots

**Measurable Impact:**

* **User engagement**: +50% session duration (micro-interactions, gamification)
* **Retention**: +30% D7 retention (push notifications, streaks)
* **Performance**: 60fps maintained, <2s app startup
* **Error rate**: <0.1% crash-free sessions (Sentry monitoring)
* **Accessibility**: WCAG AAA compliance
* **Global reach**: 5+ languages, RTL support

---

## Phase 9. Production Operations & Scaling

**Agents:** Release Captain (RC), Security & Privacy Officer (SP), Performance Profiler (PP), API Contract Agent (API)
**Goal:** Build production infrastructure for scale, reliability, and business continuity
**Deliverables:** Auto-scaling backend, monitoring dashboards, deployment automation, disaster recovery plan, compliance documentation

### 9.1 Backend Infrastructure & Scaling

**Database Optimization:**

* **MongoDB indexes**: compound indexes on frequently queried fields (`userId`, `matchId`, `createdAt`)
* **Connection pooling**: maintain pool of 100 connections, auto-scale
* **Query optimization**: explain() all slow queries (>100ms), add indexes
* **Sharding strategy**: shard by `userId` for horizontal scaling
* **Read replicas**: 2+ replicas for read-heavy operations (profile views, matches)
* **Caching layer**: Redis for session data, match recommendations, hot profiles

**Redis Caching:**

* **Session storage**: user sessions, auth tokens (30-day TTL)
* **Match recommendations**: cache algorithm results (1-hour TTL)
* **Rate limiting**: sliding window counters per user/IP
* **Pub/Sub**: real-time messaging, online presence updates
* **Queue**: background jobs (email, push notifications, moderation)

**Server Scaling:**

* **Horizontal scaling**: 3+ Node.js instances behind load balancer
* **Auto-scaling**: CPU >70% → add instance; <30% → remove instance
* **Load balancer**: Nginx or AWS ALB with health checks
* **WebSocket clustering**: Socket.IO with Redis adapter for multi-server
* **Stateless services**: no server-side session state (use JWT)

**CDN & Asset Delivery:**

* **Cloudinary/Imgix**: image transformations, optimization, delivery
* **CloudFront/Fastly**: global CDN for static assets, API responses
* **Edge caching**: cache responses at edge locations (TTFB <50ms)
* **Compression**: Brotli for text, WebP for images
* **Invalidation**: purge cache on content updates

**Background Jobs:**

* **Queue system**: Bull (Redis-backed) or AWS SQS
* **Job types**:
  * Email sending (welcome, match notifications)
  * Push notifications (batched)
  * Photo moderation (AI + manual review)
  * Data export (GDPR requests)
  * Analytics aggregation
  * Match algorithm updates
* **Retry logic**: exponential backoff (3 retries, 1s → 5s → 25s)
* **Dead letter queue**: failed jobs for manual inspection

### 9.2 Observability & Monitoring

**Infrastructure Monitoring:**

* **Prometheus + Grafana**: metrics visualization
* **Metrics tracked**:
  * Server: CPU, memory, disk, network I/O
  * Database: query latency, connection pool, slow queries
  * Redis: hit rate, memory usage, evictions
  * API: response times (p50, p95, p99), error rates, throughput
* **Alerting**: PagerDuty or Opsgenie for critical alerts
* **Alert rules**:
  * API error rate >1% → page on-call
  * Database CPU >80% → alert
  * Server memory >90% → page immediately
  * Match algorithm failure → notify team

**Application Performance Monitoring (APM):**

* **New Relic or Datadog**: distributed tracing, transaction profiling
* **Trace requests**: end-to-end (mobile → API → database → response)
* **Bottleneck identification**: slow endpoints, N+1 queries, heavy computations
* **Custom instrumentation**: match algorithm duration, swipe latency

**Logging:**

* **Centralized logging**: ELK Stack (Elasticsearch, Logstash, Kibana) or Datadog Logs
* **Log levels**: ERROR, WARN, INFO, DEBUG
* **Structured logging**: JSON format with context (userId, requestId, timestamp)
* **Log retention**: 30 days hot, 90 days cold storage
* **Search & analysis**: query logs for debugging, user behavior analysis

**Synthetic Monitoring:**

* **Uptime checks**: Pingdom or UptimeRobot (1-min intervals)
* **Endpoints monitored**: `/health`, `/api/matches`, `/api/chat`, `/api/profile`
* **Geographic checks**: monitor from 5+ regions (US, EU, Asia)
* **Alert**: 3 consecutive failures → page on-call

**Real User Monitoring (RUM):**

* **Datadog RUM or LogRocket**: session replay, user journeys
* **Metrics**: page load time, API latency from user perspective
* **Error tracking**: JavaScript errors with stack traces
* **Funnel analysis**: drop-off points in signup, premium purchase

### 9.3 CI/CD & Deployment Automation

**Automated Pipelines:**

* **GitHub Actions or CircleCI**:
  * PR checks: lint, type-check, test, build, security scan
  * Main merge: deploy to staging automatically
  * Tag push: deploy to production with approval gate
* **Build matrix**: test on Node 18/20, multiple OS (Ubuntu, macOS)

**Deployment Strategies:**

* **Blue-Green**: maintain two identical environments, swap traffic
* **Canary**: deploy to 5% users → 25% → 50% → 100%
* **Rollback**: instant rollback on error spike or latency increase
* **Database migrations**: run migrations before code deploy, backward-compatible

**Infrastructure as Code (IaC):**

* **Terraform or Pulumi**: define all infrastructure in code
* **Version control**: track infra changes in Git
* **Environments**: dev, staging, production (isolated)
* **State management**: remote state (S3 + DynamoDB) with locking

**Secrets Management:**

* **Vault or AWS Secrets Manager**: rotate secrets automatically
* **Environment variables**: injected at runtime, never in code
* **Access control**: least privilege, audit logs

**Mobile App Releases:**

* **CodePush/EAS Update**: OTA updates for JS bundle changes
* **Native updates**: App Store/Play Store for native code changes
* **Phased rollout**: 5% → 25% → 50% → 100% over 7 days
* **Rollback**: instant rollback if crash rate >0.5%

### 9.4 Disaster Recovery & Business Continuity

**Backup Strategy:**

* **Database backups**:
  * Continuous: point-in-time recovery (5-min RPO)
  * Daily snapshots: retained for 30 days
  * Weekly backups: retained for 1 year
  * Geographic redundancy: replicate to different region
* **S3 backups**: user photos, videos (versioning enabled)
* **Configuration backups**: Redis snapshots, environment configs

**Disaster Recovery Plan:**

* **RTO (Recovery Time Objective)**: <2 hours
* **RPO (Recovery Point Objective)**: <5 minutes
* **DR runbook**: step-by-step recovery procedures
* **Failover**: automatic failover to secondary region (multi-region setup)
* **Testing**: quarterly DR drills, document results

**High Availability:**

* **Multi-region**: deploy to 2+ AWS regions (US-East, EU-West)
* **Database**: MongoDB Atlas multi-region cluster
* **Load balancer**: Route53 failover routing
* **Redundancy**: no single point of failure

**Incident Response:**

* **On-call rotation**: 24/7 coverage, weekly rotations
* **Incident commander**: designated leader per incident
* **Blameless postmortems**: document root cause, action items
* **Incident log**: timestamp all actions, decisions during incident

### 9.5 Security Hardening (Production-Grade)

**API Security:**

* **Rate limiting**:
  * Anonymous: 100 req/hour/IP
  * Authenticated: 1000 req/hour/user
  * Burst: allow 10 req/sec for 5 seconds
* **WAF (Web Application Firewall)**: Cloudflare or AWS WAF
* **DDoS protection**: Cloudflare Pro with automatic mitigation
* **IP allowlist**: restrict admin endpoints to VPN/office IPs

**Authentication Hardening:**

* **JWT rotation**: refresh tokens every 7 days
* **Token revocation**: blacklist compromised tokens in Redis
* **MFA (Multi-Factor Auth)**: TOTP for admin accounts
* **Session timeout**: 30-day for mobile, 7-day for web

**Data Encryption:**

* **At rest**: MongoDB encrypted storage, S3 server-side encryption
* **In transit**: TLS 1.3 only, HSTS enforced
* **Field-level**: encrypt PII fields (email, phone) with AES-256

**Penetration Testing:**

* **Annual pen test**: hire external security firm
* **Bug bounty**: HackerOne or Bugcrowd program
* **OWASP Top 10**: audit against latest threats
* **Compliance**: SOC 2 Type II (if enterprise customers)

### 9.6 Compliance & Legal (Global Readiness)

**GDPR (EU):**

* ✅ Right to erasure (Phase 1 implementation)
* ✅ Data portability (export user data)
* ✅ Privacy by design
* Cookie consent banner
* Data Processing Agreement (DPA) for vendors

**CCPA (California):**

* "Do Not Sell My Data" option
* Data disclosure on request
* Opt-out of data sharing

**COPPA (Children's Privacy):**

* Age gate: block users <13 (or <16 in EU)
* Parental consent flow (if allowing minors)

**App Store Compliance:**

* Apple Privacy Nutrition Labels
* Google Play Data Safety section
* Accurate permission justifications
* Terms of Service, Privacy Policy (lawyer-reviewed)

**Content Moderation:**

* AI moderation (OpenAI Moderation API, Azure Content Moderator)
* Human moderation queue (Moderation Dashboard in admin)
* Report/block functionality
* Community guidelines enforcement

### 9.7 Growth & Marketing Tools

**Attribution Tracking:**

* **Branch.io or Adjust**: install attribution, deep linking
* **UTM parameters**: track campaign performance
* **Conversion events**: signup, first match, premium purchase

**Referral Program:**

* **Unique referral links**: `pawfectmatch.com/r/[userId]`
* **Rewards**: free premium days for referrer + referee
* **Leaderboard**: top referrers (gamification)

**Email Marketing:**

* **SendGrid or Mailchimp**: transactional + marketing emails
* **Drip campaigns**:
  * Welcome series (days 1, 3, 7)
  * Re-engagement (inactive 7+ days)
  * Match notifications (batched daily)
  * Premium upsell (power users)
* **Unsubscribe**: one-click, honor immediately

**Push Notification Campaigns:**

* **Segmentation**: by activity level, premium status, location
* **A/B testing**: test message copy, timing
* **Opt-in tracking**: respect user preferences

**In-App Messaging:**

* **Intercom or Braze**: targeted messages, onboarding tips
* **Tooltips**: highlight new features
* **Announcements**: product updates, events

### 9.8 Customer Support Infrastructure

**Help Center:**

* **Zendesk or Intercom**: ticketing system
* **Knowledge base**: FAQs, troubleshooting guides
* **Chat support**: in-app chat widget (business hours)

**Automated Support:**

* **Chatbot**: answer common questions (password reset, how to match)
* **Smart routing**: route complex issues to human agents
* **Canned responses**: templates for common issues

**User Reporting:**

* **In-app reporting**: flag inappropriate content, users
* **Moderation queue**: prioritize by severity
* **Action tracking**: log all moderation actions (audit trail)

### 9.9 Financial Infrastructure

**Payment Processing:**

* **Stripe**: subscription management, one-time payments
* **Apple In-App Purchase**: iOS subscriptions (required)
* **Google Play Billing**: Android subscriptions (required)
* **Webhook handling**: verify signatures, idempotent processing

**Revenue Analytics:**

* **MRR (Monthly Recurring Revenue)**: track over time
* **Churn rate**: % cancellations per month
* **LTV (Lifetime Value)**: revenue per user
* **Cohort analysis**: retention by signup date

**Tax Compliance:**

* **Stripe Tax**: automatic tax calculation
* **VAT collection**: EU countries
* **Sales tax**: US states with nexus

### 9.10 Deliverables Summary

**Infrastructure:**

* ✅ Auto-scaling backend (3+ servers, load balanced)
* ✅ Redis caching layer (sessions, match recommendations)
* ✅ CDN integration (Cloudinary, CloudFront)
* ✅ Background job queue (Bull/SQS)
* ✅ Multi-region deployment (US, EU)

**Observability:**

* ✅ Prometheus + Grafana dashboards
* ✅ APM (New Relic/Datadog) with distributed tracing
* ✅ Centralized logging (ELK Stack)
* ✅ Synthetic monitoring (Pingdom)
* ✅ Real user monitoring (RUM)

**CI/CD:**

* ✅ Automated pipelines (lint → test → build → deploy)
* ✅ Blue-green/canary deployments
* ✅ Infrastructure as Code (Terraform)
* ✅ Secrets management (Vault/AWS Secrets Manager)

**Disaster Recovery:**

* ✅ Automated backups (daily snapshots, continuous replication)
* ✅ Multi-region failover
* ✅ DR runbook with quarterly testing
* ✅ <2h RTO, <5min RPO

**Security:**

* ✅ Rate limiting, WAF, DDoS protection
* ✅ JWT rotation, MFA for admins
* ✅ Encryption at rest & in transit
* ✅ Annual penetration testing

**Compliance:**

* ✅ GDPR, CCPA, COPPA compliant
* ✅ Privacy policy, terms of service
* ✅ Content moderation (AI + human)

**Growth & Support:**

* ✅ Attribution tracking (Branch.io)
* ✅ Email campaigns (SendGrid)
* ✅ Referral program
* ✅ Help center (Zendesk)
* ✅ Payment processing (Stripe)

**Measurable Impact:**

* **Uptime**: 99.9% SLA (< 8.76 hours downtime/year)
* **Latency**: p95 API response time <200ms
* **Scalability**: handle 10M users, 1M DAU
* **Recovery**: <2h disaster recovery time
* **Cost optimization**: auto-scaling reduces infrastructure costs 40%

---

# 🔍 COMPREHENSIVE ISSUES AUDIT - PawfectMatch
**Generated**: October 13, 2025  
**Last Updated**: 1:21 AM UTC+03:00

---

## 📊 EXECUTIVE SUMMARY

### Critical Stats
- **Web App Lint Errors**: 186 errors, 144 warnings
- **Mobile App Lint Errors**: 76 errors, 132 warnings
- **Web TypeScript Errors**: 381 errors across 87 files
- **Mobile TypeScript Errors**: 1,619 errors across 88 files
- **TODO/FIXME Comments**: 10+ active items in apps/
- **Type Safety Suppressions**: 42+ `@ts-ignore`/`@ts-expect-error` instances
- **Console Statements**: 664+ matches (debug code in production)

---

## 🚨 CRITICAL ERRORS

### 1. **Web Application** (`apps/web/`)

#### TypeScript Compilation Errors (381 total)

**Neural Network Hook** (`src/hooks/useNeuralNetwork.ts`)
- **12 errors**: Undefined array access, type mismatches
- Line 94: `sum` possibly undefined
- Lines 94-101: Network weights array access without null checks
- Line 205: Target/prediction arrays possibly undefined

**Admin Layout** (`app/(admin)/layout.tsx`)
- **1 error**: Line 439 - Type mismatch

**Stripe Page** (`app/(admin)/stripe/page.tsx`)
- **1 error**: Line 501 - Type error

**Users Page** (`app/(admin)/users/page.tsx`)
- **2 errors**: Line 64 - Type safety issues

**Login Page** (`app/(auth)/login/page.tsx`)
- **1 error**: Line 109 - Authentication flow type error

**AI Compatibility** (`app/(protected)/ai/compatibility/page.tsx`)
- **5 errors**: Line 60 - API response typing

**Chat Page** (`app/(protected)/chat/[matchId]/page.tsx`)
- **3 errors**: Line 105 - Message type handling

**Location Page** (`app/(protected)/location/page.tsx`)
- **1 error**: Line 163 - Geolocation typing

**Map Page** (`app/(protected)/map/page.tsx`)
- **2 errors**: Line 71 - Map data structures

**Matches Page** (`app/(protected)/matches/page.tsx`)
- **5 errors**: Line 28 - Match object typing

**Premium Page** (`app/(protected)/premium/page.tsx`)
- **6 errors**: Line 104 - Subscription types

**Swipe Page** (`app/(protected)/swipe/page.tsx`)
- **10 errors**: Line 35 - Card animation types

**Browse Page** (`app/browse/page.tsx`)
- **14 errors**: Line 79 - Multiple type violations

**Providers** (`app/providers.tsx`)
- **1 error**: Line 28 - Provider configuration

**UI Enhancements** (`components/admin/UIEnhancements.tsx`)
- **3 errors**: Line 362 - Component prop types

**Playwright Config** (`playwright.config.ts`)
- **4 errors**: Line 1 - Test configuration types

#### ESLint Errors (186 total)

**setupTests.js** (21 errors)
- Lines 21-172: Multiple `'jest' is not defined` (no-undef)
- Missing Jest globals configuration

**export.ts** (1 error)
- Line 274: Unexpected lexical declaration in case block (no-case-declarations)

**imageOptimization.tsx** (2 errors)
- Lines 362, 421: Missing rule definition `@next/next/no-img-element`

**test-all-pages.js** (1 error)
- Line 41: Unused variable `'data'` (no-unused-vars)

**Test Utils** (`src/tests/premium-test-utils.tsx`)
- Multiple unused variables: `TestProvidersProps`, `mockAuth`, `CustomRenderOptions`, animation props
- Line 431: `backgroundColor` assigned but never used

---

### 2. **Mobile Application** (`apps/mobile/`)

#### TypeScript Compilation Errors (1,619 total)

**Top Error Files:**

**Pet Profile Setup** (`src/screens/onboarding/PetProfileSetupScreen.tsx`)
- **174 errors**: Massive type safety violations
- Form validation types missing
- Pet data structure mismatches

**Welcome Screen** (`src/screens/onboarding/WelcomeScreen.tsx`)
- **163 errors**: Animation configuration types
- Easing function type mismatches

**Adoption Contract** (`src/screens/adoption/AdoptionContractScreen.tsx`)
- **128 errors**: Contract data typing issues

**Adoption Manager** (`src/screens/adoption/AdoptionManagerScreen.tsx`)
- **88 errors**: State management type conflicts

**Matches Screen Calling** (`src/screens/__tests__/MatchesScreen.calling.test.tsx`)
- **74 errors**: Mock/test type setup

**Incoming Call Screen** (`src/screens/calling/IncomingCallScreen.tsx`)
- **67 errors**: WebRTC typing issues

**WebRTC Service** (`src/services/WebRTCService.ts`)
- **9 errors**: Line 530 - MediaStream type conversions
- Line 791: Event stream type casting

**Deep Linking Tests** (`src/utils/__tests__/deepLinking.test.ts`)
- **8 errors**: `parseDeepLink` not found - missing implementation

#### ESLint Errors (76 total)

**setupTests.js** (44 errors)
- Lines 5-89: All Jest globals undefined (no-undef)

**Notifications Service** (`src/services/notifications.ts`)
- **3 errors**: Lines 381-384 - React Hooks called in non-component function `_useNotifications`

**Push Notification Service** (`src/services/pushNotificationService.ts`)
- **1 error**: Line 536 - Duplicate method name `getFCMToken` (no-dupe-class-members)

---

## ⚠️ WARNINGS

### Web Application Warnings (144 total)

**React Hook Dependency Issues:**
- `useEnhancedSocket.ts` (Lines 331, 360, 381): Missing dependencies
- `useNeuralNetwork.ts` (Lines 114, 129): Missing activation/feature extraction functions
- `useOffline.ts` (Lines 55, 111): Missing `updateStatus` dependency
- `usePredictiveTyping.ts` (Line 91): Missing `tokenize` dependency

**Unused Variables:**
- `useOptimizedAuth.ts` (Line 95): `error` defined but never used
- `useOptimizedChat.ts` (Line 97): `error` defined but never used
- `useOptimizedSwipe.ts` (Line 109): `error` defined but never used
- `api.ts` (Line 261): `_params` assigned but never used
- `component-tests.tsx` (Line 207): `error` defined but never used

**Unused ESLint Directives:**
- `usageTracking.ts` (Line 63): Unused `eslint-disable` for `@typescript-eslint/no-extraneous-class`

### Mobile Application Warnings (132 total)

**Unused Imports:**
- Multiple screens: `Easing` imported but never used
- Width/height from Dimensions unused in several screens

**Missing Dependencies:**
- `onboarding/PetProfileSetupScreen.tsx`: 15+ animation refs missing from dependency arrays
- `onboarding/WelcomeScreen.tsx`: 12+ animation values missing

**Unused Variables:**
- `premium/PremiumScreen.tsx` (Line 101): `user` assigned but never used
- `premium/SubscriptionManagerScreen.tsx` (Lines 6, 38): `api` and `user` unused
- `BiometricService.ts` (Line 346): `signature` parameter unused

---

## 📝 TECHNICAL DEBT

### TODO Comments

**Web Application:**

1. **analytics-system.ts** (Line 484)
   ```typescript
   // TODO: Move to a separate HOC file or refactor
   // HOC for automatic tracking disabled due to Next.js compilation issues
   ```

2. **settings/page.tsx** (Line 63)
   ```typescript
   // TODO: Implement password login fallback
   ```

3. **login/page.tsx** (Line 29)
   ```typescript
   // TODO: Add navigation after login
   ```

4. **admin-dashboard/page.tsx** (Lines 1083, 1317)
   ```typescript
   // TODO: Implement report viewer navigation
   // TODO: Implement alert details navigation
   ```

5. **(admin)/dashboard/page.tsx** (Line 480)
   ```typescript
   // TODO: Implement export functionality
   ```

**Mobile Application:**

1. **constants/design-tokens.ts** (Line 7)
   ```typescript
   // TODO: Re-export from unified design tokens package once built
   ```

### STUB/MOCK/PLACEHOLDER Comments

1. **__mocks__/framer-motion.ts**
   ```typescript
   // FRAMER MOTION MOCK - Testing Stub
   // Provides basic component stubs for animation testing
   ```

---

## 🔒 TYPE SAFETY VIOLATIONS

### @ts-ignore / @ts-expect-error Usage (42+ instances)

**Web Application:**

1. **premium-test-utils.tsx** (Lines 283, 285)
   ```typescript
   // @ts-ignore
   global.AudioContext = jest.fn(() => mockAudioContext);
   ```

2. **WebRTCService.ts** (Line 106)
   ```typescript
   // @ts-ignore - TypeScript doesn't recognize getDisplayMedia on mediaDevices
   this.screenShareStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
   ```

3. **useFormValidation.ts** (Line 32)
   ```typescript
   // @ts-ignore - We need to override the setValue method
   form.setValue = function <TFieldName extends Path<T>>(...)
   ```

4. **analytics-system.ts** (Lines 98-101, 307-310)
   ```typescript
   // @ts-ignore
   if (performance.memory) {
     // @ts-ignore
     const {memory} = performance;
   ```

5. **performance.ts** (Lines 300-303, 358-361)
   ```typescript
   // @ts-expect-error - performance.memory is Chrome-specific
   // @ts-expect-error - navigator.connection is experimental API
   ```

6. **codeSplitting.tsx** (Line 41)
   ```typescript
   {/* @ts-expect-error: Forwarding ref to lazy component may cause type issues */}
   ```

7. **.next/types/validator.ts** (42+ matches)
   ```typescript
   // @ts-ignore
   type __Unused = __Check
   ```
   - Appears in every page validation - Next.js generated

### `any` Type Usage (723+ instances across 139 files)

**High-Impact Files:**

1. **validator.ts**: 15 instances (Next.js generated, acceptable)
2. **expo-components.d.ts**: 13 instances (type definition file)
3. **useSocket.test.ts**: 14 instances (test mocks)
4. **AnalyticsVisualization.tsx**: 11 instances (chart data)
5. **MessageBubble.tsx**: 11 instances (message content)

---

## 🐛 CONSOLE STATEMENTS (664+ matches)

### High-Frequency Files:

1. **run-calling-tests.js** (48 console statements)
2. **pushNotificationService.ts** (29 console statements)
3. **AdvancedNotificationService.ts** (22 console statements)
4. **sw.js** (19 console statements - service worker)
5. **offlineService.ts** (17 console statements)
6. **useSocket.ts** (13 console statements)
7. **notifications.ts** (13 console statements)
8. **component-tests.tsx** (13 console statements)

**Action Required**: Replace with proper logger service throughout codebase.

---

## 🚫 DISABLED LINT RULES

### ESLint Disable Directives:

1. **useEnhancedSocket.ts** (Line 213)
   ```typescript
   // eslint-disable-next-line react-hooks/exhaustive-deps
   ```

2. **usageTracking.ts** (Line 63)
   ```typescript
   // eslint-disable-next-line @typescript-eslint/no-extraneous-class
   ```

3. **CompatibilityAnalyzer.tsx** (Line 140)
   ```typescript
   // eslint-disable-next-line react-hooks/exhaustive-deps
   ```

4. **Header.test.tsx** (Line 39)
   ```typescript
   // eslint-disable-next-line jsx-a11y/alt-text
   ```

5. **imageOptimization.tsx** (Lines 362, 421)
   ```typescript
   // eslint-disable-next-line @next/next/no-img-element
   ```

6. **Coverage files** (multiple)
   ```javascript
   /* eslint-disable */
   ```
   Files: `sorter.js`, `prettify.js`, `block-navigation.js`

7. **billing/page.tsx** (Line 99)
   ```typescript
   }, [dateRange]); // eslint-disable-line react-hooks/exhaustive-deps
   ```

8. **chat/[matchId]/page.tsx** (Line 102)
   ```typescript
   // eslint-disable-next-line react-hooks/exhaustive-deps
   ```

---

## 🎯 PRIORITY RECOMMENDATIONS

### P0 - Critical (Must Fix Immediately)

1. **Fix setupTests.js Jest Configuration**
   - Add Jest globals to ESLint config
   - Impact: 65 errors (21 web + 44 mobile)

2. **Fix Notifications Hook Violations**
   - Rename `_useNotifications` to `useNotifications` or extract logic
   - Impact: 3 critical React violations

3. **Remove Duplicate Method in pushNotificationService**
   - Fix `getFCMToken` duplication
   - Impact: Runtime errors possible

4. **Address Neural Network Type Safety**
   - Add proper null checks for array access
   - Impact: 12 errors, potential runtime crashes

### P1 - High Priority (Fix This Sprint)

1. **Replace All Console Statements**
   - Implement logger service usage across 664+ locations
   - Impact: Production debugging, security

2. **Fix Mobile Onboarding TypeScript Errors**
   - PetProfileSetupScreen: 174 errors
   - WelcomeScreen: 163 errors
   - Impact: Build failures, type safety

3. **Resolve React Hook Dependencies**
   - Add missing dependencies or mark as stable
   - Impact: 15+ warnings, potential stale closures

4. **Remove @ts-ignore Suppressions**
   - Add proper type definitions for experimental APIs
   - Impact: 42+ type safety violations

### P2 - Medium Priority (Fix Next Sprint)

1. **Implement All TODO Items**
   - Export functionality (admin dashboard)
   - Navigation flows (login, reports, alerts)
   - Password login fallback
   - Impact: Missing features

2. **Type Safety Audit**
   - Replace 723+ `any` types with proper interfaces
   - Impact: Long-term maintainability

3. **Clean Up Unused Variables**
   - Remove or use 50+ flagged variables
   - Impact: Code quality, bundle size

### P3 - Low Priority (Technical Debt)

1. **Refactor Design Tokens**
   - Migrate to unified package
   - Impact: Consistency across platforms

2. **Fix ESLint Directive Overuse**
   - Properly configure rules instead of disabling
   - Impact: Code quality standards

---

## 📋 IMPLEMENTATION CHECKLIST

### Week 1: Critical Fixes
- [ ] Configure Jest globals in ESLint
- [ ] Fix React Hook violations in notifications
- [ ] Remove duplicate `getFCMToken` method
- [ ] Add null checks to neural network hook
- [ ] Fix setupTests.js in both apps

### Week 2: Type Safety
- [ ] Audit and fix mobile onboarding screens
- [ ] Replace top 20 `@ts-ignore` instances
- [ ] Add proper type definitions for experimental APIs
- [ ] Fix WebRTC type conversions

### Week 3: Code Quality
- [ ] Replace console statements with logger (phase 1: critical files)
- [ ] Fix React Hook dependencies
- [ ] Remove unused variables
- [ ] Clean up test type violations

### Week 4: Technical Debt
- [ ] Implement all TODO items
- [ ] Replace remaining console statements
- [ ] Audit and reduce `any` type usage by 50%
- [ ] Review and fix disabled ESLint rules

---

## 🔬 DETAILED ERROR BREAKDOWN

### Error Distribution by Category

| Category | Web Errors | Mobile Errors | Total |
|----------|-----------|---------------|-------|
| Type Safety | 381 | 1,619 | 2,000 |
| Linting | 186 | 76 | 262 |
| Warnings | 144 | 132 | 276 |
| Type Suppressions | 42+ | TBD | 42+ |
| Console Statements | 664+ | Included | 664+ |

### Files Requiring Immediate Attention

**Web:**
1. `src/hooks/useNeuralNetwork.ts` (12 errors)
2. `app/browse/page.tsx` (14 errors)
3. `app/(protected)/swipe/page.tsx` (10 errors)
4. `src/setupTests.js` (21 errors)

**Mobile:**
1. `src/screens/onboarding/PetProfileSetupScreen.tsx` (174 errors)
2. `src/screens/onboarding/WelcomeScreen.tsx` (163 errors)
3. `src/screens/adoption/AdoptionContractScreen.tsx` (128 errors)
4. `src/screens/adoption/AdoptionManagerScreen.tsx` (88 errors)
5. `src/setupTests.js` (44 errors)

---

## 🚀 AUTOMATED FIX OPPORTUNITIES

### Can Be Auto-Fixed with `--fix`
- 2 warnings (from lint output)
- ESLint formatting issues
- Some unused variable removals

### Require Manual Intervention
- All TypeScript errors (2,000+)
- React Hook dependency arrays
- Type definition additions
- Console statement replacements
- TODO implementations

---

## 📊 METRICS & TRACKING

### Success Criteria
- **Target**: Zero TypeScript compilation errors
- **Target**: < 50 ESLint warnings
- **Target**: Zero `@ts-ignore` in production code
- **Target**: Zero console statements in production code
- **Target**: < 100 `any` types across codebase

### Current Progress
- ✅ Centralized error handling implemented
- ✅ Type safety improved in core services
- ⏳ Mobile app type safety: 50% complete
- ⏳ Console statement cleanup: 0% complete
- ⏳ React Hook fixes: 20% complete

---

## 📞 NEXT ACTIONS

1. **Run Commands**:
   ```bash
   # After fixes
   cd apps/web && npm run lint
   cd apps/mobile && npm run lint
   cd apps/web && npx tsc --noEmit
   cd apps/mobile && npx tsc --noEmit
   ```

2. **Monitor Progress**:
   - Track error count reduction weekly
   - Review new `@ts-ignore` additions in PR reviews
   - Enforce logger usage in code reviews

3. **Documentation**:
   - Update this audit monthly
   - Document type definition additions
   - Maintain changelog of major fixes

---

**Document maintained by**: Development Team  
**Review Schedule**: Weekly during sprint planning  
**Last Audit Run**: October 13, 2025 @ 1:21 AM UTC+03:00


⚠️ Remaining Issues: The codebase has 1924 TypeScript errors in 116 files, primarily:

Matcher compatibility issues (Jest vs Chai) in various test files
Missing imports and type definitions
Component test files with broken references
Strategy overview
Triage by category and fix at the source: assertion compatibility, imports/module refs, test harness gaps, corrupted tests, external service mocks, and types.
Introduce shared, typed test utilities and adapters to standardize behavior and reduce churn.
Replace Jest-only matchers with a thin compatibility layer (Chai adapters) to avoid repetitive edits.
Add type-safe builders for common domain objects to eliminate ad-hoc incomplete literals.
Validate in tight loops: tsc → unit tests → lint → a small smoke run of UI tests.
Work plan and sequencing
Wave 1: Inventory and adapters
Wave 2: Fix infrastructure (test-utils, tsconfig, globals)
Wave 3: Systematic codemod pass for matchers and imports
Wave 4: Refactor corrupted tests and stabilize harness for components/hooks
Wave 5: External service mocks and integration tests
Wave 6: Final polish, quality gates, and documentation
Wave 1 — Error audit and categorization
Contract:

Inputs: tsc output, current test files
Output: Categorized list (matchers, imports/undefined symbols, broken JSX/refs), top 20 offenders, file counts
Actions:

Parse the TypeScript error output into buckets:
Assertion mismatch: toBeInTheDocument, toHaveClass, toBe, toEqual, toStrictEqual, toThrow, toContain, toMatchSnapshot, etc.
Missing imports or unresolved symbols: logger, ApiService, useX hooks, MemoryRouter, React types, Testing Library helpers.
Broken component tests: invalid props, forwardRef misuse, incorrect JSX returns (void), unsafe DOM access.
Environment globals: Notification, TransformStream, ResizeObserver, IntersectionObserver.
Prioritize by:
High-churn matchers (global replacement via adapters/codemods)
Central harness gaps (shared test-utils)
High-value suites (admin dashboard, NotificationService, services)
Success criteria:

Clear inventory with counts and priority ordering to guide codemod and refactor waves.
Wave 2 — Standardize test harness and environment
Contract:

Inputs: apps/web test setup, tsconfig, jest config
Output: Shared test-utils, environment shims ready
Actions:

Create apps/web/test/test-utils.ts:
Re-export render, screen, userEvent, fireEvent, within from Testing Library
Add typed renderWithProviders for common providers (Router, QueryClientProvider, Zustand mock store)
Include helpers for safe class checks: hasClass(el, className), guards for null elements
Add apps/web/test/expectAdapters.ts:
Map common Jest matchers to Chai-style assertions or boolean guards:
toBe → equal
toEqual/toStrictEqual → deep.equal
toBeInTheDocument → Boolean(el)
toHaveClass → el.classList.contains
toThrow → wrap in function and assert throw
toContain → include (string/array detection)
toMatchSnapshot → defer/remove or replace with semantic assertions (avoid snapshot reliance)
Provide functions, not monkey-patching expect. Keep explicit usage: expectEqual, expectDeepEqual, expectInDocument, expectHasClass
Environment shims for tests:
Global definitions in setupTests.ts (already likely present): add safe shims for ResizeObserver, IntersectionObserver, Notification, and confirm TransformStream if any web code relies on it
Success criteria:

Component tests can import from test-utils and expectAdapters to avoid per-file matcher churn.
Wave 3 — Codemod matcher replacements and imports
Contract:

Inputs: target test directories and known matcher patterns
Output: Systematic replacement to adapter calls and fixed imports
Actions:

Matcher codemod (scoped to test files):
Replace: expect(el).toBeInTheDocument() → expectInDocument(el)
Replace: expect(el).toHaveClass('foo') → expectHasClass(el, 'foo')
Replace: expect(value).toBe(x) → expectEqual(value, x)
Replace: expect(obj).toEqual(obj2) → expectDeepEqual(obj, obj2)
Replace: expect(fn).toThrow() → expectThrows(fn) (adapter wrapping)
Keep awareness of negation: .not. → pass a negation flag or invert assertions in adapter
Imports fix:
Ensure all component tests import render, screen from test-utils instead of direct Testing Library to centralize behavior
Fix router usage: use MemoryRouter or renderWithProviders({ router: true }) consistently; avoid mismatched route props
Add missing React or JSX type imports only where necessary; prefer modern JSX runtime with tsconfig support
Remove snapshot tests or rewrite to semantic assertions, aligned with premium UX rules (no placeholder snapshots)
Success criteria:

After codemod, TypeScript errors from matcher incompatibilities drop substantially (target: >60% reduction).
Wave 4 — Refactor corrupted tests and stabilize components/hooks
Contract:

Inputs: corrupted files and brittle tests
Output: Clean, atomic, type-safe tests
Actions:

Identify corrupted tests (mixed code in object literals, broken blocks):
Fully rewrite with clear AAA (Arrange, Act, Assert) structure
Ensure return types from small inline components are JSX.Element
Guard DOM traversals: null checks before .classList, .textContent access
Remove variable redeclarations; keep test-scoped variables unique
Hooks tests:
Provide minimal providers: React Query client, Zustand store, Auth/Router contexts
Use renderHook from Testing Library hooks and wrap providers with wrapper option
Component test harness standard:
Use renderWithProviders across admin dashboard, layout, animation components
Fix forwardRef tests: ensure ref-target elements exist and are stable
Framer Motion elements: assert structural presence and variant props using semantic checks (no reliance on animation timing)
Success criteria:

Admin and critical UI tests compile and run with adapters, no invalid JSX, no null-safety issues.
Wave 5 — External service mocks and integration tests
Contract:

Inputs: services: api.ts, logger.ts, NotificationService, Stripe/WebRTC/service-worker
Output: Typed mocks and minimal interfaces for tests
Actions:

ApiService:
Define a typed jest mock factory with only the methods used by tests (e.g., get, post, fetchRecommendations)
Ensure mock aligns to actual exports (class vs instance). Prefer dependency injection via constructor or module-level jest.mock
Logger:
Mock a logger instance with info, warn, error as vi.fn()/jest.fn() depending on test runner; keep type signatures aligned
Notification and window:
Mock window.Notification with constructor and permission flags
Mock window.location or use URL APIs for tests requiring navigation parsing
Stripe/WebRTC/Service worker:
Provide minimal stubs (typed) in setupTests to prevent runtime errors while keeping behavior neutral
Playwright e2e:
Confirm global polyfills already sufficient; avoid adding mocks in unit test layer that conflict with e2e
Success criteria:

Service-layer tests run without stubbing behaviors beyond interface conformity; assertions validate real logic and error paths.
Wave 6 — Type-safe builders and data fixtures
Contract:

Inputs: domain types (Pet, Recommendation, User)
Output: Reusable factories to eliminate incomplete object literals
Actions:

Add apps/web/test/factories/*:
PetFactory: returns a fully-typed Pet with sensible defaults; allow overrides via partials
RecommendationFactory, UserFactory similarly
Use factories across tests to avoid TypeScript errors from missing fields and make test intent readable
Success criteria:

Tests no longer fail on partial data; modifications are localized via overrides.
Wave 7 — tsconfig and test-env alignment
Contract:

Inputs: tsconfig.base.json, jest configs
Output: Correct includes/excludes and DOM libs present
Actions:

Verify tsconfig for tests includes "lib": ["DOM", "ES2021"] or similar
Ensure types includes jest or vitest consistent with runner; add ambient type declarations only where necessary (avoid ad-hoc d.ts pollution)
Confirm baseUrl/paths mapping resolves test imports cleanly
Success criteria:

Typechecker recognizes test environment; path alias resolution is consistent.
Wave 8 — Targeted suites
Focus files:

page.test.tsx
NotificationService tests
Admin components and pages suites with router/context reliance
Actions:

Apply adapters and renderWithProviders locally
Fix MemoryRouter usage: initialEntries + routes when asserting navigation
Add null checks around elements and class assertions
Logger expectations: assert calls with meaningful messages, not call counts only
Success criteria:

These suites compile and run green, validating approach on representative complex tests.
Wave 9 — Quality gates and CI validation
Contract:

Inputs: full repo
Output: Green typecheck, unit tests passing, lint clean
Actions:

Run:
Typecheck (no emit)
Unit tests
ESLint (auto-fix safe issues)
Fix remaining edge cases:
Flaky timers: use fakeTimers only if necessary; otherwise assert stable outputs
Async tests: ensure proper await on findBy* queries; avoid race conditions
Documentation:
Short TESTING_CONVENTIONS.md explaining adapters, test-utils, factories, and environment shims
Success criteria:

0 TypeScript errors; tests pass reliably; lint passes; minimal and clear testing conventions committed.
Risk management and edge cases
Negated expectations: .not. handling requires careful adapter design; where ambiguous, rewrite to explicit boolean assertions.
Snapshot reliance: discouraged per premium UX rules; replace with semantic assertions on structure, classes, and text.
Animation timing: avoid reliance on frame timing; assert presence/variants only.
Router/context: ensure provider wrappers are consistent; avoid custom routers per test unless necessary.
Acceptance criteria
All previously failing matcher assertions replaced via adapters or equivalent boolean checks.
No missing imports or undefined symbols in tests.
All component/hook tests use shared test-utils and are null-safe.
External services mocked with typed minimal interfaces; no suppression.
Type-safe factories used for domain data.
TypeScript errors reduced from 1924 to 0; unit tests pass; lint clean.
What’s next
Implement the shared test-utils and expectAdapters, then start a focused pass on admin dashboard and NotificationService tests (including the currently open page.test.tsx) using the adapters and providers.
After the first batch, run a typecheck to confirm error reduction and iterate through remaining suites by priority.
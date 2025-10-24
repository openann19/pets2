# PawfectMatch Premium – Production Readiness TODO (Zero Errors • No Stubs • No Suppressions)

> Goal: Bring the entire monorepo to “production-ready” with zero TypeScript errors, no production stubs, and no type suppressions. This document is prescriptive: it lists every known issue, exact fixes, edge cases, and acceptance criteria. Execute tasks in order unless stated otherwise.

- Scope: Monorepo (web, mobile, ui, core, server, ai) with Turborepo + pnpm
- Constraints: No mass script hacks, no stubs in production code, no `@ts-ignore`/`// eslint-disable`, no deep imports from dist. All fixes must be typed and verified.
- Definition of Done (DoD):
  - TypeScript: 0 errors across all workspaces
  - ESLint: 0 errors (warnings addressed or rules configured, not suppressed inline)
  - Tests: Unit, integration, e2e pass locally (within project scope). jest-dom matchers properly typed.
  - CI quality gates pass (type, lint, test; bundle/perf monitored)
  - No “unknown as …” casts in shared UI components; Motion wrappers correctly typed.

---

## 1) Cross-Cutting Setup & Hygiene

1.1 Root tsconfig exclusions (DONE)
- Ensure `.github/**`, Cypress, and all test/spec files are excluded from the root ts project so they don’t leak types across workspaces.
- Why: Prevents Chai/Cypress globals (Assertion) from polluting Jest tests.

Acceptance:
- Root `tsconfig.json` excludes: `.github/**`, `**/cypress/**`, `**/*.cy.*`, `**/*.test.*`, `**/*.spec.*`, `**/e2e/**`.

1.2 ESLint test globals (REQUIRED)
- Add Jest globals to ESLint configs for web and mobile test files so lint noise is eliminated without inline disables.
- Add a dedicated override for `**/*.test.{ts,tsx,js,jsx}` and `**/jest.setup.{ts,js}` with Jest globals.

Acceptance:
- Running `pnpm -w lint:check` reports 0 errors in test files.

1.3 Shared Library Consumption (REQUIRED)
- Rule: No deep imports from `@pawfectmatch/core/dist/**`. Always import from top-level `@pawfectmatch/core`.
- If a type isn’t exported, add it to `packages/core/src/index.ts` and rebuild.

Acceptance:
- Grep for “/dist/” references. None outside build tooling.

Edge cases:
- Be careful with path mapping in tsconfig. Keep `@pawfectmatch/core` mapped to dist outputs only, not subpaths.

---

## 2) Web App (apps/web) – Type Safety & Tests

2.1 Jest + jest-dom typings (DONE for favorites test; ensure repo-wide)
- Ensure `apps/web/tsconfig.test.json` includes types: `jest`, `@testing-library/jest-dom`, `node`.
- Include test files and their imported sources (`src/**/*.ts|tsx`, `app/**/*.ts|tsx`).
- Ensure `.github/**` excluded at root to avoid markdown parsing noise.

Acceptance:
- `favorites/page.test.tsx` resolves matchers like `toBeInTheDocument`, `toHaveFocus`.
- No “Assertion” type from Chai visible in Jest test typings.

2.2 Playwright env access (DONE in e2e/auth.spec.ts)
- Use bracket notation: `process.env['VAR']` to satisfy `noPropertyAccessFromIndexSignature`.

2.3 Residual TypeScript errors in pages
- File: `apps/web/app/(protected)/matches/page.tsx` (previous scan showed errors around L108–L112)
- Action: Open and resolve specific TS errors:
  - If optional props cause `exactOptionalPropertyTypes` failures, avoid passing `undefined` values; conditionally spread props instead.
  - Guard browser APIs (window, document) for RSC/SSR.

Edge cases:
- Handle undefined router/search params safely.
- Avoid object spreads with undefined values; filter or conditionally spread.

Acceptance:
- `pnpm -w --filter ./apps/web type-check` passes after UI package is green.

2.4 Story components linkage (CONFIRMED)
- `StoryViewer.tsx` correctly imports `StoryProgress.tsx`. Keep paths stable.

---

## 3) UI Package (packages/ui) – Motion Typings & Utilities [BLOCKER]

Problem summary:
- Dozens of type errors due to Framer Motion prop incompatibilities and style typing.
- Ad-hoc casts like `as unknown as Exclude<MotionProps['whileHover'], undefined>` appear (example: `PremiumButton`). These must be eliminated.
- Test utils have incorrect `matchMedia` mock signature and missing jest-dom matcher types.

3.1 Establish strict, typed Motion wrappers (REQUIRED)
- File: `packages/ui/src/utils/Motion.tsx` (or create it if not canonical)
- Provide typed wrappers for elements used (div, button, span, etc.) and typed helpers for `whileHover`, `whileTap`, `initial`, `animate`, `transition`.
- Introduce utility types:
  - `type HoverAnim = NonNullable<import('framer-motion').MotionProps['whileHover']>;`
  - `type TapAnim = NonNullable<import('framer-motion').MotionProps['whileTap']>;`
  - Export factory functions that return properly typed animation variants to avoid casting at call sites.

Example pattern:
```ts
// utils/motionTypes.ts
import type { MotionProps } from 'framer-motion';
export type HoverAnim = NonNullable<MotionProps['whileHover']>;
export type TapAnim = NonNullable<MotionProps['whileTap']>;

export function makeHover(v: HoverAnim): HoverAnim { return v; }
export function makeTap(v: TapAnim): TapAnim { return v; }
```
Use:
```ts
import { makeHover, makeTap } from '../utils/motionTypes';
// ...
whileHover={makeHover(hoverVariants.glow)}
whileTap={makeTap(tapVariants.press)}
```

Acceptance:
- No `unknown as` or `Exclude<...>` casts remain in UI components for Motion props.

3.2 Style typing merge for MotionStyle + CSSProperties (REQUIRED)
- Define a helper type and merger function:
```ts
import type { MotionStyle } from 'framer-motion';
export type StyleMerge = MotionStyle & React.CSSProperties;
export const style = (s: StyleMerge): StyleMerge => s;
```
Use in components:
```ts
style={style({ x: springX, y: springY, ...variantStyles, ...sizeStyles })}
```
- Replace ad-hoc `as MotionStyle & React.CSSProperties` with this utility.

Acceptance:
- No ad-hoc style casts in UI.

3.3 PremiumButton cleanups (REQUIRED)
- File: `packages/ui/src/components/Premium/PremiumButton.tsx`
- Replace `whileHover`/`whileTap` casts with typed helpers from 3.1.
- Replace style cast with `style()` utility from 3.2.
- Keep magnetic effect values typed: `x`/`y` are MotionValue<number>; `springX`, `springY` are compatible with MotionStyle.x/y.
- Guard AudioContext and vibrate behind feature checks (already done). Ensure SSR guards remain (`typeof window === 'undefined'`).
- Ensure `role` and `aria-disabled` vs `disabled` semantics are correct:
  - If `disabled`, ensure `aria-disabled` is true and `tabIndex` is -1 to avoid focus traps, unless design mandates focusable disabled.

Edge cases:
- Disabled state: No hover/tap animations or haptics/sounds should fire.
- Loading state: Content opacity vs overlay spinner timing.
- Holographic variant: Scoped keyframes via <style> are fine; ensure no SSR mismatch.

Acceptance:
- `PremiumButton` has zero casts and compiles cleanly.

3.4 Test utils: matchMedia mock signature + jest-dom types (REQUIRED)
- File: `packages/ui/src/test-utils/enhanced.ts`
  - Fix mock:
```ts
type MediaQueryListLike = {
  matches: boolean;
  media: string;
  onchange: ((this: MediaQueryList, ev: MediaQueryListEvent) => any) | null;
  addListener: (listener: (this: MediaQueryList, ev: MediaQueryListEvent) => any) => void; // deprecated
  removeListener: (listener: (this: MediaQueryList, ev: MediaQueryListEvent) => any) => void; // deprecated
  addEventListener: (type: 'change', listener: (this: MediaQueryList, ev: MediaQueryListEvent) => any) => void;
  removeEventListener: (type: 'change', listener: (this: MediaQueryList, ev: MediaQueryListEvent) => any) => void;
  dispatchEvent: (event: Event) => boolean;
};

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string): MediaQueryListLike => ({
    matches: query.includes('prefers-reduced-motion'),
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => true,
  }),
});
```
  - Ensure the file or its tsconfig includes `@testing-library/jest-dom` types so `toHaveClass`, etc., are recognized.

Acceptance:
- UI package test utilities compile with zero TS errors and matchers are typed.

3.5 Replace any remaining Motion prop incompatibilities (REQUIRED)
- Common pitfalls:
  - Passing plain objects where variant-like objects expected.
  - Using arrays where a single target expected; ensure allowed types per Framer Motion.
  - Transition objects: ensure valid keys.

Acceptance:
- `pnpm -w --filter @pawfectmatch/ui type-check` passes.

---

## 4) Mobile App (apps/mobile) – Critical Type Safety

4.1 Core imports (BLOCKER)
- File: `apps/mobile/src/services/api.ts`
  - Replace `@pawfectmatch/core/dist/types/api-responses` with top-level `@pawfectmatch/core` import (e.g., `import { ApiResponses } from '@pawfectmatch/core'`).
  - If those types aren’t exported, add them to `packages/core/src/index.ts` and rebuild.

Acceptance:
- No “Cannot find module '@pawfectmatch/core/dist/types/api-responses'” errors.

4.2 Navigation param list index signatures (HIGH)
- Add index signatures to all stack param lists to resolve TS2344/TS2769 from React Navigation:
```ts
export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  [key: string]: undefined | object;
};
// Repeat for OnboardingStackParamList and others
```

4.3 Component return types & hooks (HIGH)
- Ensure screen components return `JSX.Element` explicitly.
- Standardize on `_id` for Mongo entities; stop mixing `id`.
- Fix missing imports and ensure service types are defined/consumed correctly.

4.4 Animated/Reanimated typing (MEDIUM)
- Where animated styles cause friction, create typed helpers or narrow with specific generics rather than `any`. If unavoidable, cast in leaf test code, not shared components.

4.5 ESLint & test setup (MEDIUM)
- Add Jest globals for mobile tests. Eliminate unused variables by prefixing with `_` if intentional.

Acceptance:
- `pnpm -w --filter @pawfectmatch/mobile type-check` passes with 0 errors.

Edge cases:
- Platform APIs (Haptics, Clipboard, Notifications) must be guarded or provided fallbacks in tests.

---

## 5) Core Package (packages/core) – Stable Exports

5.1 Export required types (REQUIRED)
- Ensure all API response/request types used by web/mobile are exported from `packages/core/src/index.ts`.
- Rebuild core and re-run type-checks.

Acceptance:
- No app imports from `@pawfectmatch/core/dist/**` remain.

5.2 Path mapping sanity (REQUIRED)
- In root tsconfig, keep `@pawfectmatch/core` mapped to dist, not `src`. No deep subpath mappings.

---

## 6) Server & AI Service – Sanity

- Current status: Reported functional. Keep in sync with core types; ensure Zod schema validation at the edge. No changes required for this pass unless integration tests reveal issues.

Acceptance:
- `pnpm -w --filter server test` passes.

---

## 7) Accessibility & UX Contracts

7.1 Premium interactions
- Haptics/vibrate: check for API availability. No action server-side.
- Audio: guard `AudioContext` in SSR; catch errors gracefully.
- Keyboard: Elements must be reachable, with visible focus. `aria-disabled` vs `disabled` semantics must be consistent (disabled elements shouldn’t be focusable unless required).

7.2 ARIA & roles
- Ensure `role` is correct and consistent with semantics.
- Maintain color contrast and focus outlines.

Acceptance:
- a11y lint passes; key screens have headings/landmarks and keyboard navigation works.

---

## 8) Performance & Security Quick Wins

8.1 Web performance
- Prefer RSC where possible.
- Dynamic import heavy components.
- Use Next Image for images.

8.2 Security
- Backend: rate limiting, JWT checks, content validation via Zod, DOMPurify usage for user HTML.
- Configure CSP/Helmet as appropriate.

Acceptance:
- No console security warnings in production builds.

---

## 9) Tests & CI Gates

9.1 Jest
- Ensure jest-dom matchers are typed in all test contexts (web and UI utilities).

9.2 Playwright
- Keep env access via bracket notation. Stabilize selectors and timeouts.

9.3 CI
- Quality gates: type-check, lint-check, test-check.

Acceptance:
- `pnpm quality:gate` passes locally.

---

## 10) Execution Order (Pragmatic)

1) Fix UI package typing (Motion wrappers, styles, test utils) – unblocks monorepo type-check
2) Fix mobile core import + top nav/index signatures + obvious return types
3) Sweep web residual errors (matches page, any remaining exactOptionalPropertyTypes issues)
4) ESLint: ensure test globals & remove unused vars
5) Final pass: remove any leftover casts/suppressions in shared components
6) Run gates and smoke tests

---

## Appendix A – Concrete Change List (File-Level)

- Root
  - `tsconfig.json`: confirmed excludes for .github, cypress, tests/specs
- Web (apps/web)
  - `tsconfig.test.json`: types include jest + jest-dom + node; include src/app test + source
  - `jest.setup.js`: jsdom polyfills + mocks (keep in tests only)
  - `app/(protected)/favorites/page.test.tsx`: uses jest globals; matchers typed
  - `e2e/auth.spec.ts`: bracket env access
  - `app/(protected)/matches/page.tsx`: resolve strict option issues (conditional spreads, guards)
- UI (packages/ui)
  - `src/utils/Motion.tsx` + `src/utils/motionTypes.ts`: add typed helpers and types
  - `src/components/Premium/PremiumButton.tsx`: remove casts, use typed helpers and style() util
  - Sweep other Motion components similarly
  - `src/test-utils/enhanced.ts`: correct matchMedia signature and jest-dom typing
- Mobile (apps/mobile)
  - `src/services/api.ts`: replace deep core import; use top-level exports
  - `src/types/navigation.ts` (or equivalent): add index signatures
  - Fix screen component return types, standardize `_id`
- Core (packages/core)
  - `src/index.ts`: export API response/request types needed by apps

---

## Appendix B – Edge Case Inventory (by Feature)

- Motion/Animation
  - Disabled or loading states must disable hover/tap animations and feedback
  - SSR: no access to window/document; guard effects
- Haptics & Audio
  - Devices without vibrate or AudioContext -> no-ops
  - User gesture requirements for audio on some browsers
- Buttons & Accessibility
  - aria-disabled vs disabled; focus management
  - Keyboard navigation (Tab/Shift+Tab, Enter/Space handling)
- Tests environment
  - matchMedia, ResizeObserver, IntersectionObserver mocks present
  - jest-dom matchers loaded in all test contexts
- API Types & Entities
  - Consistent `_id` usage for Mongo
  - Exact optional property types: don’t pass undefined props; conditional spreads
- Environment Access
  - Use bracket notation for env access in strict TS

---

## Acceptance Checklist (Final)

- [ ] Monorepo `pnpm -w build` and `pnpm -w type-check` success
- [ ] ESLint: 0 errors, no inline disables introduced
- [ ] Tests: `pnpm -w test` pass; e2e stable
- [ ] No deep imports from `@pawfectmatch/core/dist` in apps
- [ ] No casts/suppressions in shared UI components for Motion props/styles
- [ ] Accessibility basics verified on key flows (favorites, matches, onboarding)

---

## Owner Handover Notes

- Start with UI package typing (it unblocks everything). Use the typed Motion helpers to remove all casts. Then fix mobile’s core import and navigation types. Re-run monorepo type-check after each step. Keep changes small and verify at each stage.
napshot: current state
Web app (Next.js)

Status: Mostly runnable, but type-check not fully clean across the monorepo path.
Recent fix: Resolved Jest matcher typing for page.test.tsx via tsconfig alignment; no more Chai/Assertion bleed-in. Playwright env access (process.env) fixed earlier.
Potential remaining web errors: A prior type-check pass showed errors in app/(protected)/matches/page.tsx (line refs 108–112), but subsequent runs were superseded by UI package failures. Needs a re-check once UI is green.
UI package (ui)

Status: Failing type-check with many Framer Motion prop/type mismatches and a few test-utility typing issues.
Examples observed:
Motion props mismatches across multiple components (e.g., whileHover/whileTap types, layout/animate clashes).
enhanced.ts has:
matchMedia mock typed with an UnknownFunction signature error.
jest-dom matcher typings (e.g., toHaveClass) not wired in that file’s TS context.
Impact: Blocks repo-wide turbo type-check; needs focused Motion wrapper and test utils fixes.
Mobile app (Expo)

Status: Not type-clean. Known doc says ~301 errors; current scan shows at least a hard error:
api.ts imports @pawfectmatch/core/dist/types/api-responses which doesn’t exist on the published dist path. Needs to consume core via stable exported types (no deep dist paths) or add the missing exports to core.
Navigation/types are known hotspots per project docs.
Backend API + AI service

Status: No new errors surfaced in this pass; previously noted as functional. Not the current blocker.
Non-code folders noise

pro.chatmode.md flagged by the generic error scan tool (not by TS build). We already excluded .github from TS and ESLint, so CI shouldn’t break on it; but generic repo scans may still complain unless we add tool-level ignores.
Suppressions and stubs

Production code: No broad suppressions introduced in this session. There are a few local casts in animation props (e.g., Exclude/unknown casts) that we should clean to true typings to meet the “no suppressions” bar.
Tests: Mocks exist by design in jest.setup.js (ok for tests). No stubs in production code.
gap to “production-ready: zero errors, no stubs, no suppress”
TypeScript

Web: Likely a handful of residual errors (matches page), pending verification after UI goes green.
UI: Dozens of type issues in Motion props and some hooks/utilities.
Mobile: Many (order of hundreds) TypeScript errors; at least one blocking import path error to core. Navigation and Animated typings likely still noisy.
Suppressions: A few animation prop casts exist in UI (e.g., PremiumButton). We should replace with properly typed Motion wrappers so no “unknown as …” casting remains.
ESLint

Web/Mobile: Previously many warnings; we’ve improved coverage for tests, but there are likely still unused variables and rule violations in mobile and UI. Needs a pass once TS is green.
Tests

Jest: Web tests now type correctly (favorites test). Some UI test utilities need jest-dom typing and matchMedia mock signature fixes.
Playwright: Auth spec types fixed. E2E breadth not audited in this pass.
Architecture/Packages

Core type consumption: Ensure all apps consume @pawfectmatch/core only via top-level exports, not deep dist/* paths (mobile is violating this).
Motion wrappers: Ensure a single typed Motion utility is used across UI to avoid prop mismatches.
prioritized blockers to resolve
UI package type errors

Normalize Motion wrappers and props (no unsafe casts).
Fix test-utils/enhanced.ts:
Update matchMedia mock signature to (query: string) => MediaQueryList.
Ensure jest-dom matchers are typed in the file context.
Audit Premium components like PremiumButton to remove “unknown as …” in whileHover/whileTap and style typing in favor of a strongly-typed MotionProps contract.
Mobile core import path

Replace @pawfectmatch/core/dist/types/api-responses with proper top-level @pawfectmatch/core exports. If needed, expose missing types in core index.ts.
Web residuals

Re-check app/(protected)/matches/page.tsx and any other web files after UI is green.
Tool noise

Ensure any repo-wide tooling ignores .github/** (we already did for TS/ESLint). If a generic scanner still reads it, add tool-specific ignore rules or relocate non-code configs under a clearly ignored directory.
realistic timeline to zero
UI package: 0.5–1.5 days
Implement/adjust Motion wrappers, fix prop contracts, sweep components, and address test-utils typing.
Mobile critical fixes: 1–2 days for P0/P1
Remove deep core imports, add missing core exports, fix navigation param lists index signatures, Animated type assertions (replace with typed helpers where possible), and clean obvious return type issues. The documented “301 errors” suggests further churn—plan for iterative passes.
Web residuals: 0.25 day
Verify and fix any leftover files (e.g., matches page).
Lint, cleanup, and final gate: 0.5 day
Run ESLint fixes, remove any lingering casts/suppressions from components, and enforce CI gates.
Total: ~2–4 days to “no errors, no suppressions, no stubs (prod), all packages type-clean,” assuming no deep architectural surprises.

acceptance criteria
TypeScript: 0 errors across all workspaces (web, UI, core, mobile, server, ai).
ESLint: 0 errors; warnings addressed or justified with rule configuration (not inline suppressions).
No production code stubs/suppressions:
No deep casting to unknown to coerce types in UI Motion components.
All API consumers import from stable core exports.
Tests: Jest + Playwright pass locally; jest-dom matchers typed across tests and UI test utilities.
CI quality gates: Pass type-check, lint-check, test-check; bundle/perf can be monitored separately.
immediate next steps I’ll take
Tackle the UI package type errors first (highest leverage):
Replace ad-hoc Motion prop casts with a typed Motion wrapper layer (shared in packages/ui/utils/Motion) that exposes correctly typed whileHover/whileTap, and typed MotionStyle merges for style.
Fix enhanced.ts:
Correct matchMedia mock signature.
Import jest-dom types at file/project level to enable toHaveClass etc.
Patch the mobile API import path to use @pawfectmatch/core top-level types (and export missing types from core if needed).
Re-run monorepo type-check, then close any remaining web residuals.
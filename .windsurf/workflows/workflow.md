---
description: workflow
auto_execution_mode: 3
---

AUTONOMOUS WORKFLOW (MOBILE)

File: WORKFLOW.md
Scope: apps/mobile (Expo + RN), shared packages, backend stubs, CI/CD
Owner (DRI): AI Dev Agent
Goal: Ship a flawless, production-grade mobile app via an autonomous, repeatable loop that semantically analyzes, audits, fixes, enhances, tests, and verifies every layer (UI/UX, components, state, API, security, performance, a11y, TypeScript, lints) until zero gaps remain.

0) Prime Directives

No regressions. Never merge if any gate fails.

Strict by default. TypeScript strict, exhaustive checks, zero any/ts-ignore without an inline RATIONALE.

Small, atomic PRs. Incremental + reversible.

Tests first or alongside. Unit + integration + E2E + contract mocks.

Semantically driven. Always analyze intent (screens, flows, data contracts), not just syntax.

Portable, deterministic. Same result locally/CI.

Security & GDPR in scope. Delete account + export data must exist and be tested.

1) Autonomous Loop (O-P-A-R)

Repeat until “All Green” (see Quality Gates).

O — Observe (Semantic Analysis)

Build a semantic map of: screens, navigators, components, hooks, stores, services, feature flags, tokens, locales.

Extract feature/flow graph (Auth → Onboarding → Swipe → Match → Chat → Profile → Settings → Premium).

Diff code intent vs product spec/audit (missing endpoints, UI states, edge cases).

Produce /reports/SEMANTIC_GAP_MATRIX.json (auto).

P — Plan (Minimal Winning Patch)

Rank gaps: Critical → High → Medium → Low.

For top N, create work-items/*.yaml with: scope, acceptance tests, mocks needed, risk, rollback.

A — Act (Fix/Enhance Modularly)

Implement in small slices: types → UI → logic → API → tests → docs.

Touch shared tokens/types first.

Where API missing → add contract + mock server and provider.

R — Reflect (Verify & Document)

Run all gates.

Append delta to /reports/QUALITY_TREND.md and /reports/ERROR_TIMELINE.csv.

If any gate red → loop.

2) Quality Gates (must pass before merge)

TypeScript: tsc --noEmit 0 errors for changed scope.

ESLint: strict preset, 0 errors; warnings allowed only with @reason.

Tests:

Unit ≥ 90% changed lines; project ≥ 75% global.

Integration & E2E suites green (Detox).

Accessibility: RN accessibility engine no critical violations on changed screens.

Performance:

60fps interactions on test rig, no long tasks > 16ms in UI thread on hot paths.

Bundle delta < +200KB unless approved.

Security: no secrets, SAST clean, GDPR flows tested (delete/export).

UX Checks: empty/error/loading/skeleton states covered and testable.

3) Commands & Scripts (add/ensure)

Add to root or apps/mobile/package.json as appropriate.

{
  "scripts": {
    // ANALYZE
    "mobile:tsc": "tsc -p apps/mobile/tsconfig.json --noEmit",
    "mobile:lint": "eslint \"apps/mobile/**/*.{ts,tsx}\"",
    "mobile:format": "prettier -w \"apps/mobile/**/*.{ts,tsx,md,json,yml}\"",
    "mobile:depcheck": "pnpm -w dlx depcheck apps/mobile",
    "mobile:exports": "node scripts/analyze-exports.mjs apps/mobile/src",

    // TESTS
    "mobile:test": "jest -c apps/mobile/jest.config.cjs --passWithNoTests",
    "mobile:test:cov": "jest -c apps/mobile/jest.config.cjs --coverage",
    "mobile:e2e:build": "detox build -c ios.release && detox build -c android.release",
    "mobile:e2e:test": "detox test -c ios.release --record-logs failing --take-screenshots failing",

    // A11Y & PERF
    "mobile:a11y": "node scripts/a11y-scan.mjs apps/mobile/src/screens",
    "mobile:perf": "node scripts/perf-budget.mjs apps/mobile",

    // MOCK API
    "mobile:mock": "tsx scripts/mock-server.ts --port 7337",
    "mobile:contract:check": "tsx scripts/contract-check.ts apps/mobile/src/services",

    // ALL GATES
    "mobile:verify": "run-p mobile:tsc mobile:lint mobile:test:cov mobile:a11y mobile:contract:check",
    "mobile:verify:strict": "run-s mobile:verify mobile:e2e:build mobile:e2e:test mobile:perf",

    // FIXERS
    "mobile:fix": "eslint \"apps/mobile/**/*.{ts,tsx}\" --fix && prettier -w \"apps/mobile/**/*\""
  }
}


Detox: already configured—ensure apps/mobile/.detoxrc.cjs is valid and iOS/Android runners are green.

4) TypeScript – Max Strict

Update apps/mobile/tsconfig.json:

{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "noImplicitOverride": true,
    "noFallthroughCasesInSwitch": true,
    "noImplicitReturns": true,
    "importsNotUsedAsValues": "error",
    "useUnknownInCatchVariables": true,
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "paths": { "@/*": ["src/*"] }
  }
}


Rules:

Ban any, ! (non-null) without // @why: comment.

No ts-ignore unless temporary with ticket ID and removal date.

Enforce satisfies for tokens, theme objects, and route configs.

5) ESLint & Formatting – Zero Noise

Use @typescript-eslint v7+, eslint-plugin-import, eslint-plugin-react, eslint-plugin-react-native, eslint-plugin-promise, eslint-plugin-unicorn.

Key rules:

import/no-default-export: error (except RN screen components if codebase standard allows).

@typescript-eslint/consistent-type-imports: error.

@typescript-eslint/no-floating-promises: error.

promise/catch-or-return: error.

unicorn/no-null: off (RN uses null).

react-native/no-raw-text: warn (i18n).

Prettier single source of truth (no conflicting ESLint rules).

6) Mocks, Simulations, Contract Testing
6.1 Mock Server (local)

Create scripts/mock-server.ts (Express or Hono):

import { Hono } from 'hono';
const app = new Hono();

app.delete('/users/delete-account', c => c.json({
  success: true,
  message: 'Deletion scheduled (30 days).',
  gracePeriodEndsAt: new Date(Date.now() + 30*864e5).toISOString()
}));

app.get('/users/export-data', c => c.json({ /* redacted sample data */ }));

app.post('/users/confirm-deletion', c => c.json({ success: true }));

// Add chat, swipe, premium, reporting, etc. as needed.

export default app;


Run: pnpm mobile:mock and point mobile environment.ts to https://localhost:7337 when __DEV__.

6.2 Contract Checker

Create scripts/contract-check.ts:

Parse mobile services/* method signatures.

Ping mock server OpenAPI (or static schema) to assert shape compatibility.

Fail CI on mismatch.

6.3 App Simulations

Seed swipe/match/chat states via mock endpoints.

Provide deterministic fixtures for E2E (e.g., “user-with-3-matches.json”).

7) Testing Pyramid
Unit (Jest + RTL)

Components: test props, states, a11y roles/labels.

Hooks: deterministic timers and network via mocks.

Stores: state transitions + persistence.

Integration (Jest + RTL)

Screen flows: Swipe → Match → Chat → Profile → Settings.

Error/empty/loading for each screen.

E2E (Detox)

Golden paths: Auth, Swipe/Match, Chat, Subscription, Settings (GDPR).

Edge paths: offline, slow network, partial profile, blocked user.

Coverage Thresholds

apps/mobile/jest.config.cjs:

coverageThreshold = {
  global: { branches: 70, functions: 75, lines: 75, statements: 75 },
  "./src/components/**": { lines: 85 },
  "./src/screens/**": { lines: 80 }
}

8) Accessibility (RN)

Automate with react-native-accessibility-engine:

Assert labels, roles, hitSlop, contrast (theme), focus order.

Test Reduce Motion: animations must gracefully degrade.

Ensure dynamic type (scales) doesn’t clip.

Run: pnpm mobile:a11y.

9) Performance Budgets

JS bundle: ≤ 8.5MB (start), PR delta ≤ +200KB.

First interactive < 3s cold start on mid-range Android.

No JS event loop stalls > 16ms on gesture/scroll.

Image policy: use OptimizedImage.tsx (already present) with caching and correct sizes.

Run: pnpm mobile:perf.

10) Security & Privacy

Delete Account + Export Data endpoints must exist in client services + mocked + E2E tested.

Secrets: none in repo; rely on .env (already present).

SSL pinning: verify with src/config/sslCertificates.ts (present).

Gitleaks runs in CI (repo has .gitleaks.toml).

Crash reporting enabled (Sentry). Verify PII scrubbing.

11) UX State Matrix (enforced)

For every screen & critical component, implement and test:

Loading, Empty, Success, Error, Skeleton (if applicable).

For actions: optimistic, rollback, toasts/snackbars, retry.

Add a ScreenState.story.tsx or test case to lock this down.

12) CI/CD (GitHub Actions example)

.github/workflows/mobile.yml

name: mobile
on:
  pull_request:
    paths:
      - 'apps/mobile/**'
      - 'packages/**'
      - 'server/**'
      - 'scripts/**'
  push:
    branches: [ main ]

jobs:
  verify:
    runs-on: macos-14
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with: { version: 9 }
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: 'pnpm' }
      - run: pnpm i --frozen-lockfile
      - name: TypeScript strict
        run: pnpm mobile:tsc
      - name: ESLint
        run: pnpm mobile:lint
      - name: Unit & Integration
        run: pnpm mobile:test:cov
      - name: Mock API
        run: pnpm -w mobile:mock &
      - name: Contract Check
        run: pnpm mobile:contract:check
      - name: A11y
        run: pnpm mobile:a11y
      - name: Perf budget
        run: pnpm mobile:perf

  e2e:
    needs: verify
    runs-on: macos-14
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with: { version: 9 }
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: 'pnpm' }
      - run: pnpm i --frozen-lockfile
      - run: pnpm mobile:e2e:build
      - run: pnpm mobile:e2e:test

13) PR Template (copy to .github/pull_request_template.md)
## Summary
[what/why]

## Scope
- [ ] UI
- [ ] State/Logic
- [ ] API
- [ ] Tests
- [ ] Tokens/Theme
- [ ] Docs

## Screens/Flows touched
- [ ] Auth
- [ ] Onboarding
- [ ] Swipe/Match
- [ ] Chat
- [ ] Profile
- [ ] Settings/GDPR
- [ ] Premium

## Checklists
- [ ] TS strict (no errors, no unapproved ts-ignore)
- [ ] ESLint clean
- [ ] Unit/Integration added
- [ ] E2E updated (Detox)
- [ ] A11y verified
- [ ] Perf budget respected
- [ ] i18n keys present
- [ ] Empty/Error/Loading states covered

## Risk & Rollback
Risk:  
Rollback:

14) Semantic Audit Outputs (auto-generate)

When the loop runs, produce:

/reports/SEMANTIC_GAP_MATRIX.json – list feature → code refs → status (present/missing/partial), risk.

/reports/QUALITY_TREND.md – daily table of errors, coverage, bundle size, perf.

/reports/ERROR_TIMELINE.csv – TS/ESLint counts over time.

/reports/ACCESSIBILITY.md – violations by screen, with fix suggestions.

15) Must-Have Fix Pack (Initial Tasks)

GDPR: Implement deleteAccount, exportUserData, confirmDeleteAccount (client + mock + tests).

Theme typings: align helper signatures with unified-theme.ts (satisfies + as const).

Components: ensure Modern/Pro components expose a11yLabel, role, testID.

Chat: add reactions, attachments, voice note mock endpoints + integration tests (can be mocked initially).

Swipe: back/report/boost buttons + tests.

Error boundaries: verify per-navigator + root; surface retry UX.

16) Definition of Done (per item)

✅ Types strict, no leaks.

✅ Unit + integration + (if user-visible) E2E.

✅ A11y roles/labels/touch targets validated.

✅ Perf budget respected.

✅ Dark/light + large text verified.

✅ Empty/error/loading/skeleton states shipped.

✅ Docs updated (README of feature or JSDoc).

✅ Changelog entry.

17) Failure Protocol

Any gate red → block merge.

Auto-create work-items/<date>-<slug>.yaml with error excerpts + suggested patch map.

Critical user flow regression → revert PR automatically and open incident note in /reports/INCIDENTS.md.

18) Runbook (local)
# quick loop while developing
pnpm mobile:fix
pnpm mobile:verify

# before pushing
pnpm mobile:verify:strict

# e2e locally (simulators must be booted)
pnpm mobile:e2e:build && pnpm mobile:e2e:test

# with mock api
pnpm mobile:mock

19) House Rules

Prefer composition over props explosion (Pro components).

No hidden side effects in hooks.

No inline colors: use tokens.


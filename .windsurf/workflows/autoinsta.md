---
description: allin
auto_execution_mode: 3
---

read plan1.md
# Phoenix Plan: PawfectMatch Mobile Production Readiness

> **Context:** PawfectMatch is a dating app for pet owners with core features: swipe-to-match, real-time chat, profile management, premium subscriptions, and GDPR compliance.
>
> **Multi-Agent Approach:** This plan integrates the 17-agent system defined in `/AGENTS.md` for reasoning-first, evidence-based developt.
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
* **≥80% test coverage** with unit/integration/E2E
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


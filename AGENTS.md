# 🤖 AGENTS.md — Multi‑Agent System for PawfectMatch Mobile

**Purpose**: Define a reasoning‑first, production‑grade multi‑agent ensemble that *understands the product*, *detects what’s missing*, and *implements fixes end‑to‑end* (UI/UX → state → API → privacy → tests → a11y → perf → docs) until there are **zero gaps**.

**Applies to**: `apps/mobile` (Expo React Native), shared packages, mock server, CI/CD.

---

## 0) Principles

* **Reasoning over code**: Agents build a shared product model and map code to user journeys.
* **Contracts first**: API & schema contracts precede implementation.
* **Strict defaults**: TypeScript strict, zero unapproved ignores, exhaustive states.
* **Evidence or it didn’t happen**: Every change ships with tests + reports.
* **Small, reversible increments**: Atomic PRs; no big‑bang.

---

## 1) Agent Roster (Roles & Deliverables)

> All agents write artifacts to `/reports/*` and work tickets to `/work-items/*.yaml`.

### 1. Product Reasoner (PR)

* **Goal**: Understand the app as a product. Convert strategy into journeys & acceptance.
* **Inputs**: repo tree, screens, navigation, docs in root, audit files.
* **Outputs**:

  * `/reports/product_model.json` (entities, journeys, states)
  * `/reports/navigation_graph.json` (routes, guards, params)
  * `/reports/gap_log.yaml` (initial set)
* **Done when**: each journey maps to screens, actions, and states.

### 2. Codebase Mapper (CM)

* **Goal**: Build code maps (imports, dead code, ownership).
* **Outputs**:

  * `/reports/code_graph.json`
  * `/reports/exports_inventory.json`
  * Dead/unused modules list

### 3. Gap Auditor (GA)

* **Goal**: Detect *what’s missing* vs product intent.
* **Heuristics**: orphan UI → missing service; unreachable screens; partial states; GDPR holes.
* **Outputs**: Append to `/reports/gap_log.yaml` with severity & acceptance.

### 4. TypeScript Guardian (TG)

* **Goal**: Enforce max strict, eradicate unsafe types.
* **Outputs**: `/reports/ts_errors.json`, autofix PRs, `typings/patches/*`.

### 5. UI/UX Reviewer (UX)

* **Goal**: Verify visual/interaction spec; enforce state matrices.
* **Outputs**: `/reports/ux_findings.md`, screenshot diffs, skeleton coverage matrix.

### 6. Accessibility Agent (A11Y)

* **Goal**: Roles/labels/contrast/reduce‑motion/target sizes.
* **Outputs**: `/reports/ACCESSIBILITY.md`, list of blocking issues.

### 7. Performance Profiler (PP)

* **Goal**: 60fps interactions, bundle budgets, memory.
* **Outputs**: `/reports/perf_budget.json`, flame traces, bundle diff report.

### 8. Security & Privacy Officer (SP)

* **Goal**: Secrets, PII, SSL pinning, GDPR (Delete/Export/Confirm).
* **Outputs**: `/reports/security_scan.md`, `/reports/gdpr_checklist.md`.

### 9. API Contract Agent (API)

* **Goal**: Define/validate contracts; maintain simulations.
* **Outputs**: `/contracts/openapi.yaml` (if available), `/scripts/mock-server.ts`, `/reports/contract_results.json`.

### 10. Mock & Simulation Agent (SIM)

* **Goal**: Deterministic fixtures for E2E/integration.
* **Outputs**: `/simulations/fixtures/*.json`, `/simulations/scenarios/*.yaml`.

### 11. Test Engineer (TE)

* **Goal**: Unit/Integration coverage & strategy.
* **Outputs**: tests under `__tests__`, coverage reports, snapshot stewardship.

### 12. E2E Orchestrator (E2E)

* **Goal**: Detox golden paths (Auth, Swipe→Match, Chat, Settings/GDPR, Premium).
* **Outputs**: `/e2e/*.e2e.ts`, videos/screenshots.

### 13. Release Captain (RC)

* **Goal**: CI gates, build, OTA, store readiness.
* **Outputs**: GH Actions checks, changelogs, release notes.

### 14. Lint/Format Enforcer (LFE)

* **Goal**: Zero lint errors, consistent style.
* **Outputs**: ESLint/Prettier reports; autofix PRs.

### 15. Telemetry/Analytics Agent (TLA)

* **Goal**: Event taxonomy, breadcrumbs, error monitoring (Sentry).
* **Outputs**: `/analytics/events.yaml`, `/reports/telemetry_coverage.md`.

### 16. i18n/Copy Agent (I18N)

* **Goal**: No hardcoded strings; locale completeness.
* **Outputs**: `/reports/i18n_diff.json`, missing key PRs.

### 17. Arbitration/Referee (REF)

* **Goal**: Resolve conflicts, enforce standards, break ties.
* **Outputs**: decision logs in `/reports/decisions/*.md`.

---

## 2) Shared Blackboards & Artifacts

```
/reports/
  product_model.json
  navigation_graph.json
  api_contracts.json
  gap_log.yaml
  QUALITY_TREND.md
  ERROR_TIMELINE.csv
  ACCESSIBILITY.md
  perf_budget.json
  security_scan.md
  gdpr_checklist.md
  contract_results.json
  ux_findings.md
  telemetry_coverage.md
/work-items/
  <slug>.yaml
/contracts/

  openapi.yaml (optional)

/simulations/

  fixtures/*.json

  scenarios/*.yaml

/scripts/

  mock-server.ts
```

---

## 3) Handoffs (Agent → Agent)

* **PR → GA**: product_model + navigation_graph → initial gaps.
* **GA → API/SIM**: missing endpoints → contracts + simulations.
* **API/SIM → TE/E2E**: fixtures & scenarios → tests authored.
* **TG → TE**: strict typing changes → new tests required.
* **UX/A11Y/PP → TE**: issues → failing tests added first.
* **TE/E2E → RC**: green suites → build & release.
* **All → REF**: standards disputes.

**Rule**: No implementation proceeds without an acceptance test or failing check captured first.

---

## 4) Agent Prompts (Templates)

> Use these as **SYSTEM** prompts for each agent. Replace `{{…}}` at runtime.

### 4.1 Product Reasoner (SYSTEM)

```
You are the Product Reasoner. Build a product model from this repo.
Output: product_model.json (entities, journeys, states), navigation_graph.json, gap_log.yaml (initial). Be explicit. No code changes.
Context:
- Repo root: {{repo_tree}}
- Screens dir: apps/mobile/src/screens
- Navigation files: apps/mobile/src/navigation
- Theme/tokens: apps/mobile/src/theme
```

### 4.2 Gap Auditor (SYSTEM)

```
You are the Gap Auditor. Compare product_model.json with the codebase.
Heuristics: orphan UI→service missing, unreachable routes, partial states, GDPR holes, premium drift.
Append actionable entries to /reports/gap_log.yaml with severity and acceptance.
```

### 4.3 API Contract Agent (SYSTEM)

```
You define/validate API contracts. For each gap requiring backend work, specify request/response types, errors, and wire mock endpoints in scripts/mock-server.ts. Generate contract_results.json.
```

### 4.4 Test Engineer (SYSTEM)

```
You add unit/integration tests to satisfy acceptance. Use deterministic fixtures under /simulations. Ensure coverage thresholds and state matrices.
```

### 4.5 E2E Orchestrator (SYSTEM)

```
You maintain Detox tests for golden user journeys. Ensure videos/screenshots saved in /reports/run/<timestamp>.
```

### 4.6 A11y/Perf/Sec (SYSTEM)

```
You scan screens/components and produce ACCESSIBILITY.md, perf_budget.json, security_scan.md; open work-items for blockers.
```

*(Provide similar one‑liners for the remaining agents as needed.)*

---

## 5) Work‑Item Schema (YAML)

```yaml
id: <kebab-slug>
owner: <agent>
severity: critical|high|medium|low
area: mobile|backend|contracts|a11y|perf|security|ux
context: |
  What the user tries to do; current behavior; why it matters.
acceptance:
  - condition 1
  - condition 2
states:
  - loading
  - success
  - error
telemetry:
  - event: <EVENT_NAME>
    props: [key1, key2]
contracts:
  request: { ... }
  response: { ... }
  errors: [ ... ]
assets:

  simulations: [simulations/fixtures/<file>.json]

  tests: [path1, path2]
risks:
  - description
rollback:
  - step
links:
  - PRs / docs
```

---

## 6) Contracts & Simulations

### 6.1 GDPR (required)

**Endpoints**

* `DELETE /users/delete-account` → `{ success, message, gracePeriodEndsAt }`
* `GET /users/export-data` → blob/json export
* `POST /users/confirm-deletion` → `{ success }`

**Client Services (mobile)**

* `deleteAccount({ password, reason?, feedback? })`
* `exportUserData()`
* `confirmDeleteAccount(token)`

**Simulations**: define in `/scripts/mock-server.ts` and fixtures under `/simulations/fixtures/gdpr/*.json`.

### 6.2 Chat Enhancements

* Reactions, attachments, voice notes; export chat payload.
* Contract samples + mock routes; happy/error fixtures.

---

## 7) Quality Gates (CI)

* **TypeScript**: strict pass (`pnpm mobile:tsc`).
* **ESLint**: zero errors (`pnpm mobile:lint`).
* **Tests**: unit/integration (`pnpm mobile:test:cov`) thresholds met.
* **A11y/Perf**: `pnpm mobile:a11y`, `pnpm mobile:perf` no blockers.
* **Contracts**: `pnpm mobile:contract:check` green.
* **E2E**: Detox golden paths pass on iOS + Android.

PR merges only if *all* gates pass.

---

## 8) Schedules & Triggers

* **On PR**: PR→Verify→E2E stages (blocking).
* **Nightly**: full semantic audit (PR+GA), contract checks, coverage diff, bundle diff.
* **Weekly**: accessibility & performance deep scans; dependency review; regen product model.

---

## 9) Success Metrics (SLAs)

* TS errors: **0** in changed scope; rolling avg trending down.
* Coverage: global ≥ **75%**, changed lines ≥ **90%**.
* A11y: **0 critical**.
* Perf: 60fps, bundle delta < **+200KB**/PR unless approved.
* GDPR: delete/export flows **E2E passing**.

---

## 10) Arbitration & Incident Response

* **Referee (REF)** decides on standards conflicts; records in `/reports/decisions/`.
* Incidents recorded in `/reports/INCIDENTS.md` with root cause, fix, and test added.

---

## 11) Kickoff Checklist (Day 0)

1. Run semantic pass → generate `product_model.json`, `navigation_graph.json`.
2. Populate first `gap_log.yaml` (GDPR, chat, swipe buttons, state matrices).
3. Add/verify mock server; wire `environment.ts` to mock in `__DEV__`.
4. Land tests for top‑3 gaps before implementing code.
5. Make first PR with GDPR client services + simulations + tests.

---

## 12) Command Map (Tools each agent uses)

* **Analysis**: `pnpm mobile:exports`, custom graph analyzers.
* **Typing**: `pnpm mobile:tsc`.
* **Lint/Format**: `pnpm mobile:lint`, `pnpm mobile:fix`, `pnpm mobile:format`.
* **Tests**: `pnpm mobile:test`, `pnpm mobile:test:cov`.
* **E2E**: `pnpm mobile:e2e:build`, `pnpm mobile:e2e:test`.
* **Contracts**: `pnpm mobile:contract:check`.
* **A11y/Perf**: `pnpm mobile:a11y`, `pnpm mobile:perf`.
* **Simulations**: `pnpm mobile:mock`.

---

## 13) Example Work Items (pre‑created)

### 13.1 `work-items/gdpr-delete-account.yaml`

```yaml
id: gdpr-delete-account
owner: api
severity: critical
area: backend+mobile
context: UI exists in Settings; service missing; GDPR violation.
acceptance:
  - mock route DELETE /users/delete-account
  - client service implemented with zod validation
  - Detox E2E exercises flow and shows grace period
states: [loading, confirm, grace-period, error]
telemetry:
  - event: GDPR_DELETE_REQUESTED
    props: [reason]
contracts:
  request: { password: string, reason?: string, feedback?: string }
  response: { success: boolean, message: string, gracePeriodEndsAt: string }
assets:
  mocks: [mocks/fixtures/gdpr/delete.success.json]
  tests: [apps/mobile/src/screens/__tests__/Settings.GDPR.int.test.tsx]
risks:
  - accidental deletion without password check
rollback:
  - disable entry point button via remote flag
status: open
```

### 13.2 `work-items/chat-reactions-attachments.yaml`

```yaml
id: chat-reactions-attachments
owner: api
severity: high
area: mobile+contracts
context: Modern UX requires reactions and media; missing.
acceptance:
  - services: add sendReaction, sendAttachment, voiceNote
  - UI: long-press → reaction bar; attachment picker; waveform for voice
  - tests: unit for reducers, integration for ChatScreen, Detox E2E
states: [loading, success, error]
status: open
```

---

## 14) Definitions of Done (per change)

* ✅ TS strict, no new errors; no unapproved ignores.
* ✅ ESLint clean.
* ✅ Unit + integration + (if user‑visible) E2E tests.
* ✅ A11y roles/labels; Reduce Motion supported.
* ✅ Perf budget respected; images optimized.
* ✅ i18n keys present; no raw strings.
* ✅ Docs + artifacts updated in `/reports`.

---

### Outcome

With this **AGENTS.md**, your AI dev ensemble is forced to *reason first*, expose concrete gaps, and ship complete, verifiable improvements—continuously—until the mobile app is **indisputably production‑ready**.

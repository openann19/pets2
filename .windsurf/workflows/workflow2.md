---
description: workflow2
auto_execution_mode: 3
---

# 🧠 Reasoning‑First Autonomous Workflow (Mobile)

> **Purpose**: Force the AI Dev to *understand the product*, *spot what’s missing*, and *complete it end‑to‑end* (types → UI → state → API → tests → a11y → perf → docs) until the app is unequivocally production‑ready.

**Scope:** `apps/mobile` + shared packages + mock server + CI.
**Owner (DRI):** AI Dev Agent.
**Non‑negotiables:** No regressions, strict TypeScript, atomic PRs, tests with every change, evidence artifacts.

---

## 0) Prime Directives

1. **Reason About Product, Not Just Files.** Build a product model first; every fix/enhancement must map to a user journey and acceptance criteria.
2. **Strict by Default.** `tsc --noEmit` must pass; no unchecked `any`, no `ts-ignore` without ticket + removal date.
3. **Small, Reversible Changes.** Prefer incremental PRs with full tests.
4. **States Are Mandatory.** Each screen/flow must implement **loading / empty / success / error / skeleton** and be test‑addressable.
5. **A11y & Perf Are Features.** Enforce accessibility roles/labels, hit targets; keep 60fps on interactive paths.
6. **GDPR In Scope.** Delete Account + Export Data exist, are wired, and are E2E tested.

---

## 1) The Autonomous Loop (O‑P‑A‑R)

Repeat until **All Gates = Green** (see §6).

### O — Observe (Semantic Analysis)

Produce a **holistic understanding** of the app:

* Parse navigation and screens to build a **Navigation Graph** (routes, params, guards).
* Infer **Domain Entities & Relationships** from code (User, Pet, Match, Chat, Subscription, Adoption, Admin, Moderation).
* Extract and lint **API Contracts** referenced by services/hooks; detect missing endpoints.
* Inventory components (UI + Pro) and map them to journeys.
* Index i18n keys, theme tokens, feature flags.

**Output files**

* `/reports/product_model.json` (schema in §10.1)
* `/reports/navigation_graph.json`
* `/reports/api_contracts.json`

### P — Plan (Minimal Winning Patch)

* Rank gaps by **Critical → High → Medium → Low**.
* For top items, create `work-items/<slug>.yaml` with:

  * Context & hypothesis (what user value is blocked?)
  * Acceptance criteria & states
  * API contract (mock if missing)
  * Test plan (unit/integration/E2E)
  * A11y & perf budgets

### A — Act (Modular Implementation)

* **Types first** (entities, DTOs, route params).
* **Contract tests** against mock server (or OpenAPI) before wiring real API.
* **UI/UX** using existing tokens; never inline colors.
* **State/business logic** with predictable stores; no side effects in render.
* **Tests**: unit + integration; record E2E for journeys touched.
* **Docs**: update README/feature notes.

### R — Reflect (Verification & Evidence)

* Run all gates.
* Append deltas to `/reports/QUALITY_TREND.md`, `/reports/ERROR_TIMELINE.csv`.
* Attach evidence: coverage badges, E2E videos/screenshots, a11y report, perf report.

---

## 2) Required Deliverables Each Cycle

* **Reasoning Pack**: `/reports/product_model.json`, `/reports/navigation_graph.json`, `/reports/api_contracts.json`.
* **Gap Log**: `/reports/gap_log.yaml` (schema in §10.2).
* **Implementation PR(s)**: code + tests + docs.
* **Evidence**: a11y/perf/test artifacts under `/reports/run/<timestamp>/`.

PRs missing any of the above **do not merge**.

---

## 3) Gap Detection Heuristics (What “Missing” Looks Like)

1. **UI → API Orphans**: Buttons/flows calling non‑existent service methods.
2. **Dead Screens/Routes**: Screens not reachable from any navigator.
3. **Partial States**: No empty/error handling or skeleton views.
4. **Unrealizable Types**: DTOs never satisfied by any server response.
5. **GDPR Holes**: `deleteAccount`, `exportUserData`, `confirmDeletion` absent or untested.
6. **Premium Drifts**: UI advertises features (boost, superlike, who‑liked‑you) without contracts or tests.
7. **Chat Gaps**: Missing reactions, media attachments, voice notes; no export for legal needs.
8. **A11y Omissions**: Components without role/label/hitSlop; contrast violations.
9. **Perf Risks**: Long lists without virtualization; images without caching; large bundle diffs.
10. **i18n Leaks**: Literal strings not in locale files.

Each heuristic triggers a **gap entry** in `/reports/gap_log.yaml` with severity, scope, and fix plan.

---

## 4) Repo‑Specific First‑Run Tasks (PawfectMatch)

Create these **immediately** as work items and implement with tests:

1. **GDPR Compliance**

   * Add service methods: `deleteAccount`, `exportUserData`, `confirmDeleteAccount`.
   * Mock endpoints in local mock server; integration tests + Detox E2E for flow.

2. **SwipeScreen UX Completion**

   * Ensure Back / Boost / Report actions exist with handlers, states, and tests.

3. **Chat Enhancements**

   * Reactions, attachments (image/video), voice notes (UI + mocked API) + tests.
   * Export chat (JSON/HTML) mocked; ensure user‑initiated download flow.

4. **A11y Pass on Pro Components**

   * `HologramAvatar`, `NeonButtonPro`, `StellarCard3D`, `GooeyTabBar`, `LiquidSwipeTransition` expose roles/labels/testIDs and degrade with Reduce Motion.

5. **Theme/Token Typings**

   * Use `satisfies` + `as const` on theme/tokens; remove unsafe index access.

6. **State Matrices**

   * For each critical screen (Auth, Swipe, Matches, Chat, Profile, Settings), implement and test **loading/empty/error/skeleton**.

---

## 5) Implementation Protocol (Per Work Item)

1. **Reasoning Brief** (`work-items/<slug>.yaml`)

   * Problem, user value, acceptance criteria, states, telemetry events.
2. **Contracts**

   * DTO types, zod schemas, request/response samples; mock server routes.
3. **Code**

   * Types → UI → logic → service → wiring.
4. **Tests**

   * Unit (logic/components), Integration (screen + service), E2E (Detox path).
5. **Evidence**

   * Attach a11y scan, perf budget result, coverage summary.
6. **Docs**

   * Update feature README + changelog.

---

## 6) Quality Gates (Blockers)

All gates must be **green**:

* **TypeScript**: `tsc --noEmit` = 0 errors (changed scope), no unapproved `any/ts-ignore`.
* **ESLint**: 0 errors; warnings require inline `@reason`.
* **Tests**: unit/integration green; global coverage ≥ 75%, changed files ≥ 90% lines.
* **E2E**: critical journeys pass (Auth, Swipe→Match, Chat, Settings/GDPR, Premium).
* **A11y**: no critical violations; roles/labels present; Reduce Motion covered.
* **Perf**: 60fps on interactions; bundle delta < +200KB unless approved.
* **Security/GDPR**: secrets clean; GDPR flows pass; no PII leaks in logs.

---

## 7) CI Pipeline (Required Steps)

1. Install (pnpm, cache).
2. `pnpm mobile:tsc`, `pnpm mobile:lint`.
3. `pnpm mobile:test:cov`.
4. Start mock server → `pnpm mobile:contract:check`.
5. `pnpm mobile:a11y`, `pnpm mobile:perf`.
6. Detox build + run critical E2E.
7. Upload `/reports/run/<timestamp>/*` as artifacts.

PR merges only if all steps pass.

---

## 8) Reasoning Evidence (What to Write Down)

* **Assumptions Ledger**: list assumptions with validation status (Proved/Refuted/Pending).
* **Decision Log**: trade‑offs (API shape, state model, UX pattern) with alternatives considered.
* **Risk Register**: known risks + mitigations.
* **Journey Checklists**: states covered, telemetry, a11y, perf budgets.

These belong alongside the PR (short, factual, linked to tests) and in `/reports/`.

---

## 9) Git & PR Rules

* One feature/fix per PR.
* Include: Work item YAML, tests, evidence artifacts, screenshots/video (if UI).
* Use PR template with checkboxes for all gates.

---

## 10) Schemas (Put these in repo)

### 10.1 `product_model.json` (schema)

```json
{
  "entities": [
    { "name": "User", "fields": ["id","email","role","premium"], "relations": [{"type":"hasMany","to":"Pet"},{"type":"hasMany","to":"Match"}] },
    { "name": "Pet", "fields": ["id","ownerId","breed","age","photos"], "relations": [{"type":"belongsTo","to":"User"}] },
    { "name": "Match", "fields": ["id","userA","userB","createdAt"], "relations": [{"type":"hasMany","to":"Message"}] },
    { "name": "Message", "fields": ["id","matchId","senderId","type","content","createdAt"] },
    { "name": "Subscription", "fields": ["userId","plan","status","renewsAt"] },
    { "name": "Adoption", "fields": ["listingId","applicantId","status"] }
  ],
  "screens": [
    { "name": "SwipeScreen", "states": ["loading","empty","success","error"], "actions":["like","pass","boost","report","undo"] },
    { "name": "ChatScreen", "states": ["loading","empty","success","error"], "actions":["sendText","sendImage","sendVideo","voiceNote","react","exportChat","unmatch"] }
  ],
  "apis": [
    { "name":"deleteAccount", "method":"DELETE", "path":"/users/delete-account", "status":"missing|present" },
    { "name":"exportUserData", "method":"GET", "path":"/users/export-data", "status":"missing|present" }
  ]
}
```

### 10.2 `gap_log.yaml` (schema)

```yaml
- id: gdpr-delete-account
  title: "GDPR: Delete Account endpoint"
  severity: critical
  area: backend+mobile
  hypothesis: "UI exists; service method absent; GDPR violation."
  acceptance:
    - "DELETE /users/delete-account implemented + mocked"
    - "client service wired with types+zod"
    - "Detox E2E: user can schedule deletion and receives notice"
  states:
    - loading
    - confirm
    - grace-period
    - error
  tests:
    unit: ["services/user.test.ts"]
    integration: ["screens/Settings/DeleteAccount.int.test.tsx"]
    e2e: ["e2e/gdpr.delete-account.e2e.ts"]
  owner: ai-dev
  links: []
  status: open
```

---

## 11) Scripts (Reference)

Add or ensure these in `package.json`:

* `mobile:verify` → tsc + lint + unit/integration + a11y + contract.
* `mobile:verify:strict` → + Detox E2E + perf.
* `mobile:mock` → start local mock server.
* `mobile:contract:check` → fail on service/OpenAPI mismatch.

---

## 12) Definition of Done (Per Item)

* Types strict, **0** new TS errors.
* ESLint clean.
* Unit + integration + (if user‑visible) E2E passing.
* A11y roles/labels + Reduce Motion support.
* Perf budget respected.
* Dark/Light + large text verified.
* States implemented (loading/empty/error/success/skeleton).
* Docs updated + evidence artifacts attached.

---

## 13) Failure Protocol

* Any gate red → **block PR** + auto‑open `work-items/<slug>.yaml` with remediation.
* Critical regression in golden journeys → auto‑revert and open incident report.

---

## 14) Quick Start (What to Run Now)

```bash
pnpm mobile:fix
pnpm mobile:verify
pnpm mobile:verify:strict  # before merging
```

---

### Outcome

Following this workflow, the AI Dev can’t just “fix lints”—they must **understand the product**, **detect gaps**, and **land complete, tested features** with auditable reasoning and artifacts.

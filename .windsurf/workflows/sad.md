---
description: sad
auto_execution_mode: 3
---

# Mobile Production-Ready Plan (Strict, Mobile-Only)

## 0. Foundations and Scope [done]

- Scoped workspace to `apps/mobile` and pinned React 18.2 for Expo SDK 49/RN 0.72.
- Acceptance: mobile install succeeds; dev server starts.

## 1. PHASE 1 — Semantic Theme Migration

- Replace all `Theme.*` and string-literal colors with `useTheme()` and `theme.colors/*`.
- Normalize spacing/radii (no inline math; `spacing["4xl"]` → `theme.spacing.{xs…4xl}`, `theme.radii.{xs…full}`).
- Migrate gradients to `theme.palette.gradients.*`.
- Disambiguate navigation theme: `import { useTheme as useNavigationTheme } from "@react-navigation/native"`.
- Completed: `getPremiumShadows(theme)`; shadows now theme-based.
- Acceptance: touched files pass `local/no-theme-namespace` and `no-hardcoded-colors` with zero violations.

## 2. Platform Fencing and Upload Adapters

- Fence web APIs into `.web.ts[x]`: `window`, `AudioBuffer`, `MediaRecorder`, canvas/image pipelines.
- Upload: Native → `FormData` + file URI; Web → `Blob`. Provide a typed `UploadAdapter` so components don’t cast unsafely.
- Acceptance: no web globals/types in native files; upload flows compile and tests pass.

## 3. TypeScript Structure and Test Isolation

- Split configs:
- `tsconfig.app.json` (app only), `tsconfig.test.json` (jest with `types: ["jest","node"]`), `tsconfig.e2e.json` (Detox with `types: ["detox","jest","node"]`).
- Scripts: `mobile:typecheck` runs app + unit/integration; e2e typed separately within e2e jobs.
- Exclude `apps/mobile/web/**` and `apps/mobile/e2e/**` from `tsconfig.app.json`.
- Acceptance: `pnpm --filter @pawfectmatch/mobile typecheck` returns 0; no jest/detox type clashes.

## 4. Lint Compliance and Strict Safety

- Keep strict rules; remove violations (no relaxations). Add typed adapters for 3rd-party surfaces to eliminate `no-unsafe-*`.
- Acceptance: `pnpm --filter @pawfectmatch/mobile lint:check` returns 0.

## 5. Unit/Integration Tests and Coverage

- Ensure services/ui/integration projects run green. Update mocks/snapshots post-migration.
- Thresholds: global ≥ 75%, changed lines ≥ 90%.
- Acceptance: `pnpm --filter @pawfectmatch/mobile test:ci` green with thresholds.

## 6. Contracts and Mocks (GDPR + Chat)

- Validate contracts and mocks per `AGENTS.md`:
- GDPR: delete/export/confirm endpoints + client services with zod validation.
- Chat: reactions/attachments/voice-note parity.
- Acceptance: `pnpm --filter @pawfectmatch/mobile mobile:contract:check` green; integration covers happy/error paths.

## 7. A11y, Performance, Security Audits

- A11y: roles/labels/contrast/reduce-motion.
- Perf: budget, traces (60fps, bundle delta < +200KB).
- Security: PII, SSL pinning, secrets scanning.
- Reports: `apps/mobile/reports/ACCESSIBILITY.md`, `perf_budget.json`, `security_scan.md`.
- Acceptance: `mobile:a11y`, `mobile:perf:verify`, `mobile:security` pass with no blockers.

## 8. E2E Golden Paths (Detox)

- Run Auth, Swipe→Match, Chat, Settings/GDPR, Premium journeys on iOS & Android; save artifacts under `/reports/run/<ts>`.
- Acceptance: E2E pass on both platforms.

## 9. CI/CD Hardening

- Pipeline: typecheck → lint → unit/integration → contracts → a11y/perf/security → e2e (mobile-only).
- Cache & fail-fast; block merges when any gate is red; produce changelog/artifacts.
- Acceptance: all gates green; required checks enforced.

## 10. Release Readiness

- Validate EAS profiles, OTA strategy, and store metadata.
- Acceptance: production build OK; smoke tests pass; release notes generated.

## Hotspot Backlog (next to fix)

- Theme/token cleanup: `components/modals/PasswordConfirmationModal.tsx`, `components/ErrorFallback.tsx`, `components/PhotoUploadComponent.tsx`, `components/ModernPhotoUploadWithEditor.tsx`, `components/chat/VoiceRecorderUltra.tsx`, `components/map/*`, `components/Premium/PremiumGate.tsx`.
- Gradients: ensure `getPremiumGradients` maps to `theme.palette.gradients.*`.
- Test type isolation: add `tsconfig.test.json`, `tsconfig.e2e.json`; move Detox types out of main typecheck.
- Web-only files: exclude `apps/mobile/web/**` from app TS; fence any `.web.tsx` uses.
- Core API typing: fix `packages/core/src/api/UnifiedAPIClient.ts` for `exactOptionalPropertyTypes`.

## Reference Commands

- Theme/search loops:
- `rg -n "Theme\\." apps/mobile/src`
- `rg -n "colors\\.(white|neutral|gray|secondary|error|black)" apps/mobile/src`
- `rg -n "spacing\\[\"4xl\"\]|\\bpadding: \\d+|\\bmargin: \\d+" apps/mobile/src`
- Type/Lint/Tests:
- `pnpm --filter @pawfectmatch/mobile typecheck`
- `pnpm --filter @pawfectmatch/mobile lint:check`
- `pnpm --filter @pawfectmatch/mobile test:ci`
- Audits:
- `pnpm --filter @pawfectmatch/mobile mobile:contract:check`
- `pnpm --filter @pawfectmatch/mobile mobile:a11y`
- `pnpm --filter @pawfectmatch/mobile mobile:perf:verify`
- `pnpm --filter @pawfectmatch/mobile mobile:security`

## Artifacts (per phase)

- Reports: `apps/mobile/reports/{ACCESSIBILITY.md, perf_budget.json, security_scan.md, telemetry_coverage.md}`
- Contracts/mocks: `/contracts/openapi.yaml` (if present), `apps/mobile/scripts/mock-server.ts`, `apps/mobile/reports/contract_results.json`
- Graphs/Maps: `/reports/{product_model.json, navigation_graph.json, code_graph.json, exports_inventory.json}`
- Gaps: `/reports/gap_log.yaml` (updated with severities + acceptance)
- Tests: unit/integration under `apps/mobile/src/**/__tests__`, Detox artifacts under `/reports/run/*`
# 🎯 Production-Ready Plan: Mobile App (Strict, Final)

**Status**: Active Execution  
**Scope**: `apps/mobile` only  
**React Version**: 18.2 (pinned for Expo SDK 49/RN 0.72)  
**Last Updated**: 2025-01-27

---

## 0. ✅ Foundations and Scope [COMPLETE]

- [x] Workspace scoped to `apps/mobile`
- [x] React 18.2 pinned to match Expo SDK 49/RN 0.72
- [x] Workspace installs successfully
- [x] Mobile dev server runs

**Acceptance**: ✅ Workspace installs and mobile dev server run.

---

## 1. Semantic Theme Migration (PHASE 1)

### Status: 🟡 IN PROGRESS

### Targets Identified:
- `apps/mobile/src/components/widgets/{EventWidget.tsx,MatchWidget.tsx,SwipeWidget.tsx}`
- `apps/mobile/src/screens/admin/**`
- `apps/mobile/src/screens/adoption/**`
- `apps/mobile/src/screens/ai/**`
- `apps/mobile/src/screens/onboarding/**`
- `apps/mobile/src/screens/premium/**`
- `apps/mobile/src/screens/ManageSubscriptionScreen.tsx`
- `apps/mobile/src/screens/NotificationPreferencesScreen.tsx`
- `apps/mobile/src/screens/HelpSupportScreen.tsx`

### Actions Required:
1. ✅ Import `useTheme` from `@/theme`
2. ✅ Declare `const theme = useTheme()` at top of component body
3. ✅ Replace legacy color calls:
   - `theme.colors.text.primary` → `theme.colors.onSurface`
   - `theme.colors.text.secondary` → `theme.colors.onMuted`
   - `colors.secondary[500]`, `colors.error`, `colors.grayXXX`, `colors.white`, `colors.neutral.*` → semantic tokens
4. ✅ Cards: `background = theme.colors.surface`, `text = theme.colors.onSurface`
5. ✅ Gradients: `theme.palette.gradients.*` instead of hard-coded arrays
6. ✅ Spacing/Radius: Remove inline math, use only `spacing.{xs…4xl}` and `radii.{xs…full}`
7. ✅ Navigation theme: Use `useTheme as useNavigationTheme` to avoid hook collisions

### Post-Edit Validation:
```bash
pnpm --filter @pawfectmatch/mobile typecheck
pnpm --filter @pawfectmatch/mobile lint:check
```

**Acceptance**: 
- ✅ All touched files pass ESLint local rules (`no-theme-namespace`, `no-hardcoded-colors`)
- ✅ Zero legacy color usage in migrated files
- ✅ `pnpm typecheck:mobile` passes
- ✅ `pnpm lint:check` passes

---

## 2. Platform Fencing and Upload Adapters (PHASE 4 Preview)

### Status: 🔴 TODO

### Actions Required:
1. **Fence web-only APIs into `.web.ts[x]`**:
   - `window`, `AudioBuffer`, `MediaRecorder`
   - Canvas/image processing pipelines
   - Web-specific processing utilities

2. **Upload Strategy**:
   - Native: `FormData` + file URI
   - Web: `Blob`
   - Expose typed `UploadAdapter` interface so components never use unsafe casts

3. **Type Safety**:
   - Remove `window` types from native files
   - Remove `AudioBuffer`, `BodyInit`, `Blob` confusion from native
   - Use Expo `LocalAuthentication.SecurityLevel` instead of raw `SecurityLevel.BIOMETRIC`

### Files to Audit:
- `apps/mobile/src/services/**/*.ts`
- `apps/mobile/src/utils/**/*.ts`
- `apps/mobile/src/components/**/*.tsx`

**Acceptance**:
- ✅ No `window`/web types in native files
- ✅ Upload flows compile and pass tests on both platforms
- ✅ `pnpm typecheck:mobile` passes with no web-only type errors

---

## 3. TypeScript Project Structure and Test Isolation

### Status: 🟢 MOSTLY COMPLETE

### Current State:
- ✅ `tsconfig.app.json` (app code only)
- ✅ `tsconfig.test.json` (jest unit/integration with `types: ["jest", "node"]`)
- ✅ `tsconfig.e2e.json` (Detox with `types: ["detox", "jest", "node"]`)

### Actions Required:
1. ✅ Verify `tsconfig.app.json` excludes:
   - `**/__tests__/**`
   - `**/*.test.ts*`
   - `**/*.spec.ts*`
   - `e2e/**`
   - `web/**`
   - `src/**/*.web.*`

2. ✅ Update scripts:
   - `mobile:typecheck` → app + unit/integration configs (not e2e)
   - E2E compile/lint runs with detox config only in e2e jobs

**Acceptance**:
- ✅ `pnpm --filter @pawfectmatch/mobile typecheck` returns 0
- ✅ Detox/jest types no longer clash
- ✅ App code isolated from test types

---

## 4. Lint Compliance and Strict Safety

### Status: 🟡 IN PROGRESS

### Actions Required:
1. ✅ Keep local rules as errors (no relaxing)
2. ✅ Eliminate all violations:
   - `no-unsafe-*` infractions
   - Typed adapters to remove unsafe casts
   - Theme namespace violations
   - Hardcoded color violations

### Local Rules to Enforce:
- `no-theme-namespace` (error)
- `no-hardcoded-colors` (error)
- `no-unsafe-*` (error)

**Acceptance**:
- ✅ `pnpm --filter @pawfectmatch/mobile lint:check` returns 0
- ✅ Zero ESLint violations
- ✅ All unsafe casts eliminated

---

## 5. Unit/Integration Tests and Coverage

### Status: 🟡 NEEDS VERIFICATION

### Actions Required:
1. ✅ Ensure Jest projects (services/ui/integration) run green
2. ✅ Coverage thresholds:
   - Global ≥ **75%**
   - Changed lines ≥ **90%**
3. ✅ Fix failing tests from theme/spacing/upload changes:
   - Update mocks
   - Update snapshots
   - Fix type assertions

### Test Commands:
```bash
pnpm --filter @pawfectmatch/mobile test:services
pnpm --filter @pawfectmatch/mobile test:ui
pnpm --filter @pawfectmatch/mobile test:integration
pnpm --filter @pawfectmatch/mobile test:ci
```

**Acceptance**:
- ✅ `pnpm --filter @pawfectmatch/mobile test:ci` green with thresholds
- ✅ All snapshots updated
- ✅ All mocks aligned with new theme structure

---

## 6. Contracts and Mocks (GDPR + Chat Enhancements)

### Status: 🔴 TODO

### GDPR Contracts Required:
1. **Endpoints**:
   - `DELETE /users/delete-account` → `{ success, message, gracePeriodEndsAt }`
   - `GET /users/export-data` → blob/json export
   - `POST /users/confirm-deletion` → `{ success }`

2. **Client Services**:
   - `deleteAccount({ password, reason?, feedback? })`
   - `exportUserData()`
   - `confirmDeleteAccount(token)`

3. **Validation**: Zod schemas for all request/response types

### Chat Enhancements:
1. **Reactions**: `sendReaction(messageId, reaction)`
2. **Attachments**: `sendAttachment(messageId, file)`
3. **Voice Notes**: `sendVoiceNote(messageId, audioUri)`

### Mock Server:
- Wire mock routes in `/scripts/mock-server.ts`
- Create fixtures under `/simulations/fixtures/gdpr/*.json`
- Create fixtures under `/simulations/fixtures/chat/*.json`

**Acceptance**:
- ✅ `pnpm --filter @pawfectmatch/mobile mobile:contract:check` green
- ✅ Integration tests cover happy/error flows
- ✅ All contracts validated with Zod

---

## 7. A11y, Performance, and Security Audits

### Status: 🔴 TODO

### A11y Audit:
1. ✅ Roles/labels/contrast/reduce-motion/target sizes
2. ✅ Generate `apps/mobile/reports/ACCESSIBILITY.md`
3. ✅ List blocking issues

### Performance Audit:
1. ✅ Budget and traces
2. ✅ Generate `apps/mobile/reports/perf_budget.json`
3. ✅ Ensure 60fps interactions
4. ✅ Bundle delta < +200KB

### Security Audit:
1. ✅ PII audit
2. ✅ SSL pinning checks
3. ✅ Secrets checks
4. ✅ Generate `apps/mobile/reports/security_scan.md`

**Acceptance**:
- ✅ `pnpm --filter @pawfectmatch/mobile mobile:a11y` pass with 0 critical
- ✅ `pnpm --filter @pawfectmatch/mobile mobile:perf:verify` pass
- ✅ `pnpm --filter @pawfectmatch/mobile mobile:security` pass with no blockers

---

## 8. E2E Golden Paths (Detox)

### Status: 🟡 NEEDS VERIFICATION

### Actions Required:
1. ✅ Build simulators/emulators
2. ✅ Run golden paths:
   - Auth flow
   - Swipe → Match flow
   - Chat flow
   - Settings/GDPR flow
   - Premium flow
3. ✅ Save artifacts: videos/screenshots in `/reports/run/<timestamp>`

### E2E Commands:
```bash
pnpm --filter @pawfectmatch/mobile e2e:build:ios:cloud
pnpm --filter @pawfectmatch/mobile e2e:build:android:cloud
pnpm --filter @pawfectmatch/mobile e2e:ios
pnpm --filter @pawfectmatch/mobile e2e:android
```

**Acceptance**:
- ✅ iOS + Android E2E pass
- ✅ All golden paths covered
- ✅ Artifacts saved and reviewed

---

## 9. CI/CD Hardening

### Status: 🔴 TODO

### Pipeline Gates (in order):
1. ✅ Typecheck (`mobile:typecheck`)
2. ✅ Lint (`mobile:lint`)
3. ✅ Unit/Integration (`test:ci`)
4. ✅ Contracts (`mobile:contract:check`)
5. ✅ A11y/Perf/Security (`mobile:a11y`, `mobile:perf:verify`, `mobile:security`)
6. ✅ E2E (Detox golden paths)

### CI Features:
- ✅ Cache dependencies
- ✅ Fail-fast gates
- ✅ Changelog generation
- ✅ Artifact uploads

**Acceptance**:
- ✅ All gates green
- ✅ CI required checks blocking merges
- ✅ Artifacts properly uploaded

---

## 10. Release Readiness

### Status: 🔴 TODO

### Actions Required:
1. ✅ EAS build profiles validated
2. ✅ OTA strategy defined
3. ✅ Store metadata checks:
   - App Store screenshots
   - Play Store screenshots
   - Privacy policy URLs
   - Data safety forms
4. ✅ Production build succeeds
5. ✅ Smoke test OK
6. ✅ Release notes generated

**Acceptance**:
- ✅ Production build succeeds
- ✅ Smoke test OK
- ✅ Release notes generated
- ✅ Store metadata validated

---

## Hotspot Backlog (Fix Next)

### Critical Issues:
1. Legacy theme patterns still exist in:
   - `apps/mobile/src/components/widgets/**`
   - `apps/mobile/src/screens/admin/**`
   - `apps/mobile/src/screens/adoption/**`
   - `apps/mobile/src/screens/ai/**`
   - `apps/mobile/src/screens/onboarding/**`
   - `apps/mobile/src/screens/premium/**`

2. Platform fencing needed in:
   - Upload services
   - Audio processing
   - Image processing

3. GDPR contracts missing:
   - Delete account endpoint
   - Export data endpoint
   - Confirm deletion endpoint

4. Chat enhancements missing:
   - Reactions
   - Attachments
   - Voice notes

---

## Execution Order

1. **PHASE 1**: Semantic theme migration (complete remaining files)
2. **PHASE 4**: Platform fencing (upload adapters, web-only APIs)
3. **TypeScript**: Verify isolation (already mostly done)
4. **Lint**: Fix all violations (parallel with PHASE 1)
5. **Tests**: Fix failures, update snapshots (parallel with PHASE 1)
6. **Contracts**: GDPR + Chat (after PHASE 1)
7. **Audits**: A11y/Perf/Security (after tests green)
8. **E2E**: Golden paths (after audits)
9. **CI/CD**: Pipeline hardening (after E2E)
10. **Release**: Final validation (after CI/CD)

---

## Quality Gates Summary

- ✅ **TypeScript**: `pnpm typecheck:mobile` → 0 errors
- ✅ **ESLint**: `pnpm lint:check` → 0 violations
- ✅ **Tests**: Coverage ≥ 75% global, ≥ 90% changed lines
- ✅ **A11y**: 0 critical issues
- ✅ **Perf**: 60fps, bundle delta < +200KB
- ✅ **Security**: No blockers
- ✅ **E2E**: iOS + Android pass
- ✅ **CI/CD**: All gates green

---

**Last Execution**: TBD  
**Next Review**: After PHASE 1 completion


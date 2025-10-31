# Comprehensive Test Fix Plan

## Executive Summary

**Current Status:**
- ✅ Static checks passing (TypeScript, ESLint)
- ✅ Test infrastructure fixed (Jest config, setup files)
- ⚠️ **512 test suites failing, 83 tests total (58 failed, 25 passed)**
- 🎯 **Goal: ≥90% coverage, all tests green, deterministic runs**

---

## Phase 1: Analysis & Categorization (Priority: CRITICAL)

### 1.1 Automated Failure Pattern Detection

**Script:** `scripts/analyze-test-failures.mjs`

**Tasks:**
1. Run all tests with `--listTests` to get full test inventory
2. Run with `--verbose` to capture all error messages
3. Parse failures and categorize by:
   - **Module resolution errors** (Cannot find module...)
   - **Mock setup errors** (jest.mock hoisting issues)
   - **API/type mismatches** (wrong function names, missing exports)
   - **Async/timing issues** (waitForNextUpdate, act warnings)
   - **Theme/provider errors** (missing theme context)
   - **React Native component errors** (View, Text, etc.)

**Expected Output:** `reports/test-failure-categories.json`

```json
{
  "moduleResolution": { "count": 150, "files": [...] },
  "mockSetup": { "count": 200, "files": [...] },
  "apiMismatches": { "count": 80, "files": [...] },
  "asyncTiming": { "count": 50, "files": [...] },
  "themeProvider": { "count": 30, "files": [...] },
  "reactNative": { "count": 2, "files": [...] }
}
```

### 1.2 Create Test Failure Database

**File:** `reports/test-failures-db.json`

**Structure:**
```json
{
  "testFile": "apps/mobile/src/hooks/__tests__/usePremiumStatus.test.ts",
  "category": "apiMismatches",
  "errors": [
    {
      "type": "ImportError",
      "message": "Cannot find module '@/services/premiumService'",
      "fix": "Update import to '@/services/PremiumService'",
      "pattern": "premiumService → PremiumService",
      "priority": "high"
    }
  ],
  "status": "pending",
  "estimatedFixTime": "5min"
}
```

---

## Phase 2: High-Impact Quick Wins (Priority: HIGH)

### 2.1 Fix Common Import Path Issues

**Pattern:** File casing conflicts, wrong aliases

**Automated Fix Script:** `scripts/fix-import-paths.mjs`

**Common Issues:**
- `@/services/premiumService` → `@/services/PremiumService`
- `@mobile/theme` → `@/theme`
- `../theme/unified-theme` → `@/theme`

**Expected Impact:** Fix ~150 failing tests

### 2.2 Replace Deprecated Testing APIs

**Pattern:** `waitForNextUpdate` → `waitFor`

**Automated Fix Script:** `scripts/fix-wait-for-next-update.mjs`

**Regex Pattern:**
```javascript
// Find:
const { result, waitForNextUpdate } = renderHook(...);
await waitForNextUpdate();

// Replace:
const { result } = renderHook(...);
await waitFor(() => {
  expect(result.current).toBe(...);
});
```

**Expected Impact:** Fix ~50 async test failures

### 2.3 Fix Function Name Mismatches

**Pattern:** Tests calling wrong function names

**Common Mismatches:**
- `useReducedMotion()` → `useReduceMotion()`
- `premiumService.*` → `premiumService.*` (check actual exports)
- Theme hooks: `useTheme()` vs `useExtendedTheme()`

**Fix Method:** Manual audit + targeted codemods

**Expected Impact:** Fix ~80 test failures

---

## Phase 3: Mock Infrastructure Hardening (Priority: HIGH)

### 3.1 Standardize Mock Patterns

**Create:** `apps/mobile/src/__mocks__/index.ts`

**Standard Mocks Needed:**
- ✅ Theme system (fixed)
- ⚠️ Navigation system (partial)
- ⚠️ Services (API, Premium, etc.)
- ⚠️ Expo modules (comprehensive)
- ⚠️ React Native components

### 3.2 Fix Mock Hoisting Issues

**Problem:** `jest.mock()` calls need to be at top level

**Solution:** Move all mocks to `jest.setup.ts` or use `jest.mock()` with proper hoisting

**Pattern:**
```typescript
// ❌ BAD - Inside describe block
describe('MyComponent', () => {
  jest.mock('@/services/api', () => ({...}));
});

// ✅ GOOD - At top level
jest.mock('@/services/api', () => ({...}));
describe('MyComponent', () => {
  // tests
});
```

**Script:** `scripts/fix-mock-hoisting.mjs`

**Expected Impact:** Fix ~200 test failures

### 3.3 Create Mock Factories

**File:** `apps/mobile/src/__mocks__/factories.ts`

**Purpose:** Reusable mock creators for common patterns

**Example:**
```typescript
export function createMockTheme(overrides = {}) {
  return {
    colors: { ...defaultColors, ...overrides.colors },
    spacing: defaultSpacing,
    ...overrides
  };
}

export function createMockNavigation() {
  return {
    navigate: jest.fn(),
    goBack: jest.fn(),
    // ...
  };
}
```

---

## Phase 4: Component & Hook Test Fixes (Priority: MEDIUM)

### 4.1 Fix Theme Provider Wrapping

**Pattern:** Components need `ThemeProvider` wrapper in tests

**Script:** `scripts/fix-theme-provider-wrapping.mjs`

**Fix Pattern:**
```typescript
// ❌ BAD
const { getByText } = render(<MyComponent />);

// ✅ GOOD
const { getByText } = render(
  <ThemeProvider>
    <MyComponent />
  </ThemeProvider>
);
```

**Expected Impact:** Fix ~30 component test failures

### 4.2 Fix Navigation Context

**Pattern:** Components using `useNavigation()` need wrapper

**Helper:** Create `test-utils/render-with-navigation.tsx`

**Expected Impact:** Fix ~20 navigation-related failures

### 4.3 Fix Async Hook Tests

**Pattern:** Hooks with async effects need proper waiting

**Fix Template:**
```typescript
it('handles async data', async () => {
  const { result } = renderHook(() => useAsyncHook());
  
  // Wait for async to complete
  await waitFor(() => {
    expect(result.current.isLoading).toBe(false);
  });
  
  expect(result.current.data).toBeDefined();
});
```

**Expected Impact:** Fix ~40 hook test failures

---

## Phase 5: Integration Test Fixes (Priority: MEDIUM)

### 5.1 Fix Integration Test Setup

**Files:** `apps/mobile/src/__tests__/integration/**/*.test.tsx`

**Common Issues:**
- Missing provider trees
- Async operations not awaited
- Mock services not properly configured

**Approach:** One-by-one manual fixes (too complex for automation)

**Estimated:** 10-15 integration test files

### 5.2 Create Integration Test Utilities

**File:** `apps/mobile/src/test-utils/integration-helpers.tsx`

**Utilities:**
- `renderWithProviders()` - Full app tree with all providers
- `createMockStore()` - Zustand store for tests
- `waitForQuery()` - React Query async helpers

---

## Phase 6: Coverage Gaps (Priority: MEDIUM)

### 6.1 Identify Low Coverage Files

**Command:**
```bash
pnpm test:unit --coverage --coverageReporters=json
```

**Analysis:** `scripts/analyze-coverage-gaps.mjs`

**Target Files:**
- `apps/mobile/src/components/animation/Ultra-page-transitions.refactored.tsx`
- Service files with < 75% coverage
- Complex hooks without tests

### 6.2 Add Missing Tests

**Priorities:**
1. **Critical Path Components** (swipe, match, chat)
2. **Services** (API calls, state management)
3. **Hooks** (business logic hooks)
4. **Utilities** (helper functions)

**Template:** Use `useReducedMotion.test.ts` as reference pattern

---

## Phase 7: E2E Test Fixes (Priority: LOW - After unit tests)

### 7.1 Detox Configuration

**Check:** `apps/mobile/detox.config.js`

**Issues:**
- Build configurations
- Simulator/emulator setup
- Test timeouts

### 7.2 Fix Flaky E2E Tests

**Common Causes:**
- Animation timing (add `--reduced-motion`)
- Network delays (increase timeouts)
- Async state updates (add proper waits)

---

## Phase 8: CI/CD Integration (Priority: HIGH)

### 8.1 GitHub Actions Workflow

**File:** `.github/workflows/test.yml`

**Requirements:**
- Run tests on PR
- Generate coverage reports
- Fail PR if coverage < 90%
- Upload test artifacts

### 8.2 Pre-commit Hooks

**File:** `.husky/pre-commit`

**Checks:**
- Run affected tests only
- Typecheck
- Lint
- Prevent `test.skip()` or `test.only()`

---

## Execution Strategy

### Weekly Sprints

**Week 1: Quick Wins**
- ✅ Complete Phase 1 (Analysis)
- ✅ Complete Phase 2 (Import paths, deprecated APIs)
- Target: Reduce failures from 512 → ~300

**Week 2: Mock Infrastructure**
- ✅ Complete Phase 3 (Mock hardening)
- Target: Reduce failures from 300 → ~150

**Week 3: Component Tests**
- ✅ Complete Phase 4 (Component/Hook fixes)
- Target: Reduce failures from 150 → ~50

**Week 4: Integration & Coverage**
- ✅ Complete Phase 5 & 6
- Target: All tests green, ≥90% coverage

---

## Tooling Scripts to Create

### 1. `scripts/analyze-test-failures.mjs`
Analyze Jest output and categorize failures

### 2. `scripts/fix-import-paths.mjs`
Automated import path corrections

### 3. `scripts/fix-wait-for-next-update.mjs`
Replace deprecated async testing patterns

### 4. `scripts/fix-mock-hoisting.mjs`
Move mocks to proper locations

### 5. `scripts/test-fix-status.mjs`
Track progress, generate reports

### 6. `scripts/coverage-gap-analysis.mjs`
Identify files needing tests

---

## Success Metrics

### Phase Gates

| Phase | Target | Success Criteria |
|-------|--------|------------------|
| Phase 1 | Analysis complete | Failure categories identified |
| Phase 2 | Quick wins | < 300 failing suites |
| Phase 3 | Mock hardening | < 150 failing suites |
| Phase 4 | Component tests | < 50 failing suites |
| Phase 5 | Integration | < 20 failing suites |
| Phase 6 | Coverage | ≥90% total coverage |
| Phase 7 | E2E | All E2E tests passing |
| Phase 8 | CI/CD | Green CI pipeline |

### Final Gate

✅ **All tests passing**
✅ **≥90% coverage**
✅ **No skipped tests**
✅ **Deterministic runs**
✅ **CI/CD green**
✅ **Zero lint/type errors**

---

## Risk Mitigation

### Risk 1: Breaking Changes During Fixes
**Mitigation:** Fix tests, not source code (unless test is provably wrong)

### Risk 2: Time Estimation
**Mitigation:** Focus on high-impact automated fixes first

### Risk 3: Test Flakiness
**Mitigation:** Use `--runInBand`, proper async handling, deterministic mocks

### Risk 4: Coverage Regression
**Mitigation:** Set coverage thresholds, fail PR if below 90%

---

## Next Steps (Immediate)

1. ✅ Run failure analysis script
2. ✅ Generate failure database
3. ✅ Create automated fix scripts
4. ✅ Start with Phase 2 quick wins
5. ✅ Track progress in `TEST_FIX_PROGRESS.md`

---

## References

- Fixed test example: `apps/mobile/src/hooks/__tests__/useReducedMotion.test.ts`
- Mock setup: `apps/mobile/jest.setup.ts`
- Test utilities: `apps/mobile/src/hooks/utils/__tests__/test-utilities.ts`

---

**Last Updated:** 2025-01-31
**Status:** In Progress - Phase 1


---
description: xaxaxaxa
auto_execution_mode: 3
---

# God-Phase Production Hardening Plan

## Overview

This plan implements the ultimate "God Phase" configuration for the PawfectMatch monorepo: zero `any`, zero `eslint-disable`, full TypeScript strictness, UI consistency, security hardening, and ≥80% test coverage. We'll fix 4,172+ errors sequentially by workspace (Mobile → Web → Shared Packages) while integrating security, testing, and UI modernization throughout.

## Current State

- **Lint Errors**: 4,172 errors (mobile only analyzed)
- **TypeScript Errors**: 949 errors (mobile only)
- **Test Coverage**: Unknown (failing)
- **Security**: 11 vulnerabilities identified
- **God Components**: ~50+ files >200 LOC need decomposition
- **CI/CD**: Basic quality-gate.yml exists but not enforcing zero-tolerance

## Strategy

**Sequential Workspace Approach**: Mobile (Phase 1-2) → Web (Phase 3) → Shared Packages (Phase 3) → Final Hardening (Phase 4-7)

**Integrated Execution**: For each file touched, simultaneously:

1. Fix lint/type errors
2. Apply security controls
3. Write/fix tests (maintain ≥80%)
4. Refactor god-components with design tokens
5. Document changes

## Phase 1: Mobile Baseline Assessment & Critical Services (Week 1)

### 1.1 Comprehensive Baseline Audit

**Execute audit commands**:

```bash
cd /Users/elvira/Downloads/pets-pr-1
pnpm --filter @pawfectmatch/mobile lint --report-unused-disable-directives > logs/mobile-lint-baseline.log 2>&1 || true
pnpm --filter @pawfectmatch/mobile type-check > logs/mobile-type-baseline.log 2>&1 || true
pnpm --filter @pawfectmatch/mobile test --coverage --json > logs/mobile-test-baseline.json 2>&1 || true
pnpm audit --recursive --json > logs/security-audit-baseline.json 2>&1 || true
```

**Document in `docs/lint-remediation.md`**:

- Categorize errors by rule family (unsafe types, strict booleans, async, console, etc.)
- Create error count table by category
- Flag all `eslint-disable`, `@ts-ignore`, `@ts-expect-error` comments
- Identify god components >200 LOC in `apps/mobile/src/screens/` and `apps/mobile/src/components/`

**Update `docs/production-readiness.md`**:

- Baseline metrics: lint count, type errors, test coverage %, security vulnerabilities
- Risk assessment: blockers, high-risk god components
- Success criteria checklist

**Setup security infrastructure**:

- Install `gitleaks`: Add to devDependencies, create `.gitleaks.toml` config
- Run: `pnpm exec gitleaks detect --source . --report-path=reports/gitleaks-baseline.json`
- Document findings in `docs/security/secrets-scan.md`

**Files Created/Modified**:

- `docs/lint-remediation.md` (update with detailed categories)
- `docs/production-readiness.md` (update with baselines)
- `docs/security/secrets-scan.md` (new)
- `logs/mobile-lint-baseline.log` (new)
- `logs/mobile-type-baseline.log` (new)
- `logs/mobile-test-baseline.json` (new)
- `logs/security-audit-baseline.json` (new)

### 1.2 Mobile Services Layer Hardening

**Target Files** (apps/mobile/src/services/):

- `pushNotificationService.ts`
- `notifications.ts`
- `offlineService.ts`
- `logger.ts`
- `api.ts`
- `apiClient.ts`
- `errorHandler.ts`

**For Each Service File**:

1. **Fix Unsafe Types**:

   - Replace `any` with proper interfaces/types
   - Add explicit error types: `interface ServiceError { code: string; message: string; }`
   - Use strict type guards: `if (data !== null && data !== undefined && typeof data === 'object')`

2. **Strict Boolean Expressions**:

   - Replace `if (value)` with `if (value !== null && value !== undefined)`
   - For strings: `if (str !== null && str !== undefined && str !== '')`
   - For arrays: `if (arr !== null && arr !== undefined && arr.length > 0)`

3. **Async/Await Consistency**:

   - Add `await` to all Promise-returning calls
   - Remove `async` from functions with no awaits
   - Wrap floating promises: `void asyncCall()` or `asyncCall().catch(handleError)`

4. **Console Replacement**:

   - Replace all `console.log()` with `logger.debug()`
   - Replace all `console.error()` with `logger.error()`
   - Ensure `logger.ts` uses enum for log levels: `enum LogLevel { DEBUG, INFO, WARN, ERROR }`

5. **Security Controls** (per file):

   - `api.ts`: Add rate limiting config, HTTPS enforcement, request timeout
   - `logger.ts`: Ensure no PII in logs, structured logging format
   - `pushNotificationService.ts`: Validate tokens, secure storage references

6. **Testing** (per file):

   - Write/fix unit tests in `apps/mobile/src/services/__tests__/`
   - Mock async operations, test error paths
   - Ensure ≥80% coverage per file

**Validation After Each File**:

```bash
pnpm exec eslint apps/mobile/src/services/[filename].ts --fix
pnpm --filter @pawfectmatch/mobile type-check
pnpm --filter @pawfectmatch/mobile test services/__tests__/[filename].test.ts
```

**Files Modified**: ~7 service files + ~7 test files

### 1.3 Mobile Utilities & State Management

**Target Files** (apps/mobile/src/utils/):

- `deepLinking.ts`
- `haptics.ts` (or `hapticFeedback.ts`)
- `secureStorage.ts`

**Target Files** (apps/mobile/src/store/ and apps/mobile/src/stores/):

- All store files (identify via `grep -r "create.*Store" apps/mobile/src/`)

**For Each Utility/Store File**:

1. **Explicit Null Checks**: Replace truthy guards with explicit checks
2. **Typed Returns**: Ensure all functions have return types (inferred or explicit)
3. **Store Typing**:

   - Define state interfaces
   - Type actions and selectors
   - Add Zustand persist config with secure storage (use `secureStorage.ts`)

4. **Security**:

   - `secureStorage.ts`: Ensure Keychain/Keystore usage, no AsyncStorage for sensitive data
   - `deepLinking.ts`: Validate URLs, sanitize parameters

**Validation**:

```bash
pnpm exec eslint apps/mobile/src/utils/**/*.ts apps/mobile/src/store/**/*.ts --fix
pnpm --filter @pawfectmatch/mobile type-check
pnpm --filter @pawfectmatch/mobile test
```

**Files Modified**: ~3 utils + ~5 stores + tests

### 1.4 Mobile Types & Styling Alignment

**Target Files** (apps/mobile/src/types/):

- `common.ts`
- `premium-components.ts`
- `expo-components.d.ts`
- All other type files

**Fixes**:

- Import React where JSX is used: `import React from 'react';`
- Replace `{}` with `Record<string, unknown>` or specific interface
- Deduplicate type declarations (check for conflicts)
- Remove unused types

**Target Files** (apps/mobile/src/styles/):

- `EnhancedDesignTokens.ts`
- `GlobalStyles.ts`

**Fixes**:

- Align with `packages/design-tokens/src/index.ts` (single source of truth)
- Remove magic numbers: `16` → `tokens.spacing.md`
- Remove unsafe optional chains on style objects
- Purge unused exports

**Validation**:

```bash
pnpm exec eslint apps/mobile/src/types/**/*.ts apps/mobile/src/styles/**/*.ts --fix
pnpm --filter @pawfectmatch/mobile type-check
```

**Files Modified**: ~9 type files + ~3 style files

### 1.5 Mobile Testing Infrastructure

**Setup**:

- Validate `apps/mobile/src/setupTests.ts` exists and properly configured
- Create `apps/mobile/src/global.d.ts` if needed for Jest globals:
  ```typescript
  declare global {
    const __DEV__: boolean;
    namespace jest {
      // Jest types
    }
  }
  ```

- Update `eslint.config.js` to include test setup files in parser project paths

**Run Tests**:

```bash
pnpm --filter @pawfectmatch/mobile test --runInBand --coverage
```

**Document coverage gaps in `docs/testing-strategy.md`**

**Files Modified**: `setupTests.ts`, `global.d.ts` (new), `eslint.config.js`

---

## Phase 2: Mobile God-Component Decomposition & Performance (Week 2)

### 2.1 Identify & Catalog God Components

**Run analysis**:

```bash
find apps/mobile/src/screens -name "*.tsx" -exec wc -l {} \; | awk '$1 > 200 {print $1, $2}'
find apps/mobile/src/components -name "*.tsx" -exec wc -l {} \; | awk '$1 > 200 {print $1, $2}'
```

**Document in `docs/ui-unification.md`**:

- List all files >200 LOC with current line count
- Categorize by violation type: mixed concerns, logic + UI, no design tokens

### 2.2 Refactor God Components (Top 10 Priority)

**Strategy for Each Component**:

1. **Extract Data Hooks**:

   - Create `apps/mobile/src/hooks/use[ComponentName]Data.ts`
   - Move API calls, state management, business logic to hook
   - Return typed data + loading + error states

2. **Create Presentational Subcomponents**:

   - Extract UI sections into `apps/mobile/src/components/[Component]/[Section].tsx`
   - Accept props only, no logic
   - Use design tokens: import from `@pawfectmatch/design-tokens`

3. **Apply Design Tokens**:

   - Replace inline styles: `{ padding: 16 }` → `{ padding: tokens.spacing.md }`
   - Use theme colors: `colors.primary` from design-tokens
   - Use typography scale: `tokens.typography.heading1`

4. **Fix Lint/Type Errors**:

   - Apply all strict rules from Phase 1
   - Ensure no `any`, strict booleans, typed props

5. **Add Tests**:

   - Test hook separately in `apps/mobile/src/hooks/__tests__/`
   - Test presentational components in `apps/mobile/src/components/[Component]/__tests__/`
   - Snapshot tests for UI regression

6. **Security Controls** (if applicable):

   - Root/jailbreak detection in security-sensitive screens
   - Certificate pinning verification in network-dependent screens

**Example God Components to Target**:

- `AdminDashboardScreen.tsx`
- `PhotoUploadScreen.tsx` (if exists)
- `StoriesScreen.tsx`
- Heavy chat screens
- Profile editor screens

**Validation After Each Component**:

```bash
pnpm exec eslint apps/mobile/src/screens/[Component].tsx --fix
pnpm exec eslint apps/mobile/src/hooks/use[Component]Data.ts --fix
pnpm exec eslint apps/mobile/src/components/[Component]/**/*.tsx --fix
pnpm --filter @pawfectmatch/mobile type-check
pnpm --filter @pawfectmatch/mobile test [Component]
```

**Files Modified**: ~10 god components → ~30 new files (hooks + subcomponents)

### 2.3 Performance Optimization

**Integrate TanStack Query**:

- Install: `pnpm add @tanstack/react-query --filter @pawfectmatch/mobile`
- Create `apps/mobile/src/config/queryClient.ts`:
  ```typescript
  import { QueryClient } from '@tanstack/react-query';
  
  export const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000, // 5 minutes
        cacheTime: 10 * 60 * 1000,
        retry: 2,
        refetchOnWindowFocus: false,
      },
    },
  });
  ```

- Wrap app in `QueryClientProvider`
- Convert hooks to use `useQuery` / `useMutation`

**Memoization**:

- Apply `React.memo` to pure presentational components
- Use `useMemo` for expensive calculations
- Use `useCallback` for event handlers passed to children

**Virtualization**:

- Replace long lists with `FlatList` (already React Native, ensure proper memoization)
- Use `getItemLayout` for fixed-height items

**Profile Performance**:

- Use React DevTools Profiler
- Document metrics in `docs/performance-playbook.md`

**Files Modified**: Query client setup, hooks refactored to use Query, multiple components memoized

### 2.4 State Architecture Standardization

**Audit Current State**:

- Identify all Zustand stores
- Identify all React Context providers
- Document in `docs/state-architecture.md`

**Standardize**:

- Consolidate related state into typed Zustand stores
- Remove ad-hoc contexts with unclear lifecycles
- Use TanStack Query for server state (not Zustand)
- Use Zustand for UI state, user preferences, app config

**Persist Critical State**:

- Configure Zustand persist middleware
- Use `secureStorage` adapter for sensitive data (auth tokens, user settings)

**Create `docs/state-architecture.md`**:

- Document all stores: purpose, state shape, actions
- Document when to use Zustand vs Query vs Context
- Provide examples and patterns

**Files Modified**: Store consolidation, new state architecture doc

---

## Phase 3: Web App & Shared Packages Hardening (Week 3)

### 3.1 Web Application Audit & Fixes

**Run Baseline**:


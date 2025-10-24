
**Document in `docs/lint-remediation.md`**:

- Categorize errors by rule family (unsafe types, strict booleans, async, console, etc.)
- Create error count table by category
- Flag all `eslint-disable`, `@ts-ignore`, `@ts-expect-error` comments
- Identify god components >200 LOC in `apps/mobile/src/screens/` and `apps/mobile/src/components/`

**Update `docs/production-readiness.md`**:

- Baseline metrics: lint count, type errors, test coverage %, security vulnerabilities
- Risk assessment: blockers, high-risk god components
- Success criteria checklist

**Setup security infrastructure**:222


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

```bash
pnpm --filter web lint --report-unused-disable-directives > logs/web-lint-baseline.log 2>&1 || true
pnpm --filter web type-check > logs/web-type-baseline.log 2>&1 || true
pnpm --filter web test --coverage --json > logs/web-test-baseline.json 2>&1 || true
```

**Apply Same Strategy as Mobile**:

1. Fix services/utils/contexts (~20 files)
2. Fix pages with lint/type violations (~50 files)
3. Fix components (~80 files)
4. Refactor god components >200 LOC (~10 components)
5. Apply design tokens throughout

**Web-Specific**:

- Next.js pages: Use typed `getServerSideProps` / `getStaticProps`
- Error boundaries: Ensure all routes wrapped
- Security: Add CSP headers, validate in `next.config.js`

**Validation Per Batch**:

```bash
pnpm --filter web lint --max-warnings 0
pnpm --filter web type-check
pnpm --filter web test --coverage
```

**Files Modified**: ~150 web app files

### 3.2 Shared Packages Perfection

**packages/core**:

- Run: `pnpm --filter @pawfectmatch/core lint`
- Fix all unsafe types, strict booleans, async issues
- Ensure exported APIs have comprehensive type safety
- Add/fix tests for all exported functions
- Validate: `pnpm --filter @pawfectmatch/core lint && pnpm --filter @pawfectmatch/core type-check && pnpm --filter @pawfectmatch/core test --coverage`

**packages/ui**:

- Ensure all components use design tokens
- Remove magic numbers, inline styles
- Add accessibility props (`aria-*`, `role`, `tabIndex`)
- Test all components with React Testing Library
- Create Storybook stories for visual regression
- Validate: `pnpm --filter @pawfectmatch/ui lint && pnpm --filter @pawfectmatch/ui type-check && pnpm --filter @pawfectmatch/ui test --coverage`

**packages/ai**:

- Fix unsafe API response handling
- Type all AI service responses
- Add error handling for API failures
- Test with mocked responses
- Validate: `pnpm --filter @pawfectmatch/ai lint && pnpm --filter @pawfectmatch/ai type-check && pnpm --filter @pawfectmatch/ai test --coverage`

**packages/design-tokens**:

- Ensure single source of truth
- Export TypeScript types for all tokens
- Validate token usage with custom ESLint rule (Phase 4)
- Validate: `pnpm --filter @pawfectmatch/design-tokens lint && pnpm --filter @pawfectmatch/design-tokens type-check`

**Files Modified**: ~100 shared package files

### 3.3 Cross-Package Dependency Validation

**Run Dependency Analysis**:

```bash
pnpm why [package-name] # For each major dependency
turbo run build --graph # Visualize build dependencies
```

**Validate**:

- No circular dependencies
- Proper version alignment across workspaces
- Update `tsconfig.json` project references if needed

**Document in `docs/production-readiness.md`**

---

## Phase 4: UI System Unification & Design Tokens (Week 4)

### 4.1 Design Token Enforcement

**Create Custom ESLint Rule** (packages/eslint-config-custom/):

- Detect magic numbers in style objects
- Detect hardcoded colors not from tokens
- Detect hardcoded spacing values
- Provide auto-fix suggestions

**OR Create Codemod** (scripts/codemods/):

- Parse style objects
- Replace magic values with token references
- Run: `pnpm exec jscodeshift -t scripts/codemods/design-tokens.ts apps/mobile/src/**/*.tsx`

**Validate All Components Use Tokens**:

```bash
grep -r "padding: [0-9]" apps/mobile/src/ apps/web/
grep -r "#[0-9a-fA-F]\{6\}" apps/mobile/src/ apps/web/
```

**Files Modified**: All component files (gradual migration)

### 4.2 UI Primitive Library (packages/ui)

**Create Base Primitives**:

- `Button.tsx`: Typed variants, theme colors, accessibility
- `Text.tsx`: Typography scale from tokens
- `Input.tsx`: Controlled component, validation, accessibility
- `Card.tsx`: Elevation from tokens
- `Stack.tsx`, `Grid.tsx`, `Spacer.tsx`: Layout primitives

**Each Primitive**:

- TypeScript strict props
- Design tokens required (no magic values)
- Accessibility props enforced
- Unit tests + Storybook stories
- Visual regression snapshots

**Update All Apps to Use Primitives**:

- Replace custom buttons with `<Button>` from `@pawfectmatch/ui`
- Replace text components with `<Text>` from `@pawfectmatch/ui`

**Files Created**: ~8 primitive components + stories + tests

### 4.3 Storybook Catalog

**Setup Storybook** (if not exists):

```bash
pnpm add -D @storybook/react @storybook/addon-essentials --filter @pawfectmatch/ui
```

**Create Stories**:

- One story per primitive component
- Multiple variants/states per story
- Dark mode variants
- Accessibility testing in Storybook

**Setup Visual Regression**:

- Install Chromatic or Percy
- Configure in CI to run on PRs

**Document in `docs/ui-unification.md`**:

- Before/after screenshots
- Token usage examples
- Component patterns

**Files Created**: Story files, Storybook config

---

## Phase 5: Security Hardening & App Store Readiness (Week 5)

### 5.1 Secrets Management

**Audit for Secrets**:

```bash
pnpm exec gitleaks detect --source . --verbose
```

**Setup Secrets Management**:

- Create `.env.example` templates (no real secrets)
- Document secret management in `docs/security/secrets-policy.md`
- Ensure `.env` in `.gitignore`
- Use environment variables for runtime secrets

**CI/CD Secrets**:

- Document in `docs/security/ci-cd-hardening.md`
- Use GitHub Actions secrets
- Restrict access to production secrets

**Mobile Secrets**:

- Use Keychain (iOS) / Keystore (Android) via `react-native-keychain` or similar
- Never store API keys in code
- Use secure storage for auth tokens

**Files Created**: `.env.example`, secrets documentation

### 5.2 Runtime Protections (Mobile)

**Jailbreak/Root Detection** (apps/mobile/):

- Install: `pnpm add react-native-jailbreak-detect --filter @pawfectmatch/mobile`
- Implement in `apps/mobile/src/utils/deviceSecurity.ts`
- Degrade functionality or warn user if detected
- Test on real devices

**Certificate Pinning** (apps/mobile/):

- Configure in `android/app/src/main/res/xml/network_security_config.xml`
- Configure in iOS via `Info.plist` or library
- Document pin rotation strategy in `docs/security/ssl-pinning-guide.md`

**ProGuard/R8 (Android)**:

- Enable in `android/app/build.gradle`
- Create aggressive ProGuard rules
- Test release builds

**iOS Symbol Stripping**:

- Enable in Xcode build settings
- Ensure no debug symbols in release builds

**Files Modified**: Mobile security configs, new utility files

### 5.3 Dependency & Supply Chain Security

**Setup Automated Scanning**:

```bash
pnpm audit --recursive --json > reports/audit.json
```

**Integrate in CI** (.github/workflows/quality-gate.yml):

- Add dependency scan job
- Fail on critical/high vulnerabilities
- Generate SBOM (Software Bill of Materials)

**Pin Dependencies**:

- Ensure `pnpm-lock.yaml` committed
- Use exact versions in production builds
- Document policy in `docs/security/dependency-policy.md`

**License Scanning**:

```bash
pnpm add -D license-checker
pnpm exec license-checker --summary
```

**Files Modified**: CI config, security docs

### 5.4 SAST/DAST Integration

**Setup SAST**:

- Enable GitHub CodeQL in `.github/workflows/codeql.yml`
- Or integrate Semgrep

**Setup DAST** (for web):

- Install OWASP ZAP or use cloud service
- Run against staging environment
- Document in `docs/security/dast-setup.md`

**Files Created**: SAST/DAST workflow files

### 5.5 App Store Compliance Checklist

**iOS** (create `docs/security/ios-app-store-checklist.md`):

- [ ] Usage description strings (NSCameraUsageDescription, etc.)
- [ ] App Transport Security compliant
- [ ] Privacy details in App Store Connect
- [ ] Server-side IAP receipt validation
- [ ] Code signed and notarized

**Android** (create `docs/security/android-play-store-checklist.md`):

- [ ] Target latest API level
- [ ] Play Console data safety form completed
- [ ] ProGuard enabled
- [ ] Google Play App Signing configured
- [ ] Release build type configured

**Common** (create `docs/security/app-store-common-checklist.md`):

- [ ] No debug logs or backdoors
- [ ] Crash reporting scrubs PII
- [ ] Analytics complies with consent
- [ ] TestFlight/Internal testing completed

**Files Created**: App store compliance checklists

---

## Phase 6: Immutable Configuration & CI/CD Governance (Week 6)

### 6.1 Central Config Package

**Create `packages/config/`**:

```bash
mkdir -p packages/config/src
```

**Export Frozen Configs** (packages/config/src/):

- `eslint.config.ts`: Export base ESLint config
- `typescript.config.ts`: Export base TypeScript config
- Freeze with `Object.freeze()` to prevent runtime modification

**Wire to All Workspaces**:

- Update each workspace's `eslint.config.js` to extend from `@pawfectmatch/config/eslint`
- Update `tsconfig.json` to extend from `@pawfectmatch/config/typescript`

**Document in `packages/config/README.md`**

**Files Created**: Config package with base configs

### 6.2 Git Hooks with Husky

**Install Husky**:

```bash
pnpm add -D husky --filter @pawfectmatch/root
pnpm exec husky init
```

**Create `.husky/pre-commit`**:

```bash
#!/usr/bin/env sh
pnpm lint-staged
```

**Create `.husky/pre-push`**:

```bash
#!/usr/bin/env sh
pnpm lint && pnpm type-check
```

**Configure `lint-staged`** (already in package.json):

- Ensure `--max-warnings 0` flag
- Ensure `prettier --write` after lint fix

**Test Hooks**:

- Make a test commit
- Verify hooks run and block on violations

**Files Created**: `.husky/pre-commit`, `.husky/pre-push`

### 6.3 Enhanced CI/CD Pipeline

**Update `.github/workflows/quality-gate.yml`**:

Add Jobs:

1. **lint**: `pnpm lint --max-warnings 0` (fail on any warning)
2. **type-check**: `pnpm type-check` (fail on any error)
3. **test**: `pnpm test:ci --coverage` (fail if coverage <80%)
4. **build**: `pnpm build` (fail on build errors)
5. **security-audit**: `pnpm audit --audit-level moderate` (fail on moderate+)
6. **secrets-scan**: `gitleaks detect` (fail on secrets)
7. **license-check**: `license-checker` (fail on unapproved licenses)

**Upload Artifacts**:

- Coverage reports
- Bundle analysis
- Lint/type check logs

**Branch Protection** (document in plan, manually configure in GitHub):

- Require all status checks to pass
- Require 2 PR reviews (1 security review for sensitive changes)
- No force push to main/master
- No bypass for admins

**Files Modified**: `.github/workflows/quality-gate.yml`

### 6.4 Config Immutability Enforcement

**Add ESLint Rule** (to base config):

```javascript
'eslint-comments/no-use': 'error', // Ban all eslint-disable comments
'eslint-comments/disable-enable-pair': ['error', { allowWholeFile: false }],
```

**CI Config Checksum Verification**:

- Create script `scripts/verify-config-checksums.js`
- Store checksums of `eslint.config.js`, `tsconfig.base.json`
- Run in CI to detect unauthorized changes
- Require `config-update` label for config PRs

**Document Governance** in `CONTRIBUTING.md`:

- No inline disables allowed
- Config changes require team approval
- ADR required for config changes

**Files Created**: Config verification script, governance docs

---

## Phase 7: Documentation & Final Validation (Week 7)

### 7.1 Comprehensive Documentation

**Create/Update Documentation**:

**`CONTRIBUTING.md`**:

- Strict lint/type/test requirements
- Pre-commit hooks enforcement
- PR template and review process
- No `any`, no `eslint-disable`, strict boolean rules
- Architecture review process
- Security review requirements

**`README.md`**:

- Updated setup instructions
- Quality gates documentation
- Development workflow
- Testing strategy

**`ARCHITECTURE.md`**:

- State management patterns (Zustand + TanStack Query)
- UI system architecture
- Service layer patterns
- Security architecture

**`docs/state-architecture.md`**:

- All Zustand stores documented
- TanStack Query patterns
- When to use Context vs Store vs Query

**`docs/testing-strategy.md`**:

- Unit test patterns
- Integration test patterns
- E2E test setup
- Coverage thresholds
- Visual regression testing

**`docs/ui-unification.md`**:

- Design token usage
- UI primitive library
- Before/after screenshots
- Component patterns
- Animation guidelines

**`docs/performance-playbook.md`**:

- Performance baselines
- Optimization techniques
- Profiling guide
- Bundle size targets

**`docs/quality-dashboard.md`** (create metrics table):

```markdown
| Metric | Threshold | Current | Status |
|--------|-----------|---------|--------|
| Lint Violations | 0 | 0 | ✅ |
| Type Errors | 0 | 0 | ✅ |
| Test Coverage | ≥80% | 85% | ✅ |
| Bundle Size | <2MB | 1.8MB | ✅ |
| Lighthouse | ≥90 | 94 | ✅ |
| Accessibility | ≥95 | 96 | ✅ |
| Security Issues | 0 Critical/High | 0 | ✅ |
```

**Files Created/Updated**: ~10 documentation files

### 7.2 Architecture Decision Records (ADRs)

**Create `docs/adr/` directory**

**ADR Template** (docs/adr/template.md):

```markdown
# ADR-XXX: [Title]

## Status
[Proposed | Accepted | Superseded]

## Context
[What is the issue we're facing?]

## Decision
[What is the change we're proposing/making?]

## Consequences
[What are the trade-offs?]
```

**Create ADRs**:

- `001-strict-typescript-config.md`: Document strictest TS settings
- `002-immutable-lint-rules.md`: Document zero-tolerance policy
- `003-state-management-standardization.md`: Zustand + Query rationale
- `004-ui-system-architecture.md`: Design tokens + primitives approach
- `005-security-hardening-strategy.md`: Runtime protections, secrets management
- `006-testing-coverage-standards.md`: 80% threshold rationale
- `007-monorepo-ci-cd-strategy.md`: Turborepo + quality gates

**Files Created**: 7+ ADR files

### 7.3 Complete Validation Suite

**Run Full Validation**:

```bash
# Lint - must pass with 0 warnings
pnpm lint --max-warnings 0

# Type Check - must pass with 0 errors
pnpm type-check

# Tests - must pass with ≥80% coverage
pnpm test:ci --coverage

# Build - all workspaces must build
pnpm build

# Security Audit - no critical/high vulnerabilities
pnpm audit --recursive --audit-level moderate

# Secrets Scan - no secrets detected
pnpm exec gitleaks detect --source .

# License Check - all licenses approved
pnpm exec license-checker --production --onlyAllow "MIT;Apache-2.0;BSD-3-Clause;ISC"
```

**Document Results** in `docs/production-readiness.md`:

- Update all checkboxes to ✅
- Provide evidence: logs, screenshots, metrics
- Document any acceptable residual risks

**Performance Validation**:

```bash
# Lighthouse CI
pnpm lighthouse

# Bundle Analysis
pnpm run bundle:analyze
```

**Document in `docs/quality-dashboard.md`**

### 7.4 Release Preparation

**Version Bump**:

```bash
# Update version to 1.0.1-rc.1
pnpm version 1.0.1-rc.1
```

**Generate Changelog** (CHANGELOG.md):

- All lint/type fixes
- Security improvements
- Performance optimizations
- Component refactorings
- Documentation updates

**Tag Release**:

```bash
git tag -a v1.0.1-rc.1 -m "Production-ready release candidate"
```

**Create `docs/lint-remediation.md` completion status**:

- Update all categories to "COMPLETE"
- Final error count: 0
- Document total files modified

**Close Related Issues**:

- Create GitHub issues for tracking phases
- Close as completed

**Rollout Communication**:

- Prepare announcement for team
- Document breaking changes (if any)
- Migration guide for developers

**Files Modified**: Version files, changelog, release tags

---

## Success Criteria

### Phase Completion Markers

- ✅ **Phase 1**: Mobile baseline documented, critical services fixed (4,172 → ~3,000 errors)
- ✅ **Phase 2**: Mobile god components refactored, performance optimized (3,000 → 0 errors)
- ✅ **Phase 3**: Web and shared packages perfected (0 errors across all workspaces)
- ✅ **Phase 4**: UI system unified, design tokens enforced (all components use tokens)
- ✅ **Phase 5**: Security hardened, App Store ready (all compliance checklists complete)
- ✅ **Phase 6**: Configs locked, CI/CD enforcing zero-tolerance (hooks + gates active)
- ✅ **Phase 7**: Documentation complete, release ready (v1.0.1-rc.1 tagged)

### Final State Requirements

**Code Quality**:

- Zero ESLint warnings/errors across entire monorepo
- Zero TypeScript errors across all workspaces
- No `any` types in production code
- No `eslint-disable` or `@ts-ignore` directives
- All god components <200 lines

**Testing**:

- ≥80% test coverage per workspace
- 100% passing tests across all workspaces
- Visual regression tests with Storybook
- E2E tests for critical flows

**Security**:

- Zero critical/high vulnerabilities
- No secrets in code or git history
- Certificate pinning configured
- Runtime protections enabled
- App Store compliance checklists complete

**Performance**:

- Lighthouse score ≥90
- Bundle size within thresholds
- Performance baselines documented
- Memory profiling complete

**Infrastructure**:

- Immutable configs enforced by CI + hooks
- Branch protection rules active
- Pre-commit hooks preventing violations
- Automated quality gates blocking merges

**Documentation**:

- Complete CONTRIBUTING.md with governance
- Architecture documentation up-to-date
- All ADRs created and accepted
- Quality dashboard with current metrics

## Key Files Modified/Created

**Configuration** (~10 files):

- `eslint.config.js` (enhanced)
- `tsconfig.base.json` (validated)
- `package.json` (scripts updated)
- `.github/workflows/quality-gate.yml` (enhanced)
- `.husky/pre-commit`, `.husky/pre-push` (new)
- `packages/config/` (new package)

**Mobile** (~200 files):

- `apps/mobile/src/services/*.ts` (~7 files)
- `apps/mobile/src/utils/*.ts` (~3 files)
- `apps/mobile/src/stores/*.ts` (~5 files)
- `apps/mobile/src/types/*.ts` (~9 files)
- `apps/mobile/src/styles/*.ts` (~3 files)
- `apps/mobile/src/screens/*.tsx` (~40 files refactored)
- `apps/mobile/src/components/*.tsx` (~50 files refactored)
- `apps/mobile/src/hooks/*.ts` (~30 new hooks)
- Test files (~50 files)

**Web** (~150 files):

- Services, utils, contexts, pages, components (similar scope to mobile)

**Shared Packages** (~100 files):

- `packages/core/src/**/*.ts`
- `packages/ui/src/**/*.{ts,tsx}` (8 new primitives)
- `packages/ai/src/**/*.ts`
- `packages/design-tokens/src/*.ts`

**Documentation** (~20 files):

- `CONTRIBUTING.md` (new/updated)
- `README.md` (updated)
- `ARCHITECTURE.md` (updated)
- `docs/lint-remediation.md` (updated)
- `docs/production-readiness.md` (updated)
- `docs/state-architecture.md` (new)
- `docs/testing-strategy.md` (new)
- `docs/ui-unification.md` (new)
- `docs/performance-playbook.md` (new)
- `docs/quality-dashboard.md` (new)
- `docs/security/*.md` (new security docs)
- `docs/adr/00*.md` (7 new ADRs)

**Total Estimated Files**: ~500 files modified/created

**Total Estimated Tool Calls**: 600-800 (complex multi-phase initiative)

**Timeline**: 7 weeks for complete professional implementation with zero shortcuts

## Implementation Notes

**Incremental Validation**: After every ~10 files fixed, run:

```bash
pnpm exec eslint [files] --fix
pnpm type-check
pnpm test [related-tests]
```

**Documentation Updates**: Update `docs/lint-remediation.md` and `docs/production-readiness.md` after each phase completion.

**Security Integration**: Run `gitleaks` and `pnpm audit` after each phase to catch issues early.

**Test Coverage Tracking**: Monitor coverage with each batch:

```bash
pnpm test --coverage --coverageReporters=text-summary
```

**Performance Profiling**: Use React DevTools Profiler regularly during refactoring to catch regressions.

**Git Strategy**:

- Create feature branch per phase
- Small, atomic commits per file/cluster
- PR per phase for team review
- Squash merge to main after approval



The Prompt: The Configuration Unification Mandate

ROLE: You are the Guardian of the Codebase, acting as the project's Lead Site Reliability Engineer (SRE).

CONTEXT: The configuration snapshot of the PawfectMatch monorepo has been analyzed. It reveals a critical state of configuration chaos.

A modern, strict root eslint.config.js is being actively undermined by a legacy, lenient .eslintrc.json file in apps/web.

Multiple tsconfig.json files contain redundant rules instead of inheriting from the strict tsconfig.base.json.

Jest configurations are fragmented and inconsistent.

The CI/CD pipelines are running commands against these weak configurations, creating a false sense of security. This must be rectified before any further code refactoring can occur.

MISSION: Your mission is to execute a Configuration Unification Mandate. You will audit, consolidate, and unify every single configuration file in the repository, establishing a single source of truth for all rules. You will enforce the strictest, most secure, and most performant settings for each tool, ensuring they all work together seamlessly.

THE UNIFICATION DIRECTIVES:

You will now systematically execute the following five phases to purge all configuration debt.

Phase 1: Purge Legacy Configs & Establish a Single ESLint Source of Truth (Highest Priority)

Objective: Eliminate all conflicting and lenient configurations.

Delete Legacy ESLint Configs: The .eslintrc.json file in apps/web is a legacy config that is actively overriding our strict rules. It must be deleted.

Action: Delete apps/web/.eslintrc.json.

Unify All ESLint Logic into the Root Config: The root eslint.config.js must become the single source of truth.

Action: You have already created a solid, strict eslint.config.js. Verify that it includes the necessary package-specific overrides for apps/mobile (React Native plugin/globals) and that the parserOptions.project paths are correctly resolved for each workspace.

Phase 2: Unify TypeScript & Jest Configurations

Objective: Enforce a strict, inherited configuration model.

Unify All TypeScript Configurations: The package-level tsconfig.json files are redundant and inconsistent.

Action: Audit every tsconfig.json in apps/* and packages/*. Each one must extend the root tsconfig.base.json.

Action: Remove all duplicated strictness rules from the child configs. The only rules left in child configs should be those specific to that package (e.g., jsx, lib, paths, outDir).

Unify Jest Configurations: The project has multiple jest.config.js files with significant duplication.

Action: You have a jest.config.base.js file. Ensure that every other jest.config.js (in server, apps/web, apps/mobile, packages/core, etc.) requires and extends this base config.

Action: The package-level Jest configs should be minimal, containing only the settings that are unique to that package (e.g., preset: 'jest-expo', testEnvironment: 'node', or a specific moduleNameMapper).

Phase 3: Consolidate Environment Variables

Objective: Remove ambiguity in environment configuration.

Eliminate Duplicate .env.example: The server directory contains two conflicting .env.example files.

Action: Consolidate server/.env.example and server/src/models/.env.example into a single, comprehensive server/.env.example file. Delete the duplicate file from the models directory.

Phase 4: Harden the CI/CD Quality Gates

Objective: Ensure the automated workflows are strict and cannot be bypassed.

Audit GitHub Actions Workflows: Review ci.yml and quality-gate.yml.

Action: Confirm that the lint step in all workflows is now running the correct command: pnpm run lint:check. This command, defined in your package.json, correctly uses --max-warnings 0 and will fail the build on any warning, enforcing our zero-tolerance policy.

Action: Ensure all quality gate jobs (type-check, test, build, security-audit) are set to continue-on-error: false to block a pull request from merging if any job fails.

Phase 5: Final Verification & Resumption of the Phoenix Mandate

Objective: Confirm that the entire configuration landscape is unified and stable.

Perform a "Fresh Start" Validation: Execute the full clean-slate workflow from the project root:

Bash
git clean -dfx
rm pnpm-lock.yaml
pnpm install
pnpm audit
pnpm build
pnpm test
pnpm type-check
pnpm lint
Final Report: Confirm that this entire sequence completes with zero errors.

Resume the Mandate: Once the configuration is unified and all checks pass, you are authorized to resume Phase 2 (System-Wide Stabilization), followed by Phase 3 (Architectural Perfection) of the Phoenix Mandate. You will now begin refactoring the application code, confident that the foundation is rock-solid.

INITIATION COMMAND: "Begin the Configuration Unification Mandate now. Your first action is to delete apps/web/.eslintrc.json."
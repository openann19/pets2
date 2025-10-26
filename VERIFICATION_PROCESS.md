# 🔍 Complete Verification Process — PawfectMatch Mobile

**Purpose**: Define comprehensive verification procedures for the multi-agent system, ensuring production-ready quality across all dimensions.

**Scope**: Mobile app (`apps/mobile`), backend services, contracts, mocks, tests, and deployment artifacts.

**Last Updated**: 2025-01-XX

---

## Table of Contents

1. [Overview](#1-overview)
2. [Verification Stages](#2-verification-stages)
3. [Agent Output Verification](#3-agent-output-verification)
4. [Quality Gates](#4-quality-gates)
5. [Automated Verification](#5-automated-verification)
6. [Manual Verification](#6-manual-verification)
7. [Failure Handling](#7-failure-handling)
8. [Continuous Verification](#8-continuous-verification)
9. [Emergency Procedures](#9-emergency-procedures)

---

## 1. Overview

### 1.1 Verification Philosophy

- **Evidence-based**: Every assertion must be backed by test results or verified artifacts
- **Zero tolerance**: Critical issues block all deployments
- **Automated first**: Prefer automated checks over manual inspection
- **Continuous**: Verification happens at every stage, not just at release
- **Traceable**: All verification results are logged and auditable

### 1.2 Verification Scope

| Dimension | Description | Threshold |
|-----------|-------------|-----------|
| **TypeScript** | Zero errors, strict mode | 0 errors |
| **Linting** | Zero ESLint errors/warnings | 0 errors |
| **Tests** | Unit + Integration + E2E | ≥75% global, ≥90% changed |
| **Accessibility** | WCAG 2.1 AA compliance | 0 critical issues |
| **Performance** | Bundle size, frame rate | <200KB delta, 60fps |
| **Security** | No vulnerabilities | 0 high/critical CVEs |
| **GDPR** | Right to export/delete | E2E tests passing |
| **Contracts** | API contracts validated | 100% coverage |
| **Telemetry** | Analytics coverage | All journeys tracked |

---

## 2. Verification Stages

### 2.1 Pre-Development Verification

**Trigger**: Before starting any new feature or fix

**Actions**:
1. Check current gap log: `reports/gap_log.yaml`
2. Verify product model is up-to-date: `reports/product_model.json`
3. Run baseline quality checks:
   ```bash
   pnpm mobile:tsc    # TypeScript
   pnpm mobile:lint   # ESLint
   pnpm mobile:test   # Unit tests
   ```
4. Review recent audit reports in `reports/`

**Acceptance Criteria**:
- ✅ All baseline checks pass
- ✅ No unclosed critical gaps
- ✅ Product model exists and is valid

**Output**: Verification checkpoint logged

---

### 2.2 Development Verification

**Trigger**: During feature development (continuous)

**Actions**:
1. Run local TypeScript compiler:
   ```bash
   cd apps/mobile && pnpm tsc --noEmit --pretty
   ```

2. Run linter in watch mode:
   ```bash
   pnpm lint --watch
   ```

3. Run tests for changed files:
   ```bash
   pnpm test --watch --changedSince main
   ```

4. Verify contracts:
   ```bash
   pnpm contract:check
   ```

**Acceptance Criteria**:
- ✅ No TypeScript errors in changed files
- ✅ Zero lint warnings
- ✅ Tests pass for changed functionality
- ✅ Contracts match implementation

---

### 2.3 Pre-Commit Verification

**Trigger**: Before committing code (via git hooks)

**Actions**:
1. Lint staged files:
   ```bash
   pnpm lint:fix
   ```

2. Format code:
   ```bash
   pnpm format
   ```

3. Type check:
   ```bash
   pnpm type-check
   ```

4. Run affected tests:
   ```bash
   pnpm test --changedSince HEAD~1
   ```

**Acceptance Criteria**:
- ✅ All staged files lint clean
- ✅ Code formatted according to Prettier
- ✅ Type checks pass
- ✅ At least smoke tests pass

**Output**: Commit approved or rejected with error report

---

### 2.4 Pre-PR Verification

**Trigger**: Before creating PR or pushing to feature branch

**Actions**:
1. Full type check:
   ```bash
   pnpm mobile:tsc
   ```

2. Full lint check:
   ```bash
   pnpm lint --max-warnings 0
   ```

3. Test coverage check:
   ```bash
   pnpm test:coverage --changedFiles
   ```

4. Generate test coverage report:
   ```bash
   pnpm test:coverage && open coverage/index.html
   ```

5. Security audit:
   ```bash
   pnpm audit --audit-level moderate
   ```

6. Update gap log if needed:
   ```bash
   # Manual: Review reports/gap_log.yaml
   ```

**Acceptance Criteria**:
- ✅ Zero TypeScript errors
- ✅ Zero ESLint warnings
- ✅ Coverage ≥75% (global), ≥90% (changed)
- ✅ Zero high/critical CVEs
- ✅ Gap log updated

**Output**: Pre-PR checklist completed

---

### 2.5 PR Verification (CI Pipeline)

**Trigger**: Automatically on PR creation or update

**Actions** (via GitHub Actions / CI):

```bash
# Run all quality gates
pnpm ci:full

# Individual gates (run sequentially if ci:full unavailable)
pnpm code:quality          # Lint + Type check + Format
pnpm test:all             # Unit + Integration + E2E
pnpm security:audit        # Dependency vulnerabilities
pnpm lighthouse           # Performance audit
```

**CI Pipeline Stages**:

1. **Code Quality Stage**
   - TypeScript compilation check
   - ESLint (zero warnings)
   - Prettier formatting check
   - Import/export consistency

2. **Test Stage**
   - Unit tests (Jest)
   - Integration tests
   - E2E tests (Detox)
   - Coverage report generation

3. **Security Stage**
   - Dependency audit (pnpm audit)
   - Secret scanning
   - Known vulnerability check

4. **Performance Stage**
   - Bundle size analysis
   - Performance budgets
   - Lighthouse CI

5. **Accessibility Stage**
   - Screen reader tests
   - Touch target size checks
   - Contrast ratio validation

6. **Contract Stage**
   - API contract validation
   - Mock server verification
   - Response schema checks

7. **E2E Stage**
   - Detox iOS tests
   - Detox Android tests
   - Golden path verification

**Acceptance Criteria**:
- ✅ All CI stages pass
- ✅ Coverage thresholds met
- ✅ No security vulnerabilities
- ✅ Performance budgets respected
- ✅ E2E tests pass

**Output**: CI status badge on PR

---

### 2.6 Pre-Release Verification

**Trigger**: Before merging to main/production

**Actions**:
1. Final gap audit:
   ```bash
   # Review reports/gap_log.yaml
   # Ensure all critical gaps are closed
   ```

2. Final test suite:
   ```bash
   pnpm test:all
   pnpm test:e2e
   ```

3. Bundle analysis:
   ```bash
   pnpm bundle:analyze
   pnpm bundle:compare
   ```

4. Security scan:
   ```bash
   pnpm security:audit
   # Or: npm audit --audit-level moderate
   ```

5. GDPR verification:
   ```bash
   # E2E test GDPR flows
   pnpm mobile:e2e:test --testNamePattern="GDPR"
   ```

6. Agent report review:
   - Check `/reports/quality_trend.md`
   - Check `/reports/ACCESSIBILITY.md`
   - Check `/reports/security_scan.md`
   - Check `/reports/telemetry_coverage.md`

7. Documentation check:
   - README updated
   - Changelog updated
   - API docs updated

**Acceptance Criteria**:
- ✅ All quality gates pass
- ✅ Zero critical gaps open
- ✅ Bundle size < budget
- ✅ GDPR E2E tests pass
- ✅ Documentation complete
- ✅ No incident reports

**Output**: Release readiness report

---

### 2.7 Post-Release Verification

**Trigger**: After deployment to production

**Actions**:
1. Monitoring verification:
   - Check Sentry for errors
   - Check analytics for crashes
   - Monitor API response times

2. Smoke tests:
   ```bash
   pnpm mobile:e2e:test --testNamePattern="smoke"
   ```

3. Performance monitoring:
   - Track bundle size in production
   - Monitor frame rates
   - Check memory usage

4. User feedback:
   - Monitor app store reviews
   - Track support tickets
   - Check crash reports

**Acceptance Criteria**:
- ✅ No critical errors in Sentry
   - ✅ Error rate < 1%
- ✅ Crash rate < 0.5%
- ✅ Smoke tests pass
- ✅ Performance metrics within budget

**Output**: Post-release report

---

## 3. Agent Output Verification

Each agent produces specific artifacts. This section verifies each agent's outputs.

### 3.1 Product Reasoner (PR) Verification

**Outputs**:
- `reports/product_model.json`
- `reports/navigation_graph.json`
- `reports/gap_log.yaml` (initial)

**Verification Steps**:
1. Check product_model.json exists and is valid JSON
2. Verify entities cover all user journeys
3. Check navigation_graph.json matches actual routes
4. Ensure gap_log.yaml has severity ratings

**Commands**:
```bash
# Validate JSON
cat reports/product_model.json | jq .

# Check entities
jq '.entities' reports/product_model.json

# Check navigation
jq '.routes' reports/navigation_graph.json

# Check gaps
yq '.gaps | length' reports/gap_log.yaml
```

**Acceptance Criteria**:
- ✅ product_model.json contains entities, journeys, states
- ✅ navigation_graph.json has all routes and params
- ✅ gap_log.yaml has at least 5 initial gaps

---

### 3.2 Codebase Mapper (CM) Verification

**Outputs**:
- `reports/code_graph.json`
- `reports/exports_inventory.json`
- Dead/unused modules list

**Verification Steps**:
1. Check code_graph.json exists
2. Verify exports_inventory.json lists all exports
3. Review dead code report

**Commands**:
```bash
# Check code graph
jq '.modules' reports/code_graph.json

# Check exports
jq '.exports' reports/exports_inventory.json
```

**Acceptance Criteria**:
- ✅ code_graph.json shows module dependencies
- ✅ exports_inventory.json lists all exports
- ✅ Dead code identified and removed

---

### 3.3 Gap Auditor (GA) Verification

**Outputs**:
- Updated `reports/gap_log.yaml`

**Verification Steps**:
1. Check gap_log.yaml is updated
2. Verify each gap has: id, owner, severity, acceptance, states
3. Check no gaps marked "closed" without evidence

**Commands**:
```bash
# List all gaps
yq '.gaps[] | {id, severity, status}' reports/gap_log.yaml

# Count by severity
yq '.gaps[] | .severity' reports/gap_log.yaml | sort | uniq -c
```

**Acceptance Criteria**:
- ✅ All gaps have required fields
- ✅ Critical gaps have work items
- ✅ Acceptance criteria are testable

---

### 3.4 TypeScript Guardian (TG) Verification

**Outputs**:
- `reports/ts_errors.json`
- Fixed type errors
- `typings/patches/*.d.ts`

**Verification Steps**:
1. Run TypeScript compiler
2. Check for errors
3. Verify patches applied

**Commands**:
```bash
# Run TypeScript check
pnpm mobile:tsc > reports/ts-errors.log 2>&1

# Check errors
grep "error TS" reports/ts-errors.log

# Count errors
wc -l reports/ts-errors.log
```

**Acceptance Criteria**:
- ✅ Zero TypeScript errors
- ✅ No `@ts-expect-error` suppressions (or justified)
- ✅ No `any` types in changed code
- ✅ Strict mode enabled

---

### 3.5 UI/UX Reviewer (UX) Verification

**Outputs**:
- `reports/ux_findings.md`
- Screenshot diffs
- Skeleton coverage matrix

**Verification Steps**:
1. Read ux_findings.md
2. Check screenshot diffs
3. Verify state coverage

**Commands**:
```bash
# Check findings
cat reports/ux_findings.md

# Check screenshots
ls reports/screenshots/
```

**Acceptance Criteria**:
- ✅ All screens have state matrices
- ✅ Edge cases handled
- ✅ Empty states implemented

---

### 3.6 Accessibility Agent (A11Y) Verification

**Outputs**:
- `reports/ACCESSIBILITY.md`
- List of blocking issues

**Verification Steps**:
1. Read ACCESSIBILITY.md
2. Check for critical issues
3. Verify fixes applied

**Commands**:
```bash
# Check accessibility report
cat reports/ACCESSIBILITY.md

# Run accessibility tests
pnpm test:accessibility
```

**Acceptance Criteria**:
- ✅ Zero critical accessibility issues
- ✅ All interactive elements have labels
- ✅ Contrast ratios meet WCAG 2.1 AA
- ✅ Reduce Motion respected

---

### 3.7 Performance Profiler (PP) Verification

**Outputs**:
- `reports/perf_budget.json`
- Flame traces
- Bundle diff report

**Verification Steps**:
1. Check bundle size
2. Verify frame rates
3. Check bundle budget

**Commands**:
```bash
# Check bundle budget
cat reports/perf_budget.json

# Analyze bundle
pnpm bundle:analyze

# Compare bundles
pnpm bundle:compare
```

**Acceptance Criteria**:
- ✅ Bundle size < 2MB
- ✅ Frame rate 60fps
- ✅ Bundle delta < +200KB per PR

---

### 3.8 Security & Privacy Officer (SP) Verification

**Outputs**:
- `reports/security_scan.md`
- `reports/gdpr_checklist.md`

**Verification Steps**:
1. Read security_scan.md
2. Check GDPR checklist
3. Verify secrets not exposed

**Commands**:
```bash
# Check security report
cat reports/security_scan.md

# Check GDPR compliance
cat reports/gdpr_checklist.md

# Run security tests
pnpm test:security
```

**Acceptance Criteria**:
- ✅ Zero high/critical CVEs
- ✅ No hardcoded secrets
- ✅ GDPR flows E2E tested
- ✅ SSL pinning enabled

---

### 3.9 API Contract Agent (API) Verification

**Outputs**:
- `contracts/openapi.yaml`
- `scripts/mock-server.ts`
- `reports/contract_results.json`

**Verification Steps**:
1. Validate OpenAPI spec
2. Check mock server routes
3. Verify contracts match implementation

**Commands**:
```bash
# Validate OpenAPI
swagger-cli validate contracts/openapi.yaml

# Check contracts
jq '.results' reports/contract_results.json

# Test mocks
pnpm mobile:mock
```

**Acceptance Criteria**:
- ✅ OpenAPI spec valid
- ✅ Mock server implements all routes
- ✅ Contract tests pass

---

### 3.10 Mock & Simulation Agent (SIM) Verification

**Outputs**:
- `mocks/fixtures/*.json`
- `mocks/scenarios/*.yaml`

**Verification Steps**:
1. Check fixtures exist
2. Validate JSON/YAML
3. Test scenarios

**Commands**:
```bash
# List fixtures
ls -la mocks/fixtures/

# Validate JSON
for f in mocks/fixtures/*.json; do jq . "$f" > /dev/null || echo "Invalid: $f"; done

# Check scenarios
ls -la mocks/scenarios/
```

**Acceptance Criteria**:
- ✅ Fixtures cover happy/error paths
- ✅ Scenarios are deterministic
- ✅ Mocks match contract specs

---

### 3.11 Test Engineer (TE) Verification

**Outputs**:
- Tests in `__tests__`
- Coverage reports
- Snapshot files

**Verification Steps**:
1. Run test suite
2. Check coverage
3. Verify snapshots

**Commands**:
```bash
# Run all tests
pnpm test:all

# Check coverage
pnpm test:coverage

# Check snapshots
ls -la apps/mobile/src/__tests__/*.snap
```

**Acceptance Criteria**:
- ✅ Global coverage ≥75%
- ✅ Changed lines ≥90%
- ✅ All tests pass
- ✅ No deprecated snapshots

---

### 3.12 E2E Orchestrator (E2E) Verification

**Outputs**:
- `e2e/*.e2e.ts`
- Videos/screenshots
- Detox test results

**Verification Steps**:
1. Run E2E tests
2. Check videos/screenshots
3. Verify golden paths

**Commands**:
```bash
# Run E2E tests
pnpm e2e:test:ios

# Check artifacts
ls -la reports/run/

# Run specific suites
pnpm mobile:e2e:test --testNamePattern="auth"
```

**Acceptance Criteria**:
- ✅ Auth flow passes
- ✅ Swipe→Match flow passes
- ✅ Chat flow passes
- ✅ Settings/GDPR flow passes
- ✅ Premium flow passes

---

### 3.13 Release Captain (RC) Verification

**Outputs**:
- CI/CD pipeline status
- Changelogs
- Release notes

**Verification Steps**:
1. Check CI status
2. Verify changelog
3. Check release notes

**Commands**:
```bash
# Check CI
gh pr checks --json conclusion,name

# Check changelog
cat CHANGELOG.md

# Check release notes
cat RELEASE_NOTES.md
```

**Acceptance Criteria**:
- ✅ All CI checks pass
- ✅ Changelog updated
- ✅ Release notes complete
- ✅ Version bumped

---

### 3.14 Lint/Format Enforcer (LFE) Verification

**Outputs**:
- ESLint reports
- Prettier reports
- Fix PRs

**Verification Steps**:
1. Run linter
2. Check formatting
3. Verify fixes applied

**Commands**:
```bash
# Run linter
pnpm lint

# Run formatter
pnpm format:check

# Auto-fix
pnpm lint:fix && pnpm format
```

**Acceptance Criteria**:
- ✅ Zero lint errors
- ✅ All files formatted
- ✅ Fixes applied automatically

---

### 3.15 Telemetry/Analytics Agent (TLA) Verification

**Outputs**:
- `analytics/events.yaml`
- `reports/telemetry_coverage.md`
- Sentry integration

**Verification Steps**:
1. Check events.yaml
2. Read telemetry_coverage.md
3. Verify Sentry configured

**Commands**:
```bash
# Check events
cat analytics/events.yaml

# Check coverage
cat reports/telemetry_coverage.md

# Verify Sentry
grep -r "Sentry" apps/mobile/src
```

**Acceptance Criteria**:
- ✅ All journeys have events
- ✅ Error tracking enabled
- ✅ Analytics coverage >90%

---

### 3.16 i18n/Copy Agent (I18N) Verification

**Outputs**:
- `reports/i18n_diff.json`
- Missing key PRs

**Verification Steps**:
1. Check i18n_diff.json
2. Verify no hardcoded strings
3. Check locale completeness

**Commands**:
```bash
# Check i18n diff
cat reports/i18n_diff.json

# Find hardcoded strings
grep -r '"[A-Z]' apps/mobile/src --include="*.tsx"
```

**Acceptance Criteria**:
- ✅ No hardcoded strings
- ✅ All locales complete
- ✅ Missing keys identified and fixed

---

### 3.17 Arbitration/Referee (REF) Verification

**Outputs**:
- Decision logs in `reports/decisions/*.md`
- INCIDENTS.md

**Verification Steps**:
1. Check decision logs
2. Review incidents
3. Verify resolutions

**Commands**:
```bash
# Check decisions
ls -la reports/decisions/

# Check incidents
cat reports/INCIDENTS.md
```

**Acceptance Criteria**:
- ✅ Conflicts resolved
- ✅ Incidents documented
- ✅ Fixes applied

---

## 4. Quality Gates

### 4.1 TypeScript Gate

**Command**: `pnpm mobile:tsc`

**Threshold**: 0 errors

**What it checks**:
- Strict mode enabled
- No `any` types
- No implicit `any`
- All imports resolve
- Type compatibility

**How to fix**:
1. Read error message
2. Fix type definitions
3. Add proper types
4. Avoid `@ts-expect-error` unless justified

---

### 4.2 Linting Gate

**Command**: `pnpm lint --max-warnings 0`

**Threshold**: 0 errors, 0 warnings

**What it checks**:
- ESLint rules
- React hooks rules
- JSX-A11y rules
- Import/export consistency

**How to fix**:
```bash
# Auto-fix
pnpm lint:fix

# Check specific rules
pnpm lint --rule 'react-hooks/exhaustive-deps'
```

---

### 4.3 Test Coverage Gate

**Command**: `pnpm test:coverage`

**Threshold**:
- Global: ≥75%
- Changed lines: ≥90%

**What it checks**:
- Line coverage
- Branch coverage
- Function coverage
- Statement coverage

**How to fix**:
1. Identify uncovered lines
2. Add test cases
3. Re-run coverage
4. Verify threshold met

---

### 4.4 E2E Gate

**Command**: `pnpm test:e2e`

**Threshold**: All golden paths pass

**What it checks**:
- Authentication flow
- Swipe→Match flow
- Chat flow
- Settings/GDPR flow
- Premium flow

**How to fix**:
1. Check Detox test logs
2. Fix failing scenarios
3. Update snapshots if needed
4. Re-run tests

---

### 4.5 Bundle Size Gate

**Command**: `pnpm bundle:analyze`

**Threshold**: <2MB base, <+200KB delta per PR

**What it checks**:
- Total bundle size
- Per-module sizes
- Unused dependencies
- Code splitting effectiveness

**How to fix**:
1. Identify large modules
2. Code split heavy screens
3. Remove unused deps
4. Optimize images

---

### 4.6 Performance Gate

**Command**: `pnpm lighthouse`

**Threshold**: 
- Performance score ≥90
- 60fps frame rate

**What it checks**:
- First Contentful Paint
- Time to Interactive
- Total Blocking Time
- Cumulative Layout Shift

**How to fix**:
1. Optimize images
2. Code split routes
3. Lazy load components
4. Reduce re-renders

---

### 4.7 Accessibility Gate

**Command**: `pnpm test:accessibility`

**Threshold**: 0 critical issues, WCAG 2.1 AA

**What it checks**:
- Touch target sizes (≥44dp)
- Contrast ratios (≥4.5:1)
- Screen reader labels
- Semantic HTML
- Reduce Motion support

**How to fix**:
1. Add `accessibilityLabel` props
2. Increase touch targets
3. Fix contrast
4. Add accessibility roles

---

### 4.8 Security Gate

**Command**: `pnpm audit --audit-level moderate`

**Threshold**: 0 high/critical CVEs

**What it checks**:
- Dependency vulnerabilities
- Known CVEs
- Secret leaks
- SSL configuration

**How to fix**:
```bash
# Update dependencies
pnpm update --latest

# Check specific package
pnpm audit <package-name>
```

---

### 4.9 GDPR Compliance Gate

**Command**: E2E tests for GDPR flows

**Threshold**: All GDPR flows E2E tested

**What it checks**:
- Account deletion flow
- Data export flow
- Consent confirmation
- Grace period handling

**How to fix**:
1. Implement missing endpoints
2. Add E2E tests
3. Verify UI state handling
4. Test rollback scenarios

---

### 4.10 Contract Gate

**Command**: `pnpm contract:check`

**Threshold**: 100% coverage

**What it checks**:
- OpenAPI spec validity
- Request/response schemas
- Mock server coverage
- Error responses

**How to fix**:
1. Update OpenAPI spec
2. Implement missing mock routes
3. Add contract tests
4. Verify schemas match

---

## 5. Automated Verification

### 5.1 Pre-Commit Hooks (Husky)

**Location**: `.husky/pre-commit`

**What it does**:
1. Run lint-staged
2. Fix auto-fixable issues
3. Block commit if errors remain

**Commands**:
```bash
# Manual trigger
./husky/.husky/pre-commit

# Skip (not recommended)
git commit --no-verify
```

---

### 5.2 GitHub Actions CI

**Location**: `.github/workflows/ci.yml`

**Stages**:
1. Install dependencies
2. Lint check
3. Type check
4. Test suite
5. E2E tests
6. Security audit
7. Bundle analysis

**View results**:
```bash
# Check CI status
gh pr checks

# View logs
gh run view --log
```

---

### 5.3 Nightly Jobs

**Schedule**: Every night at 2 AM UTC

**Tasks**:
1. Full semantic audit
2. Coverage diff
3. Bundle diff
4. Dependency updates check

**Commands**:
```bash
# Run manually
pnpm nightly:audit

# Check reports
ls -la reports/
```

---

### 5.4 Dependency Updates

**Bot**: Dependabot / Renovate

**What it does**:
- Monitors dependencies
- Creates PRs for updates
- Runs full test suite

**Commands**:
```bash
# Check PRs
gh pr list --label "dependencies"

# Review changes
gh pr diff <number>
```

---

## 6. Manual Verification

### 6.1 Visual Inspection Checklist

**Before committing**:
- [ ] UI matches mockups
- [ ] Animations smooth (60fps)
- [ ] No layout shifts
- [ ] Touch targets adequate
- [ ] Color contrast sufficient

---

### 6.2 Device Testing Checklist

**iOS**:
- [ ] iPhone SE (small)
- [ ] iPhone 14 (standard)
- [ ] iPhone 14 Pro Max (large)

**Android**:
- [ ] Pixel 7 (standard)
- [ ] Pixel Fold (foldable)
- [ ] Various screen sizes

**Tests**:
- [ ] Landscape/portrait rotation
- [ ] Dark mode
- [ ] System font size changes
- [ ] Reduce Motion on/off

---

### 6.3 Feature Verification Checklist

**Auth Flow**:
- [ ] Login works
- [ ] Logout works
- [ ] Password reset works
- [ ] Remember me persists

**Swipe Flow**:
- [ ] Cards load
- [ ] Swipe gestures work
- [ ] Match animation plays
- [ ] Super like works
- [ ] Rewind works

**Chat Flow**:
- [ ] Send message
- [ ] Receive message
- [ ] Typing indicator
- [ ] Online status
- [ ] Media attachments (if implemented)

**Settings Flow**:
- [ ] Edit profile
- [ ] Change preferences
- [ ] GDPR export works
- [ ] GDPR delete works
- [ ] Push notifications toggle

**Premium Flow**:
- [ ] View plans
- [ ] Purchase subscription
- [ ] Feature gating works
- [ ] Subscription status displays

---

### 6.4 Performance Verification

**Baseline Metrics**:
- First contentful paint: <1.5s
- Time to interactive: <3.0s
- Frame rate: 60fps
- Memory usage: <200MB

**Tools**:
```bash
# React Native DevTools
# Flipper
# Chrome DevTools (Web)
```

---

### 6.5 Accessibility Verification

**Manual Tests**:
1. Enable VoiceOver/TalkBack
2. Navigate through app
3. Verify all elements announced
4. Check keyboard navigation
5. Test reduce motion

**Automated Tools**:
```bash
# iOS
xcodebuild test -workspace PawfectMatch.xcworkspace \
  -scheme PawfectMatch -destination 'platform=iOS Simulator,name=iPhone 14'

# Android
adb shell uiautomator dump /sdcard/ui.xml
# Analyze for missing labels
```

---

## 7. Failure Handling

### 7.1 Quality Gate Failures

**TypeScript Error**:
```bash
# 1. Read error
pnpm mobile:tsc

# 2. Fix type
# Edit file

# 3. Verify
pnpm mobile:tsc
```

**Lint Error**:
```bash
# 1. Auto-fix
pnpm lint:fix

# 2. Manual fix if needed
# Edit file

# 3. Verify
pnpm lint
```

**Test Failure**:
```bash
# 1. Run specific test
pnpm test --testNamePattern="failing"

# 2. Debug
pnpm test --debug

# 3. Fix and retry
pnpm test
```

---

### 7.2 CI Failure Recovery

**Scenario**: CI fails on specific stage

**Steps**:
1. Review CI logs
2. Identify failing stage
3. Reproduce locally
4. Fix issue
5. Push and re-trigger CI

**Commands**:
```bash
# View CI logs
gh run view --log <run-id>

# Reproduce locally
pnpm ci:full

# Retry failed workflow
gh run rerun <run-id>
```

---

### 7.3 Emergency Procedures

**Critical Bug in Production**:
1. Document issue in `reports/INCIDENTS.md`
2. Create hotfix branch
3. Implement fix with tests
4. Run full verification
5. Deploy hotfix
6. Monitor for 24 hours

**Commands**:
```bash
# Create hotfix
git checkout -b hotfix/critical-bug

# Fix code
# ...

# Run verification
pnpm ci:full

# Merge and deploy
git merge hotfix/critical-bug
gh workflow run deploy.yml
```

---

## 8. Continuous Verification

### 8.1 In-IDE Verification

**VS Code Extensions**:
- ESLint
- Prettier
- Error Lens
- TypeScript Hero

**Settings**:
```json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  }
}
```

---

### 8.2 Monitoring & Alerts

**Tools**:
- Sentry (errors)
- Firebase Analytics (events)
- Crashlytics (crashes)
- Performance monitoring

**Alert Thresholds**:
- Error rate > 1%
- Crash rate > 0.5%
- Frame rate < 55fps

---

### 8.3 Periodic Audits

**Weekly**:
- Review gap log
- Check coverage trends
- Review security scan
- Check bundle size trends

**Monthly**:
- Full accessibility audit
- Performance deep scan
- Dependency update review
- Refactor candidates

---

## 9. Emergency Procedures

### 9.1 Zero-Day Vulnerability

**Immediate Actions**:
1. Check `pnpm audit` for affected packages
2. Check CVE database for severity
3. Update affected packages immediately
4. Run full test suite
5. Deploy hotfix

**Procedure**:
```bash
# Check vulnerability
pnpm audit

# Update if patch available
pnpm update <vulnerable-package>

# Or force resolution
pnpm add <secure-version> --resolution

# Test and deploy
pnpm ci:full
git commit -m "security: patch CVE-XXXX"
git push && gh workflow run deploy.yml
```

---

### 9.2 Data Breach

**Immediate Actions**:
1. Notify security team
2. Document in INCIDENTS.md
3. Rotate all secrets
4. Audit access logs
5. Notify affected users (if required)

---

### 9.3 GDPR Violation

**Immediate Actions**:
1. Document violation
2. Fix violation
3. Re-run GDPR E2E tests
4. Document resolution
5. Notify DPO if required

---

## 10. Verification Reports

### 10.1 Quality Trend Report

**File**: `reports/QUALITY_TREND.md`

**Contents**:
- TypeScript error count over time
- Test coverage trends
- Bundle size trends
- Error rate trends

**Generated**: Weekly

---

### 10.2 Accessibility Report

**File**: `reports/ACCESSIBILITY.md`

**Contents**:
- Critical issues list
- WCAG compliance score
- Screen reader compatibility
- Touch target audit

**Generated**: On PR and weekly

---

### 10.3 Performance Report

**File**: `reports/perf_budget.json`

**Contents**:
- Bundle size
- Frame rate
- Memory usage
- Network requests

**Generated**: On PR and nightly

---

### 10.4 Security Report

**File**: `reports/security_scan.md`

**Contents**:
- CVE list
- Dependency vulnerabilities
- Secret scan results
- SSL configuration

**Generated**: On PR and nightly

---

## 11. Quick Reference

### 11.1 Quick Commands

```bash
# Full verification
pnpm ci:full

# Mobile-specific verification
cd apps/mobile && pnpm ci:strict

# Check TypeScript
pnpm mobile:tsc

# Check lint
pnpm lint

# Run tests
pnpm test

# Run E2E
pnpm test:e2e

# Check bundle
pnpm bundle:analyze

# Audit security
pnpm audit

# Fix all
pnpm lint:fix && pnpm format && pnpm test
```

---

### 11.2 Common Issues

**Issue**: TypeScript errors
**Fix**: Add proper types, avoid `any`

**Issue**: Lint errors
**Fix**: `pnpm lint:fix`

**Issue**: Test failures
**Fix**: Debug specific test, fix code or test

**Issue**: Bundle too large
**Fix**: Code split, remove unused deps

**Issue**: E2E timeouts
**Fix**: Increase timeout, check network

---

### 11.3 Verification Checklist

**Before every commit**:
- [ ] `pnpm lint` passes
- [ ] `pnpm format:check` passes
- [ ] `pnpm mobile:tsc` passes
- [ ] Relevant tests pass

**Before every PR**:
- [ ] All above
- [ ] `pnpm test:coverage` meets threshold
- [ ] Gap log updated
- [ ] Documentation updated

**Before every release**:
- [ ] All above
- [ ] E2E tests pass
- [ ] Security audit clean
- [ ] Performance within budget
- [ ] GDPR tests pass

---

## 12. Appendix

### 12.1 Agent Artifacts Reference

| Agent | Key Artifacts | Verification Command |
|-------|--------------|---------------------|
| PR | product_model.json | `jq . reports/product_model.json` |
| GA | gap_log.yaml | `yq . reports/gap_log.yaml` |
| TG | ts_errors.json | `pnpm mobile:tsc` |
| UX | ux_findings.md | `cat reports/ux_findings.md` |
| A11Y | ACCESSIBILITY.md | `cat reports/ACCESSIBILITY.md` |
| PP | perf_budget.json | `pnpm bundle:analyze` |
| SP | security_scan.md | `pnpm audit` |
| API | openapi.yaml | `pnpm contract:check` |
| SIM | fixtures/*.json | `ls mocks/fixtures/` |
| TE | coverage report | `pnpm test:coverage` |
| E2E | e2e/*.ts | `pnpm test:e2e` |

---

### 12.2 External Tools

- **TypeScript**: `tsc`
- **ESLint**: `eslint`
- **Jest**: `jest`
- **Detox**: `detox`
- **Prettier**: `prettier`
- **Lighthouse**: `lighthouse-ci`
- **Sentry**: Error tracking
- **Firebase**: Analytics

---

### 12.3 Contacts

**Questions about verification process**:
- Review this document
- Check `reports/decisions/*.md`
- Escalate to Arbitration Agent (REF)

**Reporting issues**:
- Create issue in GitHub
- Update `reports/INCIDENTS.md`
- Notify team via Slack

---

**End of Verification Process Document**


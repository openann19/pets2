# Mobile Production Test Strategy

This document describes the comprehensive production-grade test infrastructure for the PawfectMatch mobile app.

## Overview

The test infrastructure consists of multiple tiers, each with specific coverage targets and quality gates:

- **Unit Tests** (Services ≥90%, UI ≥80%): Fast, isolated tests for pure functions and components
- **Integration Tests**: Module wiring, auth flows, offline queueing
- **Contract Tests**: API request/response schema validation
- **E2E Tests**: Critical user journeys on real devices
- **Performance Tests**: Bundle size, startup time, frame times
- **Security Tests**: Secrets scanning, PII handling, dependency vulnerabilities
- **Accessibility Tests**: Roles, labels, contrast, reduce-motion support

## Test Tiers

### 1. Unit Tests

**Location**: `src/services/**/*.test.ts`, `src/hooks/**/*.test.ts`

**Coverage Requirements**: 
- Services: ≥90% (lines, branches, functions, statements)
- UI Components: ≥80% branches

**Running**:
```bash
# Services only
pnpm test:services

# UI only
pnpm test:ui

# Both
pnpm test
```

**Features**:
- Fast execution (< 5s per test)
- Isolated with heavy native modules mocked
- Uses Jest with babel-jest transformer
- MSW for HTTP mocking

### 2. Integration Tests

**Location**: `src/**/integration/**/*.test.ts`, `src/**/*.integration.test.tsx`

**Coverage**: Key flows (auth, upload, offline queue, cache)

**Running**:
```bash
pnpm test:integration
```

**Features**:
- End-to-end module interactions
- Permission flows (camera, photos, location)
- Error boundaries
- Retry/backoff mechanisms

### 3. Contract Tests

**Location**: `tests/contract/**/*.contract.test.ts`, `src/**/*.contract.test.ts?(x)`

**Running**:
```bash
pnpm test:contract
```

**What They Validate**:
- Request/response schemas
- Error codes
- Pagination/filters
- GDPR endpoints

**Example**:
```typescript
describe('Pet API Contracts', () => {
  it('should return paginated list of pets', () => {
    const response = await getPets({ page: 1 });
    expect(response.pets).toBeInstanceOf(Array);
    expect(response.pagination).toHaveProperty('page');
  });
});
```

### 4. E2E Tests

**Location**: `e2e/**/*.e2e.ts`, `e2e/**/*.e2e.js`

**Running**:
```bash
# iOS simulator
pnpm test:e2e:local

# Android emulator
pnpm test:e2e:android

# Cloud device farm
pnpm test:e2e:cloud
```

**Coverage**: Critical journeys
- Onboarding → login → profile → photo upload
- Swipe → match → chat
- Notifications → purchase → logout
- GDPR flows (export/delete)

### 5. Performance Tests

**Location**: Performance benchmarks in `scripts/perf-benchmarks.cjs`

**Running**:
```bash
pnpm test:perf
```

**Budgets** (mid-tier devices):
- Cold start: ≤2.8s
- TTI: ≤3.5s
- Interaction latency (95p): ≤150ms
- Scroll jank: <1% dropped frames
- Bundle size delta: ≤200KB/PR

**Output**: `reports/PERF_RESULTS.json`, `reports/PERF_BASELINE.json`

### 6. Security Tests

**Location**: Static scanning in `scripts/security-scan.sh`

**Running**:
```bash
pnpm test:security
```

**Checks**:
- No secrets in code (AWS keys, GitHub tokens, etc.)
- PII handling
- Debug flags in production
- Dependency vulnerabilities (npm audit)

**Output**: `reports/SECURITY_REPORT.md`

### 7. Accessibility Tests

**Location**: `src/**/a11y/**/*.test.tsx`, `src/**/*.a11y.test.tsx`

**Running**:
```bash
pnpm test:a11y
```

**Validates**:
- Semantic roles and labels
- Color contrast (WCAG AA)
- Touch target sizes (≥44x44pt)
- Reduce motion support
- Focus management
- Error message association

## CI/CD Pipeline

The GitHub Actions workflow (`.github/workflows/mobile-production-tests.yml`) enforces:

### Stage 1: Static Analysis
- TypeScript strict mode check
- ESLint (zero warnings)
- Security scanning (secrets, PII, debug flags)

### Stage 2: Unit & Integration Tests
- Services, UI, Integration projects run in parallel
- Coverage threshold enforcement
- Results uploaded to Codecov

### Stage 3: Contract Tests
- Validates API schemas
- Ensures backend compatibility

### Stage 4: Accessibility Tests
- A11y role/label validation
- Reports generated

### Stage 5: Performance Tests
- Bundle size checks
- Startup time regression detection

### Stage 6: E2E Tests (conditional)
- Smoke tests on iOS/Android
- Full suite on merge to main

### Stage 7: Report Generation
- Test summary with coverage
- Performance trends
- Security findings
- Accessibility report

## Quality Gates

**Merge blockers**:
- Any TypeScript errors
- ESLint warnings
- Test failures
- Coverage below thresholds
- Bundle size regression >10%
- Security vulnerabilities
- Accessibility blockers

**Release readiness**:
- All tests green across tiers
- Coverage thresholds met
- Performance budgets respected
- E2E critical journeys passing
- Security scan clean
- Accessibility issues resolved

## Running Tests Locally

```bash
# All tests
pnpm test:all

# Specific tier
pnpm test:services      # Services
pnpm test:ui           # UI
pnpm test:integration  # Integration
pnpm test:contract     # Contracts
pnpm test:a11y         # Accessibility
pnpm test:perf         # Performance
pnpm test:security     # Security

# E2E
pnpm test:e2e:local    # iOS
pnpm test:e2e:android # Android

# Generate reports
pnpm test:generate-summary
```

## Performance Baseline

After your first successful benchmark run:

1. `reports/PERF_BASELINE.json` is created with initial metrics
2. Subsequent runs compare against baseline
3. Regression >10% triggers failure
4. Update baseline manually if intentional changes

## Evidence Pack

Each release candidate should include:

- `TEST_RUN_SUMMARY.md`: Pass/fail, coverage, device matrix, known issues
- `PERF_BASELINE.json`: Current performance metrics
- `PERF_TRENDS.md`: Performance over time
- `SECURITY_REPORT.md`: Security findings
- `ACCESSIBILITY_REPORT.md`: A11y audit results
- `contracts/`: Pact files + provider verification

## Debugging Failed Tests

### Unit/Integration Tests
```bash
# Run specific test file
pnpm jest path/to/test.ts --verbose

# Run with debugging
NODE_OPTIONS='--inspect' pnpm jest path/to/test.ts
```

### E2E Tests
```bash
# Run with verbose logging
detox test --loglevel verbose

# Run specific test
detox test --testNamePattern="auth flow"
```

### Coverage Gaps
```bash
# Generate HTML coverage report
pnpm test:coverage
# Open coverage/index.html
```

## Troubleshooting

### MSW Not Intercepting Requests
- Ensure MSW server is initialized in `jest.setup.ts`
- Check that handlers are registered
- Verify request URLs match handler patterns

### Performance Tests Failing
- Check device capabilities
- Verify baseline exists
- Review bundle size changes

### Contract Tests Failing
- Validate request/response schemas
- Check API endpoint compatibility
- Review error codes

## Next Steps

1. Run `pnpm install` to get new dependencies (MSW, jest-junit)
2. Run `pnpm test:generate-summary` to create initial reports
3. Set up baseline: `pnpm test:perf` (creates PERF_BASELINE.json)
4. Run full suite: `pnpm test:all && pnpm test:security && pnpm test:a11y`
5. Review `reports/` directory for all artifacts

## Contacts

- Test Infrastructure: See `AGENTS.md` in repo root
- Issues: Create GitHub issue with `[testing]` label
- Questions: Ask in team chat


# 🏗️ Local Setup Guide

This guide provides step-by-step instructions for setting up a deterministic development environment.

## 📦 One-Time Machine Setup

Run this **exactly once per machine**:

```bash
bash scripts/setup-local-env.sh
```

Or manually:

```bash
# Node & package manager
nvm use 20 && nvm alias default 20
corepack enable && corepack prepare pnpm@9.0.0 --activate

# Lock to UTC + stable RNG for tests
echo 'export TZ=UTC' >> ~/.bashrc
echo 'export TEST_SEED=1337' >> ~/.bashrc
source ~/.bashrc
```

## 📱 Mobile E2E Setup (if needed)

### iOS
- Install Xcode
- Set up iOS 18 simulator
- Install applesimutils: `brew install applesimutils`

### Android
- Install Android SDK API 35
- Set up x86_64 emulator (e.g., Pixel_7_API_35)
- Verify device: `adb devices` must show at least one emulator

## ✅ Verification

Run the complete verification suite:

```bash
pnpm install --frozen-lockfile
pnpm verify
```

This runs:
- ✅ Type checking
- ✅ Linting
- ✅ Format checking
- ✅ Secrets scanning
- ✅ Dependency audit
- ✅ Unit tests with coverage
- ✅ Integration tests
- ✅ Contract validation
- ✅ Performance budget checks
- ✅ Bundle size checks
- ✅ Coverage enforcement (≥90%)

## 🔁 The Fix Loop

### Types/Lint/Format Failed

```bash
pnpm lint:fix && pnpm format:fix
pnpm typecheck
```

**Important**: If any `@ts-ignore` or `any` is added, add a TODO with a ticket ID and fix within 48h.

### Unit/Integration Tests Failed

Re-run focused:
```bash
jest path/to/test -i --detectOpenHandles --logHeapUsage
```

**Deterministic tests**:
- Use fake timers
- TZ=UTC
- Seeded RNG (process.env.TEST_SEED)

**Flaky tests**: Quarantine with `it.flaky` or tag + 48h expiry ticket. Don't ship with new flakies.

### Coverage < 90%

Add tests targeting branches (not just lines). Prefer property-based tests for edge inputs.

### E2E Failed (Detox)

Pull traces/screens:
```bash
detox test ... --record-logs all --record-videos failing
```

Replace brittle selectors with testIDs. Never use sleeps — use `waitFor` + expectations.

### Perf or Bundle Budget Failed

Profile the failing journey; fix the biggest offender first (e.g., reduce particle counts on low tier, lazy-load heavy modules, cache).

Re-run:
```bash
pnpm perf:budget && pnpm bundle:size
```

### Secrets or Dep Audit Failed

**Secret found**: Rotate, purge history (BFG), add to `.gitignore`, re-run scan.

**Vulnerabilities**: Upgrade or add policy allow-list with ticket + expiry. **No criticals allowed**.

### Contracts Failed

Update schema + conformance tests. Breaking changes require version bump + migration.

## 📊 Evidence to Attach with Each PR

- `artifacts/evidence/test-report.xml` + `coverage/lcov.info`
- `artifacts/reports/perf.json` (before/after p95)
- `artifacts/contracts/*` (schema conformance)
- `artifacts/bundle/*` (size report)

Include a short "Before/After metrics" block in PR body.

## ✅ Definition of Done

- ✅ `pnpm verify` passes locally and in CI (same Node version)
- ✅ No new flakies; coverage ≥ 90% line+branch
- ✅ Perf/bundle budgets all green
- ✅ PR includes evidence artifacts + a one-line summary of the root cause and the fix

## 🧪 Test Determinism

Tests are configured for deterministic execution:

- **Timezone**: UTC (set via `TZ=UTC` environment variable)
- **Random seed**: 1337 (set via `TEST_SEED=1337` environment variable)
- **Fake timers**: Enabled in Jest setup
- **Seeded RNG**: Linear Congruential Generator using TEST_SEED

These settings are automatically applied in `apps/mobile/jest.setup.ts`.


# Quick Start: Running Comprehensive Test Suites

## Prerequisites

```bash
# Install dependencies
cd server
pnpm install
```

## Running Tests

### All Community Integration Tests
```bash
pnpm test tests/integration/community.*.test.ts
```

### Individual Test Suites

**Race Conditions & Idempotency**
```bash
pnpm test tests/integration/community.race-idempotency.test.ts
```

**Property-Based Tests**
```bash
pnpm test tests/integration/community.property-based.test.ts
```

**Moderation Fail-Closed**
```bash
pnpm test tests/integration/community.moderation-fail-closed.test.ts
```

**AuthZ & Blocklist**
```bash
pnpm test tests/integration/community.authz-blocklist.test.ts
```

**Offline/Outbox Sync**
```bash
pnpm test tests/integration/community.offline-outbox-sync.test.ts
```

**Security & Input Hardening**
```bash
pnpm test tests/integration/community.security-input-hardening.test.ts
```

## Performance Tests (k6)

```bash
# Install k6
# macOS: brew install k6
# Ubuntu/Debian: sudo gpg -k && sudo gpg --no-default-keyring --keyring /usr/share/keyrings/k6-archive-keyring.gpg --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
#              echo "deb [signed-by=/usr/share/keyrings/k6-archive-keyring.gpg] https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
#              sudo apt-get update && sudo apt-get install k6

# Run performance test
export API_URL=http://localhost:5000
export AUTH_TOKEN=your-test-token
k6 run tests/performance/community-feed.k6.js
```

## Test Output

Tests use MongoDB Memory Server (in-memory database), so no setup required.

Each test suite:
- ✅ Creates test users
- ✅ Sets up isolated database
- ✅ Cleans up after execution

## Troubleshooting

**"Cannot find module 'fast-check'"**
```bash
pnpm install fast-check
```

**"Cannot find module 'p-map'"**
```bash
pnpm install p-map
```

**"MongoMemoryServer not found"**
```bash
pnpm install mongodb-memory-server
```

**Performance test fails with "Connection refused"**
- Ensure server is running on `http://localhost:5000`
- Or set `API_URL` environment variable

## Coverage

Run with coverage:
```bash
pnpm test --coverage tests/integration/community.*.test.ts
```

## Watch Mode

Run in watch mode for development:
```bash
pnpm test --watch tests/integration/community.*.test.ts
```


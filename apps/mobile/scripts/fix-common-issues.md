# 🔧 Common Test Issue Fixes

## Quick Fix Patterns

### 1. Import/Export Issues

#### Pattern: Cannot find module
```bash
# Find all import statements in test files
find src -name "*.test.ts*" -exec grep -l "import.*from" {} \;

# Check if imported file exists
# If file exists, verify it has proper exports
```

**Fix:**
```typescript
// ❌ Before (missing export)
export const myFunction = () => {};
// File doesn't export default

// ✅ After
export const myFunction = () => {};
export default myFunction;
```

#### Pattern: Named vs Default Import Mismatch
```typescript
// ❌ Wrong
import MyComponent from './MyComponent'; // File exports named

// ✅ Correct
import { MyComponent } from './MyComponent';
```

### 2. Async/Await Issues

#### Pattern: Act without await
```typescript
// ❌ Before
act(() => {
  doAsyncThing();
});

// ✅ After
await act(async () => {
  await doAsyncThing();
});
```

#### Pattern: WaitFor without proper condition
```typescript
// ❌ Before
waitFor(() => {
  expect(something).toBeTruthy();
}, 100);

// ✅ After
await waitFor(
  () => {
    expect(something).toBeTruthy();
  },
  { timeout: 3000 }
);
```

### 3. Mock Issues

#### Pattern: Service not mocked
```typescript
// ❌ Test fails with "Cannot read property"
import { myService } from '../services/myService';

// ✅ Add mock before test
jest.mock('../services/myService', () => ({
  myService: {
    doSomething: jest.fn(() => Promise.resolve({ data: 'test' })),
  },
}));
```

### 4. Type Issues

#### Pattern: Props type mismatch
```typescript
// ❌ Before
<MyComponent value="123" /> // expects number

// ✅ After
<MyComponent value={123} />
```

### 5. Cleanup Issues

#### Pattern: Cleanup timeout
```typescript
// ❌ Missing cleanup
it('test', async () => {
  // test code
});

// ✅ With cleanup
it('test', async () => {
  // test code
});

afterEach(async () => {
  await cleanup();
  jest.clearAllMocks();
  jest.clearAllTimers();
});
```

---

## Bulk Fix Commands

### Fix All Import Paths
```bash
# Replace relative imports with absolute
find src -name "*.test.ts*" -exec sed -i 's|from '\''../../|from '\''@/|g' {} \;
```

### Add Missing Awaits to Act Calls
```bash
# Find all act() calls without await (manual review needed)
grep -r "act(() =>" src/**/__tests__/
```

### Update All Mock Imports
```bash
# Find all jest.mock calls
grep -r "jest.mock" src/**/__tests__/ | cut -d: -f1 | sort | uniq
```

---

## Test Debugging Commands

### Run Single Failing Test
```bash
npm test -- path/to/file.test.ts --testNamePattern="specific test name"
```

### Run with Verbose Output
```bash
npm test -- path/to/file.test.ts --verbose
```

### Run with Coverage
```bash
npm test -- path/to/file.test.ts --coverage --collectCoverageFrom="src/path/**/*.ts"
```

### Debug with Node Inspector
```bash
node --inspect-brk node_modules/.bin/jest path/to/file.test.ts --runInBand
```

---

## Common Mock Additions Needed

### Add to jest.setup.ts
```typescript
// PanResponder mock (for swipe tests)
jest.mock('react-native/Libraries/Interaction/PanResponder', () => ({
  create: jest.fn(() => ({
    panHandlers: {},
  })),
}));

// Animated.timing mock (for animation tests)
jest.spyOn(Animated, 'timing').mockImplementation(() => ({
  start: jest.fn((callback) => callback && callback()),
  stop: jest.fn(),
  reset: jest.fn(),
}));

// Platform mock
jest.mock('react-native/Libraries/Utilities/Platform', () => ({
  OS: 'ios',
  select: jest.fn((obj) => obj.ios || obj.default),
}));
```

---

## Verification Steps

After each batch of fixes:

1. **Run tests**
   ```bash
   npm test -- --onlyFailures
   ```

2. **Check pass rate**
   ```bash
   npm test 2>&1 | grep "Tests:"
   ```

3. **Verify no new failures**
   ```bash
   git diff --stat
   ```

4. **Commit incrementally**
   ```bash
   git add -p
   git commit -m "fix: resolve [category] test failures"
   ```

---

## Priority Fix Order

1. ✅ **Infrastructure** (COMPLETE)
   - Mocks setup
   - Configuration
   - Global setup/teardown

2. 🔴 **Import/Export** (NEXT - Highest Impact)
   - ~350 tests affected
   - Quick wins
   - Foundation for other fixes

3. 🟡 **Async/Await** (After imports)
   - ~300 tests affected
   - Requires working imports
   - Can be partially automated

4. 🟡 **Mock Data** (After async)
   - ~250 tests affected
   - Depends on services working
   - One-time fixture creation

5. 🟢 **Types** (Last - Lowest Priority)
   - ~150 tests affected
   - Usually non-blocking
   - Quick fixes once others done

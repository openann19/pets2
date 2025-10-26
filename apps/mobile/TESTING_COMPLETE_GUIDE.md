# 🧪 Complete Testing Guide - PawfectMatch Mobile

## 📊 Current Status (Phase 1 Complete)

### Test Results
```
Tests:       1127 failed, 1 skipped, 721 passed, 1849 total
Pass Rate:   39.0%
Time:        480.308s (8 minutes)
```

### Achievement
- ✅ **721 tests passing** (up from 0)
- ✅ **Test infrastructure 100% functional**
- ✅ **All critical mocks in place**
- ⚠️ **1127 tests need fixes** (mostly import/async issues)

---

## 🗂️ File Structure

### Configuration Files
```
apps/mobile/
├── jest.config.cjs           # Jest configuration (with optimizations)
├── jest.setup.ts             # Global mocks (291 lines)
├── babel.config.cjs          # Babel transforms
└── TEST_STATUS.md            # Quick status snapshot
```

### Test Utilities
```
apps/mobile/src/
├── test-utils/
│   └── index.ts              # Custom render, mocks, helpers (200+ lines)
└── __fixtures__/
    ├── index.ts              # Re-exports all fixtures
    ├── users.ts              # User test data
    ├── pets.ts               # Pet test data
    └── matches.ts            # Match/message test data
```

### Scripts
```
apps/mobile/scripts/
├── analyze-test-failures.sh  # Analyze failure patterns
├── verify-imports.js         # Check for import issues
└── fix-common-issues.md      # Fix patterns & commands
```

### Documentation
```
apps/mobile/
├── TEST_STATUS.md            # Quick status
├── TEST_PROGRESS_REPORT.md   # Detailed progress
└── TESTING_COMPLETE_GUIDE.md # This file
```

---

## ✅ Phase 1 Complete: Infrastructure

### 1. Jest Configuration
**File:** `jest.config.cjs`

```javascript
{
  testTimeout: 15000,        // 15 second timeout
  maxWorkers: '50%',         // Prevent resource exhaustion
  testEnvironment: 'jsdom',  // React Native testing
  transformIgnorePatterns: [  // Transform Expo modules
    'node_modules/(?!(react-native|@react-native|@expo|...)/)'
  ]
}
```

### 2. Global Mocks
**File:** `jest.setup.ts` (291 lines)

**React Native Reanimated**
- ✅ Animated.View, Text, ScrollView, Image
- ✅ useSharedValue, useAnimatedStyle
- ✅ withSpring, withTiming, withDelay, withSequence
- ✅ Extrapolate constants

**Expo Modules**
- ✅ @expo/vector-icons (all 8 icon families)
- ✅ expo-linear-gradient
- ✅ expo-haptics
- ✅ expo-blur
- ✅ expo-image-picker
- ✅ expo-camera
- ✅ expo-location
- ✅ expo-notifications
- ✅ expo-device
- ✅ expo-font
- ✅ expo-secure-store

**React Native Core**
- ✅ @react-native-async-storage/async-storage
- ✅ @react-navigation/native (all hooks)
- ✅ react-native-gesture-handler
- ✅ react-native-safe-area-context
- ✅ react-native-maps

**Third-Party**
- ✅ @tanstack/react-query

### 3. Test Utilities
**File:** `src/test-utils/index.ts`

**Custom Render Function**
```typescript
import { customRender as render } from '@/test-utils';

// Renders with all providers (Theme, Navigation, Query)
render(<MyComponent />);

// Without navigation
render(<MyComponent />, { includeNavigation: false });
```

**Mock Data Generators**
```typescript
import { MockUtils } from '@/test-utils';

const user = MockUtils.generateTestData.user();
const pet = MockUtils.generateTestData.pet();
const match = MockUtils.generateTestData.match();
const message = MockUtils.generateTestData.message();
const notification = MockUtils.generateTestData.notification();
```

**Navigation Mocks**
```typescript
import { NavigationMocks } from '@/test-utils';

const mockNavigation = NavigationMocks.createMockNavigation();
const mockRoute = NavigationMocks.createMockRoute({ id: '123' });
```

### 4. Test Fixtures
**Files:** `src/__fixtures__/*.ts`

```typescript
import { testUsers, testPets, testMatches } from '@/__fixtures__';

// Use pre-defined test data
const basicUser = testUsers.basic;
const premiumUser = testUsers.premium;
const dog = testPets.dog;
const activeMatch = testMatches.active;
```

---

## ⚠️ Phase 2: Remaining Issues

### Issue Categories (1127 failing tests)

#### 1. Import/Export Issues (~350 tests)
**Impact:** HIGH
**Fix Time:** 8-10 hours

**Common Patterns:**
```typescript
// Missing file
Cannot find module '../services/someService'

// Wrong export type
import MyComponent from './MyComponent'; // File exports named
// Fix: import { MyComponent } from './MyComponent';

// Incorrect path
import { api } from '../../services/api'; // Wrong depth
// Fix: import { api } from '@/services/api';
```

**Fix Strategy:**
1. Run `node scripts/verify-imports.js` to identify issues
2. Fix missing exports in source files
3. Update import paths (prefer absolute with `@/`)
4. Verify with targeted test runs

#### 2. Async/Await Issues (~300 tests)
**Impact:** MEDIUM-HIGH
**Fix Time:** 6-8 hours

**Common Patterns:**
```typescript
// ❌ Missing await
act(() => {
  doAsyncThing();
});

// ✅ Proper async handling
await act(async () => {
  await doAsyncThing();
});

// ❌ Wrong waitFor usage
waitFor(() => expect(x).toBe(y));

// ✅ Proper waitFor
await waitFor(
  () => expect(x).toBe(y),
  { timeout: 3000 }
);
```

**Fix Strategy:**
1. Search for `act(() =>` without await
2. Add `await act(async () =>` and await internal calls
3. Ensure all `waitFor` calls are awaited
4. Add proper cleanup in `afterEach`

#### 3. Mock Data Issues (~250 tests)
**Impact:** MEDIUM
**Fix Time:** 4-6 hours

**Common Patterns:**
```typescript
// ❌ Undefined mock response
TypeError: Cannot read property 'data' of undefined

// ✅ Use fixtures
import { testUsers, createSuccessResponse } from '@/__fixtures__';
const mockResponse = createSuccessResponse(testUsers.basic);
```

**Fix Strategy:**
1. Use pre-built fixtures from `@/__fixtures__`
2. Mock service responses with realistic data
3. Create additional fixtures as needed
4. Document mock patterns

#### 4. Type Mismatches (~150 tests)
**Impact:** LOW-MEDIUM
**Fix Time:** 3-5 hours

**Common Patterns:**
```typescript
// ❌ Wrong type
<MyComponent value="123" /> // expects number

// ✅ Correct type
<MyComponent value={123} />

// ❌ Missing interface
const data: any = fetchData();

// ✅ Proper typing
interface Data { id: string; name: string; }
const data: Data = fetchData();
```

---

## 🚀 Quick Start Commands

### Run All Tests
```bash
cd apps/mobile
npm test
```

### Run Specific Test File
```bash
npm test -- src/path/to/file.test.ts
```

### Run Only Failing Tests
```bash
npm test -- --onlyFailures
```

### Run with Coverage
```bash
npm test -- --coverage
```

### Debug Specific Test
```bash
node --inspect-brk node_modules/.bin/jest src/path/to/file.test.ts
```

### Analyze Failures
```bash
./scripts/analyze-test-failures.sh
```

### Verify Imports
```bash
node scripts/verify-imports.js
```

---

## 📝 Writing New Tests

### Basic Test Template
```typescript
import { render, screen, waitFor } from '@/test-utils';
import { testUsers } from '@/__fixtures__';
import MyComponent from './MyComponent';

describe('MyComponent', () => {
  it('renders correctly', async () => {
    const user = testUsers.basic;
    
    render(<MyComponent user={user} />);
    
    expect(screen.getByText(user.name)).toBeTruthy();
  });

  it('handles async actions', async () => {
    const mockAction = jest.fn().mockResolvedValue({ success: true });
    
    render(<MyComponent onAction={mockAction} />);
    
    fireEvent.press(screen.getByText('Submit'));
    
    await waitFor(() => {
      expect(mockAction).toHaveBeenCalled();
    });
  });
});
```

### Testing with Navigation
```typescript
import { render } from '@/test-utils';
import { NavigationMocks } from '@/test-utils';
import MyScreen from './MyScreen';

it('navigates on button press', async () => {
  const mockNavigation = NavigationMocks.createMockNavigation();
  const mockRoute = NavigationMocks.createMockRoute({ id: '123' });
  
  render(
    <MyScreen 
      navigation={mockNavigation} 
      route={mockRoute} 
    />
  );
  
  fireEvent.press(screen.getByText('Go Back'));
  
  expect(mockNavigation.goBack).toHaveBeenCalled();
});
```

### Testing Async Data Fetching
```typescript
import { render, waitFor } from '@/test-utils';
import { testPets, createSuccessResponse } from '@/__fixtures__';
import * as api from '@/services/api';

jest.mock('@/services/api');

it('loads and displays pets', async () => {
  const mockPets = [testPets.dog, testPets.cat];
  jest.spyOn(api, 'fetchPets').mockResolvedValue(
    createSuccessResponse(mockPets)
  );
  
  render(<PetList />);
  
  await waitFor(() => {
    expect(screen.getByText('Buddy')).toBeTruthy();
    expect(screen.getByText('Whiskers')).toBeTruthy();
  });
});
```

---

## 🎯 Next Steps (Priority Order)

### Week 1: Import/Export Fixes
**Goal:** +350 passing tests (→ 1071 passing)

1. Run `node scripts/verify-imports.js`
2. Fix top 50 missing files/exports
3. Update import paths to use `@/`
4. Verify with test runs
5. Commit incrementally

### Week 2: Async/Await Cleanup
**Goal:** +300 passing tests (→ 1371 passing)

1. Search for `act(() =>` without await
2. Add proper async/await handling
3. Fix `waitFor` usage
4. Add cleanup in `afterEach`
5. Test incrementally

### Week 3: Mock Data
**Goal:** +250 passing tests (→ 1621 passing)

1. Expand fixture files
2. Mock service responses
3. Create test data factories
4. Document patterns
5. Verify coverage

### Week 4: Type Fixes & Polish
**Goal:** +150 passing tests (→ 1771 passing, 95.8%)

1. Fix prop type mismatches
2. Update interfaces
3. Add type assertions
4. Run TypeScript compiler
5. Final verification

---

## 📊 Success Metrics

### Target
- **Pass Rate:** 95%+ (1754+/1849 tests)
- **Suite Pass Rate:** 94%+ (168+/179 suites)
- **Test Time:** <5 minutes
- **Coverage:** 80%+ for changed files

### Current
- **Pass Rate:** 39.0% (721/1849 tests)
- **Suite Pass Rate:** 8.9% (16/179 suites)
- **Test Time:** 8 minutes
- **Coverage:** Not measured yet

---

## 🔧 Maintenance

### Keep Mocks Updated
When adding new dependencies:
1. Add mock to `jest.setup.ts`
2. Follow existing patterns
3. Document in this file
4. Test thoroughly

### Keep Fixtures Current
When schema changes:
1. Update relevant fixture files
2. Update type definitions
3. Test dependent tests
4. Document changes

### Monitor Test Health
```bash
# Weekly check
npm test 2>&1 | grep "Tests:"

# Identify regressions
git diff main..HEAD --stat '*test.ts*'

# Coverage trends
npm test -- --coverage --coverageReporters=text
```

---

## 📚 Resources

### Internal Docs
- `TEST_STATUS.md` - Quick status
- `TEST_PROGRESS_REPORT.md` - Detailed report
- `scripts/fix-common-issues.md` - Fix patterns

### External Resources
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Native Testing Library](https://callstack.github.io/react-native-testing-library/)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

---

**Last Updated:** October 26, 2025, 5:45 PM UTC+2
**Phase 1 Status:** COMPLETE ✅
**Next Phase:** Import/Export Fixes (Week 1)

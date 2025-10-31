# Test Fix Guide - Systematic Approach to Fixing Remaining Failures

## Overview

This guide provides a systematic approach to fixing the remaining test failures in the mobile test suite. The infrastructure is stable, so we can focus on component-specific issues.

## Current Status

✅ **Infrastructure Stable:**
- Theme mocking: Fixed
- Async/await patterns: Fixed
- Error handling: Improved
- Complex component mocks: Comprehensive

❌ **Remaining Issues:**
- Component-specific rendering issues
- Missing component mocks
- Integration test timing issues
- Type mismatches

## Fix Categories

### 1. Component Rendering Issues

**Symptoms:**
- `Cannot read property of undefined`
- `useTheme is not a function`
- `ThemeProvider not found`

**Fix Strategy:**

1. **Use Unified Render Utility**
   ```tsx
   // ❌ DON'T: Direct render
   import { render } from '@testing-library/react-native';
   render(<MyComponent />);
   
   // ✅ DO: Use unified render
   import { render } from '@/test-utils/unified-render';
   render(<MyComponent />);
   ```

2. **Ensure Theme Hook Ordering**
   ```tsx
   // ✅ DO: Declare theme at top of component
   const MyComponent = () => {
     const theme = useTheme(); // First line after function start
     // ... rest of component
   };
   ```

3. **Check Component Imports**
   ```tsx
   // Ensure all imports are correct
   import { useTheme } from '@/theme'; // Not '@/theme/unified-theme'
   ```

### 2. Missing Component Mocks

**Symptoms:**
- `Cannot find module`
- `Module not found`
- `jest.mock is not a function`

**Fix Strategy:**

1. **Add Missing Mocks to jest.setup.ts**
   ```tsx
   // In apps/mobile/jest.setup.ts
   jest.mock('@react-native-community/datetimepicker', () => ({
     default: 'DateTimePicker',
   }));
   ```

2. **Mock Complex Components Locally**
   ```tsx
   // In test file
   jest.mock('@/components/chat/PlaydateScheduler', () => ({
     PlaydateScheduler: jest.fn(() => null),
   }));
   ```

3. **Verify Module Paths**
   ```tsx
   // Use aliases from tsconfig
   import { something } from '@/services/service'; // ✅
   // Not: import { something } from '../../../services/service'; // ❌
   ```

### 3. Integration Test Timing Issues

**Symptoms:**
- Tests timing out
- `waitFor` failures
- `act()` warnings

**Fix Strategy:**

1. **Use Proper waitFor**
   ```tsx
   // ✅ DO: Use waitFor with condition
   await waitFor(() => {
     expect(getByText('Loaded')).toBeTruthy();
   }, { timeout: 3000 });
   ```

2. **Wrap Async Updates in act()**
   ```tsx
   // ✅ DO: Wrap state updates
   await act(async () => {
     await result.current.refresh();
   });
   ```

3. **Increase Timeouts for Slow Operations**
   ```tsx
   // For API calls or heavy computations
   jest.setTimeout(10000); // At top of test file
   ```

4. **Use waitForRender Helper**
   ```tsx
   import { waitForRender } from '@/test-utils/unified-render';
   
   await waitForRender(() => !!getByText('Content'));
   ```

### 4. Type Mismatches

**Symptoms:**
- TypeScript errors in tests
- `Type X is not assignable to type Y`
- Property does not exist on type

**Fix Strategy:**

1. **Fix Mock Return Types**
   ```tsx
   // ✅ DO: Properly type mocks
   const mockService = {
     getData: jest.fn<Promise<Data>, []>(() => Promise.resolve({ id: 1 })),
   } as jest.Mocked<typeof service>;
   ```

2. **Use Type Assertions When Needed**
   ```tsx
   // ✅ DO: Assert types when mocking
   (useAuthStore as unknown as jest.Mock).mockReturnValue({
     user: mockUser,
   });
   ```

3. **Check Theme Type Compatibility**
   ```tsx
   // Ensure theme mock matches AppTheme type
   const mockTheme: AppTheme = {
     colors: { /* ... */ },
     spacing: { /* ... */ },
     // ... rest of theme
   };
   ```

## Systematic Fix Process

### Step 1: Run Analysis

```bash
node scripts/analyze-test-failures-enhanced.mjs
```

This categorizes failures and shows priority order.

### Step 2: Fix by Category

1. **Component Rendering** (Highest Priority)
   - Replace direct `render()` with `@/test-utils/unified-render`
   - Fix theme hook ordering
   - Verify all imports

2. **Missing Mocks** (High Priority)
   - Add mocks to `jest.setup.ts`
   - Add local mocks for complex components
   - Verify module paths

3. **Async Timing** (Medium Priority)
   - Fix `waitFor` usage
   - Add `act()` wrappers
   - Adjust timeouts

4. **Type Mismatches** (Lower Priority)
   - Fix mock types
   - Add type assertions
   - Verify theme compatibility

### Step 3: Verify Fixes

After each category:
```bash
pnpm --filter @pawfectmatch/mobile test
```

Re-run analysis to see progress:
```bash
node scripts/analyze-test-failures-enhanced.mjs
```

## Common Patterns

### Pattern 1: Component Test Setup

```tsx
import { render, createMockScreenProps } from '@/test-utils/unified-render';
import { MyScreen } from '../MyScreen';

describe('MyScreen', () => {
  it('renders correctly', () => {
    const props = createMockScreenProps();
    const { getByText } = render(<MyScreen {...props} />);
    expect(getByText('Hello')).toBeTruthy();
  });
});
```

### Pattern 2: Hook Test Setup

```tsx
import { renderHook, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useMyHook } from '../useMyHook';

describe('useMyHook', () => {
  it('works correctly', async () => {
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const wrapper = ({ children }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
    
    const { result } = renderHook(() => useMyHook(), { wrapper });
    
    await waitFor(() => {
      expect(result.current.data).toBeDefined();
    });
  });
});
```

### Pattern 3: Service Mock Setup

```tsx
import { myService } from '@/services/myService';

jest.mock('@/services/myService', () => ({
  myService: {
    getData: jest.fn(),
    postData: jest.fn(),
  },
}));

const mockService = myService as jest.Mocked<typeof myService>;

beforeEach(() => {
  mockService.getData.mockResolvedValue({ data: 'test' });
});
```

## Tools & Utilities

### Unified Render Utility
Location: `apps/mobile/src/test-utils/unified-render.tsx`

**Features:**
- Automatic ThemeProvider setup
- NavigationContainer wrapper
- QueryClientProvider included
- SafeAreaProvider support
- I18n support

**Usage:**
```tsx
import { render, createMockScreenProps } from '@/test-utils/unified-render';
```

### Test Helpers
Location: `apps/mobile/src/test-utils/component-helpers.tsx`

**Features:**
- `renderWithProviders()` - Full provider stack
- `createMockScreenProps()` - Navigation + route mocks
- `mockNavigation` - Reusable navigation mock

## Success Criteria

- ✅ All tests pass (or skip with TODO for complex scenarios)
- ✅ No console warnings in test output
- ✅ Test execution time < 5 minutes
- ✅ Coverage > 75% globally, > 90% on changed lines

## Next Steps

1. Run `analyze-test-failures-enhanced.mjs` to get current status
2. Start with highest-priority category
3. Fix systematically, one category at a time
4. Re-run analysis after each batch
5. Document any edge cases or complex scenarios

## Resources

- Test Infrastructure: `apps/mobile/jest.setup.ts`
- Theme System: `apps/mobile/src/theme`
- Test Utils: `apps/mobile/src/test-utils`
- Failure Reports: `reports/test-failure-analysis.json`


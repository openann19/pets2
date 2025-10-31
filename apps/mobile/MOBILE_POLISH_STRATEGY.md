# Mobile App Polish - Systematic Fix Strategy

## Overview
Complete mobile app polish addressing test failures, TypeScript errors, and code quality.

## Root Causes Identified

### 1. **Test Rendering Issues (40% of failures)**
- **Problem**: Tests use `render()` directly from `@testing-library/react-native` instead of unified render
- **Impact**: Missing providers (Theme, Navigation, SafeArea, I18n, QueryClient) cause immediate failures
- **Fix**: Replace with `import { render } from '@/test-utils/unified-render'`

### 2. **Timer Leaks (25% of failures)**
- **Problem**: Tests using `jest.useFakeTimers()` but not properly cleaning up
- **Impact**: Tests timeout waiting for promises that never resolve
- **Fix**: Use `jest.useRealTimers()` in afterEach or use helper from timer-helpers.ts

### 3. **Animated Component Mocking (15% of failures)**
- **Problem**: `Animated.Value` and animations not properly mocked in jest.setup
- **Impact**: Components using Animated crash with "Cannot read properties of undefined"
- **Fix**: Ensure react-native.js mock properly exports Animated.Value as a class

### 4. **Type Mismatches in Mocks (10% of failures)**
- **Problem**: Mock return types don't match actual service contracts
- **Impact**: Type errors cause test failures
- **Fix**: Ensure mocks return correct types (e.g., { success, data } not wrapped in `{ data: { success, data } }`)

### 5. **Syntax Errors in Test Files (10% of failures)**
- **Problem**: Malformed JSDoc comments in integration/regression tests
- **Impact**: Files don't parse, causing immediate failures
- **Fix**: Fix duplicate/malformed documentation blocks

## Fix Priority Order

### Phase 1: Foundation (Immediate - ~30 min)
1. ✅ Fix Animated.Value mock in `__mocks__/react-native.js` 
2. ✅ Fix JSDoc syntax errors in test files
3. ✅ Verify jest.setup.ts cleanup hooks
4. ✅ Fix useChatScroll timer management

### Phase 2: High-Impact Rendering Fixes (Next - ~60 min)
1. Replace direct `render()` in component tests with unified-render
   - Start with: PeekSheet, ModernPhotoUpload, AdvancedPhotoEditor
   - Pattern: `import { render } from '@/test-utils/unified-render'`
   - Remove manual provider wrapping in tests
2. Fix hook tests to use proper renderHook helpers
3. Add mock for any missing components or services

### Phase 3: Timer & Async Fixes (Next - ~30 min)
1. Fix fake timer usage in all tests
2. Add proper act() wrappers for state updates
3. Fix waitFor timeout values

### Phase 4: Type & Contract Alignment (Final - ~30 min)
1. Verify mock return types match service contracts
2. Fix mock implementations that return wrong types
3. Add type assertions where needed

## File Changes Summary

### Files Already Fixed ✅
- `__mocks__/react-native.js`: Animated.Value as proper class
- `src/__tests__/integration.test.tsx`: Fixed JSDoc syntax
- `src/hooks/chat/__tests__/useChatScroll.test.ts`: Fixed timer management

### Files to Fix (by priority)

#### Component Tests (Phase 2)
- `src/components/swipe/__tests__/PeekSheet.test.tsx` → Use unified-render
- `src/components/__tests__/ModernPhotoUpload.test.tsx` → Use unified-render
- `src/components/photo/__tests__/AdvancedPhotoEditor.test.tsx` → Use unified-render
- `src/components/Animations/__tests__/MicroInteractionButton.test.tsx` → Use unified-render
- `src/components/Animations/__tests__/MicroInteractionCard.test.tsx` → Use unified-render

#### Hook Tests (Phase 2)
- Any hook tests using direct render() should use renderHookWithProviders

#### Regression Tests (Phase 3)
- `src/__tests__/regression.test.tsx` → Fix type errors and imports
- `src/__tests__/advanced-regression.test.tsx` → Fix remaining syntax

## Execution Commands

```bash
# Step 1: Verify mocks are correct
pnpm exec jest --testPathPattern="PeekSheet" --maxWorkers=1

# Step 2: Run full suite to see progress
pnpm exec jest --maxWorkers=1

# Step 3: Check TypeScript
pnpm exec tsc --noEmit --skipLibCheck

# Step 4: Check ESLint
pnpm exec eslint src --max-warnings=0
```

## Success Criteria

- ✅ All component tests pass with unified-render
- ✅ No timer leaks (afterEach cleans up properly)
- ✅ Animated components render without errors
- ✅ Mock return types match contracts
- ✅ TypeScript strict mode passes
- ✅ ESLint has zero errors
- ✅ Jest suite runs with maxWorkers=1 without timeouts

## Quick Reference: Unified Render Usage

### Before (Direct render - ❌ WRONG)
```tsx
import { render } from '@testing-library/react-native';

it('works', () => {
  const { getByText } = render(<MyComponent />);
  // Missing: Theme, Navigation, SafeArea, I18n, QueryClient
  // Result: Tests fail with provider errors
});
```

### After (Unified render - ✅ RIGHT)
```tsx
import { render } from '@/test-utils/unified-render';

it('works', () => {
  const { getByText } = render(<MyComponent />);
  // Includes: Theme, Navigation, SafeArea, I18n, QueryClient
  // Result: Tests pass consistently
});
```

## Timer Management Pattern

### Before (❌ WRONG - Leaks timers)
```tsx
beforeEach(() => {
  jest.useFakeTimers();
});

afterEach(() => {
  jest.useRealTimers(); // Too late, already hung
});
```

### After (✅ RIGHT - Proper cleanup)
```tsx
beforeEach(() => {
  jest.clearAllTimers();
});

afterEach(() => {
  jest.clearAllTimers();
  jest.useRealTimers();
});
```

## Estimated Impact

- Phase 1 (Foundation): ~30% test failures fixed
- Phase 2 (Rendering): ~40% additional tests fixed  
- Phase 3 (Timers): ~15% additional tests fixed
- Phase 4 (Types): ~10% additional tests fixed
- **Total: ~95% of failures resolved**


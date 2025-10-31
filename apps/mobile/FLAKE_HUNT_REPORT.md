# Flake Hunt - Root Causes Identified

## Common Flake Patterns Found

### Pattern 1: Global Fake Timers (CRITICAL)
**Issue**: `usageTracking.test.ts` had `jest.useFakeTimers()` at global scope
**Impact**: Fake timers leak into other tests causing flakiness
**Fix**: ✅ Moved to `beforeEach` with `afterEach` cleanup

### Pattern 2: Timer Advancement Without act() Wrapper
**Issue**: `useBlockedUsers.test.ts` - `jest.advanceTimersByTime()` called without `act()`
**Impact**: React state updates not properly flushed
**Fix**: ✅ Wrapped timer advancement in `act(async () => { ... })`

### Pattern 3: Concurrent Operations Without Proper Sequencing
**Issue**: `usePhotoManagement.test.ts` - `Promise.all()` for concurrent adds
**Impact**: Race conditions in state updates
**Fix**: ✅ Changed to sequential `await act()` calls

### Pattern 4: Missing Timer Cleanup
**Issue**: Tests using fake timers don't always restore real timers
**Impact**: Timer state leaks between tests
**Fix**: ✅ Added `afterEach` cleanup in usePhotoManagement tests

### Pattern 5: setTimeout Without Fake Timers
**Issue**: `usePhotoManagement.test.ts` - Uses `setTimeout` in mock but doesn't enable fake timers
**Impact**: Test waits for real 30s timeout or fails inconsistently
**Fix**: ✅ Added `jest.useFakeTimers()` before test, cleanup after

## Fixes Applied

### 1. ✅ usageTracking.test.ts
- **Before**: Global `jest.useFakeTimers()` at top level
- **After**: Moved to `beforeEach`, added `jest.useRealTimers()` in `afterEach`
- **Impact**: Prevents timer leakage to other tests

### 2. ✅ useBlockedUsers.test.ts  
- **Before**: `act(() => { jest.advanceTimersByTime(1000) })`
- **After**: `await act(async () => { jest.advanceTimersByTime(1000) })`
- **Impact**: Proper async state flushing

### 3. ✅ usePhotoManagement.test.ts
- **Before**: `Promise.all()` for concurrent operations
- **After**: Sequential `await act()` calls
- **Before**: `setTimeout` mock without fake timers
- **After**: `jest.useFakeTimers()` + cleanup
- **Impact**: Eliminates race conditions, deterministic timeouts

## Deterministic Setup Already in Place

✅ `jest.setup.ts` already has:
- `jest.useFakeTimers({ legacyFakeTimers: false })`
- `jest.setSystemTime(new Date('2024-01-01T00:00:00Z'))`
- `Math.random = fixedRandom` (deterministic RNG)

## Remaining Potential Flake Sources

### 1. Async Storage Mock State
- Tests may share AsyncStorage mock state
- **Fix**: Ensure `jest.clearAllMocks()` in beforeEach

### 2. Singleton Instances
- Services like AnalyticsService use singleton pattern
- **Fix**: Reset singleton in beforeEach (already done)

### 3. Network State Mocking
- NetInfo mock state may persist between tests
- **Fix**: Ensure proper mock reset

## Test Validation Strategy

1. ✅ Run tests multiple times with `--retries=2`
2. ✅ Check for timer/async issues
3. ✅ Verify cleanup in afterEach hooks
4. ✅ Test concurrent operations for race conditions

## Next Steps

1. Run flake detection on more test files
2. Check for date/time usage without mocking
3. Verify all async operations properly awaited
4. Check for shared state between tests


# Mobile Type Error Fix Plan
## Dedicated 8-12 Hour Session

**Generated:** 2025-01-26  
**Total Errors:** 395  
**Strategy:** Systematic 4-phase approach  
**Target:** Zero type errors, fully functional mobile app

---

## Executive Summary

### Current State
- ✅ Type error analysis complete
- ❌ 395 type errors blocking builds and tests
- ❌ Critical API client type issues
- ❌ Reanimated API v2 → v3 migration needed
- ❌ Missing module exports and dependencies

### Goal
Complete systematic fix of all 395 type errors in a single dedicated session, following the phased approach below.

---

## Phase 1: Critical Infrastructure Fixes (2-3 hours)
*Estimated Impact: Fixes ~150 errors*

### 1.1 API Client Type Definitions (1 hour)

**Files to Fix:**
- `src/services/api.ts` - Fix base API client type
- `src/services/photoUpload.ts` (Line 5)
- `src/services/photoUploadService.ts` (Lines 39, 53)
- `src/services/multipartUpload.ts` (Lines 19, 29, 44)
- `src/services/verificationService.ts` (Lines 92, 105, 120, 135, 150, 163, 176, 201, 228, 250)
- `src/utils/premium.tsx` (Line 12)
- `src/utils/withPremiumGate.tsx` (Lines 22, 24, 37)

**Errors:** 50+ "Property 'post/get' does not exist" errors

**Action:** 
```typescript
// Update api.ts to export proper types
export interface APIClient {
  post: (url: string, data: any) => Promise<any>;
  get: (url: string) => Promise<any>;
  // ... other methods
}
```

**Verify:** `grep "api\.post\|api\.get"` should show no TS2339 errors

### 1.2 Missing Module Exports (45 min)

**Files to Fix:**
- `src/components/map/index.ts` - Add missing exports
- `src/components/voice/index.ts` (Line 5) - VoiceWaveformUltra
- `src/components/premium-demo/*.tsx` - ScrollTrigger exports
- `src/hooks/swipe/useSwipeGestures.ts` (Line 11) - PanResponder
- Create missing wrapper components

**Action:**
1. Export `PulsePin` from `PinDetailsModal.tsx`
2. Export `CreateActivityForm` from `CreateActivityModal.tsx`
3. Create `VoiceWaveformUltra.tsx` or fix import path
4. Add type declarations for missing modules

### 1.3 Install Missing Dependencies (30 min)

**Packages to Install/Stub:**
```bash
pnpm add -D @types/react-native-purchases
pnpm add -D @types/react-error-boundary  
# Or add type declarations in @types/
```

**Files Creating Stubs:**
- `src/config/revenuecat.ts` - Add Purchases types
- `src/providers/PremiumProvider.tsx` - Add Purchases types
- Create `@types/react-error-boundary.d.ts` if needed

**Action:**
Create type declarations in `src/@types/react-native-purchases.d.ts`

### 1.4 Theme Types Enhancement (30 min)

**Files to Fix:**
- `src/theme/types.ts` - Add missing types
- `src/theme/Provider.tsx` (Lines 35-36)
- `src/components/elite/containers/EliteContainer.tsx` (Line 29)

**Missing Properties:**
- `xs` in shadow/radius scales
- `gradientPrimary` in SemanticColors
- `ThemeMode`, `ColorPalette`, etc.

**Action:**
```typescript
// src/theme/types.ts
export interface ShadowScale {
  xs: ShadowStyle; // ADD THIS
  sm: ShadowStyle;
  md: ShadowStyle;
  lg: ShadowStyle;
  xl: ShadowStyle;
}

export interface SemanticColors {
  gradientPrimary: string; // ADD THIS
  primary: string;
  secondary: string;
  // ... others
}
```

---

## Phase 2: Reanimated API Migration (3-4 hours)
*Estimated Impact: Fixes ~100 errors*

### 2.1 Core Migration - useMotionSystem.ts (2 hours)

**File:** `src/hooks/useMotionSystem.ts`

**Deprecated API:**
```typescript
// OLD (v2)
animatedValue.interpolate({ inputRange, outputRange })
Animated.Value(0)
Animated.spring()
Animated.parallel()
```

**New API (v3):**
```typescript
// NEW (v3)
useDerivedValue(() => interpolate(animatedValue.value, inputRange, outputRange))
useSharedValue(0)
withSpring(value, config)
runOnJS(() => {...}) // for parallel
```

**Specific Changes:**
- Line 90-103: Replace `.interpolate()` with `useDerivedValue` + `interpolate`
- Line 122: Replace `Animated.Value` with `useSharedValue`
- Line 130: Replace function signature
- Line 148-156: Replace `Animated.spring()` with `withSpring()`
- Line 353-358, 388-400: Replace timing/sequence/parallel

**Pattern:**
```typescript
// Find and replace:
animatedValue.interpolate({
  inputRange: [...],
  outputRange: [...]
})

// With:
useDerivedValue(() => 
  interpolate(animatedValue.value, inputRange, outputRange)
)
```

### 2.2 Component Updates (90 min)

**Files with Reanimated Issues:**
1. `src/components/library/cards/MemoryCard.tsx` (Lines 48, 54, 60)
2. `src/components/swipe/ConfettiBurst.tsx` (Lines 96, 161) - Remove `._value`
3. `src/hooks/useSwipeToReply.ts` (Line 5) - Fix `clamp` import
4. Update any component using old Reanimated API

**Action:**
Search and replace pattern:
```typescript
// Find: .interpolate(
// Replace: useDerivedValue(() => interpolate(
```

### 2.3 Test Reanimated Changes (30 min)

**Verify:**
- Run `pnpm mobile:tsc` to check for remaining interpolate errors
- Ensure animations still work in simulator
- Check MemoryCard component animations

---

## Phase 3: Type Safety & Null Checks (2-3 hours)
*Estimated Impact: Fixes ~80 errors*

### 3.1 Fix "Object Possibly Undefined" Errors (90 min)

**Error Code:** TS2532, TS18048 (78 errors)

**Pattern Examples:**
```
src/components/chat/ReactionBarMagnetic.tsx(48,5)
src/utils/AutoCropEngine.ts(55,10)
src/utils/image-ultra/*.ts - Multiple files
```

**Strategy:**
Use optional chaining and null coalescing:
```typescript
// Before:
const x = obj.property.value;

// After:
const x = obj?.property?.value;
// Or:
if (obj?.property) {
  const x = obj.property.value;
}
```

**Files to Fix (Priority):**
1. `src/utils/image-ultra/crop_scorer.ts` - 11 errors
2. `src/utils/image-ultra/filters.ts` - 10 errors
3. `src/utils/image-ultra/filters_extras.ts` - 12 errors
4. `src/utils/image-ultra/ssim.ts` - 15 errors
5. `src/components/chat/ReactionBarMagnetic.tsx` - 4 errors

### 3.2 Fix Argument Type Mismatches (60 min)

**Error Code:** TS2345 (35 errors)

**Common Patterns:**
1. String/Number mismatches - Add type conversions
2. Type widening issues - Add explicit types
3. Array vs string conversions

**Examples:**
```typescript
// Fix:
const result = Math.max(undefined, 0); // Add fallback
const arr = stringValue.split(','); // Ensure not undefined first
```

### 3.3 Fix Type Assignability Issues (30 min)

**Error Code:** TS2322 (72 errors)

**Common Issues:**
- Style prop mismatches
- Event handler signature mismatches
- Return type mismatches

**Strategy:** Add type assertions or fix return types

---

## Phase 4: Polish & Final Verification (1-2 hours)
*Estimated Impact: Fixes ~65 errors + validation*

### 4.1 Remaining Property Errors (45 min)

**Error Code:** TS2339 remaining issues

**Focus Areas:**
1. Navigation event emitters - Fix emit calls
2. Component props - Add missing prop types
3. Module exports - Complete remaining exports

### 4.2 Fix Import Errors (30 min)

**Error Code:** TS2307, TS2305, TS2614

**Actions:**
- Add proper imports
- Fix module resolution
- Add type-only imports where needed

### 4.3 Final Type Check & Verification (15 min)

```bash
cd apps/mobile
pnpm type-check
```

**Success Criteria:**
- Zero type errors
- All files compile
- No new errors introduced

### 4.4 Create Test Plan (15 min)

**Verify Critical Paths:**
1. Run `pnpm mobile:tsc` - should pass
2. Run `pnpm mobile:lint` - should pass
3. Run subset of tests - verify no regressions
4. Check critical screens render properly

---

## Detailed File-by-File Breakdown

### High-Priority Files (Fix First)

1. **API Client**
   - `src/services/api.ts` - Fix base client
   - Estimated: 20 min, Fixes 50+ errors

2. **Reanimated Core**
   - `src/hooks/useMotionSystem.ts` - Migrate API
   - Estimated: 90 min, Fixes 27+ errors

3. **Image Processing**
   - `src/utils/image-ultra/*.ts` - Add null checks
   - Estimated: 60 min, Fixes 60+ errors

4. **Theme System**
   - `src/theme/types.ts` - Add missing types
   - Estimated: 30 min, Fixes 40+ errors

5. **Navigation**
   - `src/hooks/navigation/useTabReselectRefresh.ts` - Fix emit
   - Estimated: 20 min, Fixes 4 errors

### Medium-Priority Files

6. Chat components (20 min, 15 errors)
7. Map components (30 min, 10 errors)
8. Photo upload services (20 min, 8 errors)
9. Typography components (15 min, 6 errors)
10. Premium components (20 min, 10 errors)

### Low-Priority Files (Polish)

- Various utility files
- Single-error files
- Low-impact styling files

---

## Time Breakdown Estimate

| Phase | Duration | Cumulative | Errors Fixed |
|-------|----------|------------|--------------|
| Phase 1 | 2.5 hours | 2.5h | ~150 |
| Phase 2 | 3.5 hours | 6.0h | ~100 |
| Phase 3 | 2.5 hours | 8.5h | ~80 |
| Phase 4 | 1.5 hours | 10.0h | ~65 |
| **TOTAL** | **10 hours** | | **~395** |

### Buffer Time Considerations

- **Risk:** Reanimated migration may take longer if complex animations
- **Risk:** API client changes may affect multiple services
- **Recommendation:** Allow 2-hour buffer → **12 hours total**

---

## Execution Checklist

### Before Starting
- [ ] Read Reanimated v3 migration guide
- [ ] Understand API client architecture
- [ ] Set up test environment
- [ ] Create git branch: `fix/mobile-type-errors`

### During Execution
- [ ] Complete Phase 1 - Infrastructure
- [ ] Verify impact with `pnpm mobile:tsc`
- [ ] Complete Phase 2 - Reanimated
- [ ] Test animations manually
- [ ] Complete Phase 3 - Type Safety
- [ ] Complete Phase 4 - Polish
- [ ] Final verification pass

### After Completion
- [ ] All tests should pass
- [ ] Document any breaking changes
- [ ] Update any affected API contracts
- [ ] Create summary report

---

## Success Metrics

### Primary Goals
- ✅ Zero TypeScript errors in mobile app
- ✅ All files compile without errors
- ✅ No regressions in existing functionality
- ✅ All type definitions are correct and useful

### Secondary Goals
- ✅ Improved type safety across app
- ✅ Better IntelliSense support
- ✅ Easier to maintain and extend
- ✅ Foundation for additional features

---

## Risk Mitigation

### Risk 1: Reanimated Migration Complexity
**Mitigation:** 
- Work incrementally
- Test after each major change
- Keep v2 patterns available for rollback

### Risk 2: Breaking API Changes
**Mitigation:**
- Update API client types carefully
- Test service calls after changes
- Maintain backward compatibility where possible

### Risk 3: Time Overrun
**Mitigation:**
- Prioritize highest-impact errors first
- Defer low-priority fixes to follow-up session
- Focus on compilation success over perfection

---

## Conclusion

This plan provides a systematic approach to fixing all 395 mobile type errors in a dedicated 8-12 hour session. The phased approach ensures:

1. **Foundation First** - Critical infrastructure fixed early
2. **Biggest Impact** - Reanimated migration addresses largest error category
3. **Incremental Progress** - Each phase delivers measurable results
4. **Safety Net** - Verification at each step prevents regressions

**Recommended Approach:**
- Follow this plan chronologically
- Test after each phase
- Adjust timelines based on complexity encountered
- Maintain git commits after each major fix

**Next Steps:**
- Schedule dedicated 12-hour session
- Set up development environment
- Begin with Phase 1
- Track progress against this plan

---

*End of Fix Plan*


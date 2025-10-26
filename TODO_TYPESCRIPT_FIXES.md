# TypeScript Type Safety Fix - TODO List

## ✅ Completed

- [x] Type infrastructure (api-responses.ts, reanimated.d.ts, navigation.d.ts, window.d.ts)
- [x] Zod runtime validation schemas
- [x] Eliminate all @ts-ignore/@ts-expect-error (0 remaining)
- [x] Fixed WebRTCService.ts (6 instances)
- [x] Fixed observability.ts (4 instances)
- [x] Fixed SecureAPIService.ts (3 instances)
- [x] Fixed chatService.ts (1 instance)
- [x] Fixed photoUploadService.ts (1 instance)
- [x] Fixed AccessibilityService.ts (1 instance)
- [x] Fixed enhancedUploadService.ts (2 instances)
- [x] Fixed mapActivityService.ts (1 instance)
- [x] Fixed livekitService.ts (4 instances)
- [x] Fixed settingsService.ts (1 instance)

## ✅ Completed (Priority 1) - Service Layer Type Safety

### Service Layer Type Safety ✅

1. **enhancedUploadService.ts** - ✅ Fixed
   - Added `PhotoUploadAnalysis` interface
   - Replaced `analysis?: any` with proper type

2. **mapActivityService.ts** - ✅ Fixed
   - Added `MapSearchParams` interface
   - Replaced `const params: any` with typed interface

3. **livekitService.ts** - ✅ Fixed
   - Added `LiveKitEventData` discriminated union type
   - Added type-safe `LiveKitEventCallback` generic type
   - Removed all `: any` from event listeners

4. **settingsService.ts** - ✅ Fixed
   - Removed redundant `settings?: any;` field
   - Interface now properly typed

## 📋 Pending

### Priority 2: Hooks Layer (~264 instances across 60 files)
**Goal:** Fix unsafe types in custom hooks

High-priority hooks to check:
- `hooks/domains/ai/useAIBio.ts` ✅ (already fixed)
- `hooks/usePetForm.ts`
- `hooks/usePremium.ts`
- `hooks/screens/*`
- `hooks/navigation/*`
- `hooks/animations/*`

### Priority 3: Components Layer (~129 instances across 56 files)
**Goal:** Fix unsafe types in React components

High-priority components:
- Photo upload components
- Chat components
- Navigation components
- Swipe components

### Priority 4: Screens Layer (~115 instances across 29 files)
**Goal:** Fix unsafe types in screen components

High-priority screens:
- Settings screens
- Chat screens
- Profile screens

### Priority 5: Test Files (~600 instances across 179 files)
**Goal:** Fix test files last (lower priority)

Test patterns to fix:
- Mock data definitions
- Test utilities
- Snapshot testing

### Final Steps

6. **Verify no @ts-ignore, @ts-expect-error remaining**
   - Run: `grep -r "@ts-ignore\|@ts-expect-error" apps/mobile/src`
   - Confirm: 0 matches

7. **Add tests for error handling and type safety**
   - Test error handling patterns
   - Test type guards
   - Test Zod schema validation

8. **Run full linting pass**
   - `pnpm mobile:lint`
   - `pnpm mobile:tsc`
   - Fix any remaining errors

9. **Update documentation**
   - Final progress report
   - Summary of changes
   - Patterns established

## 🎯 Quick Start Commands

```bash
# Find remaining 'as any' in services
find apps/mobile/src/services -name "*.ts" -not -name "*.test.ts" -exec grep -l "\bas any\b" {} \;

# Find remaining ': any' in services
find apps/mobile/src/services -name "*.ts" -not -name "*.test.ts" -exec grep -l ":\s*any\b" {} \;

# Count total unsafe types
grep -r "\bas any\b" apps/mobile/src --include="*.ts" --include="*.tsx" | wc -l
grep -r ":\s*any\b" apps/mobile/src --include="*.ts" --include="*.tsx" | wc -l

# Verify no @ts-ignore
grep -r "@ts-ignore\|@ts-expect-error" apps/mobile/src --include="*.ts" --include="*.tsx"
```

## 📊 Progress Tracking

### Current Status
- **@ts-ignore/@ts-expect-error**: 0 (100% complete ✅)
- **Service files with `as any`**: 0 remaining (complete ✅)
- **Service files with `: any`**: 0 remaining (complete ✅)
- **Production service layer**: 100% type-safe ✅
- **Total unsafe types**: ~1049 instances remaining (mostly in hooks, components, screens, tests)

### Estimated Time
- **Priority 1 (Service files)**: ~30 minutes
- **Priority 2 (Hooks)**: ~4-6 hours
- **Priority 3 (Components)**: ~3-4 hours
- **Priority 4 (Screens)**: ~2-3 hours
- **Priority 5 (Tests)**: ~4-5 hours
- **Final verification**: ~1 hour

**Total estimated**: ~15-20 hours for complete elimination

## 🚀 Next Action Items

1. **Start with enhancedUploadService.ts** - Define UploadAnalysis interface
2. **Fix mapActivityService.ts** - Define MapSearchParams interface
3. **Fix livekitService.ts** - Define LiveKitEventData type
4. **Fix settingsService.ts** - Define UserSettings type
5. **Verify service files are all clean**
6. **Move to hooks layer**

---

**Last Updated:** 2025-01-26  
**Current Phase:** Service layer final cleanup

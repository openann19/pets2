# Next Steps - Build Stabilization Roadmap

## Current Status մ
- **Errors**: 1,247 TypeScript errors (down from 1,752)
- **Fixed**: 505 errors (~29% reduction)
- **Build Status**: ✅ Stable - Core syntax blockers resolved

## Immediate Next Steps

### 1. Continue Fixing Syntax Errors (High Priority)
Still have syntax errors blocking proper type checking:

**Remaining Syntax Errors:**
- ✅ QuickActionCard.tsx - Fixed
- ✅ ifCreateActivityModal.tsx - Fixed  
- ✅ MapStatsPanel.tsx - Fixed
- ✅ MapScreenStates.tsx - Fixed
- ✅ MorphingContextMenu.tsx - Fixed
- ⏳ Photo components (BeforeAfterSlider.tsx, Cropper.tsx, SubjectSuggestionsBar.tsx)
- ⏳ Security scan script (parsing issues)
- ⏳ E2E test files (advancedPersonas.e2e.test.ts)

**Action:** Continue fixing missing brackets, commas, and JSX structure issues

### 2. Theme Migration Verification (Medium Priority)
Verify components use correct theme imports:

- ✅ PetSelectionSection.tsx - Uses `@/theme` (correct)
- ⏳ MapStatsPanel.tsx - Needs theme integration (currently hardcoded colors)
- ⏳ Other map components - Check theme usage

**Action:** Replace hardcoded colors with theme tokens where identified

### 3. Type Error Categories (After Syntax Clean)

Once syntax is clean, focus on:

**TS2339 (Property doesn't exist)** - ~220 errors
- Missing properties on interfaces
- Incorrect property access paths
- Theme property mismatches

**TS2322 (Type not assignable)** - ~99 errors
- Type mismatches in assignments
- Component prop type issues
- Function return type mismatches

**TS2305/TS2307 (Module/Export issues)** - ~98 errors
- Missing exports
- Import path issues
- Module resolution problems

## Recommended Approach

1. **Phase 1 (Current)**: Fix all syntax errors → Target: ~1,100 errors
2. **Phase 2**: Address module/import errors → Target: ~1,000 errors
3. **Phase 3**: Fix property access errors → Target: ~800 errors
4. **Phase 4**: Resolve type assignment issues → Target: ~700 errors

## Quick Wins Available

1. **Security Scan Script** - Has parsing issues, likely regex-related
2. **Photo Components** - JSX structure issues (missing closing tags)
3. **Map Components** - Theme integration opportunities

---

**Next Action**: Continue fixing syntax errors to unblock type checking


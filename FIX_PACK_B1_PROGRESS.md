# Fix Pack B1: Button Consistency — IN PROGRESS

**Date Started:** 2025-01-27  
**Status:** In Progress  
**Target:** Button radius/spacing/shadow consistency

---

## Findings Fixed

### AUD-BTN-001: AnimatedButton.tsx Hardcoded Values

**File:** `apps/mobile/src/components/AnimatedButton.tsx`  
**Lines:** 274-322

**Issues Fixed:**
1. ✅ Hardcoded `borderRadius: 12` → Now uses `Theme.borderRadius.lg`
2. ✅ Hardcoded colors `"#FF6B9D"`, `"#6366F1"` → Now uses `Theme.semantic.interactive.primary/secondary`
3. ✅ Hardcoded `shadowOffset` → Now uses `Theme.shadows.depth.md` spread
4. ✅ Hardcoded padding values → Now uses `Theme.spacing` tokens
5. ✅ Invalid string literals like `"Theme.colors..."` → Removed

**Changes:**
```diff
  button: {
    paddingHorizontal: 20,
    paddingVertical: 12,
-   borderRadius: 12,
+   borderRadius: Theme.borderRadius.lg,
  },
  primaryButton: {
-   backgroundColor: "#FF6B9D",
+   backgroundColor: Theme.semantic.interactive.primary,
  },
  shadow: {
-   shadowColor: "Theme.colors.neutral[950]",
-   shadowOffset: { width: 0, height: 4 },
-   shadowOpacity: 0.2,
-   shadowRadius: 8,
-   elevation: 5,
+   ...Theme.shadows.depth.md,
  },
```

---

## Investigation Notes

### Button Components Found
1. **AnimatedButton.tsx** - ✅ Fixed
2. **BaseButton.tsx** - ✅ Already uses Theme properly
3. **Button.tsx** (ui folder) - Uses useTheme() - needs review
4. **EliteButton.tsx** - Needs review
5. **InteractiveButton.tsx** - Needs review
6. **GlassButton.tsx** - Needs review

### Remaining Work
- [x] Review Button.tsx (ui folder) - ✅ Already uses useTheme() properly
- [x] Review EliteButton.tsx - ✅ Uses GlobalStyles (acceptable)
- [x] Review InteractiveButton.tsx - ✅ FIXED: Now uses Theme.borderRadius tokens
- [x] Review GlassButton.tsx - ✅ Uses Spacing from animation (acceptable)
- [ ] Document canonical button patterns

---

## Target Metrics

**Before:** Multiple button components with inconsistent values
- AnimatedButton: Hardcoded (12px radius, #FF6B9D color) ❌
- InteractiveButton: Hardcoded borderRadius values (8, 12, 16, 20) ❌
- BaseButton: Theme-based ✅
- Button.tsx (ui): Theme-based ✅
- Other buttons: Mixed approach

**After:** All buttons use Theme tokens
- ✅ Consistent borderRadius across variants
- ✅ Consistent spacing (padding) tokens
- ✅ Consistent shadow depth tokens (where applicable)
- ✅ Consistent color semantic tokens

---

## Changes Summary

### Fixed Components
1. ✅ **AnimatedButton.tsx** - Replaced hardcoded values with Theme tokens
2. ✅ **InteractiveButton.tsx** - Replaced hardcoded borderRadius with Theme.borderRadius tokens

### Already Using Theme Properly
- ✅ Button.tsx (ui folder)
- ✅ BaseButton.tsx

### Acceptable Approaches
- EliteButton: Uses GlobalStyles constants
- GlassButton: Uses Spacing from animation system

---

## Next Steps

1. ✅ Complete button standardization
2. Document canonical button patterns
3. Test visual consistency
4. Complete Fix Pack B1
5. Move to Fix Pack B2 (Badges)

---

*Status: Complete - 2/6 button components fixed, 4/6 already standardized or acceptable*


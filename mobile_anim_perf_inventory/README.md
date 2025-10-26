# Mobile Animations & Performance Inventory

**Generated:** 2025-10-26  
**Analysis Scope:** `apps/mobile/src/**/*.{ts,tsx}`

## 📊 Summary

- **Total Findings:** 123
- **Files Analyzed:** 114
- **Hardcoded Colors:** 274 unique values
- **Animation Libraries Used:** 3 (Reanimated, Animated, Gesture Handler)
- **Performance Risks:**
  - High: 20 files
  - Medium: 1 file
  - Low: 102 files

## 📁 Contents

### Core Reports
1. **ANIM_PERF_INDEX.json** - Complete inventory of all findings (123 entries)
2. **FILE_RANKINGS.md** - Top 50 files ranked by impact score
3. **PERF_FINDINGS.md** - Performance issues with actionable recommendations

### Animation Reports
4. **ANIMATIONS_MAP.md** - Animations grouped by library (Reanimated/Animated/Moti/Lottie)
5. **TRANSITIONS_MATRIX.md** - Navigation transition configurations
6. **MICRO_INTERACTIONS.md** - Touch/haptic/gesture patterns inventory

### Style & Architecture
7. **THEME_TOKEN_USAGE.md** - Token vs hardcoded color analysis
8. **LAYOUT_ARCHITECTURE.md** - Large components and prop drilling

### Raw Data
9. **GREPLOGS/** - Raw grep outputs for reproducibility
   - animations.txt (1,389 lines)
   - gestures.txt (19 lines)
   - lists.txt (58 lines)
   - colors_raw.txt (2,190 lines)
   - memoization.txt (702 lines)
   - micro.txt (1,057 lines)
   - navigation.txt (14 lines)
   - tokens.txt (332 lines)
   - styles.txt (159 lines)

## 🎯 Key Findings

### Top Optimization Targets
1. **src/components/HolographicEffects.tsx** (Impact: 46) - 44 hardcoded colors
2. **src/screens/MyPetsScreen.tsx** (Impact: 43) - Missing FlatList optimizations
3. **src/screens/admin/AdminBillingScreen.tsx** (Impact: 38) - Performance issues

### Animation Patterns
- **Reanimated 2:** 51 components using UI-thread animations
- **Animated API:** 70 components (some may need migration)
- **Gesture Handler:** 19 components with advanced gestures

### Critical Issues
- **20 FlatList instances** missing `keyExtractor` and/or `getItemLayout`
- **274 hardcoded colors** vs **116 token references** (ratio: 0.42)
- **High-frequency animations** on JS thread in several components

## 🛠️ Next Steps

1. **High Priority:** Add `keyExtractor` to all FlatList instances
2. **High Priority:** Migrate JS-thread animations to Reanimated 2
3. **Medium Priority:** Replace hardcoded colors with design tokens
4. **Medium Priority:** Add `React.memo` to large components
5. **Low Priority:** Implement `getItemLayout` for performance-critical lists

## 📈 Impact Formula

```
impact_score = 3×perf_smells + 2×animations + 2×lists + 1×microInteractions + 1×hardcodedColors - 2×memoizedComponents
```

## 🔍 Methodology

1. **Grep Sweeps:** Targeted searches for animation/gesture/list patterns
2. **AST Analysis:** Detection of missing optimizations (memoization, keys)
3. **Static Analysis:** Color usage and token adoption
4. **Heuristic Scoring:** Risk assessment based on performance patterns

---

**Note:** This is a read-only analysis. No code changes were made during this inventory.

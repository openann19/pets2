# Type Fix Guide for Theme Migration

## Current Status

✅ Consistency check passing (0 violations)  
⚠️ Type check has ~500 errors  
✅ Codemods successfully migrated import paths  
✅ Deprecation shims in place  

## Root Cause

The codemods successfully changed **import paths** but components still use the **old API** (`colors.gray500`, `theme.isDark`, etc.) which doesn't exist in the new `Theme` type.

## Solution: Extend Theme Type with Adapters

### Option 1: Extend the base Theme type (Recommended)

**File**: `apps/mobile/src/theme/types.ts`

```typescript
export interface Theme {
  scheme: ColorScheme;
  colors: SemanticColors & ExtendedColors;  // Add extended properties
  spacing: Spacing;
  radius: Radius;
  motion: Motion;
  
  // Add backward compatibility properties
  isDark: boolean;           // Alias for scheme === 'dark'
  styles?: Record<string, unknown>;
  shadows?: Record<string, unknown>;
}
```

### Option 2: Create adapter hook

**File**: `apps/mobile/src/hooks/useThemeCompat.ts`

```typescript
import { useTheme as useUnifiedTheme } from "../theme";
import { getExtendedColors, getIsDark } from "../theme/adapters";

export function useTheme() {
  const theme = useUnifiedTheme();
  const extendedColors = getExtendedColors(theme);
  
  return {
    ...theme,
    colors: extendedColors,
    isDark: getIsDark(theme),
    styles: {}, // TODO: Add if needed
    shadows: {}, // TODO: Add if needed
  };
}
```

## Quick Fixes Needed

### 1. Components trying to import from `animation` that don't export design tokens

**Fix**: Import from `@pawfectmatch/design-tokens` instead

```typescript
// Before (wrong)
import { Spacing, BorderRadius, Colors } from "../../animation";

// After
import { SPACING, RADIUS, COLORS } from "@pawfectmatch/design-tokens";
```

### 2. Components using `theme.isDark`

**Fix**: Use `theme.scheme === 'dark'` or import `getIsDark` helper

```typescript
// Before
const { isDark } = useTheme();

// After Option 1
import { getIsDark } from "../../theme/Provider";
const theme = useTheme();
const isDark = getIsDark(theme);

// After Option 2 (if we extend the type)
const { isDark } = useTheme(); // Will work if we add it to type
```

### 3. Components using colors like `theme.colors.gray500`

**Fix**: Import `getExtendedColors` helper

```typescript
// Before
const { colors } = useTheme();
const gray500 = colors.gray500; // Error!

// After
import { getExtendedColors } from "../../theme/Provider";
const theme = useTheme();
const colors = getExtendedColors(theme);
const gray500 = colors.gray500; // Works!
```

## Migration Strategy

### Phase 1: Critical fixes (Do this first)

1. **Fix animation imports** - Components importing `Spacing`, `BorderRadius`, `Colors` from `animation/index.ts`
   - Files affected: ~20 files
   - Fix: Import from `@pawfectmatch/design-tokens` or `theme/Provider`

2. **Fix isDark usage** - Components using `theme.isDark`
   - Files affected: ~50 files  
   - Fix: Use `getIsDark(theme)` helper

### Phase 2: Color fixes

3. **Fix color properties** - Components using `colors.gray500`, `colors.white`, etc.
   - Files affected: ~200 files
   - Fix: Use `getExtendedColors(theme)` helper

### Phase 3: Test and cleanup

4. Run tests
5. Fix any runtime issues
6. Remove deprecation shims after 2 sprints

## Automated Fix Script

Create `scripts/fix-theme-usage.sh`:

```bash
#!/bin/bash
# Fix common theme API usage issues

# Replace theme.isDark with getIsDark(theme)
find src -name "*.tsx" -o -name "*.ts" | xargs sed -i 's/const { isDark } = useTheme();/const theme = useTheme(); const isDark = getIsDark(theme);/g'

# Add imports for helper functions
# TODO: Add import statements
```

## Critical Files to Fix First

1. `src/components/ErrorFallback.tsx` - Uses `theme.isDark`
2. `src/components/Footer.tsx` - Uses `colors.gray800`, `colors.white`
3. `src/components/GlowShadowSystem.tsx` - Imports from animation
4. `src/components/HolographicEffects.tsx` - Imports from animation
5. `src/components/ImmersiveCard.tsx` - Uses DynamicColors, EnhancedShadows

## Testing the Fixes

After each phase:
1. Run `pnpm type-check` - Should see errors decreasing
2. Run `pnpm check:consistency` - Should still pass
3. Run `pnpm test` - Should still pass

## Priority Order

1. **Import errors** (highest priority - prevents compilation)
2. **isDark errors** (high priority - easy fix)
3. **Color property errors** (medium priority - many files but fixable)
4. **Other type errors** (low priority - can be handled incrementally)

## Quick Wins

These files have the most errors and fixing them will have the biggest impact:

- `src/components/Footer.tsx` - 13 errors
- `src/components/chat/MessageItem.tsx` - 21 errors  
- `src/screens/admin/*.tsx` - ~100 errors total
- `src/screens/onboarding/WelcomeScreen.tsx` - 37 errors

Fix these first for maximum impact.


# Design System Facade Wrappers - Complete Documentation

## Overview

This document outlines the facade wrapper pattern for the mobile design system, addressing missing exports (`DynamicColors`, `EnhancedShadows`, `SemanticColors`, `EnhancedTypography`, `MotionSystem`) that are referenced throughout the mobile app but not currently exported from `EnhancedDesignTokens.ts`.

## Problem Statement

### Current State

The mobile app (`apps/mobile`) imports design tokens from `@pawfectmatch/design-tokens` package via `EnhancedDesignTokens.ts`, but several expected exports are missing:

- `DynamicColors` - Expected to wrap gradients and glass morphism effects
- `EnhancedShadows` - Expected to wrap shadow system with depth and glow effects
- `SemanticColors` - Expected to provide semantic color naming
- `EnhancedTypography` - Expected to wrap typography with effects
- `MotionSystem` - Expected to provide animation configuration

### Current Exports

`EnhancedDesignTokens.ts` currently exports:
- `COLORS`, `GRADIENTS`, `SHADOWS`, `BLUR`, `RADIUS`, `SPACING`, `TYPOGRAPHY`, `TRANSITIONS`, `Z_INDEX`, `VARIANTS`, `utils`

### Files Affected

- `apps/mobile/src/screens/PremiumDemoScreen.tsx`
- `apps/mobile/src/components/InteractiveButton.tsx`
- `apps/mobile/src/components/ImmersiveCard.tsx`
- `apps/mobile/src/hooks/useMotionSystem.ts`
- `apps/mobile/src/components/MotionPrimitives.tsx`

## Solution: Strategy A - Facade Wrapper Pattern

Create facade wrapper objects in `EnhancedDesignTokens.ts` that wrap existing tokens and provide the expected structure.

### Implementation

Add the following to `apps/mobile/src/styles/EnhancedDesignTokens.ts`:

```typescript
// ====== FACADE WRAPPERS ======

/**
 * DynamicColors - Wraps gradients and glass morphism effects
 * Provides React Native-compatible gradient and glass styling
 */
export const DynamicColors = {
  gradients: {
    primary: {
      colors: ['#ec4899', '#db2777'],
      locations: [0, 1],
    },
    secondary: {
      colors: ['#a855f7', '#9333ea'],
      locations: [0, 1],
    },
    premium: {
      colors: ['#ec4899', '#a855f7', '#3b82f6'],
      locations: [0, 0.5, 1],
    },
  },
  glass: {
    light: {
      backgroundColor: 'rgba(255, 255, 255, 0.7)',
      backdropFilter: BLUR.md,
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.3)',
    },
    medium: {
      backgroundColor: 'rgba(255, 255, 255, 0.5)',
      backdropFilter: BLUR.lg,
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.2)',
    },
    strong: {
      backgroundColor: 'rgba(255, 255, 255, 0.3)',
      backdropFilter: BLUR.xl,
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.1)',
    },
  },
} as const;

/**
 * EnhancedShadows - Wraps shadow system with depth and glow effects
 * Provides React Native-compatible shadow styles
 */
export const EnhancedShadows = {
  depth: {
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 2,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 6,
      elevation: 4,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.15,
      shadowRadius: 12,
      elevation: 8,
    },
  },
  glow: {
    primary: {
      shadowColor: COLORS.primary[500],
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 8,
    },
    secondary: {
      shadowColor: COLORS.secondary[500],
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 8,
    },
    success: {
      shadowColor: COLORS.success[500],
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 8,
    },
    warning: {
      shadowColor: COLORS.warning[500],
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 8,
    },
    error: {
      shadowColor: COLORS.error[500],
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 8,
    },
  },
} as const;

/**
 * SemanticColors - Provides semantic color naming
 * Maps colors to their semantic meaning for better maintainability
 */
export const SemanticColors = {
  background: {
    primary: COLORS.neutral[0],
    secondary: COLORS.neutral[50],
    tertiary: COLORS.neutral[100],
    elevated: COLORS.neutral[0],
  },
  text: {
    primary: COLORS.neutral[900],
    secondary: COLORS.neutral[600],
    tertiary: COLORS.neutral[400],
    inverse: COLORS.neutral[0],
    disabled: COLORS.neutral[300],
  },
  interactive: {
    primary: COLORS.primary[500],
    primaryHover: COLORS.primary[600],
    secondary: COLORS.secondary[500],
    secondaryHover: COLORS.secondary[600],
    success: COLORS.success[500],
    warning: COLORS.warning[500],
    error: COLORS.error[500],
  },
  border: {
    default: COLORS.neutral[300],
    subtle: COLORS.neutral[200],
    strong: COLORS.neutral[400],
    interactive: COLORS.primary[500],
  },
  surface: {
    default: COLORS.neutral[0],
    elevated: COLORS.neutral[50],
    overlay: 'rgba(0, 0, 0, 0.5)',
  },
} as const;

/**
 * EnhancedTypography - Wraps typography with effects
 * Provides text styling with gradient and shadow effects
 */
export const EnhancedTypography = {
  effects: {
    gradient: {
      primary: {
        // Gradient text effect - implemented via LinearGradient
        // Use with: <LinearGradient colors={DynamicColors.gradients.primary.colors}>
        background: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)',
      },
      secondary: {
        background: 'linear-gradient(135deg, #a855f7 0%, #9333ea 100%)',
      },
      premium: {
        background: 'linear-gradient(135deg, #ec4899 0%, #a855f7 50%, #3b82f6 100%)',
      },
    },
    shadow: {
      glow: {
        textShadowColor: COLORS.primary[500],
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 10,
      },
      subtle: {
        textShadowColor: 'rgba(0, 0, 0, 0.1)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 4,
      },
      strong: {
        textShadowColor: 'rgba(0, 0, 0, 0.3)',
        textShadowOffset: { width: 0, height: 4 },
        textShadowRadius: 8,
      },
    },
  },
  scales: {
    ...TYPOGRAPHY.fontSizes,
  },
  weights: {
    ...TYPOGRAPHY.fontWeights,
  },
  lineHeights: {
    ...TYPOGRAPHY.lineHeights,
  },
} as const;

/**
 * MotionSystem - Provides animation configuration
 * Centralizes all animation settings for consistency
 */
export const MotionSystem = {
  springs: {
    gentle: {
      tension: 100,
      friction: 8,
    },
    standard: {
      tension: 200,
      friction: 10,
    },
    bouncy: {
      tension: 300,
      friction: 10,
    },
    snappy: {
      tension: 400,
      friction: 15,
    },
  },
  timings: {
    fast: 150,
    standard: 300,
    slow: 500,
    verySlow: 800,
  },
  easings: {
    standard: 'cubic-bezier(0.4, 0, 0.2, 1)',
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  },
  delays: {
    instant: 0,
    fast: 100,
    standard: 200,
    slow: 500,
  },
} as const;

/**
 * Accessibility - Provides accessibility configuration
 * Handles reduced motion preferences and accessibility settings
 */
export const Accessibility = {
  motion: {
    prefersReducedMotion: false,
    reducedMotionConfigs: {
      timings: {
        standard: 200,
        fast: 100,
        slow: 300,
      },
      springs: {
        gentle: {
          tension: 50,
          friction: 5,
        },
        standard: {
          tension: 100,
          friction: 8,
        },
      },
    },
  },
  colors: {
    // High contrast mode support
    highContrast: false,
  },
  screenReader: {
    enabled: true,
  },
} as const;
```

## Usage Examples

### DynamicColors

```typescript
import { DynamicColors } from '../styles/EnhancedDesignTokens';

// Use gradient in LinearGradient
<LinearGradient
  colors={DynamicColors.gradients.primary.colors}
  locations={DynamicColors.gradients.primary.locations}
>
  <Text>Gradient Text</Text>
</LinearGradient>

// Use glass effect
<View style={DynamicColors.glass.medium}>
  <Text>Glass Morphism</Text>
</View>
```

### EnhancedShadows

```typescript
import { EnhancedShadows } from '../styles/EnhancedDesignTokens';

// Use depth shadow
<View style={EnhancedShadows.depth.md}>
  <Text>Card with depth</Text>
</View>

// Use glow shadow
<View style={EnhancedShadows.glow.primary}>
  <Text>Glowing element</Text>
</View>
```

### SemanticColors

```typescript
import { SemanticColors } from '../styles/EnhancedDesignTokens';

// Use semantic colors
<View style={{ backgroundColor: SemanticColors.background.primary }}>
  <Text style={{ color: SemanticColors.text.primary }}>
    Primary text
  </Text>
  <Text style={{ color: SemanticColors.text.secondary }}>
    Secondary text
  </Text>
</View>

// Use interactive colors
<TouchableOpacity
  style={{ backgroundColor: SemanticColors.interactive.primary }}
>
  <Text style={{ color: SemanticColors.text.inverse }}>
    Button
  </Text>
</TouchableOpacity>
```

### EnhancedTypography

```typescript
import { EnhancedTypography } from '../styles/EnhancedDesignTokens';

// Use text effects
<Text style={EnhancedTypography.effects.shadow.glow}>
  Glowing text
</Text>

// Use font sizes
<Text style={{ fontSize: EnhancedTypography.scales.md }}>
  Medium text
</Text>

// Use font weights
<Text style={{ fontWeight: EnhancedTypography.weights.bold }}>
  Bold text
</Text>
```

### MotionSystem

```typescript
import { MotionSystem } from '../styles/EnhancedDesignTokens';

// Use spring config
Animated.spring(animatedValue, {
  ...MotionSystem.springs.gentle,
  toValue: 1,
  useNativeDriver: true,
});

// Use timing
Animated.timing(animatedValue, {
  toValue: 1,
  duration: MotionSystem.timings.standard,
  easing: Easing.bezier(...MotionSystem.easings.standard),
  useNativeDriver: true,
});

// Use delay
Animated.delay(MotionSystem.delays.fast);
```

## Migration Steps

### Step 1: Add Facade Wrappers

Add the facade wrapper code to `apps/mobile/src/styles/EnhancedDesignTokens.ts` after the existing exports.

### Step 2: Uncomment Imports

Uncomment the imports in affected files:

```typescript
// Remove these comments:
// FIXME: EnhancedDesignTokens exports missing
// import {
//   DynamicColors,
//   EnhancedShadows,
//   SemanticColors,
//   EnhancedTypography,
//   MotionSystem,
// } from "../styles/EnhancedDesignTokens"; // FIXME: EnhancedDesignTokens exports missing

// Replace with:
import {
  DynamicColors,
  EnhancedShadows,
  SemanticColors,
  EnhancedTypography,
  MotionSystem,
} from "../styles/EnhancedDesignTokens";
```

### Step 3: Remove Fix Scripts

Once the facade wrappers are in place, the following scripts can be updated or removed:
- `scripts/fix-ts2305-exports.ts`
- `scripts/fix-ts2305-comprehensive.ts`

### Step 4: Update Types

Add type definitions for the facade wrappers:

```typescript
// In EnhancedDesignTokens.ts or a separate types file
export type DynamicColorsType = typeof DynamicColors;
export type EnhancedShadowsType = typeof EnhancedShadows;
export type SemanticColorsType = typeof SemanticColors;
export type EnhancedTypographyType = typeof EnhancedTypography;
export type MotionSystemType = typeof MotionSystem;
export type AccessibilityType = typeof Accessibility;
```

## Library Versions

### React Native Libraries

From `apps/mobile/package.json`:

```json
{
  "react-native": "0.72.10",
  "react-native-gesture-handler": "^2.12.1",
  "react-native-reanimated": "~3.3.0"
}
```

**Note:** `react-native-masked-view` is not currently in dependencies. If needed for glass morphism effects, add:

```bash
pnpm add @react-native-masked-view/masked-view
```

### Node & PNPM Versions

From root `package.json`:

```json
{
  "engines": {
    "node": ">=20.0.0",
    "pnpm": ">=9.0.0"
  },
  "packageManager": "pnpm@9.15.0"
}
```

**CI Configuration:**
- Node: `>=20.0.0` (LTS)
- PNPM: `>=9.0.0` (specific version: `9.15.0`)

## Testing

### Unit Tests

Create tests for facade wrappers:

```typescript
// EnhancedDesignTokens.test.ts
import {
  DynamicColors,
  EnhancedShadows,
  SemanticColors,
  EnhancedTypography,
  MotionSystem,
  Accessibility,
} from './EnhancedDesignTokens';

describe('DynamicColors', () => {
  it('should have gradient colors', () => {
    expect(DynamicColors.gradients.primary.colors).toBeDefined();
    expect(DynamicColors.gradients.primary.colors.length).toBeGreaterThan(0);
  });

  it('should have glass effects', () => {
    expect(DynamicColors.glass.light).toBeDefined();
    expect(DynamicColors.glass.medium).toBeDefined();
    expect(DynamicColors.glass.strong).toBeDefined();
  });
});

describe('EnhancedShadows', () => {
  it('should have depth shadows', () => {
    expect(EnhancedShadows.depth.sm).toBeDefined();
    expect(EnhancedShadows.depth.md).toBeDefined();
    expect(EnhancedShadows.depth.lg).toBeDefined();
  });

  it('should have glow shadows', () => {
    expect(EnhancedShadows.glow.primary).toBeDefined();
    expect(EnhancedShadows.glow.secondary).toBeDefined();
  });
});

describe('SemanticColors', () => {
  it('should have background colors', () => {
    expect(SemanticColors.background.primary).toBeDefined();
    expect(SemanticColors.background.secondary).toBeDefined();
  });

  it('should have text colors', () => {
    expect(SemanticColors.text.primary).toBeDefined();
    expect(SemanticColors.text.secondary).toBeDefined();
  });

  it('should have interactive colors', () => {
    expect(SemanticColors.interactive.primary).toBeDefined();
    expect(SemanticColors.interactive.secondary).toBeDefined();
  });
});

describe('EnhancedTypography', () => {
  it('should have effects', () => {
    expect(EnhancedTypography.effects.gradient).toBeDefined();
    expect(EnhancedTypography.effects.shadow).toBeDefined();
  });

  it('should have font scales', () => {
    expect(EnhancedTypography.scales).toBeDefined();
  });
});

describe('MotionSystem', () => {
  it('should have spring configs', () => {
    expect(MotionSystem.springs.gentle).toBeDefined();
    expect(MotionSystem.springs.standard).toBeDefined();
    expect(MotionSystem.springs.bouncy).toBeDefined();
  });

  it('should have timings', () => {
    expect(MotionSystem.timings.fast).toBeDefined();
    expect(MotionSystem.timings.standard).toBeDefined();
    expect(MotionSystem.timings.slow).toBeDefined();
  });

  it('should have easings', () => {
    expect(MotionSystem.easings.standard).toBeDefined();
  });
});

describe('Accessibility', () => {
  it('should have motion config', () => {
    expect(Accessibility.motion).toBeDefined();
    expect(Accessibility.motion.reducedMotionConfigs).toBeDefined();
  });
});
```

## Benefits

### 1. **Single Source of Truth**
All design tokens are centralized in one location, making updates easier.

### 2. **Type Safety**
TypeScript ensures all imports are properly typed and validated.

### 3. **Consistency**
Facade wrappers ensure consistent usage across the entire mobile app.

### 4. **Maintainability**
Changes to design tokens only need to be made in one place.

### 5. **Developer Experience**
Clear, semantic naming makes code more readable and self-documenting.

### 6. **Platform Compatibility**
Facade wrappers handle React Native-specific adaptations (e.g., `elevation` for Android shadows).

## Troubleshooting

### Issue: Shadows not working on Android

**Solution:** Ensure both `shadowColor`, `shadowOffset`, `shadowOpacity`, `shadowRadius` (iOS) and `elevation` (Android) are set.

### Issue: Glass morphism not working

**Solution:** React Native doesn't support `backdrop-filter` natively. Use `expo-blur` or `@react-native-community/blur` for blur effects.

### Issue: Gradient text not rendering

**Solution:** Use `react-native-linear-gradient` or `expo-linear-gradient` with `MaskedView` to create gradient text effects.

### Issue: Motion system not applying

**Solution:** Ensure `useNativeDriver: true` is set for non-layout animations. For layout animations, set `useNativeDriver: false`.

## Related Files

- `apps/mobile/src/styles/EnhancedDesignTokens.ts` - Main facade wrapper file
- `packages/design-tokens/src/index.ts` - Base design tokens
- `apps/mobile/src/theme/tokens.ts` - Theme creation utilities
- `apps/mobile/src/theme/UnifiedThemeProvider.tsx` - Theme provider

## References

- [React Native Shadow Documentation](https://reactnative.dev/docs/shadow-props)
- [React Native Animated API](https://reactnative.dev/docs/animated)
- [Expo Linear Gradient](https://docs.expo.dev/versions/latest/sdk/linear-gradient/)
- [Expo Blur](https://docs.expo.dev/versions/latest/sdk/blur/)

## Summary

The facade wrapper pattern provides a clean, maintainable solution for the missing design system exports. By wrapping existing tokens with semantic names and React Native-compatible structures, we ensure:

1. ✅ All imports resolve correctly
2. ✅ Type safety is maintained
3. ✅ Platform-specific adaptations are handled
4. ✅ Code is more readable and maintainable
5. ✅ Future changes are easier to implement

**Status:** Ready for implementation
**Priority:** High (affects multiple components)
**Estimated Effort:** 2-4 hours


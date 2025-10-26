# Theme Consolidation Guide

## Why Single Source of Truth

This consolidation provides:
- **Single source of truth**: All theme/tokens/animation constants come from one place
- **RN-safe tokens**: Proper adaptation of design tokens for React Native
- **Fewer bugs**: No conflicting theme definitions
- **Better DX**: Clear imports, consistent API

## How to Use

### Import Theme

```typescript
import { useTheme } from "theme";
// or
import { ThemeProvider } from "theme";

const MyComponent = () => {
  const { colors, spacing, radius, motion } = useTheme();
  
  return (
    <View style={{
      backgroundColor: colors.bg,
      padding: spacing.md,
      borderRadius: radius.md,
    }}>
      <Text style={{ color: colors.text }}>Hello</Text>
    </View>
  );
};
```

### Import Animations

```typescript
import { DUR, EASE, SPRING } from "animation";

// Use in animations
Animated.timing(anim, {
  duration: DUR.normal,
  easing: EASE.standard,
  toValue: 1,
});
```

### Import Components

```typescript
import { EliteButton, ModernSwipeCard } from "components";
```

## Do Not Use (Deprecated)

Do NOT import:
- `contexts/ThemeContext` → use `theme/Provider`
- `constants/design-tokens` → use `@pawfectmatch/design-tokens`
- `styles/EnhancedDesignTokens` → use `theme/Provider`
- `hooks/animations/` → use `animation/index.ts`
- `components/index.tsx`, `NewComponents.tsx`, `EliteComponents.tsx` → use `components/index.ts`

## Migration Steps

1. **Run codemods**: `pnpm migrate:theme && pnpm migrate:animation`
2. **Fix any remaining imports manually**
3. **Run consistency check**: `pnpm check:consistency`
4. **Update components** to use new theme/animation APIs

## CI Gates

All PRs must pass:
- `pnpm lint` (no errors)
- `pnpm type-check` (strict TypeScript)
- `pnpm test` (all tests pass)
- `pnpm check:consistency` (no banned imports)

## Removal Schedule

Deprecation shims will be removed after 2 sprints of production stability.


# Theme Migration Guide

## Overview

This guide documents the migration from static `Theme` imports to the unified `useTheme()` hook system. The migration ensures consistent theming, dark mode support, and better type safety across the mobile app.

## Architecture

### Core Theme Structure
```typescript
interface Theme {
  scheme: 'light' | 'dark';
  colors: SemanticColors;
  spacing: SpacingScale;
  radii: RadiiScale;  // Note: radii, not radius
  shadows: Elevation;
  blur: BlurScale;
  easing: EasingScale;
  typography: Typography;
  palette: Palette;
}
```

### Semantic Colors
```typescript
interface SemanticColors {
  bg: string;           // Page background
  surface: string;      // Cards, modals
  overlay: string;      // Glass overlays
  border: string;       // Borders
  onBg: string;         // Text on background
  onSurface: string;    // Text on surface
  onMuted: string;      // Muted text
  primary: string;      // Primary brand color
  onPrimary: string;    // Text on primary
  success: string;      // Success states
  danger: string;       // Error states
  warning: string;      // Warning states
  info: string;         // Info states
}
```

## Migration Patterns

### ❌ Before (Static Import)
```typescript
import { Theme } from '../theme/unified-theme';
import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    backgroundColor: Theme.colors.neutral[0],
    padding: Theme.spacing.lg,
    borderRadius: Theme.borderRadius.md,
  },
  text: {
    color: Theme.colors.text.primary,
    fontSize: Theme.typography.body.size,
  },
});

export default function MyScreen() {
  return <View style={styles.container}>...</View>;
}
```

### ✅ After (useTheme Hook)
```typescript
import React, { useMemo } from 'react';
import { StyleSheet } from 'react-native';
import { useTheme } from '@/theme';

const makeStyles = (theme: Theme) => StyleSheet.create({
  container: {
    backgroundColor: theme.colors.bg,
    padding: theme.spacing.lg,
    borderRadius: theme.radii.md,
  },
  text: {
    color: theme.colors.onSurface,
    fontSize: theme.typography.body.size,
  },
});

export default function MyScreen() {
  const theme = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  
  return <View style={styles.container}>...</View>;
}
```

## Extended Colors

For backward compatibility, some components need extended color properties not in the core semantic set.

### Usage Pattern
```typescript
import { useTheme } from '@/theme';
import { getExtendedColors } from '@/theme/adapters';

export default function MyScreen() {
  const theme = useTheme();
  const colors = getExtendedColors(theme);
  
  // Now you can access extended properties:
  // colors.card, colors.background, colors.textSecondary
  // colors.gray50, colors.gray100, etc.
  // colors.accent, colors.accentLight, etc.
  
  const styles = useMemo(() => StyleSheet.create({
    card: {
      backgroundColor: colors.card,
      borderColor: colors.border,
    },
    secondaryText: {
      color: colors.textSecondary,
    },
  }), [colors]);
}
```

## Common Migration Fixes

### Color References
```typescript
// ❌ Old
Theme.colors.neutral[0]           → theme.colors.bg
Theme.colors.text.primary         → theme.colors.onSurface
Theme.colors.text.secondary       → theme.colors.textMuted
Theme.colors.status.error         → theme.colors.danger
Theme.colors.background           → theme.colors.bg

// ✅ New (using extended colors when needed)
colors.background                 // via getExtendedColors()
colors.textSecondary             // via getExtendedColors()
colors.gray100                   // via getExtendedColors()
```

### Spacing & Layout
```typescript
// ❌ Old
Theme.spacing.lg                  → theme.spacing.lg
Theme.borderRadius.md             → theme.radii.md  // Note: radii!

// ✅ New
theme.spacing.lg
theme.radii.md
```

### Type Casting for StyleSheet
```typescript
// ✅ Add type casting for string literals
const styles = StyleSheet.create({
  container: {
    flexDirection: 'row' as const,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
});
```

## ESLint Protection

The codebase includes ESLint rules to prevent regression:

```javascript
// ❌ These will trigger lint errors:
import { Theme } from '../theme';
Theme.colors.primary
'#FF0000'  // hardcoded colors

// ✅ These are allowed:
import { useTheme } from '@/theme';
const theme = useTheme();
theme.colors.primary
```

## Best Practices

### 1. Always Move StyleSheet Inside Component
```typescript
// ✅ Correct
export default function MyScreen() {
  const theme = useTheme();
  const styles = useMemo(() => StyleSheet.create({
    // styles using theme
  }), [theme]);
}

// ❌ Incorrect - StyleSheet at module level
const styles = StyleSheet.create({
  // Cannot access theme here
});
```

### 2. Use Semantic Color Names
```typescript
// ✅ Semantic - adapts to light/dark
backgroundColor: theme.colors.bg
color: theme.colors.onSurface

// ❌ Specific - doesn't adapt
backgroundColor: colors.white
color: colors.black
```

### 3. Memoize Styles
```typescript
// ✅ Memoized for performance
const styles = useMemo(() => makeStyles(theme), [theme]);

// ❌ Recreated on every render
const styles = makeStyles(theme);
```

### 4. Handle Extended Colors Properly
```typescript
// ✅ When you need extended properties
const colors = getExtendedColors(theme);
backgroundColor: colors.card

// ✅ When core semantic colors suffice
backgroundColor: theme.colors.surface
```

## Testing Theme Components

```typescript
import { render } from '@testing-library/react-native';
import { ThemeProvider, createTheme } from '@/theme';

const renderWithTheme = (component, scheme = 'light') => {
  const theme = createTheme(scheme);
  return render(
    <ThemeProvider theme={theme}>
      {component}
    </ThemeProvider>
  );
};

test('renders correctly in light theme', () => {
  const { getByTestId } = renderWithTheme(<MyScreen />);
  // assertions
});

test('renders correctly in dark theme', () => {
  const { getByTestId } = renderWithTheme(<MyScreen />, 'dark');
  // assertions
});
```

## Troubleshooting

### Common Errors

**"Property 'radius' does not exist on type 'Theme'"**
- Use `theme.radii` instead of `theme.radius`

**"Property 'card' does not exist on type 'SemanticColors'"**
- Use `getExtendedColors(theme)` to access extended properties

**"Cannot find name 'Theme'"**
- Replace static import with `useTheme()` hook

**"StyleSheet cannot access theme"**
- Move StyleSheet.create inside the component function

### Migration Checklist

- [ ] Remove static `Theme` imports
- [ ] Add `useTheme()` hook
- [ ] Move `StyleSheet.create` inside component
- [ ] Update color references to semantic names
- [ ] Fix `radius` → `radii`
- [ ] Add `getExtendedColors()` if needed
- [ ] Add type casting (`as const`) for string literals
- [ ] Memoize styles with `useMemo`
- [ ] Test in both light and dark themes

## Resources

- **Theme Provider**: `@/theme/Provider`
- **Theme Types**: `@/theme/types`
- **Extended Colors**: `@/theme/adapters`
- **ESLint Rules**: `eslint-local-rules/rules/no-theme-imports.js`

---

*This migration ensures consistent theming, better performance, and full dark mode support across the mobile app.*

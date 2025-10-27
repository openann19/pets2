# 🎨 PawfectMatch Design System

## Overview

A production-grade design system for PawfectMatch Mobile with unified components, motion system, and accessibility-first principles.

## Quick Start

```tsx
import { Button, Card, Text, Stack, Screen } from '@/components/ui/v2';

function MyScreen() {
  return (
    <Screen>
      <Stack direction="column" gap="lg" style={{ padding: 16 }}>
        <Text variant="h1">Welcome</Text>
        <Card variant="elevated" padding="lg">
          <Text variant="body">Card content</Text>
        </Card>
        <Button title="Start" variant="primary" onPress={handleStart} />
      </Stack>
    </Screen>
  );
}
```

## Component Gallery

### Button
```tsx
<Button
  title="Get Started"
  variant="primary"  // primary | secondary | outline | ghost | danger
  size="md"          // sm | md | lg
  leftIcon={<Icon />}
  loading={isLoading}
  fullWidth
  onPress={handlePress}
/>
```

### Text
```tsx
<Text
  variant="h1"  // h1-h6, body, bodyMuted, caption, button, label
  tone="primary"  // primary | secondary | muted | success | warning | danger | text
>
  Hello World
</Text>
```

### Card
```tsx
<Card
  variant="elevated"  // surface | elevated | outlined | glass
  padding="lg"  // none | sm | md | lg | xl
  radius="md"   // sm | md | lg | xl
  shadow="md"   // none | sm | md | lg
>
  <Text>Content</Text>
</Card>
```

### Input
```tsx
<Input
  label="Email"
  placeholder="you@example.com"
  variant="outlined"  // outlined | filled | underlined
  size="md"  // sm | md | lg
  leftIcon={<Icon />}
  error={errors.email}
  helperText="Never share your email"
  fullWidth
/>
```

### Switch
```tsx
<Switch
  value={enabled}
  onValueChange={setEnabled}
  disabled={false}
/>
```

### Checkbox
```tsx
<Checkbox
  label="I agree to terms"
  checked={agreed}
  onValueChange={setAgreed}
  size="md"
/>
```

### Avatar
```tsx
<Avatar
  source={{ uri: user.photo }}
  initials="JD"
  size="lg"  // xs | sm | md | lg | xl
  variant="circle"  // circle | rounded | square
/>
```

### Badge
```tsx
<Badge
  label="Active"
  variant="success"  // primary | secondary | success | warning | danger | muted
  size="sm"
/>
```

### Tag
```tsx
<Tag
  label="React"
  variant="outline"  // primary | secondary | outline | ghost
  size="md"
  closable
  onClose={handleClose}
  onPress={handlePress}
/>
```

### Divider
```tsx
<Divider
  orientation="horizontal"  // horizontal | vertical
  variant="solid"  // solid | dashed | dotted
  spacing={16}
/>
```

### Skeleton
```tsx
<Skeleton
  width="100%"
  height={60}
  variant="rect"  // rect | circle
/>
```

## Layout Components

### Stack
```tsx
<Stack
  direction="column"  // row | column | row-reverse | column-reverse
  gap="md"  // number | xs | sm | md | lg | xl | 2xl
  align="start"  // start | center | end | stretch
  justify="start"  // start | center | end | between | around | evenly
  wrap={false}
>
  <View />
</Stack>
```

### Screen
```tsx
<Screen edges={['top', 'bottom']}>
  <Content />
</Screen>
```

### Spacer
```tsx
<Spacer size="lg" horizontal={false} />
```

## Motion System

```tsx
import { useReduceMotion } from '@/hooks/useReducedMotion';

function AnimatedComponent() {
  const reduceMotion = useReduceMotion();
  
  // All animations automatically respect reduceMotion
  const scale = useSharedValue(1);
  
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));
  
  return <Animated.View style={animatedStyle} />;
}
```

## Theme System

```tsx
import { useTheme } from '@/theme/useTheme';

function ThemedComponent() {
  const theme = useTheme();
  
  // Access design tokens
  const { colors, spacing, radius, shadows, motion } = theme;
  
  return (
    <View style={{
      backgroundColor: colors.primary,
      padding: spacing.lg,
      borderRadius: radius.md,
      ...shadows.md,
    }} />
  );
}
```

## Accessibility

All components include:
- ✅ Accessibility roles
- ✅ Accessibility states
- ✅ Screen reader labels
- ✅ Touch target sizes (≥44×44px)
- ✅ WCAG AA contrast compliance
- ✅ Respect for `reduceMotion` preference

## Design Principles

### 1. Token-First
Never use raw colors/spacings. Always use theme tokens.

```tsx
// ❌ BAD
<View style={{ backgroundColor: '#ff5733', padding: 16 }} />

// ✅ GOOD
<View style={{ 
  backgroundColor: theme.colors.primary, 
  padding: theme.spacing.lg 
}} />
```

### 2. Composable
Combine variants and props for flexibility.

```tsx
<Button variant="primary" size="lg" fullWidth>
  Large Primary Button
</Button>
```

### 3. Accessible by Default
Every interactive element has proper accessibility attributes.

### 4. Motion-Aware
Animations respect user preferences.

### 5. Theme-Agnostic
Components adapt to light/dark mode automatically.

## Testing

```bash
# Run UI violation scan
pnpm mobile:scan:ui

# Lint check
pnpm mobile:lint

# Type check
pnpm mobile:tsc
```

## ESLint Rules

Automatic enforcement of design system principles:
- `no-raw-colors`: Blocks raw hex/rgba colors
- `no-raw-spacing`: Blocks raw numeric spacing
- `no-theme-namespace`: Enforces theme object usage
- `no-theme-background-prop`: Uses `colors.bg` instead of `colors.background.*`

## Migration Guide

### From Old Components

```tsx
// OLD
import { Button } from '@/components/ui/Button';

// NEW
import { Button } from '@/components/ui/v2';
```

### Theme Access

```tsx
// OLD
const colors = theme.colors;

// NEW
const { colors, spacing, radius } = useTheme();
```

## Resources

- Components: `apps/mobile/src/components/ui/v2/`
- Theme: `apps/mobile/src/theme/`
- Hooks: `apps/mobile/src/hooks/`
- Progress: `UI_UPSCALE_PROGRESS.md`
- Summary: `UI_UPSCALE_SUMMARY.md`

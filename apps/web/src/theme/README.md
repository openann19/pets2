# 🎨 Unified Theme System

This is the **single source of truth** for theme management in the web app, matching the mobile app structure exactly.

## Structure

- **`contracts.ts`** - Type definitions matching mobile app (`AppTheme`, `SemanticColors`, etc.)
- **`base-theme.ts`** - Base theme constants with nested color structure (light & dark variants)
- **`resolve.ts`** - Resolver that converts base theme to unified `AppTheme` type
- **`Provider.tsx`** - React context provider for theme access
- **`index.ts`** - Main export file

## Usage

### Basic Usage

```tsx
import { ThemeProvider, useTheme } from '@/theme';

function App() {
  return (
    <ThemeProvider>
      <MyComponent />
    </ThemeProvider>
  );
}

function MyComponent() {
  const theme = useTheme();
  
  return (
    <div style={{ 
      background: theme.colors.surface,
      color: theme.colors.onSurface,
      padding: theme.spacing.md,
      borderRadius: theme.radii.lg,
    }}>
      Hello World
    </div>
  );
}
```

### Semantic Tokens

Always use semantic tokens instead of hardcoded colors:

- `theme.colors.bg` - Page background
- `theme.colors.surface` - Card/modal background
- `theme.colors.onSurface` - Text on surface
- `theme.colors.onMuted` - Secondary text
- `theme.colors.primary` - Primary brand color
- `theme.colors.danger` - Error/destructive actions
- `theme.colors.success` - Success states
- `theme.spacing.{xs|sm|md|lg|xl|2xl|3xl|4xl}` - Spacing tokens
- `theme.radii.{none|xs|sm|md|lg|xl|2xl|pill|full}` - Border radius tokens
- `theme.palette.gradients.*` - Gradient definitions

### Integration with Tailwind

For Tailwind CSS, use CSS variables or extend Tailwind config to reference these tokens.

## Migration from Old Theme

The old theme system (`src/design-system/index.ts`, `src/theme/unified-design-system.ts`) should be gradually migrated to use this unified system. Components should import from `@/theme` instead of other theme sources.


---
applyTo:
  - 'apps/mobile/**'
---

# Mobile App Instructions (React Native + Expo)

## Overview

The mobile app is built with React Native using Expo SDK ~49.0.23. Follow the multi-agent system principles from `AGENTS.md` for mobile development.

## Mobile-Specific Standards

### React Native Components
- Use core React Native components as primitives
- Import from `react-native`: `View`, `Text`, `TouchableOpacity`, `ScrollView`, `FlatList`
- Use themed components from design system when available
- Never use `any` for component props

### Styling
- Use design tokens from `packages/design-tokens/`
- Create themed base components in `src/components/ui/`
- Centralize all styles in `src/theme/` directory
- No inline hex colors - reference theme colors only
- Consistent spacing scale: 4, 8, 12, 16, 24, 32, 48, 64
- Border radii: 4, 8, 12, 16

### Theme System
```typescript
// Always use theme values
import { theme } from '../theme';

const styles = StyleSheet.create({
  container: {
    padding: theme.spacing.medium,
    backgroundColor: theme.colors.background.primary,
    borderRadius: theme.borderRadius.medium,
  },
});
```

### Animations
- Use React Native Reanimated 3.x for animations
- Target 60fps performance
- Spring configurations: `{ stiffness: 300, damping: 30 }`
- Respect `reduce-motion` accessibility setting
- Use `useAnimatedStyle` and `withSpring` / `withTiming`

### Navigation
- React Navigation v6
- Type-safe navigation with TypeScript
- Define navigation types in `src/navigation/types.ts`
- Use typed hooks: `useNavigation<NavigationProp>()`

### State Management
- React Query for server state
- Local state with `useState` for UI only
- Context API sparingly for shared UI state
- No Redux (we use React Query)

### Forms
- React Hook Form + Zod validation
- Validate on blur for better UX
- Show inline error messages
- Handle keyboard properly (dismiss on submit)

### Performance
- Use `FlatList` for long lists (never `ScrollView` with `.map()`)
- Implement `getItemLayout` when item heights are fixed
- Add `keyExtractor` to all `FlatList` components
- Use `React.memo` for expensive list items
- Optimize images with `expo-image`
- Profile with Expo DevTools

### Accessibility
```typescript
// Required accessibility props
<TouchableOpacity
  accessible={true}
  accessibilityRole="button"
  accessibilityLabel="Submit form"
  accessibilityHint="Submits the registration form"
>
```

- `accessibilityLabel` on all interactive elements
- `accessibilityRole` for semantic meaning
- `accessibilityHint` for complex interactions
- `accessibilityState` for toggleable elements
- Touch target size: minimum 44x44 points

### Testing
- Use `@testing-library/react-native` for component tests
- Jest for unit tests
- Detox for E2E tests
- Test accessibility props
- Mock navigation in tests

```typescript
// Example test
import { render, fireEvent } from '@testing-library/react-native';

test('button press triggers action', () => {
  const onPress = jest.fn();
  const { getByRole } = render(<Button onPress={onPress} />);
  
  fireEvent.press(getByRole('button'));
  expect(onPress).toHaveBeenCalledTimes(1);
});
```

### Error Handling
- Use error boundaries for crash prevention
- Show user-friendly error messages
- Log errors to Sentry in production
- Implement retry logic for network failures

### API Integration
- Base URL from environment config
- Use `src/services/api.ts` for API client
- Handle offline scenarios gracefully
- Show loading states during network requests
- Implement request cancellation

### Platform-Specific Code
```typescript
import { Platform } from 'react-native';

const headerHeight = Platform.select({
  ios: 44,
  android: 56,
  default: 50,
});
```

Use sparingly - prefer cross-platform solutions.

### File Organization
```
apps/mobile/
├── src/
│   ├── components/
│   │   ├── ui/           # Themed base components
│   │   └── features/     # Feature-specific components
│   ├── screens/          # Screen components
│   ├── navigation/       # Navigation setup
│   ├── services/         # API clients
│   ├── hooks/            # Custom hooks
│   ├── utils/            # Utilities
│   ├── theme/            # Design system
│   ├── types/            # TypeScript types
│   └── constants/        # App constants
├── __tests__/            # Tests
└── e2e/                  # Detox E2E tests
```

### Common Patterns

#### Themed Button Component
```typescript
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { theme } from '@/theme';

interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline';
  onPress: () => void;
  children: string;
}

export const Button: React.FC<ButtonProps> = ({ 
  variant = 'primary', 
  onPress, 
  children 
}) => {
  return (
    <TouchableOpacity 
      style={[styles.base, styles[variant]]}
      onPress={onPress}
      accessible={true}
      accessibilityRole="button"
    >
      <Text style={styles.text}>{children}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    paddingHorizontal: theme.spacing.medium,
    paddingVertical: theme.spacing.small,
    borderRadius: theme.borderRadius.medium,
    minHeight: 44, // Accessibility minimum
  },
  primary: {
    backgroundColor: theme.colors.primary,
  },
  secondary: {
    backgroundColor: theme.colors.secondary,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  text: {
    color: theme.colors.text.inverse,
    fontSize: theme.typography.body.fontSize,
    fontWeight: theme.typography.body.fontWeight,
  },
});
```

#### API Call with React Query
```typescript
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/services/api';

export const useMatches = () => {
  return useQuery({
    queryKey: ['matches'],
    queryFn: () => apiClient.getMatches(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 3,
  });
};
```

## Multi-Agent Development Process

Follow the agent system from `AGENTS.md`:

1. **Product Reasoner** - Understand user journey before coding
2. **Gap Auditor** - Identify what's missing
3. **TypeScript Guardian** - Enforce strict types
4. **UI/UX Reviewer** - Visual consistency
5. **Accessibility Agent** - a11y compliance
6. **Performance Profiler** - 60fps target
7. **Test Engineer** - Tests before implementation

## Quality Gates (Mobile)

- TypeScript: `pnpm --filter mobile tsc`
- ESLint: `pnpm --filter mobile lint`
- Tests: `pnpm --filter mobile test:cov` (75%+ coverage)
- E2E: `pnpm --filter mobile e2e:test`
- Build: `eas build --platform all --profile preview`

## Common Issues

### Metro bundler cache issues
```bash
pnpm --filter mobile start --clear
```

### iOS build issues
```bash
cd apps/mobile/ios && pod install && cd -
```

### Android build issues
```bash
cd apps/mobile/android && ./gradlew clean && cd -
```

### TypeScript errors
Ensure all dependencies are built:
```bash
pnpm build
```

## Design System Migration

The mobile app is undergoing UI consistency improvements:
- All components must use themed base components
- No inline styles for colors/spacing/typography
- Reference `theme.ts` as single source of truth
- Replace primitive components with themed equivalents

## GDPR Requirements

Mobile app must implement:
- Delete account flow with password confirmation
- Export user data functionality
- Confirm deletion endpoint
- Grace period handling

See `AGENTS.md` section 6.1 for GDPR contracts.

## Conventions

- Component files: `PascalCase.tsx`
- Hook files: `use-kebab-case.ts`
- Utility files: `kebab-case.ts`
- Test files: `*.test.tsx` or `__tests__/*.tsx`
- Types: Co-located with components or in `types/`

## Resources

- React Native docs: https://reactnative.dev
- Expo docs: https://docs.expo.dev
- React Navigation: https://reactnavigation.org
- Reanimated: https://docs.swmansion.com/react-native-reanimated

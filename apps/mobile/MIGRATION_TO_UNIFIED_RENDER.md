# Migration Guide: Unified Render Utility

## Overview

All component tests should use the unified render utility from `@/test-utils/unified-render` instead of directly importing from `@testing-library/react-native`. This ensures consistent provider setup and reduces test failures.

## Migration Steps

### Step 1: Update Import

**Before:**
```tsx
import { render, screen, fireEvent } from '@testing-library/react-native';
```

**After:**
```tsx
import { render, screen, fireEvent } from '@/test-utils/unified-render';
```

### Step 2: Remove Theme Mocks

The unified render utility automatically provides ThemeProvider, so you can remove theme mocks:

**Before:**
```tsx
jest.mock('@mobile/theme'); // ❌ Remove this
jest.mock('@/theme'); // ❌ Remove this

const mockUseTheme = useTheme as jest.MockedFunction<typeof useTheme>;
mockUseTheme.mockReturnValue(mockTheme);
```

**After:**
```tsx
// ✅ No theme mock needed - unified-render handles it
```

### Step 3: Remove Provider Setup

If you were manually wrapping components with providers, remove that:

**Before:**
```tsx
const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        {component}
      </QueryClientProvider>
    </ThemeProvider>
  );
};
```

**After:**
```tsx
// ✅ Just use render() directly - providers are included
render(<MyComponent />);
```

### Step 4: Keep Service/Hook Mocks

Keep mocks for services and custom hooks, but remove theme-related mocks:

```tsx
// ✅ Keep these
jest.mock('../../services/myService');
jest.mock('../../hooks/useCustomHook');

// ❌ Remove theme mocks
// jest.mock('@/theme');
```

## Examples

### Simple Component Test

```tsx
import React from 'react';
import { render, screen } from '@/test-utils/unified-render';
import { MyComponent } from '../MyComponent';

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText('Hello')).toBeTruthy();
  });
});
```

### Component with Navigation

```tsx
import React from 'react';
import { render, screen } from '@/test-utils/unified-render';
import { createMockScreenProps } from '@/test-utils/unified-render';
import { MyScreen } from '../MyScreen';

describe('MyScreen', () => {
  it('renders with navigation', () => {
    const props = createMockScreenProps({ userId: '123' });
    render(<MyScreen {...props} />);
    expect(screen.getByText('Welcome')).toBeTruthy();
  });
});
```

### Component with QueryClient

```tsx
import React from 'react';
import { render, screen, waitFor } from '@/test-utils/unified-render';
import { QueryClient } from '@tanstack/react-query';
import { MyComponent } from '../MyComponent';

describe('MyComponent', () => {
  it('handles async data', async () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    
    render(<MyComponent />, { queryClient });
    
    await waitFor(() => {
      expect(screen.getByText('Loaded')).toBeTruthy();
    });
  });
});
```

## Benefits

1. **Consistent Setup**: All tests get the same provider configuration
2. **Fewer Mocks**: No need to mock ThemeProvider, NavigationContainer, etc.
3. **Less Boilerplate**: No need to manually wrap components
4. **Better Type Safety**: Mock helpers are properly typed
5. **Easier Maintenance**: Change provider setup in one place

## Common Issues

### Issue: Test still fails with "ThemeProvider not found"

**Solution**: Make sure you're using `@/test-utils/unified-render`, not the old render utility.

### Issue: Navigation-related errors

**Solution**: Use `createMockScreenProps()` from unified-render instead of manually creating navigation mocks.

### Issue: QueryClient conflicts

**Solution**: Pass a custom `queryClient` option to render if you need specific configuration.

## Checklist

When migrating a test file:

- [ ] Change import to use `@/test-utils/unified-render`
- [ ] Remove `jest.mock('@/theme')` or `jest.mock('@mobile/theme')`
- [ ] Remove `mockUseTheme` setup code
- [ ] Remove manual provider wrappers
- [ ] Update to use `createMockScreenProps()` if needed
- [ ] Test still passes

## Files to Migrate

Run this to find component tests that still need migration:

```bash
grep -r "from '@testing-library/react-native'" apps/mobile/src --include="*.test.tsx" | grep -v "unified-render"
```


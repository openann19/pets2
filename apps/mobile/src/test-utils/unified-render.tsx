/**
 * Unified Render Utility for Tests
 * 
 * This is the canonical test render utility that should be used by ALL test files.
 * It provides consistent provider setup and avoids common test failures.
 * 
 * Usage:
 *   import { render } from '@/test-utils/unified-render';
 *   const { getByText } = render(<MyComponent />);
 */

import React from 'react';
import type { RenderOptions } from '@testing-library/react-native';
import { render as rtlRender, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider } from '@/theme';
import { I18nextProvider } from 'react-i18next';
import i18n from '../i18n';

/**
 * Create a test query client with safe defaults for tests
 */
function createTestQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        cacheTime: 0,
        gcTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  });
}

/**
 * Mock navigation for tests
 */
export const mockNavigation = {
  navigate: jest.fn(),
  goBack: jest.fn(),
  setOptions: jest.fn(),
  dispatch: jest.fn(),
  reset: jest.fn(),
  isFocused: jest.fn(() => true),
  canGoBack: jest.fn(() => true),
  getParent: jest.fn(),
  getState: jest.fn(() => ({
    routes: [],
    index: 0,
    key: 'test',
    routeNames: [],
    stale: false,
    type: 'stack' as const,
  })),
  addListener: jest.fn(() => jest.fn()),
  removeListener: jest.fn(),
  replace: jest.fn(),
  push: jest.fn(),
  pop: jest.fn(),
  popToTop: jest.fn(),
};

/**
 * Create mock route props
 */
export function createMockRoute<T extends Record<string, unknown> = Record<string, unknown>>(
  params: T = {} as T,
  routeName = 'TestScreen',
) {
  return {
    key: `test-route-${routeName}`,
    name: routeName,
    params,
    path: undefined,
  };
}

/**
 * Create mock screen props (navigation + route)
 */
export function createMockScreenProps<T extends Record<string, unknown> = Record<string, unknown>>(
  params: T = {} as T,
  routeName = 'TestScreen',
) {
  return {
    navigation: mockNavigation,
    route: createMockRoute(params, routeName),
  };
}

/**
 * All necessary providers for component tests
 */
interface UnifiedRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  /**
   * Custom query client (defaults to test client)
   */
  queryClient?: QueryClient;
  
  /**
   * Include NavigationContainer (default: true)
   */
  includeNavigation?: boolean;
  
  /**
   * Include SafeAreaProvider (default: true)
   */
  includeSafeArea?: boolean;
  
  /**
   * Include I18nextProvider (default: true)
   */
  includeI18n?: boolean;
  
  /**
   * Theme scheme (default: 'light')
   */
  themeScheme?: 'light' | 'dark';
}

function AllTheProviders({
  children,
  options,
}: {
  children: React.ReactNode;
  options: UnifiedRenderOptions;
}) {
  const {
    queryClient = createTestQueryClient(),
    includeNavigation = true,
    includeSafeArea = true,
    includeI18n = true,
    themeScheme = 'light',
  } = options;

  let content: React.ReactElement = <>{children}</>;

  // Wrap with QueryClientProvider first (deepest)
  content = <QueryClientProvider client={queryClient}>{content}</QueryClientProvider>;

  // Wrap with ThemeProvider
  content = (
    <ThemeProvider scheme={themeScheme}>
      {content}
    </ThemeProvider>
  );

  // Wrap with I18nextProvider if needed
  if (includeI18n) {
    content = <I18nextProvider i18n={i18n}>{content}</I18nextProvider>;
  }

  // Wrap with SafeAreaProvider if needed
  if (includeSafeArea) {
    content = <SafeAreaProvider>{content}</SafeAreaProvider>;
  }

  // Wrap with NavigationContainer last (outermost) if needed
  if (includeNavigation) {
    content = <NavigationContainer>{content}</NavigationContainer>;
  }

  return content;
}

/**
 * Unified render function with all providers
 * 
 * This replaces direct usage of @testing-library/react-native's render
 * and ensures consistent provider setup across all tests.
 * 
 * @example
 * ```tsx
 * import { render } from '@/test-utils/unified-render';
 * 
 * it('renders correctly', () => {
 *   const { getByText } = render(<MyComponent />);
 *   expect(getByText('Hello')).toBeTruthy();
 * });
 * ```
 */
export function render(
  ui: React.ReactElement,
  options: UnifiedRenderOptions = {},
) {
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <AllTheProviders options={options}>{children}</AllTheProviders>
  );

  return rtlRender(ui, {
    wrapper,
    ...options,
  });
}

/**
 * Render without any providers (for testing provider setup itself)
 */
export function renderWithoutProviders(
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) {
  return rtlRender(ui, options);
}

/**
 * Wait for component to be ready (useful for async initialization)
 */
export async function waitForRender(condition: () => boolean, timeout = 3000) {
  await waitFor(condition, { timeout });
}

// Re-export everything from RTL for convenience
export * from '@testing-library/react-native';


/**
 * Test Providers for Component Testing
 * Provides all necessary context providers for UI component tests
 */

import React from 'react';
import { render } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from '@/theme';

/**
 * Create a test query client with default options
 */
export function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        cacheTime: 0,
      },
    },
  });
}

/**
 * Mock navigation props for screens
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
  getState: jest.fn(),
  addListener: jest.fn(),
  removeListener: jest.fn(),
};

/**
 * Render a component with all necessary providers for snapshot testing
 * Simplified version without i18n to avoid async initialization issues
 */
export function renderWithProviders(
  component: React.ReactElement,
  options?: {
    queryClient?: QueryClient;
    navigation?: boolean;
  },
) {
  const { queryClient = createTestQueryClient(), navigation = true } = options || {};

  const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    let content = (
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </QueryClientProvider>
    );

    if (navigation) {
      content = <NavigationContainer>{content}</NavigationContainer>;
    }

    return content;
  };

  return render(component, { wrapper: Wrapper });
}

/**
 * Create mock screen props
 */
export function createMockScreenProps<T extends Record<string, unknown> = Record<string, unknown>>(
  params: T = {} as T,
) {
  return {
    navigation: mockNavigation,
    route: {
      key: 'test-route-key',
      name: 'TestScreen',
      params,
      path: undefined,
    },
  };
}

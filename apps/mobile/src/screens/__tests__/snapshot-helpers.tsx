/**
 * Snapshot Test Helper Utilities
 * Fixes T-01: Jest snapshot tests for key screens
 * Provides common setup and utilities for snapshot testing
 */

import React from 'react';
import { render } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from '@mobile/theme';
import { I18nextProvider } from 'react-i18next';
import i18n from '../../i18n';

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
 * Render a component with all necessary providers for snapshot testing
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
          <I18nextProvider i18n={i18n}>{children}</I18nextProvider>
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
 * Mock route props for screens
 */
export function createMockRoute<T extends Record<string, unknown> = Record<string, unknown>>(
  params: T = {} as T,
) {
  return {
    key: 'test-route-key',
    name: 'TestScreen',
    params,
    path: undefined,
  };
}

/**
 * Create mock screen props
 */
export function createMockScreenProps<T extends Record<string, unknown> = Record<string, unknown>>(
  params: T = {} as T,
) {
  return {
    navigation: mockNavigation,
    route: createMockRoute(params),
  };
}


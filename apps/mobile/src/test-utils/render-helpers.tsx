/**
 * Enhanced Component Test Helpers
 * Provides graduated complexity test utilities for React Native components
 */

import React from 'react';
import { render, RenderOptions } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from '../theme';

/**
 * Create a test query client with default options
 */
export function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0, // Using gcTime instead of deprecated cacheTime
      },
    },
  });
}

/**
 * Basic render with no providers
 * For simple presentational components with no dependencies
 */
export function renderBasic(component: React.ReactElement) {
  return render(component);
}

/**
 * Render with theme provider
 * For components that use useTheme() hook
 */
export function renderWithTheme(
  component: React.ReactElement, 
  options?: Omit<RenderOptions, 'wrapper'>
) {
  return render(component, { 
    wrapper: ({ children }) => (
      <ThemeProvider>{children}</ThemeProvider>
    ),
    ...options,
  });
}

/**
 * Render with navigation provider
 * For components that use useNavigation() hook
 */
export function renderWithNavigation(
  component: React.ReactElement, 
  options?: Omit<RenderOptions, 'wrapper'>
) {
  return render(component, { 
    wrapper: ({ children }) => (
      <NavigationContainer>{children}</NavigationContainer>
    ),
    ...options,
  });
}

/**
 * Render with theme and navigation providers
 * For components that use both useTheme() and useNavigation()
 */
export function renderWithThemeAndNavigation(
  component: React.ReactElement, 
  options?: Omit<RenderOptions, 'wrapper'>
) {
  return render(component, { 
    wrapper: ({ children }) => (
      <NavigationContainer>
        <ThemeProvider>{children}</ThemeProvider>
      </NavigationContainer>
    ),
    ...options,
  });
}

/**
 * Render with all providers
 * For complex components with multiple dependencies
 */
export function renderWithAllProviders(
  component: React.ReactElement, 
  options?: Omit<RenderOptions, 'wrapper'> & {
    queryClient?: QueryClient;
  }
) {
  const queryClient = options?.queryClient || createTestQueryClient();
  
  return render(component, { 
    wrapper: ({ children }) => (
      <QueryClientProvider client={queryClient}>
        <NavigationContainer>
          <ThemeProvider>{children}</ThemeProvider>
        </NavigationContainer>
      </QueryClientProvider>
    ),
    ...options,
  });
}

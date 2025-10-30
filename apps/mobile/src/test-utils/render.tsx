/**
 * Custom render function with providers for consistent test setup
 */
import { ThemeProvider } from '@mobile/theme';
import type { RenderOptions } from '@testing-library/react-native';
import { render as rtlRender } from '@testing-library/react-native';
import React from 'react';
import { I18nextProvider } from 'react-i18next';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import i18n from '../i18n';

/**
 * Default providers for tests
 */
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <SafeAreaProvider>
      <ThemeProvider scheme="light">
        <I18nextProvider i18n={i18n}>{children}</I18nextProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
};

/**
 * Render with all providers
 * Usage: import { render } from '@/test-utils/render';
 */
export function render(ui: React.ReactElement, options?: Omit<RenderOptions, 'wrapper'>) {
  return rtlRender(ui, {
    wrapper: AllTheProviders,
    ...options,
  });
}

// Re-export everything else from RTL
export * from '@testing-library/react-native';

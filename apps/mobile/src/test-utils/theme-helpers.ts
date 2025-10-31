/**
 * Test theme helpers
 * Provides mock theme objects for testing without hardcoded hex colors
 */

import { getLightTheme } from '@/theme/resolve';
import type { AppTheme } from '@/theme';

/**
 * Get a mock light theme for testing
 * Uses actual theme values to avoid hardcoded colors
 */
export function getMockLightTheme(): AppTheme {
  return getLightTheme();
}

/**
 * Get a minimal mock theme for simple test cases
 * Uses semantic color names from actual theme
 */
export function getMockTheme(): AppTheme {
  const theme = getLightTheme();
  return theme;
}

/**
 * Create a custom mock theme with specific overrides
 */
export function createMockTheme(overrides?: Partial<AppTheme>): AppTheme {
  const baseTheme = getLightTheme();
  return {
    ...baseTheme,
    ...overrides,
    colors: {
      ...baseTheme.colors,
      ...overrides?.colors,
    },
  };
}


/**
 * @module theme/useTheme
 * Hook for accessing theme in components
 */

import { useTheme } from "./Provider";

// Re-export from Provider - single source of truth
export { useTheme };

// Legacy exports for backward compatibility
export function useThemeName() {
  const { scheme } = useTheme();
  return scheme;
}

export function useSetTheme() {
  // Theme is controlled by system scheme or ThemeProvider prop
  // This is a no-op for now but kept for compatibility
  return () => {};
}
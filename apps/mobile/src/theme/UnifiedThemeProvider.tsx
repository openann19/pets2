/**
 * @deprecated Use theme/Provider instead
 * This file is kept for backward compatibility during migration
 *
 * Professional theme provider for mobile app
 * Supports light/dark/system modes with seamless switching
 */

import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { Appearance, type ColorSchemeName } from "react-native";
import type { Theme, ThemeMode, ThemeContextValue, SemanticColors, Spacing, Radius, Motion } from "./types";
import { createTheme as createNewTheme } from "./rnTokens";

// Deprecation warning
let warned = false;
if (!warned && process.env.NODE_ENV !== "test") {
  void import("../services/logger").then(({ logger }) => {
    logger.warn("[DEPRECATION] theme/Provider → use theme/Provider instead.");
  });
  warned = true;
}

// ====== CONTEXT ======
const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

// ====== PROVIDER PROPS ======
interface UnifiedThemeProviderProps {
  children: ReactNode;
  initialMode?: ThemeMode;
}

// ====== PROVIDER COMPONENT ======
export function UnifiedThemeProvider({
  children,
  initialMode = "system",
}: UnifiedThemeProviderProps) {
  const [mode, setMode] = useState<ThemeMode>(initialMode);
  const [systemColorScheme, setSystemColorScheme] = useState<ColorSchemeName>(
    Appearance.getColorScheme(),
  );

  // Listen to system color scheme changes
  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      setSystemColorScheme(colorScheme);
    });

    return () => {
      subscription?.remove();
    };
  }, []);

  // Determine if dark mode is active
  const isDark = useMemo(() => {
    if (mode === "system") {
      return systemColorScheme === "dark";
    }
    return mode === "dark";
  }, [mode, systemColorScheme]);

  // Get current theme based on mode  
  const theme = useMemo<Theme>(() => {
    return createNewTheme(isDark ? "dark" : "light");
  }, [isDark]);

  // Toggle theme function
  const toggleTheme = React.useCallback(() => {
    setMode((currentMode) => {
      if (currentMode === "light") return "dark";
      if (currentMode === "dark") return "light";
      // If system mode, toggle based on current appearance
      return systemColorScheme === "dark" ? "light" : "dark";
    });
  }, [systemColorScheme]);

  // Context value
  const value = useMemo<ThemeContextValue>(
    () => ({
      theme,
      mode,
      isDark,
      setMode,
      toggleTheme,
    }),
    [theme, mode, isDark, toggleTheme],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

// ====== HOOKS ======
export function useThemeContext(): ThemeContextValue {
  const context = useContext(ThemeContext);

  if (context === undefined) {
    throw new Error(
      "useThemeContext must be used within a UnifiedThemeProvider",
    );
  }

  return context;
}

// Main theme hook - returns the current theme
export function useTheme(): Theme {
  return useThemeContext().theme;
}

// Theme mode hook - returns the current mode and controls
export function useThemeMode() {
  const { mode, isDark, setMode, toggleTheme } = useThemeContext();
  return { mode, isDark, setMode, toggleTheme };
}

// Colors hook - returns just the colors for convenience
export function useColors() {
  return useThemeContext().theme.colors;
}

// Typography hook removed - Theme doesn't have typography property

// Spacing hook - returns just the spacing for convenience
export function useSpacing() {
  return useThemeContext().theme.spacing;
}

// Shadows hook removed - Theme doesn't have shadows property

// ====== DEFAULT EXPORT ======
export default UnifiedThemeProvider;

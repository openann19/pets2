/**
 * @deprecated Use theme/Provider instead
 * This file is kept for backward compatibility during migration
 */

export { ThemeProvider, useTheme } from "../theme/Provider";

let warned = false;
if (!warned) {
  void import("../services/logger").then(({ logger }) => {
    logger.warn("[DEPRECATION] theme/Provider → use theme/Provider instead.");
  });
  warned = true;
}

// Legacy exports for backwards compatibility
export interface ThemeColors {
  primary: string;
  primaryLight: string;
  primaryDark: string;
  secondary: string;
  secondaryLight: string;
  secondaryDark: string;
  accent: string;
  accentLight: string;
  accentDark: string;
  success: string;
  warning: string;
  error: string;
  info: string;
  white: string;
  black: string;
  gray50: string;
  gray100: string;
  gray200: string;
  gray300: string;
  gray400: string;
  gray500: string;
  gray600: string;
  gray700: string;
  gray800: string;
  gray900: string;
  glassWhite: string;
  glassWhiteLight: string;
  glassWhiteDark: string;
  glassDark: string;
  glassDarkMedium: string;
  glassDarkStrong: string;
  gradientPrimary: string[];
  gradientSecondary: string[];
  gradientAccent: string[];
  gradientSuccess: string[];
  gradientWarning: string[];
  gradientError: string[];
  background: string;
  surface: string;
  surfaceElevated: string;
  text: string;
  textSecondary: string;
  border: string;
  borderLight: string;
  card: string;
  tertiary: string;
  inverse: string;
  shadow: string;
}

export interface ThemeContextType {
  isDark: boolean;
  themeMode: "light" | "dark" | "system";
  colors: ThemeColors;
  styles: Record<string, unknown>;
  shadows: Record<string, unknown>;
  setThemeMode: (mode: "light" | "dark" | "system") => void;
  toggleTheme: () => void;
}

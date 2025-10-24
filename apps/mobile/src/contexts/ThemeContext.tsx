import React, {
  createContext,
  useContext,
  useEffect,
  type ReactNode,
} from "react";
import { Appearance } from "react-native";

import { ColorsDark, GlobalStylesDark, ShadowsDark } from "../styles/DarkTheme";
import { Colors, GlobalStyles, Shadows } from "../styles/GlobalStyles";
import { useUIStore, type ThemeMode } from "../stores/useUIStore";

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
  // Additional UI colors
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  border: string;
  borderLight: string;
  card: string;
  tertiary: string;
  inverse: string;
}

export interface ThemeContextType {
  isDark: boolean;
  themeMode: ThemeMode;
  colors: ThemeColors;
  styles: Record<string, unknown>;
  shadows: Record<string, unknown>;
  setThemeMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({
  children,
}: ThemeProviderProps): React.JSX.Element {
  const { themeMode, isDark, setThemeMode, setSystemColorScheme, toggleTheme } =
    useUIStore();

  // Get current theme colors and styles
  const colors = isDark ? ColorsDark : Colors;
  const styles = isDark ? GlobalStylesDark : GlobalStyles;
  const shadows = isDark ? ShadowsDark : Shadows;

  // Listen to system color scheme changes and update store
  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      setSystemColorScheme(colorScheme);
    });

    // Initialize with current system color scheme
    setSystemColorScheme(Appearance.getColorScheme());

    return () => {
      subscription?.remove();
    };
  }, [setSystemColorScheme]);

  const contextValue: ThemeContextType = {
    isDark,
    themeMode,
    colors,
    styles,
    shadows,
    setThemeMode,
    toggleTheme,
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

export default ThemeContext;

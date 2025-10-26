import * as Haptics from "expo-haptics";
import { useCallback } from "react";
import { Alert } from "react-native";

import type { ThemeMode } from "../stores/useUIStore";
import { useTheme } from "../contexts/ThemeContext";

export interface UseThemeToggleReturn {
  isDark: boolean;
  themeMode: ThemeMode;
  colors: ThemeColors;
  styles: Record<string, unknown>;
  shadows: Record<string, unknown>;
  toggleTheme: () => void;
  setLightTheme: () => void;
  setDarkTheme: () => void;
  setSystemTheme: () => void;
  showThemeSelector: () => void;
}

export function useThemeToggle(): UseThemeToggleReturn {
  const {
    isDark,
    themeMode,
    colors,
    styles,
    shadows,
    setThemeMode,
    toggleTheme: contextToggleTheme,
  } = useTheme();

  // Enhanced toggle with haptic feedback
  const toggleTheme = useCallback(async () => {
    try {
      // Provide haptic feedback
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      contextToggleTheme();
    } catch (error) {
      // Fallback if haptics fail
      contextToggleTheme();
    }
  }, [contextToggleTheme]);

  // Set specific theme modes
  const setLightTheme = useCallback(() => {
    setThemeMode("light");
  }, [setThemeMode]);

  const setDarkTheme = useCallback(() => {
    setThemeMode("dark");
  }, [setThemeMode]);

  const setSystemTheme = useCallback(() => {
    setThemeMode("system");
  }, [setThemeMode]);

  // Show theme selection modal
  const showThemeSelector = useCallback(() => {
    const currentThemeLabel = {
      light: "Light",
      dark: "Dark",
      system: "System Default",
    }[themeMode];

    Alert.alert(
      "Select Theme",
      `Current theme: ${currentThemeLabel}`,
      [
        {
          text: "Light",
          onPress: setLightTheme,
          style: themeMode === "light" ? "default" : "default",
        },
        {
          text: "Dark",
          onPress: setDarkTheme,
          style: themeMode === "dark" ? "default" : "default",
        },
        {
          text: "System Default",
          onPress: setSystemTheme,
          style: themeMode === "system" ? "default" : "default",
        },
        {
          text: "Cancel",
          style: "cancel",
        },
      ],
      {
        cancelable: true,
        userInterfaceStyle: isDark ? "dark" : "light",
      },
    );
  }, [themeMode, isDark, setLightTheme, setDarkTheme, setSystemTheme]);

  return {
    isDark,
    themeMode,
    colors,
    styles,
    shadows,
    toggleTheme,
    setLightTheme,
    setDarkTheme,
    setSystemTheme,
    showThemeSelector,
  };
}

export default useThemeToggle;

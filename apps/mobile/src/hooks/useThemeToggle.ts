import * as Haptics from 'expo-haptics';
import { useCallback } from 'react';
import { Alert } from 'react-native';

import type { ThemeColors } from '@/theme';
import { useTheme } from '@/theme';
import type { ThemeMode } from '../stores/useUIStore';
import { useUIStore } from '../stores/useUIStore';
import { getExtendedColors } from '../theme/adapters';

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
  const theme = useTheme();
  const { isDark, themeMode, setThemeMode, toggleTheme: storeToggleTheme } = useUIStore();

  // Get extended colors for backward compatibility
  const colors = getExtendedColors(theme);
  const styles: Record<string, unknown> = {};
  const shadows: Record<string, unknown> = {};

  // Enhanced toggle with haptic feedback
  const toggleTheme = useCallback(async () => {
    try {
      // Provide haptic feedback
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      storeToggleTheme();
    } catch (error) {
      // Fallback if haptics fail
      storeToggleTheme();
    }
  }, [storeToggleTheme]);

  // Set specific theme modes
  const setLightTheme = useCallback(() => {
    setThemeMode('light');
  }, [setThemeMode]);

  const setDarkTheme = useCallback(() => {
    setThemeMode('dark');
  }, [setThemeMode]);

  const setSystemTheme = useCallback(() => {
    setThemeMode('system');
  }, [setThemeMode]);

  // Show theme selection modal
  const showThemeSelector = useCallback(() => {
    const currentThemeLabel = {
      light: 'Light',
      dark: 'Dark',
      system: 'System Default',
    }[themeMode];

    Alert.alert(
      'Select Theme',
      `Current theme: ${currentThemeLabel}`,
      [
        {
          text: 'Light',
          onPress: setLightTheme,
          style: themeMode === 'light' ? 'default' : 'default',
        },
        {
          text: 'Dark',
          onPress: setDarkTheme,
          style: themeMode === 'dark' ? 'default' : 'default',
        },
        {
          text: 'System Default',
          onPress: setSystemTheme,
          style: themeMode === 'system' ? 'default' : 'default',
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ],
      {
        cancelable: true,
        userInterfaceStyle: isDark ? 'dark' : 'light',
      },
    );
  }, [themeMode, isDark, setLightTheme, setDarkTheme, setSystemTheme]);

  return {
    isDark: isDark ?? false,
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

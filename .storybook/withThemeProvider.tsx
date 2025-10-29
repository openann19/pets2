import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider } from '../apps/mobile/src/theme/Provider';

export const withThemeProvider = (Story: React.ComponentType) => (
  <SafeAreaProvider>
    <ThemeProvider>
      <Story />
    </ThemeProvider>
  </SafeAreaProvider>
);


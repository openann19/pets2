import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider } from '../apps/mobile/src/theme';

export const withThemeProvider = (Story: React.ComponentType, context?: any) => {
  // Support dark/light theme toggle from Storybook controls
  const scheme = context?.globals?.theme === 'dark' ? 'dark' : 'light';
  
  return (
    <SafeAreaProvider>
      <ThemeProvider scheme={scheme}>
        <Story />
      </ThemeProvider>
    </SafeAreaProvider>
  );
};


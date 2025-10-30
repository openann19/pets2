/**
 * Storybook Preview Configuration
 * Global decorators, parameters, and addons for all stories
 */

import type { Preview } from '@storybook/react-native';
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider } from '../src/theme';

/**
 * Global decorator to wrap all stories with theme provider and safe area
 */
const withThemeAndSafeArea = (Story: any) => (
  <SafeAreaProvider>
    <ThemeProvider scheme="light">
      <View style={styles.container}>
        <Story />
      </View>
    </ThemeProvider>
  </SafeAreaProvider>
);

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    backgrounds: {
      default: 'light',
      values: [
        {
          name: 'light',
          value: '#FFFFFF',
        },
        {
          name: 'dark',
          value: '#171717',
        },
        {
          name: 'premium',
          value: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)',
        },
      ],
    },
    actions: { argTypesRegex: '^on[A-Z].*' },
    layout: 'centered',
  },
  decorators: [withThemeAndSafeArea],
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
});

export default preview;


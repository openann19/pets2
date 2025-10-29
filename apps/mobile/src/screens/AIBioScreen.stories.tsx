/**
 * AIBioScreen Stories
 * Integration stories showcasing the complete AI Bio generation flow
 */

import React from 'react';
import { action } from '@storybook/addon-actions';
import type { Meta, StoryObj } from '@storybook/react-native';
import { View, Text, StyleSheet } from 'react-native';
import AIBioScreen from './AIBioScreen.refactored';

/**
 * Mock navigation prop
 */
const mockNavigation = {
  goBack: action('navigation.goBack'),
  navigate: action('navigation.navigate'),
} as any;

/**
 * Mock theme and colors
 */
const mockColors = {
  background: '#ffffff',
  text: '#000000',
  textMuted: '#666666',
  primary: '#007AFF',
  white: '#ffffff',
  danger: '#FF3B30',
  border: '#cccccc',
};

const mockSpacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

const mockBorderRadius = {
  'none': 0,
  'xs': 2,
  'sm': 4,
  'md': 8,
  'lg': 12,
  'xl': 16,
  '2xl': 20,
  'full': 9999,
};

/**
 * Simple theme mock
 */
const ThemeProvider = ({ children }: { children: React.ReactNode }) => (
  <View style={styles.themeContainer}>{children}</View>
);

/**
 * Meta configuration
 */
const meta: Meta<typeof AIBioScreen> = {
  title: 'Screens/AIBio',
  component: AIBioScreen,
  parameters: {
    notes: {
      markdown: `
# AI Bio Screen

Complete screen for AI-powered pet bio generation with form, tone selection, and results display.

## User Journey
1. User fills out pet information (name, breed, age, personality)
2. User selects desired bio tone
3. User optionally adds pet photo
4. User generates bio
5. User views results with analysis
6. User can copy, save, or regenerate bio

## Features
- Comprehensive form with validation
- Visual tone selector
- Photo upload capability
- Real-time bio generation
- Detailed analysis and scoring
- History tracking
- Copy to clipboard
- Save functionality

## Technical Details
- Uses useAIBio hook for state management
- Integrates with AI service for generation
- Implements proper error handling
- Accessible throughout
      `,
    },
  },
  decorators: [
    (Story) => (
      <ThemeProvider>
        <Story />
      </ThemeProvider>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof AIBioScreen>;

/**
 * Default screen state (empty form)
 */
export const DefaultScreen: Story = {
  render: () => <AIBioScreen navigation={mockNavigation} />,
  parameters: {
    notes: 'Empty form ready for user input',
  },
};

/**
 * Screen in loading state
 */
export const GeneratingState: Story = {
  render: () => (
    <View style={styles.infoContainer}>
      <Text style={styles.infoText}>
        🎨 This is a placeholder for the loading state.{'\n'}
        The actual screen would show a spinner while generating the bio.
      </Text>
      <AIBioScreen navigation={mockNavigation} />
    </View>
  ),
  parameters: {
    notes: 'Screen showing generation in progress with loading indicator',
  },
};

/**
 * Screen with generated bio
 */
export const WithGeneratedBio: Story = {
  render: () => (
    <View style={styles.infoContainer}>
      <Text style={styles.infoText}>
        ✅ This story would show the screen after a bio has been generated.{'\n'}
        It would display the BioResults component with copy, save, and regenerate actions.
      </Text>
      <AIBioScreen navigation={mockNavigation} />
    </View>
  ),
  parameters: {
    notes: 'Screen displaying generated bio with analysis and actions',
  },
};

/**
 * Interactive demonstration
 */
export const InteractiveFlow: Story = {
  render: () => <AIBioScreen navigation={mockNavigation} />,
  parameters: {
    notes:
      'Fully interactive flow - complete the form, select tone, generate bio, and explore results',
  },
};

/**
 * Error state
 */
export const ErrorState: Story = {
  render: () => (
    <View style={styles.infoContainer}>
      <Text style={styles.infoText}>
        ⚠️ Error state would show if generation fails{'\n'}
        The form would remain with error messages displayed
      </Text>
      <AIBioScreen navigation={mockNavigation} />
    </View>
  ),
  parameters: {
    notes: 'Screen showing error state with appropriate user feedback',
  },
};

const styles = StyleSheet.create({
  themeContainer: {
    flex: 1,
    backgroundColor: mockColors.background,
  },
  infoContainer: {
    padding: 16,
  },
  infoText: {
    fontSize: 14,
    color: mockColors.textMuted,
    marginBottom: 16,
    fontStyle: 'italic',
  },
});

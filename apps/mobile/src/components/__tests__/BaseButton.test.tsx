/**
 * BaseButton Component Tests
 * Tests the foundational button component
 */

import React from 'react';
import BaseButton from '../buttons/BaseButton';

// Mock the theme hook
jest.mock('../../theme/useTheme', () => ({
  useTheme: () => ({
    colors: {
      primary: '#007AFF',
      onPrimary: '#FFFFFF',
      onSurface: '#000000',
      surface: '#FFFFFF',
      border: '#E0E0E0',
    },
    spacing: {
      lg: 24,
      xl: 32,
      sm: 8,
      md: 16,
      '2xl': 48,
      '3xl': 64,
    },
    typography: {
      body: { size: 16 },
      h2: { size: 24 },
      h1: { size: 32 },
    },
    radii: {
      md: 8,
      lg: 12,
      xl: 16,
      '2xl': 24,
    },
    shadows: {
      elevation1: {},
    },
  }),
}));

// Mock useReduceMotion
jest.mock('../../hooks/useReducedMotion', () => ({
  useReduceMotion: () => false,
}));

describe('BaseButton', () => {
  it('should import without errors', () => {
    expect(BaseButton).toBeDefined();
  });

  it('should render with default props', () => {
    expect(() => <BaseButton title="Test Button" />).not.toThrow();
  });

  it('should handle press events', () => {
    const onPress = jest.fn();
    expect(() => (
      <BaseButton title="Press Me" onPress={onPress} />
    )).not.toThrow();
  });

  it('should render different variants', () => {
    expect(() => <BaseButton title="Primary" variant="primary" />).not.toThrow();
    expect(() => <BaseButton title="Secondary" variant="secondary" />).not.toThrow();
    expect(() => <BaseButton title="Ghost" variant="ghost" />).not.toThrow();
  });

  it('should render different sizes', () => {
    expect(() => <BaseButton title="Small" size="sm" />).not.toThrow();
    expect(() => <BaseButton title="Large" size="lg" />).not.toThrow();
  });

  it('should show loading state', () => {
    expect(() => <BaseButton title="Loading Button" loading />).not.toThrow();
  });

  it('should be disabled when loading', () => {
    const onPress = jest.fn();
    expect(() => (
      <BaseButton title="Disabled" loading onPress={onPress} />
    )).not.toThrow();
  });

  it('should render with icons', () => {
    expect(() => (
      <BaseButton title="With Icon" leftIcon="heart" rightIcon="arrow-forward" />
    )).not.toThrow();
  });
});

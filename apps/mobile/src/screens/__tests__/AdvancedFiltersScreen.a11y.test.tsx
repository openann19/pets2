/* eslint-env jest */
import React from 'react';
import { describe, it, expect } from '@jest/globals';
import { render, fireEvent } from '@testing-library/react-native';
import AdvancedFiltersScreen from '../AdvancedFiltersScreen';
import { ThemeProvider } from '@/theme';

// Mocks for native/expo components used by the screen
jest.mock('expo-linear-gradient', () => ({
  LinearGradient: ({ children }: any) => children,
}));
jest.mock('expo-blur', () => ({
  BlurView: ({ children }: any) => children,
}));

// Mock screen hook to avoid data dependencies
jest.mock('../../hooks/screens/useAdvancedFiltersScreen', () => ({
  useAdvancedFiltersScreen: () => ({
    filters: [],
    toggleFilter: jest.fn(),
    resetFilters: jest.fn(),
    saveFilters: jest.fn(),
    getFiltersByCategory: () => [],
  }),
}));

describe('AdvancedFiltersScreen accessibility', () => {
  it('renders back and save buttons with accessible labels and roles', () => {
    const goBack = jest.fn();
    const { getByA11yLabel } = render(
      <ThemeProvider>
        <AdvancedFiltersScreen navigation={{ goBack }} />
      </ThemeProvider>,
    );

    const back = getByA11yLabel('Go back');
    expect(back).toBeTruthy();
    fireEvent.press(back);
    expect(goBack).toHaveBeenCalled();

    const save = getByA11yLabel('Save filters');
    expect(save).toBeTruthy();
  });
});

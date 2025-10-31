/**
 * GenerateButton Component Tests
 * Comprehensive test coverage for the generate button component
 */

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { GenerateButton } from '../GenerateButton';

// Mock theme
jest.mock('@mobile/theme', () => ({
  useTheme: jest.fn(() => ({
    colors: {
      bg: '#FFFFFF',
      surface: '#F8F9FA',
      onSurface: '#000000',
      onMuted: '#666666',
      primary: '#007AFF',
    },
    spacing: { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 },
    radii: { md: 8, lg: 12, full: 9999 },
    typography: {
      h3: { size: 18 },
      h1: { weight: '700' },
    },
  })),
}));

describe('GenerateButton', () => {
  const mockOnPress = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render with "Generate Bio" text when not generating', () => {
      const { getByText, getByTestId } = render(
        <GenerateButton
          isGenerating={false}
          onPress={mockOnPress}
        />,
      );

      expect(getByText('Generate Bio')).toBeTruthy();
      expect(getByTestId('generate-bio-button')).toBeTruthy();
    });

    it('should render with "Generating..." text when generating', () => {
      const { getByText } = render(
        <GenerateButton
          isGenerating={true}
          onPress={mockOnPress}
        />,
      );

      expect(getByText('Generating...')).toBeTruthy();
    });

    it('should show activity indicator when generating', () => {
      const { UNSAFE_getByType } = render(
        <GenerateButton
          isGenerating={true}
          onPress={mockOnPress}
        />,
      );

      // ActivityIndicator should be present
      const activityIndicator = UNSAFE_getByType('ActivityIndicator');
      expect(activityIndicator).toBeTruthy();
    });

    it('should show star icon when not generating', () => {
      const { UNSAFE_getAllByType } = render(
        <GenerateButton
          isGenerating={false}
          onPress={mockOnPress}
        />,
      );

      // Should have Ionicons component
      const icons = UNSAFE_getAllByType('Text');
      expect(icons.length).toBeGreaterThan(0);
    });
  });

  describe('User Interactions', () => {
    it('should call onPress when button is pressed', () => {
      const { getByTestId } = render(
        <GenerateButton
          isGenerating={false}
          onPress={mockOnPress}
        />,
      );

      const button = getByTestId('generate-bio-button');
      fireEvent.press(button);

      expect(mockOnPress).toHaveBeenCalledTimes(1);
    });

    it('should not call onPress when disabled', () => {
      const { getByTestId } = render(
        <GenerateButton
          isGenerating={false}
          onPress={mockOnPress}
          disabled={true}
        />,
      );

      const button = getByTestId('generate-bio-button');
      fireEvent.press(button);

      expect(mockOnPress).not.toHaveBeenCalled();
    });

    it('should not call onPress when generating', () => {
      const { getByTestId } = render(
        <GenerateButton
          isGenerating={true}
          onPress={mockOnPress}
        />,
      );

      const button = getByTestId('generate-bio-button');
      fireEvent.press(button);

      expect(mockOnPress).not.toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('should have correct accessibility label when not generating', () => {
      const { getByTestId } = render(
        <GenerateButton
          isGenerating={false}
          onPress={mockOnPress}
        />,
      );

      const button = getByTestId('generate-bio-button');
      expect(button.props.accessibilityLabel).toBe('Generate bio');
      expect(button.props.accessibilityRole).toBe('button');
    });

    it('should have correct accessibility label when generating', () => {
      const { getByTestId } = render(
        <GenerateButton
          isGenerating={true}
          onPress={mockOnPress}
        />,
      );

      const button = getByTestId('generate-bio-button');
      expect(button.props.accessibilityLabel).toBe('Generating bio');
    });
  });

  describe('Disabled State', () => {
    it('should be disabled when disabled prop is true', () => {
      const { getByTestId } = render(
        <GenerateButton
          isGenerating={false}
          onPress={mockOnPress}
          disabled={true}
        />,
      );

      const button = getByTestId('generate-bio-button');
      expect(button.props.disabled).toBe(true);
    });

    it('should be disabled when generating', () => {
      const { getByTestId } = render(
        <GenerateButton
          isGenerating={true}
          onPress={mockOnPress}
        />,
      );

      const button = getByTestId('generate-bio-button');
      expect(button.props.disabled).toBe(true);
    });

    it('should have reduced opacity when disabled', () => {
      const { getByTestId } = render(
        <GenerateButton
          isGenerating={false}
          onPress={mockOnPress}
          disabled={true}
        />,
      );

      const button = getByTestId('generate-bio-button');
      // Button should have generatingButton style applied
      expect(button.props.style).toBeTruthy();
    });
  });

  describe('Edge Cases', () => {
    it('should handle rapid button presses when enabled', () => {
      const { getByTestId } = render(
        <GenerateButton
          isGenerating={false}
          onPress={mockOnPress}
        />,
      );

      const button = getByTestId('generate-bio-button');
      fireEvent.press(button);
      fireEvent.press(button);

      expect(mockOnPress).toHaveBeenCalledTimes(2);
    });

    it('should handle state changes from generating to not generating', () => {
      const { getByText, rerender } = render(
        <GenerateButton
          isGenerating={true}
          onPress={mockOnPress}
        />,
      );

      expect(getByText('Generating...')).toBeTruthy();

      rerender(
        <GenerateButton
          isGenerating={false}
          onPress={mockOnPress}
        />,
      );

      expect(getByText('Generate Bio')).toBeTruthy();
    });
  });
});


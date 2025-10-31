/**
 * HealthInfoSection Comprehensive Component Tests
 * Tests health info checkboxes, toggles, and interactions
 */

import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react-native';
import { ThemeProvider } from '@/theme';
import { HealthInfoSection } from '../HealthInfoSection';

// Mock dependencies
jest.mock('expo-blur', () => ({
  BlurView: ({ children, style }: any) => {
    const { View } = require('react-native');
    return <View style={style}>{children}</View>;
  },
}));

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <ThemeProvider scheme="light">{children}</ThemeProvider>
);

describe('HealthInfoSection Component Tests', () => {
  const defaultHealthInfo = {
    vaccinated: false,
    spayedNeutered: false,
    microchipped: false,
  };

  const defaultProps = {
    healthInfo: defaultHealthInfo,
    onToggleHealth: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render health info section successfully', () => {
      render(
        <TestWrapper>
          <HealthInfoSection {...defaultProps} />
        </TestWrapper>,
      );

      expect(screen.getByText('Health Information')).toBeTruthy();
    });

    it('should render all three health checkboxes', () => {
      render(
        <TestWrapper>
          <HealthInfoSection {...defaultProps} />
        </TestWrapper>,
      );

      expect(screen.getByTestID('health-vaccinated')).toBeTruthy();
      expect(screen.getByTestID('health-spayedNeutered')).toBeTruthy();
      expect(screen.getByTestID('health-microchipped')).toBeTruthy();
    });

    it('should display health field labels', () => {
      render(
        <TestWrapper>
          <HealthInfoSection {...defaultProps} />
        </TestWrapper>,
      );

      expect(screen.getByText('Vaccinated')).toBeTruthy();
      expect(screen.getByText('Spayed neutered')).toBeTruthy();
      expect(screen.getByText('Microchipped')).toBeTruthy();
    });
  });

  describe('Checkbox Interactions', () => {
    it('should call onToggleHealth when vaccinated is pressed', () => {
      render(
        <TestWrapper>
          <HealthInfoSection {...defaultProps} />
        </TestWrapper>,
      );

      const vaccinatedButton = screen.getByTestID('health-vaccinated');
      fireEvent.press(vaccinatedButton);

      expect(defaultProps.onToggleHealth).toHaveBeenCalledWith('vaccinated');
    });

    it('should call onToggleHealth when spayedNeutered is pressed', () => {
      render(
        <TestWrapper>
          <HealthInfoSection {...defaultProps} />
        </TestWrapper>,
      );

      const spayedButton = screen.getByTestID('health-spayedNeutered');
      fireEvent.press(spayedButton);

      expect(defaultProps.onToggleHealth).toHaveBeenCalledWith('spayedNeutered');
    });

    it('should call onToggleHealth when microchipped is pressed', () => {
      render(
        <TestWrapper>
          <HealthInfoSection {...defaultProps} />
        </TestWrapper>,
      );

      const microchippedButton = screen.getByTestID('health-microchipped');
      fireEvent.press(microchippedButton);

      expect(defaultProps.onToggleHealth).toHaveBeenCalledWith('microchipped');
    });
  });

  describe('Checkbox States', () => {
    it('should show unchecked state when false', () => {
      render(
        <TestWrapper>
          <HealthInfoSection {...defaultProps} />
        </TestWrapper>,
      );

      const vaccinatedButton = screen.getByTestID('health-vaccinated');
      expect(vaccinatedButton).toHaveAccessibilityState({ checked: false });
    });

    it('should show checked state when true', () => {
      const checkedHealthInfo = {
        vaccinated: true,
        spayedNeutered: false,
        microchipped: false,
      };

      render(
        <TestWrapper>
          <HealthInfoSection {...defaultProps} healthInfo={checkedHealthInfo} />
        </TestWrapper>,
      );

      const vaccinatedButton = screen.getByTestID('health-vaccinated');
      expect(vaccinatedButton).toHaveAccessibilityState({ checked: true });
    });

    it('should show checkmark icon when checked', () => {
      const checkedHealthInfo = {
        vaccinated: true,
        spayedNeutered: true,
        microchipped: true,
      };

      render(
        <TestWrapper>
          <HealthInfoSection {...defaultProps} healthInfo={checkedHealthInfo} />
        </TestWrapper>,
      );

      // All should be checked
      expect(screen.getByTestID('health-vaccinated')).toHaveAccessibilityState({ checked: true });
      expect(screen.getByTestID('health-spayedNeutered')).toHaveAccessibilityState({ checked: true });
      expect(screen.getByTestID('health-microchipped')).toHaveAccessibilityState({ checked: true });
    });

    it('should handle mixed states', () => {
      const mixedHealthInfo = {
        vaccinated: true,
        spayedNeutered: false,
        microchipped: true,
      };

      render(
        <TestWrapper>
          <HealthInfoSection {...defaultProps} healthInfo={mixedHealthInfo} />
        </TestWrapper>,
      );

      expect(screen.getByTestID('health-vaccinated')).toHaveAccessibilityState({ checked: true });
      expect(screen.getByTestID('health-spayedNeutered')).toHaveAccessibilityState({ checked: false });
      expect(screen.getByTestID('health-microchipped')).toHaveAccessibilityState({ checked: true });
    });
  });

  describe('Accessibility', () => {
    it('should have proper accessibility labels', () => {
      render(
        <TestWrapper>
          <HealthInfoSection {...defaultProps} />
        </TestWrapper>,
      );

      const vaccinatedButton = screen.getByTestID('health-vaccinated');
      expect(vaccinatedButton).toHaveAccessibilityLabel('vaccinated - No');
      expect(vaccinatedButton).toHaveAccessibilityRole('checkbox');
    });

    it('should have correct accessibility label when checked', () => {
      const checkedHealthInfo = {
        vaccinated: true,
        spayedNeutered: false,
        microchipped: false,
      };

      render(
        <TestWrapper>
          <HealthInfoSection {...defaultProps} healthInfo={checkedHealthInfo} />
        </TestWrapper>,
      );

      const vaccinatedButton = screen.getByTestID('health-vaccinated');
      expect(vaccinatedButton).toHaveAccessibilityLabel('vaccinated - Yes');
    });

    it('should have correct accessibility state', () => {
      render(
        <TestWrapper>
          <HealthInfoSection {...defaultProps} />
        </TestWrapper>,
      );

      const allButtons = [
        screen.getByTestID('health-vaccinated'),
        screen.getByTestID('health-spayedNeutered'),
        screen.getByTestID('health-microchipped'),
      ];

      allButtons.forEach((button) => {
        expect(button).toHaveAccessibilityRole('checkbox');
        expect(button).toHaveAccessibilityState({ checked: false });
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle rapid toggles', () => {
      render(
        <TestWrapper>
          <HealthInfoSection {...defaultProps} />
        </TestWrapper>,
      );

      const vaccinatedButton = screen.getByTestID('health-vaccinated');
      fireEvent.press(vaccinatedButton);
      fireEvent.press(vaccinatedButton);
      fireEvent.press(vaccinatedButton);

      expect(defaultProps.onToggleHealth).toHaveBeenCalledTimes(3);
    });

    it('should handle toggling multiple checkboxes', () => {
      render(
        <TestWrapper>
          <HealthInfoSection {...defaultProps} />
        </TestWrapper>,
      );

      fireEvent.press(screen.getByTestID('health-vaccinated'));
      fireEvent.press(screen.getByTestID('health-spayedNeutered'));
      fireEvent.press(screen.getByTestID('health-microchipped'));

      expect(defaultProps.onToggleHealth).toHaveBeenCalledTimes(3);
      expect(defaultProps.onToggleHealth).toHaveBeenCalledWith('vaccinated');
      expect(defaultProps.onToggleHealth).toHaveBeenCalledWith('spayedNeutered');
      expect(defaultProps.onToggleHealth).toHaveBeenCalledWith('microchipped');
    });

    it('should handle all checked state', () => {
      const allChecked = {
        vaccinated: true,
        spayedNeutered: true,
        microchipped: true,
      };

      render(
        <TestWrapper>
          <HealthInfoSection {...defaultProps} healthInfo={allChecked} />
        </TestWrapper>,
      );

      expect(screen.getByTestID('health-vaccinated')).toHaveAccessibilityState({ checked: true });
      expect(screen.getByTestID('health-spayedNeutered')).toHaveAccessibilityState({ checked: true });
      expect(screen.getByTestID('health-microchipped')).toHaveAccessibilityState({ checked: true });
    });
  });
});


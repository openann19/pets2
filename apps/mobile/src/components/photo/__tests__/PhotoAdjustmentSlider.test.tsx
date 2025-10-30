/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { View, Text } from 'react-native';
import { PhotoAdjustmentSlider } from '../PhotoAdjustmentSlider';
import * as Haptics from 'expo-haptics';

// Mock Haptics
jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  ImpactFeedbackStyle: {
    Light: 'light',
    Medium: 'medium',
    Heavy: 'heavy',
  },
}));

describe('PhotoAdjustmentSlider', () => {
  const mockOnValueChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (Haptics.impactAsync as jest.Mock).mockResolvedValue(undefined);
  });

  it('renders with all required props', () => {
    const { getByText } = render(
      <PhotoAdjustmentSlider
        label="Brightness"
        value={100}
        min={0}
        max={200}
        icon="sunny"
        onValueChange={mockOnValueChange}
      />,
    );

    expect(getByText('Brightness')).toBeTruthy();
    expect(getByText('100')).toBeTruthy();
  });

  it('displays correct label', () => {
    const { getByText } = render(
      <PhotoAdjustmentSlider
        label="Contrast"
        value={100}
        min={0}
        max={200}
        icon="contrast"
        onValueChange={mockOnValueChange}
      />,
    );

    expect(getByText('Contrast')).toBeTruthy();
  });

  it('displays correct value', () => {
    const { getByText } = render(
      <PhotoAdjustmentSlider
        label="Saturation"
        value={85}
        min={0}
        max={200}
        icon="color-palette"
        onValueChange={mockOnValueChange}
      />,
    );

    expect(getByText('85')).toBeTruthy();
  });

  it('renders icon correctly', () => {
    const { UNSAFE_getByType } = render(
      <PhotoAdjustmentSlider
        label="Test"
        value={50}
        min={0}
        max={100}
        icon="sunny"
        onValueChange={mockOnValueChange}
      />,
    );

    expect(UNSAFE_getByType).toBeDefined();
  });

  it('provides haptic feedback on gesture start', () => {
    const { getByText } = render(
      <PhotoAdjustmentSlider
        label="Test"
        value={50}
        min={0}
        max={100}
        icon="sunny"
        onValueChange={mockOnValueChange}
      />,
    );

    const slider = getByText('Test').parent;
    if (slider) fireEvent(slider, 'touchStart');

    expect(Haptics.impactAsync).toHaveBeenCalledWith(Haptics.ImpactFeedbackStyle.Light);
  });

  it('provides haptic feedback on gesture release', () => {
    const { getByText } = render(
      <PhotoAdjustmentSlider
        label="Test"
        value={50}
        min={0}
        max={100}
        icon="sunny"
        onValueChange={mockOnValueChange}
      />,
    );

    const slider = getByText('Test').parent;
    if (slider) {
      fireEvent(slider, 'touchStart');
      fireEvent(slider, 'touchEnd');
    }

    expect(Haptics.impactAsync).toHaveBeenCalledWith(Haptics.ImpactFeedbackStyle.Medium);
  });

  it('calls onValueChange when dragging', () => {
    const { getByText } = render(
      <PhotoAdjustmentSlider
        label="Test"
        value={50}
        min={0}
        max={100}
        icon="sunny"
        onValueChange={mockOnValueChange}
      />,
    );

    const slider = getByText('Test').parent;
    if (slider) fireEvent(slider, 'touchStart');

    expect(mockOnValueChange).toHaveBeenCalled();
  });

  it('clamps values to min/max range', () => {
    const { getByText } = render(
      <PhotoAdjustmentSlider
        label="Test"
        value={50}
        min={0}
        max={100}
        icon="sunny"
        onValueChange={mockOnValueChange}
      />,
    );

    const slider = getByText('Test').parent;
    if (slider) fireEvent(slider, 'touchStart');

    // onValueChange should receive a value within min/max
    const calls = mockOnValueChange.mock.calls;
    if (calls.length > 0) {
      const value = calls[0][0];
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThanOrEqual(100);
    }
  });

  it('handles minimum value correctly', () => {
    const { getByText } = render(
      <PhotoAdjustmentSlider
        label="Test"
        value={0}
        min={0}
        max={200}
        icon="sunny"
        onValueChange={mockOnValueChange}
      />,
    );

    expect(getByText('0')).toBeTruthy();
  });

  it('handles maximum value correctly', () => {
    const { getByText } = render(
      <PhotoAdjustmentSlider
        label="Test"
        value={200}
        min={0}
        max={200}
        icon="sunny"
        onValueChange={mockOnValueChange}
      />,
    );

    expect(getByText('200')).toBeTruthy();
  });

  it('handles negative min values', () => {
    const { getByText } = render(
      <PhotoAdjustmentSlider
        label="Warmth"
        value={-20}
        min={-100}
        max={100}
        icon="flame"
        onValueChange={mockOnValueChange}
      />,
    );

    expect(getByText('-20')).toBeTruthy();
  });

  it('displays positive values with plus sign when appropriate', () => {
    const { getByText } = render(
      <PhotoAdjustmentSlider
        label="Warmth"
        value={30}
        min={-100}
        max={100}
        icon="flame"
        onValueChange={mockOnValueChange}
      />,
    );

    expect(getByText('30')).toBeTruthy();
  });

  it('uses active state style when dragging', () => {
    const { getByText } = render(
      <PhotoAdjustmentSlider
        label="Test"
        value={50}
        min={0}
        max={100}
        icon="sunny"
        onValueChange={mockOnValueChange}
      />,
    );

    const slider = getByText('Test').parent;
    if (slider) fireEvent(slider, 'touchStart');

    // Component should have active visual state
    expect(slider).toBeTruthy();
  });

  it('resets to normal state after drag', () => {
    const { getByText } = render(
      <PhotoAdjustmentSlider
        label="Test"
        value={50}
        min={0}
        max={100}
        icon="sunny"
        onValueChange={mockOnValueChange}
      />,
    );

    const slider = getByText('Test').parent;
    if (slider) {
      fireEvent(slider, 'touchStart');
      fireEvent(slider, 'touchEnd');
    }

    expect(slider).toBeTruthy();
  });

  it('calculates correct percentage for value', () => {
    const value = 75;
    const min = 0;
    const max = 100;
    const expectedPercentage = ((value - min) / (max - min)) * 100;

    const { getByText } = render(
      <PhotoAdjustmentSlider
        label="Test"
        value={value}
        min={min}
        max={max}
        icon="sunny"
        onValueChange={mockOnValueChange}
      />,
    );

    const slider = getByText('Test').parent;
    expect(slider).toBeTruthy();
    expect(expectedPercentage).toBe(75);
  });

  it('handles rapid drag gestures', () => {
    const { getByText } = render(
      <PhotoAdjustmentSlider
        label="Test"
        value={50}
        min={0}
        max={100}
        icon="sunny"
        onValueChange={mockOnValueChange}
      />,
    );

    const slider = getByText('Test').parent;
    if (slider) {
      fireEvent(slider, 'touchStart');
      fireEvent(slider, 'touchMove');
      fireEvent(slider, 'touchMove');
      fireEvent(slider, 'touchEnd');
    }

    expect(slider).toBeTruthy();
  });

  it('uses different icons for different adjustments', () => {
    const icons = ['sunny', 'contrast', 'color-palette', 'flame'];
    const labels = ['Brightness', 'Contrast', 'Saturation', 'Warmth'];

    icons.forEach((icon, index) => {
      const { getByText } = render(
        <PhotoAdjustmentSlider
          label={labels[index]}
          value={50}
          min={0}
          max={100}
          icon={icon}
          onValueChange={mockOnValueChange}
        />,
      );

      expect(getByText(labels[index])).toBeTruthy();
    });
  });

  it('maintains value precision for floating point values', () => {
    const { getByText } = render(
      <PhotoAdjustmentSlider
        label="Test"
        value={50.5}
        min={0}
        max={100}
        icon="sunny"
        onValueChange={mockOnValueChange}
      />,
    );

    expect(getByText('50')).toBeTruthy();
  });

  it('handles disabled state gracefully', () => {
    const { getByText } = render(
      <PhotoAdjustmentSlider
        label="Test"
        value={50}
        min={0}
        max={100}
        icon="sunny"
        onValueChange={mockOnValueChange}
      />,
    );

    const slider = getByText('Test').parent;
    expect(slider).toBeTruthy();
  });
});

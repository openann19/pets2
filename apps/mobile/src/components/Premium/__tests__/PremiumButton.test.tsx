import React from 'react';
import {  } from '@testing-library/react-native';
import '@testing-library/jest-native/extend-expect';
import PremiumButton from '../../Premium/PremiumButton';
import {  } from '../../../contexts/ThemeContext';
import * as Haptics from 'expo-haptics';

// Mock dependencies
jest.mock('../../../contexts/ThemeContext');
jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  ImpactFeedbackStyle: {
    Light: 'light',
    Medium: 'medium',
  },
}));

const mockNavigation = {
  navigate: jest.fn(),
};

describe('PremiumButton', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Mock theme context
    (useTheme as jest.Mock).mockReturnValue({
      colors: {
        primary: '#7c3aed',
        secondary: '#ec4899',
        background: '#ffffff',
        text: '#000000',
      },
      isDark: false,
    });
  });

  it('renders correctly with default props', () => {
    const { getByText, getByTestId } = render(
      <PremiumButton navigation={mockNavigation} />
    );

    // Should render premium button with default text
    expect(getByText('Upgrade')).toBeTruthy();
    expect(getByTestId('premium-button')).toBeTruthy();
  });

  it('renders with custom text', () => {
    const { getByText } = render(
      <PremiumButton navigation={mockNavigation} text="Go Premium" />
    );

    // Should render button with custom text
    expect(getByText('Go Premium')).toBeTruthy();
  });

  it('handles press with haptic feedback', () => {
    const { getByTestId } = render(
      <PremiumButton navigation={mockNavigation} />
    );

    // Press the button
    fireEvent.press(getByTestId('premium-button'));

    // Should trigger haptic feedback
    expect(Haptics.impactAsync).toHaveBeenCalledWith(Haptics.ImpactFeedbackStyle.Medium);

    // Should navigate to Premium screen
    expect(mockNavigation.navigate).toHaveBeenCalledWith('Premium');
  });

  it('renders with gradient style in light theme', () => {
    const { getByTestId } = render(
      <PremiumButton navigation={mockNavigation} />
    );

    // Should have gradient style
    const button = getByTestId('premium-button');
    expect(button.props.style).toBeDefined();
  });

  it('renders with dark theme style', () => {
    // Mock dark theme
    (useTheme as jest.Mock).mockReturnValue({
      colors: {
        primary: '#7c3aed',
        secondary: '#ec4899',
        background: '#1f2937',
        text: '#ffffff',
      },
      isDark: true,
    });

    const { getByTestId } = render(
      <PremiumButton navigation={mockNavigation} />
    );

    // Should have dark theme style
    const button = getByTestId('premium-button');
    expect(button.props.style).toBeDefined();
  });

  it('renders with custom size', () => {
    const { getByTestId } = render(
      <PremiumButton navigation={mockNavigation} size="large" />
    );

    // Should have large size style
    const button = getByTestId('premium-button');
    expect(button.props.style).toBeDefined();
    // Additional size-specific assertions could be added here
  });

  it('renders with icon', () => {
    const { getByTestId } = render(
      <PremiumButton navigation={mockNavigation} showIcon />
    );

    // Should render icon
    expect(getByTestId('premium-icon')).toBeTruthy();
  });

  it('applies custom style when provided', () => {
    const customStyle = { marginTop: 20 };
    const { getByTestId } = render(
      <PremiumButton navigation={mockNavigation} style={customStyle} />
    );

    const button = getByTestId('premium-button');
    expect(button.props.style).toBeDefined();
    // Additional style-specific assertions could be added here
  });
});

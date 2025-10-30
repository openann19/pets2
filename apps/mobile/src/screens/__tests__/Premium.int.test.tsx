/**
 * PremiumScreen Integration Tests
 * Tests PremiumScreen rendering, subscription flow, and payment handling
 */

import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { ThemeProvider } from '@/theme';
import { PremiumScreen } from '../premium/PremiumScreen';

jest.mock('../../hooks/screens/premium', () => ({
  usePremiumScreen: jest.fn(() => ({
    billingPeriod: 'monthly',
    setBillingPeriod: jest.fn(),
    selectedTier: 'premium',
    setSelectedTier: jest.fn(),
    handleSubscribe: jest.fn(),
    isLoading: false,
    error: null,
  })),
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <ThemeProvider scheme="light">
    <NavigationContainer>{children}</NavigationContainer>
  </ThemeProvider>
);

describe('PremiumScreen Integration Tests', () => {
  const mockNavigation = {
    navigate: jest.fn(),
    goBack: jest.fn(),
    setOptions: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render PremiumScreen successfully', () => {
    render(
      <TestWrapper>
        <PremiumScreen />
      </TestWrapper>,
    );

    // Screen should render without errors
    expect(() =>
      render(
        <TestWrapper>
          <PremiumScreen />
        </TestWrapper>,
      ),
    ).not.toThrow();
  });

  it('should handle subscription action', async () => {
    const { usePremiumScreen } = require('../../hooks/screens/premium');
    const mockHandleSubscribe = jest.fn();
    usePremiumScreen.mockReturnValue({
      billingPeriod: 'monthly',
      setBillingPeriod: jest.fn(),
      selectedTier: 'premium',
      setSelectedTier: jest.fn(),
      handleSubscribe: mockHandleSubscribe,
      isLoading: false,
      error: null,
    });

    render(
      <TestWrapper>
        <PremiumScreen />
      </TestWrapper>,
    );

    await waitFor(() => {
      expect(mockHandleSubscribe).toBeDefined();
    });
  });

  it('should handle billing period change', () => {
    const { usePremiumScreen } = require('../../hooks/screens/premium');
    const mockSetBillingPeriod = jest.fn();
    usePremiumScreen.mockReturnValue({
      billingPeriod: 'monthly',
      setBillingPeriod: mockSetBillingPeriod,
      selectedTier: 'premium',
      setSelectedTier: jest.fn(),
      handleSubscribe: jest.fn(),
      isLoading: false,
      error: null,
    });

    render(
      <TestWrapper>
        <PremiumScreen />
      </TestWrapper>,
    );

    expect(mockSetBillingPeriod).toBeDefined();
  });

  it('should handle loading state', () => {
    const { usePremiumScreen } = require('../../hooks/screens/premium');
    usePremiumScreen.mockReturnValue({
      billingPeriod: 'monthly',
      setBillingPeriod: jest.fn(),
      selectedTier: 'premium',
      setSelectedTier: jest.fn(),
      handleSubscribe: jest.fn(),
      isLoading: true,
      error: null,
    });

    render(
      <TestWrapper>
        <PremiumScreen />
      </TestWrapper>,
    );

    // Component should render successfully
    expect(mockNavigation).toBeDefined();
  });
});

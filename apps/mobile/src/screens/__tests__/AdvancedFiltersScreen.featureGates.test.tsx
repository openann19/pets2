/**
 * AdvancedFiltersScreen Feature Gates Tests
 * Tests premium gate for Advanced Filters feature
 */

import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import AdvancedFiltersScreen from '../AdvancedFiltersScreen';
import { usePremiumStatus } from '../../hooks/domains/premium/usePremiumStatus';
import { PremiumGate } from '../../components/Premium/PremiumGate';

jest.mock('../../hooks/domains/premium/usePremiumStatus');
jest.mock('../../components/Premium/PremiumGate');
jest.mock('../../hooks/screens/useAdvancedFiltersScreen');
jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');
  RN.Alert.alert = jest.fn();
  return RN;
});

const mockNavigation = {
  goBack: jest.fn(),
  navigate: jest.fn(),
};

const mockUsePremiumStatus = usePremiumStatus as jest.Mock;

describe('AdvancedFiltersScreen - Feature Gates', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    Alert.alert = jest.fn();
  });

  it('should show premium gate for free users', () => {
    mockUsePremiumStatus.mockReturnValue({
      isPremium: false,
      plan: 'free',
    });

    render(<AdvancedFiltersScreen navigation={mockNavigation} />);

    expect(PremiumGate).toHaveBeenCalledWith(
      expect.objectContaining({
        feature: 'Advanced Filters',
        description: 'Unlock advanced matching filters with Premium',
      }),
      {},
    );
  });

  it('should show filters UI for premium users', async () => {
    mockUsePremiumStatus.mockReturnValue({
      isPremium: true,
      plan: 'premium',
    });

    const { getByText } = render(<AdvancedFiltersScreen navigation={mockNavigation} />);

    await waitFor(() => {
      expect(getByText('Save Filters')).toBeTruthy();
    });

    expect(PremiumGate).not.toHaveBeenCalled();
  });

  it('should show alert on mount for free users', () => {
    mockUsePremiumStatus.mockReturnValue({
      isPremium: false,
      plan: 'free',
    });

    render(<AdvancedFiltersScreen navigation={mockNavigation} />);

    expect(Alert.alert).toHaveBeenCalledWith(
      'Premium Feature',
      expect.stringContaining('Advanced Filters are available with PawfectMatch Premium'),
      expect.any(Array),
    );
  });

  it('should navigate to Premium screen from alert', () => {
    mockUsePremiumStatus.mockReturnValue({
      isPremium: false,
      plan: 'free',
    });

    (Alert.alert as jest.Mock).mockImplementation((title, message, buttons) => {
      const upgradeButton = buttons[1];
      if (upgradeButton && upgradeButton.onPress) {
        upgradeButton.onPress();
      }
    });

    render(<AdvancedFiltersScreen navigation={mockNavigation} />);

    expect(mockNavigation.goBack).toHaveBeenCalled();
    expect(mockNavigation.navigate).toHaveBeenCalledWith('Premium');
  });

  it('should allow ultimate users to access filters', async () => {
    mockUsePremiumStatus.mockReturnValue({
      isPremium: true,
      plan: 'ultimate',
    });

    const { getByText } = render(<AdvancedFiltersScreen navigation={mockNavigation} />);

    await waitFor(() => {
      expect(getByText('Save Filters')).toBeTruthy();
    });

    expect(PremiumGate).not.toHaveBeenCalled();
    expect(Alert.alert).not.toHaveBeenCalled();
  });
});


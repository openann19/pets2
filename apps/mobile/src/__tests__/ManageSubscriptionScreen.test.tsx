import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import '@testing-library/jest-native/extend-expect';
import * as Haptics from 'expo-haptics';

import ManageSubscriptionScreen from '../screens/ManageSubscriptionScreen';
import { premiumAPI } from '../services/api';

jest.mock('@pawfectmatch/core');
jest.mock('../services/api', () => ({
  premiumAPI: {
    getCurrentSubscription: jest.fn(),
    cancelSubscription: jest.fn(),
    reactivateSubscription: jest.fn(),
    openBillingPortal: jest.fn(),
  },
}));
jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  ImpactFeedbackStyle: {
    Light: 'light',
    Medium: 'medium',
  },
}));
jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');
jest.mock('react-native/Libraries/Alert/Alert', () => ({
  alert: jest.fn(
    (
      _title?: string,
      _message?: string,
      buttons?: Array<{ onPress?: () => void }>,
    ) => {
      if (buttons && buttons.length > 0) {
        buttons[buttons.length - 1]?.onPress?.();
      }
    },
  ),
}));

const coreMock = jest.requireMock('@pawfectmatch/core') as typeof import('@pawfectmatch/core') & {
  __mockUseAuthStore: jest.Mock;
  __resetMockAuthStore: () => void;
};

const mockedPremiumAPI = premiumAPI as jest.Mocked<typeof premiumAPI>;

const mockNavigation = {
  navigate: jest.fn(),
  goBack: jest.fn(),
};

const mockRoute = {
  key: 'ManageSubscription-route',
  name: 'ManageSubscription',
  params: undefined,
} as const;

describe('ManageSubscriptionScreen', () => {
  const mockUser = {
    id: 'user-123',
    firstName: 'Test',
    lastName: 'User',
    premium: {
      isActive: true,
      plan: 'premium',
    },
  };

  const mockSubscription = {
    id: 'sub-123',
    status: 'active' as const,
    plan: 'premium',
    currentPeriodEnd: '2025-11-01T00:00:00Z',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    coreMock.__resetMockAuthStore();
    coreMock.__mockUseAuthStore.mockReturnValue({
      user: mockUser,
    });
    mockedPremiumAPI.getCurrentSubscription.mockResolvedValue(mockSubscription);
  });

  it('displays subscription details correctly', async () => {
    const { getByText } = render(
      <ManageSubscriptionScreen
        navigation={mockNavigation as any}
        route={mockRoute as any}
      />,
    );

    await waitFor(() => {
      expect(getByText('Manage Subscription')).toBeTruthy();
      expect(getByText('Premium Features')).toBeTruthy();
    });
  });

  it('handles subscription cancellation', async () => {
    mockedPremiumAPI.cancelSubscription.mockResolvedValue(true);

    const { getByText } = render(
      <ManageSubscriptionScreen
        navigation={mockNavigation as any}
        route={mockRoute as any}
      />,
    );

    await waitFor(() => {
      expect(getByText('Cancel Subscription')).toBeTruthy();
    });

    fireEvent.press(getByText('Cancel Subscription'));

    await waitFor(() => {
      expect(mockedPremiumAPI.cancelSubscription).toHaveBeenCalled();
      expect(Haptics.impactAsync).toHaveBeenCalledWith(
        Haptics.ImpactFeedbackStyle.Medium,
      );
    });
  });

  it('displays cancelled status when subscription is set to cancel', async () => {
    mockedPremiumAPI.getCurrentSubscription.mockResolvedValue({
      ...mockSubscription,
      cancelAtPeriodEnd: true,
    });

    const { getByText } = render(
      <ManageSubscriptionScreen
        navigation={mockNavigation as any}
        route={mockRoute as any}
      />,
    );

    await waitFor(() => {
      expect(getByText('Cancels on November 1, 2025')).toBeTruthy();
      expect(getByText('Reactivate Subscription')).toBeTruthy();
    });
  });

  it('handles subscription reactivation', async () => {
    mockedPremiumAPI.getCurrentSubscription.mockResolvedValue({
      ...mockSubscription,
      cancelAtPeriodEnd: true,
    });
    mockedPremiumAPI.reactivateSubscription.mockResolvedValue(true);

    const { getByText } = render(
      <ManageSubscriptionScreen
        navigation={mockNavigation as any}
        route={mockRoute as any}
      />,
    );

    await waitFor(() => {
      expect(getByText('Reactivate Subscription')).toBeTruthy();
    });

    fireEvent.press(getByText('Reactivate Subscription'));

    await waitFor(() => {
      expect(mockedPremiumAPI.reactivateSubscription).toHaveBeenCalled();
      expect(Haptics.impactAsync).toHaveBeenCalledWith(
        Haptics.ImpactFeedbackStyle.Medium,
      );
    });
  });

  it('opens billing portal when update payment is clicked', async () => {
    mockedPremiumAPI.openBillingPortal.mockResolvedValue({
      success: true,
      url: 'https://billing.stripe.com/portal',
    });

    const { getByText } = render(
      <ManageSubscriptionScreen
        navigation={mockNavigation as any}
        route={mockRoute as any}
      />,
    );

    await waitFor(() => {
      expect(getByText('Update Payment Method')).toBeTruthy();
    });

    fireEvent.press(getByText('Update Payment Method'));

    await waitFor(() => {
      expect(mockedPremiumAPI.openBillingPortal).toHaveBeenCalled();
      expect(mockNavigation.navigate).toHaveBeenCalledWith('WebView', {
        url: 'https://billing.stripe.com/portal',
        title: 'Billing Portal',
      });
    });
  });

  it('handles API errors gracefully', async () => {
    mockedPremiumAPI.getCurrentSubscription.mockRejectedValue(
      new Error('Failed to load subscription data'),
    );

    const { getByText } = render(
      <ManageSubscriptionScreen
        navigation={mockNavigation as any}
        route={mockRoute as any}
      />,
    );

    await waitFor(() => {
      expect(getByText('Error loading subscription')).toBeTruthy();
    });
  });
});

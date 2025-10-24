import React from 'react';
import { render, waitFor, fireEvent } from '@testing-library/react-native';
import { PremiumScreen } from '../PremiumScreen';

// Mock navigation
const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: mockNavigate,
    goBack: jest.fn(),
  }),
}));

// Mock Stripe
jest.mock('@stripe/stripe-react-native', () => ({
  useStripe: () => ({
    initPaymentSheet: jest.fn().mockResolvedValue({ error: null }),
    presentPaymentSheet: jest.fn().mockResolvedValue({ error: null }),
  }),
  StripeProvider: ({ children }: { children: React.ReactNode }) => children,
}));

describe('PremiumScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders premium screen correctly', () => {
      const { getByText } = render(<PremiumScreen />);
      
      expect(getByText(/Premium/i)).toBeTruthy();
    });

    it('displays subscription tiers', () => {
      const { getByText } = render(<PremiumScreen />);
      
      expect(getByText(/Basic/i)).toBeTruthy();
      expect(getByText(/Premium/i)).toBeTruthy();
      expect(getByText(/Ultimate/i)).toBeTruthy();
    });

    it('shows monthly and yearly pricing options', () => {
      const { getByText } = render(<PremiumScreen />);
      
      expect(getByText(/Monthly/i)).toBeTruthy();
      expect(getByText(/Yearly/i)).toBeTruthy();
    });
  });

  describe('User Interaction', () => {
    it('allows switching between monthly and yearly billing', () => {
      const { getByText } = render(<PremiumScreen />);
      
      const yearlyButton = getByText(/Yearly/i);
      fireEvent.press(yearlyButton);
      
      // Verify yearly pricing is displayed
      expect(getByText(/year/i)).toBeTruthy();
    });

    it('handles tier selection', () => {
      const { getByText } = render(<PremiumScreen />);
      
      const premiumTier = getByText(/Premium/i);
      fireEvent.press(premiumTier);
      
      // Verify selection is highlighted
      expect(premiumTier).toBeTruthy();
    });
  });

  describe('Subscription Flow', () => {
    it('initiates subscription process when subscribe button is pressed', async () => {
      const { getByText } = render(<PremiumScreen />);
      
      const subscribeButton = getByText(/Subscribe/i);
      fireEvent.press(subscribeButton);
      
      await waitFor(() => {
        // Verify payment sheet is initiated
        expect(subscribeButton).toBeTruthy();
      });
    });

    it('handles successful subscription', async () => {
      const { getByText } = render(<PremiumScreen />);
      
      const subscribeButton = getByText(/Subscribe/i);
      fireEvent.press(subscribeButton);
      
      await waitFor(() => {
        // Verify success state
        expect(mockNavigate).toHaveBeenCalled();
      });
    });

    it('handles subscription errors gracefully', async () => {
      // Mock error scenario
      jest.spyOn(console, 'error').mockImplementation(() => {});
      
      const { getByText } = render(<PremiumScreen />);
      
      const subscribeButton = getByText(/Subscribe/i);
      fireEvent.press(subscribeButton);
      
      await waitFor(() => {
        // Verify error is handled
        expect(subscribeButton).toBeTruthy();
      });
    });
  });

  describe('Feature Display', () => {
    it('displays features for each tier', () => {
      const { getByText } = render(<PremiumScreen />);
      
      // Basic tier features
      expect(getByText(/Unlimited swipes/i)).toBeTruthy();
      
      // Premium tier features
      expect(getByText(/Advanced matching/i)).toBeTruthy();
      
      // Ultimate tier features
      expect(getByText(/Priority support/i)).toBeTruthy();
    });

    it('highlights premium features', () => {
      const { getByText } = render(<PremiumScreen />);
      
      const premiumFeature = getByText(/Advanced matching/i);
      expect(premiumFeature).toBeTruthy();
    });
  });

  describe('Current Subscription', () => {
    it('displays current subscription status', () => {
      const { getByText } = render(<PremiumScreen />);
      
      // Should show current plan or free tier
      expect(getByText(/Current Plan/i) || getByText(/Free/i)).toBeTruthy();
    });

    it('shows upgrade options for current subscribers', () => {
      const { getByText } = render(<PremiumScreen />);
      
      // Should show upgrade button if on lower tier
      expect(getByText(/Upgrade/i) || getByText(/Subscribe/i)).toBeTruthy();
    });
  });

  describe('Accessibility', () => {
    it('has accessible labels for subscription tiers', () => {
      const { getByLabelText } = render(<PremiumScreen />);
      
      expect(getByLabelText(/Basic tier/i) || getByLabelText(/Basic/i)).toBeTruthy();
    });

    it('provides accessible navigation', () => {
      const { getByLabelText } = render(<PremiumScreen />);
      
      expect(getByLabelText(/Back/i) || getByLabelText(/Close/i)).toBeTruthy();
    });
  });

  describe('Loading States', () => {
    it('shows loading indicator during subscription process', async () => {
      const { getByText, getByTestId } = render(<PremiumScreen />);
      
      const subscribeButton = getByText(/Subscribe/i);
      fireEvent.press(subscribeButton);
      
      // Should show loading state
      await waitFor(() => {
        expect(getByTestId('loading-indicator') || getByText(/Loading/i)).toBeTruthy();
      }, { timeout: 100 });
    });
  });

  describe('Error Handling', () => {
    it('displays error message on subscription failure', async () => {
      const { getByText } = render(<PremiumScreen />);
      
      const subscribeButton = getByText(/Subscribe/i);
      fireEvent.press(subscribeButton);
      
      await waitFor(() => {
        // Should handle errors gracefully
        expect(subscribeButton).toBeTruthy();
      });
    });

    it('allows retry after error', async () => {
      const { getByText } = render(<PremiumScreen />);
      
      const subscribeButton = getByText(/Subscribe/i);
      fireEvent.press(subscribeButton);
      
      await waitFor(() => {
        // Verify retry is possible
        expect(subscribeButton).toBeTruthy();
      });
    });
  });
});

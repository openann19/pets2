import React from 'react';
import {} from '@testing-library/react';
import '@testing-library/jest-dom';
import {} from '../SubscriptionManager';
import {} from '../../../services/api';
import {} from '../../../services/logger';
import {} from '../../../stores/auth-store';

// Mock dependencies
jest.mock('../../../services/api');
jest.mock('../../../services/logger');
jest.mock('../../../stores/auth-store');
jest.mock('@stripe/stripe-js', () => ({
  loadStripe: jest.fn(() =>
    Promise.resolve({
      redirectToCheckout: jest.fn(),
    }),
  ),
}));

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: unknown) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: unknown) => <>{children}</>,
}));

const mockUser = {
  id: 'user-123',
  firstName: 'Test',
  lastName: 'User',
  email: 'test@example.com',
  premium: {
    isActive: false,
  },
};

const mockSubscription = {
  id: 'sub-123',
  status: 'active' as const,
  plan: {
    id: 'premium',
    name: 'Premium',
    price: 9.99,
    currency: 'USD',
    interval: 'monthly' as const,
    features: ['Unlimited swipes', 'AI matching'],
    stripePriceId: 'price_premium_monthly',
  },
  currentPeriodEnd: '2025-11-10T00:00:00Z',
  cancelAtPeriodEnd: false,
};

const mockUsageStats = {
  swipesUsed: 3,
  swipesLimit: 5,
  superLikesUsed: 1,
  superLikesLimit: 5,
  likesUsed: 10,
  likesLimit: 50,
  boostsUsed: 0,
  boostsLimit: 1,
  matchRate: 25,
  periodStart: '2025-10-01T00:00:00Z',
  periodEnd: '2025-11-01T00:00:00Z',
};

describe('SubscriptionManager Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useAuthStore as unknown as jest.Mock).mockReturnValue({
      user: mockUser,
    });

    // Mock API responses
    (api.subscription.getCurrentSubscription as jest.Mock).mockResolvedValue({
      success: true,
      data: { subscription: null },
    });

    (api.subscription.getUsageStats as jest.Mock).mockResolvedValue({
      success: true,
      data: mockUsageStats,
    });
  });

  describe('Rendering', () => {
    it('renders the subscription manager header', () => {
      render(<SubscriptionManager />);

      expect(screen.getByText('Unlock Premium Features')).toBeInTheDocument();
      expect(screen.getByText(/Find your pet's perfect match faster/i)).toBeInTheDocument();
    });

    it('renders all pricing plans', async () => {
      render(<SubscriptionManager />);

      await waitFor(() => {
        expect(screen.getByText('Basic')).toBeInTheDocument();
        expect(screen.getByText('Premium')).toBeInTheDocument();
        expect(screen.getByText('Ultimate')).toBeInTheDocument();
      });
    });

    it('displays billing interval toggle', () => {
      render(<SubscriptionManager />);

      expect(screen.getByLabelText('Switch to monthly billing')).toBeInTheDocument();
      expect(screen.getByLabelText('Switch to yearly billing')).toBeInTheDocument();
    });

    it('displays usage stats when available', async () => {
      render(<SubscriptionManager />);

      await waitFor(() => {
        expect(screen.getByText('Daily Swipes')).toBeInTheDocument();
        expect(screen.getByText('Super Likes')).toBeInTheDocument();
        expect(screen.getByText('Profile Boosts')).toBeInTheDocument();
        expect(screen.getByText('Match Rate')).toBeInTheDocument();
      });
    });

    it('shows MOST POPULAR badge on premium plan', () => {
      render(<SubscriptionManager />);

      expect(screen.getByText('MOST POPULAR')).toBeInTheDocument();
    });
  });

  describe('Billing Interval Toggle', () => {
    it('switches to yearly billing when yearly button is clicked', async () => {
      render(<SubscriptionManager />);

      const yearlyButton = screen.getByLabelText('Switch to yearly billing');
      fireEvent.click(yearlyButton);

      await waitFor(() => {
        expect(screen.getAllByText(/Save 25%/i).length).toBeGreaterThan(0);
      });
    });

    it('updates prices when switching billing intervals', async () => {
      render(<SubscriptionManager />);

      // Initially monthly
      await waitFor(() => {
        expect(screen.getByText('$9.99')).toBeInTheDocument();
      });

      // Switch to yearly
      const yearlyButton = screen.getByLabelText('Switch to yearly billing');
      fireEvent.click(yearlyButton);

      await waitFor(() => {
        expect(screen.getByText('$89.99')).toBeInTheDocument();
      });
    });
  });

  describe('Active Subscription', () => {
    beforeEach(() => {
      (api.subscription.getCurrentSubscription as jest.Mock).mockResolvedValue({
        success: true,
        data: { subscription: mockSubscription },
      });
    });

    it('displays active subscription banner', async () => {
      render(<SubscriptionManager />);

      await waitFor(() => {
        expect(screen.getByText('Premium Member')).toBeInTheDocument();
      });
    });

    it('shows next billing date for active subscription', async () => {
      render(<SubscriptionManager />);

      await waitFor(() => {
        expect(screen.getByText(/Next billing date:/i)).toBeInTheDocument();
      });
    });

    it('displays manage billing and cancel buttons', async () => {
      render(<SubscriptionManager />);

      await waitFor(() => {
        expect(screen.getByLabelText('Manage billing')).toBeInTheDocument();
        expect(screen.getByLabelText('Cancel subscription')).toBeInTheDocument();
      });
    });

    it('marks current plan as active', async () => {
      render(<SubscriptionManager />);

      await waitFor(() => {
        const currentPlanButtons = screen.getAllByText('Current Plan');
        expect(currentPlanButtons.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Subscription Actions', () => {
    it('handles subscription checkout', async () => {
      const mockCheckoutResponse = {
        success: true,
        data: {
          url: 'https://checkout.stripe.com/session-123',
        },
      };

      (api.subscription.createCheckoutSession as jest.Mock).mockResolvedValue(mockCheckoutResponse);

      // Mock window.location.href
      delete (window as unknown).location;
      window.location = { href: '' } as unknown;

      render(<SubscriptionManager />);

      await waitFor(() => {
        const premiumButtons = screen.getAllByText(/Get Premium/i);
        fireEvent.click(premiumButtons[0]);
      });

      await waitFor(() => {
        expect(api.subscription.createCheckoutSession).toHaveBeenCalledWith(
          expect.objectContaining({
            priceId: expect.any(String),
          }),
        );
      });
    });

    it('does not trigger checkout for basic plan', async () => {
      render(<SubscriptionManager />);

      await waitFor(() => {
        const basicButton = screen.getByRole('button', { name: /Subscribe to Basic plan/i });
        fireEvent.click(basicButton);
      });

      expect(api.subscription.createCheckoutSession).not.toHaveBeenCalled();
    });

    it('handles subscription cancellation', async () => {
      (api.subscription.getCurrentSubscription as jest.Mock).mockResolvedValue({
        success: true,
        data: { subscription: mockSubscription },
      });

      (api.subscription.cancelSubscription as jest.Mock).mockResolvedValue({
        success: true,
      });

      render(<SubscriptionManager />);

      await waitFor(() => {
        const cancelButton = screen.getByLabelText('Cancel subscription');
        fireEvent.click(cancelButton);
      });

      await waitFor(() => {
        expect(api.subscription.cancelSubscription).toHaveBeenCalledWith('sub-123');
      });
    });

    it('handles subscription reactivation', async () => {
      const canceledSubscription = {
        ...mockSubscription,
        cancelAtPeriodEnd: true,
      };

      (api.subscription.getCurrentSubscription as jest.Mock).mockResolvedValue({
        success: true,
        data: { subscription: canceledSubscription },
      });

      (api.subscription.reactivateSubscription as jest.Mock).mockResolvedValue({
        success: true,
      });

      render(<SubscriptionManager />);

      await waitFor(() => {
        const reactivateButton = screen.getByLabelText('Reactivate subscription');
        fireEvent.click(reactivateButton);
      });

      await waitFor(() => {
        expect(api.subscription.reactivateSubscription).toHaveBeenCalledWith('sub-123');
      });
    });
  });

  describe('Error Handling', () => {
    it('handles API errors when loading subscription', async () => {
      (api.subscription.getCurrentSubscription as jest.Mock).mockRejectedValue(
        new Error('API Error'),
      );

      render(<SubscriptionManager />);

      await waitFor(() => {
        expect(logger.error).toHaveBeenCalledWith(
          'Failed to load subscription',
          expect.any(Object),
        );
      });
    });

    it('handles API errors when loading usage stats', async () => {
      (api.subscription.getUsageStats as jest.Mock).mockRejectedValue(new Error('API Error'));

      render(<SubscriptionManager />);

      await waitFor(() => {
        expect(logger.error).toHaveBeenCalledWith('Failed to load usage stats', expect.any(Object));
      });
    });

    it('handles checkout errors gracefully', async () => {
      (api.subscription.createCheckoutSession as jest.Mock).mockRejectedValue(
        new Error('Checkout Error'),
      );

      render(<SubscriptionManager />);

      await waitFor(() => {
        const premiumButtons = screen.getAllByText(/Get Premium/i);
        fireEvent.click(premiumButtons[0]);
      });

      await waitFor(() => {
        expect(logger.error).toHaveBeenCalledWith('Subscription failed', expect.any(Object));
      });
    });
  });

  describe('Loading States', () => {
    it('disables buttons during processing', async () => {
      (api.subscription.createCheckoutSession as jest.Mock).mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 1000)),
      );

      render(<SubscriptionManager />);

      await waitFor(() => {
        const premiumButtons = screen.getAllByText(/Get Premium/i);
        fireEvent.click(premiumButtons[0]);
      });

      const processingButton = screen.getByText(/Processing/i);
      expect(processingButton).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA labels for interactive elements', async () => {
      render(<SubscriptionManager />);

      await waitFor(() => {
        expect(screen.getByLabelText('Switch to monthly billing')).toBeInTheDocument();
        expect(screen.getByLabelText('Switch to yearly billing')).toBeInTheDocument();
      });
    });

    it('has proper role for success modal', async () => {
      render(<SubscriptionManager />);

      // Note: Success modal would need to be triggered in actual implementation
      // This is a placeholder for when the modal state is exposed
    });

    it('displays plan features in an accessible list', async () => {
      render(<SubscriptionManager />);

      await waitFor(() => {
        const premiumFeatures = screen.getByText('✨ Unlimited swipes');
        expect(premiumFeatures).toBeInTheDocument();
      });
    });
  });

  describe('Usage Statistics', () => {
    it('displays usage progress bars', async () => {
      render(<SubscriptionManager />);

      await waitFor(() => {
        expect(screen.getByText('3')).toBeInTheDocument(); // swipesUsed
        expect(screen.getByText('1')).toBeInTheDocument(); // superLikesUsed
      });
    });

    it('shows match rate percentage', async () => {
      render(<SubscriptionManager />);

      await waitFor(() => {
        expect(screen.getByText('25%')).toBeInTheDocument();
      });
    });

    it('displays upgrade message for non-premium users', async () => {
      render(<SubscriptionManager />);

      await waitFor(() => {
        expect(screen.getByText('Upgrade for better rates')).toBeInTheDocument();
      });
    });
  });

  describe('Feature Comparison', () => {
    it('displays why upgrade section', () => {
      render(<SubscriptionManager />);

      expect(screen.getByText('Why Upgrade?')).toBeInTheDocument();
      expect(screen.getByText('AI-Powered Matching')).toBeInTheDocument();
      expect(screen.getByText('3x More Matches')).toBeInTheDocument();
      expect(screen.getByText('Priority Support')).toBeInTheDocument();
    });
  });
});

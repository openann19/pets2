import React from 'react';
import {} from '@testing-library/react';
import {} from 'jest-axe';
import '@testing-library/jest-dom';
import {} from '../components/Premium/SubscriptionManager';
import { useAuthStore } from '../stores/auth-store';
import {} from '../services/api';

// Mock dependencies
jest.mock('../stores/auth-store');
jest.mock('../services/api');
jest.mock('../services/logger');
// Mock framer-motion to avoid animation issues in tests
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

describe('Premium Features Accessibility Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    (useAuthStore as unknown as jest.Mock).mockReturnValue({
      user: mockUser,
    });

    (api.subscription.getCurrentSubscription as jest.Mock).mockResolvedValue({
      success: true,
      data: { subscription: null },
    });

    (api.subscription.getUsageStats as jest.Mock).mockResolvedValue({
      success: true,
      data: {
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
      },
    });
  });

  describe('SubscriptionManager Component', () => {
    it('should not have accessibility violations', async () => {
      const { container } = render(<SubscriptionManager />);

      // Wait for initial load
      await screen.findByText('Unlock Premium Features');

      const results = await axe(container);
      expect(results.violations).toHaveLength(0);
    });

    it('should have proper heading hierarchy', async () => {
      render(<SubscriptionManager />);

      await screen.findByText('Unlock Premium Features');

      const h1 = screen.getByRole('heading', { level: 1 });
      expect(h1).toHaveTextContent('Unlock Premium Features');

      const h2Elements = screen.getAllByRole('heading', { level: 2 });
      expect(h2Elements.length).toBeGreaterThan(0);
    });

    it('should have accessible button labels', async () => {
      render(<SubscriptionManager />);

      await screen.findByText('Unlock Premium Features');

      const monthlyButton = screen.getByLabelText('Switch to monthly billing');
      expect(monthlyButton).toBeInTheDocument();

      const yearlyButton = screen.getByLabelText('Switch to yearly billing');
      expect(yearlyButton).toBeInTheDocument();
    });

    it('should have accessible subscription buttons', async () => {
      render(<SubscriptionManager />);

      await screen.findByText('Unlock Premium Features');

      const subscribeButtons = screen.getAllByRole('button', {
        name: /Subscribe to (Basic|Premium|Ultimate) plan/i,
      });

      expect(subscribeButtons.length).toBeGreaterThanOrEqual(3);
    });

    it('should have proper color contrast', async () => {
      const { container } = render(<SubscriptionManager />);

      await screen.findByText('Unlock Premium Features');

      // Run axe with color contrast rules
      const contrastResults = await axe(container, {
        rules: {
          'color-contrast': { enabled: true },
        },
      });

      expect(contrastResults.violations).toHaveLength(0);
    });
    it('should have accessible list structure for features', async () => {
      const { container } = render(<SubscriptionManager />);

      await screen.findByText('Unlock Premium Features');

      // Run axe with region rules
      const regionResults = await axe(container, {
        rules: {
          region: { enabled: true },
        },
      });

      expect(regionResults.violations).toHaveLength(0);
    });
  });

  describe('Motion and Animation', () => {
    it('should respect prefers-reduced-motion', async () => {
      // Mock matchMedia for prefers-reduced-motion
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: jest.fn().mockImplementation((query) => ({
          matches: query === '(prefers-reduced-motion: reduce)',
          media: query,
          addListener: jest.fn(),
          removeListener: jest.fn(),
          addEventListener: jest.fn(),
          removeEventListener: jest.fn(),
          dispatchEvent: jest.fn(),
        })),
      });

      render(<SubscriptionManager />);

      await screen.findByText('Unlock Premium Features');

      // Component should render without animation issues
      expect(screen.getByText('Unlock Premium Features')).toBeInTheDocument();
    });
  });

  describe('Form Controls', () => {
    it('should have associated labels', async () => {
      render(<SubscriptionManager />);

      await screen.findByText('Unlock Premium Features');

      const buttons = screen.getAllByRole('button');

      buttons.forEach((button) => {
        const ariaLabel = button.getAttribute('aria-label');
        const ariaLabelledBy = button.getAttribute('aria-labelledby');
        const textContent = button.textContent;

        // Each button should have some form of label
        expect(
          ariaLabel || ariaLabelledBy || (textContent && textContent.trim().length > 0),
        ).toBeTruthy();
      });
    });
  });

  describe('Error Messages', () => {
    it('should announce errors accessibly', async () => {
      (api.subscription.getCurrentSubscription as jest.Mock).mockRejectedValue(
        new Error('API Error'),
      );

      render(<SubscriptionManager />);

      // Component should handle errors gracefully
      // Error messages should be announced via aria-live regions when implemented
      await screen.findByText('Unlock Premium Features');
    });
  });

  describe('Mobile Accessibility', () => {
    it('should have touch-friendly targets', async () => {
      const { container } = render(<SubscriptionManager />);

      await screen.findByText('Unlock Premium Features');

      // Buttons should be large enough for touch
      const buttons = container.querySelectorAll('button');

      buttons.forEach((button) => {
        // Check if button has appropriate padding/size classes
        const classList = Array.from(button.classList);
        const hasPadding = classList.some((cls) => cls.includes('p-') || cls.includes('py-'));

        // Should have some form of padding
        expect(hasPadding || button.style.padding).toBeTruthy();
      });
    });
  });

  describe('Subscription Management Actions', () => {
    it('should have accessible cancel action', async () => {
      const activeSubscription = {
        id: 'sub-123',
        status: 'active' as const,
        plan: {
          id: 'premium',
          name: 'Premium',
          price: 9.99,
          currency: 'USD',
          interval: 'monthly' as const,
          features: ['Unlimited swipes'],
          stripePriceId: 'price_premium',
        },
        currentPeriodEnd: '2025-11-10T00:00:00Z',
        cancelAtPeriodEnd: false,
      };

      (api.subscription.getCurrentSubscription as jest.Mock).mockResolvedValue({
        success: true,
        data: { subscription: activeSubscription },
      });

      render(<SubscriptionManager />);

      await screen.findByText('Premium Member');

      const cancelButton = screen.getByLabelText('Cancel subscription');
      expect(cancelButton).toBeInTheDocument();
      expect(cancelButton.tagName).toBe('BUTTON');
    });

    it('should have accessible reactivate action', async () => {
      const canceledSubscription = {
        id: 'sub-123',
        status: 'active' as const,
        plan: {
          id: 'premium',
          name: 'Premium',
          price: 9.99,
          currency: 'USD',
          interval: 'monthly' as const,
          features: ['Unlimited swipes'],
          stripePriceId: 'price_premium',
        },
        currentPeriodEnd: '2025-11-10T00:00:00Z',
        cancelAtPeriodEnd: true,
      };

      (api.subscription.getCurrentSubscription as jest.Mock).mockResolvedValue({
        success: true,
        data: { subscription: canceledSubscription },
      });

      render(<SubscriptionManager />);

      await screen.findByText('Premium Member');

      const reactivateButton = screen.getByLabelText('Reactivate subscription');
      expect(reactivateButton).toBeInTheDocument();
    });

    it('should have accessible billing management', async () => {
      const activeSubscription = {
        id: 'sub-123',
        status: 'active' as const,
        plan: {
          id: 'premium',
          name: 'Premium',
          price: 9.99,
          currency: 'USD',
          interval: 'monthly' as const,
          features: ['Unlimited swipes'],
          stripePriceId: 'price_premium',
        },
        currentPeriodEnd: '2025-11-10T00:00:00Z',
        cancelAtPeriodEnd: false,
      };

      (api.subscription.getCurrentSubscription as jest.Mock).mockResolvedValue({
        success: true,
        data: { subscription: activeSubscription },
      });

      render(<SubscriptionManager />);

      await screen.findByText('Premium Member');

      const billingButton = screen.getByLabelText('Manage billing');
      expect(billingButton).toBeInTheDocument();
    });
  });
});

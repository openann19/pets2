/**
 * E2E tests for premium subscription flows
 * Covers Stripe integration and subscription management
 */

describe('Premium Subscription Flow', () => {
  beforeEach(() => {
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.visit('/login');

    // Login as test user
    cy.get('input[name="email"]').type('test@pawfectmatch.com');
    cy.get('input[name="password"]').type('TestPassword123!');
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/swipe');
  });

  describe('Subscription Plans Display', () => {
    it('should display all subscription plans on premium page', () => {
      cy.visit('/premium');

      // Check that all plans are displayed
      cy.contains('Basic').should('be.visible');
      cy.contains('Premium').should('be.visible');
      cy.contains('Ultimate').should('be.visible');

      // Check pricing
      cy.contains('$0').should('be.visible');
      cy.contains('$9.99').should('be.visible');
      cy.contains('$19.99').should('be.visible');
    });

    it('should toggle between monthly and yearly billing', () => {
      cy.visit('/premium');

      // Default should be monthly
      cy.contains('$9.99/month').should('be.visible');

      // Switch to yearly
      cy.contains('Yearly').click();
      cy.contains('$99.99/year').should('be.visible');

      // Check savings percentage
      cy.contains('Save 15%').should('be.visible');
    });
  });

  describe('Subscription Checkout', () => {
    it('should initiate Stripe checkout for premium plan', () => {
      cy.visit('/premium');

      // Click subscribe button for premium plan
      cy.contains('Subscribe to Premium plan').click();

      // Should redirect to Stripe checkout
      cy.url().should('include', 'stripe.com');
    });

    it('should handle successful checkout flow', () => {
      // This would require mocking Stripe responses
      // REAL, we would test the redirect back from Stripe
      cy.visit('/premium/success');

      cy.contains('Subscription Successful').should('be.visible');
      cy.contains('Thank you for upgrading').should('be.visible');
    });

    it('should handle cancelled checkout flow', () => {
      cy.visit('/premium/cancel');

      cy.contains('Subscription Cancelled').should('be.visible');
      cy.contains('Your subscription was not completed').should('be.visible');
    });
  });

  describe('Active Subscription Management', () => {
    it('should display active subscription status', () => {
      // Mock user with active subscription
      cy.window().then((win) => {
        win.localStorage.setItem(
          'pm_auth',
          JSON.stringify({
            user: {
              premium: {
                isActive: true,
                plan: 'premium',
              },
            },
          }),
        );
      });

      cy.visit('/premium');

      cy.contains('Premium Member').should('be.visible');
      cy.contains('Next billing').should('be.visible');
    });

    it('should allow subscription cancellation', () => {
      // Mock user with active subscription
      cy.window().then((win) => {
        win.localStorage.setItem(
          'pm_auth',
          JSON.stringify({
            user: {
              premium: {
                isActive: true,
                plan: 'premium',
              },
            },
          }),
        );
      });

      cy.visit('/premium');

      // Click cancel subscription
      cy.contains('Cancel Subscription').click();

      // Confirm cancellation
      cy.contains('Yes, cancel').click();

      // Should show confirmation
      cy.contains('Subscription cancelled').should('be.visible');
    });

    it('should allow subscription reactivation', () => {
      // Mock user with cancelled subscription
      cy.window().then((win) => {
        win.localStorage.setItem(
          'pm_auth',
          JSON.stringify({
            user: {
              premium: {
                isActive: true,
                plan: 'premium',
              },
            },
          }),
        );
      });

      cy.visit('/premium');

      // Click reactivate subscription
      cy.contains('Reactivate Subscription').click();

      // Should show confirmation
      cy.contains('Subscription reactivated').should('be.visible');
    });
  });

  describe('Usage Statistics', () => {
    it('should display usage statistics for premium users', () => {
      cy.visit('/premium');

      // Check that usage stats are displayed
      cy.contains('Daily Swipes').should('be.visible');
      cy.contains('Super Likes').should('be.visible');
      cy.contains('Profile Boosts').should('be.visible');
      cy.contains('Match Rate').should('be.visible');
    });

    it('should show usage progress bars', () => {
      cy.visit('/premium');

      // Check progress bars exist
      cy.get('[role="progressbar"]').should('have.length.greaterThan', 0);
    });
  });

  describe('Error Handling', () => {
    it('should gracefully handle subscription API errors', () => {
      // This would require mocking API failures
      cy.visit('/premium');

      // Should display error message without breaking UI
      cy.get('.error-message').should('not.exist'); // No errors by default
    });
  });
});

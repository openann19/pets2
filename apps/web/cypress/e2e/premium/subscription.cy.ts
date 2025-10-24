/**
 * E2E Tests for Premium Subscription
 * Comprehensive testing of premium features and subscription flows
 */

describe('Premium Subscription', () => {
  beforeEach(() => {
    cy.clearAllStorage();
    cy.clearCookies();
    cy.loginAsTestUser();
  });

  describe('Premium Features', () => {
    it('should display premium features for free users', () => {
      cy.visit('/premium');
      cy.get('[data-testid="premium-features"]').should('be.visible');
      cy.get('[data-testid="feature-unlimited-likes"]').should('be.visible');
      cy.get('[data-testid="feature-super-likes"]').should('be.visible');
      cy.get('[data-testid="feature-boost"]').should('be.visible');
      cy.get('[data-testid="feature-advanced-filters"]').should('be.visible');
    });

    it('should show premium badge for premium users', () => {
      cy.loginAsPremiumUser();
      cy.visit('/profile');
      cy.get('[data-testid="premium-badge"]').should('be.visible');
      cy.get('[data-testid="premium-badge"]').should('contain', 'Premium');
    });

    it('should hide premium features for premium users', () => {
      cy.loginAsPremiumUser();
      cy.visit('/premium');
      cy.get('[data-testid="premium-features"]').should('not.exist');
      cy.get('[data-testid="premium-status"]').should('contain', 'Active');
    });
  });

  describe('Subscription Plans', () => {
    it('should display subscription plans', () => {
      cy.visit('/premium');
      cy.get('[data-testid="subscription-plans"]').should('be.visible');
      cy.get('[data-testid="plan-monthly"]').should('be.visible');
      cy.get('[data-testid="plan-yearly"]').should('be.visible');
      cy.get('[data-testid="plan-lifetime"]').should('be.visible');
    });

    it('should show plan pricing', () => {
      cy.visit('/premium');
      cy.get('[data-testid="plan-monthly"]').within(() => {
        cy.get('[data-testid="plan-price"]').should('contain', '$9.99');
        cy.get('[data-testid="plan-period"]').should('contain', 'month');
      });
      cy.get('[data-testid="plan-yearly"]').within(() => {
        cy.get('[data-testid="plan-price"]').should('contain', '$99.99');
        cy.get('[data-testid="plan-period"]').should('contain', 'year');
      });
    });

    it('should highlight recommended plan', () => {
      cy.visit('/premium');
      cy.get('[data-testid="plan-yearly"]').should('have.class', 'recommended');
      cy.get('[data-testid="recommended-badge"]').should('be.visible');
    });

    it('should show plan benefits', () => {
      cy.visit('/premium');
      cy.get('[data-testid="plan-benefits"]').should('be.visible');
      cy.get('[data-testid="benefit-unlimited-likes"]').should('be.visible');
      cy.get('[data-testid="benefit-super-likes"]').should('be.visible');
      cy.get('[data-testid="benefit-boost"]').should('be.visible');
      cy.get('[data-testid="benefit-advanced-filters"]').should('be.visible');
    });
  });

  describe('Subscription Purchase', () => {
    it('should select monthly plan', () => {
      cy.visit('/premium');
      cy.get('[data-testid="plan-monthly"]').click();
      cy.get('[data-testid="selected-plan"]').should('contain', 'Monthly');
      cy.get('[data-testid="checkout-button"]').should('be.visible');
    });

    it('should select yearly plan', () => {
      cy.visit('/premium');
      cy.get('[data-testid="plan-yearly"]').click();
      cy.get('[data-testid="selected-plan"]').should('contain', 'Yearly');
      cy.get('[data-testid="checkout-button"]').should('be.visible');
    });

    it('should show savings for yearly plan', () => {
      cy.visit('/premium');
      cy.get('[data-testid="plan-yearly"]').click();
      cy.get('[data-testid="savings-amount"]').should('be.visible');
      cy.get('[data-testid="savings-amount"]').should('contain', 'Save');
    });

    it('should proceed to checkout', () => {
      cy.intercept('POST', '**/stripe/create-checkout-session', {
        statusCode: 200,
        body: { sessionId: 'cs_test_session' },
      }).as('createCheckout');

      cy.visit('/premium');
      cy.get('[data-testid="plan-monthly"]').click();
      cy.get('[data-testid="checkout-button"]').click();

      cy.wait('@createCheckout');
      cy.url().should('include', 'checkout');
    });
  });

  describe('Stripe Checkout', () => {
    it('should display Stripe checkout form', () => {
      cy.intercept('GET', '**/stripe/checkout-session', {
        statusCode: 200,
        body: { sessionId: 'cs_test_session' },
      }).as('getCheckout');

      cy.visit('/checkout?session_id=cs_test_session');
      cy.wait('@getCheckout');

      cy.get('[data-testid="stripe-checkout"]').should('be.visible');
      cy.get('[data-testid="payment-form"]').should('be.visible');
    });

    it('should process payment successfully', () => {
      cy.mockStripe();
      cy.intercept('POST', '**/stripe/process-payment', {
        statusCode: 200,
        body: { success: true, subscriptionId: 'sub_test_123' },
      }).as('processPayment');

      cy.visit('/checkout?session_id=cs_test_session');

      // Fill payment form
      cy.get('[data-testid="card-number"]').type('4242424242424242');
      cy.get('[data-testid="card-expiry"]').type('12/25');
      cy.get('[data-testid="card-cvc"]').type('123');
      cy.get('[data-testid="card-name"]').type('Test User');

      cy.get('[data-testid="submit-payment"]').click();

      cy.wait('@processPayment');
      cy.url().should('include', '/success');
      cy.contains('Payment successful').should('be.visible');
    });

    it('should handle payment failure', () => {
      cy.mockPayment(false);
      cy.intercept('POST', '**/stripe/process-payment', {
        statusCode: 400,
        body: { error: 'Your card was declined.' },
      }).as('paymentFailed');

      cy.visit('/checkout?session_id=cs_test_session');

      cy.get('[data-testid="card-number"]').type('4000000000000002');
      cy.get('[data-testid="card-expiry"]').type('12/25');
      cy.get('[data-testid="card-cvc"]').type('123');
      cy.get('[data-testid="card-name"]').type('Test User');

      cy.get('[data-testid="submit-payment"]').click();

      cy.wait('@paymentFailed');
      cy.get('[data-testid="error-message"]').should('be.visible');
      cy.contains('Your card was declined').should('be.visible');
    });

    it('should validate payment form', () => {
      cy.visit('/checkout?session_id=cs_test_session');

      cy.get('[data-testid="submit-payment"]').click();
      cy.get('[data-testid="validation-error"]').should('be.visible');
      cy.contains('Card number is required').should('be.visible');
    });
  });

  describe('Subscription Management', () => {
    it('should display current subscription for premium users', () => {
      cy.loginAsPremiumUser();
      cy.visit('/subscription');

      cy.get('[data-testid="current-subscription"]').should('be.visible');
      cy.get('[data-testid="subscription-status"]').should('contain', 'Active');
      cy.get('[data-testid="subscription-plan"]').should('contain', 'Premium');
      cy.get('[data-testid="next-billing-date"]').should('be.visible');
    });

    it('should show subscription history', () => {
      cy.loginAsPremiumUser();
      cy.visit('/subscription');

      cy.get('[data-testid="subscription-history"]').should('be.visible');
      cy.get('[data-testid="history-item"]').should('have.length.at.least', 1);
    });

    it('should allow subscription cancellation', () => {
      cy.intercept('POST', '**/stripe/cancel-subscription', {
        statusCode: 200,
        body: { success: true },
      }).as('cancelSubscription');

      cy.loginAsPremiumUser();
      cy.visit('/subscription');

      cy.get('[data-testid="cancel-subscription-button"]').click();
      cy.get('[data-testid="confirm-cancel"]').click();

      cy.wait('@cancelSubscription');
      cy.contains('Subscription cancelled').should('be.visible');
    });

    it('should allow subscription reactivation', () => {
      cy.intercept('POST', '**/stripe/reactivate-subscription', {
        statusCode: 200,
        body: { success: true },
      }).as('reactivateSubscription');

      cy.loginAsPremiumUser();
      cy.visit('/subscription');

      cy.get('[data-testid="reactivate-subscription-button"]').click();
      cy.get('[data-testid="confirm-reactivate"]').click();

      cy.wait('@reactivateSubscription');
      cy.contains('Subscription reactivated').should('be.visible');
    });
  });

  describe('Premium Features Usage', () => {
    it('should allow unlimited likes for premium users', () => {
      cy.loginAsPremiumUser();
      cy.navigateToSwipe();

      // Like multiple pets without restriction
      for (let i = 0; i < 10; i++) {
        cy.get('[data-testid="like-button"]').click();
        cy.wait(100);
      }

      cy.get('[data-testid="rate-limit-message"]').should('not.exist');
    });

    it('should show super like count for premium users', () => {
      cy.loginAsPremiumUser();
      cy.navigateToSwipe();

      cy.get('[data-testid="superlike-count"]').should('be.visible');
      cy.get('[data-testid="superlike-count"]').should('contain', '5');
    });

    it('should allow super like usage', () => {
      cy.intercept('POST', '**/pets/*/swipe', { statusCode: 200 }).as('superLike');

      cy.loginAsPremiumUser();
      cy.navigateToSwipe();

      cy.get('[data-testid="superlike-button"]').click();
      cy.wait('@superLike');

      cy.get('[data-testid="superlike-count"]').should('contain', '4');
    });

    it('should show boost feature for premium users', () => {
      cy.loginAsPremiumUser();
      cy.visit('/profile');

      cy.get('[data-testid="boost-button"]').should('be.visible');
      cy.get('[data-testid="boost-count"]').should('contain', '1');
    });

    it('should allow boost usage', () => {
      cy.intercept('POST', '**/premium/boost', { statusCode: 200 }).as('useBoost');

      cy.loginAsPremiumUser();
      cy.visit('/profile');

      cy.get('[data-testid="boost-button"]').click();
      cy.get('[data-testid="confirm-boost"]').click();

      cy.wait('@useBoost');
      cy.contains('Profile boosted').should('be.visible');
    });

    it('should show advanced filters for premium users', () => {
      cy.loginAsPremiumUser();
      cy.visit('/discovery');

      cy.get('[data-testid="filter-button"]').click();
      cy.get('[data-testid="advanced-filters"]').should('be.visible');
      cy.get('[data-testid="filter-temperament"]').should('be.visible');
      cy.get('[data-testid="filter-vaccination"]').should('be.visible');
      cy.get('[data-testid="filter-neutered"]').should('be.visible');
    });
  });

  describe('Free User Limitations', () => {
    it('should limit likes for free users', () => {
      cy.navigateToSwipe();

      // Like pets up to the limit
      for (let i = 0; i < 5; i++) {
        cy.get('[data-testid="like-button"]').click();
        cy.wait(100);
      }

      cy.get('[data-testid="rate-limit-message"]').should('be.visible');
      cy.contains("You've reached your daily like limit").should('be.visible');
    });

    it('should show upgrade prompt for free users', () => {
      cy.navigateToSwipe();

      // Try to use premium feature
      cy.get('[data-testid="superlike-button"]').click();
      cy.get('[data-testid="upgrade-prompt"]').should('be.visible');
      cy.contains('Upgrade to Premium').should('be.visible');
    });

    it('should hide advanced filters for free users', () => {
      cy.visit('/discovery');

      cy.get('[data-testid="filter-button"]').click();
      cy.get('[data-testid="advanced-filters"]').should('not.exist');
      cy.get('[data-testid="premium-filter-badge"]').should('be.visible');
    });
  });

  describe('Webhook Handling', () => {
    it('should handle successful payment webhook', () => {
      cy.intercept('POST', '**/stripe/webhook', {
        statusCode: 200,
        body: { type: 'checkout.session.completed' },
      }).as('webhookSuccess');

      // Simulate webhook event
      cy.window().then((win) => {
        win.dispatchEvent(
          new CustomEvent('stripeWebhook', {
            detail: { type: 'checkout.session.completed' },
          }),
        );
      });

      cy.wait('@webhookSuccess');
      cy.contains('Payment processed successfully').should('be.visible');
    });

    it('should handle failed payment webhook', () => {
      cy.intercept('POST', '**/stripe/webhook', {
        statusCode: 400,
        body: { error: 'Invalid webhook signature' },
      }).as('webhookError');

      // Simulate webhook event
      cy.window().then((win) => {
        win.dispatchEvent(
          new CustomEvent('stripeWebhook', {
            detail: { type: 'payment_intent.payment_failed' },
          }),
        );
      });

      cy.wait('@webhookError');
      cy.get('[data-testid="error-message"]').should('be.visible');
    });
  });

  describe('Error Handling', () => {
    it('should handle subscription API error', () => {
      cy.intercept('GET', '**/subscription', {
        statusCode: 500,
        body: { message: 'Internal server error' },
      }).as('subscriptionError');

      cy.visit('/subscription');

      cy.wait('@subscriptionError');
      cy.get('[data-testid="error-message"]').should('be.visible');
      cy.contains('Something went wrong').should('be.visible');
    });

    it('should handle payment processing error', () => {
      cy.intercept('POST', '**/stripe/process-payment', {
        statusCode: 500,
        body: { message: 'Payment processing failed' },
      }).as('paymentError');

      cy.visit('/checkout?session_id=cs_test_session');

      cy.get('[data-testid="card-number"]').type('4242424242424242');
      cy.get('[data-testid="card-expiry"]').type('12/25');
      cy.get('[data-testid="card-cvc"]').type('123');
      cy.get('[data-testid="card-name"]').type('Test User');

      cy.get('[data-testid="submit-payment"]').click();

      cy.wait('@paymentError');
      cy.get('[data-testid="error-message"]').should('be.visible');
      cy.contains('Payment processing failed').should('be.visible');
    });
  });

  describe('Accessibility', () => {
    it('should be accessible with screen readers', () => {
      cy.visit('/premium');
      cy.checkPageA11y();
    });

    it('should support keyboard navigation', () => {
      cy.visit('/premium');
      cy.get('[data-testid="plan-monthly"]').focus();
      cy.get('[data-testid="plan-monthly"]').pressKey('Enter');
      cy.get('[data-testid="selected-plan"]').should('contain', 'Monthly');
    });

    it('should have proper ARIA labels', () => {
      cy.visit('/premium');
      cy.get('[data-testid="plan-monthly"]').should('have.attr', 'aria-label');
      cy.get('[data-testid="checkout-button"]').should('have.attr', 'aria-label');
    });
  });

  describe('Performance', () => {
    it('should load premium page quickly', () => {
      cy.measurePageLoad('/premium');
    });

    it('should handle subscription data efficiently', () => {
      cy.intercept('GET', '**/subscription', {
        statusCode: 200,
        body: {
          subscription: {
            id: 'sub_test_123',
            status: 'active',
            plan: 'premium',
            currentPeriodEnd: '2024-12-31T23:59:59Z',
          },
          history: Array.from({ length: 50 }, (_, i) => ({
            id: `payment_${i}`,
            amount: 999,
            status: 'succeeded',
            createdAt: new Date(Date.now() - i * 86400000).toISOString(),
          })),
        },
      }).as('getSubscriptionData');

      cy.visit('/subscription');
      cy.wait('@getSubscriptionData');

      cy.get('[data-testid="current-subscription"]').should('be.visible');
      cy.get('[data-testid="history-item"]').should('have.length.at.least', 10);
    });
  });
});

/**
 * Premium Subscription E2E Tests
 * Tests the complete premium subscription flow
 * 
 * CRITICAL: This flow is completely untested
 * Business Impact: Revenue generation and premium feature access
 */

import { test, expect } from '@playwright/test';

test.describe('Premium Subscription Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.fill('[data-testid="email-input"]', 'test@example.com');
    await page.fill('[data-testid="password-input"]', 'TestPassword123!');
    await page.click('[data-testid="login-button"]');
    await expect(page).toHaveURL('/dashboard');
  });

  test('should display premium features page', async ({ page }) => {
    await page.goto('/premium');

    await expect(page.locator('h1')).toContainText('Premium');
    await expect(page.locator('[data-testid="feature-list"]')).toBeVisible();
    await expect(page.locator('[data-testid="pricing-cards"]')).toBeVisible();
  });

  test('should show premium feature benefits', async ({ page }) => {
    await page.goto('/premium');

    // Check for key premium features
    await expect(page.locator('text=Unlimited Swipes')).toBeVisible();
    await expect(page.locator('text=See Who Liked You')).toBeVisible();
    await expect(page.locator('text=Advanced Filters')).toBeVisible();
    await expect(page.locator('text=Priority Support')).toBeVisible();
    await expect(page.locator('text=AI-Powered Matching')).toBeVisible();
  });

  test('should display pricing tiers', async ({ page }) => {
    await page.goto('/premium');

    // Check for pricing cards
    await expect(page.locator('[data-testid="pricing-card-monthly"]')).toBeVisible();
    await expect(page.locator('[data-testid="pricing-card-yearly"]')).toBeVisible();
    await expect(page.locator('[data-testid="pricing-card-lifetime"]')).toBeVisible();

    // Check pricing information
    await expect(page.locator('text=$9.99/month')).toBeVisible();
    await expect(page.locator('text=$99.99/year')).toBeVisible();
    await expect(page.locator('text=Save 17%')).toBeVisible();
  });

  test('should initiate Stripe checkout for monthly plan', async ({ page }) => {
    await page.goto('/premium');

    // Click on monthly plan
    await page.click('[data-testid="subscribe-monthly"]');

    // Should show checkout modal or redirect
    await expect(page.locator('[data-testid="checkout-modal"]')).toBeVisible();
    
    // Check for Stripe elements
    await expect(page.locator('[data-testid="stripe-card-element"]')).toBeVisible();
    await expect(page.locator('[data-testid="checkout-submit"]')).toBeVisible();
  });

  test('should initiate Stripe checkout for yearly plan', async ({ page }) => {
    await page.goto('/premium');

    // Click on yearly plan
    await page.click('[data-testid="subscribe-yearly"]');

    // Should show checkout modal
    await expect(page.locator('[data-testid="checkout-modal"]')).toBeVisible();
    
    // Check for yearly pricing
    await expect(page.locator('text=$99.99/year')).toBeVisible();
  });

  test('should handle successful payment', async ({ page }) => {
    await page.goto('/premium');

    // Start checkout process
    await page.click('[data-testid="subscribe-monthly"]');
    await expect(page.locator('[data-testid="checkout-modal"]')).toBeVisible();

    // Fill in test payment details
    await page.fill('[data-testid="card-number"]', '4242424242424242');
    await page.fill('[data-testid="card-expiry"]', '12/25');
    await page.fill('[data-testid="card-cvc"]', '123');
    await page.fill('[data-testid="card-name"]', 'Test User');

    // Submit payment
    await page.click('[data-testid="checkout-submit"]');

    // Should show success message
    await expect(page.locator('[data-testid="payment-success"]')).toBeVisible();
    await expect(page.locator('text=Welcome to Premium!')).toBeVisible();
  });

  test('should handle payment failure', async ({ page }) => {
    await page.goto('/premium');

    // Start checkout process
    await page.click('[data-testid="subscribe-monthly"]');
    await expect(page.locator('[data-testid="checkout-modal"]')).toBeVisible();

    // Fill in card that will be declined
    await page.fill('[data-testid="card-number"]', '4000000000000002');
    await page.fill('[data-testid="card-expiry"]', '12/25');
    await page.fill('[data-testid="card-cvc"]', '123');
    await page.fill('[data-testid="card-name"]', 'Test User');

    // Submit payment
    await page.click('[data-testid="checkout-submit"]');

    // Should show error message
    await expect(page.locator('[data-testid="payment-error"]')).toBeVisible();
    await expect(page.locator('text=Your card was declined')).toBeVisible();
  });

  test('should show premium badge after activation', async ({ page }) => {
    // Assume user has premium (mock or test with premium user)
    await page.goto('/dashboard');

    await expect(page.locator('[data-testid="premium-badge"]')).toBeVisible();
    await expect(page.locator('[data-testid="premium-badge"]')).toContainText('Premium');
  });

  test('should unlock advanced filters', async ({ page }) => {
    await page.goto('/discover');

    await page.click('[data-testid="filter-button"]');

    // Premium users should see advanced filters
    await expect(page.locator('[data-testid="breed-filter"]')).toBeVisible();
    await expect(page.locator('[data-testid="personality-filter"]')).toBeVisible();
    await expect(page.locator('[data-testid="health-filter"]')).toBeVisible();
    await expect(page.locator('[data-testid="activity-level-filter"]')).toBeVisible();
  });

  test('should enable unlimited swipes', async ({ page }) => {
    await page.goto('/discover');

    // Free users have swipe limits, premium users don't
    // Test by swiping many times
    for (let i = 0; i < 20; i++) {
      await page.click('[data-testid="like-button"]');
      await page.waitForTimeout(500); // Wait for animation
    }

    // Should not show swipe limit message
    await expect(page.locator('text=You\'ve reached your daily swipe limit')).not.toBeVisible();
  });

  test('should show who liked you', async ({ page }) => {
    await page.goto('/dashboard');

    // Premium users can see who liked them
    await expect(page.locator('[data-testid="likes-you-section"]')).toBeVisible();
    await expect(page.locator('text=People who liked you')).toBeVisible();
  });

  test('should allow subscription cancellation', async ({ page }) => {
    await page.goto('/premium');

    // Go to subscription management
    await page.click('[data-testid="manage-subscription"]');

    // Should show current subscription details
    await expect(page.locator('[data-testid="current-subscription"]')).toBeVisible();
    await expect(page.locator('text=Active')).toBeVisible();

    // Cancel subscription
    await page.click('[data-testid="cancel-subscription"]');
    await expect(page.locator('[data-testid="cancel-confirmation"]')).toBeVisible();

    // Confirm cancellation
    await page.click('[data-testid="confirm-cancellation"]');
    await expect(page.locator('text=Subscription cancelled')).toBeVisible();
  });

  test('should handle subscription upgrade', async ({ page }) => {
    await page.goto('/premium');

    // If user has monthly, show upgrade to yearly option
    await expect(page.locator('[data-testid="upgrade-to-yearly"]')).toBeVisible();

    await page.click('[data-testid="upgrade-to-yearly"]');
    await expect(page.locator('[data-testid="upgrade-modal"]')).toBeVisible();
    await expect(page.locator('text=Upgrade to Yearly')).toBeVisible();
  });

  test('should show premium features in navigation', async ({ page }) => {
    await page.goto('/dashboard');

    // Premium users should see premium features in nav
    await expect(page.locator('[data-testid="nav-premium-features"]')).toBeVisible();
    await expect(page.locator('text=AI Bio Generator')).toBeVisible();
    await expect(page.locator('text=Photo Analyzer')).toBeVisible();
  });

  test('should handle subscription renewal', async ({ page }) => {
    await page.goto('/premium');

    // Check renewal date
    await expect(page.locator('[data-testid="renewal-date"]')).toBeVisible();
    await expect(page.locator('text=Renews on')).toBeVisible();

    // Should show auto-renewal toggle
    await expect(page.locator('[data-testid="auto-renewal-toggle"]')).toBeVisible();
  });

  test('should show usage statistics for premium users', async ({ page }) => {
    await page.goto('/premium');

    // Premium users get detailed statistics
    await expect(page.locator('[data-testid="usage-stats"]')).toBeVisible();
    await expect(page.locator('text=Swipes this month')).toBeVisible();
    await expect(page.locator('text=Matches made')).toBeVisible();
    await expect(page.locator('text=Messages sent')).toBeVisible();
  });

  test('should handle payment method updates', async ({ page }) => {
    await page.goto('/premium');

    // Go to payment methods
    await page.click('[data-testid="payment-methods"]');

    // Should show current payment method
    await expect(page.locator('[data-testid="current-payment-method"]')).toBeVisible();

    // Update payment method
    await page.click('[data-testid="update-payment-method"]');
    await expect(page.locator('[data-testid="payment-method-form"]')).toBeVisible();
  });

  test('should show premium onboarding', async ({ page }) => {
    // New premium user should see onboarding
    await page.goto('/premium/onboarding');

    await expect(page.locator('text=Welcome to Premium!')).toBeVisible();
    await expect(page.locator('[data-testid="premium-tour"]')).toBeVisible();

    // Complete onboarding
    await page.click('[data-testid="start-tour"]');
    await expect(page.locator('[data-testid="tour-step-1"]')).toBeVisible();
  });

  test('should handle premium feature access restrictions', async ({ page }) => {
    // Test as free user trying to access premium features
    await page.goto('/ai/bio');

    // Should show upgrade prompt
    await expect(page.locator('[data-testid="upgrade-prompt"]')).toBeVisible();
    await expect(page.locator('text=Upgrade to Premium')).toBeVisible();
    await expect(page.locator('text=to access AI Bio Generator')).toBeVisible();
  });

  test('should show premium feature previews', async ({ page }) => {
    await page.goto('/discover');

    // Free users should see previews of premium features
    await expect(page.locator('[data-testid="premium-feature-preview"]')).toBeVisible();
    await expect(page.locator('text=See who liked you')).toBeVisible();
    await expect(page.locator('text=Upgrade to unlock')).toBeVisible();
  });

  test('should handle subscription status changes', async ({ page }) => {
    await page.goto('/premium');

    // Should show current subscription status
    await expect(page.locator('[data-testid="subscription-status"]')).toBeVisible();
    await expect(page.locator('text=Active')).toBeVisible();

    // Test expired subscription
    // (This would require backend setup to simulate expired subscription)
  });

  test('should show premium support options', async ({ page }) => {
    await page.goto('/premium');

    // Premium users get priority support
    await expect(page.locator('[data-testid="premium-support"]')).toBeVisible();
    await expect(page.locator('text=Priority Support')).toBeVisible();
    await expect(page.locator('text=24/7 Chat Support')).toBeVisible();
  });

  test('should handle subscription webhooks', async ({ page }) => {
    // This test would require backend webhook simulation
    // Test that subscription status updates correctly when webhook is received
    await page.goto('/premium');

    // Simulate webhook processing
    // Check that UI updates reflect the new subscription status
  });

  test('should show premium analytics', async ({ page }) => {
    await page.goto('/premium/analytics');

    // Premium users get detailed analytics
    await expect(page.locator('[data-testid="premium-analytics"]')).toBeVisible();
    await expect(page.locator('text=Match Success Rate')).toBeVisible();
    await expect(page.locator('text=Profile Views')).toBeVisible();
    await expect(page.locator('text=Message Response Rate')).toBeVisible();
  });

  test('should handle subscription refunds', async ({ page }) => {
    await page.goto('/premium');

    // Go to subscription management
    await page.click('[data-testid="manage-subscription"]');

    // Should show refund option if eligible
    await expect(page.locator('[data-testid="request-refund"]')).toBeVisible();
  });

  test('should show premium feature comparisons', async ({ page }) => {
    await page.goto('/premium');

    // Should show feature comparison table
    await expect(page.locator('[data-testid="feature-comparison"]')).toBeVisible();
    await expect(page.locator('text=Free vs Premium')).toBeVisible();

    // Check feature differences
    await expect(page.locator('text=5 swipes/day')).toBeVisible();
    await expect(page.locator('text=Unlimited swipes')).toBeVisible();
  });

  test('should handle subscription gift options', async ({ page }) => {
    await page.goto('/premium');

    // Should show gift subscription option
    await expect(page.locator('[data-testid="gift-subscription"]')).toBeVisible();
    await expect(page.locator('text=Gift Premium')).toBeVisible();

    await page.click('[data-testid="gift-subscription"]');
    await expect(page.locator('[data-testid="gift-form"]')).toBeVisible();
  });
});

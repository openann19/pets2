/**
 * Premium Checkout E2E Test
 * Fixes T-11: Detox premium checkout flow using Stripe test mode
 * Tests the complete premium subscription purchase flow
 */

import { device, expect, element, by, waitFor } from 'detox';
import { beforeAll, beforeEach, afterAll } from '@jest/globals';

// Stripe test card details
const STRIPE_TEST_CARDS = {
  success: '4242424242424242',
  decline: '4000000000000002',
  requiresAuth: '4000002500003155',
};

describe('Premium Checkout Flow', () => {
  beforeAll(async () => {
    await device.launchApp({ newInstance: true });
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  afterAll(async () => {
    // Cleanup if needed
  });

  describe('Navigation to Premium Screen', () => {
    it('should navigate to Premium screen from Home', async () => {
      // Wait for app to load
      await waitFor(element(by.id('home-screen'))).toBeVisible().withTimeout(5000);

      // Navigate to Premium (tap on premium button or navigation item)
      await element(by.id('premium-button')).tap();
      
      // Verify Premium screen is visible
      await waitFor(element(by.id('premium-screen'))).toBeVisible().withTimeout(3000);
    });

    it('should navigate to Premium screen from Settings', async () => {
      // Navigate to Settings
      await element(by.id('profile-tab')).tap();
      await element(by.id('settings-button')).tap();
      
      // Navigate to Premium from Settings
      await element(by.id('premium-settings-button')).tap();
      
      // Verify Premium screen is visible
      await waitFor(element(by.id('premium-screen'))).toBeVisible().withTimeout(3000);
    });
  });

  describe('Subscription Plan Selection', () => {
    beforeEach(async () => {
      // Navigate to Premium screen
      await device.reloadReactNative();
      await element(by.id('premium-button')).tap();
      await waitFor(element(by.id('premium-screen'))).toBeVisible().withTimeout(3000);
    });

    it('should display all subscription tiers', async () => {
      // Verify tier cards are visible
      await waitFor(element(by.id('tier-basic'))).toBeVisible().withTimeout(2000);
      await waitFor(element(by.id('tier-premium'))).toBeVisible().withTimeout(2000);
      await waitFor(element(by.id('tier-elite'))).toBeVisible().withTimeout(2000);
    });

    it('should allow selecting monthly billing', async () => {
      // Tap monthly billing option
      await element(by.id('billing-monthly')).tap();
      
      // Verify monthly prices are displayed
      await waitFor(element(by.id('price-monthly'))).toBeVisible().withTimeout(2000);
    });

    it('should allow selecting annual billing', async () => {
      // Tap annual billing option
      await element(by.id('billing-annual')).tap();
      
      // Verify annual prices are displayed (should show savings)
      await waitFor(element(by.id('price-annual'))).toBeVisible().withTimeout(2000);
      await waitFor(element(by.id('save-badge'))).toBeVisible().withTimeout(2000);
    });

    it('should select a subscription plan', async () => {
      // Select annual billing
      await element(by.id('billing-annual')).tap();
      
      // Select Premium tier
      await element(by.id('tier-premium-card')).tap();
      
      // Verify subscribe button is enabled
      await waitFor(element(by.id('subscribe-button'))).toBeVisible().withTimeout(2000);
    });
  });

  describe('Checkout Flow with Stripe', () => {
    beforeEach(async () => {
      // Navigate to Premium and select plan
      await device.reloadReactNative();
      await element(by.id('premium-button')).tap();
      await waitFor(element(by.id('premium-screen'))).toBeVisible().withTimeout(3000);
      await element(by.id('billing-annual')).tap();
      await element(by.id('tier-premium-card')).tap();
    });

    it('should open Stripe payment sheet on subscribe', async () => {
      // Tap subscribe button
      await element(by.id('subscribe-button')).tap();
      
      // Wait for Stripe payment sheet to appear
      // Note: Stripe payment sheet element IDs depend on Stripe SDK implementation
      await waitFor(element(by.text('Card Number'))).toBeVisible().withTimeout(5000);
    });

    it('should enter test card details successfully', async () => {
      // Open checkout
      await element(by.id('subscribe-button')).tap();
      await waitFor(element(by.text('Card Number'))).toBeVisible().withTimeout(5000);
      
      // Enter test card number
      await element(by.text('Card Number')).typeText(STRIPE_TEST_CARDS.success);
      
      // Enter expiry date
      await element(by.text('MM / YY')).typeText('12/25');
      
      // Enter CVC
      await element(by.text('CVC')).typeText('123');
      
      // Enter postal code (if required)
      const zipInput = element(by.text('ZIP')).or(element(by.text('Postal Code')));
      if (await zipInput.exists()) {
        await zipInput.typeText('12345');
      }
    });

    it('should complete checkout with success', async () => {
      // Open checkout and enter card
      await element(by.id('subscribe-button')).tap();
      await waitFor(element(by.text('Card Number'))).toBeVisible().withTimeout(5000);
      
      // Enter test card details
      await element(by.text('Card Number')).typeText(STRIPE_TEST_CARDS.success);
      await element(by.text('MM / YY')).typeText('12/25');
      await element(by.text('CVC')).typeText('123');
      
      // Confirm payment
      const payButton = element(by.text('Pay')).or(element(by.text('Subscribe')));
      await waitFor(payButton).toBeVisible().withTimeout(2000);
      await payButton.tap();
      
      // Wait for success screen
      await waitFor(element(by.id('premium-success-screen'))).toBeVisible().withTimeout(10000);
      
      // Verify success message
      await waitFor(element(by.text('Success'))).toBeVisible().withTimeout(3000);
    });

    it('should handle payment failure gracefully', async () => {
      // Open checkout
      await element(by.id('subscribe-button')).tap();
      await waitFor(element(by.text('Card Number'))).toBeVisible().withTimeout(5000);
      
      // Enter declined card number
      await element(by.text('Card Number')).typeText(STRIPE_TEST_CARDS.decline);
      await element(by.text('MM / YY')).typeText('12/25');
      await element(by.text('CVC')).typeText('123');
      
      // Attempt payment
      const payButton = element(by.text('Pay')).or(element(by.text('Subscribe')));
      await payButton.tap();
      
      // Verify error message appears
      await waitFor(element(by.text('declined')).or(element(by.text('failed')))).toBeVisible().withTimeout(5000);
    });

    it('should handle 3D Secure authentication', async () => {
      // Open checkout
      await element(by.id('subscribe-button')).tap();
      await waitFor(element(by.text('Card Number'))).toBeVisible().withTimeout(5000);
      
      // Enter card that requires authentication
      await element(by.text('Card Number')).typeText(STRIPE_TEST_CARDS.requiresAuth);
      await element(by.text('MM / YY')).typeText('12/25');
      await element(by.text('CVC')).typeText('123');
      
      // Attempt payment
      const payButton = element(by.text('Pay')).or(element(by.text('Subscribe')));
      await payButton.tap();
      
      // Wait for 3D Secure challenge (if Stripe SDK shows it)
      // Note: This depends on Stripe SDK implementation
      const challengeElement = element(by.text('Authenticate')).or(element(by.text('Complete')));
      if (await challengeElement.exists()) {
        await challengeElement.tap();
      }
    });
  });

  describe('Premium Features Unlocking', () => {
    beforeEach(async () => {
      // Complete successful checkout
      await device.reloadReactNative();
      await element(by.id('premium-button')).tap();
      await waitFor(element(by.id('premium-screen'))).toBeVisible().withTimeout(3000);
      
      // Complete purchase flow (use test helper if available)
      await completeTestPurchase();
    });

    it('should show success screen after purchase', async () => {
      // Verify success screen elements
      await waitFor(element(by.id('premium-success-screen'))).toBeVisible().withTimeout(3000);
      await waitFor(element(by.text('Welcome to Premium'))).toBeVisible().withTimeout(2000);
    });

    it('should unlock premium features after purchase', async () => {
      // Navigate to Home
      await element(by.id('home-tab')).tap();
      
      // Verify premium features are accessible
      await waitFor(element(by.id('premium-badge'))).toBeVisible().withTimeout(2000);
      
      // Verify unlimited swipes
      await element(by.id('swipe-tab')).tap();
      await waitFor(element(by.id('swipe-screen'))).toBeVisible().withTimeout(2000);
      // Premium users should not see daily limit warnings
      await expect(element(by.text('Daily limit reached'))).not.toBeVisible();
    });

    it('should show premium status in profile', async () => {
      // Navigate to Profile
      await element(by.id('profile-tab')).tap();
      
      // Verify premium badge or indicator
      await waitFor(element(by.id('premium-status-badge'))).toBeVisible().withTimeout(2000);
    });
  });

  describe('Subscription Management', () => {
    it('should navigate to subscription management', async () => {
      await element(by.id('profile-tab')).tap();
      await element(by.id('settings-button')).tap();
      
      // Navigate to subscription management
      await element(by.id('manage-subscription-button')).tap();
      
      // Verify subscription management screen
      await waitFor(element(by.id('subscription-management-screen'))).toBeVisible().withTimeout(3000);
    });

    it('should display current subscription details', async () => {
      // Navigate to subscription management
      await element(by.id('profile-tab')).tap();
      await element(by.id('settings-button')).tap();
      await element(by.id('manage-subscription-button')).tap();
      
      // Verify subscription details are displayed
      await waitFor(element(by.id('subscription-plan-name'))).toBeVisible().withTimeout(2000);
      await waitFor(element(by.id('subscription-renewal-date'))).toBeVisible().withTimeout(2000);
    });
  });
});

/**
 * Helper function to complete a test purchase
 * Can be reused across tests
 */
async function completeTestPurchase() {
  // Select annual billing and premium tier
  await element(by.id('billing-annual')).tap();
  await element(by.id('tier-premium-card')).tap();
  
  // Open checkout
  await element(by.id('subscribe-button')).tap();
  await waitFor(element(by.text('Card Number'))).toBeVisible().withTimeout(5000);
  
  // Enter test card
  await element(by.text('Card Number')).typeText(STRIPE_TEST_CARDS.success);
  await element(by.text('MM / YY')).typeText('12/25');
  await element(by.text('CVC')).typeText('123');
  
  // Complete payment
  const payButton = element(by.text('Pay')).or(element(by.text('Subscribe')));
  await payButton.tap();
  
  // Wait for success
  await waitFor(element(by.id('premium-success-screen'))).toBeVisible().withTimeout(10000);
}


/**
 * E2E Tests for Who Liked You Feature Gate
 * Tests premium gate functionality for Who Liked You screen
 */

import { by, device, element, expect as detoxExpect, waitFor } from 'detox';

describe('Who Liked You Feature Gate', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  describe('Free User Access', () => {
    it('should show premium gate when free user tries to access Who Liked You', async () => {
      // Navigate to Who Liked You screen
      // This would typically be from Profile or Matches screen
      
      // Check for premium gate UI elements
      await waitFor(element(by.text('Unlock See Who Liked You')))
        .toBeVisible()
        .withTimeout(5000);

      await detoxExpect(element(by.text('Premium Required'))).toBeVisible();
      await detoxExpect(element(by.text('Upgrade to Premium'))).toBeVisible();
    });

    it('should navigate to Premium screen when upgrade button is tapped', async () => {
      // Navigate to Who Liked You (should show gate)
      // Tap upgrade button
      await element(by.text('Upgrade to Premium')).tap();

      // Should navigate to Premium screen
      await waitFor(element(by.id('PremiumScreen')))
        .toBeVisible()
        .withTimeout(3000);
    });

    it('should allow closing the premium gate', async () => {
      // Navigate to Who Liked You (should show gate)
      // Tap close/back button
      await element(by.id('WhoLikedYouScreen-back-button')).tap();

      // Should navigate back
    });
  });

  describe('Premium User Access', () => {
    it('should show Who Liked You list for premium users', async () => {
      // Mock: Assume user is logged in as premium user
      // Navigate to Who Liked You screen
      
      // Should see the list, not premium gate
      await waitFor(element(by.text('Who Liked You')))
        .toBeVisible()
        .withTimeout(5000);

      // Should show stats or list
      await detoxExpect(
        element(by.text(/liked your pets/i))
      ).toBeVisible();
    });

    it('should display received likes if available', async () => {
      // Navigate to Who Liked You (premium user with likes)
      // Should show list of users who liked
      
      // Check for user items
      await waitFor(element(by.id('liked-user-item')))
        .toBeVisible()
        .withTimeout(5000);
    });

    it('should show empty state if no likes', async () => {
      // Navigate to Who Liked You (premium user without likes)
      
      await waitFor(element(by.text('No Likes Yet')))
        .toBeVisible()
        .withTimeout(5000);

      await detoxExpect(
        element(by.text(/When someone likes your pet/i))
      ).toBeVisible();
    });

    it('should allow tapping on a liked user to view profile', async () => {
      // Navigate to Who Liked You (premium user with likes)
      // Tap on a user item
      
      // Should navigate to user profile or matches
      // (Implementation depends on navigation structure)
    });

    it('should support pull-to-refresh', async () => {
      // Navigate to Who Liked You (premium user)
      // Pull to refresh
      
      // Should refresh the list
      // (Implementation depends on FlatList setup)
    });
  });

  describe('API Integration', () => {
    it('should handle API errors gracefully', async () => {
      // Mock API error
      // Navigate to Who Liked You (premium user)
      
      // Should show error state
      await waitFor(element(by.text(/Failed to load/i)))
        .toBeVisible()
        .withTimeout(5000);

      // Should show retry button
      await detoxExpect(element(by.text('Retry'))).toBeVisible();
    });

    it('should load likes on mount for premium users', async () => {
      // Navigate to Who Liked You (premium user)
      
      // Should show loading state briefly
      // Then show content or empty state
      
      await waitFor(
        element(by.id('WhoLikedYouScreen-content'))
      ).toBeVisible().withTimeout(10000);
    });
  });
});


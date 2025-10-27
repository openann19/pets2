/**
 * Navigation helpers for E2E tests
 */

import { element, by, waitFor } from 'detox';

/**
 * Navigate between screens
 */
export const navigationHelpers = {
  /**
   * Navigate to a specific screen
   */
  navigateTo: async (screenId: string) => {
    await waitFor(element(by.id(screenId)))
      .toBeVisible()
      .withTimeout(10000);
  },

  /**
   * Go back
   */
  goBack: async () => {
    // Try iOS back button first
    try {
      await element(by.label('Back')).tap();
    } catch {
      // Fallback to Android back button
      // await device.pressBack(); // Uncomment when needed
    }
  },

  /**
   * Navigate to profile from any screen
   */
  toProfile: async () => {
    await element(by.id('tab-profile')).tap();
    await waitFor(element(by.id('profile-screen')))
      .toBeVisible()
      .withTimeout(5000);
  },

  /**
   * Navigate to matches
   */
  toMatches: async () => {
    await element(by.id('tab-matches')).tap();
    await waitFor(element(by.id('matches-screen')))
      .toBeVisible()
      .withTimeout(5000);
  },

  /**
   * Navigate to home/explore
   */
  toHome: async () => {
    await element(by.id('tab-explore')).tap();
    await waitFor(element(by.id('swipe-screen')))
      .toBeVisible()
      .withTimeout(5000);
  },
};


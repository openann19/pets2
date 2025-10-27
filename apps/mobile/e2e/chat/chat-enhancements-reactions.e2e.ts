/**
 * E2E Test: Chat Reactions Enhancement
 * Tests the newly implemented reaction backend integration
 */

import { by, device, element, expect as detoxExpect, waitFor } from 'detox';

describe('Chat Reactions - Backend Integration', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  beforeEach(async () => {
    // Login
    try {
      await element(by.id('login-email-input')).typeText('test@example.com');
      await element(by.id('login-password-input')).typeText('password123');
      await element(by.id('login-button')).tap();
      
      await waitFor(element(by.id('home-screen')))
        .toBeVisible()
        .withTimeout(5000);
    } catch (e) {
      // Already logged in
    }

    // Navigate to matches and open chat
    await element(by.id('matches-tab')).tap();
    await waitFor(element(by.id('matches-list')))
      .toBeVisible()
      .withTimeout(3000);
    await element(by.id('match-card-0')).tap();
    
    await waitFor(element(by.id('chat-screen')))
      .toBeVisible()
      .withTimeout(2000);
  });

  describe('Reaction Toggle Functionality', () => {
    it('should add reaction to message', async () => {
      // Long press message to show context menu
      await element(by.id('message-item-0')).longPress();
      
      // Tap react button
      await element(by.id('react-button')).tap();
      
      // Should show reaction picker
      await waitFor(element(by.id('reaction-picker')))
        .toBeVisible()
        .withTimeout(1000);
      
      // Select heart reaction
      await element(by.id('reaction-heart')).tap();
      
      // Should show reaction on message
      await waitFor(element(by.id('message-reaction-heart')))
        .toBeVisible()
        .withTimeout(2000);
      
      // Verify reaction count (1)
      await detoxExpect(element(by.id('reaction-count-heart'))).toBeVisible();
      await detoxExpect(element(by.id('reaction-count-heart'))).toHaveText('1');
    });

    it('should remove reaction when tapping same emoji again', async () => {
      // Assume reaction already exists from previous test
      // Long press message
      await element(by.id('message-item-0')).longPress();
      await element(by.id('react-button')).tap();
      
      // Tap same reaction to remove
      await element(by.id('reaction-heart')).tap();
      
      // Should remove reaction
      await waitFor(element(by.id('message-reaction-heart')))
        .not.toBeVisible()
        .withTimeout(2000);
    });

    it('should support multiple different reactions', async () => {
      // Add multiple reactions
      await element(by.id('message-item-0')).longPress();
      await element(by.id('react-button')).tap();
      await element(by.id('reaction-thumbs-up')).tap();
      
      await waitFor(element(by.id('message-reaction-thumbs-up')))
        .toBeVisible()
        .withTimeout(2000);
      
      // Add another reaction
      await element(by.id('message-item-0')).longPress();
      await element(by.id('react-button')).tap();
      await element(by.id('reaction-fire')).tap();
      
      await waitFor(element(by.id('message-reaction-fire')))
        .toBeVisible()
        .withTimeout(2000);
      
      // Verify both reactions visible
      await detoxExpect(element(by.id('reaction-count-thumbs-up'))).toBeVisible();
      await detoxExpect(element(by.id('reaction-count-fire'))).toBeVisible();
    });

    it('should show reaction picker with common emojis', async () => {
      await element(by.id('message-item-0')).longPress();
      await element(by.id('react-button')).tap();
      
      // Check for common reactions
      await detoxExpect(element(by.id('reaction-like'))).toBeVisible();
      await detoxExpect(element(by.id('reaction-love'))).toBeVisible();
      await detoxExpect(element(by.id('reaction-thumbs-up'))).toBeVisible();
      await detoxExpect(element(by.id('reaction-fire'))).toBeVisible();
      await detoxExpect(element(by.id('reaction-wow'))).toBeVisible();
    });

    it('should update reaction counts in real-time', async () => {
      // Add reaction to message
      await element(by.id('message-item-0')).longPress();
      await element(by.id('react-button')).tap();
      await element(by.id('reaction-like')).tap();
      
      // Wait for count to appear
      await waitFor(element(by.id('reaction-count-like')))
        .toBeVisible()
        .withTimeout(2000);
      
      // Verify count shows "1"
      const countElement = element(by.id('reaction-count-like'));
      await detoxExpect(countElement).toHaveText('1');
    });
  });

  describe('Reaction UI/UX', () => {
    it('should display reactions below message', async () => {
      // Add a reaction first
      await element(by.id('message-item-0')).longPress();
      await element(by.id('react-button')).tap();
      await element(by.id('reaction-heart')).tap();
      
      // Check reaction bar is visible
      await detoxExpect(element(by.id('message-reaction-bar'))).toBeVisible();
      
      // Check reaction icons are visible
      await detoxExpect(element(by.id('message-reaction-heart'))).toBeVisible();
    });

    it('should highlight own reaction differently', async () => {
      // Add own reaction
      await element(by.id('message-item-0')).longPress();
      await element(by.id('react-button')).tap();
      await element(by.id('reaction-heart')).tap();
      
      // Check own reaction has different styling
      await detoxExpect(element(by.id('own-reaction-heart'))).toBeVisible();
    });

    it('should show who reacted when tapping reaction count', async () => {
      // Add reaction first
      await element(by.id('message-item-0')).longPress();
      await element(by.id('react-button')).tap();
      await element(by.id('reaction-like')).tap();
      
      // Tap on reaction to see details
      await element(by.id('reaction-count-like')).tap();
      
      // Should show reaction details modal
      await waitFor(element(by.id('reaction-details-modal')))
        .toBeVisible()
        .withTimeout(1000);
      
      // Should show username
      await detoxExpect(element(by.id('reaction-user-0'))).toBeVisible();
    });
  });

  describe('Network & Error Handling', () => {
    it('should handle reaction add failure gracefully', async () => {
      // Simulate network failure
      await device.setURLBlacklist(['.*api.*']);
      
      await element(by.id('message-item-0')).longPress();
      await element(by.id('react-button')).tap();
      await element(by.id('reaction-heart')).tap();
      
      // Should show error toast
      await waitFor(element(by.text('Failed to add reaction')))
        .toBeVisible()
        .withTimeout(3000);
      
      // Re-enable network
      await device.setURLBlacklist([]);
    });

    it('should retry reaction on failure', async () => {
      // After showing error, should have retry button
      // (Assuming retry UI is implemented)
      
      // Re-enable network first
      await device.setURLBlacklist([]);
      
      // Retry reaction
      await element(by.id('retry-reaction-button')).tap();
      
      // Should succeed after retry
      await waitFor(element(by.id('message-reaction-heart')))
        .toBeVisible()
        .withTimeout(3000);
    });
  });

  afterEach(async () => {
    await device.setURLBlacklist([]);
  });
});


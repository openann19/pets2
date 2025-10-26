/**
 * E2E Test: Swipe and Match Flow
 * Tests core swipe functionality and matching
 */
import { device, element, by, expect as detoxExpect, waitFor } from 'detox';

describe('Swipe and Match Flow', () => {
  beforeAll(async () => {
    await device.launchApp({
      newInstance: true,
      permissions: { notifications: 'YES', location: 'always' },
    });
    
    // Login to access swipe screen
    await element(by.id('login-button')).tap();
    await element(by.id('email-input')).typeText('test@example.com');
    await element(by.id('password-input')).typeText('password123');
    await element(by.id('submit-button')).tap();
  });

  beforeEach(async () => {
    // Navigate to swipe screen if not already there
    await element(by.id('swipe-tab')).tap();
  });

  it('should display swipe cards', async () => {
    await detoxExpect(element(by.id('swipe-screen'))).toBeVisible();
    await detoxExpect(element(by.id('pet-card'))).toBeVisible();
  });

  it('should show pet details on card', async () => {
    await detoxExpect(element(by.id('pet-name'))).toBeVisible();
    await detoxExpect(element(by.id('pet-age'))).toBeVisible();
    await detoxExpect(element(by.id('pet-breed'))).toBeVisible();
    await detoxExpect(element(by.id('pet-distance'))).toBeVisible();
  });

  it('should swipe right (like) using button', async () => {
    const initialCardName = await element(by.id('pet-name')).getText();
    
    await element(by.id('like-button')).tap();
    
    // Wait for animation to complete
    await waitFor(element(by.id('pet-card')))
      .toBeVisible()
      .withTimeout(2000);
    
    // Verify new card is shown
    const newCardName = await element(by.id('pet-name')).getText();
    expect(newCardName).not.toBe(initialCardName);
  });

  it('should swipe left (reject) using button', async () => {
    const initialCardName = await element(by.id('pet-name')).getText();
    
    await element(by.id('reject-button')).tap();
    
    await waitFor(element(by.id('pet-card')))
      .toBeVisible()
      .withTimeout(2000);
    
    const newCardName = await element(by.id('pet-name')).getText();
    expect(newCardName).not.toBe(initialCardName);
  });

  it('should swipe right using gesture', async () => {
    await element(by.id('pet-card')).swipe('right', 'fast');
    
    await waitFor(element(by.id('pet-card')))
      .toBeVisible()
      .withTimeout(2000);
    
    // Card should change
    await detoxExpect(element(by.id('pet-card'))).toBeVisible();
  });

  it('should swipe left using gesture', async () => {
    await element(by.id('pet-card')).swipe('left', 'fast');
    
    await waitFor(element(by.id('pet-card')))
      .toBeVisible()
      .withTimeout(2000);
    
    await detoxExpect(element(by.id('pet-card'))).toBeVisible();
  });

  it('should show match modal on mutual like', async () => {
    // Swipe right on a pet that already liked us
    await element(by.id('like-button')).tap();
    
    // Check if match modal appears
    await waitFor(element(by.id('match-modal')))
      .toBeVisible()
      .withTimeout(3000);
    
    await detoxExpect(element(by.text('It\'s a Match!'))).toBeVisible();
    await detoxExpect(element(by.id('send-message-button'))).toBeVisible();
    await detoxExpect(element(by.id('keep-swiping-button'))).toBeVisible();
  });

  it('should navigate to chat from match modal', async () => {
    // Trigger match
    await element(by.id('like-button')).tap();
    
    await waitFor(element(by.id('match-modal')))
      .toBeVisible()
      .withTimeout(3000);
    
    // Tap send message
    await element(by.id('send-message-button')).tap();
    
    // Should navigate to chat screen
    await detoxExpect(element(by.id('chat-screen'))).toBeVisible();
  });

  it('should close match modal and continue swiping', async () => {
    await element(by.id('like-button')).tap();
    
    await waitFor(element(by.id('match-modal')))
      .toBeVisible()
      .withTimeout(3000);
    
    await element(by.id('keep-swiping-button')).tap();
    
    // Should return to swipe screen
    await detoxExpect(element(by.id('swipe-screen'))).toBeVisible();
    await detoxExpect(element(by.id('pet-card'))).toBeVisible();
  });

  it('should super like using button', async () => {
    await element(by.id('super-like-button')).tap();
    
    // Should show super like animation or confirmation
    await waitFor(element(by.id('pet-card')))
      .toBeVisible()
      .withTimeout(2000);
  });

  it('should view pet profile details', async () => {
    await element(by.id('pet-card')).tap();
    
    // Should show expanded profile
    await detoxExpect(element(by.id('pet-profile-modal'))).toBeVisible();
    await detoxExpect(element(by.id('pet-bio'))).toBeVisible();
    await detoxExpect(element(by.id('pet-photos'))).toBeVisible();
  });

  it('should close pet profile modal', async () => {
    await element(by.id('pet-card')).tap();
    await detoxExpect(element(by.id('pet-profile-modal'))).toBeVisible();
    
    await element(by.id('close-button')).tap();
    
    await detoxExpect(element(by.id('swipe-screen'))).toBeVisible();
  });

  it('should handle empty card stack', async () => {
    // Swipe through all available cards
    for (let i = 0; i < 10; i++) {
      try {
        await element(by.id('like-button')).tap();
        await waitFor(element(by.id('pet-card')))
          .toBeVisible()
          .withTimeout(1000);
      } catch (e) {
        break;
      }
    }
    
    // Should show empty state or loading
    await waitFor(element(by.id('no-more-cards')))
      .toBeVisible()
      .withTimeout(3000);
  });

  it('should reload cards when stack is empty', async () => {
    await waitFor(element(by.id('no-more-cards')))
      .toBeVisible()
      .withTimeout(3000);
    
    await element(by.id('reload-button')).tap();
    
    // Should show new cards
    await waitFor(element(by.id('pet-card')))
      .toBeVisible()
      .withTimeout(3000);
  });

  it('should display swipe hints for first-time users', async () => {
    // On first launch, should show tutorial
    await waitFor(element(by.id('swipe-tutorial')))
      .toBeVisible()
      .withTimeout(2000);
    
    if (await element(by.id('swipe-tutorial')).isVisible()) {
      await element(by.id('got-it-button')).tap();
    }
  });

  it('should filter pets by distance preference', async () => {
    // Open filters
    await element(by.id('filter-button')).tap();
    
    await detoxExpect(element(by.id('filter-modal'))).toBeVisible();
    
    // Adjust distance
    await element(by.id('distance-slider')).swipe('right', 'slow');
    
    await element(by.id('apply-filters-button')).tap();
    
    // Cards should refresh with new filters
    await detoxExpect(element(by.id('pet-card'))).toBeVisible();
  });

  it('should undo last swipe', async () => {
    const initialCardName = await element(by.id('pet-name')).getText();
    
    // Swipe
    await element(by.id('reject-button')).tap();
    
    await waitFor(element(by.id('pet-card')))
      .toBeVisible()
      .withTimeout(2000);
    
    // Undo
    await element(by.id('undo-button')).tap();
    
    // Should show previous card
    const restoredCardName = await element(by.id('pet-name')).getText();
    expect(restoredCardName).toBe(initialCardName);
  });

  it('should display like/reject indicators during swipe', async () => {
    // Start swiping right
    await element(by.id('pet-card')).swipe('right', 'slow', 0.3);
    
    // Like indicator should appear
    await detoxExpect(element(by.id('like-indicator'))).toBeVisible();
  });

  it('should handle rapid swipes without errors', async () => {
    // Quickly swipe multiple cards
    for (let i = 0; i < 5; i++) {
      await element(by.id('like-button')).tap();
      await new Promise(resolve => setTimeout(resolve, 300));
    }
    
    // App should still be functional
    await detoxExpect(element(by.id('swipe-screen'))).toBeVisible();
  });

  it('should track daily swipe limit for free users', async () => {
    // Swipe until limit reached (if applicable)
    let limitReached = false;
    
    for (let i = 0; i < 100; i++) {
      try {
        await element(by.id('like-button')).tap();
        
        // Check if limit modal appears
        if (await element(by.id('swipe-limit-modal')).isVisible()) {
          limitReached = true;
          break;
        }
        
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (e) {
        break;
      }
    }
    
    if (limitReached) {
      await detoxExpect(element(by.id('upgrade-to-premium-button'))).toBeVisible();
    }
  });
});

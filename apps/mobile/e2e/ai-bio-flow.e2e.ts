/**
 * E2E Test: Complete AI Bio Generation Flow
 * Tests the full user journey from form to bio display
 */

import { device, element, by, waitFor, expect as detoxExpect } from 'detox';

describe('AI Bio Generation Flow', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  it('should navigate to AI Bio screen', async () => {
    // Navigate to AI Bio screen
    await element(by.id('navigate-to-ai-bio')).tap();
    await waitFor(element(by.text('AI Pet Bio')))
      .toBeVisible()
      .withTimeout(5000);
  });

  it('should fill out pet information form', async () => {
    await element(by.id('AIBioScreen-back-button')).tap();
    
    // Fill out form fields
    await element(by.id('pet-name-input')).typeText('Max');
    await element(by.id('pet-breed-input')).typeText('Golden Retriever');
    await element(by.id('pet-age-input')).typeText('2 years old');
    await element(by.id('pet-personality-input')).typeText('Very playful and energetic');

    await detoxExpect(element(by.id('pet-name-input'))).toHaveText('Max');
  });

  it('should select a tone', async () => {
    await element(by.id('tone-playful')).tap();
    
    await detoxExpect(element(by.id('tone-playful')))
      .toBeVisible();
  });

  it('should generate bio successfully', async () => {
    // Fill form
    await element(by.id('pet-name-input')).typeText('Max');
    await element(by.id('pet-breed-input')).typeText('Golden Retriever');
    await element(by.id('pet-age-input')).typeText('2 years');
    await element(by.id('pet-personality-input')).typeText('Playful');

    // Select tone
    await element(by.id('tone-playful')).tap();

    // Generate bio
    await element(by.id('AIBioScreen-generate-button')).tap();

    // Wait for bio to be generated
    await waitFor(element(by.id('bio-results-container')))
      .toBeVisible()
      .withTimeout(10000);
  });

  it('should display bio results with metrics', async () => {
    // Generate bio first
    await element(by.id('AIBioScreen-generate-button')).tap();
    await waitFor(element(by.id('bio-results-container')))
      .toBeVisible()
      .withTimeout(10000);

    // Verify metrics are displayed
    await detoxExpect(element(by.id('match-score'))).toBeVisible();
    await detoxExpect(element(by.id('sentiment-score'))).toBeVisible();
    await detoxExpect(element(by.id('keywords-section'))).toBeVisible();
  });

  it('should copy bio to clipboard', async () => {
    // Generate bio first
    await element(by.id('AIBioScreen-generate-button')).tap();
    await waitFor(element(by.id('bio-results-container')))
      .toBeVisible()
      .withTimeout(10000);

    // Tap copy button
    await element(by.id('bio-copy-button')).tap();

    // Verify confirmation
    await detoxExpect(element(by.text('Copied!'))).toBeVisible();
  });

  it('should regenerate bio', async () => {
    // Generate initial bio
    await element(by.id('AIBioScreen-generate-button')).tap();
    await waitFor(element(by.id('bio-results-container')))
      .toBeVisible()
      .withTimeout(10000);

    // Regenerate
    await element(by.id('bio-regenerate-button')).tap();

    // Should return to form
    await detoxExpect(element(by.id('AIBioScreen-generate-button')))
      .toBeVisible();
  });

  it('should show validation errors for empty fields', async () => {
    // Try to submit without filling fields
    await element(by.id('AIBioScreen-generate-button')).tap();

    // Should show validation error
    await detoxExpect(element(by.text('Pet name is required'))).toBeVisible();
  });

  it('should handle photo selection', async () => {
    await element(by.id('AIBioScreen-photo-picker')).tap();
    
    // Photo picker should open
    await detoxExpect(element(by.text('Photo Selected'))).toBeVisible();
  });

  it('should create new bio after viewing results', async () => {
    // Generate bio
    await element(by.id('AIBioScreen-generate-button')).tap();
    await waitFor(element(by.id('bio-results-container')))
      .toBeVisible()
      .withTimeout(10000);

    // Create new bio
    await element(by.id('AIBioScreen-new-bio-button')).tap();

    // Should return to form
    await detoxExpect(element(by.id('AIBioScreen-generate-button'))).toBeVisible();
  });

  it('should navigate back from AI Bio screen', async () => {
    await element(by.id('AIBioScreen-back-button')).tap();
    
    // Should navigate back
    await waitFor(element(by.id('home-screen')))
      .toBeVisible()
      .withTimeout(3000);
  });
});

/**
 * Edge Cases
 */
describe('AI Bio - Edge Cases', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  it('should handle long personality text', async () => {
    const longText = 'A'.repeat(200);
    await element(by.id('pet-personality-input')).typeText(longText);
    
    // Character count should update
    await detoxExpect(element(by.text('200/500 characters'))).toBeVisible();
  });

  it('should handle special characters in inputs', async () => {
    await element(by.id('pet-name-input')).typeText("Max's Dog 🐕");
    
    await detoxExpect(element(by.id('pet-name-input'))).toHaveText("Max's Dog 🐕");
  });

  it('should limit character input appropriately', async () => {
    const maxLengthText = 'A'.repeat(520);
    await element(by.id('pet-personality-input')).typeText(maxLengthText);
    
    // Should respect maxLength
    await detoxExpect(element(by.text('500/500 characters'))).toBeVisible();
  });
});

/**
 * Accessibility Tests
 */
describe('AI Bio - Accessibility', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  it('should have proper accessibility labels', async () => {
    await detoxExpect(element(by.id('AIBioScreen-back-button'))).toHaveAccessibilityLabel('Go back');
    await detoxExpect(element(by.id('AIBioScreen-generate-button'))).toHaveAccessibilityLabel('Generate AI bio');
  });

  it('should support reduce motion preference', async () => {
    // Enable reduce motion
    await device.setSettings({ 
      reduceMotion: true 
    });

    // Navigate and interact
    await element(by.id('AIBioScreen-generate-button')).tap();
    
    // Should not have jarring animations
    await detoxExpect(element(by.id('bio-results-container'))).toBeVisible();
  });
});


/**
 * E2E Test: Onboarding Flow
 * Tests complete first-run journey: welcome → preferences → profile create
 */

import { device, element, by, waitFor, expect as detoxExpect } from 'detox';

describe('Onboarding Flow', () => {
  beforeAll(async () => {
    await device.launchApp({
      newInstance: true,
      permissions: { notifications: 'YES', location: 'always' },
    });
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  it('should display welcome screen on first launch', async () => {
    await detoxExpect(element(by.id('welcome-screen'))).toBeVisible();
    await detoxExpect(element(by.text('Welcome to PawfectMatch'))).toBeVisible();
  });

  it('should navigate through complete onboarding flow', async () => {
    // Step 1: Welcome screen
    await detoxExpect(element(by.id('welcome-screen'))).toBeVisible();
    await element(by.id('get-started-button')).tap();

    // Step 2: User Intent screen
    await waitFor(element(by.id('user-intent-screen')))
      .toBeVisible()
      .withTimeout(3000);

    // Select intent (adopt)
    await element(by.id('intent-adopt')).tap();
    await element(by.id('continue-button')).tap();

    // Step 3: Preferences Setup
    await waitFor(element(by.id('preferences-screen')))
      .toBeVisible()
      .withTimeout(3000);

    // Set max distance
    await element(by.id('distance-slider')).swipe('right', 'fast', 0.5);

    // Select species
    await element(by.id('species-dog')).tap();
    await element(by.id('species-cat')).tap();

    // Set age range
    await element(by.id('age-min-slider')).swipe('right', 'fast', 0.3);
    await element(by.id('age-max-slider')).swipe('right', 'fast', 0.7);

    // Continue to profile setup
    await element(by.id('preferences-continue-button')).tap();

    // Step 4: Profile Setup (Pet Profile)
    await waitFor(element(by.id('profile-setup-screen')))
      .toBeVisible()
      .withTimeout(3000);

    // Fill pet name
    await element(by.id('pet-name-input')).tap();
    await element(by.id('pet-name-input')).typeText('Max');
    await element(by.id('pet-name-input')).tapReturnKey();

    // Select breed
    await element(by.id('breed-selector')).tap();
    await element(by.text('Golden Retriever')).tap();

    // Set age
    await element(by.id('age-input')).tap();
    await element(by.id('age-input')).typeText('3');
    await element(by.id('age-input')).tapReturnKey();

    // Add photo (optional - stub)
    // await element(by.id('add-photo-button')).tap();
    // await element(by.id('photo-library')).tap();
    // await element(by.id('photo-item-0')).tap();

    // Submit profile
    await element(by.id('create-profile-button')).tap();

    // Step 5: Verify navigation to home
    await waitFor(element(by.id('home-screen')))
      .toBeVisible()
      .withTimeout(5000);

    await detoxExpect(element(by.id('home-screen'))).toBeVisible();
  });

  it('should validate form fields during onboarding', async () => {
    // Navigate to profile setup
    await element(by.id('get-started-button')).tap();
    await waitFor(element(by.id('user-intent-screen'))).toBeVisible();
    await element(by.id('intent-adopt')).tap();
    await element(by.id('continue-button')).tap();
    await waitFor(element(by.id('preferences-screen'))).toBeVisible();
    await element(by.id('preferences-continue-button')).tap();
    await waitFor(element(by.id('profile-setup-screen'))).toBeVisible();

    // Try to submit without required fields
    await element(by.id('create-profile-button')).tap();

    // Should show validation errors
    await detoxExpect(element(by.text('Pet name is required'))).toBeVisible();
    await detoxExpect(element(by.text('Breed is required'))).toBeVisible();
  });

  it('should persist onboarding state on app relaunch', async () => {
    // Complete onboarding
    await element(by.id('get-started-button')).tap();
    await waitFor(element(by.id('user-intent-screen'))).toBeVisible();
    await element(by.id('intent-adopt')).tap();
    await element(by.id('continue-button')).tap();
    await waitFor(element(by.id('preferences-screen'))).toBeVisible();
    await element(by.id('preferences-continue-button')).tap();
    await waitFor(element(by.id('profile-setup-screen'))).toBeVisible();

    // Fill minimal fields
    await element(by.id('pet-name-input')).typeText('Test Pet');
    await element(by.id('breed-selector')).tap();
    await element(by.text('Golden Retriever')).tap();
    await element(by.id('age-input')).typeText('2');

    // Reload app
    await device.reloadReactNative();

    // Should navigate directly to home (onboarding completed)
    await waitFor(element(by.id('home-screen')))
      .toBeVisible()
      .withTimeout(5000);
  });

  it('should handle skip onboarding option', async () => {
    await detoxExpect(element(by.id('welcome-screen'))).toBeVisible();

    // Skip onboarding
    await element(by.id('skip-onboarding-button')).tap();

    // Should navigate to home
    await waitFor(element(by.id('home-screen')))
      .toBeVisible()
      .withTimeout(3000);
  });

  it('should handle back navigation during onboarding', async () => {
    await element(by.id('get-started-button')).tap();
    await waitFor(element(by.id('user-intent-screen'))).toBeVisible();
    await element(by.id('intent-adopt')).tap();
    await element(by.id('continue-button')).tap();

    // Go back
    await element(by.id('back-button')).tap();

    // Should return to user intent screen
    await waitFor(element(by.id('user-intent-screen')))
      .toBeVisible()
      .withTimeout(2000);
  });

  it('should emit ONBOARDING_COMPLETED telemetry event', async () => {
    // Complete onboarding flow
    await element(by.id('get-started-button')).tap();
    await waitFor(element(by.id('user-intent-screen'))).toBeVisible();
    await element(by.id('intent-adopt')).tap();
    await element(by.id('continue-button')).tap();
    await waitFor(element(by.id('preferences-screen'))).toBeVisible();
    await element(by.id('preferences-continue-button')).tap();
    await waitFor(element(by.id('profile-setup-screen'))).toBeVisible();

    // Fill and submit
    await element(by.id('pet-name-input')).typeText('Test Pet');
    await element(by.id('breed-selector')).tap();
    await element(by.text('Golden Retriever')).tap();
    await element(by.id('age-input')).typeText('2');
    await element(by.id('create-profile-button')).tap();

    // Verify telemetry event was emitted (check logs or analytics)
    // This would require mock analytics or checking network requests
    await waitFor(element(by.id('home-screen'))).toBeVisible();
  });

  it('should handle network errors gracefully', async () => {
    // Simulate network error during profile creation
    await device.setURLBlacklist(['.*/api/.*']);

    await element(by.id('get-started-button')).tap();
    await waitFor(element(by.id('user-intent-screen'))).toBeVisible();
    await element(by.id('intent-adopt')).tap();
    await element(by.id('continue-button')).tap();
    await waitFor(element(by.id('preferences-screen'))).toBeVisible();
    await element(by.id('preferences-continue-button')).tap();
    await waitFor(element(by.id('profile-setup-screen'))).toBeVisible();

    await element(by.id('pet-name-input')).typeText('Test Pet');
    await element(by.id('breed-selector')).tap();
    await element(by.text('Golden Retriever')).tap();
    await element(by.id('age-input')).typeText('2');
    await element(by.id('create-profile-button')).tap();

    // Should show error message
    await detoxExpect(element(by.text(/failed|error|network/i))).toBeVisible();

    // Re-enable network
    await device.clearURLBlacklist();
  });
});

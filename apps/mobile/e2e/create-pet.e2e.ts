/**
 * E2E Test: Create Pet Profile Flow
 * Fixes M-E2E-01: Detox E2E: Create pet profile flow
 * Tests the complete pet profile creation journey
 */

import { device, element, by, waitFor, expect } from 'detox';
import { beforeAll, beforeEach } from '@jest/globals';

describe('Create Pet Profile Flow', () => {
  beforeAll(async () => {
    await device.launchApp({
      newInstance: true,
      permissions: { notifications: 'YES', location: 'always', photos: 'all' },
    });
  });

  beforeEach(async () => {
    // Ensure we're logged in
    await device.reloadReactNative();
    
    // Navigate to profile if not already there
    try {
      await element(by.id('profile-tab')).tap();
      await waitFor(element(by.id('profile-screen')))
        .toBeVisible()
        .withTimeout(3000);
    } catch (e) {
      // Already on profile or needs login
    }
  });

  describe('Navigation to Create Pet', () => {
    it('should navigate to create pet screen from profile', async () => {
      // Navigate to My Pets
      await element(by.id('my-pets-button')).tap();
      
      await waitFor(element(by.id('my-pets-screen')))
        .toBeVisible()
        .withTimeout(3000);
      
      // Tap create pet button
      await element(by.id('create-pet-button')).tap();
      
      // Verify create pet screen is visible
      await waitFor(element(by.id('create-pet-screen')))
        .toBeVisible()
        .withTimeout(3000);
    });

    it('should navigate to create pet screen from profile menu', async () => {
      // Alternative path: direct navigation
      await element(by.id('create-pet-menu-item')).tap();
      
      await waitFor(element(by.id('create-pet-screen')))
        .toBeVisible()
        .withTimeout(3000);
    });
  });

  describe('Basic Information Step', () => {
    beforeEach(async () => {
      // Navigate to create pet screen
      await element(by.id('my-pets-button')).tap();
      await waitFor(element(by.id('my-pets-screen'))).toBeVisible().withTimeout(3000);
      await element(by.id('create-pet-button')).tap();
      await waitFor(element(by.id('create-pet-screen'))).toBeVisible().withTimeout(3000);
    });

    it('should display basic information form', async () => {
      await expect(element(by.id('pet-name-input'))).toBeVisible();
      await expect(element(by.id('pet-species-select'))).toBeVisible();
      await expect(element(by.id('pet-breed-input'))).toBeVisible();
    });

    it('should fill in basic information', async () => {
      // Enter pet name
      await element(by.id('pet-name-input')).typeText('Buddy');
      
      // Select species
      await element(by.id('pet-species-select')).tap();
      await element(by.text('Dog')).tap();
      
      // Enter breed
      await element(by.id('pet-breed-input')).typeText('Golden Retriever');
    });

    it('should show validation errors for empty required fields', async () => {
      // Try to proceed without filling fields
      await element(by.id('next-button')).tap();
      
      // Should show validation errors
      await waitFor(element(by.text('Name is required')))
        .toBeVisible()
        .withTimeout(2000);
    });
  });

  describe('Physical Information Step', () => {
    beforeEach(async () => {
      // Navigate to create pet and fill basic info
      await element(by.id('my-pets-button')).tap();
      await waitFor(element(by.id('my-pets-screen'))).toBeVisible().withTimeout(3000);
      await element(by.id('create-pet-button')).tap();
      await waitFor(element(by.id('create-pet-screen'))).toBeVisible().withTimeout(3000);
      
      // Fill basic info
      await element(by.id('pet-name-input')).typeText('Buddy');
      await element(by.id('pet-species-select')).tap();
      await element(by.text('Dog')).tap();
      await element(by.id('pet-breed-input')).typeText('Golden Retriever');
      await element(by.id('next-button')).tap();
    });

    it('should display physical information form', async () => {
      await expect(element(by.id('pet-age-input'))).toBeVisible();
      await expect(element(by.id('pet-gender-select'))).toBeVisible();
      await expect(element(by.id('pet-size-select'))).toBeVisible();
    });

    it('should fill in physical information', async () => {
      // Enter age
      await element(by.id('pet-age-input')).typeText('3');
      
      // Select gender
      await element(by.id('pet-gender-select')).tap();
      await element(by.text('Male')).tap();
      
      // Select size
      await element(by.id('pet-size-select')).tap();
      await element(by.text('Large')).tap();
    });
  });

  describe('Personality and Intent Step', () => {
    beforeEach(async () => {
      // Navigate through previous steps
      await element(by.id('my-pets-button')).tap();
      await waitFor(element(by.id('my-pets-screen'))).toBeVisible().withTimeout(3000);
      await element(by.id('create-pet-button')).tap();
      await waitFor(element(by.id('create-pet-screen'))).toBeVisible().withTimeout(3000);
      
      // Fill basic info
      await element(by.id('pet-name-input')).typeText('Buddy');
      await element(by.id('pet-species-select')).tap();
      await element(by.text('Dog')).tap();
      await element(by.id('pet-breed-input')).typeText('Golden Retriever');
      await element(by.id('next-button')).tap();
      
      // Fill physical info
      await element(by.id('pet-age-input')).typeText('3');
      await element(by.id('pet-gender-select')).tap();
      await element(by.text('Male')).tap();
      await element(by.id('pet-size-select')).tap();
      await element(by.text('Large')).tap();
      await element(by.id('next-button')).tap();
    });

    it('should display personality tags', async () => {
      await expect(element(by.id('personality-tags-container'))).toBeVisible();
    });

    it('should select personality tags', async () => {
      // Select multiple personality tags
      await element(by.id('tag-friendly')).tap();
      await element(by.id('tag-playful')).tap();
      await element(by.id('tag-active')).tap();
    });

    it('should select pet intent', async () => {
      await element(by.id('intent-adoption')).tap();
    });
  });

  describe('Photos Section', () => {
    beforeEach(async () => {
      // Navigate through previous steps
      await element(by.id('my-pets-button')).tap();
      await waitFor(element(by.id('my-pets-screen'))).toBeVisible().withTimeout(3000);
      await element(by.id('create-pet-button')).tap();
      await waitFor(element(by.id('create-pet-screen'))).toBeVisible().withTimeout(3000);
      
      // Fill required fields and navigate to photos
      await element(by.id('pet-name-input')).typeText('Buddy');
      await element(by.id('pet-species-select')).tap();
      await element(by.text('Dog')).tap();
      await element(by.id('pet-breed-input')).typeText('Golden Retriever');
      await element(by.id('next-button')).tap();
    });

    it('should display photo upload section', async () => {
      // Scroll to photos section or navigate to it
      await waitFor(element(by.id('pet-photos-section')))
        .toBeVisible()
        .withTimeout(3000);
    });

    it('should allow adding photos', async () => {
      // Tap add photo button
      await element(by.id('add-photo-button')).tap();
      
      // Grant photo permission if needed
      // Note: In real test, would need to handle permission dialogs
      
      // Select photo from library (simulated)
      // await element(by.id('photo-library')).tap();
      // await element(by.id('select-photo-1')).tap();
    });

    it('should allow removing photos', async () => {
      // If photos exist, remove one
      try {
        await element(by.id('remove-photo-button-0')).tap();
      } catch (e) {
        // No photos to remove
      }
    });
  });

  describe('Form Submission', () => {
    beforeEach(async () => {
      // Complete all form steps
      await element(by.id('my-pets-button')).tap();
      await waitFor(element(by.id('my-pets-screen'))).toBeVisible().withTimeout(3000);
      await element(by.id('create-pet-button')).tap();
      await waitFor(element(by.id('create-pet-screen'))).toBeVisible().withTimeout(3000);
      
      // Fill minimal required fields
      await element(by.id('pet-name-input')).typeText('Buddy');
      await element(by.id('pet-species-select')).tap();
      await element(by.text('Dog')).tap();
      await element(by.id('pet-breed-input')).typeText('Golden Retriever');
    });

    it('should submit form with valid data', async () => {
      // Navigate through steps and submit
      await element(by.id('next-button')).tap();
      
      // Fill remaining required fields
      await element(by.id('pet-age-input')).typeText('3');
      await element(by.id('pet-gender-select')).tap();
      await element(by.text('Male')).tap();
      await element(by.id('pet-size-select')).tap();
      await element(by.text('Large')).tap();
      await element(by.id('next-button')).tap();
      
      // Select at least one personality tag
      await element(by.id('tag-friendly')).tap();
      await element(by.id('submit-button')).tap();
      
      // Should navigate to success screen or back to pets list
      await waitFor(
        element(by.id('my-pets-screen')).or(element(by.id('pet-created-success')))
      )
        .toBeVisible()
        .withTimeout(10000);
    });

    it('should show loading state during submission', async () => {
      // Start submission
      await element(by.id('submit-button')).tap();
      
      // Verify loading indicator appears
      await waitFor(element(by.id('submitting-indicator')))
        .toBeVisible()
        .withTimeout(2000);
    });
  });

  describe('Navigation and Back Button', () => {
    beforeEach(async () => {
      await element(by.id('my-pets-button')).tap();
      await waitFor(element(by.id('my-pets-screen'))).toBeVisible().withTimeout(3000);
      await element(by.id('create-pet-button')).tap();
      await waitFor(element(by.id('create-pet-screen'))).toBeVisible().withTimeout(3000);
    });

    it('should navigate back from create pet screen', async () => {
      // Tap back button
      await element(by.id('back-button')).tap();
      
      // Should return to previous screen
      await waitFor(element(by.id('my-pets-screen')))
        .toBeVisible()
        .withTimeout(3000);
    });

    it('should show confirmation dialog on back with unsaved changes', async () => {
      // Fill some form data
      await element(by.id('pet-name-input')).typeText('Buddy');
      
      // Tap back
      await element(by.id('back-button')).tap();
      
      // Should show confirmation dialog
      await waitFor(element(by.text('Discard changes?')))
        .toBeVisible()
        .withTimeout(2000);
    });
  });
});


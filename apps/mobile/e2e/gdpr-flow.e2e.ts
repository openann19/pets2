/**
 * GDPR Compliance E2E Tests
 * Mobile app E2E tests for GDPR features (deletion, export)
 */

import { by, device, element, expect as detoxExpect } from 'detox';

describe('GDPR Compliance Flow', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  describe('Account Deletion Flow', () => {
    it('should allow user to request account deletion', async () => {
      // Navigate to Settings
      await element(by.id('tab-settings')).tap();
      
      // Navigate to Privacy Settings
      await element(by.text('Privacy Settings')).tap();
      
      // Tap on Deactivate Account
      await element(by.text('Deactivate Account')).tap();
      
      // Confirm deletion modal should appear
      await detoxExpect(element(by.text('Are you sure you want to delete your account?'))).toBeVisible();
      
      // Enter password
      await element(by.id('password-input')).typeText('testpassword123');
      
      // Select reason (if applicable)
      await element(by.id('reason-select')).tap();
      await element(by.text('No longer needed')).tap();
      
      // Submit deletion request
      await element(by.id('submit-deletion')).tap();
      
      // Should see success message
      await detoxExpect(element(by.text(/Your account will be deleted in 30 days/i))).toBeVisible();
    });

    it('should show grace period countdown', async () => {
      // Navigate to account status
      await element(by.id('tab-settings')).tap();
      await element(by.text('Privacy Settings')).tap();
      
      // Check deletion status
      await detoxExpect(element(by.text(/Days remaining: \d+/))).toBeVisible();
    });

    it('should allow cancellation during grace period', async () => {
      // Navigate to deletion status
      await element(by.id('tab-settings')).tap();
      await element(by.text('Privacy Settings')).tap();
      await element(by.text('Account Deletion')).tap();
      
      // Cancel deletion
      await element(by.id('cancel-deletion-button')).tap();
      await element(by.text('Yes, cancel deletion')).tap();
      
      // Should see cancellation success
      await detoxExpect(element(by.text(/Deletion cancelled/i))).toBeVisible();
    });
  });

  describe('Data Export Flow', () => {
    it('should export user data', async () => {
      // Navigate to Privacy Settings
      await element(by.id('tab-settings')).tap();
      await element(by.text('Privacy Settings')).tap();
      
      // Tap Export Data
      await element(by.text('Export My Data')).tap();
      
      // Select format
      await element(by.id('format-json')).tap();
      
      // Select data to include
      await element(by.id('include-messages')).tap();
      await element(by.id('include-matches')).tap();
      
      // Request export
      await element(by.id('request-export')).tap();
      
      // Should see confirmation
      await detoxExpect(element(by.text(/Export requested/i))).toBeVisible();
    });

    it('should allow downloading exported data', async () => {
      // Navigate to export download
      await element(by.id('tab-settings')).tap();
      await element(by.text('Privacy Settings')).tap();
      await element(by.text('My Data Export')).tap();
      
      // Download export
      if (await element(by.id('download-export')).exists()) {
        await element(by.id('download-export')).tap();
        // Should trigger download or show success
      }
    });
  });
});


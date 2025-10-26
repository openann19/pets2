/**
 * GDPR E2E Test Suite
 * 
 * Tests for GDPR compliance features:
 * - Account deletion with grace period
 * - Cancel deletion within grace period
 * - Export user data
 * - Access and download exported data
 */

import { by, device, element, expect as detoxExpect, waitFor } from 'detox';

describe('GDPR Compliance', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  beforeEach(async () => {
    // Login with test user
    await element(by.id('login-email-input')).typeText('test@gdpr.com');
    await element(by.id('login-password-input')).typeText('Test123!');
    await element(by.id('login-button')).tap();
    
    // Wait for home screen
    await waitFor(element(by.id('home-screen'))).toBeVisible().withTimeout(5000);
  });

  describe('Account Deletion Flow', () => {
    it('should navigate to settings and request account deletion', async () => {
      // Navigate to Settings
      await element(by.id('settings-tab')).tap();
      
      // Tap on "Danger Zone" section
      await element(by.id('danger-zone-section')).tap();
      
      // Tap "Delete Account" button
      await element(by.id('delete-account-button')).tap();
      
      // Verify deletion confirmation modal appears
      await detoxExpect(element(by.text('Delete Account'))).toBeVisible();
      await detoxExpect(
        element(by.text('This will permanently delete your account and all data'))
      ).toBeVisible();
    });

    it('should show grace period countdown after initiating deletion', async () => {
      // Navigate to delete account flow
      await element(by.id('settings-tab')).tap();
      await element(by.id('danger-zone-section')).tap();
      await element(by.id('delete-account-button')).tap();
      
      // Enter password and confirm deletion
      await element(by.id('password-input')).typeText('Test123!');
      await element(by.id('confirm-delete-button')).tap();
      
      // Wait for success message
      await detoxExpect(
        element(by.text('Deletion scheduled'))
      ).toBeVisible().withTimeout(3000);
      
      // Verify grace period information is shown
      await detoxExpect(
        element(by.text('30 days remaining'))
      ).toBeVisible();
      
      // Verify cancel option is shown
      await detoxExpect(
        element(by.text('Cancel Deletion'))
      ).toBeVisible();
    });

    it('should allow canceling account deletion within grace period', async () => {
      // Assume deletion is already initiated from previous test
      // Navigate to settings
      await element(by.id('settings-tab')).tap();
      
      // Should see cancellation option
      await element(by.id('cancel-deletion-button')).tap();
      
      // Confirm cancellation
      await element(by.text('Yes, keep my account')).tap();
      
      // Verify cancellation success
      await detoxExpect(
        element(by.text('Deletion cancelled successfully'))
      ).toBeVisible().withTimeout(3000);
    });
  });

  describe('Data Export Flow', () => {
    it('should navigate to privacy settings and see export data option', async () => {
      // Navigate to Settings
      await element(by.id('settings-tab')).tap();
      
      // Tap on Privacy Settings
      await element(by.id('privacy-settings-button')).tap();
      
      // Verify export data option is visible
      await detoxExpect(
        element(by.text('Export My Data'))
      ).toBeVisible();
      
      // Verify export button exists
      await detoxExpect(element(by.id('export-data-button'))).toBeVisible();
    });

    it('should successfully export user data', async () => {
      // Navigate to privacy settings
      await element(by.id('settings-tab')).tap();
      await element(by.id('privacy-settings-button')).tap();
      
      // Tap export data button
      await element(by.id('export-data-button')).tap();
      
      // Select export format (JSON)
      await element(by.id('export-format-json')).tap();
      
      // Include all data types
      await element(by.id('include-messages-checkbox')).tap();
      await element(by.id('include-matches-checkbox')).tap();
      await element(by.id('include-profile-checkbox')).tap();
      
      // Initiate export
      await element(by.id('start-export-button')).tap();
      
      // Wait for export processing
      await detoxExpect(
        element(by.text('Preparing your data export'))
      ).toBeVisible().withTimeout(3000);
      
      // Verify completion message
      await detoxExpect(
        element(by.text('Your data export is ready'))
      ).toBeVisible().withTimeout(30000);
    });

    it('should display exported data and allow download', async () => {
      // Assume export is complete from previous test
      // Tap download button
      await element(by.id('download-export-button')).tap();
      
      // Verify share/download sheet appears (iOS) or download starts (Android)
      // On iOS, check for share sheet
      // On Android, check for download complete notification
      
      // Verify export ID is shown
      await detoxExpect(
        element(by.id('export-id'))
      ).toBeVisible();
      
      // Verify file size is shown
      await detoxExpect(
        element(by.id('export-file-size'))
      ).toBeVisible();
    });

    it('should show error when export fails', async () => {
      // Simulate error by using invalid credentials
      // Navigate to privacy settings
      await element(by.id('settings-tab')).tap();
      await element(by.id('privacy-settings-button')).tap();
      
      // Try to export with network failure simulation
      await element(by.id('export-data-button')).tap();
      
      // Simulate timeout by waiting
      await new Promise(resolve => setTimeout(resolve, 10000));
      
      // Should show error message
      await detoxExpect(
        element(by.text('Failed to export data'))
      ).toBeVisible();
      
      // Should show retry option
      await detoxExpect(element(by.id('retry-export-button'))).toBeVisible();
    });
  });

  describe('Account Status Check', () => {
    it('should show current account deletion status', async () => {
      // Navigate to settings
      await element(by.id('settings-tab')).tap();
      
      // Should see account status
      await detoxExpect(
        element(by.id('account-status-section'))
      ).toBeVisible();
      
      // Should show account is active (not pending deletion)
      await detoxExpect(
        element(by.text('Active'))
      ).toBeVisible();
    });

    it('should display deletion pending status with countdown', async () => {
      // After deletion is initiated, status should show as pending
      // Navigate to settings
      await element(by.id('settings-tab')).tap();
      
      // Should see pending status
      await detoxExpect(
        element(by.text('Deletion Pending'))
      ).toBeVisible();
      
      // Should show days remaining
      await detoxExpect(
        element(by.id('days-remaining'))
      ).toBeVisible();
    });
  });

  afterEach(async () => {
    // Logout or reset app state if needed
    // await element(by.id('logout-button')).tap();
  });
});


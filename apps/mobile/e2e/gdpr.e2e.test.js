/**
 * GDPR Compliance E2E Tests
 * Tests for delete account, export data, grace period, and cancel deletion flows
 */

const { device, element, by, waitFor } = require('detox');

describe('GDPR Compliance E2E', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  beforeEach(async () => {
    await device.reloadReactNative();
    
    // Login as authenticated user
    await global.testUtils.mockNetworkResponse('/auth/login', {
      success: true,
      user: { id: 'test-user', email: 'test@example.com' },
      accessToken: 'test-token'
    });

    await global.testUtils.typeText('email-input', 'test@example.com');
    await global.testUtils.typeText('password-input', 'password123');
    await global.testUtils.tapElement('login-button');
    await global.testUtils.waitForElement('home-screen');
  });

  describe('Account Deletion Flow', () => {
    beforeEach(async () => {
      // Navigate to Settings
      await global.testUtils.tapElement('settings-tab');
      await global.testUtils.waitForElement('settings-screen');
    });

    it('should navigate to Delete Account screen', async () => {
      // Scroll to find delete account option
      await global.testUtils.scrollToElement('delete-account-option');
      await global.testUtils.tapElement('delete-account-option');
      
      await global.testUtils.waitForElement('delete-account-screen');
      await global.testUtils.takeScreenshot('delete-account-screen');
    });

    it('should show warning and data to be deleted', async () => {
      await global.testUtils.navigateTo('DeleteAccount');
      
      await global.testUtils.waitForText('Are you sure you want to delete your account?');
      await global.testUtils.waitForText('This action will permanently delete');
      
      // Verify data list is shown
      await global.testUtils.waitForElement('data-list');
      await global.testUtils.takeScreenshot('delete-account-warning');
    });

    it('should allow selecting deletion reason', async () => {
      await global.testUtils.navigateTo('DeleteAccount');
      
      // Select a reason
      await global.testUtils.tapElement('reason-found-match');
      await expect(element(by.id('reason-found-match'))).toHaveValue('found_match');
      
      await global.testUtils.takeScreenshot('reason-selected');
    });

    it('should require password to confirm deletion', async () => {
      await global.testUtils.navigateTo('DeleteAccount');
      
      // Select reason
      await global.testUtils.tapElement('reason-found-match');
      
      // Try to proceed without password
      await global.testUtils.tapElement('continue-button');
      
      await global.testUtils.waitForText('Please enter your password to confirm');
    });

    it('should schedule account deletion with grace period', async () => {
      await global.testUtils.navigateTo('DeleteAccount');
      
      // Select reason
      await global.testUtils.tapElement('reason-found-match');
      
      // Enter password
      await global.testUtils.typeText('password-input', 'password123');
      
      // Mock deletion API
      const gracePeriodEndsAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
      await global.testUtils.mockNetworkResponse('/users/delete-account', {
        success: true,
        message: 'Deletion scheduled',
        gracePeriodEndsAt
      });
      
      // Confirm deletion
      await global.testUtils.tapElement('confirm-deletion-button');
      
      // Should show success message
      await global.testUtils.waitForText('Account Deletion Scheduled');
      await global.testUtils.waitForText('30 days to cancel');
      
      await global.testUtils.takeScreenshot('deletion-scheduled');
    });

    it('should logout after scheduling deletion', async () => {
      await global.testUtils.navigateTo('DeleteAccount');
      await global.testUtils.tapElement('reason-found-match');
      await global.testUtils.typeText('password-input', 'password123');
      
      await global.testUtils.mockNetworkResponse('/users/delete-account', {
        success: true,
        message: 'Deletion scheduled',
        gracePeriodEndsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      });
      
      await global.testUtils.tapElement('confirm-deletion-button');
      await global.testUtils.waitForText('Account Deletion Scheduled');
      await global.testUtils.tapElement('ok-button');
      
      // Should be redirected to login
      await global.testUtils.waitForElement('login-screen');
      await global.testUtils.takeScreenshot('logged-out-after-deletion');
    });

    it('should handle deletion API error', async () => {
      await global.testUtils.navigateTo('DeleteAccount');
      await global.testUtils.tapElement('reason-found-match');
      await global.testUtils.typeText('password-input', 'wrong-password');
      
      await global.testUtils.mockNetworkResponse('/users/delete-account', {
        success: false,
        error: 'Invalid password'
      });
      
      await global.testUtils.tapElement('confirm-deletion-button');
      
      await global.testUtils.waitForText('Invalid password');
      await global.testUtils.takeScreenshot('deletion-error');
    });
  });

  describe('Export Data Flow', () => {
    beforeEach(async () => {
      await global.testUtils.tapElement('settings-tab');
      await global.testUtils.waitForElement('settings-screen');
      await global.testUtils.scrollToElement('export-data-option');
      await global.testUtils.tapElement('export-data-option');
    });

    it('should initiate data export', async () => {
      await global.testUtils.waitForElement('export-data-screen');
      
      await global.testUtils.mockNetworkResponse('/users/export-data', {
        success: true,
        downloadUrl: 'https://api.pawfectmatch.com/downloads/user-data.json',
        expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString()
      });
      
      await global.testUtils.tapElement('export-button');
      
      await global.testUtils.waitForText('Data Export Started');
      await global.testUtils.waitForText('download link at your email');
      
      await global.testUtils.takeScreenshot('export-initiated');
    });

    it('should show expiration date for export', async () => {
      await global.testUtils.mockNetworkResponse('/users/export-data', {
        success: true,
        downloadUrl: 'https://api.pawfectmatch.com/downloads/user-data.json',
        expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString()
      });
      
      await global.testUtils.tapElement('export-button');
      
      // Should show expiration info
      const expiresText = await element(by.id('expires-text')).getText();
      expect(expiresText).toContain('expires');
      
      await global.testUtils.takeScreenshot('export-expiration');
    });

    it('should handle export error', async () => {
      await global.testUtils.mockNetworkResponse('/users/export-data', {
        success: false,
        error: 'Export failed. Please try again.'
      });
      
      await global.testUtils.tapElement('export-button');
      
      await global.testUtils.waitForText('Failed to export your data');
      await global.testUtils.takeScreenshot('export-error');
    });
  });

  describe('Cancel Deletion Flow (Grace Period)', () => {
    beforeEach(async () => {
      // Simulate user with active deletion request
      await global.testUtils.mockNetworkResponse('/auth/login', {
        success: true,
        user: { 
          id: 'test-user', 
          email: 'test@example.com',
          deletionScheduledAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          gracePeriodEndsAt: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString()
        },
        accessToken: 'test-token'
      });
      
      await device.reloadReactNative();
      await global.testUtils.waitForElement('home-screen');
    });

    it('should show grace period warning on login', async () => {
      await global.testUtils.waitForElement('grace-period-warning');
      await global.testUtils.waitForText('Your account is scheduled for deletion');
      
      await global.testUtils.takeScreenshot('grace-period-warning');
    });

    it('should allow canceling deletion during grace period', async () => {
      await global.testUtils.tapElement('cancel-deletion-button');
      
      await global.testUtils.mockNetworkResponse('/users/cancel-deletion', {
        success: true,
        message: 'Deletion canceled'
      });
      
      await global.testUtils.waitForText('Deletion canceled');
      await global.testUtils.takeScreenshot('deletion-canceled');
    });

    it('should show remaining days in grace period', async () => {
      const remainingText = await element(by.id('remaining-days')).getText();
      expect(remainingText).toContain('25 days');
      
      await global.testUtils.takeScreenshot('grace-period-remaining');
    });
  });

  describe('User Data Portability (GDPR Article 20)', () => {
    beforeEach(async () => {
      await global.testUtils.tapElement('settings-tab');
      await global.testUtils.waitForElement('settings-screen');
    });

    it('should export data in machine-readable format', async () => {
      await global.testUtils.mockNetworkResponse('/users/export-data', {
        success: true,
        downloadUrl: 'https://api.pawfectmatch.com/downloads/user-data-12345.json',
        expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
        data: {
          user: { id: 'test-user', email: 'test@example.com', createdAt: '2024-01-01' },
          pets: [],
          matches: [],
          messages: [],
          preferences: {}
        }
      });
      
      await global.testUtils.scrollToElement('export-data-option');
      await global.testUtils.tapElement('export-data-option');
      await global.testUtils.tapElement('export-button');
      
      await global.testUtils.waitForText('download link');
      
      // Verify download link is provided
      const downloadLink = await element(by.id('download-url')).getText();
      expect(downloadLink).toContain('.json');
      
      await global.testUtils.takeScreenshot('export-json-format');
    });

    it('should include all user data categories', async () => {
      const exportedData = {
        user: { id: 'test-user', email: 'test@example.com' },
        pets: [{ id: 'pet1', name: 'Fluffy' }],
        matches: [{ id: 'match1', matchedAt: '2024-01-01' }],
        messages: [{ id: 'msg1', content: 'Hello' }],
        preferences: { notifications: true, darkMode: false }
      };
      
      await global.testUtils.mockNetworkResponse('/users/export-data', {
        success: true,
        downloadUrl: 'https://api.pawfectmatch.com/downloads/user-data.json',
        expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
        data: exportedData
      });
      
      // Verify all categories are mentioned
      await global.testUtils.waitForText('user');
      await global.testUtils.waitForText('pets');
      await global.testUtils.waitForText('matches');
      await global.testUtils.waitForText('messages');
      
      await global.testUtils.takeScreenshot('export-all-categories');
    });
  });

  describe('Accessibility in GDPR Flows', () => {
    it('should be screen reader accessible', async () => {
      await global.testUtils.navigateTo('DeleteAccount');
      
      const warningText = element(by.id('warning-text'));
      const passwordInput = element(by.id('password-input'));
      const confirmButton = element(by.id('confirm-deletion-button'));
      
      await expect(warningText).toBeAccessible();
      await expect(passwordInput).toBeAccessible();
      await expect(confirmButton).toBeAccessible();
      
      await global.testUtils.takeScreenshot('a11y-delete-account');
    });

    it('should announce deletion confirmation', async () => {
      await global.testUtils.navigateTo('DeleteAccount');
      await global.testUtils.tapElement('reason-found-match');
      await global.testUtils.typeText('password-input', 'password123');
      
      await global.testUtils.mockNetworkResponse('/users/delete-account', {
        success: true,
        message: 'Deletion scheduled',
        gracePeriodEndsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      });
      
      await global.testUtils.tapElement('confirm-deletion-button');
      
      // Verify announcement is accessible
      const announcement = element(by.id('deletion-confirmed-announcement'));
      await expect(announcement).toBeAccessible();
      
      await global.testUtils.takeScreenshot('a11y-confirmation');
    });
  });

  describe('Error Recovery', () => {
    it('should retry on network error', async () => {
      await global.testUtils.navigateTo('DeleteAccount');
      await global.testUtils.tapElement('reason-found-match');
      await global.testUtils.typeText('password-input', 'password123');
      
      // First attempt fails
      await global.testUtils.mockNetworkResponse('/users/delete-account', {
        success: false,
        error: 'Network error'
      });
      
      await global.testUtils.tapElement('confirm-deletion-button');
      await global.testUtils.waitForText('Network error');
      
      // Retry succeeds
      await global.testUtils.mockNetworkResponse('/users/delete-account', {
        success: true,
        message: 'Deletion scheduled',
        gracePeriodEndsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      });
      
      await global.testUtils.tapElement('retry-button');
      await global.testUtils.waitForText('Account Deletion Scheduled');
      
      await global.testUtils.takeScreenshot('retry-success');
    });
  });
});


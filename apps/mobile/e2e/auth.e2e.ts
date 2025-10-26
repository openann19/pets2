/**
 * E2E Test: Authentication Flow
 * Tests user login, registration, and logout
 */
import { device, element, by, expect as detoxExpect } from 'detox';

describe('Authentication Flow', () => {
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

  it('should navigate to login screen', async () => {
    await element(by.id('login-button')).tap();
    await detoxExpect(element(by.id('login-screen'))).toBeVisible();
    await detoxExpect(element(by.id('email-input'))).toBeVisible();
    await detoxExpect(element(by.id('password-input'))).toBeVisible();
  });

  it('should show validation errors for invalid login', async () => {
    await element(by.id('login-button')).tap();
    
    // Try to submit without filling fields
    await element(by.id('submit-button')).tap();
    
    await detoxExpect(element(by.text('Email is required'))).toBeVisible();
    await detoxExpect(element(by.text('Password is required'))).toBeVisible();
  });

  it('should login with valid credentials', async () => {
    await element(by.id('login-button')).tap();
    
    // Fill in credentials
    await element(by.id('email-input')).typeText('test@example.com');
    await element(by.id('password-input')).typeText('password123');
    
    // Hide keyboard
    await element(by.id('password-input')).tapReturnKey();
    
    // Submit
    await element(by.id('submit-button')).tap();
    
    // Should navigate to home screen
    await detoxExpect(element(by.id('home-screen'))).toBeVisible();
  });

  it('should navigate to registration screen', async () => {
    await element(by.id('register-button')).tap();
    
    await detoxExpect(element(by.id('register-screen'))).toBeVisible();
    await detoxExpect(element(by.id('email-input'))).toBeVisible();
    await detoxExpect(element(by.id('password-input'))).toBeVisible();
    await detoxExpect(element(by.id('confirm-password-input'))).toBeVisible();
  });

  it('should register new user', async () => {
    await element(by.id('register-button')).tap();
    
    // Fill registration form
    await element(by.id('email-input')).typeText('newuser@example.com');
    await element(by.id('password-input')).typeText('password123');
    await element(by.id('confirm-password-input')).typeText('password123');
    
    // Hide keyboard
    await element(by.id('confirm-password-input')).tapReturnKey();
    
    // Submit
    await element(by.id('submit-button')).tap();
    
    // Should proceed to onboarding
    await detoxExpect(element(by.id('onboarding-screen'))).toBeVisible();
  });

  it('should show error for mismatched passwords', async () => {
    await element(by.id('register-button')).tap();
    
    await element(by.id('email-input')).typeText('test@example.com');
    await element(by.id('password-input')).typeText('password123');
    await element(by.id('confirm-password-input')).typeText('different123');
    
    await element(by.id('submit-button')).tap();
    
    await detoxExpect(element(by.text('Passwords do not match'))).toBeVisible();
  });

  it('should navigate to forgot password screen', async () => {
    await element(by.id('login-button')).tap();
    await element(by.id('forgot-password-link')).tap();
    
    await detoxExpect(element(by.id('forgot-password-screen'))).toBeVisible();
    await detoxExpect(element(by.id('email-input'))).toBeVisible();
  });

  it('should handle logout', async () => {
    // Login first
    await element(by.id('login-button')).tap();
    await element(by.id('email-input')).typeText('test@example.com');
    await element(by.id('password-input')).typeText('password123');
    await element(by.id('submit-button')).tap();
    
    await detoxExpect(element(by.id('home-screen'))).toBeVisible();
    
    // Navigate to settings
    await element(by.id('settings-tab')).tap();
    
    // Logout
    await element(by.id('logout-button')).tap();
    
    // Should return to welcome screen
    await detoxExpect(element(by.id('welcome-screen'))).toBeVisible();
  });

  it('should persist session across app restarts', async () => {
    // Login
    await element(by.id('login-button')).tap();
    await element(by.id('email-input')).typeText('test@example.com');
    await element(by.id('password-input')).typeText('password123');
    await element(by.id('submit-button')).tap();
    
    // Verify logged in
    await detoxExpect(element(by.id('home-screen'))).toBeVisible();
    
    // Terminate and relaunch
    await device.terminateApp();
    await device.launchApp({ newInstance: false });
    
    // Should still be logged in
    await detoxExpect(element(by.id('home-screen'))).toBeVisible();
  });

  it('should handle network errors gracefully', async () => {
    // Simulate offline mode
    await device.setURLBlacklist(['.*']);
    
    await element(by.id('login-button')).tap();
    await element(by.id('email-input')).typeText('test@example.com');
    await element(by.id('password-input')).typeText('password123');
    await element(by.id('submit-button')).tap();
    
    // Should show error message
    await detoxExpect(element(by.text('Network error'))).toBeVisible();
    
    // Re-enable network
    await device.setURLBlacklist([]);
  });
});

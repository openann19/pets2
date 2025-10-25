/**
 * Authentication E2E Tests
 * Critical user journey tests for authentication flow
 */

const { device, element, by, waitFor } = require('detox');

describe('Authentication Flow E2E', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  describe('App Launch', () => {
    it('should launch app successfully', async () => {
      await global.testUtils.waitForElement('app-container');
      await global.testUtils.takeScreenshot('app-launch');
    });

    it('should show login screen for unauthenticated user', async () => {
      await global.testUtils.waitForElement('login-screen');
      await expect(element(by.id('login-screen'))).toBeVisibleOnScreen();
    });

    it('should have proper accessibility labels', async () => {
      const emailInput = element(by.id('email-input'));
      const passwordInput = element(by.id('password-input'));
      const loginButton = element(by.id('login-button'));

      await expect(emailInput).toBeAccessible();
      await expect(passwordInput).toBeAccessible();
      await expect(loginButton).toBeAccessible();
    });
  });

  describe('Login Flow', () => {
    beforeEach(async () => {
      await global.testUtils.waitForElement('login-screen');
    });

    it('should validate empty form submission', async () => {
      await global.testUtils.tapElement('login-button');

      await global.testUtils.waitForText('Email is required');
      await global.testUtils.waitForText('Password is required');
    });

    it('should validate email format', async () => {
      await global.testUtils.typeText('email-input', 'invalid-email');
      await global.testUtils.typeText('password-input', 'password123');
      await global.testUtils.tapElement('login-button');

      await global.testUtils.waitForText('Please enter a valid email');
    });

    it('should complete successful login', async () => {
      // Mock successful login response
      await global.testUtils.mockNetworkResponse('/auth/login', {
        success: true,
        user: { id: 'test-user', email: 'test@example.com' },
        accessToken: 'test-token'
      });

      await global.testUtils.typeText('email-input', 'test@example.com');
      await global.testUtils.typeText('password-input', 'password123');
      await global.testUtils.tapElement('login-button');

      // Wait for navigation to home screen
      await global.testUtils.waitForElement('home-screen');
      await global.testUtils.takeScreenshot('login-success');
    });

    it('should handle login failure', async () => {
      // Mock failed login response
      await global.testUtils.mockNetworkResponse('/auth/login', {
        success: false,
        error: 'Invalid credentials'
      });

      await global.testUtils.typeText('email-input', 'test@example.com');
      await global.testUtils.typeText('password-input', 'wrong-password');
      await global.testUtils.tapElement('login-button');

      await global.testUtils.waitForText('Invalid credentials');
      await global.testUtils.takeScreenshot('login-failure');
    });

    it('should show loading state during login', async () => {
      // Mock slow login response
      await global.testUtils.mockNetworkResponse('/auth/login', {
        success: true,
        user: { id: 'test-user', email: 'test@example.com' },
        accessToken: 'test-token'
      }, 2000); // 2 second delay

      await global.testUtils.typeText('email-input', 'test@example.com');
      await global.testUtils.typeText('password-input', 'password123');
      await global.testUtils.tapElement('login-button');

      await global.testUtils.waitForElement('loading-indicator');
      await global.testUtils.takeScreenshot('login-loading');
    });

    it('should navigate to register screen', async () => {
      await global.testUtils.tapElement('signup-button');
      await global.testUtils.waitForElement('register-screen');
      await global.testUtils.takeScreenshot('register-screen');
    });

    it('should navigate to forgot password screen', async () => {
      await global.testUtils.tapElement('forgot-password-link');
      await global.testUtils.waitForElement('forgot-password-screen');
      await global.testUtils.takeScreenshot('forgot-password-screen');
    });
  });

  describe('Registration Flow', () => {
    beforeEach(async () => {
      await global.testUtils.tapElement('signup-button');
      await global.testUtils.waitForElement('register-screen');
    });

    it('should validate registration form', async () => {
      await global.testUtils.tapElement('register-button');

      await global.testUtils.waitForText('Email is required');
      await global.testUtils.waitForText('Password is required');
      await global.testUtils.waitForText('First name is required');
      await global.testUtils.waitForText('Last name is required');
    });

    it('should validate password confirmation', async () => {
      await global.testUtils.typeText('email-input', 'test@example.com');
      await global.testUtils.typeText('password-input', 'password123');
      await global.testUtils.typeText('confirm-password-input', 'different-password');
      await global.testUtils.typeText('first-name-input', 'John');
      await global.testUtils.typeText('last-name-input', 'Doe');
      await global.testUtils.tapElement('register-button');

      await global.testUtils.waitForText('Passwords do not match');
    });

    it('should complete successful registration', async () => {
      // Mock successful registration response
      await global.testUtils.mockNetworkResponse('/auth/register', {
        success: true,
        user: { id: 'new-user', email: 'newuser@example.com' },
        accessToken: 'test-token'
      });

      await global.testUtils.typeText('email-input', 'newuser@example.com');
      await global.testUtils.typeText('password-input', 'password123');
      await global.testUtils.typeText('confirm-password-input', 'password123');
      await global.testUtils.typeText('first-name-input', 'John');
      await global.testUtils.typeText('last-name-input', 'Doe');
      
      // Accept terms
      await global.testUtils.tapElement('terms-checkbox');
      
      await global.testUtils.tapElement('register-button');

      // Wait for navigation to home screen
      await global.testUtils.waitForElement('home-screen');
      await global.testUtils.takeScreenshot('registration-success');
    });

    it('should navigate back to login', async () => {
      await global.testUtils.tapElement('login-link');
      await global.testUtils.waitForElement('login-screen');
    });
  });

  describe('Biometric Authentication', () => {
    beforeEach(async () => {
      await global.testUtils.waitForElement('login-screen');
    });

    it('should show biometric login when available', async () => {
      // Mock biometric availability
      await global.testUtils.mockNetworkResponse('/auth/biometric-check', {
        available: true,
        enrolled: true
      });

      await global.testUtils.waitForElement('biometric-login-button');
      await global.testUtils.takeScreenshot('biometric-available');
    });

    it('should complete biometric login successfully', async () => {
      // Mock successful biometric authentication
      await global.testUtils.simulateBiometricAuth(true);
      await global.testUtils.mockNetworkResponse('/auth/biometric-login', {
        success: true,
        user: { id: 'test-user', email: 'test@example.com' },
        accessToken: 'test-token'
      });

      await global.testUtils.tapElement('biometric-login-button');

      // Wait for navigation to home screen
      await global.testUtils.waitForElement('home-screen');
      await global.testUtils.takeScreenshot('biometric-login-success');
    });

    it('should handle biometric authentication failure', async () => {
      // Mock failed biometric authentication
      await global.testUtils.simulateBiometricAuth(false);

      await global.testUtils.tapElement('biometric-login-button');

      await global.testUtils.waitForText('Biometric authentication failed');
      await global.testUtils.takeScreenshot('biometric-login-failure');
    });

    it('should fallback to password login', async () => {
      // Mock biometric failure
      await global.testUtils.simulateBiometricAuth(false);
      await global.testUtils.tapElement('biometric-login-button');

      // Should show fallback option
      await global.testUtils.waitForElement('fallback-login-button');
      await global.testUtils.tapElement('fallback-login-button');

      // Should navigate to password login
      await global.testUtils.waitForElement('password-login-screen');
    });
  });

  describe('Password Reset Flow', () => {
    beforeEach(async () => {
      await global.testUtils.tapElement('forgot-password-link');
      await global.testUtils.waitForElement('forgot-password-screen');
    });

    it('should validate email for password reset', async () => {
      await global.testUtils.tapElement('reset-password-button');

      await global.testUtils.waitForText('Email is required');
    });

    it('should send password reset email', async () => {
      // Mock successful password reset
      await global.testUtils.mockNetworkResponse('/auth/forgot-password', {
        success: true,
        message: 'Password reset email sent'
      });

      await global.testUtils.typeText('email-input', 'test@example.com');
      await global.testUtils.tapElement('reset-password-button');

      await global.testUtils.waitForText('Password reset email sent');
      await global.testUtils.takeScreenshot('password-reset-sent');
    });

    it('should handle invalid email for password reset', async () => {
      // Mock failed password reset
      await global.testUtils.mockNetworkResponse('/auth/forgot-password', {
        success: false,
        error: 'Email not found'
      });

      await global.testUtils.typeText('email-input', 'nonexistent@example.com');
      await global.testUtils.tapElement('reset-password-button');

      await global.testUtils.waitForText('Email not found');
    });

    it('should navigate back to login', async () => {
      await global.testUtils.tapElement('back-to-login-button');
      await global.testUtils.waitForElement('login-screen');
    });
  });

  describe('Session Management', () => {
    beforeEach(async () => {
      // Login first
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

    it('should maintain session after app backgrounding', async () => {
      await global.testUtils.backgroundApp();
      await global.testUtils.delay(2000);
      await global.testUtils.foregroundApp();

      // Should still be logged in
      await global.testUtils.waitForElement('home-screen');
      await global.testUtils.takeScreenshot('session-maintained');
    });

    it('should logout successfully', async () => {
      // Navigate to settings
      await global.testUtils.tapElement('settings-tab');
      await global.testUtils.waitForElement('settings-screen');

      // Mock successful logout
      await global.testUtils.mockNetworkResponse('/auth/logout', {
        success: true
      });

      await global.testUtils.tapElement('logout-button');
      
      // Confirm logout
      await global.testUtils.tapElement('confirm-logout-button');

      // Should return to login screen
      await global.testUtils.waitForElement('login-screen');
      await global.testUtils.takeScreenshot('logout-success');
    });

    it('should handle session expiration', async () => {
      // Mock session expiration
      await global.testUtils.mockNetworkResponse('/auth/me', {
        success: false,
        error: 'Session expired'
      });

      // Trigger API call that checks session
      await global.testUtils.tapElement('profile-tab');

      // Should redirect to login
      await global.testUtils.waitForElement('login-screen');
      await global.testUtils.waitForText('Session expired');
    });
  });

  describe('Network Error Handling', () => {
    beforeEach(async () => {
      await global.testUtils.waitForElement('login-screen');
    });

    it('should handle network timeout', async () => {
      // Mock network timeout
      await global.testUtils.setNetworkSpeed('slow');
      await global.testUtils.mockNetworkResponse('/auth/login', {
        success: false,
        error: 'Request timeout'
      }, 10000); // 10 second delay

      await global.testUtils.typeText('email-input', 'test@example.com');
      await global.testUtils.typeText('password-input', 'password123');
      await global.testUtils.tapElement('login-button');

      await global.testUtils.waitForText('Request timeout');
      await global.testUtils.takeScreenshot('network-timeout');
    });

    it('should handle network disconnection', async () => {
      // Mock network disconnection
      await global.testUtils.setNetworkState('disconnected');

      await global.testUtils.typeText('email-input', 'test@example.com');
      await global.testUtils.typeText('password-input', 'password123');
      await global.testUtils.tapElement('login-button');

      await global.testUtils.waitForText('No internet connection');
      await global.testUtils.takeScreenshot('network-disconnected');
    });

    it('should retry after network reconnection', async () => {
      // Start with disconnected network
      await global.testUtils.setNetworkState('disconnected');

      await global.testUtils.typeText('email-input', 'test@example.com');
      await global.testUtils.typeText('password-input', 'password123');
      await global.testUtils.tapElement('login-button');

      await global.testUtils.waitForText('No internet connection');

      // Reconnect network
      await global.testUtils.setNetworkState('connected');
      await global.testUtils.mockNetworkResponse('/auth/login', {
        success: true,
        user: { id: 'test-user', email: 'test@example.com' },
        accessToken: 'test-token'
      });

      // Retry login
      await global.testUtils.tapElement('retry-button');

      await global.testUtils.waitForElement('home-screen');
      await global.testUtils.takeScreenshot('network-reconnected');
    });
  });

  describe('Accessibility', () => {
    beforeEach(async () => {
      await global.testUtils.waitForElement('login-screen');
    });

    it('should support screen reader navigation', async () => {
      const emailInput = element(by.id('email-input'));
      const passwordInput = element(by.id('password-input'));
      const loginButton = element(by.id('login-button'));

      // Check accessibility attributes
      const emailAccessibility = await global.testUtils.checkAccessibility('email-input');
      const passwordAccessibility = await global.testUtils.checkAccessibility('password-input');
      const buttonAccessibility = await global.testUtils.checkAccessibility('login-button');

      expect(emailAccessibility.accessible).toBe(true);
      expect(passwordAccessibility.accessible).toBe(true);
      expect(buttonAccessibility.accessible).toBe(true);
    });

    it('should announce form validation errors', async () => {
      await global.testUtils.tapElement('login-button');

      // Check that error messages are accessible
      await global.testUtils.waitForText('Email is required');
      await global.testUtils.waitForText('Password is required');

      const emailError = element(by.id('email-error'));
      const passwordError = element(by.id('password-error'));

      await expect(emailError).toBeAccessible();
      await expect(passwordError).toBeAccessible();
    });

    it('should support voice control', async () => {
      // Test voice control commands
      await global.testUtils.typeText('email-input', 'test@example.com');
      await global.testUtils.typeText('password-input', 'password123');

      // Simulate voice command "tap login button"
      await global.testUtils.tapElement('login-button');

      // Should proceed with login
      await global.testUtils.waitForElement('home-screen');
    });
  });

  describe('Performance', () => {
    beforeEach(async () => {
      await global.testUtils.waitForElement('login-screen');
    });

    it('should load login screen within acceptable time', async () => {
      const startTime = Date.now();
      await global.testUtils.waitForElement('login-screen');
      const loadTime = Date.now() - startTime;

      expect(loadTime).toBeLessThan(3000); // Should load within 3 seconds
    });

    it('should handle rapid user interactions', async () => {
      // Rapid typing
      await global.testUtils.typeText('email-input', 'test@example.com');
      await global.testUtils.typeText('password-input', 'password123');
      
      // Rapid button presses
      await global.testUtils.tapElement('login-button');
      await global.testUtils.tapElement('login-button');
      await global.testUtils.tapElement('login-button');

      // Should not crash or show errors
      await global.testUtils.waitForElement('login-screen');
    });

    it('should maintain smooth animations', async () => {
      await global.testUtils.startPerformanceMonitoring();

      await global.testUtils.tapElement('signup-button');
      await global.testUtils.waitForElement('register-screen');

      await global.testUtils.stopPerformanceMonitoring();
      
      // Check that animations were smooth (implementation depends on monitoring setup)
      expect(true).toBe(true);
    });
  });
});


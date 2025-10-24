/**
 * Comprehensive Error Handling Tests
 * Tests for error boundaries, payment flows, offline scenarios, and edge cases
 */
import { test, expect } from '@playwright/test';

test.describe('Error Handling & Recovery', () => {
  test.beforeEach(async ({ page }) => {
    // Setup error monitoring
    await page.addInitScript(() => {
      window.errorLog = [];
      window.addEventListener('error', (event) => {
        window.errorLog.push({
          type: 'error',
          message: event.message,
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
          error: event.error?.stack
        });
      });
      
      window.addEventListener('unhandledrejection', (event) => {
        window.errorLog.push({
          type: 'unhandledrejection',
          reason: event.reason?.message || event.reason,
          promise: event.promise
        });
      });
    });
  });

  test('Error Boundary catches React component errors', async ({ page }) => {
    await page.goto('/');
    
    // Simulate a component error by injecting problematic code
    await page.addScriptTag({
      content: `
        // Simulate a component error
        setTimeout(() => {
          throw new Error('Test component error');
        }, 100);
      `
    });
    
    // Wait for error to be caught
    await page.waitForTimeout(200);
    
    // Check if error boundary is displayed
    await expect(page.locator('text=Something went wrong')).toBeVisible();
    await expect(page.locator('text=Refresh Page')).toBeVisible();
    
    // Verify error was logged
    const errors = await page.evaluate(() => window.errorLog);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].type).toBe('error');
  });

  test('Payment flow handles Stripe errors gracefully', async ({ page }) => {
    await page.goto('/premium');
    
    // Mock Stripe to return an error
    await page.addInitScript(() => {
      window.Stripe = {
        initPaymentSheet: () => Promise.resolve({ error: { message: 'Payment method declined' } }),
        presentPaymentSheet: () => Promise.resolve({ error: { message: 'Payment failed' } })
      };
    });
    
    // Attempt to subscribe
    await page.click('text=Start Monthly Plan');
    
    // Should show error message
    await expect(page.locator('text=Payment Failed')).toBeVisible();
    await expect(page.locator('text=Payment method declined')).toBeVisible();
  });

  test('Offline service handles network failures', async ({ page }) => {
    await page.goto('/');
    
    // Simulate offline mode
    await page.context().setOffline(true);
    
    // Try to perform an action that requires network
    await page.click('text=Like');
    
    // Should show offline indicator or cached data
    await expect(page.locator('text=Offline')).toBeVisible();
    
    // Go back online
    await page.context().setOffline(false);
    
    // Should sync when back online
    await expect(page.locator('text=Syncing')).toBeVisible();
  });

  test('API errors are handled with user-friendly messages', async ({ page }) => {
    // Mock API to return various error responses
    await page.route('**/api/**', (route) => {
      const url = route.request().url();
      
      if (url.includes('/auth/login')) {
        route.fulfill({
          status: 401,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Invalid credentials' })
        });
      } else if (url.includes('/premium/subscribe')) {
        route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Internal server error' })
        });
      } else {
        route.continue();
      }
    });
    
    await page.goto('/login');
    
    // Try to login with invalid credentials
    await page.fill('[data-testid="email"]', 'invalid@example.com');
    await page.fill('[data-testid="password"]', 'wrongpassword');
    await page.click('text=Sign In');
    
    // Should show user-friendly error message
    await expect(page.locator('text=Invalid credentials')).toBeVisible();
    await expect(page.locator('text=Please check your username and password')).toBeVisible();
  });

  test('Form validation errors are displayed clearly', async ({ page }) => {
    await page.goto('/register');
    
    // Submit form with invalid data
    await page.click('text=Create Account');
    
    // Should show validation errors
    await expect(page.locator('text=Email is required')).toBeVisible();
    await expect(page.locator('text=Password must be at least 8 characters')).toBeVisible();
    
    // Fill with valid data
    await page.fill('[data-testid="email"]', 'test@example.com');
    await page.fill('[data-testid="password"]', 'password123');
    await page.fill('[data-testid="firstName"]', 'John');
    await page.fill('[data-testid="lastName"]', 'Doe');
    
    // Errors should disappear
    await expect(page.locator('text=Email is required')).not.toBeVisible();
    await expect(page.locator('text=Password must be at least 8 characters')).not.toBeVisible();
  });

  test('Biometric authentication handles failures', async ({ page }) => {
    await page.goto('/settings');
    
    // Mock biometric service to fail
    await page.addInitScript(() => {
      window.BiometricService = {
        isAvailable: () => Promise.resolve(true),
        authenticate: () => Promise.resolve({ success: false, error: 'Biometric authentication failed' })
      };
    });
    
    // Try to enable biometric auth
    await page.click('text=Enable Biometric Authentication');
    
    // Should show error message
    await expect(page.locator('text=Biometric authentication failed')).toBeVisible();
    await expect(page.locator('text=Please try again or use your password')).toBeVisible();
  });

  test('WebRTC call failures are handled gracefully', async ({ page }) => {
    await page.goto('/chat/123');
    
    // Mock WebRTC to fail
    await page.addInitScript(() => {
      window.WebRTCService = {
        startCall: () => Promise.resolve(false),
        answerCall: () => Promise.resolve(false),
        getCallState: () => ({ isActive: false, isConnected: false })
      };
    });
    
    // Try to start a video call
    await page.click('[data-testid="video-call-button"]');
    
    // Should show error message
    await expect(page.locator('text=Call failed to start')).toBeVisible();
    await expect(page.locator('text=Please check your connection and try again')).toBeVisible();
  });

  test('Memory leaks are prevented on component unmount', async ({ page }) => {
    await page.goto('/');
    
    // Navigate to a page with timers/intervals
    await page.click('text=Chat');
    
    // Navigate away quickly
    await page.click('text=Home');
    
    // Wait a bit to ensure cleanup
    await page.waitForTimeout(1000);
    
    // Check for memory leaks (this is a basic check)
    const errors = await page.evaluate(() => window.errorLog);
    const memoryErrors = errors.filter(error => 
      error.message && error.message.includes('memory')
    );
    
    expect(memoryErrors.length).toBe(0);
  });

  test('Concurrent API requests are handled properly', async ({ page }) => {
    await page.goto('/');
    
    // Mock API to be slow
    await page.route('**/api/matches', (route) => {
      setTimeout(() => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ matches: [] })
        });
      }, 1000);
    });
    
    // Trigger multiple requests
    await page.click('text=Refresh');
    await page.click('text=Refresh');
    await page.click('text=Refresh');
    
    // Should handle concurrent requests without errors
    const errors = await page.evaluate(() => window.errorLog);
    const apiErrors = errors.filter(error => 
      error.message && error.message.includes('API')
    );
    
    expect(apiErrors.length).toBe(0);
  });

  test('Large data sets are handled without performance issues', async ({ page }) => {
    await page.goto('/');
    
    // Mock large dataset
    await page.route('**/api/matches', (route) => {
      const largeDataset = Array.from({ length: 1000 }, (_, i) => ({
        id: i,
        name: `Pet ${i}`,
        photos: [`photo${i}.jpg`]
      }));
      
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ matches: largeDataset })
      });
    });
    
    // Load the page
    await page.reload();
    
    // Should not crash or show performance warnings
    const errors = await page.evaluate(() => window.errorLog);
    const performanceErrors = errors.filter(error => 
      error.message && error.message.includes('performance')
    );
    
    expect(performanceErrors.length).toBe(0);
  });

  test('Error recovery mechanisms work correctly', async ({ page }) => {
    await page.goto('/');
    
    // Simulate network failure
    await page.context().setOffline(true);
    
    // Try to perform an action
    await page.click('text=Like');
    
    // Should show retry option
    await expect(page.locator('text=Retry')).toBeVisible();
    
    // Go back online
    await page.context().setOffline(false);
    
    // Click retry
    await page.click('text=Retry');
    
    // Should succeed
    await expect(page.locator('text=Success')).toBeVisible();
  });
});

test.describe('Error Boundary Edge Cases', () => {
  test('Error boundary handles nested component errors', async ({ page }) => {
    await page.goto('/');
    
    // Simulate nested component error
    await page.addScriptTag({
      content: `
        // Simulate nested component error
        setTimeout(() => {
          try {
            throw new Error('Nested component error');
          } catch (e) {
            // Re-throw to test error boundary
            throw e;
          }
        }, 100);
      `
    });
    
    await page.waitForTimeout(200);
    
    // Error boundary should catch it
    await expect(page.locator('text=Something went wrong')).toBeVisible();
  });

  test('Error boundary handles async errors', async ({ page }) => {
    await page.goto('/');
    
    // Simulate async error
    await page.addScriptTag({
      content: `
        // Simulate async error
        setTimeout(() => {
          Promise.reject(new Error('Async error'));
        }, 100);
      `
    });
    
    await page.waitForTimeout(200);
    
    // Should handle async errors gracefully
    const errors = await page.evaluate(() => window.errorLog);
    expect(errors.length).toBeGreaterThan(0);
  });
});

test.describe('Payment Flow Error Scenarios', () => {
  test('Handles Stripe configuration errors', async ({ page }) => {
    await page.goto('/premium');
    
    // Mock missing Stripe configuration
    await page.addInitScript(() => {
      window.Stripe = undefined;
    });
    
    await page.click('text=Start Monthly Plan');
    
    // Should show configuration error
    await expect(page.locator('text=Payment system not available')).toBeVisible();
  });

  test('Handles payment method errors', async ({ page }) => {
    await page.goto('/premium');
    
    // Mock payment method error
    await page.addInitScript(() => {
      window.Stripe = {
        initPaymentSheet: () => Promise.resolve({ error: { message: 'card_declined' } }),
        presentPaymentSheet: () => Promise.resolve({ error: { message: 'Your card was declined' } })
      };
    });
    
    await page.click('text=Start Monthly Plan');
    
    // Should show card declined message
    await expect(page.locator('text=Your card was declined')).toBeVisible();
    await expect(page.locator('text=Please try a different payment method')).toBeVisible();
  });

  test('Handles network errors during payment', async ({ page }) => {
    await page.goto('/premium');
    
    // Mock network error
    await page.route('**/api/premium/subscribe', (route) => {
      route.abort('failed');
    });
    
    await page.click('text=Start Monthly Plan');
    
    // Should show network error
    await expect(page.locator('text=Network error')).toBeVisible();
    await expect(page.locator('text=Please check your connection')).toBeVisible();
  });
});

test.describe('Offline Scenario Testing', () => {
  test('Offline service caches data properly', async ({ page }) => {
    await page.goto('/');
    
    // Load data while online
    await page.waitForSelector('[data-testid="pet-card"]');
    
    // Go offline
    await page.context().setOffline(true);
    
    // Refresh page
    await page.reload();
    
    // Should show cached data
    await expect(page.locator('[data-testid="pet-card"]')).toBeVisible();
    await expect(page.locator('text=Offline')).toBeVisible();
  });

  test('Offline service syncs when back online', async ({ page }) => {
    await page.goto('/');
    
    // Go offline
    await page.context().setOffline(true);
    
    // Perform actions while offline
    await page.click('text=Like');
    await page.click('text=Super Like');
    
    // Go back online
    await page.context().setOffline(false);
    
    // Should show sync progress
    await expect(page.locator('text=Syncing')).toBeVisible();
    
    // Wait for sync to complete
    await expect(page.locator('text=Synced')).toBeVisible();
  });

  test('Offline service handles sync failures', async ({ page }) => {
    await page.goto('/');
    
    // Go offline
    await page.context().setOffline(true);
    
    // Perform actions while offline
    await page.click('text=Like');
    
    // Mock API to fail when back online
    await page.route('**/api/**', (route) => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Server error' })
      });
    });
    
    // Go back online
    await page.context().setOffline(false);
    
    // Should show sync failure
    await expect(page.locator('text=Sync failed')).toBeVisible();
    await expect(page.locator('text=Retry')).toBeVisible();
  });
});

/**
 * Playwright E2E tests for admin settings functionality
 */
import { test, expect } from '@playwright/test';

test.describe('Admin Settings', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to admin settings page
    await page.goto('/admin/settings');

    // Wait for page to load
    await page.waitForSelector('h1:has-text("System Settings")');
  });

  test('should display the settings page correctly', async ({ page }) => {
    // Check page title and description
    await expect(page.locator('h1')).toContainText('System Settings');
    await expect(page.locator('p').first()).toContainText('Configure system-wide settings');

    // Check system status section
    await expect(page.locator('h3:has-text("System Status")')).toBeVisible();
    await expect(page.locator('text=Database')).toBeVisible();
    await expect(page.locator('text=API Server')).toBeVisible();

    // Check configuration settings section
    await expect(page.locator('h3:has-text("Configuration Settings")')).toBeVisible();

    // Check quick actions section
    await expect(page.locator('h3:has-text("Quick Actions")')).toBeVisible();
    await expect(page.locator('text=Clear Cache')).toBeVisible();
    await expect(page.locator('text=Restart Services')).toBeVisible();
  });

  test('should load system settings on page load', async ({ page }) => {
    // Mock the API response
    await page.route('**/api/admin/settings', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          settings: {
            STORY_DAILY_CAP: 25,
            REDIS_URL: 'redis://production-server:6379'
          },
          source: 'database'
        }),
      });
    });

    // Reload the page to trigger the API call
    await page.reload();
    await page.waitForSelector('h1:has-text("System Settings")');

    // Check that settings are loaded
    const storyDailyCapInput = page.locator('input').filter({ hasText: /25/ });
    await expect(storyDailyCapInput).toHaveValue('25');

    const redisUrlInput = page.locator('input').filter({ hasText: /redis:\/\/production-server:6379/ });
    await expect(redisUrlInput).toHaveValue('redis://production-server:6379');
  });

  test('should filter settings by category', async ({ page }) => {
    // Check that all categories are visible initially
    await expect(page.locator('text=Story Daily Cap')).toBeVisible();
    await expect(page.locator('text=Redis URL')).toBeVisible();
    await expect(page.locator('text=Two-Factor Authentication')).toBeVisible();

    // Select System category
    const categorySelect = page.locator('select').first();
    await categorySelect.selectOption('System');

    // Check that only System settings are visible
    await expect(page.locator('text=Story Daily Cap')).toBeVisible();
    await expect(page.locator('text=Redis URL')).toBeVisible();
    await expect(page.locator('text=Two-Factor Authentication')).not.toBeVisible();
  });

  test('should allow editing system settings', async ({ page }) => {
    // Mock the API response for initial load
    await page.route('**/api/admin/settings', async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            settings: {
              STORY_DAILY_CAP: 10,
              REDIS_URL: 'redis://localhost:6379'
            },
            source: 'environment'
          }),
        });
      }
    });

    // Reload to get fresh data
    await page.reload();

    // Find and update Story Daily Cap
    const storyDailyCapInput = page.locator('input[type="number"]').first();
    await storyDailyCapInput.fill('50');

    // Find and update Redis URL
    const redisUrlInput = page.locator('input[type="text"]').filter({ has: page.locator('xpath=following-sibling::*[contains(text(), "Redis")]') });
    await redisUrlInput.fill('redis://updated-server:6379');

    // Check that Save Changes button is enabled
    const saveButton = page.locator('button:has-text("Save Changes")');
    await expect(saveButton).not.toBeDisabled();
  });

  test('should save settings successfully', async ({ page }) => {
    // Mock initial load
    await page.route('**/api/admin/settings', async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            settings: {
              STORY_DAILY_CAP: 10,
              REDIS_URL: 'redis://localhost:6379'
            },
            source: 'environment'
          }),
        });
      } else if (route.request().method() === 'PUT') {
        const requestBody = route.request().postDataJSON();
        expect(requestBody).toEqual({
          STORY_DAILY_CAP: '30',
          REDIS_URL: 'redis://test-server:6379'
        });

        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            message: 'System settings updated successfully',
            settings: {
              STORY_DAILY_CAP: 30,
              REDIS_URL: 'redis://test-server:6379'
            }
          }),
        });
      }
    });

    // Reload page
    await page.reload();

    // Make changes
    const storyDailyCapInput = page.locator('input[type="number"]').first();
    await storyDailyCapInput.fill('30');

    const redisUrlInput = page.locator('input[type="text"]').nth(1); // Second text input
    await redisUrlInput.fill('redis://test-server:6379');

    // Save changes
    const saveButton = page.locator('button:has-text("Save Changes")');
    await saveButton.click();

    // Wait for success (button should become disabled again)
    await expect(saveButton).toBeDisabled();
  });

  test('should handle validation errors', async ({ page }) => {
    // Mock initial load
    await page.route('**/api/admin/settings', async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            settings: {
              STORY_DAILY_CAP: 10,
              REDIS_URL: 'redis://localhost:6379'
            },
            source: 'environment'
          }),
        });
      } else if (route.request().method() === 'PUT') {
        await route.fulfill({
          status: 400,
          contentType: 'application/json',
          body: JSON.stringify({
            success: false,
            message: 'Validation failed',
            errors: [
              {
                field: 'STORY_DAILY_CAP',
                message: 'STORY_DAILY_CAP must be a non-negative integer'
              }
            ]
          }),
        });
      }
    });

    // Reload page
    await page.reload();

    // Make invalid change
    const storyDailyCapInput = page.locator('input[type="number"]').first();
    await storyDailyCapInput.fill('-5');

    // Save changes
    const saveButton = page.locator('button:has-text("Save Changes")');
    await saveButton.click();

    // Button should remain enabled (save failed)
    await expect(saveButton).not.toBeDisabled();
  });

  test('should handle server errors during save', async ({ page }) => {
    // Mock initial load
    await page.route('**/api/admin/settings', async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            settings: {
              STORY_DAILY_CAP: 10,
              REDIS_URL: 'redis://localhost:6379'
            },
            source: 'environment'
          }),
        });
      } else if (route.request().method() === 'PUT') {
        await route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({
            success: false,
            message: 'Failed to update system settings'
          }),
        });
      }
    });

    // Reload page
    await page.reload();

    // Make changes
    const storyDailyCapInput = page.locator('input[type="number"]').first();
    await storyDailyCapInput.fill('20');

    // Save changes
    const saveButton = page.locator('button:has-text("Save Changes")');
    await saveButton.click();

    // Button should remain enabled (save failed)
    await expect(saveButton).not.toBeDisabled();
  });

  test('should reset changes when reset button is clicked', async ({ page }) => {
    // Reload page to ensure clean state
    await page.reload();

    // Make changes
    const storyDailyCapInput = page.locator('input[type="number"]').first();
    await storyDailyCapInput.fill('100');

    // Verify change was made
    await expect(storyDailyCapInput).toHaveValue('100');

    // Click reset button
    const resetButton = page.locator('button:has-text("Reset")');
    await resetButton.click();

    // Check that value is reset to default
    await expect(storyDailyCapInput).toHaveValue('10');

    // Save button should be disabled again
    const saveButton = page.locator('button:has-text("Save Changes")');
    await expect(saveButton).toBeDisabled();
  });

  test('should handle API loading states', async ({ page }) => {
    // Mock slow API response
    await page.route('**/api/admin/settings', async (route) => {
      if (route.request().method() === 'GET') {
        // Delay the response
        await new Promise(resolve => setTimeout(resolve, 1000));
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            settings: {
              STORY_DAILY_CAP: 15,
              REDIS_URL: 'redis://delayed:6379'
            },
            source: 'database'
          }),
        });
      }
    });

    // Reload page
    await page.reload();

    // Check that inputs eventually get the correct values
    const storyDailyCapInput = page.locator('input[type="number"]').first();
    await expect(storyDailyCapInput).toHaveValue('15', { timeout: 2000 });

    const redisUrlInput = page.locator('input[type="text"]').nth(1);
    await expect(redisUrlInput).toHaveValue('redis://delayed:6379', { timeout: 2000 });
  });

  test('should handle network errors gracefully', async ({ page }) => {
    // Mock network failure for initial load
    await page.route('**/api/admin/settings', async (route) => {
      if (route.request().method() === 'GET') {
        await route.abort();
      }
    });

    // Reload page
    await page.reload();

    // Should still show default values
    const storyDailyCapInput = page.locator('input[type="number"]').first();
    await expect(storyDailyCapInput).toHaveValue('10');

    const redisUrlInput = page.locator('input[type="text"]').nth(1);
    await expect(redisUrlInput).toHaveValue('redis://localhost:6379');
  });

  test('should display proper ARIA labels and accessibility', async ({ page }) => {
    // Check that buttons have proper ARIA labels
    const saveButton = page.locator('button[aria-label="Save settings"]');
    await expect(saveButton).toBeVisible();

    const resetButton = page.locator('button[aria-label="Reset changes"]');
    await expect(resetButton).toBeVisible();

    // Check that inputs have proper labels
    const storyLabel = page.locator('label:has-text("Story Daily Cap")');
    await expect(storyLabel).toBeVisible();

    const redisLabel = page.locator('label:has-text("Redis URL")');
    await expect(redisLabel).toBeVisible();
  });

  test('should show required field indicators', async ({ page }) => {
    // Check that required fields show asterisks
    const requiredIndicators = page.locator('text=*');
    await expect(requiredIndicators).toHaveCountGreaterThan(0);

    // Specifically check system settings are marked as required
    const storyLabel = page.locator('text=Story Daily Cap*');
    await expect(storyLabel).toBeVisible();

    const redisLabel = page.locator('text=Redis URL*');
    await expect(redisLabel).toBeVisible();
  });

  test('should handle quick action buttons', async ({ page }) => {
    // Quick action buttons should be present
    await expect(page.locator('button:has-text("Clear Cache")')).toBeVisible();
    await expect(page.locator('button:has-text("Restart Services")')).toBeVisible();
    await expect(page.locator('button:has-text("Generate Backup")')).toBeVisible();
    await expect(page.locator('button:has-text("View Logs")')).toBeVisible();

    // Clicking them should not cause errors (they're mocked to log)
    await page.locator('button:has-text("Clear Cache")').click();
    await page.locator('button:has-text("Restart Services")').click();
    await page.locator('button:has-text("Generate Backup")').click();
    await page.locator('button:has-text("View Logs")').click();

    // Page should still be functional
    await expect(page.locator('h1:has-text("System Settings")')).toBeVisible();
  });

  test('should maintain state across navigation', async ({ page }) => {
    // Make changes
    const storyDailyCapInput = page.locator('input[type="number"]').first();
    await storyDailyCapInput.fill('75');

    // Navigate away and back (simulate)
    await page.reload();

    // Settings should be loaded from API, not maintaining local changes
    // (This tests that we don't persist unsaved changes)
    await expect(storyDailyCapInput).toHaveValue('10'); // Back to default
  });
});

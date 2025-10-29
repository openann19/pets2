/**
 * UI Page Visual Regression Tests
 * Tests visual consistency across themes and languages
 */

import { test, expect } from '@playwright/test';

test.describe('UI Page Visual Regression Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/ui');
  });

  test('should match light theme screenshot', async ({ page }) => {
    // Ensure light theme is active
    await page.getByTestId('ui-theme-light').click();
    
    // Wait for any animations to complete
    await page.waitForTimeout(500);
    
    // Take full page screenshot
    await expect(page).toHaveScreenshot('ui-light-theme.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });

  test('should match dark theme screenshot', async ({ page }) => {
    // Switch to dark theme
    await page.getByTestId('ui-theme-dark').click();
    
    // Wait for theme transition
    await page.waitForTimeout(500);
    
    // Take full page screenshot
    await expect(page).toHaveScreenshot('ui-dark-theme.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });

  test('should match EN language screenshot', async ({ page }) => {
    // Ensure EN language is active
    await page.getByTestId('ui-lang-en').click();
    
    // Wait for any language changes
    await page.waitForTimeout(300);
    
    // Take screenshot of controls area
    const controls = page.getByTestId('ui-controls');
    await expect(controls).toHaveScreenshot('ui-controls-en.png', {
      animations: 'disabled',
    });
  });

  test('should match BG language screenshot', async ({ page }) => {
    // Switch to BG language
    await page.getByTestId('ui-lang-bg').click();
    
    // Wait for language changes
    await page.waitForTimeout(300);
    
    // Take screenshot of controls area
    const controls = page.getByTestId('ui-controls');
    await expect(controls).toHaveScreenshot('ui-controls-bg.png', {
      animations: 'disabled',
    });
  });

  test('should match buttons section screenshot', async ({ page }) => {
    // Ensure light theme and EN language
    await page.getByTestId('ui-theme-light').click();
    await page.getByTestId('ui-lang-en').click();
    
    // Wait for stable state
    await page.waitForTimeout(300);
    
    // Take screenshot of buttons section
    const buttonsSection = page.getByTestId('ui-buttons');
    await expect(buttonsSection).toHaveScreenshot('ui-buttons-light.png', {
      animations: 'disabled',
    });
  });

  test('should match buttons section in dark theme', async ({ page }) => {
    // Switch to dark theme
    await page.getByTestId('ui-theme-dark').click();
    
    // Wait for theme transition
    await page.waitForTimeout(500);
    
    // Take screenshot of buttons section
    const buttonsSection = page.getByTestId('ui-buttons');
    await expect(buttonsSection).toHaveScreenshot('ui-buttons-dark.png', {
      animations: 'disabled',
    });
  });

  test('should match badges section screenshot', async ({ page }) => {
    // Ensure light theme
    await page.getByTestId('ui-theme-light').click();
    
    // Wait for stable state
    await page.waitForTimeout(300);
    
    // Take screenshot of badges section
    const badgesSection = page.getByTestId('ui-badges');
    await expect(badgesSection).toHaveScreenshot('ui-badges-light.png', {
      animations: 'disabled',
    });
  });

  test('should match badges section in dark theme', async ({ page }) => {
    // Switch to dark theme
    await page.getByTestId('ui-theme-dark').click();
    
    // Wait for theme transition
    await page.waitForTimeout(500);
    
    // Take screenshot of badges section
    const badgesSection = page.getByTestId('ui-badges');
    await expect(badgesSection).toHaveScreenshot('ui-badges-dark.png', {
      animations: 'disabled',
    });
  });

  test('should match hover states for buttons', async ({ page }) => {
    // Ensure light theme
    await page.getByTestId('ui-theme-light').click();
    
    // Hover over primary button
    const primaryButton = page.getByText('Primary').first();
    await primaryButton.hover();
    await page.waitForTimeout(200);
    
    // Take screenshot of buttons section with hover
    const buttonsSection = page.getByTestId('ui-buttons');
    await expect(buttonsSection).toHaveScreenshot('ui-buttons-hover.png', {
      animations: 'disabled',
    });
  });

  test('should match active states for theme toggle', async ({ page }) => {
    // Click dark theme button
    await page.getByTestId('ui-theme-dark').click();
    await page.waitForTimeout(300);
    
    // Take screenshot of controls with active state
    const controls = page.getByTestId('ui-controls');
    await expect(controls).toHaveScreenshot('ui-controls-dark-active.png', {
      animations: 'disabled',
    });
  });

  test('should match active states for language toggle', async ({ page }) => {
    // Click BG language button
    await page.getByTestId('ui-lang-bg').click();
    await page.waitForTimeout(300);
    
    // Take screenshot of controls with active state
    const controls = page.getByTestId('ui-controls');
    await expect(controls).toHaveScreenshot('ui-controls-bg-active.png', {
      animations: 'disabled',
    });
  });

  test('should match mobile viewport screenshot', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Ensure light theme
    await page.getByTestId('ui-theme-light').click();
    
    // Wait for responsive layout
    await page.waitForTimeout(300);
    
    // Take full page screenshot
    await expect(page).toHaveScreenshot('ui-mobile-light.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });

  test('should match mobile viewport dark theme', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Switch to dark theme
    await page.getByTestId('ui-theme-dark').click();
    await page.waitForTimeout(500);
    
    // Take full page screenshot
    await expect(page).toHaveScreenshot('ui-mobile-dark.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });

  test('should match tablet viewport screenshot', async ({ page }) => {
    // Set tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    
    // Ensure light theme
    await page.getByTestId('ui-theme-light').click();
    
    // Wait for responsive layout
    await page.waitForTimeout(300);
    
    // Take full page screenshot
    await expect(page).toHaveScreenshot('ui-tablet-light.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });

  test('should match combined dark theme + BG language', async ({ page }) => {
    // Switch to dark theme and BG language
    await page.getByTestId('ui-theme-dark').click();
    await page.waitForTimeout(300);
    
    await page.getByTestId('ui-lang-bg').click();
    await page.waitForTimeout(300);
    
    // Take screenshot of controls
    const controls = page.getByTestId('ui-controls');
    await expect(controls).toHaveScreenshot('ui-controls-dark-bg.png', {
      animations: 'disabled',
    });
  });

  test('should match button focus states', async ({ page }) => {
    // Focus on primary button
    const primaryButton = page.getByText('Primary').first();
    await primaryButton.focus();
    await page.waitForTimeout(200);
    
    // Take screenshot of buttons section with focus
    const buttonsSection = page.getByTestId('ui-buttons');
    await expect(buttonsSection).toHaveScreenshot('ui-buttons-focus.png', {
      animations: 'disabled',
    });
  });

  test('should match keyboard navigation states', async ({ page }) => {
    // Tab through controls
    await page.keyboard.press('Tab'); // Focus light theme
    await page.waitForTimeout(100);
    
    const controls = page.getByTestId('ui-controls');
    await expect(controls).toHaveScreenshot('ui-controls-keyboard-focus.png', {
      animations: 'disabled',
    });
  });

  test('should be stable across rapid theme changes', async ({ page }) => {
    // Rapidly switch themes to test stability
    for (let i = 0; i < 3; i++) {
      await page.getByTestId('ui-theme-dark').click();
      await page.waitForTimeout(100);
      await page.getByTestId('ui-theme-light').click();
      await page.waitForTimeout(100);
    }
    
    // Final state should match baseline
    await page.waitForTimeout(300);
    await expect(page).toHaveScreenshot('ui-light-theme-stable.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });

  test('should handle font loading consistently', async ({ page }) => {
    // Wait for fonts to load
    await page.waitForLoadState('networkidle');
    
    // Take screenshot to ensure consistent font rendering
    const buttonsSection = page.getByTestId('ui-buttons');
    await expect(buttonsSection).toHaveScreenshot('ui-fonts-loaded.png', {
      animations: 'disabled',
    });
  });
});

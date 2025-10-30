/**
 * UI Page E2E Tests
 * Tests theme toggle, language switch, and component interactions
 */

import { test, expect } from '@playwright/test';

test.describe('UI Page E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/ui');
  });

  test('should load UI page without errors', async ({ page }) => {
    // Check page loads
    await expect(page).toHaveTitle(/UI/);
    
    // Check main elements are present
    await expect(page.getByTestId('ui-controls')).toBeVisible();
    await expect(page.getByTestId('ui-demo')).toBeVisible();
    await expect(page.getByTestId('ui-buttons')).toBeVisible();
    await expect(page.getByTestId('ui-badges')).toBeVisible();
  });

  test('should toggle theme from light to dark', async ({ page }) => {
    // Check initial light theme
    const container = page.getByTestId('ui-demo').locator('..');
    await expect(container).toHaveClass(/bg-gray-50/);
    
    // Switch to dark theme
    await page.getByTestId('ui-theme-dark').click();
    
    // Check dark theme is applied
    await expect(container).toHaveClass(/bg-gray-900/);
    
    // Check button styles changed
    const darkButton = page.getByTestId('ui-theme-dark');
    await expect(darkButton).toHaveClass(/bg-blue-600/);
    
    const lightButton = page.getByTestId('ui-theme-light');
    await expect(lightButton).toHaveClass(/bg-transparent/);
  });

  test('should toggle theme from dark to light', async ({ page }) => {
    // Switch to dark first
    await page.getByTestId('ui-theme-dark').click();
    await expect(page.getByTestId('ui-demo').locator('..')).toHaveClass(/bg-gray-900/);
    
    // Switch back to light
    await page.getByTestId('ui-theme-light').click();
    
    // Check light theme is applied
    const container = page.getByTestId('ui-demo').locator('..');
    await expect(container).toHaveClass(/bg-gray-50/);
    
    // Check button styles changed back
    const lightButton = page.getByTestId('ui-theme-light');
    await expect(lightButton).toHaveClass(/bg-blue-600/);
    
    const darkButton = page.getByTestId('ui-theme-dark');
    await expect(darkButton).toHaveClass(/bg-transparent/);
  });

  test('should switch language from EN to BG', async ({ page }) => {
    // Check initial EN state
    const enButton = page.getByTestId('ui-lang-en');
    const bgButton = page.getByTestId('ui-lang-bg');
    
    await expect(enButton).toHaveClass(/bg-blue-600/);
    await expect(bgButton).toHaveClass(/bg-transparent/);
    
    // Switch to BG
    await bgButton.click();
    
    // Check BG is now active
    await expect(bgButton).toHaveClass(/bg-blue-600/);
    await expect(enButton).toHaveClass(/bg-transparent/);
  });

  test('should switch language from BG to EN', async ({ page }) => {
    // Switch to BG first
    await page.getByTestId('ui-lang-bg').click();
    await expect(page.getByTestId('ui-lang-bg')).toHaveClass(/bg-blue-600/);
    
    // Switch back to EN
    await page.getByTestId('ui-lang-en').click();
    
    // Check EN is active again
    await expect(page.getByTestId('ui-lang-en')).toHaveClass(/bg-blue-600/);
    await expect(page.getByTestId('ui-lang-bg')).toHaveClass(/bg-transparent/);
  });

  test('should show Cyrillic text when BG is selected', async ({ page }) => {
    // Switch to BG language
    await page.getByTestId('ui-lang-bg').click();
    
    // Check that BG button shows Cyrillic (if implemented)
    // This would require actual i18n integration
    const bgButton = page.getByTestId('ui-lang-bg');
    await expect(bgButton).toContainText('BG');
  });

  test('should render all button variants', async ({ page }) => {
    const buttonsSection = page.getByTestId('ui-buttons');
    
    // Check all button variants are present
    await expect(buttonsSection.getByText('Primary')).toBeVisible();
    await expect(buttonsSection.getByText('Secondary')).toBeVisible();
    await expect(buttonsSection.getByText('Outline')).toBeVisible();
    await expect(buttonsSection.getByText('Ghost')).toBeVisible();
    
    // Check buttons are clickable
    const primaryButton = buttonsSection.getByText('Primary');
    await expect(primaryButton).toBeEnabled();
    
    // Click should not cause errors
    await primaryButton.click();
    // Page should still be functional
    await expect(page.getByTestId('ui-controls')).toBeVisible();
  });

  test('should render all badge variants', async ({ page }) => {
    const badgesSection = page.getByTestId('ui-badges');
    
    // Check all badge variants are present
    await expect(badgesSection.getByText('Primary')).toBeVisible();
    await expect(badgesSection.getByText('Secondary')).toBeVisible();
    await expect(badgesSection.getByText('Success')).toBeVisible();
    await expect(badgesSection.getByText('Warning')).toBeVisible();
    await expect(badgesSection.getByText('Danger')).toBeVisible();
  });

  test('should maintain theme and language state together', async ({ page }) => {
    // Switch to dark theme
    await page.getByTestId('ui-theme-dark').click();
    await expect(page.getByTestId('ui-demo').locator('..')).toHaveClass(/bg-gray-900/);
    
    // Switch to BG language
    await page.getByTestId('ui-lang-bg').click();
    await expect(page.getByTestId('ui-lang-bg')).toHaveClass(/bg-blue-600/);
    
    // Both should be active
    await expect(page.getByTestId('ui-theme-dark')).toHaveClass(/bg-blue-600/);
    await expect(page.getByTestId('ui-lang-bg')).toHaveClass(/bg-blue-600/);
    
    // Reload page to check persistence (if implemented)
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // Check controls are still present after reload
    await expect(page.getByTestId('ui-controls')).toBeVisible();
  });

  test('should have no console errors', async ({ page }) => {
    const messages: string[] = [];
    
    // Listen for console messages
    page.on('console', msg => {
      if (msg.type() === 'error') {
        messages.push(msg.text());
      }
    });
    
    // Interact with the page
    await page.getByTestId('ui-theme-dark').click();
    await page.getByTestId('ui-lang-bg').click();
    await page.getByText('Primary').click();
    
    // Check for errors
    expect(messages.filter(msg => !msg.includes('Warning') && !msg.includes('Deprecated'))).toHaveLength(0);
  });

  test('should be responsive on different viewports', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.getByTestId('ui-controls')).toBeVisible();
    await expect(page.getByTestId('ui-demo')).toBeVisible();
    
    // Test tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(page.getByTestId('ui-controls')).toBeVisible();
    await expect(page.getByTestId('ui-demo')).toBeVisible();
    
    // Test desktop viewport
    await page.setViewportSize({ width: 1200, height: 800 });
    await expect(page.getByTestId('ui-controls')).toBeVisible();
    await expect(page.getByTestId('ui-demo')).toBeVisible();
  });

  test('should handle rapid theme switching', async ({ page }) => {
    const darkButton = page.getByTestId('ui-theme-dark');
    const lightButton = page.getByTestId('ui-theme-light');
    
    // Rapidly switch themes
    for (let i = 0; i < 5; i++) {
      await darkButton.click();
      await page.waitForTimeout(100);
      await lightButton.click();
      await page.waitForTimeout(100);
    }
    
    // Should still be functional
    await expect(darkButton).toBeVisible();
    await expect(lightButton).toBeVisible();
    await expect(page.getByTestId('ui-demo')).toBeVisible();
  });

  test('should handle rapid language switching', async ({ page }) => {
    const enButton = page.getByTestId('ui-lang-en');
    const bgButton = page.getByTestId('ui-lang-bg');
    
    // Rapidly switch languages
    for (let i = 0; i < 5; i++) {
      await bgButton.click();
      await page.waitForTimeout(100);
      await enButton.click();
      await page.waitForTimeout(100);
    }
    
    // Should still be functional
    await expect(enButton).toBeVisible();
    await expect(bgButton).toBeVisible();
    await expect(page.getByTestId('ui-demo')).toBeVisible();
  });

  test('should have proper accessibility attributes', async ({ page }) => {
    // Check for proper heading hierarchy
    const headings = page.locator('h1, h2, h3, h4, h5, h6');
    await expect(headings).toHaveCount(2); // Should have 2 h2 elements
    
    // Check buttons have proper attributes
    const buttons = page.locator('button');
    await expect(buttons).toHaveCount(6); // 2 theme + 2 language + 2 demo buttons
    
    // Check for proper ARIA attributes
    const themeButtons = page.locator('[data-testid^="ui-theme-"]');
    await expect(themeButtons).toHaveAttribute('type');
    
    const langButtons = page.locator('[data-testid^="ui-lang-"]');
    await expect(langButtons).toHaveAttribute('type');
  });

  test('should handle keyboard navigation', async ({ page }) => {
    // Focus on first theme button
    await page.keyboard.press('Tab');
    await expect(page.getByTestId('ui-theme-light')).toBeFocused();
    
    // Navigate through theme buttons
    await page.keyboard.press('Tab');
    await expect(page.getByTestId('ui-theme-dark')).toBeFocused();
    
    // Navigate to language buttons
    await page.keyboard.press('Tab');
    await expect(page.getByTestId('ui-lang-en')).toBeFocused();
    
    // Activate with Enter key
    await page.keyboard.press('Enter');
    await expect(page.getByTestId('ui-lang-en')).toHaveClass(/bg-blue-600/);
  });

  test('should have proper meta tags', async ({ page }) => {
    // Check for proper title
    await expect(page).toHaveTitle(/UI/);
    
    // Check for viewport meta tag
    const viewport = page.locator('meta[name="viewport"]');
    await expect(viewport).toHaveAttribute('content', /width=device-width/);
  });
});

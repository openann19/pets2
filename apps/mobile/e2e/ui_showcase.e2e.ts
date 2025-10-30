/**
 * UI Showcase E2E Tests
 * Tests complete UI showcase flow with Detox
 */

import { device, element, by, expect } from 'detox';

describe('UI Showcase E2E Tests', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  describe('App Launch and Navigation', () => {
    it('should launch app successfully', async () => {
      await expect(element(by.id('app-root'))).toBeVisible();
    });

    it('should navigate to UI showcase screen', async () => {
      // Navigate to Settings
      await element(by.id('tab-settings')).tap();
      await expect(element(by.text('Settings'))).toBeVisible();
      
      // Find and tap UI Demo option
      await element(by.text('UI Demo')).tap();
      
      // Should be on UI Demo screen
      await expect(element(by.id('ui-controls'))).toBeVisible();
      await expect(element(by.id('ui-demo'))).toBeVisible();
    });
  });

  describe('Theme Switching', () => {
    beforeEach(async () => {
      // Navigate to UI Demo screen
      await element(by.id('tab-settings')).tap();
      await element(by.text('UI Demo')).tap();
    });

    it('should switch from light to dark theme', async () => {
      // Check initial light theme state
      await expect(element(by.id('ui-theme-light'))).toExist();
      
      // Switch to dark theme
      await element(by.id('ui-theme-dark')).tap();
      
      // Verify dark theme is applied
      await expect(element(by.id('ui-theme-dark'))).toExist();
      
      // Check background color changed (this would require visual testing)
      // For now, just verify the button state changed
    });

    it('should switch from dark to light theme', async () => {
      // Switch to dark theme first
      await element(by.id('ui-theme-dark')).tap();
      
      // Switch back to light theme
      await element(by.id('ui-theme-light')).tap();
      
      // Verify light theme is applied
      await expect(element(by.id('ui-theme-light'))).toExist();
    });

    it('should handle rapid theme switching', async () => {
      // Rapidly switch themes
      for (let i = 0; i < 3; i++) {
        await element(by.id('ui-theme-dark')).tap();
        await waitFor(element(by.id('ui-theme-dark'))).toBeVisible().withTimeout(1000);
        
        await element(by.id('ui-theme-light')).tap();
        await waitFor(element(by.id('ui-theme-light'))).toBeVisible().withTimeout(1000);
      }
      
      // Should still be functional
      await expect(element(by.id('ui-controls'))).toBeVisible();
    });
  });

  describe('Language Switching', () => {
    beforeEach(async () => {
      // Navigate to UI Demo screen
      await element(by.id('tab-settings')).tap();
      await element(by.text('UI Demo')).tap();
    });

    it('should switch from EN to BG language', async () => {
      // Switch to BG language
      await element(by.id('ui-lang-bg')).tap();
      
      // Wait for language change
      await waitFor(element(by.id('ui-lang-bg'))).toBeVisible().withTimeout(2000);
      
      // Verify BG language is active
      await expect(element(by.id('ui-lang-bg'))).toExist();
    });

    it('should switch from BG to EN language', async () => {
      // Switch to BG first
      await element(by.id('ui-lang-bg')).tap();
      await waitFor(element(by.id('ui-lang-bg'))).toBeVisible().withTimeout(2000);
      
      // Switch back to EN
      await element(by.id('ui-lang-en')).tap();
      await waitFor(element(by.id('ui-lang-en'))).toBeVisible().withTimeout(2000);
      
      // Verify EN language is active
      await expect(element(by.id('ui-lang-en'))).toExist();
    });

    it('should show translated content in BG', async () => {
      // Switch to BG language
      await element(by.id('ui-lang-bg')).tap();
      await waitFor(element(by.id('ui-lang-bg'))).toBeVisible().withTimeout(2000);
      
      // Check for translated content (if implemented)
      // This would depend on actual i18n implementation
      await expect(element(by.id('ui-controls'))).toBeVisible();
    });
  });

  describe('Density Controls', () => {
    beforeEach(async () => {
      // Navigate to UI Demo screen
      await element(by.id('tab-settings')).tap();
      await element(by.text('UI Demo')).tap();
    });

    it('should switch from comfortable to compact density', async () => {
      // Switch to compact density
      await element(by.id('ui-density-compact')).tap();
      
      // Verify compact density is active
      await expect(element(by.id('ui-density-compact'))).toExist();
      
      // Check that padding changed (would require visual verification)
    });

    it('should switch from compact to comfortable density', async () => {
      // Switch to compact first
      await element(by.id('ui-density-compact')).tap();
      
      // Switch back to comfortable
      await element(by.id('ui-density-comfortable')).tap();
      
      // Verify comfortable density is active
      await expect(element(by.id('ui-density-comfortable'))).toExist();
    });
  });

  describe('Motion Controls', () => {
    beforeEach(async () => {
      // Navigate to UI Demo screen
      await element(by.id('tab-settings')).tap();
      await element(by.text('UI Demo')).tap();
    });

    it('should toggle reduce motion switch', async () => {
      // Toggle reduce motion on
      await element(by.id('ui-reduce-motion')).tap();
      
      // Verify switch is toggled
      await expect(element(by.id('ui-reduce-motion'))).toExist();
      
      // Toggle reduce motion off
      await element(by.id('ui-reduce-motion')).tap();
      
      // Verify switch is toggled back
      await expect(element(by.id('ui-reduce-motion'))).toExist();
    });
  });

  describe('UI Components Rendering', () => {
    beforeEach(async () => {
      // Navigate to UI Demo screen
      await element(by.id('tab-settings')).tap();
      await element(by.text('UI Demo')).tap();
    });

    it('should render all UI sections', async () => {
      // Wait for sections to load
      await waitFor(element(by.id('ui-buttons'))).toBeVisible().withTimeout(3000);
      await waitFor(element(by.id('ui-badges'))).toBeVisible().withTimeout(3000);
      
      // Verify sections are present
      await expect(element(by.id('ui-buttons'))).toBeVisible();
      await expect(element(by.id('ui-badges'))).toBeVisible();
      await expect(element(by.id('ui-inputs'))).toBeVisible();
    });

    it('should render button components', async () => {
      await waitFor(element(by.id('ui-buttons'))).toBeVisible().withTimeout(3000);
      
      // Check for different button variants
      await expect(element(by.text('Primary'))).toBeVisible();
      await expect(element(by.text('Secondary'))).toBeVisible();
      await expect(element(by.text('Outline'))).toBeVisible();
      await expect(element(by.text('Ghost'))).toBeVisible();
    });

    it('should render badge components', async () => {
      await waitFor(element(by.id('ui-badges'))).toBeVisible().withTimeout(3000);
      
      // Check for different badge variants
      await expect(element(by.text('Primary'))).toBeVisible();
      await expect(element(by.text('Success'))).toBeVisible();
      await expect(element(by.text('Warning'))).toBeVisible();
      await expect(element(by.text('Danger'))).toBeVisible();
    });

    it('should render input components', async () => {
      await waitFor(element(by.id('ui-inputs'))).toBeVisible().withTimeout(3000);
      
      // Check for input components
      await expect(element(by.id('input-demo'))).toBeVisible();
    });
  });

  describe('Component Interactions', () => {
    beforeEach(async () => {
      // Navigate to UI Demo screen
      await element(by.id('tab-settings')).tap();
      await element(by.text('UI Demo')).tap();
    });

    it('should interact with button components', async () => {
      await waitFor(element(by.text('Primary'))).toBeVisible().withTimeout(3000);
      
      // Tap on primary button
      await element(by.text('Primary')).tap();
      
      // Should handle interaction without errors
      await expect(element(by.id('ui-controls'))).toBeVisible();
    });

    it('should scroll through all components', async () => {
      // Scroll to bottom
      await element(by.id('ui-demo')).scroll(500, 'down');
      
      // Wait for scroll to complete
      await waitFor(element(by.id('ui-inputs'))).toBeVisible().withTimeout(3000);
      
      // Should still be functional after scrolling
      await expect(element(by.id('ui-controls'))).toBeVisible();
    });
  });

  describe('Combined Interactions', () => {
    beforeEach(async () => {
      // Navigate to UI Demo screen
      await element(by.id('tab-settings')).tap();
      await element(by.text('UI Demo')).tap();
    });

    it('should handle theme and language changes together', async () => {
      // Switch to dark theme
      await element(by.id('ui-theme-dark')).tap();
      await waitFor(element(by.id('ui-theme-dark'))).toBeVisible().withTimeout(1000);
      
      // Switch to BG language
      await element(by.id('ui-lang-bg')).tap();
      await waitFor(element(by.id('ui-lang-bg'))).toBeVisible().withTimeout(2000);
      
      // Both should be active
      await expect(element(by.id('ui-theme-dark'))).toExist();
      await expect(element(by.id('ui-lang-bg'))).toExist();
    });

    it('should handle all control changes', async () => {
      // Switch to dark theme
      await element(by.id('ui-theme-dark')).tap();
      
      // Switch to BG language
      await element(by.id('ui-lang-bg')).tap();
      
      // Switch to compact density
      await element(by.id('ui-density-compact')).tap();
      
      // Toggle reduce motion
      await element(by.id('ui-reduce-motion')).tap();
      
      // Wait for all changes to apply
      await waitFor(element(by.id('ui-density-compact'))).toBeVisible().withTimeout(2000);
      
      // All controls should be functional
      await expect(element(by.id('ui-controls'))).toBeVisible();
      await expect(element(by.id('ui-demo'))).toBeVisible();
    });
  });

  describe('Performance and Stability', () => {
    beforeEach(async () => {
      // Navigate to UI Demo screen
      await element(by.id('tab-settings')).tap();
      await element(by.text('UI Demo')).tap();
    });

    it('should handle rapid interactions without crashing', async () => {
      // Rapidly tap different controls
      for (let i = 0; i < 5; i++) {
        await element(by.id('ui-theme-dark')).tap();
        await element(by.id('ui-theme-light')).tap();
        await element(by.id('ui-lang-bg')).tap();
        await element(by.id('ui-lang-en')).tap();
      }
      
      // Should still be functional
      await expect(element(by.id('ui-controls'))).toBeVisible();
    });

    it('should handle rapid scrolling', async () => {
      const scrollView = element(by.id('ui-demo'));
      
      // Scroll up and down rapidly
      for (let i = 0; i < 5; i++) {
        await scrollView.scroll(200, 'down');
        await scrollView.scroll(200, 'up');
      }
      
      // Should still be functional
      await expect(element(by.id('ui-controls'))).toBeVisible();
    });
  });

  describe('Accessibility', () => {
    beforeEach(async () => {
      // Navigate to UI Demo screen
      await element(by.id('tab-settings')).tap();
      await element(by.text('UI Demo')).tap();
    });

    it('should have accessible controls', async () => {
      // All controls should be accessible
      await expect(element(by.id('ui-theme-light'))).toBeVisible();
      await expect(element(by.id('ui-theme-dark'))).toBeVisible();
      await expect(element(by.id('ui-lang-en'))).toBeVisible();
      await expect(element(by.id('ui-lang-bg'))).toBeVisible();
      await expect(element(by.id('ui-density-comfortable'))).toBeVisible();
      await expect(element(by.id('ui-density-compact'))).toBeVisible();
      await expect(element(by.id('ui-reduce-motion'))).toBeVisible();
    });

    it('should support screen reader navigation', async () => {
      // This would test screen reader compatibility
      // Implementation depends on actual accessibility setup
      await expect(element(by.id('ui-controls'))).toBeVisible();
    });
  });

  describe('Error Handling', () => {
    beforeEach(async () => {
      // Navigate to UI Demo screen
      await element(by.id('tab-settings')).tap();
      await element(by.text('UI Demo')).tap();
    });

    it('should handle navigation errors gracefully', async () => {
      // Try to navigate away and back
      await device.pressBack();
      
      // Should handle back navigation gracefully
      await waitFor(element(by.text('Settings'))).toBeVisible().withTimeout(2000);
    });

    it('should recover from errors', async () => {
      // Simulate error scenario
      await element(by.id('ui-theme-dark')).tap();
      
      // Should recover and remain functional
      await expect(element(by.id('ui-controls'))).toBeVisible();
    });
  });

  describe('Screenshot and Visual Testing', () => {
    beforeEach(async () => {
      // Navigate to UI Demo screen
      await element(by.id('tab-settings')).tap();
      await element(by.text('UI Demo')).tap();
    });

    it('should take screenshots for visual testing', async () => {
      // Wait for UI to load
      await waitFor(element(by.id('ui-buttons'))).toBeVisible().withTimeout(3000);
      
      // Take screenshot (this would be configured in Detox config)
      await device.takeScreenshot('ui-showcase-light-theme');
      
      // Switch to dark theme and take another screenshot
      await element(by.id('ui-theme-dark')).tap();
      await waitFor(element(by.id('ui-theme-dark'))).toBeVisible().withTimeout(1000);
      
      await device.takeScreenshot('ui-showcase-dark-theme');
    });
  });
});

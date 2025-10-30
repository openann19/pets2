/**
 * UI Demo E2E Tests
 * Smoke tests for the UI showcase screen
 */

import { by, device, element, expect as detoxExpect } from 'detox';

describe('UI Demo', () => {
  beforeAll(async () => {
    await device.launchApp({ newInstance: true });
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  it('should display UI demo screen', async () => {
    // Navigate to UIDemo screen
    // Note: In a real app, you'd navigate via a dev menu or deep link
    // For now, we'll assume you can reach the screen via Settings > Dev Menu
    // or by programmatically navigating in the test
    
    // Wait for the screen to be visible
    await detoxExpect(element(by.id('ui-demo'))).toBeVisible();
  });

  it('should display UI controls', async () => {
    await detoxExpect(element(by.id('ui-controls'))).toBeVisible();
  });

  it('should toggle theme', async () => {
    // Tap light theme button
    await element(by.id('ui-theme-light')).tap();
    
    // Tap dark theme button
    await element(by.id('ui-theme-dark')).tap();
    
    // Verify buttons are still visible
    await detoxExpect(element(by.id('ui-theme-light'))).toBeVisible();
    await detoxExpect(element(by.id('ui-theme-dark'))).toBeVisible();
  });

  it('should toggle language', async () => {
    // Tap English button
    await element(by.id('ui-lang-en')).tap();
    
    // Tap Bulgarian button
    await element(by.id('ui-lang-bg')).tap();
    
    // Verify buttons are still visible
    await detoxExpect(element(by.id('ui-lang-en'))).toBeVisible();
    await detoxExpect(element(by.id('ui-lang-bg'))).toBeVisible();
  });

  it('should display button showcase', async () => {
    // Wait for the button showcase section
    await detoxExpect(element(by.id('ui-button'))).toBeVisible();
    
    // Verify button variants are visible
    await detoxExpect(element(by.id('btn-primary'))).toBeVisible();
    await detoxExpect(element(by.id('btn-secondary'))).toBeVisible();
    await detoxExpect(element(by.id('btn-outline'))).toBeVisible();
    await detoxExpect(element(by.id('btn-ghost'))).toBeVisible();
    await detoxExpect(element(by.id('btn-danger'))).toBeVisible();
  });

  it('should display input showcase', async () => {
    // Wait for the input showcase section
    await detoxExpect(element(by.id('ui-input'))).toBeVisible();
    
    // Verify input variants are visible
    await detoxExpect(element(by.id('input-default'))).toBeVisible();
    await detoxExpect(element(by.id('input-success'))).toBeVisible();
    await detoxExpect(element(by.id('input-error'))).toBeVisible();
  });

  it('should toggle density', async () => {
    // Toggle to compact
    await element(by.id('ui-density-compact')).tap();
    
    // Toggle back to comfortable
    await element(by.id('ui-density-comfortable')).tap();
    
    // Verify buttons are still visible
    await detoxExpect(element(by.id('ui-density-comfortable'))).toBeVisible();
    await detoxExpect(element(by.id('ui-density-compact'))).toBeVisible();
  });

  it('should toggle reduce motion', async () => {
    // Toggle reduce motion switch
    await element(by.id('ui-reduce-motion')).tap();
    
    // Toggle back
    await element(by.id('ui-reduce-motion')).tap();
    
    // Verify switch is still visible
    await detoxExpect(element(by.id('ui-reduce-motion'))).toBeVisible();
  });
});


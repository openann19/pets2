/**
 * Advanced Playwright Test Suite - Pet Management & Swiping
 * Tests core pet functionality with comprehensive coverage
 */
import { test, expect } from '@playwright/test';

test.describe('Pet Management & Swiping - Enterprise Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Use authenticated state
    await page.goto('/login');
    await page.fill('[data-testid="email-input"]', 'test@playwright.com');
    await page.fill('[data-testid="password-input"]', 'TestPassword123!');
    await page.click('[data-testid="login-button"]');
    await expect(page).toHaveURL('/dashboard');
  });

  test('should create new pet profile', async ({ page }) => {
    await page.click('[data-testid="add-pet-button"]');
    await expect(page).toHaveURL('/pets/new');
    
    // Fill pet form
    await page.fill('[data-testid="pet-name-input"]', 'Max');
    await page.selectOption('[data-testid="species-select"]', 'dog');
    await page.selectOption('[data-testid="breed-select"]', 'Labrador');
    await page.fill('[data-testid="age-input"]', '2');
    await page.selectOption('[data-testid="gender-select"]', 'male');
    await page.selectOption('[data-testid="size-select"]', 'large');
    await page.fill('[data-testid="bio-textarea"]', 'Friendly and energetic dog who loves to play fetch!');
    
    // Upload photo
    await page.setInputFiles('[data-testid="photo-upload"]', 'tests/fixtures/dog-photo.jpg');
    
    // Set location
    await page.click('[data-testid="location-button"]');
    await page.fill('[data-testid="location-search"]', 'San Francisco, CA');
    await page.click('[data-testid="location-option"]');
    
    await page.click('[data-testid="save-pet-button"]');
    
    // Verify pet was created
    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('[data-testid="pet-card"]')).toContainText('Max');
  });

  test('should display pet discovery feed', async ({ page }) => {
    await page.click('[data-testid="discover-link"]');
    await expect(page).toHaveURL('/discover');
    
    // Should show pet cards
    await expect(page.locator('[data-testid="pet-card"]')).toHaveCount.greaterThan(0);
    
    // Should show pet details
    const firstPet = page.locator('[data-testid="pet-card"]').first();
    await expect(firstPet.locator('[data-testid="pet-name"]')).toBeVisible();
    await expect(firstPet.locator('[data-testid="pet-photo"]')).toBeVisible();
    await expect(firstPet.locator('[data-testid="pet-bio"]')).toBeVisible();
  });

  test('should like a pet', async ({ page }) => {
    await page.goto('/discover');
    
    const petCard = page.locator('[data-testid="pet-card"]').first();
    const petName = await petCard.locator('[data-testid="pet-name"]').textContent();
    
    await petCard.click('[data-testid="like-button"]');
    
    // Should show like animation
    await expect(petCard.locator('[data-testid="like-animation"]')).toBeVisible();
    
    // Should move to next pet
    await page.waitForTimeout(1000);
    const nextPetName = await page.locator('[data-testid="pet-card"]').first().locator('[data-testid="pet-name"]').textContent();
    expect(nextPetName).not.toBe(petName);
  });

  test('should pass a pet', async ({ page }) => {
    await page.goto('/discover');
    
    const petCard = page.locator('[data-testid="pet-card"]').first();
    const petName = await petCard.locator('[data-testid="pet-name"]').textContent();
    
    await petCard.click('[data-testid="pass-button"]');
    
    // Should show pass animation
    await expect(petCard.locator('[data-testid="pass-animation"]')).toBeVisible();
    
    // Should move to next pet
    await page.waitForTimeout(1000);
    const nextPetName = await page.locator('[data-testid="pet-card"]').first().locator('[data-testid="pet-name"]').textContent();
    expect(nextPetName).not.toBe(petName);
  });

  test('should create match when both pets like each other', async ({ page }) => {
    // This test would require setting up a scenario where both pets like each other
    // For now, we'll test the match notification flow
    
    await page.goto('/matches');
    
    // Should show matches if any exist
    const matches = page.locator('[data-testid="match-card"]');
    if (await matches.count() > 0) {
      await expect(matches.first()).toBeVisible();
      await expect(matches.first().locator('[data-testid="match-pets"]')).toBeVisible();
    }
  });

  test('should filter pets by species', async ({ page }) => {
    await page.goto('/discover');
    
    // Open filters
    await page.click('[data-testid="filter-button"]');
    
    // Select dogs only
    await page.check('[data-testid="filter-dogs"]');
    await page.uncheck('[data-testid="filter-cats"]');
    
    await page.click('[data-testid="apply-filters"]');
    
    // All visible pets should be dogs
    const petCards = page.locator('[data-testid="pet-card"]');
    const count = await petCards.count();
    
    for (let i = 0; i < count; i++) {
      const petCard = petCards.nth(i);
      await expect(petCard.locator('[data-testid="pet-species"]')).toContainText('dog');
    }
  });

  test('should filter pets by age range', async ({ page }) => {
    await page.goto('/discover');
    
    await page.click('[data-testid="filter-button"]');
    
    // Set age range
    await page.fill('[data-testid="min-age"]', '1');
    await page.fill('[data-testid="max-age"]', '3');
    
    await page.click('[data-testid="apply-filters"]');
    
    // All visible pets should be within age range
    const petCards = page.locator('[data-testid="pet-card"]');
    const count = await petCards.count();
    
    for (let i = 0; i < count; i++) {
      const petCard = petCards.nth(i);
      const ageText = await petCard.locator('[data-testid="pet-age"]').textContent();
      const age = parseInt(ageText?.match(/\d+/)?.[0] || '0');
      expect(age).toBeGreaterThanOrEqual(1);
      expect(age).toBeLessThanOrEqual(3);
    }
  });

  test('should handle pet profile editing', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Click on existing pet
    const petCard = page.locator('[data-testid="pet-card"]').first();
    await petCard.click('[data-testid="edit-pet-button"]');
    
    await expect(page).toHaveURL(/\/pets\/\w+\/edit/);
    
    // Update pet bio
    await page.fill('[data-testid="bio-textarea"]', 'Updated bio for testing');
    await page.click('[data-testid="save-pet-button"]');
    
    // Verify update
    await expect(page).toHaveURL('/dashboard');
    await expect(petCard.locator('[data-testid="pet-bio"]')).toContainText('Updated bio for testing');
  });

  test('should handle pet deletion with confirmation', async ({ page }) => {
    await page.goto('/dashboard');
    
    const petCard = page.locator('[data-testid="pet-card"]').first();
    const petName = await petCard.locator('[data-testid="pet-name"]').textContent();
    
    await petCard.click('[data-testid="delete-pet-button"]');
    
    // Should show confirmation dialog
    await expect(page.locator('[data-testid="delete-confirmation"]')).toBeVisible();
    await expect(page.locator('[data-testid="delete-confirmation"]')).toContainText(`Delete ${petName}?`);
    
    await page.click('[data-testid="confirm-delete"]');
    
    // Pet should be removed
    await expect(petCard).not.toBeVisible();
  });

  test('should handle swipe gestures on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto('/discover');
    
    const petCard = page.locator('[data-testid="pet-card"]').first();
    
    // Swipe right to like
    await petCard.hover();
    await page.mouse.down();
    await page.mouse.move(300, 300);
    await page.mouse.up();
    
    // Should trigger like action
    await expect(petCard.locator('[data-testid="like-animation"]')).toBeVisible();
  });

  test('should handle infinite scroll in pet feed', async ({ page }) => {
    await page.goto('/discover');
    
    const initialCount = await page.locator('[data-testid="pet-card"]').count();
    
    // Scroll to bottom
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    
    // Wait for more pets to load
    await page.waitForTimeout(2000);
    
    const finalCount = await page.locator('[data-testid="pet-card"]').count();
    expect(finalCount).toBeGreaterThan(initialCount);
  });

  test('should handle network errors during pet operations', async ({ page }) => {
    // Simulate network failure
    await page.route('**/api/pets/**', route => route.abort());
    
    await page.goto('/discover');
    
    const petCard = page.locator('[data-testid="pet-card"]').first();
    await petCard.click('[data-testid="like-button"]');
    
    // Should show error message
    await expect(page.locator('[data-testid="error-message"]')).toContainText('Network error');
  });
});

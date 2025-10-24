/**
 * Advanced Playwright Test Suite - Authentication Flow
 * Tests critical authentication scenarios with enterprise-grade coverage
 */
import { test, expect } from '@playwright/test';

test.describe('Authentication Flow - Enterprise Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should register new user successfully', async ({ page }) => {
    await page.click('[data-testid="register-link"]');
    await expect(page).toHaveURL('/register');
    
    // Fill registration form
    await page.fill('[data-testid="email-input"]', 'newuser@test.com');
    await page.fill('[data-testid="password-input"]', 'SecurePassword123!');
    await page.fill('[data-testid="name-input"]', 'New Test User');
    await page.check('[data-testid="agree-terms"]');
    
    // Submit form
    await page.click('[data-testid="register-button"]');
    
    // Verify successful registration
    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('[data-testid="welcome-message"]')).toContainText('Welcome, New Test User');
  });

  test('should handle registration with existing email', async ({ page }) => {
    await page.click('[data-testid="register-link"]');
    
    // Use existing email
    await page.fill('[data-testid="email-input"]', 'test@playwright.com');
    await page.fill('[data-testid="password-input"]', 'Password123!');
    await page.fill('[data-testid="name-input"]', 'Existing User');
    await page.check('[data-testid="agree-terms"]');
    
    await page.click('[data-testid="register-button"]');
    
    // Verify error message
    await expect(page.locator('[data-testid="error-message"]')).toContainText('Email already exists');
  });

  test('should login with valid credentials', async ({ page }) => {
    await page.click('[data-testid="login-link"]');
    await expect(page).toHaveURL('/login');
    
    await page.fill('[data-testid="email-input"]', 'test@playwright.com');
    await page.fill('[data-testid="password-input"]', 'TestPassword123!');
    await page.click('[data-testid="login-button"]');
    
    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();
  });

  test('should handle invalid login credentials', async ({ page }) => {
    await page.click('[data-testid="login-link"]');
    
    await page.fill('[data-testid="email-input"]', 'test@playwright.com');
    await page.fill('[data-testid="password-input"]', 'WrongPassword');
    await page.click('[data-testid="login-button"]');
    
    await expect(page.locator('[data-testid="error-message"]')).toContainText('Invalid credentials');
  });

  test('should logout successfully', async ({ page }) => {
    // Login first
    await page.click('[data-testid="login-link"]');
    await page.fill('[data-testid="email-input"]', 'test@playwright.com');
    await page.fill('[data-testid="password-input"]', 'TestPassword123!');
    await page.click('[data-testid="login-button"]');
    
    await expect(page).toHaveURL('/dashboard');
    
    // Logout
    await page.click('[data-testid="user-menu"]');
    await page.click('[data-testid="logout-button"]');
    
    await expect(page).toHaveURL('/');
    await expect(page.locator('[data-testid="login-link"]')).toBeVisible();
  });

  test('should protect routes from unauthorized access', async ({ page }) => {
    // Try to access protected route without authentication
    await page.goto('/dashboard');
    
    // Should redirect to login
    await expect(page).toHaveURL('/login');
  });

  test('should handle password reset flow', async ({ page }) => {
    await page.click('[data-testid="login-link"]');
    await page.click('[data-testid="forgot-password-link"]');
    
    await expect(page).toHaveURL('/forgot-password');
    
    await page.fill('[data-testid="email-input"]', 'test@playwright.com');
    await page.click('[data-testid="reset-button"]');
    
    await expect(page.locator('[data-testid="success-message"]')).toContainText('Password reset email sent');
  });

  test('should validate form inputs', async ({ page }) => {
    await page.click('[data-testid="register-link"]');
    
    // Test empty form submission
    await page.click('[data-testid="register-button"]');
    
    // Should show validation errors
    await expect(page.locator('[data-testid="email-error"]')).toBeVisible();
    await expect(page.locator('[data-testid="password-error"]')).toBeVisible();
    await expect(page.locator('[data-testid="name-error"]')).toBeVisible();
    
    // Test invalid email format
    await page.fill('[data-testid="email-input"]', 'invalid-email');
    await page.fill('[data-testid="password-input"]', 'Password123!');
    await page.fill('[data-testid="name-input"]', 'Test User');
    await page.click('[data-testid="register-button"]');
    
    await expect(page.locator('[data-testid="email-error"]')).toContainText('Invalid email format');
    
    // Test weak password
    await page.fill('[data-testid="email-input"]', 'test@example.com');
    await page.fill('[data-testid="password-input"]', '123');
    await page.click('[data-testid="register-button"]');
    
    await expect(page.locator('[data-testid="password-error"]')).toContainText('Password too weak');
  });

  test('should handle network errors gracefully', async ({ page }) => {
    // Simulate network failure
    await page.route('**/api/auth/login', route => route.abort());
    
    await page.click('[data-testid="login-link"]');
    await page.fill('[data-testid="email-input"]', 'test@playwright.com');
    await page.fill('[data-testid="password-input"]', 'TestPassword123!');
    await page.click('[data-testid="login-button"]');
    
    // Should show network error message
    await expect(page.locator('[data-testid="error-message"]')).toContainText('Network error');
  });

  test('should maintain session across page refreshes', async ({ page }) => {
    // Login
    await page.click('[data-testid="login-link"]');
    await page.fill('[data-testid="email-input"]', 'test@playwright.com');
    await page.fill('[data-testid="password-input"]', 'TestPassword123!');
    await page.click('[data-testid="login-button"]');
    
    await expect(page).toHaveURL('/dashboard');
    
    // Refresh page
    await page.reload();
    
    // Should still be logged in
    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();
  });
});

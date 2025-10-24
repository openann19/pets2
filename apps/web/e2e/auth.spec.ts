import { expect, test } from '@playwright/test';

/**
 * E2E Authentication Tests
 * Tests complete authentication flows including login, registration, and password reset
 */

const TEST_USER = {
    email: `test-${Date.now()}@pawfectmatch.com`,
    password: 'Test123456!',
    name: 'Test User',
};

test.describe('Authentication Flow', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
    });

    test('should display login page correctly', async ({ page }) => {
        await page.goto('/login');

        // Check page title
        await expect(page.locator('text=Welcome back!')).toBeVisible();

        // Check form elements
        await expect(page.locator('input[type="email"]')).toBeVisible();
        await expect(page.locator('input[type="password"]')).toBeVisible();
        await expect(page.locator('button:has-text("Sign in")')).toBeVisible();

        // Check navigation links
        await expect(page.locator('a:has-text("Sign up")')).toBeVisible();
        await expect(page.locator('a:has-text("Forgot password?")')).toBeVisible();

        // Check trust indicators
        await expect(page.locator('text=Secure Login')).toBeVisible();
        await expect(page.locator('text=AI-Powered')).toBeVisible();
    });

    test('should show validation errors for invalid input', async ({ page }) => {
        await page.goto('/login');

        // Submit empty form
        await page.click('button:has-text("Sign in")');

        // Check for validation errors
        await expect(page.locator('text=Invalid email address')).toBeVisible();
        await expect(page.locator('text=Password must be at least 6 characters')).toBeVisible();
    });

    test('should show error for invalid credentials', async ({ page }) => {
        await page.goto('/login');

        // Fill in invalid credentials
        await page.fill('input[type="email"]', 'invalid@test.com');
        await page.fill('input[type="password"]', 'wrongpassword');

        // Submit form
        await page.click('button:has-text("Sign in")');

        // Wait for error message
        await expect(page.locator('text=/Login failed|Invalid credentials/i')).toBeVisible({
            timeout: 5000,
        });
    });

    test('should successfully login with valid credentials', async ({ page, context }) => {
        // Skip if test user doesn't exist - this requires backend setup
        test.skip(
            process.env.SKIP_AUTH_TESTS === 'true',
            'Requires backend with test user credentials',
        );

        await page.goto('/login');

        // Fill in credentials (using demo account if available)
        await page.fill('input[type="email"]', process.env.TEST_EMAIL || 'demo@pawfectmatch.com');
        await page.fill('input[type="password"]', process.env.TEST_PASSWORD || 'demo123');

        // Submit form
        await page.click('button:has-text("Sign in")');

        // Wait for navigation to dashboard
        await page.waitForURL('**/dashboard', { timeout: 10000 });

        // Verify we're logged in
        await expect(page).toHaveURL(/dashboard/);

        // Check that auth cookie was set
        const cookies = await context.cookies();
        const authCookie = cookies.find((c) => c.name === 'auth-token' || c.name === 'accessToken');
        expect(authCookie).toBeTruthy();
    });

    test('should redirect to login when accessing protected route', async ({ page }) => {
        await page.goto('/dashboard');

        // Should redirect to login
        await page.waitForURL('**/login', { timeout: 5000 });

        // Check for redirect parameter
        const url = new URL(page.url());
        expect(url.searchParams.get('from')).toBe('/dashboard');
    });

    test('should display registration page correctly', async ({ page }) => {
        await page.goto('/register');

        // Check page title
        await expect(page.locator('text=Create your account')).toBeVisible();

        // Check form elements exist
        await expect(page.locator('input[name="name"]')).toBeVisible();
        await expect(page.locator('input[type="email"]')).toBeVisible();
        await expect(page.locator('input[type="password"]')).toBeVisible();
        await expect(page.locator('button:has-text("Sign up")')).toBeVisible();

        // Check navigation link
        await expect(page.locator('a:has-text("Sign in")')).toBeVisible();
    });

    test('should show validation errors on registration', async ({ page }) => {
        await page.goto('/register');

        // Submit empty form
        await page.click('button:has-text("Sign up")');

        // Check for validation errors
        await expect(page.locator('text=/email|required/i').first()).toBeVisible();
    });

    test('should display forgot password page correctly', async ({ page }) => {
        await page.goto('/forgot-password');

        // Check page title
        await expect(page.locator('text=Reset your password')).toBeVisible();

        // Check form elements
        await expect(page.locator('input[type="email"]')).toBeVisible();
        await expect(page.locator('button:has-text("Send reset link")')).toBeVisible();

        // Check back link
        await expect(page.locator('a:has-text("Back to login")')).toBeVisible();
    });

    test('should submit forgot password request', async ({ page }) => {
        await page.goto('/forgot-password');

        // Fill in email
        await page.fill('input[type="email"]', 'test@example.com');

        // Submit form
        await page.click('button:has-text("Send reset link")');

        // Wait for success message
        await expect(
            page.locator('text=/Check your email|reset link sent/i').first(),
        ).toBeVisible({
            timeout: 5000,
        });
    });

    test('should persist session across page reloads', async ({ page, context }) => {
        test.skip(
            process.env.SKIP_AUTH_TESTS === 'true',
            'Requires backend with test user credentials',
        );

        // Login first
        await page.goto('/login');
        await page.fill('input[type="email"]', process.env.TEST_EMAIL || 'demo@pawfectmatch.com');
        await page.fill('input[type="password"]', process.env.TEST_PASSWORD || 'demo123');
        await page.click('button:has-text("Sign in")');
        await page.waitForURL('**/dashboard', { timeout: 10000 });

        // Reload page
        await page.reload();

        // Should still be on dashboard
        await expect(page).toHaveURL(/dashboard/);

        // Cookie should still exist
        const cookies = await context.cookies();
        const authCookie = cookies.find((c) => c.name === 'auth-token' || c.name === 'accessToken');
        expect(authCookie).toBeTruthy();
    });

    test('should redirect logged-in users from login page', async ({ page }) => {
        test.skip(
            process.env.SKIP_AUTH_TESTS === 'true',
            'Requires backend with test user credentials',
        );

        // Login first
        await page.goto('/login');
        await page.fill('input[type="email"]', process.env.TEST_EMAIL || 'demo@pawfectmatch.com');
        await page.fill('input[type="password"]', process.env.TEST_PASSWORD || 'demo123');
        await page.click('button:has-text("Sign in")');
        await page.waitForURL('**/dashboard', { timeout: 10000 });

        // Try to access login page again
        await page.goto('/login');

        // Should redirect to dashboard
        await page.waitForURL('**/dashboard', { timeout: 5000 });
    });

    test('should handle logout correctly', async ({ page, context }) => {
        test.skip(
            process.env.SKIP_AUTH_TESTS === 'true',
            'Requires backend with test user credentials',
        );

        // Login first
        await page.goto('/login');
        await page.fill('input[type="email"]', process.env.TEST_EMAIL || 'demo@pawfectmatch.com');
        await page.fill('input[type="password"]', process.env.TEST_PASSWORD || 'demo123');
        await page.click('button:has-text("Sign in")');
        await page.waitForURL('**/dashboard', { timeout: 10000 });

        // Find and click logout button (may be in profile dropdown)
        const logoutButton = page.locator('button:has-text("Logout"), button:has-text("Sign out")');
        await logoutButton.first().click();

        // Should redirect to login
        await page.waitForURL('**/login', { timeout: 5000 });

        // Auth cookie should be cleared
        const cookies = await context.cookies();
        const authCookie = cookies.find((c) => c.name === 'auth-token' || c.name === 'accessToken');
        expect(authCookie?.value || '').toBe('');
    });

    test('should have proper ARIA labels and accessibility', async ({ page }) => {
        await page.goto('/login');

        // Check form has proper labels
        const emailInput = page.locator('input[type="email"]');
        const emailLabel = await emailInput.getAttribute('aria-label');
        expect(emailLabel || (await page.locator('label[for="email"]').count()) > 0).toBeTruthy();

        const passwordInput = page.locator('input[type="password"]');
        const passwordLabel = await passwordInput.getAttribute('aria-label');
        expect(
            passwordLabel || (await page.locator('label[for="password"]').count()) > 0,
        ).toBeTruthy();

        // Check button is accessible
        const submitButton = page.locator('button:has-text("Sign in")');
        expect(await submitButton.getAttribute('disabled')).toBeNull();
    });

    test('should support keyboard navigation', async ({ page }) => {
        await page.goto('/login');

        // Tab through form elements
        await page.keyboard.press('Tab'); // Focus email
        await expect(page.locator('input[type="email"]')).toBeFocused();

        await page.keyboard.press('Tab'); // Focus password
        await expect(page.locator('input[type="password"]')).toBeFocused();

        await page.keyboard.press('Tab'); // Focus remember me
        await page.keyboard.press('Tab'); // Focus forgot password link

        await page.keyboard.press('Tab'); // Focus submit button
        await expect(page.locator('button:has-text("Sign in")')).toBeFocused();
    });

    test('should display loading state during login', async ({ page }) => {
        await page.goto('/login');

        // Fill in credentials
        await page.fill('input[type="email"]', 'test@example.com');
        await page.fill('input[type="password"]', 'password123');

        // Submit form
        const submitButton = page.locator('button:has-text("Sign in")');
        await submitButton.click();

        // Check for loading state (button disabled or loading text)
        await expect(submitButton).toBeDisabled();
    });
});

test.describe('Session Management', () => {
    test('should handle expired token gracefully', async ({ page }) => {
        // Set an expired token
        await page.context().addCookies([
            {
                name: 'auth-token',
                value: 'expired-token',
                domain: 'localhost',
                path: '/',
                httpOnly: false,
                secure: false,
                sameSite: 'Strict',
            },
        ]);

        // Try to access protected route
        await page.goto('/dashboard');

        // Should redirect to login due to invalid/expired token
        await page.waitForURL('**/login', { timeout: 10000 });
    });

    test('should handle token refresh', async ({ page, context }) => {
        test.skip(
            process.env.SKIP_AUTH_TESTS === 'true',
            'Requires backend token refresh implementation',
        );

        // This test would verify automatic token refresh
        // Implementation depends on backend token expiry times
    });
});

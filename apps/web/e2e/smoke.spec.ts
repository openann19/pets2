import { expect, test } from '@playwright/test';

test.describe('Smoke', () => {
    test('home page loads', async ({ page }) => {
        await page.goto('/');
        await expect(page).toHaveTitle(/pawfectmatch/i);
    });

    test('auth login page is reachable', async ({ page }) => {
        await page.goto('/auth/login');
        await expect(page.locator('form')).toBeVisible();
    });
});

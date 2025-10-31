import { defineConfig, devices } from '@playwright/test';

/**
 * Enterprise-grade Playwright configuration for PawfectMatch
 * Provides comprehensive cross-browser testing with advanced features
 */
export default defineConfig({
  testDir: './tests/playwright',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html'],
    ['json', { outputFile: 'test-results/results.json' }],
    ['junit', { outputFile: 'test-results/results.xml' }],
    ['github'],
  ],
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 10000,
    navigationTimeout: 30000,
    // Emulate reduced motion to avoid animation flakiness
    reducedMotion: 'reduce',
  },
  projects: [
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
        viewport: { width: 3840, height: 2160 }, // 4K UHD
        deviceScaleFactor: 2, // High DPI
      },
    },
    {
      name: 'firefox',
      use: { 
        ...devices['Desktop Firefox'],
        viewport: { width: 3840, height: 2160 }, // 4K UHD
        deviceScaleFactor: 2,
      },
    },
    {
      name: 'webkit',
      use: { 
        ...devices['Desktop Safari'],
        viewport: { width: 3840, height: 2160 }, // 4K UHD
        deviceScaleFactor: 2,
      },
    },
    {
      name: 'Mobile Chrome',
      use: { 
        ...devices['Pixel 5'],
        viewport: { width: 1080, height: 2400 }, // High-res mobile
        deviceScaleFactor: 3, // High DPI mobile
      },
    },
    {
      name: 'Mobile Safari',
      use: { 
        ...devices['iPhone 12'],
        viewport: { width: 1170, height: 2532 }, // iPhone 12 Pro Max
        deviceScaleFactor: 3,
      },
    },
    {
      name: 'Desktop Edge',
      use: { 
        ...devices['Desktop Edge'], 
        channel: 'msedge',
        viewport: { width: 3840, height: 2160 }, // 4K UHD
        deviceScaleFactor: 2,
      },
    },
    {
      name: 'UHD Testing',
      use: {
        viewport: { width: 3840, height: 2160 }, // 4K UHD
        deviceScaleFactor: 2,
        isMobile: false,
        hasTouch: false,
      },
    },
  ],
  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
  expect: {
    timeout: 10000,
    toHaveScreenshot: { threshold: 0.2 },
    toMatchSnapshot: { threshold: 0.2 },
  },
  globalSetup: './tests/playwright/global-setup.ts',
  globalTeardown: './tests/playwright/global-teardown.ts',
});

import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    supportFile: 'cypress/support/e2e.ts',
    videosFolder: 'cypress/videos',
    screenshotsFolder: 'cypress/screenshots',
    videoCompression: false,
    video: false, // Disable video recording for faster tests
    viewportWidth: 3840, // 4K UHD width
    viewportHeight: 2160, // 4K UHD height
    defaultCommandTimeout: 10000,
    requestTimeout: 10000,
    responseTimeout: 10000,
    // UHD Quality Settings
    screenshotOnRunFailure: true,
    screenshotOnRunFailureOptions: {
      capture: 'viewport',
      scale: true,
      quality: 100,
    },
  },
  env: {
    apiUrl: 'http://localhost:5001/api',
  },
  retries: {
    runMode: 2,
    openMode: 0,
  },
});


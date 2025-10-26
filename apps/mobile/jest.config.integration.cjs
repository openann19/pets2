/**
 * Jest configuration for integration tests
 * Full setup with all mocks loaded
 */
const baseConfig = require('./jest.config.cjs');

module.exports = {
  ...baseConfig,
  displayName: {
    name: 'INTEGRATION',
    color: 'magenta',
  },
  // Integration tests may need more time
  testTimeout: 30000, // 30 seconds
  // Load all mocks for integration tests
  setupFilesAfterEnv: [
    '<rootDir>/jest.setup.ts',
    '<rootDir>/src/setupTests.ts',
  ],
  // More memory for integration tests
  workerIdleMemoryLimit: '2GB',
  testEnvironmentOptions: {
    ...baseConfig.testEnvironmentOptions,
    customExportConditions: [''],
  },
  // Only run integration tests
  testMatch: [
    '<rootDir>/src/**/*integration*.test.{ts,tsx}',
    '<rootDir>/src/**/__tests__/*integration*.test.{ts,tsx}',
  ],
};


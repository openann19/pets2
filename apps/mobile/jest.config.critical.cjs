/**
 * Jest configuration for critical journey tests
 * Highest priority, comprehensive setup
 */
const baseConfig = require('./jest.config.cjs');

module.exports = {
  ...baseConfig,
  displayName: {
    name: 'CRITICAL',
    color: 'red',
  },
  testTimeout: 45000, // 45 seconds for critical tests
  setupFilesAfterEnv: [
    '<rootDir>/jest.setup.ts',
    '<rootDir>/src/setupTests.ts',
  ],
  workerIdleMemoryLimit: '2GB',
  bail: 1, // Fail fast on first error for critical tests
  testEnvironmentOptions: {
    ...baseConfig.testEnvironmentOptions,
    customExportConditions: [''],
  },
  // Only run critical tests
  testMatch: [
    '<rootDir>/src/**/critical*.test.{ts,tsx}',
    '<rootDir>/src/__tests__/critical*.test.{ts,tsx}',
  ],
};


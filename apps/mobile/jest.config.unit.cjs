/**
 * Jest configuration for unit tests
 * Optimized for fast execution with minimal mocking
 */
const baseConfig = require('./jest.config.cjs');

module.exports = {
  ...baseConfig,
  displayName: {
    name: 'UNIT',
    color: 'blue',
  },
  // Unit tests should be fast
  testTimeout: 10000, // 10 seconds
  // Load minimal mocks for unit tests
  setupFilesAfterEnv: ['<rootDir>/jest.setup.core.ts', '<rootDir>/src/setupTests.ts'],
  testEnvironmentOptions: {
    ...baseConfig.testEnvironmentOptions,
    customExportConditions: [''],
  },
};


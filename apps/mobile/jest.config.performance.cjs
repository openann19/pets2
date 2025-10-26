/**
 * Jest configuration for performance tests
 * Enhanced profiling and monitoring
 */
const baseConfig = require('./jest.config.cjs');

module.exports = {
  ...baseConfig,
  displayName: {
    name: 'PERFORMANCE',
    color: 'yellow',
  },
  testTimeout: 60000, // 60 seconds for performance tests
  setupFilesAfterEnv: [
    '<rootDir>/jest.setup.ts',
    '<rootDir>/src/setupTests.ts',
  ],
  workerIdleMemoryLimit: '2GB',
  // Log heap usage for performance monitoring
  verbose: true,
  testEnvironmentOptions: {
    ...baseConfig.testEnvironmentOptions,
    customExportConditions: [''],
  },
  // Only run performance tests
  testMatch: [
    '<rootDir>/src/**/*performance*.test.{ts,tsx}',
    '<rootDir>/src/**/__tests__/*performance*.test.{ts,tsx}',
  ],
};


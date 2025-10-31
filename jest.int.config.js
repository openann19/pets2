/**
 * Jest Configuration for Integration Tests
 * Runs integration tests with deterministic settings
 */

const baseConfig = require('./jest.config.base.cjs') || {};

module.exports = {
  ...baseConfig,
  displayName: 'integration',
  testMatch: [
    '**/__tests__/**/*.integration.test.{js,jsx,ts,tsx}',
    '**/*.integration.test.{js,jsx,ts,tsx}',
    '**/integration/**/*.test.{js,jsx,ts,tsx}',
  ],
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/build/',
    '/.next/',
    '/e2e/',
    '/\\.e2e\\.',
  ],
  testEnvironment: 'react-native',
  setupFilesAfterEnv: ['<rootDir>/apps/mobile/jest.setup.ts'],
  // Deterministic test settings
  maxWorkers: 1, // Run serially for integration tests
  testTimeout: 30000,
  // Coverage thresholds for integration tests
  coverageThreshold: {
    global: {
      branches: 75,
      functions: 75,
      lines: 75,
      statements: 75,
    },
  },
};


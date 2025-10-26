const baseConfig = require('../../jest.config.base.cjs');

/** @type {import('jest').Config} */
module.exports = {
  ...baseConfig,
  
  // Web-specific overrides
  testEnvironment: 'jsdom', // Use jsdom for browser-like environment
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],

  // Web-specific test patterns
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.{ts,tsx,js,jsx}',
    '<rootDir>/src/**/*.{test,spec}.{ts,tsx,js,jsx}',
    '<rootDir>/__tests__/**/*.{ts,tsx,js,jsx}',
    '!<rootDir>/e2e/**',
    '!<rootDir>/tests/playwright/**'
  ],

  // Next.js-specific path aliases
  moduleNameMapper: {
    '^@/components/(.*)$': '<rootDir>/src/components/$1',
    '^@/hooks/(.*)$': '<rootDir>/src/hooks/$1',
    '^@/services/(.*)$': '<rootDir>/src/services/$1',
    '^@/providers/(.*)$': '<rootDir>/src/providers/$1',
    '^@/app/(.*)$': '<rootDir>/app/$1',
    '^@/constants/(.*)$': '<rootDir>/src/constants/$1',
    '^@/lib/(.*)$': '<rootDir>/src/lib/$1',
    '^@/types/(.*)$': '<rootDir>/src/types/$1',
    '^@pawfectmatch/core$': '<rootDir>/../../packages/core/src'
  },
  
  coverageThreshold: {
    global: {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90,
    },
  }
};

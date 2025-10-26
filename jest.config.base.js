/**
 * Base Jest Configuration for PawfectMatch Monorepo
 *
 * This is the single source of truth for Jest configuration.
 * All workspace configs should import and extend this base config.
 */
module.exports = {
  // Global settings
  testEnvironment: 'node',
  collectCoverageFrom: [
    '**/*.{ts,tsx,js,jsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
    '!**/dist/**',
    '!**/build/**',
    '!**/*.config.{ts,js}',
    '!**/coverage/**',
    '!**/__mocks__/**',
    '!**/__tests__/fixtures/**',
  ],
  coverageDirectory: '<rootDir>/coverage',
  coverageReporters: ['text', 'lcov', 'html', 'json-summary'],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
  testMatch: [
    '<rootDir>/**/__tests__/**/*.(test|spec).(ts|tsx|js|jsx)',
    '<rootDir>/**/?(*.)+(spec|test).(ts|tsx|js|jsx)',
  ],
  transform: {
    '^.+\\.(ts|tsx)$': ['@swc/jest', {
      jsc: {
        transform: {
          react: {
            runtime: 'automatic',
          },
        },
      },
    }],
    '^.+\\.(js|jsx)$': ['@swc/jest'],
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  moduleNameMapper: {
    '^@shared/(.*)$': '<rootDir>/packages/shared/src/$1',
    '^@shared/errors$': '<rootDir>/packages/core-errors/src/index.ts',
    '^@shared/errors/(.*)$': '<rootDir>/packages/core-errors/src/$1',
  },
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testTimeout: 10000,
  verbose: true,
  detectOpenHandles: true,
  forceExit: true,
};

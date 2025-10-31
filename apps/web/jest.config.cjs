const baseConfig = require('../../jest.config.base.cjs');

/** @type {import('jest').Config} */
module.exports = {
  ...baseConfig,
  
  // Web-specific overrides
  testEnvironment: 'jsdom', // Use jsdom for browser-like environment
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],

  // Handle ES modules
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|react-native-vector-icons|@expo|expo-)/)',
  ],

  // Web-specific test patterns
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.{ts,tsx,js,jsx}',
    '<rootDir>/src/**/*.{test,spec}.{ts,tsx,js,jsx}',
    '<rootDir>/__tests__/**/*.{ts,tsx,js,jsx}',
    '!<rootDir>/e2e/**',
    '!<rootDir>/tests/playwright/**'
  ],

  // Next.js-specific path aliases (merge with base config)
  moduleNameMapper: {
    ...baseConfig.moduleNameMapper,
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@/components/(.*)$': '<rootDir>/src/components/$1',
    '^@/hooks/(.*)$': '<rootDir>/src/hooks/$1',
    '^@/services/(.*)$': '<rootDir>/src/services/$1',
    '^@/providers/(.*)$': '<rootDir>/src/providers/$1',
    '^@/app/(.*)$': '<rootDir>/app/$1',
    '^@/constants/(.*)$': '<rootDir>/src/constants/$1',
    '^@/lib/(.*)$': '<rootDir>/src/lib/$1',
    '^@/utils/(.*)$': '<rootDir>/src/utils/$1',
    '^@/types/(.*)$': '<rootDir>/src/types/$1',
    '^@pawfectmatch/core$': '<rootDir>/../../packages/core/src',
    // Handle CSS imports
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    // Handle image imports
    '\\.(jpg|jpeg|png|gif|svg|webp|avif)$': '<rootDir>/__mocks__/fileMock.js',
  },
  
  transform: {
    '^.+\\.(ts|tsx)$': 'babel-jest',
    '^.+\\.(js|jsx)$': 'babel-jest',
  },
  
  // Coverage settings
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.tsx',
    '!src/**/__tests__/**',
    '!src/**/__mocks__/**',
    '!src/types/**',
    '!src/**/*.config.ts',
    '!app/**', // Exclude Next.js app directory
    '!**/node_modules/**',
    '!**/dist/**',
    '!**/build/**',
    '!**/coverage/**',
  ],
  
  coverageThreshold: {
    global: {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90,
    },
  },

  // Clear mocks for better test isolation
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,
};

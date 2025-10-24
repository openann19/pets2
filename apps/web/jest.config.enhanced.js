/**
 * Enhanced Jest Configuration - 2025 Standards
 * Strict coverage thresholds and comprehensive testing setup
 */

/** @type {import('jest').Config} */
const config = {
  // === Test Environment ===
  preset: 'ts-jest',
  testEnvironment: 'jsdom',

  // === Module Resolution ===
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@/components/(.*)$': '<rootDir>/src/components/$1',
    '^@/services/(.*)$': '<rootDir>/src/services/$1',
    '^@/hooks/(.*)$': '<rootDir>/src/hooks/$1',
    '^@/utils/(.*)$': '<rootDir>/src/utils/$1',
    '^@/types/(.*)$': '<rootDir>/src/types/$1',
    '^@/lib/(.*)$': '<rootDir>/src/lib/$1',

    // Handle CSS imports
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',

    // Handle image imports
    '\\.(jpg|jpeg|png|gif|svg|webp|avif)$': '<rootDir>/__mocks__/fileMock.js',
  },

  // === Setup Files ===
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js', 'jest-axe/extend-expect'],

  // === Transform ===
  transform: {
    '^.+\\.(ts|tsx)$': [
      'ts-jest',
      {
        tsconfig: {
          jsx: 'react',
          esModuleInterop: true,
        },
      },
    ],
  },

  // === Test Match Patterns ===
  testMatch: ['**/__tests__/**/*.(test|spec).(ts|tsx)', '**/*.(test|spec).(ts|tsx)'],

  // === Coverage Collection ===
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.tsx',
    '!src/**/__tests__/**',
    '!src/**/__mocks__/**',
    '!src/types/**',
    '!src/**/*.config.ts',
  ],

  // === STRICT Coverage Thresholds (2025 Standard) ===
  coverageThresholds: {
    'global': {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },

    // === Critical Business Logic - 100% Coverage Required ===
    './src/services/api.ts': {
      branches: 100,
      functions: 100,
      lines: 100,
      statements: 100,
    },
    './src/services/MatchingService.ts': {
      branches: 100,
      functions: 100,
      lines: 100,
      statements: 100,
    },
    './src/services/NotificationService.ts': {
      branches: 95,
      functions: 95,
      lines: 95,
      statements: 95,
    },

    // === Authentication & Security - 100% Coverage Required ===
    './src/hooks/useAuth.ts': {
      branches: 100,
      functions: 100,
      lines: 100,
      statements: 100,
    },
    './src/contexts/AuthContext.tsx': {
      branches: 100,
      functions: 100,
      lines: 100,
      statements: 100,
    },

    // === Real-time Features - 95% Coverage Required ===
    './src/hooks/useSocket.ts': {
      branches: 95,
      functions: 95,
      lines: 95,
      statements: 95,
    },
    './src/hooks/useEnhancedSocket.ts': {
      branches: 95,
      functions: 95,
      lines: 95,
      statements: 95,
    },

    // === Payment Processing - 100% Coverage Required ===
    './src/services/api.subscription.ts': {
      branches: 100,
      functions: 100,
      lines: 100,
      statements: 100,
    },

    // === Custom Hooks - 95% Coverage Required ===
    './src/hooks/**/*.ts': {
      branches: 95,
      functions: 95,
      lines: 95,
      statements: 95,
    },
  },

  // === Coverage Reporters ===
  coverageReporters: ['text', 'text-summary', 'html', 'lcov', 'json-summary'],

  // === Coverage Directory ===
  coverageDirectory: '<rootDir>/coverage',

  // === Test Timeout ===
  testTimeout: 10000,

  // === Globals ===
  globals: {
    'ts-jest': {
      isolatedModules: true,
    },
  },

  // === Module File Extensions ===
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],

  // === Verbose Output ===
  verbose: true,

  // === Clear Mocks ===
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,

  // === Max Workers (for CI) ===
  maxWorkers: process.env.CI ? 2 : '50%',
};

module.exports = config;

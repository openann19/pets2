// apps/mobile/jest.config.js
const path = require('path');

const baseConfig = {
  preset: 'react-native',
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/src'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  transformIgnorePatterns: [
    // Allow transpiling workspace packages and RN/Expo modules
    'node_modules/(?!(@react-native|react-native|expo|expo-.*|@expo/.*|@unimodules/.*|@react-navigation/.*|react-native-gesture-handler|react-native-reanimated|@shopify/flash-list)/)'
  ],
  moduleNameMapper: {
    '^@mobile/src/(.*)$': '<rootDir>/src/$1',
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@mobile/(.*)$': '<rootDir>/src/$1',
    // Fix relative path resolution for services/uiConfig imports
    '^../theme/(.*)$': '<rootDir>/src/theme/$1',
    '^@pawfectmatch/design-tokens$': '<rootDir>/../../packages/design-tokens/src/index.ts',
    '^@pawfectmatch/design-tokens/(.*)$': '<rootDir>/../../packages/design-tokens/src/$1',
    '^@pawfectmatch/ui$': '<rootDir>/../../packages/ui/src/index.ts',
    '^@pawfectmatch/ui/(.*)$': '<rootDir>/../../packages/ui/src/$1',
    '^@pawfectmatch/core$': '<rootDir>/../../packages/core/src/index.ts',
    '^@pawfectmatch/core/(.*)$': '<rootDir>/../../packages/core/src/$1'
  },
  // Keep mocks predictable; avoid duplicate manual mocks by centralizing here
  modulePathIgnorePatterns: ['<rootDir>/__mocks_dupe__/'],
  clearMocks: true,
  resetMocks: false,
  restoreMocks: true
};

module.exports = {
  ...baseConfig,
  projects: [
    {
      displayName: 'services',
      ...baseConfig,
      testEnvironment: 'node',
      testMatch: [
        '<rootDir>/src/**/__tests__/**/*.test.ts',
        '<rootDir>/src/**/*.test.ts',
        '<rootDir>/src/**/services/**/*.test.ts',
        '<rootDir>/src/**/hooks/**/*.test.ts'
      ],
      testPathIgnorePatterns: [
        '/node_modules/',
        '/e2e/',
        '/\\.e2e\\.',
        '/integration\\.',
        '/\\.integration\\.',
        '/\\.ui\\.',
        '/contract\\.',
        '/\\.contract\\.',
        '/a11y\\.',
        '/\\.a11y\\.',
        '/performance\\.',
        '/\\.performance\\.'
      ],
      coverageThreshold: {
        global: {
          branches: 90,
          functions: 90,
          lines: 90,
          statements: 90
        }
      }
    },
    {
      displayName: 'ui',
      ...baseConfig,
      testEnvironment: 'jsdom',
      testMatch: [
        '<rootDir>/src/**/__tests__/**/*.test.tsx',
        '<rootDir>/src/**/*.test.tsx',
        '<rootDir>/src/**/components/**/*.test.tsx',
        '<rootDir>/src/**/screens/**/*.test.tsx'
      ],
      testPathIgnorePatterns: [
        '/node_modules/',
        '/e2e/',
        '/\\.e2e\\.',
        '/integration\\.',
        '/\\.integration\\.',
        '/services\\.',
        '/contract\\.',
        '/\\.contract\\.',
        '/a11y\\.',
        '/\\.a11y\\.',
        '/performance\\.',
        '/\\.performance\\.'
      ],
      coverageThreshold: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80
        }
      }
    },
    {
      displayName: 'integration',
      ...baseConfig,
      testEnvironment: 'jsdom',
      testMatch: [
        '<rootDir>/src/**/__tests__/**/*.integration.test.tsx',
        '<rootDir>/src/**/__tests__/**/*.integration.test.ts',
        '<rootDir>/src/**/*.integration.test.tsx',
        '<rootDir>/src/**/*.integration.test.ts',
        '<rootDir>/src/**/integration/**/*.test.ts',
        '<rootDir>/src/**/integration/**/*.test.tsx'
      ],
      testPathIgnorePatterns: [
        '/node_modules/',
        '/e2e/',
        '/\\.e2e\\.'
      ],
      // Note: testTimeout is global, set via --testTimeout flag or in individual tests
    },
    {
      displayName: 'contract',
      ...baseConfig,
      testEnvironment: 'node',
      testMatch: [
        '<rootDir>/src/**/__tests__/**/*.contract.test.ts',
        '<rootDir>/src/**/__tests__/**/*.contract.test.tsx',
        '<rootDir>/src/**/*.contract.test.ts',
        '<rootDir>/src/**/*.contract.test.tsx'
      ],
      testPathIgnorePatterns: [
        '/node_modules/',
        '/e2e/',
        '/\\.e2e\\.'
      ]
    },
    {
      displayName: 'a11y',
      ...baseConfig,
      testEnvironment: 'jsdom',
      testMatch: [
        '<rootDir>/src/**/__tests__/**/a11y/**/*.test.tsx',
        '<rootDir>/src/**/__tests__/**/a11y/**/*.test.ts',
        '<rootDir>/src/**/*.a11y.test.tsx',
        '<rootDir>/src/**/*.a11y.test.ts'
      ],
      testPathIgnorePatterns: [
        '/node_modules/',
        '/e2e/',
        '/\\.e2e\\.'
      ]
    }
  ]
};

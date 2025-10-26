const baseConfig = require('../../jest.config.base.cjs');

module.exports = {
  ...baseConfig,
  // Mobile-specific overrides
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.(test|spec).(ts|tsx|js|jsx)',
  ],
  testTimeout: 15000, // Increase default timeout to 15 seconds
  maxWorkers: '50%', // Limit workers to prevent resource exhaustion
  bail: false, // Continue running tests even if some fail
  verbose: false, // Reduce console noise
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': ['babel-jest', { configFile: './babel.config.cjs' }],
  },
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|@react-navigation|expo|@expo|expo-secure-store|expo-local-authentication|expo-modules-core|@react-native-community|react-native-keychain|react-native-reanimated|react-native-gesture-handler|@expo/vector-icons|@sentry|@react-native-masked-view)/)',
  ],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx,js,jsx}',
    '!src/**/__tests__/**',
    '!src/**/__mocks__/**',
    '!src/setupTests.ts',
  ],
  coverageThreshold: {
    global: {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90,
    },
    // Core packages require 95% coverage
    './src/services': {
      branches: 95,
      functions: 95,
      lines: 95,
      statements: 95,
    },
    './src/core': {
      branches: 95,
      functions: 95,
      lines: 95,
      statements: 95,
    },
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  moduleNameMapper: {
    ...baseConfig.moduleNameMapper,
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@mobile/(.*)$': '<rootDir>/src/$1',
    // More specific patterns must come before general ones
    '^@pawfectmatch/core/(.*)$': '<rootDir>/../../packages/core/src/$1',
    '^@pawfectmatch/ui/(.*)$': '<rootDir>/../../packages/ui/$1',
    '^@pawfectmatch/design-tokens/(.*)$': '<rootDir>/../../packages/design-tokens/src/$1',
    '^@pawfectmatch/core$': '<rootDir>/../../packages/core/src/index.ts',
    '^@pawfectmatch/ui$': '<rootDir>/../../packages/ui/src/index.ts',
    '^@pawfectmatch/design-tokens$': '<rootDir>/../../packages/design-tokens/src/index.ts',
    '^@pawfectmatch/(.*)$': '<rootDir>/../../packages/$1/src/index.ts',
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$': '<rootDir>/src/__mocks__/fileMock.js',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
  },
  globals: {
    __DEV__: true,
  },
};

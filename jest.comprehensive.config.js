/**
 * Comprehensive Jest Configuration
 * Advanced testing configuration for error boundaries, payment flows, offline scenarios, and edge cases
 */

const path = require('path');

module.exports = {
  // Test environment
  testEnvironment: 'jsdom',
  
  // Setup files
  setupFilesAfterEnv: [
    '<rootDir>/packages/testing/src/setup/setupTests.ts',
    '<rootDir>/packages/testing/src/setup/setupErrorHandling.ts',
    '<rootDir>/packages/testing/src/setup/setupMocks.ts',
  ],
  
  // Module name mapping
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/apps/web/src/$1',
    '^@mobile/(.*)$': '<rootDir>/apps/mobile/src/$1',
    '^@core/(.*)$': '<rootDir>/packages/core/src/$1',
    '^@ui/(.*)$': '<rootDir>/packages/ui/src/$1',
    '^@testing/(.*)$': '<rootDir>/packages/testing/src/$1',
    '^@analytics/(.*)$': '<rootDir>/packages/analytics/src/$1',
    '^@ai/(.*)$': '<rootDir>/packages/ai/src/$1',
  },
  
  // Test match patterns
  testMatch: [
    '<rootDir>/packages/testing/src/**/*.test.{ts,tsx}',
    '<rootDir>/packages/testing/src/**/*.spec.{ts,tsx}',
  ],
  
  // Coverage configuration
  collectCoverage: true,
  collectCoverageFrom: [
    'packages/core/src/**/*.{ts,tsx}',
    'packages/ui/src/**/*.{ts,tsx}',
    'apps/web/src/**/*.{ts,tsx}',
    'apps/mobile/src/**/*.{ts,tsx}',
    '!**/*.d.ts',
    '!**/*.stories.{ts,tsx}',
    '!**/node_modules/**',
    '!**/dist/**',
    '!**/build/**',
  ],
  coverageDirectory: 'coverage/comprehensive',
  coverageReporters: [
    'text',
    'text-summary',
    'html',
    'lcov',
    'json',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
    './packages/core/src/services/': {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90,
    },
    './packages/ui/src/components/ErrorBoundary/': {
      branches: 85,
      functions: 85,
      lines: 85,
      statements: 85,
    },
    './packages/ui/src/components/Payment/': {
      branches: 85,
      functions: 85,
      lines: 85,
      statements: 85,
    },
  },
  
  // Transform configuration
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      tsconfig: {
        jsx: 'react-jsx',
        esModuleInterop: true,
        allowSyntheticDefaultImports: true,
      },
    }],
    '^.+\\.(js|jsx)$': 'babel-jest',
  },
  
  // Module file extensions
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  
  // Test timeout
  testTimeout: 30000,
  
  // Maximum number of workers
  maxWorkers: '50%',
  
  // Retry configuration
  retries: 1,
  
  // Verbose output
  verbose: true,
  
  // Clear mocks between tests
  clearMocks: true,
  restoreMocks: true,
  
  // Error handling
  errorOnDeprecated: true,
  
  // Global setup and teardown
  globalSetup: '<rootDir>/packages/testing/src/setup/globalSetup.ts',
  globalTeardown: '<rootDir>/packages/testing/src/setup/globalTeardown.ts',
  
  // Test results processor
  testResultsProcessor: '<rootDir>/packages/testing/src/processors/testResultsProcessor.ts',
  
  // Custom matchers
  setupFilesAfterEnv: [
    '<rootDir>/packages/testing/src/setup/setupTests.ts',
    '<rootDir>/packages/testing/src/setup/setupCustomMatchers.ts',
  ],
  
  // Module paths
  modulePaths: [
    '<rootDir>/node_modules',
    '<rootDir>/packages',
  ],
  
  // Ignore patterns
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/build/',
    '/coverage/',
  ],
  
  // Coverage ignore patterns
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/build/',
    '/coverage/',
    '/.next/',
    '/.expo/',
    '**/*.d.ts',
    '**/*.stories.{ts,tsx}',
    '**/__tests__/**',
    '**/__mocks__/**',
  ],
  
  // Snapshot serializers
  snapshotSerializers: [
    'enzyme-to-json/serializer',
  ],
  
  // Test environment options
  testEnvironmentOptions: {
    url: 'http://localhost:3000',
  },
  
  // Projects for different test types
  projects: [
    {
      displayName: 'Error Boundaries',
      testMatch: ['<rootDir>/packages/testing/src/error-boundary/**/*.test.{ts,tsx}'],
      testEnvironment: 'jsdom',
      setupFilesAfterEnv: ['<rootDir>/packages/testing/src/setup/setupErrorBoundaryTests.ts'],
    },
    {
      displayName: 'Payment Flows',
      testMatch: ['<rootDir>/packages/testing/src/payment/**/*.test.{ts,tsx}'],
      testEnvironment: 'jsdom',
      setupFilesAfterEnv: ['<rootDir>/packages/testing/src/setup/setupPaymentTests.ts'],
      testTimeout: 60000,
    },
    {
      displayName: 'Offline Scenarios',
      testMatch: ['<rootDir>/packages/testing/src/offline/**/*.test.{ts,tsx}'],
      testEnvironment: 'jsdom',
      setupFilesAfterEnv: ['<rootDir>/packages/testing/src/setup/setupOfflineTests.ts'],
      testTimeout: 45000,
    },
    {
      displayName: 'User Feedback',
      testMatch: ['<rootDir>/packages/testing/src/feedback/**/*.test.{ts,tsx}'],
      testEnvironment: 'jsdom',
      setupFilesAfterEnv: ['<rootDir>/packages/testing/src/setup/setupFeedbackTests.ts'],
    },
  ],
  
  // Watch plugins
  watchPlugins: [
    'jest-watch-typeahead/filename',
    'jest-watch-typeahead/testname',
  ],
  
  // Notify mode
  notify: true,
  notifyMode: 'failure-change',
  
  // Cache directory
  cacheDirectory: '<rootDir>/.jest-cache',
  
  // Preset
  preset: 'ts-jest',
  
  // Extensions to treat as ESM
  extensionsToTreatAsEsm: ['.ts', '.tsx'],
  
  // Globals
  globals: {
    'ts-jest': {
      useESM: true,
    },
  },
  
  // Reporters
  reporters: [
    'default',
    ['jest-junit', {
      outputDirectory: 'test-results',
      outputName: 'junit.xml',
      suiteName: 'Comprehensive Test Suite',
    }],
    ['jest-html-reporters', {
      publicPath: 'test-results',
      filename: 'test-report.html',
      expand: true,
    }],
  ],
  
  // Custom test environment
  testEnvironment: 'jsdom',
  
  // Transform ignore patterns
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|react-native-.*|@react-navigation|@stripe)/)',
  ],
  
  // Module name mapping for React Native
  moduleNameMapping: {
    '^react-native$': 'react-native-web',
    '^@react-native-community/(.*)$': '@react-native-community/$1',
  },
  
  // Setup files for React Native
  setupFiles: [
    '<rootDir>/packages/testing/src/setup/setupReactNative.ts',
  ],
  
  // Test match for React Native
  testMatch: [
    '<rootDir>/packages/testing/src/**/*.test.{ts,tsx}',
    '<rootDir>/apps/mobile/src/**/*.test.{ts,tsx}',
  ],
  
  // Coverage for React Native
  collectCoverageFrom: [
    'apps/mobile/src/**/*.{ts,tsx}',
    '!apps/mobile/src/**/*.d.ts',
    '!apps/mobile/src/**/*.stories.{ts,tsx}',
  ],
  
  // Snapshot testing
  updateSnapshot: false,
  
  // Test name pattern
  testNamePattern: undefined,
  
  // Test path pattern
  testPathPattern: undefined,
  
  // Test regex
  testRegex: undefined,
  
  // Test sequencer
  testSequencer: '<rootDir>/packages/testing/src/sequencer/testSequencer.ts',
  
  // Test timeout for individual tests
  testTimeout: 30000,
  
  // Timers
  timers: 'real',
  
  // Unmocked module path patterns
  unmockedModulePathPatterns: [
    'react',
    'react-dom',
    'react-native',
  ],
  
  // Watch path ignore patterns
  watchPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/build/',
    '/coverage/',
  ],
  
  // Watchman
  watchman: true,
  
  // Worker idle memory limit
  workerIdleMemoryLimit: '512MB',
  
  // Worker threads
  workerThreads: true,
  
  // Custom resolver
  resolver: '<rootDir>/packages/testing/src/resolver/customResolver.ts',
  
  // Custom test environment
  testEnvironment: 'jsdom',
  
  // Custom test environment options
  testEnvironmentOptions: {
    url: 'http://localhost:3000',
    customExportConditions: ['node', 'node-addons'],
  },
  
  // Custom transform
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      tsconfig: {
        jsx: 'react-jsx',
        esModuleInterop: true,
        allowSyntheticDefaultImports: true,
        moduleResolution: 'node',
        target: 'es2020',
        lib: ['es2020', 'dom'],
      },
    }],
    '^.+\\.(js|jsx)$': 'babel-jest',
  },
  
  // Custom module name mapping
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/apps/web/src/$1',
    '^@mobile/(.*)$': '<rootDir>/apps/mobile/src/$1',
    '^@core/(.*)$': '<rootDir>/packages/core/src/$1',
    '^@ui/(.*)$': '<rootDir>/packages/ui/src/$1',
    '^@testing/(.*)$': '<rootDir>/packages/testing/src/$1',
    '^@analytics/(.*)$': '<rootDir>/packages/analytics/src/$1',
    '^@ai/(.*)$': '<rootDir>/packages/ai/src/$1',
    '^react-native$': 'react-native-web',
    '^@react-native-community/(.*)$': '@react-native-community/$1',
  },
  
  // Custom setup files
  setupFilesAfterEnv: [
    '<rootDir>/packages/testing/src/setup/setupTests.ts',
    '<rootDir>/packages/testing/src/setup/setupErrorHandling.ts',
    '<rootDir>/packages/testing/src/setup/setupMocks.ts',
    '<rootDir>/packages/testing/src/setup/setupCustomMatchers.ts',
    '<rootDir>/packages/testing/src/setup/setupReactNative.ts',
  ],
  
  // Custom global setup
  globalSetup: '<rootDir>/packages/testing/src/setup/globalSetup.ts',
  
  // Custom global teardown
  globalTeardown: '<rootDir>/packages/testing/src/setup/globalTeardown.ts',
  
  // Custom test results processor
  testResultsProcessor: '<rootDir>/packages/testing/src/processors/testResultsProcessor.ts',
  
  // Custom test sequencer
  testSequencer: '<rootDir>/packages/testing/src/sequencer/testSequencer.ts',
  
  // Custom resolver
  resolver: '<rootDir>/packages/testing/src/resolver/customResolver.ts',
};

/**
 * Real Jest Configuration for PawfectMatch
 * Comprehensive unit and integration testing setup
 */

import type { Config } from '@jest/types';

const config: Config.InitialOptions = {
  // Test environment
  testEnvironment: 'jsdom',
  
  // Setup files
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
  
  // Module name mapping
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@pawfectmatch/ui/(.*)$': '<rootDir>/../ui/src/$1',
    '^@pawfectmatch/ai/(.*)$': '<rootDir>/../ai/src/$1',
    '^@pawfectmatch/analytics/(.*)$': '<rootDir>/../analytics/src/$1',
    '^@pawfectmatch/testing/(.*)$': '<rootDir>/src/$1',
  },
  
  // Transform files
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      tsconfig: {
        jsx: 'react-jsx',
        esModuleInterop: true,
        allowSyntheticDefaultImports: true,
        strict: true,
        skipLibCheck: true,
        forceConsistentCasingInFileNames: true,
        moduleResolution: 'node',
        resolveJsonModule: true,
        isolatedModules: true,
        noEmit: true,
        target: 'es2020',
        lib: ['es2020', 'dom'],
        types: ['jest', 'node']
      }
    }],
    '^.+\\.(js|jsx)$': 'babel-jest',
    '^.+\\.(css|less|scss|sass)$': 'jest-css-modules-transform',
    '^.+\\.(png|jpg|jpeg|gif|svg)$': 'jest-transform-stub',
    '^.+\\.(woff|woff2|eot|ttf|otf)$': 'jest-transform-stub'
  },
  
  // Test file patterns
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.(ts|tsx|js|jsx)',
    '<rootDir>/src/**/*.(test|spec).(ts|tsx|js|jsx)',
    '<rootDir>/tests/**/*.(test|spec).(ts|tsx|js|jsx)'
  ],
  
  // Coverage configuration
  collectCoverage: true,
  collectCoverageFrom: [
    'src/**/*.(ts|tsx|js|jsx)',
    '!src/**/*.d.ts',
    '!src/**/*.stories.(ts|tsx|js|jsx)',
    '!src/**/__tests__/**',
    '!src/**/__mocks__/**',
    '!src/setupTests.ts',
    '!src/**/index.ts'
  ],
  
  // Coverage thresholds
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    },
    './src/components/': {
      branches: 85,
      functions: 85,
      lines: 85,
      statements: 85
    },
    './src/hooks/': {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90
    },
    './src/utils/': {
      branches: 95,
      functions: 95,
      lines: 95,
      statements: 95
    }
  },
  
  // Coverage reporters
  coverageReporters: [
    'text',
    'text-summary',
    'html',
    'lcov',
    'json',
    'json-summary'
  ],
  
  // Coverage directory
  coverageDirectory: 'coverage',
  
  // Test timeout
  testTimeout: 10000,
  
  // Verbose output
  verbose: true,
  
  // Clear mocks between tests
  clearMocks: true,
  
  // Restore mocks after each test
  restoreMocks: true,
  
  // Reset modules between tests
  resetModules: true,
  
  // Module file extensions
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  
  // Ignore patterns
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/build/',
    '/coverage/',
    '/.next/',
    '/.cache/'
  ],
  
  // Transform ignore patterns
  transformIgnorePatterns: [
    '/node_modules/(?!(.*\\.mjs$|@pawfectmatch|@testing-library|@playwright))'
  ],
  
  // Global setup
  globalSetup: '<rootDir>/src/globalSetup.ts',
  
  // Global teardown
  globalTeardown: '<rootDir>/src/globalTeardown.ts',
  
  // Test results processor
  testResultsProcessor: '<rootDir>/src/testResultsProcessor.ts',
  
  // Reporters
  reporters: [
    'default',
    ['jest-html-reporters', {
      publicPath: './coverage/html-report',
      filename: 'report.html',
      expand: true,
      hideIcon: false,
      pageTitle: 'PawfectMatch Test Report',
      logoImgPath: undefined,
      darkTheme: false,
      openReport: false,
      includeFailureMsg: true,
      includeSuiteFailure: true
    }],
    ['jest-junit', {
      outputDirectory: './coverage',
      outputName: 'junit.xml',
      classNameTemplate: '{classname}',
      titleTemplate: '{title}',
      ancestorSeparator: ' › ',
      usePathForSuiteName: true
    }]
  ],
  
  // Watch plugins
  watchPlugins: [
    'jest-watch-typeahead/filename',
    'jest-watch-typeahead/testname'
  ],
  
  // Projects for monorepo
  projects: [
    {
      displayName: 'unit',
      testMatch: ['<rootDir>/src/**/*.test.(ts|tsx|js|jsx)'],
      testEnvironment: 'jsdom'
    },
    {
      displayName: 'integration',
      testMatch: ['<rootDir>/src/**/*.integration.test.(ts|tsx|js|jsx)'],
      testEnvironment: 'node'
    },
    {
      displayName: 'e2e',
      testMatch: ['<rootDir>/src/**/*.e2e.test.(ts|tsx|js|jsx)'],
      testEnvironment: 'node',
      setupFilesAfterEnv: ['<rootDir>/src/setupE2E.ts']
    }
  ],
  
  // Global variables
  globals: {
    'ts-jest': {
      useESM: true
    }
  },
  
  // Extensions to treat as ESM
  extensionsToTreatAsEsm: ['.ts', '.tsx'],
  
  // Module loader
  moduleLoader: 'jest-environment-jsdom',
  
  // Test sequencer
  testSequencer: '<rootDir>/src/testSequencer.ts',
  
  // Worker threads
  workerThreads: true,
  
  // Max workers
  maxWorkers: '50%',
  
  // Cache
  cache: true,
  cacheDirectory: '<rootDir>/.jest-cache',
  
  // Error handling
  errorOnDeprecated: true,
  
  // Force exit
  forceExit: true,
  
  // Detect open handles
  detectOpenHandles: true,
  
  // Detect leaks
  detectLeaks: true,
  
  // Log heap usage
  logHeapUsage: true,
  
  // Notify
  notify: false,
  
  // Notify mode
  notifyMode: 'failure-change',
  
  // Only changed
  onlyChanged: false,
  
  // Pass with no tests
  passWithNoTests: true,
  
  // Preset
  preset: 'ts-jest/presets/default-esm',
  
  // Root directory
  rootDir: '.',
  
  // Roots
  roots: ['<rootDir>/src', '<rootDir>/tests'],
  
  // Run in band
  runInBand: false,
  
  // Silent
  silent: false,
  
  // Skip node resolution
  skipNodeResolution: false,
  
  // Snapshot serializers
  snapshotSerializers: [
    'enzyme-to-json/serializer'
  ],
  
  // Test environment options
  testEnvironmentOptions: {
    url: 'http://localhost:3000'
  },
  
  // Test location in results
  testLocationInResults: true,
  
  // Test name pattern
  testNamePattern: '',
  
  // Test path pattern
  testPathPattern: '',
  
  // Test regex
  testRegex: '',
  
  // Test URL
  testURL: 'http://localhost:3000',
  
  // Timestamp
  timers: 'real',
  
  // Update snapshots
  updateSnapshot: false,
  
  // Use stderr
  useStderr: false,
  
  // Watch
  watch: false,
  
  // Watch all
  watchAll: false,
  
  // Watchman
  watchman: true
};

export default config;

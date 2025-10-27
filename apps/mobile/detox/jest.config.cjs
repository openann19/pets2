/**
 * Jest Configuration for Detox E2E Tests
 */

module.exports = {
  preset: '../../node_modules/detox/runners/jest',
  testEnvironment: 'node',
  testMatch: [
    '<rootDir>/../e2e/**/*.e2e.{js,ts}',
    '<rootDir>/../e2e/**/*.e2e.test.{js,ts}',
  ],
  setupFilesAfterEnv: ['<rootDir>/../e2e/setup.ts'],
  testTimeout: 180000, // 3 minutes for E2E tests
  verbose: true,
  reporters: [
    'default',
    [
      'jest-junit',
      {
        outputDirectory: './reports',
        outputName: 'e2e-junit.xml',
        classNameTemplate: '{classname}',
        titleTemplate: '{title}',
        ancestorSeparator: ' › ',
        usePathForSuiteName: true,
      },
    ],
  ],
  collectCoverage: false, // Coverage for E2E is not typically useful
  maxWorkers: 1, // E2E tests should run sequentially
  transform: { 
    '^.+\\.[jt]sx?$': 'babel-jest' 
  },
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?|react-native-.*|@react-navigation/.*|expo|@expo/.*)/)'
  ],
  moduleFileExtensions: ['ts', 'js', 'json', 'tsx', 'jsx'],
  testPathIgnorePatterns: [
    '/node_modules/',
    '/android/',
    '/ios/',
    '/coverage/',
  ],
};

/**
 * Simplified Jest configuration for running basic hook tests with jsdom
 */
module.exports = {
  preset: 'react-native',
  testMatch: [
    '<rootDir>/src/hooks/__tests__/useCounter.test.ts',
    '<rootDir>/src/hooks/__tests__/standalone-test.ts',
    '<rootDir>/src/hooks/__tests__/minimal.test.ts',
    '<rootDir>/src/hooks/__tests__/useToggleState.simple.test.ts'
  ],
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.(ts|tsx)$': 'babel-jest',
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  setupFiles: ['<rootDir>/src/hooks/__tests__/setup-simple.js'],
  moduleNameMapper: {
    '^@mobile/(.*)$': '<rootDir>/src/$1',
    '^@pawfectmatch/core$': '<rootDir>/__mocks__/@pawfectmatch/core.ts',
    '^react-native$': 'react-native-web',
  },
  testPathIgnorePatterns: [
    '/node_modules/',
    '/__mocks__/',
    '/e2e/',
    '/.e2e./',
    '/integration./',
    '/.integration./',
    '/services./',
    '/ui./',
    '/contract./',
    '/.contract./',
    '/a11y./',
    '/.a11y./',
    '/performance./',
    '/.performance./',
    '\\.d\\.ts$',
    'test-utils\\.ts$',
    'jest-axe\\.d\\.ts$',
  ],
};

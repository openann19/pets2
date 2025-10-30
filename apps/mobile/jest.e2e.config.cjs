/**
 * Jest Configuration for Detox E2E Tests
 */

const path = require('path');

module.exports = {
  testRunner: 'jest-circus/runner',
  preset: 'react-native',
  rootDir: path.resolve(__dirname),
  testMatch: ['**/e2e/**/*.e2e.(ts|tsx|js)'],
  setupFilesAfterEnv: ['<rootDir>/e2e/init.js'],
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest',
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@mobile/(.*)$': '<rootDir>/src/$1',
  },
  transformIgnorePatterns: [
    'node_modules/(?!(?:react-native' +
      '|@react-native' +
      '|react-native-.*' +
      '|@react-navigation/.*' +
      '|@react-native-community/.*' +
      '|@expo/.*' +
      '|expo-.*' +
      ')/)',
  ],
  reporters: [
    'default',
  ],
  globalSetup: 'detox/runners/jest/globalSetup',
  globalTeardown: 'detox/runners/jest/globalTeardown',
  testEnvironment: 'detox/runners/jest/testEnvironment',
  verbose: true,
  testTimeout: 120000,
};

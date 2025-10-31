/**
 * Jest configuration for testing toggle state hook
 */
module.exports = {
  preset: 'react-native',
  testMatch: [
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
};

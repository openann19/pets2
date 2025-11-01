const path = require('path');

module.exports = {
  displayName: 'mobile',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: [
    '<rootDir>/src/setupTests.ts'
  ],
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.{ts,tsx}',
    '<rootDir>/src/**/*.{test,spec}.{ts,tsx}'
  ],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  moduleNameMapper: {
    '^react-native$': 'react-native-web',
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@pawfectmatch/core$': '<rootDir>/../../packages/core/src/index.ts',
    '^@pawfectmatch/core/(.*)$': '<rootDir>/../../packages/core/src/$1',
    '^@pawfectmatch/design-tokens$': '<rootDir>/../../packages/design-tokens/src/index.ts',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$': '<rootDir>/__mocks__/fileMock.js',
  },
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|@react-navigation|@expo|expo-.*|@testing-library|@react-native-async-storage|react-native-.*)/)'
  ],
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': ['babel-jest', {
      presets: ['@babel/preset-env', '@babel/preset-react', '@babel/preset-typescript']
    }]
  },
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/__tests__/**',
    '!src/**/__mocks__/**',
    '!src/**/test-utils/**',
    '!src/setupTests.ts'
  ],
  coverageDirectory: '<rootDir>/coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  testTimeout: 10000,
  passWithNoTests: true
};

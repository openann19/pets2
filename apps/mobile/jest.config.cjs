// apps/mobile/jest.config.js
const path = require('path');

module.exports = {
  preset: 'jest-expo',
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/src'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  transformIgnorePatterns: [
    // Allow transpiling workspace packages
    'node_modules/(?!(@react-native|react-native|expo|expo-.*|@expo/.*|@unimodules/.*|@react-navigation/.*|@shopify/flash-list)/)'
  ],
  moduleNameMapper: {
    '^@mobile/src/(.*)$': '<rootDir>/src/$1',
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@mobile/(.*)$': '<rootDir>/src/$1',
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

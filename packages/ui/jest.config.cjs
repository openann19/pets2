const base = require('../../jest.config.base.cjs');

module.exports = {
  ...base,
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/src'],
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest'
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@pawfectmatch/core$': '<rootDir>/../core/src/index.ts',
    '^@pawfectmatch/core/(.*)$': '<rootDir>/../core/src/$1'
  },
};

import base from '../jest.config.base.js';

const config = {
  ...base,
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.(ts|tsx|js)'],
  testPathIgnorePatterns: ['<rootDir>/tests/e2e/'],
  setupFilesAfterEnv: ['./tests/setup.js'],
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.json' }],
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  extensionsToTreatAsEsm: ['.ts', '.tsx'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
};

export default config;

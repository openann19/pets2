import type { Config } from 'jest';
// @ts-ignore - No types available for the base config
import base from '../jest.config.base.cjs';

const config: Config = {
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
  coverageThreshold: {
    global: {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90,
    },
    './src/controllers': {
      branches: 95,
      functions: 95,
      lines: 95,
      statements: 95,
    },
    './src/services': {
      branches: 95,
      functions: 95,
      lines: 95,
      statements: 95,
    },
  },
};

export default config;

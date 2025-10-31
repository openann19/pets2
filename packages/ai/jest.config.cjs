const baseConfig = require('../../jest.config.base.cjs');

module.exports = {
  ...baseConfig,
  preset: 'ts-jest/presets/default-esm',
  extensionsToTreatAsEsm: ['.ts'],
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: [
    '**/__tests__/**/*.test.(ts|tsx|js)',
    '**/*.(test|spec).(ts|tsx|js)'
  ],
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      useESM: true,
      tsconfig: {
        module: 'ES2022',
        moduleResolution: 'bundler',
        jsx: 'react-jsx'
      }
    }]
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^(\\.{1,2}/.*)\\.js$': '$1'
  },
  globals: {
    'ts-jest': {
      useESM: true,
      tsconfig: {
        module: 'ES2022',
        moduleResolution: 'bundler',
        jsx: 'react-jsx'
      }
    }
  },
  transformIgnorePatterns: [
    'node_modules/(?!(@pawfectmatch)/)',
  ],
  coverageThreshold: {
    global: {
      branches: 85,
      functions: 85,
      lines: 85,
      statements: 85
    }
  },
  // Override base config - ai package doesn't need setup files
  setupFilesAfterEnv: undefined,
};

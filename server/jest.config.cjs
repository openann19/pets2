// @ts-check

/** @type {import('jest').Config} */
const config = {
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.(ts|tsx|js)', '!**/tests/e2e/**'],
  testPathIgnorePatterns: [
    '<rootDir>/tests/e2e/',
    '<rootDir>/__tests__/',
  ],
  setupFilesAfterEnv: ['./tests/jest.setup.js'],
  preset: 'ts-jest/presets/default',
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      tsconfig: {
        module: 'commonjs',
        target: 'ES2022',
        esModuleInterop: true,
        allowSyntheticDefaultImports: true,
        skipLibCheck: true,
      },
    }],
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  extensionsToTreatAsEsm: [],
  moduleNameMapper: {
    '^\\.\\./server$': '<rootDir>/src/app.ts',
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@shared/(.*)$': '<rootDir>/../packages/shared/src/$1',
    '^@shared/errors$': '<rootDir>/../packages/core-errors/src/index.ts',
    '^@shared/errors/(.*)$': '<rootDir>/../packages/core-errors/src/$1',
  },
  transformIgnorePatterns: [
    'node_modules/(?!(@sentry|.*\\.mjs$))',
  ],
  coverageReporters: ['text', 'lcov', 'html', 'json-summary'],
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

module.exports = config;

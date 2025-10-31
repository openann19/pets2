// @ts-check

/** @type {import('jest').Config} */
const config = {
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.(ts|tsx|js)', '!**/tests/e2e/**'],
  testPathIgnorePatterns: [
    '<rootDir>/tests/e2e/',
    '<rootDir>/__tests__/',
  ],
  moduleNameMapper: {
    '^\\.\\./server$': '<rootDir>/tests/mocks/server.ts',
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@shared/(.*)$': '<rootDir>/../packages/shared/src/$1',
    '^@shared/errors$': '<rootDir>/../packages/core-errors/src/index.ts',
    '^@shared/errors/(.*)$': '<rootDir>/../packages/core-errors/src/$1',
  },
  setupFilesAfterEnv: ['./tests/jest.setup.js'],
  preset: 'ts-jest/presets/default-esm',
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      tsconfig: {
        include: ['tests/**/*', 'src/**/*'],
        exclude: ['server.ts', '**/node_modules/**'],
        module: 'nodenext',
        target: 'ES2022',
        moduleResolution: 'nodenext',
        esModuleInterop: true,
        allowSyntheticDefaultImports: true,
        skipLibCheck: true,
        verbatimModuleSyntax: false,
        allowJs: true,
        strict: false,
        noImplicitAny: false,
        noPropertyAccessFromIndexSignature: false,
      },
      useESM: true,
    }],
    '^.+\\.js$': ['ts-jest', {
      tsconfig: {
        module: 'nodenext',
        target: 'ES2022',
        moduleResolution: 'nodenext',
        esModuleInterop: true,
        allowSyntheticDefaultImports: true,
        skipLibCheck: true,
        verbatimModuleSyntax: false,
        allowJs: true,
        strict: false,
        noPropertyAccessFromIndexSignature: false,
        noImplicitAny: false,
      },
      useESM: true,
    }],
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  extensionsToTreatAsEsm: ['.ts', '.tsx'],
  transformIgnorePatterns: [
    'node_modules/(?!(@sentry|p-map|fast-check|.*\\.mjs$))',
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

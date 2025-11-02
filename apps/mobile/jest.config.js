module.exports = {
  preset: 'jest-expo',
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@pawfectmatch/core(.*)$': '<rootDir>/../../packages/core/src$1',
  },
  testMatch: [
    '**/__tests__/**/*.[jt]s?(x)',
    '**/?(*.)+(spec|test).[jt]s?(x)',
  ],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{ts,tsx}',
    '!src/**/__tests__/**',
    '!src/**/__mocks__/**',
    '!src/**/index.{ts,tsx}',
    '!src/**/*.test.{ts,tsx}',
    '!src/__experimental__/**',
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 75,
      lines: 75,
      statements: 75,
    },
    './src/components/**': {
      lines: 85,
      branches: 80,
      functions: 85,
      statements: 85,
    },
    './src/screens/**': {
      lines: 80,
      branches: 75,
      functions: 80,
      statements: 80,
    },
    './src/hooks/**': {
      lines: 85,
      branches: 80,
      functions: 85,
      statements: 85,
    },
    './src/services/**': {
      lines: 85,
      branches: 80,
      functions: 85,
      statements: 85,
    },
  },
  testEnvironment: 'node',
  verbose: true,
};

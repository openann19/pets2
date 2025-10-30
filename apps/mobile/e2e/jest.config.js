/**
 * Jest configuration for Detox E2E tests
 */

module.exports = {
  rootDir: '..',
  preset: 'detox/node',
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/e2e/init.js'],
  testMatch: ['<rootDir>/e2e/**/*.e2e.ts', '<rootDir>/e2e/**/*.e2e.js', '<rootDir>/e2e/**/*.test.ts'],
  verbose: true,
  transform: {
    '^.+\\.(ts|tsx|js)$': [
      'ts-jest',
      {
        tsconfig: '<rootDir>/tsconfig.json',
      },
    ],
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  coveragePathIgnorePatterns: ['/node_modules/', '/e2e/'],
  testTimeout: 120000,
};


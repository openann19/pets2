/**
 * Jest configuration for component tests
 */
module.exports = {
  preset: 'react-native',
  testMatch: [
    '<rootDir>/src/hooks/__tests__/standalone-test.ts',
    '<rootDir>/src/hooks/__tests__/minimal.test.ts',
    '<rootDir>/src/hooks/__tests__/jest-env.test.ts',
    '<rootDir>/src/hooks/__tests__/comprehensive.test.ts',
    '<rootDir>/src/hooks/__tests__/useNetworkStatus.test.ts',
    '<rootDir>/src/hooks/__tests__/usePremiumStatus.test.ts',
    '<rootDir>/src/hooks/__tests__/useErrorHandler.test.ts',
    '<rootDir>/src/hooks/__tests__/useColorScheme.test.ts',
    '<rootDir>/src/hooks/__tests__/useBubbleRetryShake.test.ts',
    '<rootDir>/src/hooks/__tests__/useReducedMotion.test.ts',
    '<rootDir>/src/hooks/__tests__/useCounter.test.ts',
    '<rootDir>/src/hooks/__tests__/useBadgeCount.test.ts',
    '<rootDir>/src/hooks/__tests__/useNotifications.test.ts',
    '<rootDir>/src/components/__tests__/ErrorBoundary.test.tsx',
    '<rootDir>/src/components/__tests__/OfflineIndicator.test.tsx',
    '<rootDir>/src/components/__tests__/ThemeToggle.test.tsx'
  ],
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.(ts|tsx)$': 'babel-jest',
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  setupFiles: ['<rootDir>/src/hooks/__tests__/setup-simple.js'],
  moduleNameMapper: {
    '^@mobile/(.*)$': '<rootDir>/src/$1',
    '^@pawfectmatch/core$': '<rootDir>/__mocks__/@pawfectmatch/core.ts',
  },
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/__tests__/**',
    '!src/**/__mocks__/**',
  ],
  coverageDirectory: 'coverage-components',
  coverageReporters: ['text', 'lcov', 'html', 'json'],
};

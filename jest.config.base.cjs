/**
 * Base Jest configuration for PawfectMatch monorepo
 * Common settings shared across all packages and apps
 */
const config = {
  // Common test settings
  testTimeout: 10000,
  verbose: true,

  // Coverage settings
  collectCoverageFrom: [
    'src/**/*.{ts,tsx,js,jsx}',
    '!src/**/*.d.ts',
    '!src/setupTests.{ts,js}',
    '!src/**/__tests__/**',
    '!src/**/*.test.{ts,tsx,js,jsx}',
    '!src/**/*.spec.{ts,tsx,js,jsx}',
    '!src/test-utils/**',
    '!src/**/__mocks__/**'
  ],
  coverageReporters: ['text', 'lcov', 'html'],
  coverageDirectory: 'coverage',

  // Module file extensions
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],

  // Transform ignore patterns (can be extended)
  transformIgnorePatterns: [
    '/node_modules/(?!(zod|@tanstack|axios|recharts|framer-motion|date-fns|lucide-react|sonner|bson|mongodb|@heroicons/react|@headlessui|@radix-ui|jest-expo|@react-native|expo|react-navigation|@react-navigation|@unimodules|unimodules|sentry-expo|native-base|react-native-svg)/)'
  ]
};

export default config;
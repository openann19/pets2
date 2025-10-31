import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const coverageGlobs = [
  'apps/web/src/**/*.{ts,tsx,js,jsx}',
  'apps/mobile/src/**/*.{ts,tsx,js,jsx}',
  'packages/ui/src/**/*.{ts,tsx,js,jsx}',
  'packages/core/src/**/*.{ts,tsx,js,jsx}',
  'packages/ai/src/**/*.{ts,tsx,js,jsx}',
  'server/src/**/*.{ts,tsx,js,jsx}'
];

export default {
  projects: [
    '<rootDir>/apps/web',
    '<rootDir>/apps/mobile',
    '<rootDir>/packages/ui',
    '<rootDir>/packages/core',
    '<rootDir>/packages/ai',
    '<rootDir>/server'
  ],
  collectCoverage: true,
  collectCoverageFrom: coverageGlobs.concat([
    '!**/*.d.ts',
    '!**/*.stories.*',
    '!**/__tests__/**',
    '!**/__mocks__/**',
    '!**/test-utils/**',
    '!**/jest.setup.*'
  ]),
  coverageDirectory: join(__dirname, 'coverage/global'),
  coverageReporters: ['text', 'lcov', 'html', 'json-summary'],
  coverageThreshold: {
    global: {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90
    }
  },
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/build/',
    '/coverage/',
    '/.next/',
    '/.expo/'
  ],
  moduleNameMapper: {
    '^@pawfectmatch/ui$': '<rootDir>/packages/ui/src/index.ts',
    '^@pawfectmatch/ui/(.*)$': '<rootDir>/packages/ui/src/$1',
    '^@pawfectmatch/core$': '<rootDir>/packages/core/src/index.ts',
    '^@pawfectmatch/core/(.*)$': '<rootDir>/packages/core/src/$1',
    '^@pawfectmatch/ai/(.*)$': '<rootDir>/packages/ai/src/$1',
    '^@/(.*)$': '<rootDir>/apps/web/src/$1'
  },
  transformIgnorePatterns: [
    '/node_modules/(?!(react-native|@react-native|react-native-.*|@react-navigation|@expo|expo-.*|lucide-react|framer-motion|recharts|date-fns|bson|mongodb|@react-aria|@react-stately|@react-types|@react-spectrum)/)'
  ]
};

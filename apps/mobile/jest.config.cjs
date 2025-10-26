const baseConfig = require('../../jest.config.base');

module.exports = {
  ...baseConfig,
  // Mobile-specific overrides
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.(test|spec).(ts|tsx|js|jsx)',
  ],
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': ['babel-jest', { configFile: './babel.config.cjs' }],
  },
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|@react-navigation|expo|@expo|react-native-reanimated|react-native-gesture-handler)/)',
  ],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx,js,jsx}',
    '!src/**/__tests__/**',
    '!src/**/__mocks__/**',
    '!src/setupTests.ts',
  ],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  moduleNameMapper: {
    ...baseConfig.moduleNameMapper,
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@pawfectmatch/(.*)$': '<rootDir>/../../packages/$1/src/index.ts',
    '^@pawfectmatch/core': '<rootDir>/../../packages/core/src/index.ts',
    '^@pawfectmatch/core/(.*)$': '<rootDir>/../../packages/core/src/$1',
    '^@pawfectmatch/ui': '<rootDir>/../../packages/ui/src/index.ts',
    '^@pawfectmatch/ui/(.*)$': '<rootDir>/../../packages/ui/$1',
    '^@pawfectmatch/design-tokens': '<rootDir>/../../packages/design-tokens/src/index.ts',
    '^@pawfectmatch/design-tokens/(.*)$': '<rootDir>/../../packages/design-tokens/src/$1',
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$': '<rootDir>/src/__mocks__/fileMock.js',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
  },
  globals: {
    __DEV__: true,
  },
};

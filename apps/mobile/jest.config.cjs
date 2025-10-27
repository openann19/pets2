/** @type {import('jest').Config} */
const config = {
  // Multi-tier test projects: services, ui, integration, contract, performance
  projects: [
    {
      displayName: 'services',
      preset: 'jest-expo',
      testEnvironment: 'node',
      testMatch: [
        '<rootDir>/src/services/**/*.test.ts?(x)',
        '<rootDir>/src/services/**/__tests__/*.test.ts?(x)',
      ],
      transform: { '^.+\\.[tj]sx?$': 'babel-jest' },
      transformIgnorePatterns: [
        'node_modules/(?!(@react-native|react-native|@react-navigation|expo(nent)?|expo-.*|@expo/.*|expo-modules-core|react-native-reanimated)/)'
      ],
      moduleNameMapper: {
        '^react-native-reanimated$': 'react-native-reanimated/mock',
        '^expo-image-picker$': '<rootDir>/__mocks__/expo-image-picker.ts',
        '^expo-file-system$': '<rootDir>/__mocks__/expo-file-system.ts',
        '^@/services/logger$': '<rootDir>/__mocks__/logger.ts',
        '^@mobile/services/logger$': '<rootDir>/__mocks__/logger.ts',
        '^./logger$': '<rootDir>/__mocks__/logger.ts',
        '^../logger$': '<rootDir>/__mocks__/logger.ts'
      },
      moduleDirectories: ['node_modules', '<rootDir>/../../node_modules'],
      setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
      cacheDirectory: '<rootDir>/.jest-cache/services',
      collectCoverageFrom: [
        'src/services/**/*.ts',
        '!src/services/**/*.test.ts',
        '!src/services/**/*.spec.ts',
      ],
      coverageThreshold: {
        global: {
          lines: 90,
          branches: 90,
          functions: 90,
          statements: 90,
        },
      },
      testPathIgnorePatterns: ['/e2e/', '/android/', '/ios/', '/dist/', '/build/']
    },
    {
      displayName: 'ui',
      preset: 'jest-expo',
      testEnvironment: 'jsdom',
      testMatch: [
        '<rootDir>/src/components/**/*.test.ts?(x)',
        '<rootDir>/src/screens/**/*.test.ts?(x)',
        '<rootDir>/src/hooks/**/*.test.ts?(x)',
      ],
      transform: { '^.+\\.[tj]sx?$': 'babel-jest' },
      transformIgnorePatterns: [
        'node_modules/(?!(@react-native|react-native|@react-navigation|expo(nent)?|expo-.*|@expo/.*|expo-modules-core|react-native-reanimated)/)'
      ],
      moduleNameMapper: {
        '^react-native-reanimated$': 'react-native-reanimated/mock'
      },
      moduleDirectories: ['node_modules', '<rootDir>/../../node_modules'],
      setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
      cacheDirectory: '<rootDir>/.jest-cache/ui',
      collectCoverageFrom: [
        'src/components/**/*.tsx',
        'src/screens/**/*.tsx',
        'src/hooks/**/*.ts',
        '!src/components/**/*.test.tsx',
        '!src/screens/**/*.test.tsx',
        '!src/hooks/**/*.test.ts',
      ],
      coverageThreshold: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80,
        },
      },
      testPathIgnorePatterns: ['/e2e/', '/android/', '/ios/', '/dist/', '/build/']
    },
    {
      displayName: 'integration',
      preset: 'jest-expo',
      testEnvironment: 'jsdom',
      testMatch: [
        '<rootDir>/src/**/integration/**/*.test.ts?(x)',
        '<rootDir>/src/__tests__/integration.test.tsx',
        '<rootDir>/src/**/*.integration.test.ts?(x)',
      ],
      transform: { '^.+\\.[tj]sx?$': 'babel-jest' },
      transformIgnorePatterns: [
        'node_modules/(?!(@react-native|react-native|@react-navigation|expo(nent)?|expo-.*|@expo/.*|expo-modules-core|react-native-reanimated)/)'
      ],
      moduleNameMapper: {
        '^react-native-reanimated$': 'react-native-reanimated/mock',
        '\\.svg$': '<rootDir>/__mocks__/fileMock.js',
      },
      moduleDirectories: ['node_modules', '<rootDir>/../../node_modules'],
      setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
      cacheDirectory: '<rootDir>/.jest-cache/integration',
      testPathIgnorePatterns: ['/e2e/', '/android/', '/ios/', '/dist/', '/build/']
    },
    {
      displayName: 'performance',
      preset: 'jest-expo',
      testEnvironment: 'jsdom',
      testMatch: [
        '<rootDir>/src/**/performance/**/*.test.ts?(x)',
        '<rootDir>/src/__tests__/performance.test.tsx',
        '<rootDir>/src/**/*.performance.test.ts?(x)',
      ],
      transform: { '^.+\\.[tj]sx?$': 'babel-jest' },
      transformIgnorePatterns: [
        'node_modules/(?!(@react-native|react-native|@react-navigation|expo(nent)?|expo-.*|@expo/.*|expo-modules-core|react-native-reanimated)/)'
      ],
      moduleNameMapper: {
        '^react-native-reanimated$': 'react-native-reanimated/mock'
      },
      moduleDirectories: ['node_modules', '<rootDir>/../../node_modules'],
      setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
      cacheDirectory: '<rootDir>/.jest-cache/performance',
      testPathIgnorePatterns: ['/e2e/', '/android/', '/ios/', '/dist/', '/build/']
    },
    {
      displayName: 'contract',
      preset: 'jest-expo',
      testEnvironment: 'node',
      testMatch: [
        '<rootDir>/tests/contract/**/*.test.ts',
        '<rootDir>/src/**/*.contract.test.ts?(x)',
      ],
      transform: { '^.+\\.[tj]sx?$': 'babel-jest' },
      moduleDirectories: ['node_modules', '<rootDir>/../../node_modules'],
      setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
      cacheDirectory: '<rootDir>/.jest-cache/contract',
      testPathIgnorePatterns: ['/e2e/', '/android/', '/ios/', '/dist/', '/build/']
    },
    {
      displayName: 'a11y',
      preset: 'jest-expo',
      testEnvironment: 'jsdom',
      testMatch: [
        '<rootDir>/src/**/a11y/**/*.test.ts?(x)',
        '<rootDir>/src/__tests__/a11y/**/*.test.ts?(x)',
        '<rootDir>/src/**/*.a11y.test.ts?(x)',
      ],
      transform: { '^.+\\.[tj]sx?$': 'babel-jest' },
      transformIgnorePatterns: [
        'node_modules/(?!(@react-native|react-native|@react-navigation|expo(nent)?|expo-.*|@expo/.*|expo-modules-core|react-native-reanimated)/)'
      ],
      moduleNameMapper: {
        '^react-native-reanimated$': 'react-native-reanimated/mock'
      },
      moduleDirectories: ['node_modules', '<rootDir>/../../node_modules'],
      setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
      cacheDirectory: '<rootDir>/.jest-cache/a11y',
      testPathIgnorePatterns: ['/e2e/', '/android/', '/ios/', '/dist/', '/build/']
    },
    {
      displayName: 'security',
      preset: 'jest-expo',
      testEnvironment: 'node',
      testMatch: [
        '<rootDir>/tests/security/**/*.test.ts',
        '<rootDir>/src/**/*.security.test.ts',
      ],
      transform: { '^.+\\.[tj]sx?$': 'babel-jest' },
      moduleDirectories: ['node_modules', '<rootDir>/../../node_modules'],
      setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
      cacheDirectory: '<rootDir>/.jest-cache/security',
      testPathIgnorePatterns: ['/e2e/', '/android/', '/ios/', '/dist/', '/build/']
    }
  ],
  verbose: true,
  reporters: [
    'default',
    ['jest-junit', { outputDirectory: './reports', outputName: 'jest-results.xml' }],
  ],
};

module.exports = config;

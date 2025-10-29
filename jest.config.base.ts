import type { Config } from 'jest';

const config: Config = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.core.ts'],
  transform: { '^.+\\.(t|j)sx?$': ['@swc/jest'] },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    '^react-native$': 'react-native',
  },
};

export default config;

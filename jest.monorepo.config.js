module.exports = {
  projects: [
    {
      displayName: 'ui-package',
      testEnvironment: 'jsdom',
      rootDir: 'packages/ui',
      testMatch: [
        '**/__tests__/**/*.test.(ts|tsx)',
        '**/*.(test|spec).(ts|tsx)'
      ],
      setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
      moduleNameMapper: {
        '^@pawfectmatch/core$': '<rootDir>/../core/src/index.ts',
        '^@pawfectmatch/core/(.*)$': '<rootDir>/../core/src/$1',
        '^@pawfectmatch/ui$': '<rootDir>/src/index.ts',
        '^@pawfectmatch/ui/(.*)$': '<rootDir>/src/$1'
      },
      collectCoverageFrom: [
        'src/**/*.{ts,tsx}',
        '!src/**/*.d.ts',
        '!src/**/index.ts',
        '!src/**/*.stories.{ts,tsx}',
        '!src/**/types/**'
      ],
      coverageDirectory: 'coverage',
      coverageReporters: ['lcov', 'text', 'html'],
      coverageThreshold: {
        global: {
          branches: 85,
          functions: 85,
          lines: 85,
          statements: 85
        }
      }
    },
    {
      displayName: 'core-package',
      testEnvironment: 'node',
      rootDir: 'packages/core',
      testMatch: [
        '**/__tests__/**/*.test.(ts|tsx)',
        '**/*.(test|spec).(ts|tsx)'
      ],
      moduleNameMapper: {
        '^@pawfectmatch/core$': '<rootDir>/src/index.ts',
        '^@pawfectmatch/core/(.*)$': '<rootDir>/src/$1'
      },
      collectCoverageFrom: [
        'src/**/*.{ts,tsx}',
        '!src/**/*.d.ts',
        '!src/**/index.ts',
        '!src/**/types/**'
      ],
      coverageDirectory: 'coverage',
      coverageThreshold: {
        global: {
          branches: 85,
          functions: 85,
          lines: 85,
          statements: 85
        }
      }
    },
    {
      displayName: 'web-app',
      testEnvironment: 'jsdom',
      rootDir: 'apps/web',
      testMatch: [
        '**/__tests__/**/*.test.(ts|tsx)',
        '**/*.(test|spec).(ts|tsx)'
      ],
      setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
      moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/$1',
        '^@pawfectmatch/ui$': '<rootDir>/../../packages/ui/src/index.ts',
        '^@pawfectmatch/ui/(.*)$': '<rootDir>/../../packages/ui/src/$1',
        '^@pawfectmatch/core$': '<rootDir>/../../packages/core/src/index.ts',
        '^@pawfectmatch/core/(.*)$': '<rootDir>/../../packages/core/src/$1'
      },
      coverageDirectory: 'coverage',
      collectCoverageFrom: [
        'src/**/*.{ts,tsx,js,jsx}',
        '!**/__tests__/**',
        '!**/*.d.ts',
        '!**/*.stories.*',
        '!**/test-utils/**'
      ],
      coverageThreshold: {
        global: {
          branches: 85,
          functions: 85,
          lines: 85,
          statements: 85
        }
      }
    },
    {
      displayName: 'mobile-app',
      testEnvironment: 'node',
      rootDir: 'apps/mobile',
      testMatch: [
        '**/__tests__/**/*.test.(ts|tsx)',
        '**/*.(test|spec).(ts|tsx)'
      ],
      preset: 'jest-expo',
      moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/$1',
        '^@pawfectmatch/core$': '<rootDir>/../../packages/core/src',
        '^@pawfectmatch/core/(.*)$': '<rootDir>/../../packages/core/src/$1'
      },
      coverageDirectory: 'coverage',
      collectCoverageFrom: [
        'src/**/*.{ts,tsx,js,jsx}',
        '!src/**/*.d.ts',
        '!src/**/__tests__/**',
        '!src/**/*.stories.{ts,tsx}',
        '!src/test-utils/**'
      ],
      coverageThreshold: {
        global: {
          branches: 85,
          functions: 85,
          lines: 85,
          statements: 85
        }
      }
    }
  ]
};

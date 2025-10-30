import js from '@eslint/js';
import typescriptPlugin from '@typescript-eslint/eslint-plugin';
import typescriptParser from '@typescript-eslint/parser';
import nextPlugin from '@next/eslint-plugin-next';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import globals from 'globals';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Helper to get the root directory, ensuring it works in ESM
const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * PawfectMatch - Production-Grade "Strict" ESLint Configuration (2025)
 * This is the single source of truth for the entire monorepo.
 */
export default [
  // 1. Global Ignores
  {
    ignores: [
      '**/node_modules/**',
      '**/.next/**',
      '**/dist/**',
      '**/build/**',
      '**/coverage/**',
      '**/*.config.js', // Ignores this file itself and other root configs
      '**/*.config.cjs',
      '**/.expo/**',
      '**/ios/**',
      '**/android/**',
      '**/.turbo/**',
    ],
  },

  // 2. Base Recommended JavaScript Rules
  js.configs.recommended,

  // 3. Global TypeScript Configuration (Base settings for all .ts/.tsx files)
  // NOTE: This section is intentionally NOT type-aware to prevent hanging.
  {
    files: ['**/*.{ts,tsx}'],
    plugins: {
      '@typescript-eslint': typescriptPlugin,
      'react': reactPlugin,
      'react-hooks': reactHooksPlugin,
    },
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: { jsx: true },
      },
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    rules: {
      // Basic recommended rules that do NOT require type information
      ...typescriptPlugin.configs.recommended.rules,
      ...reactPlugin.configs.recommended.rules,
      ...reactPlugin.configs['jsx-runtime'].rules,
      ...reactHooksPlugin.configs.recommended.rules,

      // Zero-Tolerance rules that do NOT require type information
      '@typescript-eslint/no-explicit-any': 'error',
      'react-hooks/exhaustive-deps': 'error',
      'no-console': ['error', { allow: ['warn', 'error'] }],
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      'react/prop-types': 'off', // Not needed with TypeScript
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
  },

  // 4. STRICT, TYPE-AWARE WORKSPACE OVERRIDES (CRITICAL SECTION)
  // Each workspace gets its own type-aware configuration block.

  // --- Workspace: apps/web ---
  {
    files: ['apps/web/**/*.{ts,tsx}'],
    plugins: {
      '@next/next': nextPlugin,
      '@typescript-eslint': typescriptPlugin,
      'react': reactPlugin,
      'react-hooks': reactHooksPlugin,
    },
    languageOptions: {
      parserOptions: {
        project: [path.join(__dirname, 'apps/web/tsconfig.json')],
        tsconfigRootDir: path.join(__dirname, 'apps/web'),
      },
    },
    rules: {
      ...typescriptPlugin.configs['strict-type-checked'].rules,
      ...nextPlugin.configs['core-web-vitals'].rules,
      // Kill explicit any first
      '@typescript-eslint/no-explicit-any': ['error', { ignoreRestArgs: false }],
      '@typescript-eslint/no-unsafe-assignment': 'error',
      '@typescript-eslint/no-unsafe-member-access': 'error',
      '@typescript-eslint/no-unsafe-call': 'error',
      '@typescript-eslint/consistent-type-assertions': [
        'error',
        { assertionStyle: 'as', objectLiteralTypeAssertions: 'never' }
      ],
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_' }
      ],
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
    },
    settings: { react: { version: 'detect' } },
  },

  // --- P0 Guardrails: apps/web/src strict override (PR-1) ---
  {
    files: ['apps/web/src/**/*.{ts,tsx}'],
    languageOptions: {
      parserOptions: {
        project: [path.join(__dirname, 'apps/web/tsconfig.json')],
        tsconfigRootDir: path.join(__dirname, 'apps/web'),
      },
    },
    rules: {
      '@typescript-eslint/no-explicit-any': ['error', { ignoreRestArgs: false }],
      '@typescript-eslint/no-unsafe-assignment': 'error',
      '@typescript-eslint/no-unsafe-member-access': 'error',
      '@typescript-eslint/no-unsafe-call': 'error',
      '@typescript-eslint/no-unsafe-argument': 'error',
      '@typescript-eslint/no-unsafe-return': 'error',
      '@typescript-eslint/consistent-type-assertions': [
        'error',
        { assertionStyle: 'as', objectLiteralTypeAssertions: 'never' }
      ],
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_' }
      ],
    },
  },

  // --- Workspace: apps/mobile ---
  {
    files: ['apps/mobile/src/**/*.{ts,tsx}'],
    plugins: {
        '@typescript-eslint': typescriptPlugin,
    },
    languageOptions: {
      parserOptions: {
        project: [path.join(__dirname, 'apps/mobile/tsconfig.json')],
        tsconfigRootDir: path.join(__dirname, 'apps/mobile'),
      },
      globals: {
        '__DEV__': 'readonly', // React Native global
      },
    },
    rules: {
      ...typescriptPlugin.configs['strict-type-checked'].rules,
      ...typescriptPlugin.configs.stylistic.rules,
      'react-hooks/exhaustive-deps': 'error',
      'no-console': ['error', { allow: ['warn', 'error'] }],
    },
  },

  // --- Workspace: packages/core ---
  {
    files: ['packages/core/src/**/*.{ts,tsx}'],
    plugins: {
        '@typescript-eslint': typescriptPlugin,
    },
    languageOptions: {
      parserOptions: {
        project: [path.join(__dirname, 'packages/core/tsconfig.json')],
        tsconfigRootDir: path.join(__dirname, 'packages/core'),
      },
    },
    rules: {
      ...typescriptPlugin.configs['strict-type-checked'].rules,
    },
  },

  // --- Workspace: packages/ui ---
  {
    files: ['packages/ui/src/**/*.{ts,tsx}'],
    plugins: {
        '@typescript-eslint': typescriptPlugin,
        'react': reactPlugin,
        'react-hooks': reactHooksPlugin,
    },
    languageOptions: {
      parserOptions: {
        project: [path.join(__dirname, 'packages/ui/tsconfig.json')],
        tsconfigRootDir: path.join(__dirname, 'packages/ui'),
      },
    },
    rules: {
      ...typescriptPlugin.configs['strict-type-checked'].rules,
      ...reactPlugin.configs.recommended.rules,
      ...reactPlugin.configs['jsx-runtime'].rules,
      ...reactHooksPlugin.configs.recommended.rules,
    },
    settings: {
      react: { version: 'detect' },
    },
  },

  // --- Workspace: packages/design-tokens ---
  {
    files: ['packages/design-tokens/src/**/*.{ts,tsx}'],
    plugins: {
        '@typescript-eslint': typescriptPlugin,
    },
    languageOptions: {
      parserOptions: {
        project: [path.join(__dirname, 'packages/design-tokens/tsconfig.json')],
        tsconfigRootDir: path.join(__dirname, 'packages/design-tokens'),
      },
    },
    rules: {
      ...typescriptPlugin.configs['strict-type-checked'].rules,
    },
  },

  // --- Workspace: packages/ai ---
  {
    files: ['packages/ai/src/**/*.{ts,tsx}'],
    plugins: {
        '@typescript-eslint': typescriptPlugin,
    },
    languageOptions: {
      parserOptions: {
        project: [path.join(__dirname, 'packages/ai/tsconfig.json')],
        tsconfigRootDir: path.join(__dirname, 'packages/ai'),
      },
    },
    rules: {
      ...typescriptPlugin.configs['strict-type-checked'].rules,
    },
  },

  // --- Workspace: server ---
  {
    files: ['server/src/**/*.{ts,tsx}', 'server/**/*.ts'],
    plugins: {
        '@typescript-eslint': typescriptPlugin,
    },
    languageOptions: {
      parserOptions: {
        project: [path.join(__dirname, 'server/tsconfig.json')],
        tsconfigRootDir: path.join(__dirname, 'server'),
      },
      globals: {
        ...globals.node,
      },
    },
    rules: {
      ...typescriptPlugin.configs['strict-type-checked'].rules,
      'no-console': 'off', // Allow console in server code (will replace with logger in Phase 1)
    },
  },

  // --- Workspace: apps/mobile Test Files (use tsconfig.eslint.json) ---
  {
    files: ['apps/mobile/**/*.test.{ts,tsx}', 'apps/mobile/**/__tests__/**/*.{ts,tsx}', 'apps/mobile/**/*.spec.{ts,tsx}', 'apps/mobile/**/__mocks__/**/*.{ts,tsx}', 'apps/mobile/src/setupTests.ts'],
    languageOptions: {
      parserOptions: {
        project: [path.join(__dirname, 'apps/mobile/tsconfig.eslint.json')],
        tsconfigRootDir: path.join(__dirname, 'apps/mobile'),
      },
      globals: {
        ...globals.jest,
        '__DEV__': 'readonly', // React Native global
      },
    },
    rules: {
      ...typescriptPlugin.configs['strict-type-checked'].rules,
      ...typescriptPlugin.configs.stylistic.rules,
      // Test-specific relaxations (warn instead of error)
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unsafe-assignment': 'warn',
      '@typescript-eslint/no-unsafe-call': 'warn',
      '@typescript-eslint/no-unsafe-member-access': 'warn',
      '@typescript-eslint/no-unsafe-argument': 'warn',
      '@typescript-eslint/no-unsafe-return': 'warn',
      '@typescript-eslint/no-non-null-assertion': 'warn',
    },
  },

// --- Workspace: server ---
{
  files: ['server/src/**/*.{ts,tsx}', 'server/**/*.ts'],
  plugins: {
      '@typescript-eslint': typescriptPlugin,
  },
  languageOptions: {
    parserOptions: {
      project: [path.join(__dirname, 'server/tsconfig.json')],
      tsconfigRootDir: path.join(__dirname, 'server'),
    },
    globals: {
      ...globals.node,
    },
  },
  rules: {
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/prefer-const': 'error',
    '@typescript-eslint/no-unused-vars': ['error', {
      argsIgnorePattern: '^_',
      varsIgnorePattern: '^_',
      caughtErrorsIgnorePattern: '^_',
    }],
    'react-hooks/exhaustive-deps': 'error',
    'no-console': 'off', // Allow console in server code (will replace with logger in Phase 1)
  },
},

// --- Workspace: apps/mobile Test Files (use tsconfig.eslint.json) ---
{
  files: ['apps/mobile/**/*.test.{ts,tsx}', 'apps/mobile/**/__tests__/**/*.{ts,tsx}', 'apps/mobile/**/*.spec.{ts,tsx}', 'apps/mobile/**/__mocks__/**/*.{ts,tsx}', 'apps/mobile/src/setupTests.ts'],
  languageOptions: {
    parserOptions: {
      project: [path.join(__dirname, 'apps/mobile/tsconfig.eslint.json')],
      tsconfigRootDir: path.join(__dirname, 'apps/mobile'),
    },
    globals: {
      ...globals.jest,
      '__DEV__': 'readonly', // React Native global
      'rest': 'readonly', // For MSW
    },
  },
  rules: {
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-unsafe-assignment': 'off',
    '@typescript-eslint/no-unsafe-call': 'off',
    '@typescript-eslint/no-unsafe-member-access': 'off',
    '@typescript-eslint/no-unsafe-argument': 'off',
    '@typescript-eslint/no-unsafe-return': 'off',
    '@typescript-eslint/no-non-null-assertion': 'off',
  },
},  // Added missing comma
  
// 5. Global Test Files Overrides
{
  files: ['**/*.test.{ts,tsx}', '**/__tests__/**/*.{ts,tsx}', '**/*.spec.{ts,tsx}'],
  languageOptions: {
    globals: {
      ...globals.jest,
      'rest': 'readonly', // For MSW
    },
    rules: {
      ...typescriptPlugin.configs['strict-type-checked'].rules,
      ...typescriptPlugin.configs.stylistic.rules,
      // Test-specific relaxations
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unsafe-assignment': 'warn',
      '@typescript-eslint/no-unsafe-call': 'warn',
      '@typescript-eslint/no-unsafe-member-access': 'warn',
      '@typescript-eslint/no-unsafe-argument': 'warn',
      '@typescript-eslint/no-unsafe-return': 'warn',
      '@typescript-eslint/no-non-null-assertion': 'warn',
    },
  },
},

// 6. Package-Specific Test Overrides (for special tsconfigs)
{
  files: ['packages/core/**/__tests__/**/*.ts', 'packages/core/**/*.test.ts'],
  languageOptions: {
    parserOptions: {
      project: [path.join(__dirname, 'packages/core/tsconfig.test.json')],
      tsconfigRootDir: path.join(__dirname, 'packages/core'),
    },
  },
  rules: {
    // Relax rules for test files
    'no-console': 'off',
    '@typescript-eslint/no-unused-vars': 'off',
  },
},

  // 7. Detox E2E Test Configuration
  {
    files: ['apps/mobile/e2e/**/*.e2e.js', 'apps/mobile/e2e/**/*.test.js'],
    languageOptions: {
      globals: {
        ...globals.node,
        device: 'readonly',
        element: 'readonly',
        by: 'readonly',
        expect: 'readonly',
        waitFor: 'readonly',
        describe: 'readonly',
        it: 'readonly',
        beforeAll: 'readonly',
        beforeEach: 'readonly',
        afterAll: 'readonly',
        afterEach: 'readonly',
      },
    },
    rules: {
      // Relax rules for e2e test files
      'no-console': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
    },
  },
];


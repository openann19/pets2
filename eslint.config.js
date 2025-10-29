import js from '@eslint/js';
import typescriptPlugin from '@typescript-eslint/eslint-plugin';
import typescriptParser from '@typescript-eslint/parser';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import globals from 'globals';
import noThemeNamespace from './apps/mobile/eslint-local-rules/no-theme-namespace.js';
import noHardcodedColors from './eslint-local-rules/no-hardcoded-colors.js';

export default [
  // Global ignores
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/build/**',
      '**/coverage/**',
      '**/ios/**',
      '**/android/**',
      '**/.expo/**',
    ],
  },

  // Base JavaScript rules
  js.configs.recommended,

  // Global TypeScript configuration (non-type-aware)
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
      ...typescriptPlugin.configs.recommended.rules,
      ...reactPlugin.configs.recommended.rules,
      ...reactPlugin.configs['jsx-runtime'].rules,
      ...reactHooksPlugin.configs.recommended.rules,

      // Zero-tolerance rules
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      'react-hooks/exhaustive-deps': 'error',
      'no-console': ['error', { allow: ['warn', 'error'] }],
      'react/prop-types': 'off',
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
  },

  // Mobile-specific configuration - Relax strict rules for React Native
  {
    files: ['apps/mobile/src/**/*.{ts,tsx}'],
    plugins: {
      'local': {
        rules: {
          'no-theme-namespace': noThemeNamespace,
          'no-hardcoded-colors': noHardcodedColors,
        },
      },
    },
    languageOptions: {
      globals: {
        '__DEV__': 'readonly',
      },
    },
    rules: {
      'local/no-theme-namespace': 'error',
      'local/no-hardcoded-colors': 'error',
      // React Native has many legitimate uses of any due to third-party libraries
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/no-unused-vars': 'warn', // Warn instead of error
      'no-console': 'off', // Console is useful in mobile development
      'react/no-unknown-property': 'off', // React Native has different props than web React
      'react/react-in-jsx-scope': 'off', // Not needed in React Native
    },
  },

  // Test files configuration
  {
    files: ['**/*.test.{ts,tsx}', '**/__tests__/**/*.{ts,tsx}', '**/*.spec.{ts,tsx}', '**/__mocks__/**/*.{ts,tsx,js}'],
    languageOptions: {
      globals: {
        ...globals.jest,
        jest: 'readonly',
      },
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      'no-console': 'off',
      'no-undef': 'off', // Jest globals are defined
    },
  },
];

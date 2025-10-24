import js from '@eslint/js';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import react from 'eslint-plugin-react';
import hooks from 'eslint-plugin-react-hooks';
import next from '@next/eslint-plugin-next';
import globals from 'globals';

const PHASE2 = process.env.ESLINT_STRICT === '1';

export default [
  // 0) Global ignores
  {
    ignores: [
      '**/node_modules/**',
      '**/.next/**',
      '**/dist/**',
      '**/build/**',
      '**/coverage/**',
      'cypress/**',
      '**/*.d.ts',
      '**/*.map',
      '**/*.config.js',
      '**/public/**'
    ]
  },

  // 1) JS baseline (rare in app, but safe to keep)
  js.configs.recommended,

  // 2) TS/TSX app code — type-aware
  {
    files: ['src/**/*.{ts,tsx}'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: './tsconfig.json'
      },
      globals: {
        ...globals.browser,
        ...globals.node,
        React: 'readonly',
        JSX: 'readonly'
      }
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
      react,
      'react-hooks': hooks,
      '@next/next': next
    },
    settings: { react: { version: 'detect' } },
    rules: {
      // React/Next hooks correctness
      ...react.configs.recommended.rules,
      ...react.configs['jsx-runtime'].rules,
      ...hooks.configs.recommended.rules,
      ...next.configs['core-web-vitals'].rules,

      // Core correctness & async safety
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/no-misused-promises': ['error', { checksVoidReturn: { attributes: false } }],
      'no-async-promise-executor': 'error',

      // Hygiene
      'no-console': ['error', { allow: ['warn', 'error'] }],
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrors: 'all', caughtErrorsIgnorePattern: '^_' }],
      'no-undef': 'off', // TypeScript handles this better

      // Ban type suppressions (Type Supremacy + Resilience)
      '@typescript-eslint/ban-ts-comment': ['error', {
        'ts-expect-error': 'allow-with-description',
        'ts-ignore': true,
        'ts-nocheck': true,
        'ts-check': false,
        minimumDescriptionLength: 10
      }],

      // Helpful, but not overwhelming in Phase 1
      '@typescript-eslint/consistent-type-assertions': 'off',
      '@typescript-eslint/no-unnecessary-condition': 'off',
      '@typescript-eslint/require-await': 'off',
      '@typescript-eslint/no-floating-promises': 'warn',

      // Phase 2 hardening (opt-in via ESLINT_STRICT=1)
      ...(PHASE2
        ? {
            '@typescript-eslint/no-unsafe-assignment': 'error',
            '@typescript-eslint/no-unsafe-member-access': 'error',
            '@typescript-eslint/no-unsafe-call': 'error',
            '@typescript-eslint/no-unsafe-argument': 'error',
            '@typescript-eslint/no-unsafe-return': 'error',
            '@typescript-eslint/no-explicit-any': ['error', { ignoreRestArgs: false }]
          }
        : {
            '@typescript-eslint/no-unsafe-assignment': 'off',
            '@typescript-eslint/no-unsafe-member-access': 'off',
            '@typescript-eslint/no-unsafe-call': 'off',
            '@typescript-eslint/no-unsafe-argument': 'off',
            '@typescript-eslint/no-unsafe-return': 'off',
            '@typescript-eslint/no-explicit-any': ['warn', { ignoreRestArgs: true }]
          })
    }
  },

  // 3) Tests, stories, scripts — relaxed, still safe
  {
    files: [
      '**/*.{test,spec}.{ts,tsx,js,jsx}',
      '**/*.stories.{ts,tsx,js,jsx}',
      'scripts/**/*.{ts,tsx,js,jsx}',
      '**/__mocks__/**/*.{ts,tsx,js,jsx}',
      '**/*.d.ts'
    ],
    languageOptions: {
      parser: tsParser,
      parserOptions: { project: null },
      globals: { ...globals.browser, ...globals.node, ...globals.jest, jest: 'readonly' }
    },
    plugins: { '@typescript-eslint': tsPlugin, react, 'react-hooks': hooks },
    rules: {
      ...react.configs.recommended.rules,
      ...react.configs['jsx-runtime'].rules,
      ...hooks.configs.recommended.rules,
      'no-console': ['error', { allow: ['warn', 'error', 'log'] }],
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      '@typescript-eslint/no-floating-promises': 'off',
      '@typescript-eslint/no-misused-promises': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/no-unnecessary-condition': 'off'
    }
  },

  // 4) Logger files — console.* allowed (logging service exception)
  {
    files: ['**/logger.{ts,js}', '**/services/logger.{ts,js}'],
    rules: {
      'no-console': 'off'
    }
  }
];
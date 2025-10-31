'use strict';

module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
    project: ['./tsconfig.eslint.json'],
    tsconfigRootDir: __dirname,
    createDefaultProgram: false,
  },
  plugins: ['@typescript-eslint', 'local', 'react', 'react-hooks', 'jsx-a11y'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/recommended-requiring-type-checking',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:jsx-a11y/recommended',
    'prettier',
  ],
  env: {
    node: true,
    jest: true,
    es6: true,
  },
  overrides: [
    {
      files: ['**/__mocks__/**/*.js', '**/__mocks__/**/*.mjs', '**/*.mock.js', '**/*.mock.mjs', '**/__tests__/**/*.ts', '**/__tests__/**/*.tsx', '**/*.test.ts', '**/*.test.tsx'],
      env: {
        node: true,
        jest: true,
      },
      globals: {
        module: 'readonly',
        jest: 'readonly',
        expect: 'readonly',
        describe: 'readonly',
        it: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly',
      },
      rules: {
        'no-undef': 'off',
        '@typescript-eslint/no-require-imports': 'off',
      },
    },
  ],
  rules: {
    // Re-enabled strict TypeScript rules for systematic fixing
    '@typescript-eslint/no-unsafe-assignment': 'error',
    '@typescript-eslint/no-unsafe-member-access': 'error', 
    '@typescript-eslint/no-unsafe-call': 'error',
    '@typescript-eslint/no-unsafe-return': 'error',
    '@typescript-eslint/no-unsafe-argument': 'error',
    '@typescript-eslint/no-explicit-any': 'error',
    
    'local/no-hardcoded-colors': 'error',
    'local/no-theme-imports': 'error',
    'no-restricted-syntax': [
      'error',
      {
        selector: "Literal[value=/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/]",
        message: 'Use theme tokens, not raw hex.',
      },
    ],
    'no-restricted-properties': [
      'error',
      {
        object: 'StyleSheet',
        property: 'create',
        message: 'Prefer theme tokens; avoid hardcoded whites.',
      },
    ],
  },
};

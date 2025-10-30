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
    tsconfigRootDir: __dirname,
  },
  plugins: ['@typescript-eslint', 'local', 'react', 'react-hooks', 'jsx-a11y'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:jsx-a11y/recommended',
    'prettier',
  ],
  overrides: [
    // Type-aware rules for TypeScript files (excluding .d.ts and specific paths)
    {
      files: [
        'apps/mobile/src/**/*.{ts,tsx}',
        '!apps/mobile/src/**/*.d.ts',
        '!apps/mobile/src/**/*.stories.{ts,tsx}',
      ],
      extends: ['plugin:@typescript-eslint/recommended-requiring-type-checking'],
      parserOptions: {
        project: ['./apps/mobile/tsconfig.eslint.json'],
        tsconfigRootDir: __dirname,
        createDefaultProgram: false, // Use project config instead
      },
    },
    // Mobile-specific rules (excluding certain directories from color checks)
    {
      files: [
        'apps/mobile/src/**/*.{ts,tsx}',
        '!apps/mobile/src/**/theme/**/*.{ts,tsx}',
        '!apps/mobile/src/**/constants/**/*.{ts,tsx}',
        '!apps/mobile/src/**/styles/**/*.{ts,tsx}',
        '!apps/mobile/src/**/types/**/*.{ts,tsx}',
      ],
      rules: {
        'local/no-hardcoded-colors': 'error',
      },
    },
  ],
};

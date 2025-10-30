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
  rules: {
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

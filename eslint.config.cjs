const js = require('@eslint/js');
const typescriptPlugin = require('@typescript-eslint/eslint-plugin');
const typescriptParser = require('@typescript-eslint/parser');
const nextPlugin = require('@next/eslint-plugin-next');
const reactPlugin = require('eslint-plugin-react');
const reactHooksPlugin = require('eslint-plugin-react-hooks');
const globals = require('globals');

module.exports = [
  // 1. Global Ignores
  {
    ignores: [
      'node_modules/**',
      '.next/**',
      'dist/**',
      'build/**',
      'coverage/**',
      '*.config.js',
      '*.config.ts',
      '.expo/**',
      'ios/**',
      'android/**',
    ],
  },

  // 2. Base Recommended Rules
  js.configs.recommended,

  // 3. TypeScript Configuration
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: { jsx: true },
        project: ['./tsconfig.json', './apps/*/tsconfig.json', './packages/*/tsconfig.json'],
      },
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    plugins: {
      '@typescript-eslint': typescriptPlugin,
      'react': reactPlugin,
      'react-hooks': reactHooksPlugin,
      '@next/next': nextPlugin,
    },
    rules: {
      // --- Start with the strictest recommended rule sets ---
      ...(typescriptPlugin.configs['strict-type-checked']?.rules || {}),
      ...(reactPlugin.configs.recommended?.rules || {}),
      ...(reactPlugin.configs['jsx-runtime']?.rules || {}),
      ...(reactHooksPlugin.configs.recommended?.rules || {}),
      ...(nextPlugin.configs['core-web-vitals']?.rules || {}),

      // --- Customize and enforce ZERO-TOLERANCE rules ---
      
      // Prevent 'any' and unsafe operations (ERROR level)
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unsafe-assignment': 'error',
      '@typescript-eslint/no-unsafe-call': 'error',
      '@typescript-eslint/no-unsafe-member-access': 'error',
      '@typescript-eslint/no-unsafe-argument': 'error',
      '@typescript-eslint/no-unsafe-return': 'error',

      // Enforce promise handling (ERROR level)
      '@typescript-eslint/no-floating-promises': 'error',
      
      // Enforce strict boolean checks
      '@typescript-eslint/strict-boolean-expressions': [
        'error',
        {
          allowString: false,
          allowNumber: false,
          allowNullableObject: false,
        },
      ],

      // Enforce React Hooks best practices (ERROR level)
      'react-hooks/exhaustive-deps': 'error',

      // Disallow console logs in production code (ERROR level)
      'no-console': ['error', { allow: ['warn', 'error'] }],

      // Enforce unused variables are an ERROR, allowing underscore prefix
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      
      // Allow for type inference
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',

      // Disable rules that are stylistic or handled by Prettier
      'arrow-body-style': 'off',
      'react/prop-types': 'off', // Not needed with TypeScript

      // Prevent deprecated imports (Mobile Consistency Remediation)
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['**/contexts/ThemeContext*'],
              message: 'Use theme/Provider instead',
            },
            {
              group: ['**/theme/UnifiedThemeProvider*'],
              message: 'Use theme/Provider instead',
            },
            {
              group: ['**/theme/ThemeProvider*'],
              message: 'Use theme/Provider instead',
            },
            {
              group: ['**/constants/design-tokens*'],
              message: 'Use @pawfectmatch/design-tokens instead',
            },
            {
              group: ['**/styles/EnhancedDesignTokens*'],
              message: 'Use theme/Provider wrapper instead',
            },
            {
              group: ['**/hooks/animations/**', '**/styles/GlobalStyles*'],
              message: 'Use animation/index.ts instead',
            },
            {
              group: ['**/components/index.tsx', '**/components/NewComponents*', '**/components/EliteComponents*'],
              message: 'Import from components/index instead',
            },
          ],
        },
      ],

      // Enforce Theme tokens only (UI & Motion Contract)
      'no-restricted-syntax': [
        'error',
        {
          selector: 'Literal[value=/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/]',
          message: 'Use Theme.colors.* tokens instead of hex colors',
        },
        {
          selector: 'Property[key.name="borderRadius"] > Literal[value=/^[0-9]+$/]',
          message: 'Use Theme.borderRadius.* instead of raw numbers',
        },
        {
          selector: 'Property[key.name="padding"] > Literal[value=/^[0-9]+$/]',
          message: 'Use Theme.spacing.* instead of raw numbers',
        },
        {
          selector: 'Property[key.name="margin"] > Literal[value=/^[0-9]+$/]',
          message: 'Use Theme.spacing.* instead of raw numbers',
        },
      ],
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
  },

  // 4. Test Files Overrides (more lenient for tests)
  {
    files: ['**/*.test.{js,jsx,ts,tsx}', '**/__tests__/**/*', '**/*.spec.{js,jsx,ts,tsx}'],
    languageOptions: {
      globals: {
        ...globals.jest,
      },
    },
    rules: {
      // It's common to use 'any' and non-null assertions in tests
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
    },
  },
];

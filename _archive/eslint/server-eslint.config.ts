import rootConfig from '../eslint.config.js';
// If the root config was exported as an ES module default export, use it
if (rootConfig && rootConfig.__esModule && rootConfig.default) {
  rootConfig = rootConfig.default;
}
import globals from 'globals';

const config = [
  // 1. Global Ignores
  {
    ignores: [
      'node_modules/**',
      'dist/**',
      'build/**',
      'coverage/**',
      '*.config.js',
      '*.config.cjs',
    ],
  },

  // 2. Base Recommended JavaScript Rules
  {
    files: ['**/*.{js,cjs,mjs}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'commonjs',
      globals: {
        ...globals.node,
      },
    },
    rules: {
      // Allow console in server code for now; we'll replace with structured logger in follow-up
      'no-console': 'off',
      'no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
    },
  },

  // 3. Server test files (all test directories)
  {
    files: ['**/__tests__/**/*.{js,cjs,mjs}', '**/tests/**/*.{js,cjs,mjs}', '**/*.test.{js,cjs,mjs}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'commonjs',
      globals: {
        ...globals.node,
        ...globals.jest,
        'generateTestToken': 'readonly',
        'fail': 'readonly',
        'silenceConsole': 'readonly',
        'restoreConsole': 'readonly',
        'expectValidationError': 'readonly',
        'sleep': 'readonly',
      },
    },
    rules: {
      // Allow console in tests
      'no-console': 'off',
    },
  },
];

export default config;

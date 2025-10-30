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
      // Generated files
      '**/.next/**',
      '**/apps/admin/.next/**',
      '**/apps/admin/next-env.d.ts',
      '**/apps/admin/out/**',
      // Webpack/build artifacts
      '**/*.config.{js,cjs,mjs}',
      '**/postcss.config.{js,cjs}',
      '**/tailwind.config.{js,cjs}',
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
        NodeJS: 'readonly',
        RequestInit: 'readonly',
        EventListener: 'readonly',
        EventListenerOptions: 'readonly',
        AddEventListenerOptions: 'readonly',
        EventListenerOrEventListenerObject: 'readonly',
        FrameRequestCallback: 'readonly',
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

  // Mobile-specific configuration - STRICT RULES per AGENTS.md "strict defaults"
  // NOTE: If you need to use 'any' or unsafe operations in mobile code, use eslint-disable
  // comments with justification. React Native third-party libs should be properly typed.
  {
    files: ['apps/mobile/src/**/*.{ts,tsx}'],
    ignores: [
      'apps/mobile/src/theme/**/*',
      'apps/mobile/src/constants/**/*',
      'apps/mobile/src/styles/**/*',
      'apps/mobile/src/types/**/*',
    ],
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
      // === Theme/Color Rules (strict) ===
      'local/no-theme-namespace': 'error',
      'local/no-hardcoded-colors': 'error',
      
      // === TypeScript Strict Rules (zero tolerance) ===
      '@typescript-eslint/no-explicit-any': 'error', // Changed from 'off' - use eslint-disable with justification
      '@typescript-eslint/no-unsafe-assignment': 'error', // Changed from 'off'
      '@typescript-eslint/no-unsafe-member-access': 'error', // Changed from 'off'
      '@typescript-eslint/no-unsafe-call': 'error', // Changed from 'off'
      '@typescript-eslint/no-unsafe-return': 'error', // Changed from 'off'
      '@typescript-eslint/no-unsafe-argument': 'error', // Added (was missing)
      '@typescript-eslint/no-unused-vars': [
        'error', // Changed from 'warn'
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      
      // === React Native Specific (keep relaxed) ===
      'no-console': ['warn', { allow: ['warn', 'error'] }], // Allow console.warn/error for debugging
      'react/no-unknown-property': 'off', // React Native has different props than web React
      'react/react-in-jsx-scope': 'off', // Not needed in React Native
    },
  },

  // Server-side JavaScript files (CommonJS)
  {
    files: ['server/**/*.{js,cjs,mjs}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'commonjs',
      globals: {
        ...globals.node,
      },
    },
    rules: {
      'no-console': 'off', // Allow console in server code
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

  // Server-side TypeScript files - must come after global TypeScript config to override rules
  // Matches both when run from root (server/**/*.ts) and from server directory (routes/**/*.ts, src/**/*.ts)
  {
    files: ['server/**/*.{ts}', 'routes/**/*.{ts}', 'src/**/*.{ts}', './**/*.{ts}'],
    plugins: {
      '@typescript-eslint': typescriptPlugin,
    },
    languageOptions: {
      parser: typescriptParser,
      globals: {
        ...globals.node,
      },
    },
    rules: {
      'no-console': 'off', // Allow console in server code
      '@typescript-eslint/no-explicit-any': 'off', // Off for server - Express routes commonly use any for req/res
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
    },
  },

  // Test files configuration
  // EXCEPTION: Tests and mocks are allowed to use 'any' and relaxed rules for pragmatic testing.
  // This is the ONLY exception to strict rules per AGENTS.md "strict defaults" principle.
  {
    files: [
      '**/*.test.{ts,tsx,js,cjs,mjs}',
      '**/__tests__/**/*.{ts,tsx,js,cjs,mjs}',
      '**/tests/**/*.{ts,tsx,js,cjs,mjs}',
      '**/*.spec.{ts,tsx,js,cjs,mjs}',
      '**/__mocks__/**/*.{ts,tsx,js,cjs,mjs}',
      '**/.storybook/**/*.{ts,tsx}', // Storybook mocks need relaxed rules
    ],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.jest,
        ...globals.node,
        jest: 'readonly',
        describe: 'readonly',
        test: 'readonly',
        it: 'readonly',
        expect: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
      },
    },
    rules: {
      // Relaxed rules for test files only
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      'no-console': 'off', // Console is useful in tests
      'no-undef': 'off', // Jest globals are defined
      'no-unused-vars': 'off', // Jest/TypeScript handle this
      '@typescript-eslint/no-unused-vars': 'off', // Jest handles test setup
    },
  },

  // Admin package - Next.js generated files and browser globals
  {
    files: ['apps/admin/**/*.{ts,tsx,js}'],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
        React: 'readonly',
        JSX: 'readonly',
      },
    },
    rules: {
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      '@typescript-eslint/no-explicit-any': 'warn', // Warn for admin (can be more lenient)
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],
    },
  },
];

module.exports = {
  root: true,
  env: {
    'react-native/react-native': true,
    es2021: true,
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2021,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
  plugins: [
    '@typescript-eslint',
    'react',
    'react-native',
  ],
  rules: {
    'no-undef': 'error',
    'no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
    'no-console': 'off',
    'no-debugger': 'error',
    'no-control-regex': 'off',
    'react-native/no-inline-styles': 'off',
    'react-native/no-unused-styles': 'warn',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-unsafe-assignment': 'off',
    '@typescript-eslint/no-unsafe-member-access': 'off',
    '@typescript-eslint/no-unsafe-call': 'off',
    '@typescript-eslint/no-unsafe-return': 'off',
    '@typescript-eslint/no-unsafe-argument': 'off',
    '@typescript-eslint/no-unnecessary-condition': 'off',
    '@typescript-eslint/no-unnecessary-template-expression': 'off',
    '@typescript-eslint/require-await': 'off',
    '@typescript-eslint/no-base-to-string': 'off',
    '@typescript-eslint/no-deprecated': 'off',
  },
  overrides: [
    {
      files: ['**/src/**/*.{ts,tsx}'],
      rules: {
        'no-raw-colors/noRawColor': 'error',
        'no-raw-spacing/noRawSpacing': 'error',
        'local/no-theme-namespace': 'error',
        'local/no-theme-background-prop': 'error',
      }
    },
    {
      files: ['**/__tests__/**/*', '**/*.test.ts', '**/*.test.tsx', '**/__mocks__/**/*', 'src/__mocks__/**/*'],
      env: {
        jest: true,
        node: true,
      },
      globals: {
        jest: 'readonly',
      },
      rules: {
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/no-unsafe-assignment': 'off',
        '@typescript-eslint/no-unsafe-member-access': 'off',
        '@typescript-eslint/no-unsafe-call': 'off',
        'no-raw-colors/noRawColor': 'off',
        'no-raw-spacing/noRawSpacing': 'off',
      },
    },
  ],
  ignorePatterns: [
    'node_modules/',
    'dist/',
    'coverage/',
    '.expo/',
    'android/',
    'ios/',
    '*.config.js',
    '*.config.cjs',
    'babel.config.cjs',
    'metro.config.cjs',
  ],
  pluginsConfig: {
    local: {
      rules: {
        'no-theme-background-prop': require('./eslint-local-rules/no-theme-background-prop'),
        'no-theme-namespace': require('./eslint-local-rules/no-theme-namespace'),
      },
    },
  },
};
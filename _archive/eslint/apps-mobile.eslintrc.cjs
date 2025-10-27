/* eslint-env node */
module.exports = {
  root: true,
  extends: [
    '@react-native',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: ['./tsconfig.json', './tsconfig.test.json'],
    tsconfigRootDir: __dirname,
    ecmaFeatures: { jsx: true },
  },
  plugins: ['@typescript-eslint', 'react', 'react-hooks', 'jest', 'react-native'],
  env: { es6: true },
  settings: {
    react: { version: 'detect' },
  },
  rules: {
    // stylistic / safety—you can tighten later
    '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    'react/react-in-jsx-scope': 'off',
    'react-native/no-inline-styles': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-non-null-assertion': 'off',
  },
  overrides: [
    // Tests
    {
      files: ['**/*.test.ts', '**/*.test.tsx', '**/__tests__/**/*.{ts,tsx}'],
      env: { jest: true, node: true },
      plugins: ['jest'],
      extends: ['plugin:jest/recommended'],
      rules: {
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/no-unused-vars': 'off',
      },
    },
    // Mocks
    {
      files: ['**/__mocks__/**/*.{ts,tsx,js,jsx}', '**/mocks/**/*.{ts,tsx,js,jsx}'],
      env: { jest: true, node: true },
      globals: { jest: 'readonly', require: 'readonly', module: 'readonly' },
      rules: {
        '@typescript-eslint/no-var-requires': 'off',
        'import/no-extraneous-dependencies': 'off',
        '@typescript-eslint/no-explicit-any': 'off',
        'no-undef': 'off',
        'no-unused-vars': 'off',
      },
    },
  ],
  ignorePatterns: [
    'node_modules/',
    'dist/',
    'build/',
    '**/*.d.ts',
    'coverage/',
    '.expo/',
    'babel.config.cjs',
    'metro.config.cjs',
  ],
};


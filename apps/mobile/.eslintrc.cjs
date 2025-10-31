module.exports = {
  root: true,
  extends: ['universe/native', 'plugin:@typescript-eslint/recommended'],
  parserOptions: { project: './tsconfig.json' },
  plugins: ['local', '@typescript-eslint'],
  rules: {
    'local/no-hardcoded-colors': 'error',
    'no-console': 'error',
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/no-unsafe-assignment': 'error',
    '@typescript-eslint/no-unsafe-member-access': 'error',
    '@typescript-eslint/no-unsafe-call': 'error',
    '@typescript-eslint/no-unsafe-argument': 'error',
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    'no-restricted-imports': ['error', {
      paths: [{ name: '@react-navigation/native', importNames: ['useTheme'], message: 'Alias as useNavigationTheme' }],
    }],
  },
  overrides: [
    {
      files: ['scripts/**/*', '**/*.test.*', '__mocks__/**/*'],
      rules: { 'no-console': 'off' }, // scripts/tests can log
    },
  ],
};

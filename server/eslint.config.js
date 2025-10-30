// Server-specific ESLint config
// Extends root config but overrides rules for server routes
import rootConfig from '../eslint.config.js';

export default [
  ...rootConfig.default || rootConfig,
  {
    files: ['**/*.{ts,js}'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off', // Off for server - Express routes commonly use any for req/res
      'no-console': 'off', // Allow console in server code
    },
  },
];

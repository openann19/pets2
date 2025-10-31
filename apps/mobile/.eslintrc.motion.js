/**
 * 🎯 CI GUARDRAILS FOR MOTION SYSTEM
 * 
 * ESLint rules enforcing polish mandate requirements:
 * - Complexity limits
 * - Max lines per function
 * - Max depth
 * - No unused vars
 * - No restricted globals in worklets
 * - Reanimated plugin required
 */

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
    // === POLISH MANDATE RULES ===
    
    // Complexity limits (per polish mandate: max 10)
    'complexity': ['error', 10],
    
    // Max lines per function (per polish mandate: max 50)
    'max-lines-per-function': ['error', { 
      max: 50, 
      skipBlankLines: true, 
      skipComments: true 
    }],
    
    // Max depth (per polish mandate: max 3)
    'max-depth': ['error', 3],
    
    // No unused vars
    'no-unused-vars': 'off', // Turn off base rule
    '@typescript-eslint/no-unused-vars': ['error', {
      argsIgnorePattern: '^_',
      varsIgnorePattern: '^_',
    }],
    
    // No restricted globals in worklets (per polish mandate)
    'no-restricted-globals': ['error', {
      name: 'setTimeout',
      message: 'setTimeout is not allowed in Reanimated worklets. Use runOnJS or schedule on JS thread.',
    }, {
      name: 'setInterval',
      message: 'setInterval is not allowed in Reanimated worklets. Use runOnJS or schedule on JS thread.',
    }, {
      name: 'eval',
      message: 'eval is not allowed in Reanimated worklets for security.',
    }, {
      name: 'Function',
      message: 'Function constructor is not allowed in Reanimated worklets for security.',
    }, {
      name: 'exec',
      message: 'exec is not allowed in Reanimated worklets for security.',
    }],
    
    // Require 'worklet' directive for worklet functions
    '@typescript-eslint/no-explicit-any': ['error', {
      ignoreRestArgs: true,
    }],
    
    // === EXISTING RULES ===
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
  overrides: [
    {
      // Stricter rules for animation/motion files
      files: ['**/animations/**', '**/motion/**', '**/effects/**', '**/*Animation*.ts*', '**/*Motion*.ts*'],
      rules: {
        'complexity': ['error', 8], // Stricter for animations
        'max-lines-per-function': ['error', { max: 40 }], // Stricter for animations
        'max-depth': ['error', 2], // Stricter for animations
        'no-restricted-globals': ['error', {
          name: 'setTimeout',
          message: 'Never use setTimeout in animation worklets. Use withTiming/withSpring or runOnJS.',
        }, {
          name: 'setInterval',
          message: 'Never use setInterval in animation worklets. Use withRepeat or runOnJS.',
        }, {
          name: 'runOnJS',
          message: 'Avoid runOnJS in hot paths (animation loops). Batch side-effects after transition.',
        }],
      },
    },
    {
      // Rules for worklet files (files with 'worklet' directive)
      files: ['**/*.worklet.ts*', '**/*worklet*.ts*'],
      rules: {
        'no-restricted-globals': ['error', {
          name: 'setTimeout',
          message: 'setTimeout is not allowed in worklets. Use withTiming/withSpring.',
        }, {
          name: 'setInterval',
          message: 'setInterval is not allowed in worklets. Use withRepeat.',
        }, {
          name: 'console',
          message: 'console is not allowed in worklets. Use runOnJS(console.log) if needed.',
        }],
        'no-restricted-syntax': [
          'error',
          {
            selector: 'CallExpression[callee.name="runOnJS"]',
            message: 'Avoid runOnJS in hot paths. Batch side-effects after transition completes.',
          },
        ],
      },
    },
  ],
};


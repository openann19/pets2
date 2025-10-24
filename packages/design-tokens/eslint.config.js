import { fileURLToPath } from 'node:url';
import path from 'node:path';

import js from '@eslint/js';
import typescriptPlugin from '@typescript-eslint/eslint-plugin';
import typescriptParser from '@typescript-eslint/parser';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import globals from 'globals';

const packageDir = path.dirname(fileURLToPath(new URL('.', import.meta.url)));

export default [
	{ ignores: ['dist/**', 'node_modules/**'] },
	js.configs.recommended,
	{
		files: ['**/*.{ts,tsx}'],
		languageOptions: {
			parser: typescriptParser,
			parserOptions: {
				ecmaVersion: 'latest',
				sourceType: 'module',
				ecmaFeatures: { jsx: true },
					projectService: true,
			},
			globals: { ...globals.node, ...globals.browser },
		},
		plugins: {
			'@typescript-eslint': typescriptPlugin,
			react: reactPlugin,
			'react-hooks': reactHooksPlugin,
		},
			settings: { react: { version: 'detect' } },
		rules: {
			...typescriptPlugin.configs['strict-type-checked'].rules,
			...reactPlugin.configs.recommended.rules,
			...reactPlugin.configs['jsx-runtime'].rules,
			...reactHooksPlugin.configs.recommended.rules,
			'@typescript-eslint/no-explicit-any': 'error',
			'@typescript-eslint/no-unsafe-assignment': 'error',
			'@typescript-eslint/no-unsafe-call': 'error',
			'@typescript-eslint/no-unsafe-member-access': 'error',
			'@typescript-eslint/no-unsafe-argument': 'error',
			'@typescript-eslint/no-unsafe-return': 'error',
			'@typescript-eslint/no-floating-promises': 'error',
			'@typescript-eslint/strict-boolean-expressions': [
				'error',
				{ allowString: false, allowNumber: false, allowNullableObject: false },
			],
			'react-hooks/exhaustive-deps': 'error',
			'no-console': ['error', { allow: ['warn', 'error'] }],
			'@typescript-eslint/no-unused-vars': [
				'error',
				{
					argsIgnorePattern: '^_',
					varsIgnorePattern: '^_',
					caughtErrorsIgnorePattern: '^_',
				},
			],
			'@typescript-eslint/explicit-function-return-type': 'off',
			'@typescript-eslint/explicit-module-boundary-types': 'off',
			'arrow-body-style': 'off',
			'react/prop-types': 'off',
		},
	},
	{
		files: ['**/*.test.{ts,tsx}'],
		rules: {
			'@typescript-eslint/no-explicit-any': 'off',
			'@typescript-eslint/no-unsafe-assignment': 'off',
			'@typescript-eslint/no-unsafe-call': 'off',
			'@typescript-eslint/no-non-null-assertion': 'off',
		},
	},
];

import { fileURLToPath } from 'node:url';
import path from 'node:path';

import rootConfig from '../../eslint.config.js';

const packageDir = path.dirname(fileURLToPath(new URL('.', import.meta.url)));

export default [
	...rootConfig,
	{
		files: ['**/*.{ts,tsx}'],
		languageOptions: {
			parserOptions: {
				project: [
					path.join(packageDir, 'tsconfig.json'),
					path.join(packageDir, 'tsconfig.test.json'),
				],
				tsconfigRootDir: packageDir,
				projectService: true,
			},
		},
	},
];

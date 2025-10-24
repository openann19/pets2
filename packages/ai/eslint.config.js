import { fileURLToPath } from 'node:url';
import path from 'node:path';
import globals from 'globals';

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
        allowDefaultProject: true,
      },
    },
  },
  // Ensure test files are recognized by the project service and have jest globals
  {
    files: ['**/*.test.{ts,tsx}', '**/__tests__/**/*.{ts,tsx}'],
    languageOptions: {
      parserOptions: {
        project: [
          path.join(packageDir, 'tsconfig.json'),
          path.join(packageDir, 'tsconfig.test.json'),
        ],
        tsconfigRootDir: packageDir,
        projectService: true,
        allowDefaultProject: true,
      },
      globals: {
        ...globals.jest,
      },
    },
  },
];

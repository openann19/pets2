#!/usr/bin/env node
const { execSync } = require('child_process');
const args = process.argv.slice(2);

const command = `pnpm exec eslint --ext .ts,.tsx --config .eslintrc.js --cwd ${process.cwd()} --cache --cache-location .eslintcache ${args.join(' ')}`;
execSync(command, { stdio: 'inherit' });

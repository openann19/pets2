#!/usr/bin/env node

/**
 * CI Fail Script
 * Unified way to fail CI with messages
 */

const args = process.argv.slice(2);
const message = args.join(' ') || 'Unknown error occurred';

console.error(`\n❌ CI FAILURE: ${message}\n`);
console.error('This check must pass before merging.\n');
process.exit(1);


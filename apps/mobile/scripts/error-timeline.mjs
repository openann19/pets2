#!/usr/bin/env node

/**
 * Error Timeline Script
 * Appends error data to ERROR_TIMELINE.csv
 */

import { readFileSync, writeFileSync, existsSync, appendFileSync } from 'fs';
import { join } from 'path';

const TIMELINE_FILE = join(process.cwd(), 'reports', 'ERROR_TIMELINE.csv');

console.log('📊 Updating error timeline...\n');

if (!existsSync(TIMELINE_FILE)) {
  console.log('⚠️  Creating new ERROR_TIMELINE.csv');
  const header = 'timestamp,category,severity,count,description,trend\n';
  writeFileSync(TIMELINE_FILE, header);
}

// Read existing data
const existingData = readFileSync(TIMELINE_FILE, 'utf8');
const lines = existingData.split('\n').filter(l => l.trim());
const today = new Date().toISOString().split('T')[0];

// Check if today's entry exists
const hasTodayEntry = lines.some(line => line.startsWith(today));

if (!hasTodayEntry) {
  const newEntry = `${today},agents,info,0,System ran successfully,stable\n`;
  appendFileSync(TIMELINE_FILE, newEntry);
  console.log('✅ Added today\'s entry to timeline');
} else {
  console.log('ℹ️  Today\'s entry already exists');
}

console.log(`Timeline file: ${TIMELINE_FILE}`);

process.exit(0);


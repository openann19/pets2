#!/usr/bin/env node

/**
 * PII Audit Script
 * Scans for PII patterns in code
 * Checks AsyncStorage usage for sensitive data
 */

import { readFileSync, writeFileSync } from 'fs';
import { globSync } from 'glob';
import { join } from 'path';

const SRC_DIR = join(process.cwd(), 'src');
const OUTPUT_FILE = join(process.cwd(), 'reports', 'pii_audit.json');

console.log('🔍 Auditing for PII...\n');

const issues = [];
const sensitivePatterns = [
  { pattern: /password\s*[:=]\s*['"]([^'"]+)['"]/gi, type: 'hardcoded_password' },
  { pattern: /email\s*[:=]\s*['"]([^'"]+@[^'"]+)['"]/gi, type: 'email_in_code' },
  { pattern: /phone\s*[:=]\s*['"](\d{10,})['"]/gi, type: 'phone_in_code' },
  { pattern: /api[_-]?key\s*[:=]\s*['"]([^'"]+)['"]/gi, type: 'api_key' },
];

const files = globSync('**/*.{ts,tsx}', { cwd: SRC_DIR, absolute: false });

files.forEach(file => {
  const content = readFileSync(join(SRC_DIR, file), 'utf8');
  
  sensitivePatterns.forEach(({ pattern, type }) => {
    const matches = content.match(pattern);
    if (matches) {
      issues.push({
        file,
        type,
        line: 'unknown',
        severity: type === 'hardcoded_password' || type === 'api_key' ? 'critical' : 'high',
        recommendation: 'Move to environment variables or secure storage'
      });
    }
  });

  // Check AsyncStorage for sensitive data
  if (content.includes('AsyncStorage.setItem')) {
    const setItemCalls = content.match(/AsyncStorage\.setItem\(['"](\w+)['"],/g);
    if (setItemCalls) {
      setItemCalls.forEach(call => {
        const key = call.match(/['"](\w+)['"]/)[1];
        if (key.match(/(password|token|auth|secret|key)/i)) {
          issues.push({
            file,
            type: 'asyncstorage_sensitive',
            key,
            severity: 'high',
            recommendation: 'Use SecureStore for sensitive data'
          });
        }
      });
    }
  }
});

const result = {
  timestamp: new Date().toISOString(),
  issues,
  summary: {
    total: issues.length,
    critical: issues.filter(i => i.severity === 'critical').length,
    high: issues.filter(i => i.severity === 'high').length,
    medium: issues.filter(i => i.severity === 'medium').length
  },
  status: issues.length === 0 ? 'passed' : 'failed'
};

writeFileSync(OUTPUT_FILE, JSON.stringify(result, null, 2));

if (issues.length === 0) {
  console.log('✅ No PII issues found');
} else {
  console.log(`⚠️  Found ${issues.length} potential PII issues`);
  issues.forEach(issue => {
    console.log(`  - ${issue.file}: ${issue.type} (${issue.severity})`);
  });
}

console.log(`Report: ${OUTPUT_FILE}`);

process.exit(issues.length > 0 ? 1 : 0);


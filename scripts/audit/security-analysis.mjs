#!/usr/bin/env node

import { readFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

const root = process.cwd();
const findings = [];

// Common secret patterns
const secretPatterns = [
  /password\s*=\s*['"]\w+['"]/i,
  /api_key\s*=\s*['"]\w+['"]/i,
  /secret\s*=\s*['"]\w+['"]/i,
  /token\s*=\s*['"]\w+['"]/i,
  /private_key\s*=\s*['"]\w+['"]/i,
  /aws_access_key_id\s*=\s*['"]\w+['"]/i,
  /aws_secret_access_key\s*=\s*['"]\w+['"]/i,
  /database_url\s*=\s*['"]\w+['"]/i,
  /jwt_secret\s*=\s*['"]\w+['"]/i,
  /mongodb_uri\s*=\s*['"]\w+['"]/i,
  /[a-zA-Z0-9]{32,}/, // Long strings that might be keys
];

function analyzeFile(filePath) {
  const content = readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  
  lines.forEach((line, index) => {
    const lineNum = index + 1;
    
    // Check for hardcoded secrets
    secretPatterns.forEach((pattern, patternIndex) => {
      const match = line.match(pattern);
      if (match && !line.includes('example') && !line.includes('placeholder') && !line.includes('xxx') && !line.includes('YOUR_')) {
        findings.push({
          id: `AUD-SEC-${String(findings.length + 1).padStart(5, '0')}`,
          severity: 'P0',
          category: 'Security',
          file: filePath.replace(root + '/', ''),
          line: lineNum,
          code: line.trim(),
          problem: 'Potential hardcoded secret or API key',
          evidence: 'Hardcoded secrets in code are security risks',
          fix: 'Move secret to environment variables or secure storage',
          autofix: {
            type: 'manual',
            snippet: 'Replace with process.env.SECRET_NAME or secure config'
          },
          blast_radius: 'Cross-app',
          confidence: 0.8,
          tags: ['secrets', 'security', 'api-keys'],
          owner: filePath.includes('mobile') ? 'mobile' : filePath.includes('web') ? 'web' : filePath.includes('server') ? 'server' : 'core'
        });
      }
    });
    
    // Check for insecure fetch usage
    if (line.includes('fetch(') && !line.includes('timeout') && !line.includes('AbortController')) {
      findings.push({
        id: `AUD-SEC-${String(findings.length + 1).padStart(5, '0')}`,
        severity: 'P1',
        category: 'Security',
        file: filePath.replace(root + '/', ''),
        line: lineNum,
        code: line.trim(),
        problem: 'Fetch without timeout or abort controller',
        evidence: 'Requests without timeout can hang and cause DoS',
        fix: 'Add AbortController with timeout to fetch calls',
        autofix: {
          type: 'manual',
          snippet: 'Add const controller = new AbortController(); setTimeout(() => controller.abort(), 10000);'
        },
        blast_radius: 'Local',
        confidence: 0.7,
        tags: ['fetch', 'timeout', 'security'],
        owner: filePath.includes('mobile') ? 'mobile' : filePath.includes('web') ? 'web' : filePath.includes('server') ? 'server' : 'core'
      });
    }
    
    // Check for PII in logs
    if ((line.includes('console.log') || line.includes('logger.log')) && 
        (line.includes('email') || line.includes('password') || line.includes('ssn') || line.includes('credit'))) {
      findings.push({
        id: `AUD-SEC-${String(findings.length + 1).padStart(5, '0')}`,
        severity: 'P1',
        category: 'Security',
        file: filePath.replace(root + '/', ''),
        line: lineNum,
        code: line.trim(),
        problem: 'Potential PII in logs',
        evidence: 'Logging personal information violates privacy',
        fix: 'Remove PII from logs or use proper data masking',
        autofix: {
          type: 'manual',
          snippet: 'Remove sensitive data from log statements'
        },
        blast_radius: 'Local',
        confidence: 0.8,
        tags: ['pii', 'privacy', 'logging'],
        owner: filePath.includes('mobile') ? 'mobile' : filePath.includes('web') ? 'web' : filePath.includes('server') ? 'server' : 'core'
      });
    }
    
    // Check for eval() or Function() constructor (but not shader .eval() calls)
    if ((line.includes('eval(') && !line.includes('.eval(')) || line.includes('new Function(')) {
      findings.push({
        id: `AUD-SEC-${String(findings.length + 1).padStart(5, '0')}`,
        severity: 'P0',
        category: 'Security',
        file: filePath.replace(root + '/', ''),
        line: lineNum,
        code: line.trim(),
        problem: 'Use of eval() or Function() constructor',
        evidence: 'Dynamic code execution is a major security risk',
        fix: 'Replace with safer alternatives or remove entirely',
        autofix: {
          type: 'manual',
          snippet: 'Replace eval() with proper parsing or validation'
        },
        blast_radius: 'Cross-app',
        confidence: 0.9,
        tags: ['code-injection', 'security'],
        owner: filePath.includes('mobile') ? 'mobile' : filePath.includes('web') ? 'web' : filePath.includes('server') ? 'server' : 'core'
      });
    }
    
    // Check for unsafe localStorage usage for sensitive data
    if (line.includes('localStorage.setItem') && 
        (line.includes('token') || line.includes('password') || line.includes('secret'))) {
      findings.push({
        id: `AUD-SEC-${String(findings.length + 1).padStart(5, '0')}`,
        severity: 'P1',
        category: 'Security',
        file: filePath.replace(root + '/', ''),
        line: lineNum,
        code: line.trim(),
        problem: 'Sensitive data stored in localStorage',
        evidence: 'localStorage is not encrypted and vulnerable to XSS',
        fix: 'Use secure storage like SecureStore or encrypted storage',
        autofix: {
          type: 'manual',
          snippet: 'Replace localStorage with SecureStore for sensitive data'
        },
        blast_radius: 'Local',
        confidence: 0.8,
        tags: ['storage', 'xss', 'security'],
        owner: filePath.includes('mobile') ? 'mobile' : 'web'
      });
    }
  });
}

function traverse(dir) {
  const items = readdirSync(dir);
  
  for (const item of items) {
    const fullPath = join(dir, item);
    const stat = statSync(fullPath);
    
    if (stat.isDirectory() && !item.includes('node_modules') && !item.includes('.git') && !item.includes('dist') && !item.includes('build')) {
      traverse(fullPath);
    } else if (stat.isFile() && (item.endsWith('.ts') || item.endsWith('.tsx') || item.endsWith('.js') || item.endsWith('.jsx'))) {
      analyzeFile(fullPath);
    }
  }
}

// Analyze all source directories
['apps/mobile/src', 'apps/web/src', 'packages/core/src', 'server/src'].forEach(dir => {
  try {
    traverse(join(root, dir));
  } catch (error) {
    // Skip if directory doesn't exist
  }
});

// Output findings as JSONL
findings.forEach(finding => {
  console.log(JSON.stringify(finding));
});

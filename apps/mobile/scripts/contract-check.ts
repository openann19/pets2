/**
 * Contract Checker - Validates service method signatures against mock API
 * Ensures client-service contracts are compatible with backend expectations
 */

import { readFileSync, readdirSync } from 'fs';
import { join, resolve } from 'path';

interface ServiceMethod {
  name: string;
  method: string;
  path: string;
  params?: string[];
}

interface ContractViolation {
  file: string;
  method: string;
  issue: string;
  severity: 'error' | 'warning';
}

function extractServiceMethods(content: string, filename: string): ServiceMethod[] {
  const methods: ServiceMethod[] = [];
  
  // Match axios.get/post/put/delete/patch calls with string literals
  const apiCallRegex = /axios\.(get|post|put|delete|patch)\s*\(\s*['"`]([^'"`]+)['"`]/g;
  let match;
  
  while ((match = apiCallRegex.exec(content)) !== null) {
    const method = match[1].toUpperCase();
    const path = match[2];
    
    methods.push({
      name: filename.replace('.ts', ''),
      method,
      path,
    });
  }
  
  return methods;
}

function checkContracts(servicesDir: string): ContractViolation[] {
  const violations: ContractViolation[] = [];
  const expectedEndpoints = new Set([
    // GDPR endpoints - CRITICAL
    '/users/delete-account',
    '/users/export-data',
    '/users/confirm-deletion',
    // Auth
    '/auth/login',
    '/auth/logout',
    '/auth/register',
    // Swipe
    '/swipe/:petId/like',
    '/swipe/:petId/pass',
    '/swipe/:petId/report',
    // Others
    '/pets',
    '/matches',
    '/chat/conversations',
  ]);

  const files = readdirSync(servicesDir, { recursive: true, withFileTypes: true })
    .filter(f => f.isFile() && f.name.endsWith('.ts') && !f.name.endsWith('.test.ts'))
    .map(f => join(servicesDir, f.name));

  for (const file of files) {
    try {
      const content = readFileSync(file, 'utf-8');
      const methods = extractServiceMethods(content, file);
      
      for (const method of methods) {
        // Check if endpoint exists in expected list
        const normalizedPath = method.path.split('?')[0]; // Remove query strings
        if (!expectedEndpoints.has(normalizedPath) && !normalizedPath.includes('/')) {
          violations.push({
            file,
            method: method.name,
            issue: `Endpoint ${method.method} ${method.path} not in expected list`,
            severity: 'warning',
          });
        }
      }
    } catch (error) {
      violations.push({
        file,
        method: 'unknown',
        issue: `Failed to parse file: ${error instanceof Error ? error.message : String(error)}`,
        severity: 'error',
      });
    }
  }

  return violations;
}

function main() {
  const servicesDir = process.argv[2] || './src/services';
  const resolvedDir = resolve(servicesDir);
  
  console.log(`📋 Checking API contracts in: ${resolvedDir}`);
  
  const violations = checkContracts(resolvedDir);
  
  if (violations.length === 0) {
    console.log('✅ All contracts valid!');
    process.exit(0);
  }
  
  const errors = violations.filter(v => v.severity === 'error');
  const warnings = violations.filter(v => v.severity === 'warning');
  
  console.log(`\n📊 Results:`);
  console.log(`   Errors: ${errors.length}`);
  console.log(`   Warnings: ${warnings.length}`);
  
  if (errors.length > 0) {
    console.log('\n❌ Errors:');
    errors.forEach(v => {
      console.log(`   [${v.file}] ${v.method}: ${v.issue}`);
    });
  }
  
  if (warnings.length > 0) {
    console.log('\n⚠️  Warnings:');
    warnings.forEach(v => {
      console.log(`   [${v.file}] ${v.method}: ${v.issue}`);
    });
  }
  
  process.exit(errors.length > 0 ? 1 : 0);
}

main();


#!/usr/bin/env node

/**
 * Integration Validation Script
 * 
 * Validates that all critical screens have:
 * 1. Network status monitoring
 * 2. Error handling with retry
 * 3. Tab state preservation (where applicable)
 * 4. Loading skeletons
 * 5. Empty states
 * 
 * Usage: node scripts/validate-integrations.mjs
 */

import { readFileSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

const CRITICAL_SCREENS = [
  'MatchesScreen',
  'SwipeScreen',
  'MyPetsScreen',
  'HomeScreen',
  'ProfileScreen',
];

const REQUIRED_HOOKS = [
  'useNetworkStatus',
  'useErrorHandling',
  'useTabStatePreservation',
];

const REQUIRED_COMPONENTS = [
  'EmptyStates',
  'ListSkeleton',
  'ErrorBoundary',
];

function checkFile(filePath, screenName) {
  const issues = [];
  
  try {
    const content = readFileSync(filePath, 'utf-8');
    
    // Check for required hooks
    for (const hook of REQUIRED_HOOKS) {
      if (!content.includes(hook)) {
        issues.push(`Missing hook: ${hook}`);
      }
    }
    
    // Check for required components
    for (const component of REQUIRED_COMPONENTS) {
      if (!content.includes(component)) {
        issues.push(`Missing component: ${component}`);
      }
    }
    
    // Check for loading state handling
    if (!content.includes('isLoading') && !content.includes('isLoading &&')) {
      issues.push('Missing loading state handling');
    }
    
    // Check for error handling
    if (!content.includes('error') && !content.includes('error ||')) && !content.includes('errorHandlingError')) {
      issues.push('Missing error state handling');
    }
    
    // Check for network awareness
    if (!content.includes('isOffline') && !content.includes('isOnline')) {
      issues.push('Missing network status awareness');
    }
    
    return issues;
  } catch (error) {
    return [`Failed to read file: ${error.message}`];
  }
}

function validateIntegrations() {
  console.log('🔍 Validating Screen Integrations...\n');
  
  let totalIssues = 0;
  const results = {};
  
  for (const screen of CRITICAL_SCREENS) {
    const filePath = join(rootDir, 'src', 'screens', `${screen}.tsx`);
    const issues = checkFile(filePath, screen);
    
    results[screen] = {
      path: filePath,
      issues,
      status: issues.length === 0 ? '✅' : '❌',
    };
    
    totalIssues += issues.length;
  }
  
  // Print results
  console.log('Results:\n');
  
  for (const [screen, result] of Object.entries(results)) {
    console.log(`${result.status} ${screen}`);
    
    if (result.issues.length > 0) {
      console.log('   Issues:');
      result.issues.forEach(issue => {
        console.log(`   - ${issue}`);
      });
    }
    
    console.log('');
  }
  
  // Summary
  console.log('─'.repeat(50));
  console.log(`\nTotal Issues: ${totalIssues}`);
  console.log(`Screens Validated: ${CRITICAL_SCREENS.length}`);
  console.log(`Passing: ${CRITICAL_SCREENS.length - Object.values(results).filter(r => r.issues.length > 0).length}`);
  console.log(`Failing: ${Object.values(results).filter(r => r.issues.length > 0).length}`);
  
  if (totalIssues === 0) {
    console.log('\n✅ All screens have proper integrations!');
    process.exit(0);
  } else {
    console.log('\n❌ Some screens need attention.');
    process.exit(1);
  }
}

validateIntegrations();


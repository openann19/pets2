#!/usr/bin/env node
/**
 * ADMIN ERROR DIAGNOSTIC TOOL
 * Checks all admin components for common errors
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 ADMIN ERROR DIAGNOSTIC TOOL\n');
console.log('=' .repeat(60));

const errors = [];
const warnings = [];
const fixes = [];

// ============================================================================
// CHECK 1: Required Dependencies
// ============================================================================
console.log('\n📦 Checking Dependencies...');

const requiredDeps = {
  server: ['zod', 'express-rate-limit', 'ws', 'bcryptjs', 'jsonwebtoken'],
  web: ['zod', 'react', 'next'],
  core: ['zod']
};

function checkDependencies(packagePath, deps) {
  try {
    const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    const allDeps = { ...pkg.dependencies, ...pkg.devDependencies };
    
    deps.forEach(dep => {
      if (!allDeps[dep]) {
        errors.push(`Missing dependency: ${dep} in ${packagePath}`);
        fixes.push(`pnpm add ${dep} --filter ${path.basename(path.dirname(packagePath))}`);
      } else {
        console.log(`  ✅ ${dep}`);
      }
    });
  } catch (err) {
    errors.push(`Cannot read ${packagePath}: ${err.message}`);
  }
}

checkDependencies('/Users/elvira/Downloads/pets-pr-1/server/package.json', requiredDeps.server);
checkDependencies('/Users/elvira/Downloads/pets-pr-1/apps/web/package.json', requiredDeps.web);
checkDependencies('/Users/elvira/Downloads/pets-pr-1/packages/core/package.json', requiredDeps.core);

// ============================================================================
// CHECK 2: File Existence
// ============================================================================
console.log('\n📁 Checking Required Files...');

const requiredFiles = [
  '/Users/elvira/Downloads/pets-pr-1/server/src/middleware/rbac.js',
  '/Users/elvira/Downloads/pets-pr-1/server/src/middleware/adminAuth.js',
  '/Users/elvira/Downloads/pets-pr-1/server/src/middleware/rateLimiter.js',
  '/Users/elvira/Downloads/pets-pr-1/server/src/middleware/sessionManager.js',
  '/Users/elvira/Downloads/pets-pr-1/server/src/controllers/adminAnalyticsController.js',
  '/Users/elvira/Downloads/pets-pr-1/server/src/services/adminWebSocket.js',
  '/Users/elvira/Downloads/pets-pr-1/apps/web/src/hooks/useAdminPermissions.ts',
  '/Users/elvira/Downloads/pets-pr-1/server/src/models/User.js'
];

requiredFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`  ✅ ${path.basename(file)}`);
  } else {
    errors.push(`Missing file: ${file}`);
  }
});

// ============================================================================
// CHECK 3: Syntax Errors
// ============================================================================
console.log('\n🔧 Checking for Syntax Errors...');

function checkSyntax(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Check for common issues
    if (content.includes('logger.error') && !content.includes('validationLogger')) {
      errors.push(`${filePath}: Uses 'logger' instead of 'validationLogger'`);
    }
    
    if (content.includes('require(') && !content.includes('const')) {
      warnings.push(`${filePath}: Uses require without const`);
    }
    
    // Check for undefined variables
    const undefinedVars = content.match(/\b(z|logger|stripe)\s*\./g);
    if (undefinedVars) {
      undefinedVars.forEach(match => {
        const varName = match.replace('.', '').trim();
        if (!content.includes(`const ${varName}`) && !content.includes(`let ${varName}`) && !content.includes(`import ${varName}`)) {
          errors.push(`${filePath}: Undefined variable '${varName}'`);
        }
      });
    }
    
    console.log(`  ✅ ${path.basename(filePath)}`);
  } catch (err) {
    errors.push(`Cannot check ${filePath}: ${err.message}`);
  }
}

[
  '/Users/elvira/Downloads/pets-pr-1/server/src/utils/validateEnv.js',
  '/Users/elvira/Downloads/pets-pr-1/server/src/controllers/premiumController.js',
  '/Users/elvira/Downloads/pets-pr-1/server/src/middleware/rbac.js'
].forEach(checkSyntax);

// ============================================================================
// CHECK 4: Environment Variables
// ============================================================================
console.log('\n🔐 Checking Environment Variables...');

const envPath = '/Users/elvira/Downloads/pets-pr-1/server/.env';
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  
  const requiredEnvVars = ['JWT_SECRET', 'JWT_REFRESH_SECRET', 'MONGODB_URI'];
  requiredEnvVars.forEach(varName => {
    if (envContent.includes(varName)) {
      const value = envContent.match(new RegExp(`${varName}=(.+)`))?.[1];
      if (value && value.includes('dev_') || value.includes('your_')) {
        warnings.push(`${varName} appears to use default value`);
        fixes.push(`Generate secure ${varName}: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`);
      } else {
        console.log(`  ✅ ${varName}`);
      }
    } else {
      errors.push(`Missing ${varName} in .env`);
    }
  });
} else {
  errors.push('.env file not found');
  fixes.push('cp /Users/elvira/Downloads/pets-pr-1/server/.env.example /Users/elvira/Downloads/pets-pr-1/server/.env');
}

// ============================================================================
// CHECK 5: Database Connection
// ============================================================================
console.log('\n🗄️  Checking Database...');

const { exec } = require('child_process');
exec('mongosh --eval "db.version()" --quiet', (err, stdout) => {
  if (err) {
    errors.push('MongoDB not running or not accessible');
    fixes.push('brew services start mongodb-community');
  } else {
    console.log(`  ✅ MongoDB running (${stdout.trim()})`);
  }
  
  // ============================================================================
  // FINAL REPORT
  // ============================================================================
  console.log('\n' + '='.repeat(60));
  console.log('\n📊 DIAGNOSTIC REPORT\n');
  
  if (errors.length === 0 && warnings.length === 0) {
    console.log('✅ NO ERRORS FOUND!');
    console.log('\nYour admin system appears to be configured correctly.');
  } else {
    if (errors.length > 0) {
      console.log(`❌ ERRORS (${errors.length}):`);
      errors.forEach((err, i) => {
        console.log(`  ${i + 1}. ${err}`);
      });
    }
    
    if (warnings.length > 0) {
      console.log(`\n⚠️  WARNINGS (${warnings.length}):`);
      warnings.forEach((warn, i) => {
        console.log(`  ${i + 1}. ${warn}`);
      });
    }
    
    if (fixes.length > 0) {
      console.log('\n💡 SUGGESTED FIXES:\n');
      fixes.forEach((fix, i) => {
        console.log(`  ${i + 1}. ${fix}`);
      });
    }
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('\n🔍 For more details, check:');
  console.log('  - Server logs: /Users/elvira/Downloads/pets-pr-1/server/logs/');
  console.log('  - Browser console: http://localhost:3000 (F12)');
  console.log('  - Test suite: npm test\n');
  
  process.exit(errors.length > 0 ? 1 : 0);
});

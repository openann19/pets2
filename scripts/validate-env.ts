#!/usr/bin/env tsx

/**
 * Environment Variable Validation Script
 * Validates that all required environment variables are set
 */

import { logger } from '../packages/core/src/services/logger';

interface EnvVarConfig {
  type: 'string' | 'number';
  required?: boolean;
  default?: string;
  values?: string[];
  minLength?: number;
}

type EnvVarMap = Record<string, EnvVarConfig>;

// Required environment variables
const REQUIRED_VARS: EnvVarMap = {
  // Server
  PORT: { type: 'number', default: '5000' },
  NODE_ENV: { type: 'string', values: ['development', 'production', 'test'] },
  
  // Database
  MONGODB_URI: { type: 'string', required: true },
  
  // JWT
  JWT_SECRET: { type: 'string', required: true, minLength: 32 },
  JWT_ACCESS_EXPIRY: { type: 'string', default: '15m' },
  JWT_REFRESH_EXPIRY: { type: 'string', default: '7d' },
  
  // Client
  CLIENT_URL: { type: 'string', required: true },
};

// Optional but recommended variables
const RECOMMENDED_VARS: EnvVarMap = {
  // Email
  EMAIL_SERVICE: { type: 'string' },
  SMTP_HOST: { type: 'string' },
  SMTP_USER: { type: 'string' },
  EMAIL_FROM: { type: 'string' },
  
  // File Upload
  CLOUDINARY_CLOUD_NAME: { type: 'string' },
  CLOUDINARY_API_KEY: { type: 'string' },
  CLOUDINARY_API_SECRET: { type: 'string' },
  
  // Payment
  STRIPE_SECRET_KEY: { type: 'string' },
  STRIPE_PUBLISHABLE_KEY: { type: 'string' },
  
  // Monitoring
  SENTRY_DSN: { type: 'string' },
};

// Production-only required variables
const PRODUCTION_REQUIRED: EnvVarMap = {
  STRIPE_WEBHOOK_SECRET: { type: 'string' },
  REDIS_URL: { type: 'string' },
  SENTRY_DSN: { type: 'string' },
};

const errors: string[] = [];
const warnings: string[] = [];
const info: string[] = [];

/**
 * Validate a single environment variable
 */
function validateVar(name: string, config: EnvVarConfig, value: string | undefined): boolean {
  // Check if required
  if (config.required && !value) {
    errors.push(`❌ ${name} is required but not set`);
    return false;
  }
  
  // Use default if not set
  if (!value && config.default) {
    info.push(`ℹ️  ${name} not set, using default: ${config.default}`);
    return true;
  }
  
  // Skip if not set and not required
  if (!value) {
    return true;
  }
  
  // Validate type
  if (config.type === 'number') {
    if (isNaN(Number(value))) {
      errors.push(`❌ ${name} must be a number, got: ${value}`);
      return false;
    }
  }
  
  // Validate allowed values
  if (config.values && !config.values.includes(value)) {
    errors.push(`❌ ${name} must be one of: ${config.values.join(', ')}, got: ${value}`);
    return false;
  }
  
  // Validate minimum length
  if (config.minLength && value.length < config.minLength) {
    errors.push(`❌ ${name} must be at least ${config.minLength} characters long`);
    return false;
  }
  
  // Validate URL format
  if (config.type === 'string' && name.includes('URL')) {
    try {
      new URL(value);
    } catch {
      warnings.push(`⚠️  ${name} may not be a valid URL: ${value}`);
    }
  }
  
  return true;
}

/**
 * Main validation function
 */
function validateEnvironment(): boolean {
  logger.info('🔍 Validating environment variables...');
  
  const env = process.env;
  const isProduction = env.NODE_ENV === 'production';
  
  // Validate required variables
  logger.info('\n📋 Checking required variables...');
  for (const [name, config] of Object.entries(REQUIRED_VARS)) {
    validateVar(name, config, env[name]);
  }
  
  // Validate production-only variables
  if (isProduction) {
    logger.info('\n🏭 Checking production-required variables...');
    for (const [name, config] of Object.entries(PRODUCTION_REQUIRED)) {
      validateVar(name, { ...config, required: true }, env[name]);
    }
  }
  
  // Check recommended variables
  logger.info('\n💡 Checking recommended variables...');
  for (const [name, config] of Object.entries(RECOMMENDED_VARS)) {
    if (!env[name]) {
      warnings.push(`⚠️  ${name} is not set (recommended for full functionality)`);
    } else {
      validateVar(name, config, env[name]);
    }
  }
  
  // Security checks
  logger.info('\n🔒 Running security checks...');
  
  // Check JWT secret strength
  if (env.JWT_SECRET && env.JWT_SECRET.length < 32) {
    warnings.push('⚠️  JWT_SECRET should be at least 32 characters for security');
  }
  
  if (env.JWT_SECRET && env.JWT_SECRET.includes('change-this')) {
    errors.push('❌ JWT_SECRET contains placeholder text - must be changed!');
  }
  
  // Check for development secrets in production
  if (isProduction) {
    if (env.JWT_SECRET && env.JWT_SECRET.includes('development')) {
      errors.push('❌ Using development JWT_SECRET in production!');
    }
    
    if (env.MONGODB_URI && env.MONGODB_URI.includes('localhost')) {
      errors.push('❌ Using localhost MongoDB in production!');
    }
    
    if (env.STRIPE_SECRET_KEY && env.STRIPE_SECRET_KEY.startsWith('sk_test_')) {
      warnings.push('⚠️  Using Stripe test key in production');
    }
  }
  
  // Check CORS configuration
  if (env.ALLOWED_ORIGINS) {
    const origins = env.ALLOWED_ORIGINS.split(',');
    if (isProduction && origins.includes('http://localhost:3000')) {
      warnings.push('⚠️  ALLOWED_ORIGINS includes localhost in production');
    }
  }
  
  // Print results
  logger.info('\n' + '='.repeat(60));
  logger.info('📊 Validation Results');
  logger.info('='.repeat(60));
  
  if (errors.length > 0) {
    logger.error('\n❌ ERRORS:');
    errors.forEach(err => logger.error(err));
  }
  
  if (warnings.length > 0) {
    logger.warn('\n⚠️  WARNINGS:');
    warnings.forEach(warn => logger.warn(warn));
  }
  
  if (info.length > 0) {
    logger.info('\nℹ️  INFO:');
    info.forEach(i => logger.info(i));
  }
  
  logger.info('\n' + '='.repeat(60));
  
  if (errors.length === 0 && warnings.length === 0) {
    logger.info('✅ All environment variables are valid!');
    logger.info('='.repeat(60));
    return true;
  } else if (errors.length === 0) {
    logger.warn(`✅ Environment is valid with ${warnings.length} warning(s)`);
    logger.info('='.repeat(60));
    return true;
  } else {
    logger.error(`❌ Environment validation failed with ${errors.length} error(s)`);
    logger.info('='.repeat(60));
    logger.error('\n💡 Fix the errors above and try again');
    logger.error('💡 Copy .env.example to .env and fill in the values');
    return false;
  }
}

// Run validation
const isValid = validateEnvironment();

// Exit with appropriate code
process.exit(isValid ? 0 : 1);

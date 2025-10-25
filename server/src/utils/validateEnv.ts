export {};// Added to mark file as a module
/**
 * Enhanced Environment Variable Validation (2025 Standards)
 * - Comprehensive validation with schema-based approach
 * - Type checking for specific variables
 * - Format validation (URLs, secrets, connection strings)
 * - Different requirements based on environment
 * - Secret entropy checking
 */

// Note: zod was previously required here but not used. Avoid requiring optional deps in early boot paths
// to keep tests and minimal environments lightweight.

// Simple console logger for validation (before full logger is initialized)
const validationLogger = {
  info: (msg) => console.log(`[INFO] ${msg}`),
  warn: (msg) => console.warn(`[WARN] ${msg}`),
  error: (msg) => console.error(`[ERROR] ${msg}`)
};

/**
 * Environment schema definition - strict validation of environment variables
 */
const envSchema = {
  // Core environment
  NODE_ENV: { type: 'enum', values: ['development', 'test', 'staging', 'production'], required: false, default: 'development' },
  PORT: { type: 'port', required: false, default: '5000' },
  LOG_LEVEL: { type: 'enum', values: ['error', 'warn', 'info', 'http', 'debug'], required: false, default: 'info' },

  // Authentication
  JWT_SECRET: { type: 'secret', required: true, minLength: 32 },
  JWT_REFRESH_SECRET: { type: 'secret', required: true, minLength: 32 },
  JWT_EXPIRY: { type: 'duration', required: false, default: '1h' },
  JWT_REFRESH_EXPIRY: { type: 'duration', required: false, default: '7d' },

  // Database
  MONGODB_URI: { type: 'mongodb', required: true },
  REDIS_URL: { type: 'redis', required: false },

  // External services
  CLIENT_URL: { type: 'url', required: true },
  ADMIN_URL: { type: 'url', required: false },

  // Stripe integration
  STRIPE_SECRET_KEY: { type: 'secret', required: 'production', pattern: /^sk_(test|live)_/ },
  STRIPE_WEBHOOK_SECRET: { type: 'secret', required: 'production' },
  STRIPE_PRICE_ID_PREMIUM: { type: 'string', required: 'production', pattern: /^price_/ },
  STRIPE_PRICE_ID_ULTIMATE: { type: 'string', required: 'production', pattern: /^price_/ },

  // File storage
  CLOUDINARY_CLOUD_NAME: { type: 'string', required: 'production' },
  CLOUDINARY_API_KEY: { type: 'secret', required: 'production' },
  CLOUDINARY_API_SECRET: { type: 'secret', required: 'production' },

  // API rate limiting
  RATE_LIMIT_WINDOW_MS: { type: 'number', required: false, default: '60000' },
  RATE_LIMIT_MAX_REQUESTS: { type: 'number', required: false, default: '100' },

  // Security
  CONFIG_ENCRYPTION_KEY: { type: 'secret', required: true, minLength: 32 },
  CONFIG_ENCRYPTION_KEY_V2: { type: 'secret', required: false, minLength: 32 },
  CORS_ORIGINS: { type: 'string', required: false },

  // Email
  SMTP_HOST: { type: 'string', required: 'production' },
  SMTP_PORT: { type: 'port', required: 'production' },
  SMTP_USER: { type: 'string', required: 'production' },
  SMTP_PASS: { type: 'secret', required: 'production' },
  EMAIL_FROM: { type: 'email', required: 'production' },

  // Monitoring
  SENTRY_DSN: { type: 'url', required: 'production' },
  SENTRY_ENVIRONMENT: { type: 'string', required: false },
  SENTRY_SAMPLE_RATE: { type: 'float', required: false, default: '0.1', min: 0, max: 1 }
};

// Type validation functions
const validators = {
  string: (value) => typeof value === 'string',
  number: (value) => !isNaN(Number(value)),
  float: (value) => !isNaN(parseFloat(value)),
  boolean: (value) => ['true', 'false', '0', '1'].includes(value.toLowerCase()),
  port: (value) => !isNaN(Number(value)) && Number(value) >= 1 && Number(value) <= 65535,
  url: (value) => {
    try {
      new URL(value);
      return true;
    } catch {
      return false;
    }
  },
  email: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
  duration: (value) => /^\d+(\.\d+)?(ms|s|m|h|d|w|y)$/.test(value),
  enum: (value, schema) => schema.values.includes(value),
  secret: (value, schema) => {
    if (schema.minLength && value.length < schema.minLength) return false;
    // Check entropy (variety of characters)
    const hasLowerCase = /[a-z]/.test(value);
    const hasUpperCase = /[A-Z]/.test(value);
    const hasDigit = /\d/.test(value);
    const hasSpecial = /[^a-zA-Z0-9]/.test(value);
    const varietyScore = [hasLowerCase, hasUpperCase, hasDigit, hasSpecial].filter(Boolean).length;
    return varietyScore >= 2; // At least 2 character types for good entropy
  },
  mongodb: (value) => /^mongodb(\+srv)?:\/\//.test(value),
  redis: (value) => /^redis:\/\//.test(value)
};

/**
 * Enhanced environment variable validation using schema-based approach
 * @returns {object} Validated environment variables
 * @throws {Error} If required variables are missing or invalid
 */
function validateEnv() {
  validationLogger.info('Starting environment variable validation');

  const errors = [];
  const warnings = [];
  const validatedEnv = {};
  const isProduction = process.env.NODE_ENV === 'production';
  const isTest = process.env.NODE_ENV === 'test';

  // Process each variable defined in the schema
  for (const [key, schema] of Object.entries(envSchema)) {
    const value = process.env[key];
    const isRequired = schema.required === true ||
      (schema.required === 'production' && isProduction);

    // Check if required variable is missing
    if (isRequired && (value === undefined || value === '')) {
      errors.push({
        variable: key,
        message: `Missing required environment variable: ${key}`,
        severity: 'critical'
      });
      continue;
    }

    // If variable is not set but has a default, use the default
    if ((value === undefined || value === '') && schema.default !== undefined) {
      validatedEnv[key] = schema.default;
      continue;
    }

    // Skip further validation if the variable is not set and not required
    if (value === undefined || value === '') continue;

    // Type validation
    const validator = validators[schema.type];
    if (validator && !validator(value, schema)) {
      errors.push({
        variable: key,
        message: `Invalid format for ${key}: expected ${schema.type}`,
        severity: 'critical',
        value: schema.type === 'secret' ? '[REDACTED]' : value
      });
      continue;
    }

    // Pattern validation if specified
    if (schema.pattern && !schema.pattern.test(value)) {
      errors.push({
        variable: key,
        message: `${key} does not match required pattern`,
        severity: 'critical'
      });
      continue;
    }

    // Min/max validation for numeric types
    if ((schema.type === 'number' || schema.type === 'float') &&
      (schema.min !== undefined || schema.max !== undefined)) {
      const numValue = Number(value);
      if ((schema.min !== undefined && numValue < schema.min) ||
        (schema.max !== undefined && numValue > schema.max)) {
        errors.push({
          variable: key,
          message: `${key} must be between ${schema.min || 0} and ${schema.max || 'unlimited'}`,
          severity: 'critical'
        });
        continue;
      }
    }

    // Additional security checks for secrets
    if (schema.type === 'secret') {
      // Check for obviously insecure values
      if (key.includes('SECRET') || key.includes('KEY') || key.includes('PASSWORD')) {
        const insecureValues = [
          'changeme', 'secret', 'password', 'your-secret', 'your-key',
          '123456', 'secretkey', 'apikey', 'change-me', 'example'
        ];

        const lowerValue = value.toLowerCase();
        if (insecureValues.some(insecure => lowerValue.includes(insecure))) {
          errors.push({
            variable: key,
            message: `${key} appears to contain an insecure default value`,
            severity: 'critical'
          });
          continue;
        }
      }
    }

    // Warn about duplicated secrets in different variables
    if (schema.type === 'secret' && Object.entries(envSchema)
      .filter(([k, s]) => k !== key && s.type === 'secret' && process.env[k] === value)
      .length > 0) {
      warnings.push({
        variable: key,
        message: `${key} appears to use the same value as another secret`,
        severity: 'warning'
      });
    }

    // Store the validated value
    validatedEnv[key] = value;
  }

  // Special case: JWT secrets should be different
  if (validatedEnv.JWT_SECRET && validatedEnv.JWT_REFRESH_SECRET &&
    validatedEnv.JWT_SECRET === validatedEnv.JWT_REFRESH_SECRET) {
    if (isProduction) {
      errors.push({
        variable: 'JWT_REFRESH_SECRET',
        message: 'JWT_REFRESH_SECRET must be different from JWT_SECRET in production',
        severity: 'critical'
      });
    } else {
      warnings.push({
        variable: 'JWT_REFRESH_SECRET',
        message: 'JWT_REFRESH_SECRET should be different from JWT_SECRET',
        severity: 'warning'
      });
    }
  }

  // Special case: Stripe key environment mismatch
  if (validatedEnv.STRIPE_SECRET_KEY) {
    const isTestKey = validatedEnv.STRIPE_SECRET_KEY.startsWith('sk_test_');
    const isLiveKey = validatedEnv.STRIPE_SECRET_KEY.startsWith('sk_live_');

    if (isProduction && isTestKey) {
      warnings.push({
        variable: 'STRIPE_SECRET_KEY',
        message: 'Using Stripe test key in production environment',
        severity: 'warning'
      });
    } else if (!isProduction && isLiveKey) {
      warnings.push({
        variable: 'STRIPE_SECRET_KEY',
        message: 'Using Stripe live key in non-production environment',
        severity: 'warning'
      });
    }
  }

  // Report errors and exit if any critical issues
  if (errors.length > 0) {
    validationLogger.error('Environment validation failed');
    errors.forEach(e => validationLogger.error(`  - ${e.variable}: ${e.message}`));

    console.error('\n❌ Environment Validation Failed:\n');
    errors.forEach((error, index) => {
      console.error(`  ${index + 1}. ${error.message}`);
    });
    console.error('\n💡 Tip: Copy .env.example to .env and fill in the values\n');
    // During test runs, do not exit the process. Proceed with defaults to keep tests isolated from env.
    if (!isTest) {
      process.exit(1);
    }
  }

  // Report warnings but continue
  if (warnings.length > 0) {
    validationLogger.warn('Environment validation warnings');
    warnings.forEach(w => validationLogger.warn(`  - ${w.variable}: ${w.message}`));

    console.warn('\n⚠️ Environment Validation Warnings:\n');
    warnings.forEach((warning, index) => {
      console.warn(`  ${index + 1}. ${warning.message}`);
    });
    console.warn('');
  }

  // Log successful validation
  validationLogger.info(`Environment variables validated successfully (${validatedEnv.NODE_ENV || 'development'})`);

  // Log sanitized configuration (without sensitive data)
  const configSummary = {
    environment: validatedEnv.NODE_ENV || 'development',
    port: validatedEnv.PORT || 5000,
    clientUrl: validatedEnv.CLIENT_URL,
    mongodb: validatedEnv.MONGODB_URI ? 'Configured' : 'Not configured',
    redis: validatedEnv.REDIS_URL ? 'Configured' : 'Not configured',
    stripe: validatedEnv.STRIPE_SECRET_KEY ? 'Configured' : 'Not configured',
    cloudinary: validatedEnv.CLOUDINARY_API_KEY ? 'Configured' : 'Not configured',
    smtp: validatedEnv.SMTP_HOST ? 'Configured' : 'Not configured',
    sentry: validatedEnv.SENTRY_DSN ? 'Configured' : 'Not configured'
  };

  validationLogger.info('Server configuration loaded');

  // Console output for human-readable summary
  console.log('\n📋 Configuration Summary:');
  console.log(`  • Environment: ${configSummary.environment}`);
  console.log(`  • Port: ${configSummary.port}`);
  console.log(`  • Client URL: ${configSummary.clientUrl}`);
  console.log(`  • MongoDB: ${configSummary.mongodb === 'Configured' ? '✓' : '✗'} ${configSummary.mongodb}`);
  console.log(`  • Redis: ${configSummary.redis === 'Configured' ? '✓' : '✗'} ${configSummary.redis}`);
  console.log(`  • JWT Authentication: ✓ Configured`);
  console.log(`  • Stripe: ${configSummary.stripe === 'Configured' ? '✓' : '✗'} ${configSummary.stripe}`);
  console.log(`  • Cloudinary: ${configSummary.cloudinary === 'Configured' ? '✓' : '✗'} ${configSummary.cloudinary}`);
  console.log(`  • Email: ${configSummary.smtp === 'Configured' ? '✓' : '✗'} ${configSummary.smtp}`);
  console.log(`  • Error Monitoring: ${configSummary.sentry === 'Configured' ? '✓' : '✗'} ${configSummary.sentry}`);
  console.log('');

  return validatedEnv;
}

module.exports = validateEnv;

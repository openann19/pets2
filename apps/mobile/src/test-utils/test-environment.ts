/**
 * Test Environment Configuration
 * Provides environment setup for different test categories
 */

/**
 * Test environment types
 */
export enum TestEnvironment {
  Unit = 'unit',
  Integration = 'integration',
  E2E = 'e2e',
  Contract = 'contract',
  A11y = 'a11y',
}

/**
 * Environment configuration
 */
export interface TestEnvConfig {
  /** Test environment type */
  type: TestEnvironment;
  /** Whether to use fake timers */
  useFakeTimers: boolean;
  /** Whether to mock API calls */
  mockAPI: boolean;
  /** Whether to mock navigation */
  mockNavigation: boolean;
  /** Whether to mock theme */
  mockTheme: boolean;
  /** Test timeout in milliseconds */
  timeout: number;
  /** Additional environment variables */
  env: Record<string, string>;
}

/**
 * Default configurations for each test type
 */
export const TEST_ENV_CONFIGS: Record<TestEnvironment, TestEnvConfig> = {
  [TestEnvironment.Unit]: {
    type: TestEnvironment.Unit,
    useFakeTimers: true,
    mockAPI: true,
    mockNavigation: true,
    mockTheme: true,
    timeout: 5000,
    env: {
      NODE_ENV: 'test',
    },
  },
  [TestEnvironment.Integration]: {
    type: TestEnvironment.Integration,
    useFakeTimers: false,
    mockAPI: true,
    mockNavigation: false,
    mockTheme: false,
    timeout: 30000,
    env: {
      NODE_ENV: 'test',
    },
  },
  [TestEnvironment.E2E]: {
    type: TestEnvironment.E2E,
    useFakeTimers: false,
    mockAPI: false,
    mockNavigation: false,
    mockTheme: false,
    timeout: 60000,
    env: {
      NODE_ENV: 'test',
    },
  },
  [TestEnvironment.Contract]: {
    type: TestEnvironment.Contract,
    useFakeTimers: false,
    mockAPI: false,
    mockNavigation: true,
    mockTheme: true,
    timeout: 10000,
    env: {
      NODE_ENV: 'test',
    },
  },
  [TestEnvironment.A11y]: {
    type: TestEnvironment.A11y,
    useFakeTimers: false,
    mockAPI: true,
    mockNavigation: true,
    mockTheme: false,
    timeout: 10000,
    env: {
      NODE_ENV: 'test',
    },
  },
};

/**
 * Setup test environment based on type
 */
export function setupTestEnvironment(type: TestEnvironment): () => void {
  const config = TEST_ENV_CONFIGS[type];
  
  // Set environment variables
  const originalEnv = { ...process.env };
  Object.assign(process.env, config.env);
  
  // Setup fake timers if needed
  let cleanupTimers: (() => void) | null = null;
  if (config.useFakeTimers) {
    const { setupFakeTimers, cleanupTimers: cleanup } = require('./timer-helpers');
    setupFakeTimers();
    cleanupTimers = cleanup;
  }
  
  // Return cleanup function
  return () => {
    // Restore environment
    process.env = originalEnv;
    
    // Cleanup timers
    if (cleanupTimers) {
      cleanupTimers();
    }
  };
}

/**
 * Get test environment from Jest environment variable
 */
export function getTestEnvironment(): TestEnvironment {
  const env = process.env.JEST_ENVIRONMENT || 'node';
  
  // Map Jest environments to our test types
  if (env.includes('integration')) {
    return TestEnvironment.Integration;
  }
  if (env.includes('e2e')) {
    return TestEnvironment.E2E;
  }
  if (env.includes('contract')) {
    return TestEnvironment.Contract;
  }
  if (env.includes('a11y')) {
    return TestEnvironment.A11y;
  }
  
  return TestEnvironment.Unit;
}


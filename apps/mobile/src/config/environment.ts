/**
 * Environment configuration for mobile app
 * Handles different environments (development, staging, production)
 */

export interface EnvironmentConfig {
  API_BASE_URL: string;
  SOCKET_URL: string;
  AI_SERVICE_URL: string;
  ENVIRONMENT: "development" | "staging" | "production";
  ENABLE_LOGGING: boolean;
  ENABLE_ANALYTICS: boolean;
  API_TIMEOUT: number;
  USE_MOCK_API?: boolean;
  MOCK_API_PORT?: number;
}

// Default configuration
const defaultConfig: EnvironmentConfig = {
  API_BASE_URL: "http://localhost:5001",
  SOCKET_URL: "http://localhost:5001",
  AI_SERVICE_URL: "http://localhost:8000",
  ENVIRONMENT: "development",
  ENABLE_LOGGING: true,
  ENABLE_ANALYTICS: false,
  API_TIMEOUT: 30000,
  USE_MOCK_API: false,
  MOCK_API_PORT: 7337,
};

// Environment-specific configurations
const environments: Record<string, Partial<EnvironmentConfig>> = {
  development: {
    API_BASE_URL: "http://localhost:5001",
    SOCKET_URL: "http://localhost:5001",
    AI_SERVICE_URL: "http://localhost:8000",
    ENVIRONMENT: "development",
    ENABLE_LOGGING: true,
    ENABLE_ANALYTICS: false,
    API_TIMEOUT: 30000,
    USE_MOCK_API: false, // Set to true when running pnpm mobile:mock
    MOCK_API_PORT: 7337,
  },
  staging: {
    API_BASE_URL: "https://api-staging.pawfectmatch.com",
    SOCKET_URL: "https://api-staging.pawfectmatch.com",
    AI_SERVICE_URL: "https://ai-staging.pawfectmatch.com",
    ENVIRONMENT: "staging",
    ENABLE_LOGGING: true,
    ENABLE_ANALYTICS: true,
    API_TIMEOUT: 30000,
  },
  production: {
    API_BASE_URL: "https://api.pawfectmatch.com",
    SOCKET_URL: "https://api.pawfectmatch.com",
    AI_SERVICE_URL: "https://ai.pawfectmatch.com",
    ENVIRONMENT: "production",
    ENABLE_LOGGING: false,
    ENABLE_ANALYTICS: true,
    API_TIMEOUT: 15000,
  },
};

// Get current environment from process.env or default to development
const getCurrentEnvironment = (): string => {
  // In React Native, we can use __DEV__ to detect development mode
  if (__DEV__) {
    return "development";
  }

  // For production builds, check environment variables
  // These would be set during build time
  return process.env.NODE_ENV || "development";
};

// Merge default config with environment-specific config
const currentEnv = getCurrentEnvironment();
const envConfig = environments[currentEnv] || {};

export const config: EnvironmentConfig = {
  ...defaultConfig,
  ...envConfig,
};

// Export individual config values for convenience
export const {
  API_BASE_URL,
  SOCKET_URL,
  AI_SERVICE_URL,
  ENVIRONMENT,
  ENABLE_LOGGING,
  ENABLE_ANALYTICS,
  API_TIMEOUT,
  USE_MOCK_API,
  MOCK_API_PORT,
} = config;

// Helper to get the actual API URL (with mock support)
export const getApiUrl = (): string => {
  if (USE_MOCK_API) {
    return `http://localhost:${MOCK_API_PORT || 7337}`;
  }
  return API_BASE_URL;
};

// Helper functions
export const isDevelopment = (): boolean => ENVIRONMENT === "development";
export const isStaging = (): boolean => ENVIRONMENT === "staging";
export const isProduction = (): boolean => ENVIRONMENT === "production";

// Log configuration in development
if (isDevelopment() && ENABLE_LOGGING) {
  // Use logger service instead of console
  import("../services/logger").then(({ logger }) => {
    logger.info("Environment Configuration", {
      environment: ENVIRONMENT,
      apiBaseUrl: API_BASE_URL,
      socketUrl: SOCKET_URL,
      aiServiceUrl: AI_SERVICE_URL,
      logging: ENABLE_LOGGING,
      analytics: ENABLE_ANALYTICS,
    });
  });
}

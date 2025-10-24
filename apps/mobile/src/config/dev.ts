/**
 * Development Configuration for Mobile App
 * Controls development-specific features and overrides
 */

export const DEV_CONFIG = {
  // Disable authentication in development
  DISABLE_AUTH: __DEV__ || process.env.EXPO_PUBLIC_DISABLE_AUTH === "true",

  // Enable development mode features
  DEV_MODE: __DEV__ || process.env.EXPO_PUBLIC_DEV_MODE === "true",

  // Mock data for development
  USE_MOCK_DATA: process.env.EXPO_PUBLIC_USE_MOCK_DATA === "true",

  // Debug logging
  DEBUG_LOGS: __DEV__,

  // API configuration
  API_URL: process.env.EXPO_PUBLIC_API_URL || "http://localhost:5001",

  // WebSocket configuration
  WS_URL: process.env.EXPO_PUBLIC_WS_URL || "ws://localhost:5001",
};

export const isDevelopment = () => DEV_CONFIG.DEV_MODE;
export const isAuthDisabled = () => DEV_CONFIG.DISABLE_AUTH;
export const shouldUseMockData = () => DEV_CONFIG.USE_MOCK_DATA;
export const shouldDebugLog = () => DEV_CONFIG.DEBUG_LOGS;

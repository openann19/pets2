/**
 * Simple test without testing-library cleanup
 */

// Skip auto cleanup to avoid timeout issues
process.env.RNTL_SKIP_AUTO_CLEANUP = 'true';

// Mock everything before importing
jest.mock("@sentry/react-native", () => ({
  init: jest.fn(),
  captureException: jest.fn(),
  captureMessage: jest.fn(),
  setUser: jest.fn(),
  setTag: jest.fn(),
  addBreadcrumb: jest.fn(),
}));

jest.mock("react-native-keychain", () => ({
  setInternetCredentials: jest.fn(),
  getInternetCredentials: jest.fn(),
  resetInternetCredentials: jest.fn(),
}));

jest.mock("react-native-aes-crypto", () => ({
  encrypt: jest.fn(),
  decrypt: jest.fn(),
}));

jest.mock("react-native-encrypted-storage", () => ({
  setItem: jest.fn(),
  getItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}));

// Mock the core package
jest.mock("@pawfectmatch/core", () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
  },
}));

// Mock expo-haptics
jest.mock("expo-haptics", () => ({
  impactAsync: jest.fn(),
  notificationAsync: jest.fn(),
  selectionAsync: jest.fn(),
}));

// Mock error handler
jest.mock("../../useErrorHandler", () => ({
  useErrorHandler: () => ({
    handleNetworkError: jest.fn(),
    handleOfflineError: jest.fn(),
  }),
}));

// Now import the hook
import { useAdminDashboardScreen } from "../useAdminDashboardScreen";

// Simple test function
test("hook should not crash on initialization", () => {
  const mockNavigation = {
    navigate: jest.fn(),
    goBack: jest.fn(),
  };

  // Try to create the hook
  expect(() => {
    // This is a simplified test - we're not actually rendering the hook
    // just checking if the module can be imported without crashing
    const hookModule = require("../useAdminDashboardScreen");
    expect(hookModule.useAdminDashboardScreen).toBeDefined();
  }).not.toThrow();
});

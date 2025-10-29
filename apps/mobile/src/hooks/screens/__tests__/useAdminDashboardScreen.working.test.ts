/**
 * Admin Dashboard Screen Hook Tests - Working Version
 */

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

jest.mock("expo-haptics", () => ({
  impactAsync: jest.fn().mockResolvedValue(undefined),
  notificationAsync: jest.fn().mockResolvedValue(undefined),
  selectionAsync: jest.fn().mockResolvedValue(undefined),
  ImpactFeedbackStyle: {
    Light: 'light',
    Medium: 'medium',
    Heavy: 'heavy',
  },
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


// Mock error handler
jest.mock("../../useErrorHandler", () => ({
  useErrorHandler: () => ({
    handleNetworkError: jest.fn(),
    handleOfflineError: jest.fn(),
  }),
}));

// Import React and the hook
import React, { useEffect, useState } from 'react';

// Create a simple test harness
const createTestHarness = (hook: any, props: any) => {
  let result: any;
  
  const TestComponent = () => {
    result = hook(props);
    return null;
  };
  
  // Use React's test renderer instead of testing library
  const ReactTestRenderer = require('react-test-renderer');
  ReactTestRenderer.act(() => {
    ReactTestRenderer.create(React.createElement(TestComponent));
  });
  
  return { result };
};

describe("useAdminDashboardScreen - Working Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should initialize with loading state", () => {
    const { useAdminDashboardScreen } = require("../useAdminDashboardScreen");
    const mockNavigation = {
      navigate: jest.fn(),
      goBack: jest.fn(),
    };

    const { result } = createTestHarness(useAdminDashboardScreen, { navigation: mockNavigation });
    
    expect(result.isLoading).toBe(true);
    expect(result.isRefreshing).toBe(false);
    expect(result.metrics).toBeDefined();
    expect(result.recentActivity).toEqual([]);
  });

  it("should have correct initial metrics", () => {
    const { useAdminDashboardScreen } = require("../useAdminDashboardScreen");
    const mockNavigation = {
      navigate: jest.fn(),
      goBack: jest.fn(),
    };

    const { result } = createTestHarness(useAdminDashboardScreen, { navigation: mockNavigation });
    
    expect(result.metrics.totalUsers).toBe(0);
    expect(result.metrics.activeUsers).toBe(0);
    expect(result.metrics.totalPets).toBe(0);
    expect(result.metrics.totalMatches).toBe(0);
  });

  it("should have navigation functions", () => {
    const { useAdminDashboardScreen } = require("../useAdminDashboardScreen");
    const mockNavigation = {
      navigate: jest.fn(),
      goBack: jest.fn(),
    };

    const { result } = createTestHarness(useAdminDashboardScreen, { navigation: mockNavigation });
    
    expect(typeof result.onNavigateToUsers).toBe('function');
    expect(typeof result.onNavigateToChats).toBe('function');
    expect(typeof result.onNavigateToVerifications).toBe('function');
    expect(typeof result.onRefresh).toBe('function');
  });

  it("should navigate to correct screens", () => {
    // Import Haptics to ensure mock is applied
    require('expo-haptics');
    
    const { useAdminDashboardScreen } = require("../useAdminDashboardScreen");
    const mockNavigation = {
      navigate: jest.fn(),
      goBack: jest.fn(),
    };

    const { result } = createTestHarness(useAdminDashboardScreen, { navigation: mockNavigation });
    
    result.onNavigateToUsers();
    expect(mockNavigation.navigate).toHaveBeenCalledWith("AdminUsers");
    
    result.onNavigateToChats();
    expect(mockNavigation.navigate).toHaveBeenCalledWith("AdminChats");
    
    result.onNavigateToVerifications();
    expect(mockNavigation.navigate).toHaveBeenCalledWith("AdminVerifications");
  });
});

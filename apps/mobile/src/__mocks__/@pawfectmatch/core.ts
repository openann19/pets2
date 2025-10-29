/**
 * Mock for @pawfectmatch/core package
 */

export const logger = {
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  security: jest.fn(),
  performance: jest.fn(),
  log: jest.fn(),
  trace: jest.fn(),
  setContext: jest.fn(),
  clearContext: jest.fn(),
  setUser: jest.fn(),
  clearUser: jest.fn(),
  addBreadcrumb: jest.fn(),
  flush: jest.fn().mockResolvedValue(undefined),
  getLogStats: jest.fn().mockReturnValue({
    total: 0,
    byLevel: {},
  }),
  exportLogs: jest.fn().mockResolvedValue([]),
  clearLogs: jest.fn(),
};

// Mock other exports from core
export const apiLogger = logger;
export const authLogger = logger;
export const uiLogger = logger;
export const navigationLogger = logger;
export const storageLogger = logger;
export const analyticsLogger = logger;
export const notificationLogger = logger;
export const mediaLogger = logger;

// Export basic types that might be needed
export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
}

export interface Pet {
  id: string;
  name: string;
  type: string;
  breed?: string;
}

// Export constants
export const HAPTICS = {
  LIGHT: 'light',
  MEDIUM: 'medium',
  HEAVY: 'heavy',
};

export const HAPTIC_SETTINGS = {
  ENABLED: true,
  INTENSITY: 'medium',
};

export const SETTINGS = {
  HAPTICS: HAPTIC_SETTINGS,
};

// Export animation config
export const animationConfig = {
  spring: { damping: 20, stiffness: 300 },
  timing: { duration: 300 },
};

export const useAnimationConfig = () => animationConfig;

// ==== API client & types used by services ====
export type ApiClientResponse<T = unknown> = {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
};

const ok = async <T = unknown>(data?: T): Promise<ApiClientResponse<T>> => ({
  success: true,
  data: (data as T) ?? ({} as T),
});

export const apiClient = {
  get: jest.fn(ok),
  post: jest.fn(ok),
  put: jest.fn(ok),
  delete: jest.fn(ok),
};

export const UnifiedAPIClient = jest.fn().mockImplementation(() => ({
  setNetworkOnline: jest.fn(),
  setAuthToken: jest.fn(),
  clearAuthToken: jest.fn(),
  destroy: jest.fn(),
  getCircuitBreakerMetrics: jest.fn(() => ({ failures: 0 })),
  getQueueStats: jest.fn(() => ({ size: 0 })),
}));

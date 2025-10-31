/**
 * Mock Factories for Test Utilities
 * Provides pre-configured mocks for common dependencies
 */

import { QueryClient } from '@tanstack/react-query';
import { createTestQueryClient } from './react-query-helpers';

/**
 * Create a mock QueryClient with test defaults
 * Alias for createTestQueryClient for consistency
 */
export function createMockQueryClient(
  overrides?: Parameters<typeof createTestQueryClient>[0]
): QueryClient {
  return createTestQueryClient(overrides);
}

/**
 * Create a mock socket with event emitter functionality
 */
export function createMockSocket(): {
  emit: jest.Mock;
  on: jest.Mock;
  off: jest.Mock;
  connect: jest.Mock;
  disconnect: jest.Mock;
  connected: boolean;
  // Event emitter methods
  listeners: Map<string, Array<(...args: unknown[]) => void>>;
  addEventListener: (event: string, handler: (...args: unknown[]) => void) => void;
  removeEventListener: (event: string, handler: (...args: unknown[]) => void) => void;
} {
  const listeners = new Map<string, Array<(...args: unknown[]) => void>>();

  const emit = jest.fn((event: string, ...args: unknown[]) => {
    const handlers = listeners.get(event) || [];
    handlers.forEach((handler) => {
      try {
        handler(...args);
      } catch (error) {
        console.error(`Error in socket event handler for ${event}:`, error);
      }
    });
  });

  const on = jest.fn((event: string, handler: (...args: unknown[]) => void) => {
    if (!listeners.has(event)) {
      listeners.set(event, []);
    }
    listeners.get(event)?.push(handler);
  });

  const off = jest.fn((event: string, handler?: (...args: unknown[]) => void) => {
    if (!handler) {
      listeners.delete(event);
      return;
    }
    const handlers = listeners.get(event) || [];
    const index = handlers.indexOf(handler);
    if (index > -1) {
      handlers.splice(index, 1);
    }
  });

  const connect = jest.fn(() => {
    mockSocket.connected = true;
    emit('connect');
  });

  const disconnect = jest.fn(() => {
    mockSocket.connected = false;
    emit('disconnect');
  });

  const addEventListener = (event: string, handler: (...args: unknown[]) => void) => {
    on(event, handler);
  };

  const removeEventListener = (event: string, handler: (...args: unknown[]) => void) => {
    off(event, handler);
  };

  const mockSocket = {
    emit,
    on,
    off,
    connect,
    disconnect,
    connected: false,
    listeners,
    addEventListener,
    removeEventListener,
  };

  return mockSocket;
}

/**
 * Create mock navigation props
 */
export function createMockNavigation(
  overrides?: Partial<ReturnType<typeof createMockNavigation>>
): {
  navigate: jest.Mock;
  goBack: jest.Mock;
  setOptions: jest.Mock;
  dispatch: jest.Mock;
  reset: jest.Mock;
  isFocused: jest.Mock;
  canGoBack: jest.Mock;
  getParent: jest.Mock;
  getState: jest.Mock;
  addListener: jest.Mock;
  removeListener: jest.Mock;
} {
  return {
    navigate: jest.fn(),
    goBack: jest.fn(),
    setOptions: jest.fn(),
    dispatch: jest.fn(),
    reset: jest.fn(),
    isFocused: jest.fn(() => true),
    canGoBack: jest.fn(() => true),
    getParent: jest.fn(),
    getState: jest.fn(() => ({})),
    addListener: jest.fn(() => jest.fn()),
    removeListener: jest.fn(),
    ...overrides,
  };
}

/**
 * Create aggregated service mocks
 */
export interface ServiceMocks {
  api?: {
    get: jest.Mock;
    post: jest.Mock;
    put: jest.Mock;
    delete: jest.Mock;
    request: jest.Mock;
  };
  authService?: {
    getCurrentUser: jest.Mock;
    login: jest.Mock;
    logout: jest.Mock;
    isAuthenticated: jest.Mock;
  };
  premiumService?: {
    getStatus: jest.Mock;
    subscribe: jest.Mock;
    cancelSubscription: jest.Mock;
  };
  notificationService?: {
    init: jest.Mock;
    cleanup: jest.Mock;
    setBadgeCount: jest.Mock;
  };
  [key: string]: unknown;
}

/**
 * Create mock services with common patterns
 */
export function createMockServices(
  overrides?: Partial<ServiceMocks>
): ServiceMocks {
  const defaultApi = {
    get: jest.fn().mockResolvedValue({ data: {} }),
    post: jest.fn().mockResolvedValue({ data: {} }),
    put: jest.fn().mockResolvedValue({ data: {} }),
    delete: jest.fn().mockResolvedValue({ data: {} }),
    request: jest.fn().mockResolvedValue({ data: {} }),
  };

  const defaultAuthService = {
    getCurrentUser: jest.fn().mockResolvedValue(null),
    login: jest.fn().mockResolvedValue({ success: true }),
    logout: jest.fn().mockResolvedValue(undefined),
    isAuthenticated: jest.fn().mockReturnValue(false),
  };

  const defaultPremiumService = {
    getStatus: jest.fn().mockResolvedValue({ active: false }),
    subscribe: jest.fn().mockResolvedValue({ success: true }),
    cancelSubscription: jest.fn().mockResolvedValue({ success: true }),
  };

  const defaultNotificationService = {
    init: jest.fn().mockResolvedValue(undefined),
    cleanup: jest.fn(),
    setBadgeCount: jest.fn().mockResolvedValue(undefined),
  };

  return {
    api: defaultApi,
    authService: defaultAuthService,
    premiumService: defaultPremiumService,
    notificationService: defaultNotificationService,
    ...overrides,
  };
}

/**
 * Reset all mocks in service mocks object
 */
export function resetMockServices(services: ServiceMocks): void {
  for (const service of Object.values(services)) {
    if (service && typeof service === 'object') {
      for (const method of Object.values(service)) {
        if (jest.isMockFunction(method)) {
          method.mockClear();
        }
      }
    }
  }
}


/**
 * Test Helpers and Utilities
 * Reusable test utilities for PawfectMatch Mobile App
 */

import React from "react";
import { render, type RenderOptions } from "@testing-library/react-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { NavigationContainer } from "@react-navigation/native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import type { NavigationProp } from "@react-navigation/native";

export interface TestWrapperOptions {
  withNavigation?: boolean;
  withQueryClient?: boolean;
  withSafeArea?: boolean;
  initialQueryClientOptions?: any;
}

/**
 * Create a test QueryClient with sensible defaults for testing
 */
export const createTestQueryClient = (options = {}) =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
        ...options,
      },
      mutations: {
        retry: false,
        ...options,
      },
    },
  });

/**
 * Mock navigation object for testing
 */
export const createMockNavigation = <T extends Record<string, any>>() =>
  ({
    navigate: jest.fn(),
    goBack: jest.fn(),
    setOptions: jest.fn(),
    addListener: jest.fn(() => jest.fn()),
    removeListener: jest.fn(),
    canGoBack: jest.fn(() => true),
    getId: jest.fn(),
    getParent: jest.fn(),
    getState: jest.fn(),
    dispatch: jest.fn(),
    isFocused: jest.fn(() => true),
    reset: jest.fn(),
    replace: jest.fn(),
    push: jest.fn(),
    pop: jest.fn(),
    popToTop: jest.fn(),
  }) as unknown as NavigationProp<T>;

/**
 * Mock route object for testing
 */
export const createMockRoute = (name: string, params = {}) => ({
  key: `test-key-${name}`,
  name,
  params,
});

/**
 * Enhanced render function with providers
 */
export const renderWithProviders = (
  ui: React.ReactElement,
  options: RenderOptions & TestWrapperOptions = {},
) => {
  const {
    withNavigation = true,
    withQueryClient = true,
    withSafeArea = true,
    initialQueryClientOptions = {},
    ...renderOptions
  } = options;

  const queryClient = withQueryClient
    ? createTestQueryClient(initialQueryClientOptions)
    : null;

  const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    let content = children;

    if (withQueryClient && queryClient) {
      content = (
        <QueryClientProvider client={queryClient}>
          {content}
        </QueryClientProvider>
      );
    }

    if (withSafeArea) {
      content = <SafeAreaProvider>{content}</SafeAreaProvider>;
    }

    if (withNavigation) {
      content = <NavigationContainer>{content}</NavigationContainer>;
    }

    return <>{content}</>;
  };

  return render(ui, { wrapper: Wrapper, ...renderOptions });
};

/**
 * Wait for async operations to complete
 */
export const waitForAsync = async (ms = 0) => {
  await new Promise((resolve) => setTimeout(resolve, ms));
  await new Promise((resolve) => setImmediate(resolve));
};

/**
 * Wait for component to finish rendering
 */
export const waitForRender = async () => {
  await new Promise((resolve) => setImmediate(resolve));
  await new Promise((resolve) => setImmediate(resolve));
};

/**
 * Create a mock gesture event
 */
export const createMockGestureEvent = (overrides: any = {}) => ({
  nativeEvent: {
    absoluteX: 100,
    absoluteY: 100,
    handlerTag: 1,
    state: 3, // END
    target: 1,
    timestamp: Date.now(),
    translationX: 0,
    translationY: 0,
    velocityX: 0,
    velocityY: 0,
    x: 100,
    y: 100,
    ...overrides.nativeEvent,
  },
  ...overrides,
});

/**
 * Simulate a swipe gesture
 */
export const simulateSwipeGesture = (
  target: any,
  direction: "left" | "right" | "up" | "down",
  distance = 200,
) => {
  const delta = {
    left: { translationX: -distance, velocityX: -500 },
    right: { translationX: distance, velocityX: 500 },
    up: { translationY: -distance, velocityY: -500 },
    down: { translationY: distance, velocityY: 500 },
  }[direction];

  const gestureEvent = createMockGestureEvent({
    nativeEvent: {
      ...delta,
      absoluteX: target ? target.absoluteX || 0 : 0,
      absoluteY: target ? target.absoluteY || 0 : 0,
    },
  });

  return gestureEvent;
};

/**
 * Create a mock API response
 */
export const createMockApiResponse = <T,>(data: T, success = true) => ({
  success,
  data,
  status: success ? 200 : 400,
  message: success ? "Success" : "Error",
});

/**
 * Create a mock API error
 */
export const createMockApiError = (message = "API Error", status = 400) => ({
  message,
  response: {
    status,
    data: {
      error: message,
      details: message,
    },
  },
  isAxiosError: true,
});

/**
 * Setup and teardown for async tests
 */
export const setupAsyncTest = () => {
  const timers = jest.useFakeTimers();

  return {
    timers,
    advanceTime: (ms: number) => {
      timers.advanceTimersByTime(ms);
    },
    runAllTimers: () => {
      timers.runAllTimers();
    },
    runOnlyPendingTimers: () => {
      timers.runOnlyPendingTimers();
    },
    restore: () => {
      timers.useRealTimers();
    },
  };
};

/**
 * Mock console methods for testing
 */
export const mockConsole = () => {
  const originalConsole = global.console;
  const mockConsole = {
    log: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
    debug: jest.fn(),
  };

  beforeAll(() => {
    global.console = mockConsole as any;
  });

  afterAll(() => {
    global.console = originalConsole;
  });

  return mockConsole;
};

/**
 * Create a spy on a method and restore after test
 */
export const createSpy = <T extends (...args: any[]) => any>(
  obj: any,
  method: string,
) => {
  const spy = jest.spyOn(obj, method);

  afterEach(() => {
    spy.mockRestore();
  });

  return spy;
};

/**
 * Wait for a specific condition to be true
 */
export const waitForCondition = async (
  condition: () => boolean,
  timeout = 5000,
  interval = 100,
): Promise<void> => {
  const start = Date.now();

  while (Date.now() - start < timeout) {
    if (condition()) {
      return;
    }
    await new Promise((resolve) => setTimeout(resolve, interval));
  }

  throw new Error("Timeout waiting for condition");
};

/**
 * Mock AsyncStorage for testing
 */
export const mockAsyncStorage = () => {
  const storage: Record<string, string> = {};

  return {
    getItem: jest.fn((key: string) => Promise.resolve(storage[key] || null)),
    setItem: jest.fn((key: string, value: string) => {
      storage[key] = value;
      return Promise.resolve();
    }),
    removeItem: jest.fn((key: string) => {
      delete storage[key];
      return Promise.resolve();
    }),
    clear: jest.fn(() => {
      Object.keys(storage).forEach((key) => delete storage[key]);
      return Promise.resolve();
    }),
    getAllKeys: jest.fn(() => Promise.resolve(Object.keys(storage))),
    multiGet: jest.fn((keys: string[]) =>
      Promise.resolve(keys.map((key) => [key, storage[key] || null])),
    ),
    multiSet: jest.fn((items: [string, string][]) => {
      items.forEach(([key, value]) => {
        storage[key] = value;
      });
      return Promise.resolve();
    }),
    multiRemove: jest.fn((keys: string[]) => {
      keys.forEach((key) => delete storage[key]);
      return Promise.resolve();
    }),
  };
};

/**
 * Create mock theme for testing
 */
export const createMockTheme = (isDark = false) => ({
  colors: {
    primary: "#7c3aed",
    secondary: "#ec4899",
    background: isDark ? "#1f2937" : "#ffffff",
    card: isDark ? "#374151" : "#ffffff",
    text: isDark ? "#ffffff" : "#000000",
    textSecondary: isDark ? "#9ca3af" : "#6b7280",
    border: isDark ? "#4b5563" : "#e5e7eb",
    notification: "#ec4899",
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    full: 9999,
  },
  isDark,
});

/**
 * Setup test environment with all providers
 */
export const setupTestEnvironment = () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = createTestQueryClient();
    jest.clearAllMocks();
  });

  afterEach(() => {
    queryClient?.clear();
  });

  return {
    getQueryClient: () => queryClient!,
  };
};

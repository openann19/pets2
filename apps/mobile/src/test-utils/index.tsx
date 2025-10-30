/**
 * Custom test utilities for PawfectMatch Mobile
 *
 * Provides custom render functions and utilities for testing.
 */

import { ThemeProvider } from '@mobile/src/theme';
import { NavigationContainer } from '@react-navigation/native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { RenderOptions } from '@testing-library/react-native';
import { render } from '@testing-library/react-native';
import React from 'react';

// Test theme is now provided by the canonical theme system

// Query client for React Query testing
const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  });

// Custom render function with providers
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  queryClient?: QueryClient;
  includeNavigation?: boolean;
}

export function customRender(component: React.ReactElement, options: CustomRenderOptions = {}) {
  const {
    queryClient = createTestQueryClient(),
    includeNavigation = true,
    ...renderOptions
  } = options;

  const AllTheProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const content = (
      <QueryClientProvider client={queryClient}>
        <ThemeProvider scheme="light">{children}</ThemeProvider>
      </QueryClientProvider>
    );

    if (includeNavigation) {
      return <NavigationContainer>{content}</NavigationContainer>;
    }

    return content;
  };

  return render(component, {
    wrapper: AllTheProviders,
    ...renderOptions,
  });
}

// Re-export everything from testing library
export * from '@testing-library/react-native';

// Override render with custom render
export { customRender as render };

// Test setup helpers
export const TestSetup = {
  setup: () => {
    // Setup for tests
  },

  teardown: () => {
    // Cleanup for tests
  },
};

// Mock utilities
export const MockUtils = {
  // Generate test data
  generateTestData: {
    user: (overrides = {}) => ({
      id: 'test-user-id',
      email: 'test@example.com',
      name: 'Test User',
      avatar: 'https://example.com/avatar.jpg',
      ...overrides,
    }),

    pet: (overrides = {}) => ({
      id: 'test-pet-id',
      name: 'Buddy',
      breed: 'Golden Retriever',
      age: 3,
      photos: ['https://example.com/pet1.jpg'],
      ownerId: 'test-user-id',
      ...overrides,
    }),
  },

  // Mock API responses
  mockApiResponse: (data: any) => ({
    success: true,
    data,
  }),

  mockApiError: (message = 'Error occurred') => ({
    success: false,
    message,
  }),

  match: (overrides = {}) => ({
    id: 'test-match-id',
    userId: 'test-user-id',
    petId: 'test-pet-id',
    matchedUserId: 'matched-user-id',
    matchedPetId: 'matched-pet-id',
    timestamp: Date.now(),
    status: 'active',
    ...overrides,
  }),

  message: (overrides = {}) => ({
    id: 'test-message-id',
    matchId: 'test-match-id',
    senderId: 'test-user-id',
    text: 'Test message',
    timestamp: Date.now(),
    read: false,
    ...overrides,
  }),

  notification: (overrides = {}) => ({
    id: 'test-notification-id',
    userId: 'test-user-id',
    type: 'match',
    title: 'New Match!',
    body: 'You have a new match',
    timestamp: Date.now(),
    read: false,
    ...overrides,
  }),
};

export const NavigationMocks = {
  createMockNavigation: () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
    replace: jest.fn(),
    push: jest.fn(),
    pop: jest.fn(),
    popToTop: jest.fn(),
    setParams: jest.fn(),
    dispatch: jest.fn(),
    setOptions: jest.fn(),
    isFocused: jest.fn(() => true),
    canGoBack: jest.fn(() => true),
    addListener: jest.fn(() => jest.fn()),
    removeListener: jest.fn(),
  }),

  createMockRoute: (params = {}) => ({
    key: 'test-route-key',
    name: 'TestScreen',
    params,
  }),
};

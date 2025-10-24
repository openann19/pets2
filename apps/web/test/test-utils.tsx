/**
 * Shared Test Utilities for PawfectMatch Web App
 * Provides centralized testing helpers and Jest-Chai compatibility
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { type RenderOptions, type RenderResult, render } from '@testing-library/react';
import { type ReactElement, type ReactNode } from 'react';
import { MemoryRouter } from 'react-router-dom';

// Re-export testing utilities and expect adapters
export { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
export { userEvent } from '@testing-library/user-event';

// Re-export safe DOM functions and assertion adapters from expectAdapters
export {
  assertElement,
  assertHTMLElement,
  expect,
  expectContains,
  expectDeepEqual,
  expectEqual,
  expectHasClass,
  expectInDocument,
  expectNotContains,
  expectNotEqual,
  expectNotHasClass,
  expectNotInDocument,
  expectNotThrows,
  expectThrows,
  safeGetAttribute,
  safeGetTextContent,
  safeQuerySelector,
  safeQuerySelectorAll
} from './expectAdapters';

// Mock QueryClient for tests
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

// Provider wrapper for common providers
interface TestProvidersProps {
  children: ReactNode;
  router?: boolean;
  queryClient?: QueryClient;
  initialEntries?: string[];
}

const TestProviders = ({
  children,
  router = true,
  queryClient = createTestQueryClient(),
  initialEntries = ['/']
}: TestProvidersProps) => {
  let content = children;

  // Wrap with QueryClientProvider
  content = (
    <QueryClientProvider client={queryClient}>
      {content}
    </QueryClientProvider>
  );

  // Wrap with Router if needed
  if (router) {
    content = (
      <MemoryRouter initialEntries={initialEntries}>
        {content}
      </MemoryRouter>
    );
  }

  return <>{content}</>;
};

// Enhanced render function with providers
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  router?: boolean;
  queryClient?: QueryClient;
  initialEntries?: string[];
}

export const renderWithProviders = (
  ui: ReactElement,
  options: CustomRenderOptions = {}
): RenderResult => {
  const {
    router = true,
    queryClient = createTestQueryClient(),
    initialEntries = ['/'],
    ...renderOptions
  } = options;

  const Wrapper = ({ children }: { children: ReactNode }) => (
    <TestProviders
      router={router}
      queryClient={queryClient}
      initialEntries={initialEntries}
    >
      {children}
    </TestProviders>
  );

  return render(ui, { wrapper: Wrapper, ...renderOptions });
};


// Mock implementations
export const mockNotification = {
  permission: 'granted' as 'default' | 'granted' | 'denied',
  requestPermission: jest.fn().mockResolvedValue('granted'),
  showNotification: jest.fn(),
  close: jest.fn(),
  onclick: jest.fn(),
  onclose: jest.fn(),
  onerror: jest.fn(),
  onshow: jest.fn(),
};

export const mockLogger = {
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
};

export const mockApiService = {
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
  patch: jest.fn(),
  fetchRecommendations: jest.fn(),
  updateDeviceToken: jest.fn(),
  getNotificationSettings: jest.fn(),
  updateNotificationSettings: jest.fn(),
};

// Test data factories
export const createMockUser = (overrides = {}) => ({
  id: 'user-123',
  email: 'test@example.com',
  name: 'Test User',
  avatar: 'https://example.com/avatar.jpg',
  isPremium: false,
  createdAt: new Date().toISOString(),
  ...overrides,
});

export const createMockPet = (overrides = {}) => ({
  id: 'pet-123',
  name: 'Buddy',
  breed: 'Golden Retriever',
  age: 3,
  photos: ['https://example.com/photo1.jpg'],
  bio: 'A friendly dog looking for a home',
  ownerId: 'user-123',
  ...overrides,
});

export const createMockMatch = (overrides = {}) => ({
  id: 'match-123',
  petId: 'pet-123',
  userId: 'user-123',
  matchedAt: new Date().toISOString(),
  isActive: true,
  ...overrides,
});

// Cleanup helper
export const cleanupTest = () => {
  jest.clearAllMocks();
  jest.restoreAllMocks();
};

// Default export
export default {
  renderWithProviders,
  mockNotification,
  mockLogger,
  mockApiService,
  createMockUser,
  createMockPet,
  createMockMatch,
  cleanupTest,
};

/**
 * Auth Store mock for testing
 * Matches the actual useAuthStore interface from stores/useAuthStore.ts
 */
import type { User } from '@pawfectmatch/core';
import type { AuthState } from '../../stores/useAuthStore';

// Default mock user matching User type
const mockUser: User = {
  _id: 'user123',
  email: 'test@example.com',
  name: 'Test User',
  profileComplete: true,
  subscriptionStatus: 'free',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  photos: [],
  pets: [],
} as User;

// Create mock store state
let mockState: AuthState = {
  user: mockUser,
  accessToken: 'mock-access-token',
  refreshToken: 'mock-refresh-token',
  isLoading: false,
  error: null,
  isAuthenticated: true,
  setUser: jest.fn((user: User | null) => {
    mockState.user = user;
    mockState.isAuthenticated = user !== null;
  }),
  updateUser: jest.fn((user: User) => {
    if (mockState.user) {
      mockState.user = { ...mockState.user, ...user };
    }
  }),
  setTokens: jest.fn((accessToken: string, refreshToken: string) => {
    mockState.accessToken = accessToken;
    mockState.refreshToken = refreshToken;
    mockState.isAuthenticated = true;
  }),
  clearTokens: jest.fn(() => {
    mockState.accessToken = null;
    mockState.refreshToken = null;
    mockState.isAuthenticated = false;
  }),
  logout: jest.fn(() => {
    mockState.user = null;
    mockState.accessToken = null;
    mockState.refreshToken = null;
    mockState.isAuthenticated = false;
    mockState.error = null;
  }),
  setIsLoading: jest.fn((isLoading: boolean) => {
    mockState.isLoading = isLoading;
  }),
  setError: jest.fn((error: string | null) => {
    mockState.error = error;
  }),
};

// Create store mock that returns the current state
export const useAuthStore = jest.fn<AuthState, []>(() => mockState);

// Helper to reset mock state
export const __resetAuthStoreMock = (): void => {
  mockState = {
    user: mockUser,
    accessToken: 'mock-access-token',
    refreshToken: 'mock-refresh-token',
    isLoading: false,
    error: null,
    isAuthenticated: true,
    setUser: jest.fn((user: User | null) => {
      mockState.user = user;
      mockState.isAuthenticated = user !== null;
    }),
    updateUser: jest.fn((user: User) => {
      if (mockState.user) {
        mockState.user = { ...mockState.user, ...user };
      }
    }),
    setTokens: jest.fn((accessToken: string, refreshToken: string) => {
      mockState.accessToken = accessToken;
      mockState.refreshToken = refreshToken;
      mockState.isAuthenticated = true;
    }),
    clearTokens: jest.fn(() => {
      mockState.accessToken = null;
      mockState.refreshToken = null;
      mockState.isAuthenticated = false;
    }),
    logout: jest.fn(() => {
      mockState.user = null;
      mockState.accessToken = null;
      mockState.refreshToken = null;
      mockState.isAuthenticated = false;
      mockState.error = null;
    }),
    setIsLoading: jest.fn((isLoading: boolean) => {
      mockState.isLoading = isLoading;
    }),
    setError: jest.fn((error: string | null) => {
      mockState.error = error;
    }),
  };
  
  // Reset all jest mocks
  Object.values(mockState).forEach((value) => {
    if (jest.isMockFunction(value)) {
      value.mockClear();
    }
  });
};

export default { useAuthStore, __resetAuthStoreMock };

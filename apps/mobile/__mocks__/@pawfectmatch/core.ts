import type { AuthState } from '@pawfectmatch/core';

const actualCore = jest.requireActual<typeof import('@pawfectmatch/core')>(
  '@pawfectmatch/core',
);

const createDefaultAuthState = (): AuthState => ({
  user: null,
  accessToken: null,
  refreshToken: null,
  isLoading: false,
  error: null,
  isAuthenticated: false,
  isOnboarded: false,
  setUser: jest.fn(),
  setTokens: jest.fn(),
  clearTokens: jest.fn(),
  logout: jest.fn(),
  setIsLoading: jest.fn(),
  setError: jest.fn(),
  setIsOnboarded: jest.fn(),
});

const mockUseAuthStore = jest.fn(() => createDefaultAuthState());

const resetMockAuthStore = () => {
  mockUseAuthStore.mockReset();
  mockUseAuthStore.mockImplementation(() => createDefaultAuthState());
};

resetMockAuthStore();

module.exports = {
  __esModule: true,
  ...actualCore,
  useAuthStore: mockUseAuthStore,
  __mockUseAuthStore: mockUseAuthStore,
  __resetMockAuthStore: resetMockAuthStore,
};

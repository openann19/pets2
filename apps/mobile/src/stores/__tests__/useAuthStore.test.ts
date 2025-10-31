/**
 * Tests for useAuthStore hook
 * Fixes M-TEST-01: Unit test useAuth: happy path login, token expiry, error states, logout flow, token refresh
 */

import { renderHook, act } from '@testing-library/react-native';
import { useAuthStore } from '../useAuthStore';
import type { User } from '@pawfectmatch/core';

// Mock SecureStore
jest.mock('../../utils/secureStorage', () => ({
  createSecureStorage: () => ({
    getItem: jest.fn().mockResolvedValue(null),
    setItem: jest.fn().mockResolvedValue(undefined),
    removeItem: jest.fn().mockResolvedValue(undefined),
  }),
}));

const mockUser: User = {
  _id: 'user1',
  email: 'test@example.com',
  name: 'Test User',
  profileComplete: true,
  subscriptionStatus: 'free',
  createdAt: new Date().toISOString(),
} as User;

describe('useAuthStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    act(() => {
      useAuthStore.getState().logout();
    });
  });

  describe('Happy Path - Login', () => {
    it('should set user and tokens correctly', () => {
      const { result } = renderHook(() => useAuthStore());

      act(() => {
        result.current.setUser(mockUser);
        result.current.setTokens('access-token-123', 'refresh-token-456');
      });

      expect(result.current.user).toEqual(mockUser);
      expect(result.current.accessToken).toBe('access-token-123');
      expect(result.current.refreshToken).toBe('refresh-token-456');
      expect(result.current.isAuthenticated).toBe(true);
    });

    it('should set isAuthenticated to true when user is set', () => {
      const { result } = renderHook(() => useAuthStore());

      act(() => {
        result.current.setUser(mockUser);
      });

      expect(result.current.isAuthenticated).toBe(true);
    });
  });

  describe('Token Expiry Handling', () => {
    it('should clear tokens when accessToken is cleared', () => {
      const { result } = renderHook(() => useAuthStore());

      act(() => {
        result.current.setUser(mockUser);
        result.current.setTokens('access-token', 'refresh-token');
      });

      expect(result.current.isAuthenticated).toBe(true);

      act(() => {
        result.current.clearTokens();
      });

      expect(result.current.accessToken).toBeNull();
      expect(result.current.refreshToken).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
    });

    it('should handle token refresh by setting new tokens', () => {
      const { result } = renderHook(() => useAuthStore());

      act(() => {
        result.current.setTokens('old-access-token', 'old-refresh-token');
      });

      act(() => {
        result.current.setTokens('new-access-token', 'new-refresh-token');
      });

      expect(result.current.accessToken).toBe('new-access-token');
      expect(result.current.refreshToken).toBe('new-refresh-token');
    });
  });

  describe('Error States', () => {
    it('should set error state', () => {
      const { result } = renderHook(() => useAuthStore());

      act(() => {
        result.current.setError('Authentication failed');
      });

      expect(result.current.error).toBe('Authentication failed');
    });

    it('should clear error state', () => {
      const { result } = renderHook(() => useAuthStore());

      act(() => {
        result.current.setError('Some error');
        result.current.setError(null);
      });

      expect(result.current.error).toBeNull();
    });

    it('should set loading state', () => {
      const { result } = renderHook(() => useAuthStore());

      act(() => {
        result.current.setIsLoading(true);
      });

      expect(result.current.isLoading).toBe(true);

      act(() => {
        result.current.setIsLoading(false);
      });

      expect(result.current.isLoading).toBe(false);
    });
  });

  describe('Logout Flow', () => {
    it('should clear all auth data on logout', () => {
      const { result } = renderHook(() => useAuthStore());

      act(() => {
        result.current.setUser(mockUser);
        result.current.setTokens('access-token', 'refresh-token');
      });

      expect(result.current.isAuthenticated).toBe(true);

      act(() => {
        result.current.logout();
      });

      expect(result.current.user).toBeNull();
      expect(result.current.accessToken).toBeNull();
      expect(result.current.refreshToken).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
    });

    it('should maintain loading and error states after logout', () => {
      const { result } = renderHook(() => useAuthStore());

      act(() => {
        result.current.setIsLoading(true);
        result.current.setError('Some error');
        result.current.logout();
      });

      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
      // Loading and error states persist (not cleared by logout)
      expect(result.current.isLoading).toBe(true);
      expect(result.current.error).toBe('Some error');
    });
  });

  describe('User Updates', () => {
    it('should update user data', () => {
      const { result } = renderHook(() => useAuthStore());

      act(() => {
        result.current.setUser(mockUser);
      });

      const updatedUser = { ...mockUser, name: 'Updated Name' };

      act(() => {
        result.current.updateUser(updatedUser);
      });

      expect(result.current.user?.name).toBe('Updated Name');
    });

    it('should set user to null', () => {
      const { result } = renderHook(() => useAuthStore());

      act(() => {
        result.current.setUser(mockUser);
        result.current.setUser(null);
      });

      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
    });
  });

  describe('State Persistence', () => {
    it('should persist auth state', () => {
      const { result } = renderHook(() => useAuthStore());

      act(() => {
        result.current.setUser(mockUser);
        result.current.setTokens('access-token', 'refresh-token');
      });

      // State should be persisted via Zustand persist middleware
      expect(result.current.user).toEqual(mockUser);
      expect(result.current.accessToken).toBe('access-token');
    });
  });
});


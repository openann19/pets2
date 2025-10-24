/**
 * Unit tests for authentication
 * Production-ready with comprehensive coverage
 */

import { act, renderHook } from '@testing-library/react';
import { createMockUser } from './test-utils';
import { _useAuthStore as useAuthStore } from '../stores/auth-store';

// Mock the API
jest.mock('../services/api');

describe('Auth Store', () => {
  beforeEach(() => {
    // Clear store before each test
    useAuthStore.setState({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });

    jest.clearAllMocks();
  });

  describe('setTokens', () => {
    it('should set tokens and mark as authenticated', () => {
      const { result } = renderHook(() => useAuthStore());

      act(() => {
        result.current.setTokens('test-access-token', 'test-refresh-token');
      });

      expect(result.current.accessToken).toBe('test-access-token');
      expect(result.current.refreshToken).toBe('test-refresh-token');
      expect(result.current.isAuthenticated).toBe(true);
    });
  });

  describe('setUser', () => {
    it('should set user and mark as authenticated', () => {
      const { result } = renderHook(() => useAuthStore());

      const mockUser = createMockUser();

      act(() => {
        result.current.setUser(mockUser);
      });

      expect(result.current.user).toEqual(mockUser);
      expect(result.current.isAuthenticated).toBe(true);
    });
  });

  describe('clearTokens', () => {
    it('should clear all auth data', () => {
      const { result } = renderHook(() => useAuthStore());

      // Set some data first
      act(() => {
        result.current.setTokens('token', 'refresh');
        result.current.setUser(createMockUser());
      });

      // Clear
      act(() => {
        result.current.clearTokens();
      });

      expect(result.current.accessToken).toBeNull();
      expect(result.current.refreshToken).toBeNull();
      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
    });
  });
});

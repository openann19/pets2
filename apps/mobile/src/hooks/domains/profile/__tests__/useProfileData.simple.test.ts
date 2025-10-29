/**
 * Tests for useProfileData hook - Minimal version
 *
 * Covers:
 * - Basic hook initialization and structure
 * - User data from auth store
 * - Function availability
 */

import { renderHook, act } from '@testing-library/react-native';

// Mock auth store from core
jest.mock('@pawfectmatch/core', () => ({
  useAuthStore: () => ({
    user: {
      _id: "user123",
      firstName: "John",
      lastName: "Doe",
      email: "john@example.com",
    },
  }),
  logger: {
    info: jest.fn(),
    error: jest.fn(),
  },
}));

import { useProfileData } from '../useProfileData';

describe('useProfileData', () => {
  describe('Initialization', () => {
    it('should initialize with user data from auth store', async () => {
      const { result } = renderHook(() => useProfileData());

      // Wait for any async initialization to complete
      await act(async () => {
        // Allow time for useEffect to run
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      expect(result.current.user).toEqual({
        _id: "user123",
        firstName: "John",
        lastName: "Doe",
        email: "john@example.com",
      });
      expect(result.current.pets).toEqual([]);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('should provide refreshProfile function', () => {
      const { result } = renderHook(() => useProfileData());

      expect(typeof result.current.refreshProfile).toBe('function');
    });

    it('should return all required properties', () => {
      const { result } = renderHook(() => useProfileData());

      expect(result.current).toHaveProperty('user');
      expect(result.current).toHaveProperty('pets');
      expect(result.current).toHaveProperty('isLoading');
      expect(result.current).toHaveProperty('error');
      expect(result.current).toHaveProperty('refreshProfile');
    });
  });

  describe('Function Stability', () => {
    it('should return stable function references', () => {
      const { result, rerender } = renderHook(() => useProfileData());

      const initialRefresh = result.current.refreshProfile;

      rerender();

      expect(result.current.refreshProfile).toBe(initialRefresh);
    });
  });
});

/**
 * Tests for useProfileUpdate hook - Simplified version
 *
 * Covers:
 * - Profile data updates
 * - Loading states and error handling
 * - Auth store integration
 */

// Mock React Native Alert
jest.mock('react-native', () => ({
  Alert: {
    alert: jest.fn(),
  },
}));

// Mock auth store from core
jest.mock('@pawfectmatch/core', () => ({
  useAuthStore: () => ({
    user: { _id: 'user123', firstName: 'John' },
    updateUser: jest.fn(),
  }),
  logger: {
    info: jest.fn(),
    error: jest.fn(),
  },
}));

import { renderHook, act } from '@testing-library/react-native';
import { useProfileUpdate } from '../useProfileUpdate';

describe('useProfileUpdate', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Initialization', () => {
    it('should initialize with default state', () => {
      const { result } = renderHook(() => useProfileUpdate());

      expect(result.current.isUpdating).toBe(false);
      expect(result.current.error).toBeNull();
      expect(typeof result.current.updateProfile).toBe('function');
    });
  });

  describe('Profile Updates', () => {
    it('should successfully update profile', async () => {
      const { result } = renderHook(() => useProfileUpdate());

      const updateData = {
        firstName: 'Jane',
        lastName: 'Doe',
      };

      let success: boolean;
      await act(async () => {
        success = await result.current.updateProfile(updateData);
      });

      expect(success).toBe(true);
      expect(result.current.isUpdating).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('should manage loading state during update', async () => {
      const { result } = renderHook(() => useProfileUpdate());

      expect(result.current.isUpdating).toBe(false);

      const updatePromise = result.current.updateProfile({ firstName: 'Jane' });

      // Should be loading immediately
      expect(result.current.isUpdating).toBe(true);

      await act(async () => {
        await updatePromise;
      });

      expect(result.current.isUpdating).toBe(false);
    });
  });

  describe('Function Stability', () => {
    it('should return stable function references', () => {
      const { result, rerender } = renderHook(() => useProfileUpdate());

      const initialUpdateProfile = result.current.updateProfile;

      rerender();

      // Functions should be stable (same reference)
      expect(result.current.updateProfile).toBe(initialUpdateProfile);
    });
  });
});

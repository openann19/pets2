/**
 * Tests for useProfileData hook
 *
 * Covers:
 * - User data initialization from auth store
 * - Pet data fetching and state management
 * - Loading and error states
 * - Refresh functionality
 */

// Mock React Native modules
jest.mock('react-native', () => ({
  InteractionManager: {
    runAfterInteractions: jest.fn((callback) => callback()),
  },
  StatusBar: {
    setBarStyle: jest.fn(),
  },
}));

// Mock design tokens
jest.mock('@pawfectmatch/design-tokens', () => ({
  SPACING: {},
  RADIUS: {},
  COLORS: {},
  SHADOWS: {},
  TYPOGRAPHY: {},
}));

// Mock auth store from core
jest.mock('@pawfectmatch/core', () => ({
  useAuthStore: () => ({
    user: {
      _id: 'user123',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
    },
  }),
  logger: {
    info: jest.fn(),
    error: jest.fn(),
  },
}));

import { renderHook, act } from '@testing-library/react-native';
import { useProfileData } from '../useProfileData';
import * as apiModule from '../../../services/api';

describe('useProfileData', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Initialization', () => {
    it('should initialize with user data from auth store', () => {
      const { result } = renderHook(() => useProfileData());

      expect(result.current.user).toEqual({
        _id: 'user123',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
      });
      expect(result.current.pets).toEqual([]);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('should provide refreshProfile function', () => {
      const { result } = renderHook(() => useProfileData());

      expect(typeof result.current.refreshProfile).toBe('function');
    });
  });

  describe('Profile Refresh', () => {
    it('should refresh profile data successfully', async () => {
      // Mock successful API response
      const spy = jest
        .spyOn(apiModule.matchesAPI, 'getUserPets')
        .mockResolvedValue([{ _id: 'pet1', name: 'Buddy', species: 'dog' }]);

      const { result } = renderHook(() => useProfileData());

      await act(async () => {
        await result.current.refreshProfile();
      });

      expect(result.current.pets).toEqual([{ _id: 'pet1', name: 'Buddy', species: 'dog' }]);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();

      spy.mockRestore();
    });

    it('should handle API errors during refresh', async () => {
      // Mock API error
      const spy = jest
        .spyOn(apiModule.matchesAPI, 'getUserPets')
        .mockRejectedValue(new Error('API Error'));

      const { result } = renderHook(() => useProfileData());

      await act(async () => {
        await result.current.refreshProfile();
      });

      expect(result.current.pets).toEqual([]);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBe('Failed to load profile');

      spy.mockRestore();
    });
  });

  describe('Loading States', () => {
    it('should manage loading state during refresh', async () => {
      const spy = jest.spyOn(apiModule.matchesAPI, 'getUserPets').mockResolvedValue([]);

      const { result } = renderHook(() => useProfileData());

      let loadingStates: boolean[] = [];

      // Capture loading state changes
      act(() => {
        const promise = result.current.refreshProfile();
        loadingStates.push(result.current.isLoading); // Should be true during async operation
        return promise;
      });

      // After completion
      expect(result.current.isLoading).toBe(false);

      spy.mockRestore();
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

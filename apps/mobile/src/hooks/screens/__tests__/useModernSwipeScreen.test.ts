/**
 * Comprehensive tests for useModernSwipeScreen hook
 *
 * Coverage:
 * - Pet loading and filtering
 * - Swipe actions (like/pass/superlike)
 * - Match modal handling
 * - Filter management
 * - State management
 * - Error handling
 */

import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useModernSwipeScreen } from '../useModernSwipeScreen';
import { useAuthStore } from '@pawfectmatch/core';
import { matchesAPI } from '../../../services/api';
import { logger } from '@pawfectmatch/core';

// Mock dependencies
jest.mock('@pawfectmatch/core', () => ({
  ...jest.requireActual('@pawfectmatch/core'),
  useAuthStore: jest.fn(),
  logger: {
    info: jest.fn(),
    error: jest.fn(),
  },
}));

jest.mock('../../../services/api', () => ({
  matchesAPI: {
    getPets: jest.fn(),
    createMatch: jest.fn(),
    swipePet: jest.fn(),
  },
}));

const mockUseAuthStore = useAuthStore as jest.MockedFunction<typeof useAuthStore>;
const mockGetPets = matchesAPI.getPets as jest.MockedFunction<typeof matchesAPI.getPets>;
const mockCreateMatch = matchesAPI.createMatch as jest.MockedFunction<
  typeof matchesAPI.createMatch
>;
const mockSwipePet = matchesAPI.swipePet as jest.MockedFunction<typeof matchesAPI.swipePet>;

const mockPets = [
  { _id: 'pet-1', name: 'Buddy', species: 'dog', photos: [] },
  { _id: 'pet-2', name: 'Max', species: 'cat', photos: [] },
  { _id: 'pet-3', name: 'Luna', species: 'dog', photos: [] },
] as any;

const mockMatch = { _id: 'match-1', pets: mockPets.slice(0, 2) };

describe('useModernSwipeScreen Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockUseAuthStore.mockReturnValue({
      user: { _id: 'user-123' } as any,
    } as any);

    mockGetPets.mockResolvedValue(mockPets);
    mockCreateMatch.mockResolvedValue(mockMatch as any);
    mockSwipePet.mockResolvedValue(undefined);
  });

  afterEach(() => {
    jest.clearAllTimers();
  });

  describe('Initialization', () => {
    it('should initialize with default values', () => {
      const { result } = renderHook(() => useModernSwipeScreen());

      expect(result.current.pets).toEqual([]);
      expect(result.current.currentPet).toBeNull();
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(result.current.currentIndex).toBe(0);
      expect(result.current.showMatchModal).toBe(false);
      expect(result.current.matchedPet).toBeNull();
      expect(result.current.showFilters).toBe(false);
    });

    it('should initialize filters with default values', () => {
      const { result } = renderHook(() => useModernSwipeScreen());

      expect(result.current.filters).toEqual({
        breed: '',
        species: '',
        size: '',
        maxDistance: 25,
      });
    });
  });

  describe('Load Pets', () => {
    it('should load pets successfully', async () => {
      const { result } = renderHook(() => useModernSwipeScreen());

      await act(async () => {
        await result.current.loadPets();
      });

      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(result.current.pets).toEqual(mockPets);
      expect(mockGetPets).toHaveBeenCalled();
    });

    it('should handle loading state correctly', async () => {
      mockGetPets.mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve(mockPets), 100)),
      );

      const { result } = renderHook(() => useModernSwipeScreen());

      act(() => {
        result.current.loadPets();
      });

      expect(result.current.isLoading).toBe(true);

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
    });

    it('should handle error when loading fails', async () => {
      const errorMessage = 'Network error';
      mockGetPets.mockRejectedValue(new Error(errorMessage));

      const { result } = renderHook(() => useModernSwipeScreen());

      await act(async () => {
        await result.current.loadPets();
      });

      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBe(errorMessage);
      expect(result.current.pets).toEqual([]);
    });

    it('should use filters when loading pets', async () => {
      const { result } = renderHook(() => useModernSwipeScreen());

      act(() => {
        result.current.setFilters({
          breed: 'Golden Retriever',
          species: 'dog',
          size: 'large',
          maxDistance: 50,
        });
      });

      await act(async () => {
        await result.current.loadPets();
      });

      expect(mockGetPets).toHaveBeenCalledWith({
        breed: 'Golden Retriever',
        species: 'dog',
        size: 'large',
        maxDistance: 50,
      });
    });
  });

  describe('Swipe Actions', () => {
    it('should handle swipe right (like)', async () => {
      const { result } = renderHook(() => useModernSwipeScreen());

      await act(async () => {
        await result.current.loadPets();
      });

      const currentPet = result.current.pets[0];

      await act(async () => {
        result.current.handleSwipeRight(currentPet);
      });

      expect(mockCreateMatch).toHaveBeenCalledWith('user-123', currentPet._id);
    });

    it('should handle swipe left (pass)', async () => {
      const { result } = renderHook(() => useModernSwipeScreen());

      await act(async () => {
        await result.current.loadPets();
      });

      const currentPet = result.current.pets[0];

      await act(async () => {
        result.current.handleSwipeLeft(currentPet);
      });

      expect(mockSwipePet).toHaveBeenCalledWith(currentPet._id, 'pass');
    });

    it('should handle swipe up (superlike)', async () => {
      const { result } = renderHook(() => useModernSwipeScreen());

      await act(async () => {
        await result.current.loadPets();
      });

      const currentPet = result.current.pets[0];

      await act(async () => {
        result.current.handleSwipeUp(currentPet);
      });

      expect(mockCreateMatch).toHaveBeenCalledWith('user-123', currentPet._id);
    });

    it('should handle button swipe actions', async () => {
      const { result } = renderHook(() => useModernSwipeScreen());

      await act(async () => {
        await result.current.loadPets();
      });

      await act(async () => {
        result.current.handleButtonSwipe('like');
      });

      expect(mockSwipePet).toHaveBeenCalledWith(expect.any(String), 'like');
    });

    it('should show match modal on successful match', async () => {
      const { result } = renderHook(() => useModernSwipeScreen());

      await act(async () => {
        await result.current.loadPets();
      });

      const currentPet = result.current.pets[0];

      await act(async () => {
        result.current.handleSwipeRight(currentPet);
      });

      expect(result.current.showMatchModal).toBe(true);
      expect(result.current.matchedPet).toEqual(currentPet);
    });
  });

  describe('State Management', () => {
    it('should update current index', () => {
      const { result } = renderHook(() => useModernSwipeScreen());

      act(() => {
        result.current.setCurrentIndex(2);
      });

      expect(result.current.currentIndex).toBe(2);
    });

    it('should toggle match modal', () => {
      const { result } = renderHook(() => useModernSwipeScreen());

      act(() => {
        result.current.setShowMatchModal(true);
      });

      expect(result.current.showMatchModal).toBe(true);

      act(() => {
        result.current.setShowMatchModal(false);
      });

      expect(result.current.showMatchModal).toBe(false);
    });

    it('should toggle filters panel', () => {
      const { result } = renderHook(() => useModernSwipeScreen());

      act(() => {
        result.current.setShowFilters(true);
      });

      expect(result.current.showFilters).toBe(true);

      act(() => {
        result.current.setShowFilters(false);
      });

      expect(result.current.showFilters).toBe(false);
    });

    it('should update filters', () => {
      const { result } = renderHook(() => useModernSwipeScreen());

      const newFilters = {
        breed: 'Poodle',
        species: 'dog',
        size: 'medium',
        maxDistance: 30,
      };

      act(() => {
        result.current.setFilters(newFilters);
      });

      expect(result.current.filters).toEqual(newFilters);
    });
  });

  describe('Filter Management', () => {
    it('should reload pets when filters change', async () => {
      const { result } = renderHook(() => useModernSwipeScreen());

      const newFilters = {
        breed: 'Labrador',
        species: 'dog',
        size: 'large',
        maxDistance: 40,
      };

      act(() => {
        result.current.setFilters(newFilters);
      });

      await waitFor(() => {
        expect(mockGetPets).toHaveBeenCalledWith(newFilters);
      });
    });

    it('should maintain previous filters on error', async () => {
      mockGetPets.mockRejectedValueOnce(new Error('Filter error'));

      const { result } = renderHook(() => useModernSwipeScreen());

      const newFilters = {
        breed: 'Poodle',
        species: 'dog',
        size: 'small',
        maxDistance: 20,
      };

      act(() => {
        result.current.setFilters(newFilters);
      });

      await waitFor(() => {
        expect(result.current.error).toBeDefined();
      });

      expect(result.current.filters).toEqual(newFilters);
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors gracefully', async () => {
      mockGetPets.mockRejectedValue(new Error('Network error'));

      const { result } = renderHook(() => useModernSwipeScreen());

      await act(async () => {
        await result.current.loadPets();
      });

      expect(result.current.error).toBe('Network error');
      expect(result.current.pets).toEqual([]);
      expect(result.current.isLoading).toBe(false);
    });

    it('should handle API errors without user ID', async () => {
      mockUseAuthStore.mockReturnValue({
        user: null,
      } as any);

      const { result } = renderHook(() => useModernSwipeScreen());

      await act(async () => {
        await result.current.loadPets();
      });

      const currentPet = result.current.pets[0];

      await act(async () => {
        result.current.handleSwipeRight(currentPet);
      });

      expect(mockCreateMatch).not.toHaveBeenCalled();
    });

    it('should handle missing pet ID', async () => {
      const { result } = renderHook(() => useModernSwipeScreen());

      await act(async () => {
        await result.current.loadPets();
      });

      const incompletePet = {} as any;

      await act(async () => {
        result.current.handleSwipeRight(incompletePet);
      });

      expect(mockCreateMatch).not.toHaveBeenCalled();
    });
  });

  describe('Current Pet Management', () => {
    it('should update current pet based on index', () => {
      const { result } = renderHook(() => useModernSwipeScreen());

      act(() => {
        result.current.loadPets();
      });

      act(() => {
        result.current.setCurrentIndex(1);
      });

      expect(result.current.currentPet).toEqual(result.current.pets[1]);
    });

    it('should handle null current pet when index is out of bounds', () => {
      const { result } = renderHook(() => useModernSwipeScreen());

      act(() => {
        result.current.setCurrentIndex(100);
      });

      expect(result.current.currentPet).toBeNull();
    });

    it('should reset current pet when pets array is empty', () => {
      const { result } = renderHook(() => useModernSwipeScreen());

      act(() => {
        result.current.setCurrentIndex(0);
      });

      expect(result.current.currentPet).toBeNull();
    });
  });

  describe('Match Modal', () => {
    it('should close match modal correctly', async () => {
      const { result } = renderHook(() => useModernSwipeScreen());

      await act(async () => {
        await result.current.loadPets();
      });

      await act(async () => {
        const pet = result.current.pets[0];
        result.current.handleSwipeRight(pet);
      });

      expect(result.current.showMatchModal).toBe(true);

      act(() => {
        result.current.setShowMatchModal(false);
      });

      expect(result.current.showMatchModal).toBe(false);
      expect(result.current.matchedPet).toBeNull();
    });

    it('should maintain matched pet data when modal is shown', async () => {
      const { result } = renderHook(() => useModernSwipeScreen());

      await act(async () => {
        await result.current.loadPets();
      });

      const pet = result.current.pets[0];

      await act(async () => {
        result.current.handleSwipeRight(pet);
      });

      expect(result.current.showMatchModal).toBe(true);
      expect(result.current.matchedPet).toEqual(pet);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty pets array', async () => {
      mockGetPets.mockResolvedValue([]);

      const { result } = renderHook(() => useModernSwipeScreen());

      await act(async () => {
        await result.current.loadPets();
      });

      expect(result.current.pets).toEqual([]);
      expect(result.current.currentPet).toBeNull();
    });

    it('should handle null user gracefully', async () => {
      mockUseAuthStore.mockReturnValue({
        user: null,
      } as any);

      const { result } = renderHook(() => useModernSwipeScreen());

      await act(async () => {
        await result.current.loadPets();
      });

      await act(async () => {
        result.current.handleSwipeRight(mockPets[0]);
      });

      expect(mockCreateMatch).not.toHaveBeenCalled();
    });

    it('should handle concurrent swipes', async () => {
      const { result } = renderHook(() => useModernSwipeScreen());

      await act(async () => {
        await result.current.loadPets();
      });

      const pet1 = result.current.pets[0];
      const pet2 = result.current.pets[1];

      await act(async () => {
        await Promise.all([
          result.current.handleSwipeRight(pet1),
          result.current.handleSwipeLeft(pet2),
        ]);
      });

      expect(mockCreateMatch).toHaveBeenCalled();
      expect(mockSwipePet).toHaveBeenCalled();
    });

    it('should handle swipe actions when pets are loading', async () => {
      const { result } = renderHook(() => useModernSwipeScreen());

      act(() => {
        result.current.handleSwipeRight(mockPets[0]);
      });

      expect(mockCreateMatch).not.toHaveBeenCalled();
    });
  });
});

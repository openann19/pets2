import { renderHook, act } from '@testing-library/react';
import { useAuthStore } from '../useAuthStore';
import { useUIStore } from '../useUIStore';
import { useMatchStore } from '../useMatchStore';

// Mock localStorage for auth store persistence
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('Zustand Stores', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    localStorageMock.getItem.mockClear();
    localStorageMock.setItem.mockClear();
    localStorageMock.removeItem.mockClear();
  });

  describe('useAuthStore', () => {
    it('should initialize with default state', () => {
      const { result } = renderHook(() => useAuthStore());

      expect(result.current.user).toBeNull();
      expect(result.current.accessToken).toBeNull();
      expect(result.current.refreshToken).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.isLoading).toBe(false);
    });

    it('should set tokens', () => {
      const { result } = renderHook(() => useAuthStore());

      act(() => {
        result.current.setTokens('access-token', 'refresh-token');
      });

      expect(result.current.accessToken).toBe('access-token');
      expect(result.current.refreshToken).toBe('refresh-token');
    });

    it('should clear tokens on logout', () => {
      const { result } = renderHook(() => useAuthStore());

      // First set tokens
      act(() => {
        result.current.setTokens('access-token', 'refresh-token');
      });

      // Then logout
      act(() => {
        result.current.logout();
      });

      expect(result.current.user).toBeNull();
      expect(result.current.accessToken).toBeNull();
      expect(result.current.refreshToken).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
    });
  });

  describe('useUIStore', () => {
    it('should initialize with default state', () => {
      const { result } = renderHook(() => useUIStore());

      expect(result.current.modal).toEqual({ type: null });
      expect(result.current.toasts).toEqual([]);
      expect(result.current.darkMode).toBe(false);
    });

    it('should open and close modal', () => {
      const { result } = renderHook(() => useUIStore());

      act(() => {
        result.current.openModal('match', { title: 'Test Modal' });
      });

      expect(result.current.modal.type).toBe('match');
      expect(result.current.modal.props).toEqual({ title: 'Test Modal' });

      act(() => {
        result.current.closeModal();
      });

      expect(result.current.modal.type).toBeNull();
    });

    it('should show and remove toasts', () => {
      const { result } = renderHook(() => useUIStore());

      act(() => {
        result.current.showToast({
          type: 'success',
          message: 'Test toast',
          duration: 3000
        });
      });

      expect(result.current.toasts).toHaveLength(1);
      expect(result.current.toasts[0].message).toBe('Test toast');

      const toastId = result.current.toasts[0].id;
      act(() => {
        result.current.removeToast(toastId);
      });

      expect(result.current.toasts).toHaveLength(0);
    });
  });

  describe('useMatchStore', () => {
    it('should initialize with default state', () => {
      const { result } = renderHook(() => useMatchStore());

      expect(result.current.currentPet).toBeNull();
      expect(result.current.matches).toEqual([]);
      expect(result.current.swipePets).toEqual([]);
      expect(result.current.activeMatchId).toBeNull();
      expect(result.current.paginationInfo).toEqual({
        page: 1,
        hasMore: true,
        isLoading: false
      });
      expect(result.current.swipeHistory).toEqual({
        likes: [],
        passes: [],
        superlikes: []
      });
    });

    it('should set current pet', () => {
      const { result } = renderHook(() => useMatchStore());

      act(() => {
        result.current.setCurrentPet('pet-1');
      });

      expect(result.current.currentPet).toBe('pet-1');
    });

    it('should handle swipe history', () => {
      const { result } = renderHook(() => useMatchStore());

      act(() => {
        result.current.addToSwipeHistory('pet-1', 'like');
        result.current.addToSwipeHistory('pet-2', 'pass');
        result.current.addToSwipeHistory('pet-3', 'superlike');
      });

      expect(result.current.swipeHistory.likes).toContain('pet-1');
      expect(result.current.swipeHistory.passes).toContain('pet-2');
      expect(result.current.swipeHistory.superlikes).toContain('pet-3');

      act(() => {
        result.current.clearSwipeHistory();
      });

      expect(result.current.swipeHistory.likes).toHaveLength(0);
      expect(result.current.swipeHistory.passes).toHaveLength(0);
      expect(result.current.swipeHistory.superlikes).toHaveLength(0);
    });

    it('should update pagination info', () => {
      const { result } = renderHook(() => useMatchStore());

      act(() => {
        result.current.setPaginationInfo({
          page: 2,
          hasMore: false,
          isLoading: true,
        });
      });

      expect(result.current.paginationInfo.page).toBe(2);
      expect(result.current.paginationInfo.hasMore).toBe(false);
      expect(result.current.paginationInfo.isLoading).toBe(true);
    });
  });
});

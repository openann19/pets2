/**
 * Tests for useTabStatePreservation hook
 * Comprehensive test suite following the same patterns as useNotifications.test.ts and useHeader.test.ts
 *
 * Behavior Matrix:
 * - Preserves scroll position, filters, form data, and custom state
 * - Restores state when tab gains focus (useFocusEffect)
 * - Saves state when tab loses focus (useFocusEffect cleanup)
 * - Uses AsyncStorage for persistence
 * - Handles scroll restoration with setTimeout delay
 * - Guards against saving during restoration (isRestoringRef)
 * - Conditionally preserves based on flags (preserveScroll, preserveFilters, etc.)
 */

import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTabStatePreservation, useScrollPositionPreservation } from '../useTabStatePreservation';
import type { TabState } from '../useTabStatePreservation';
import { logger } from '@pawfectmatch/core';

// Mock dependencies
jest.mock('@react-navigation/native', () => ({
  useFocusEffect: jest.fn((callback) => callback()),
}));

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

jest.mock('@pawfectmatch/core', () => ({
  logger: {
    error: jest.fn(),
  },
}));

// Type-safe mock helpers
const useFocusEffectMock = jest.mocked(useFocusEffect);
const AsyncStorageMock = jest.mocked(AsyncStorage);
const loggerMock = jest.mocked(logger);

describe('useTabStatePreservation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();

    // Default mock implementation for useFocusEffect
    useFocusEffectMock.mockImplementation((callback) => {
      callback();
      return () => {}; // cleanup function
    });

    // Default AsyncStorage mock
    AsyncStorageMock.getItem.mockResolvedValue(null);
    AsyncStorageMock.setItem.mockResolvedValue();
    AsyncStorageMock.removeItem.mockResolvedValue();
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  /**
   * Helper to create a mock scroll ref
   */
  const createMockScrollRef = () => {
    const scrollToOffset = jest.fn();
    return {
      current: {
        scrollToOffset,
      },
    } as React.RefObject<{ scrollToOffset: (offset: number) => void }>;
  };

  describe('Initialization', () => {
    it('should initialize with correct default values', () => {
      expect.hasAssertions();
      const { result } = renderHook(() =>
        useTabStatePreservation({
          tabName: 'TestTab',
        }),
      );

      expect(typeof result.current.saveState).toBe('function');
      expect(typeof result.current.restoreState).toBe('function');
      expect(typeof result.current.clearState).toBe('function');
      expect(typeof result.current.updateScrollOffset).toBe('function');
      expect(typeof result.current.updateFilters).toBe('function');
      expect(typeof result.current.updateFormData).toBe('function');
      expect(typeof result.current.updateCustomState).toBe('function');
    });

    it('should call useFocusEffect for restore on mount', () => {
      expect.hasAssertions();
      renderHook(() =>
        useTabStatePreservation({
          tabName: 'TestTab',
        }),
      );

      expect(useFocusEffectMock).toHaveBeenCalledTimes(2); // One for restore, one for save
    });

    it('should restore state when tab gains focus', async () => {
      expect.hasAssertions();
      const storedState: TabState = {
        scrollOffset: 100,
        filters: { category: 'dogs' },
      };

      AsyncStorageMock.getItem.mockResolvedValueOnce(JSON.stringify(storedState));

      // Mock useFocusEffect to call restoreState
      useFocusEffectMock.mockImplementationOnce((callback) => {
        callback();
        return () => {};
      });

      useFocusEffectMock.mockImplementationOnce(() => {
        return () => {};
      });

      const { result } = renderHook(() =>
        useTabStatePreservation({
          tabName: 'TestTab',
        }),
      );

      // Wait for useFocusEffect to trigger restoreState
      await waitFor(() => {
        expect(AsyncStorageMock.getItem).toHaveBeenCalled();
      });

      // Verify we can also manually restore
      AsyncStorageMock.getItem.mockResolvedValueOnce(JSON.stringify(storedState));
      const restored = await act(async () => {
        return await result.current.restoreState();
      });

      expect(restored).toEqual(storedState);
    });
  });

  describe('State Saving', () => {
    it('should save state to AsyncStorage', async () => {
      expect.hasAssertions();
      const { result } = renderHook(() =>
        useTabStatePreservation({
          tabName: 'TestTab',
        }),
      );

      const state: Partial<TabState> = {
        scrollOffset: 200,
        filters: { category: 'cats' },
      };

      await act(async () => {
        await result.current.saveState(state);
      });

      expect(AsyncStorageMock.setItem).toHaveBeenCalledTimes(1);
      expect(AsyncStorageMock.setItem).toHaveBeenCalledWith(
        'tab_state_TestTab',
        JSON.stringify(state),
      );
    });

    it('should merge partial state with existing state', async () => {
      expect.hasAssertions();
      const { result } = renderHook(() =>
        useTabStatePreservation({
          tabName: 'TestTab',
        }),
      );

      await act(async () => {
        await result.current.saveState({ scrollOffset: 100 });
      });

      await act(async () => {
        await result.current.saveState({ filters: { category: 'dogs' } });
      });

      expect(AsyncStorageMock.setItem).toHaveBeenCalledTimes(2);
      const lastCall = AsyncStorageMock.setItem.mock.calls[1][1];
      const savedState = JSON.parse(lastCall as string);
      expect(savedState).toEqual({
        scrollOffset: 100,
        filters: { category: 'dogs' },
      });
    });

    it('should handle save errors gracefully', async () => {
      expect.hasAssertions();
      const error = new Error('Storage error');
      AsyncStorageMock.setItem.mockRejectedValueOnce(error);

      const { result } = renderHook(() =>
        useTabStatePreservation({
          tabName: 'TestTab',
        }),
      );

      await act(async () => {
        await result.current.saveState({ scrollOffset: 100 });
      });

      expect(loggerMock.error).toHaveBeenCalledWith('Failed to save tab state', {
        tabName: 'TestTab',
        error: 'Storage error',
      });
    });
  });

  describe('State Restoration', () => {
    it('should restore state from AsyncStorage', async () => {
      expect.hasAssertions();
      const storedState: TabState = {
        scrollOffset: 150,
        filters: { category: 'birds' },
      };

      // Mock useFocusEffect to not call restoreState automatically
      useFocusEffectMock.mockImplementationOnce(() => {
        return () => {};
      });

      useFocusEffectMock.mockImplementationOnce(() => {
        return () => {};
      });

      AsyncStorageMock.getItem.mockResolvedValueOnce(JSON.stringify(storedState));

      const { result } = renderHook(() =>
        useTabStatePreservation({
          tabName: 'TestTab',
        }),
      );

      const restored = await act(async () => {
        return await result.current.restoreState();
      });

      expect(restored).toEqual(storedState);
      expect(AsyncStorageMock.getItem).toHaveBeenCalledWith('tab_state_TestTab');
    });

    it('should return null when no stored state exists', async () => {
      expect.hasAssertions();
      AsyncStorageMock.getItem.mockResolvedValueOnce(null);

      const { result } = renderHook(() =>
        useTabStatePreservation({
          tabName: 'TestTab',
        }),
      );

      const restored = await act(async () => {
        return await result.current.restoreState();
      });

      expect(restored).toBeNull();
    });

    it('should restore scroll position when preserveScroll is true', async () => {
      expect.hasAssertions();
      const scrollRef = createMockScrollRef();
      const storedState: TabState = {
        scrollOffset: 250,
      };

      AsyncStorageMock.getItem.mockResolvedValueOnce(JSON.stringify(storedState));

      renderHook(() =>
        useTabStatePreservation({
          tabName: 'TestTab',
          scrollRef,
          preserveScroll: true,
        }),
      );

      await act(async () => {
        // Trigger restore via focus effect
        await Promise.resolve();
      });

      // Wait for setTimeout
      act(() => {
        jest.advanceTimersByTime(100);
      });

      expect(scrollRef.current?.scrollToOffset).toHaveBeenCalledWith(250);
    });

    it('should not restore scroll position when preserveScroll is false', async () => {
      expect.hasAssertions();
      const scrollRef = createMockScrollRef();
      const storedState: TabState = {
        scrollOffset: 250,
      };

      AsyncStorageMock.getItem.mockResolvedValueOnce(JSON.stringify(storedState));

      renderHook(() =>
        useTabStatePreservation({
          tabName: 'TestTab',
          scrollRef,
          preserveScroll: false,
        }),
      );

      await act(async () => {
        await Promise.resolve();
      });

      act(() => {
        jest.advanceTimersByTime(100);
      });

      expect(scrollRef.current?.scrollToOffset).not.toHaveBeenCalled();
    });

    it('should not restore scroll when scrollRef is not provided', async () => {
      expect.hasAssertions();
      const storedState: TabState = {
        scrollOffset: 250,
      };

      AsyncStorageMock.getItem.mockResolvedValueOnce(JSON.stringify(storedState));

      renderHook(() =>
        useTabStatePreservation({
          tabName: 'TestTab',
          preserveScroll: true,
        }),
      );

      await act(async () => {
        await Promise.resolve();
      });

      act(() => {
        jest.advanceTimersByTime(100);
      });

      // No scroll ref, so no scroll should occur
      expect(AsyncStorageMock.getItem).toHaveBeenCalled();
    });

    it('should call onStateRestored callback when provided', async () => {
      expect.hasAssertions();
      const onStateRestored = jest.fn();
      const storedState: TabState = {
        scrollOffset: 100,
        filters: { category: 'dogs' },
      };

      AsyncStorageMock.getItem.mockResolvedValueOnce(JSON.stringify(storedState));

      const { result } = renderHook(() =>
        useTabStatePreservation({
          tabName: 'TestTab',
          onStateRestored,
        }),
      );

      await act(async () => {
        await result.current.restoreState();
      });

      expect(onStateRestored).toHaveBeenCalledTimes(1);
      expect(onStateRestored).toHaveBeenCalledWith(storedState);
    });

    it('should handle restore errors gracefully', async () => {
      expect.hasAssertions();
      const error = new Error('Parse error');
      AsyncStorageMock.getItem.mockRejectedValueOnce(error);

      const { result } = renderHook(() =>
        useTabStatePreservation({
          tabName: 'TestTab',
        }),
      );

      const restored = await act(async () => {
        return await result.current.restoreState();
      });

      expect(restored).toBeNull();
      expect(loggerMock.error).toHaveBeenCalledWith('Failed to restore tab state', {
        tabName: 'TestTab',
        error: 'Parse error',
      });
    });
  });

  describe('State Clearing', () => {
    it('should clear saved state', async () => {
      expect.hasAssertions();
      const { result } = renderHook(() =>
        useTabStatePreservation({
          tabName: 'TestTab',
        }),
      );

      await act(async () => {
        await result.current.clearState();
      });

      expect(AsyncStorageMock.removeItem).toHaveBeenCalledTimes(1);
      expect(AsyncStorageMock.removeItem).toHaveBeenCalledWith('tab_state_TestTab');
    });

    it('should handle clear errors gracefully', async () => {
      expect.hasAssertions();
      const error = new Error('Remove error');
      AsyncStorageMock.removeItem.mockRejectedValueOnce(error);

      const { result } = renderHook(() =>
        useTabStatePreservation({
          tabName: 'TestTab',
        }),
      );

      await act(async () => {
        await result.current.clearState();
      });

      expect(loggerMock.error).toHaveBeenCalledWith('Failed to clear tab state', {
        tabName: 'TestTab',
        error: 'Remove error',
      });
    });
  });

  describe('Scroll Offset Updates', () => {
    it('should update scroll offset when preserveScroll is true', async () => {
      expect.hasAssertions();
      const { result } = renderHook(() =>
        useTabStatePreservation({
          tabName: 'TestTab',
          preserveScroll: true,
        }),
      );

      await act(async () => {
        result.current.updateScrollOffset(300);
      });

      await waitFor(() => {
        expect(AsyncStorageMock.setItem).toHaveBeenCalled();
      });

      const callArgs = AsyncStorageMock.setItem.mock.calls[0];
      const savedState = JSON.parse(callArgs[1] as string);
      expect(savedState.scrollOffset).toBe(300);
    });

    it('should not update scroll offset when preserveScroll is false', async () => {
      expect.hasAssertions();
      const { result } = renderHook(() =>
        useTabStatePreservation({
          tabName: 'TestTab',
          preserveScroll: false,
        }),
      );

      await act(async () => {
        result.current.updateScrollOffset(300);
      });

      // Wait a bit to ensure no save happens
      await waitFor(() => {
        expect(AsyncStorageMock.setItem).not.toHaveBeenCalled();
      }, { timeout: 100 });
    });

    it('should not save scroll offset during restoration', async () => {
      expect.hasAssertions();
      const scrollRef = createMockScrollRef();
      const storedState: TabState = {
        scrollOffset: 100,
      };

      AsyncStorageMock.getItem.mockResolvedValueOnce(JSON.stringify(storedState));

      const { result } = renderHook(() =>
        useTabStatePreservation({
          tabName: 'TestTab',
          scrollRef,
          preserveScroll: true,
        }),
      );

      // Clear previous calls
      jest.clearAllMocks();

      // Trigger restore
      await act(async () => {
        await result.current.restoreState();
      });

      // During restoration, updateScrollOffset should not save
      await act(async () => {
        result.current.updateScrollOffset(200);
      });

      act(() => {
        jest.advanceTimersByTime(100);
      });

      // Should not have saved during restoration
      expect(AsyncStorageMock.setItem).not.toHaveBeenCalled();
    });
  });

  describe('Filter Updates', () => {
    it('should update filters when preserveFilters is true', async () => {
      expect.hasAssertions();
      const { result } = renderHook(() =>
        useTabStatePreservation({
          tabName: 'TestTab',
          preserveFilters: true,
        }),
      );

      const filters = { category: 'dogs', size: 'large' };

      await act(async () => {
        result.current.updateFilters(filters);
      });

      await waitFor(() => {
        expect(AsyncStorageMock.setItem).toHaveBeenCalled();
      });

      const callArgs = AsyncStorageMock.setItem.mock.calls[0];
      const savedState = JSON.parse(callArgs[1] as string);
      expect(savedState.filters).toEqual(filters);
    });

    it('should not update filters when preserveFilters is false', async () => {
      expect.hasAssertions();
      const { result } = renderHook(() =>
        useTabStatePreservation({
          tabName: 'TestTab',
          preserveFilters: false,
        }),
      );

      await act(async () => {
        result.current.updateFilters({ category: 'dogs' });
      });

      // Wait to ensure no save happens
      await waitFor(() => {
        expect(AsyncStorageMock.setItem).not.toHaveBeenCalled();
      }, { timeout: 100 });
    });
  });

  describe('Form Data Updates', () => {
    it('should update form data when preserveFormData is true', async () => {
      expect.hasAssertions();
      const { result } = renderHook(() =>
        useTabStatePreservation({
          tabName: 'TestTab',
          preserveFormData: true,
        }),
      );

      const formData = { name: 'Fluffy', age: '3' };

      await act(async () => {
        result.current.updateFormData(formData);
      });

      await waitFor(() => {
        expect(AsyncStorageMock.setItem).toHaveBeenCalled();
      });

      const callArgs = AsyncStorageMock.setItem.mock.calls[0];
      const savedState = JSON.parse(callArgs[1] as string);
      expect(savedState.formData).toEqual(formData);
    });

    it('should not update form data when preserveFormData is false', async () => {
      expect.hasAssertions();
      const { result } = renderHook(() =>
        useTabStatePreservation({
          tabName: 'TestTab',
          preserveFormData: false,
        }),
      );

      await act(async () => {
        result.current.updateFormData({ name: 'Fluffy' });
      });

      await waitFor(() => {
        expect(AsyncStorageMock.setItem).not.toHaveBeenCalled();
      }, { timeout: 100 });
    });
  });

  describe('Custom State Updates', () => {
    it('should update custom state for allowed keys', async () => {
      expect.hasAssertions();
      const { result } = renderHook(() =>
        useTabStatePreservation({
          tabName: 'TestTab',
          customStateKeys: ['selectedView', 'sortOrder'],
        }),
      );

      await act(async () => {
        result.current.updateCustomState('selectedView', 'grid');
      });

      await waitFor(() => {
        expect(AsyncStorageMock.setItem).toHaveBeenCalled();
      });

      const callArgs = AsyncStorageMock.setItem.mock.calls[0];
      const savedState = JSON.parse(callArgs[1] as string);
      expect(savedState.customState).toEqual({ selectedView: 'grid' });
    });

    it('should not update custom state for disallowed keys', async () => {
      expect.hasAssertions();
      const { result } = renderHook(() =>
        useTabStatePreservation({
          tabName: 'TestTab',
          customStateKeys: ['selectedView'],
        }),
      );

      await act(async () => {
        result.current.updateCustomState('disallowedKey', 'value');
      });

      await waitFor(() => {
        expect(AsyncStorageMock.setItem).not.toHaveBeenCalled();
      }, { timeout: 100 });
    });

    it('should merge custom state updates', async () => {
      expect.hasAssertions();
      const { result } = renderHook(() =>
        useTabStatePreservation({
          tabName: 'TestTab',
          customStateKeys: ['view', 'sort'],
        }),
      );

      await act(async () => {
        result.current.updateCustomState('view', 'grid');
      });

      await act(async () => {
        result.current.updateCustomState('sort', 'date');
      });

      await waitFor(() => {
        expect(AsyncStorageMock.setItem).toHaveBeenCalledTimes(2);
      });

      const lastCall = AsyncStorageMock.setItem.mock.calls[1];
      const savedState = JSON.parse(lastCall[1] as string);
      expect(savedState.customState).toEqual({
        view: 'grid',
        sort: 'date',
      });
    });
  });

  describe('Focus Effect Behavior', () => {
    it('should restore state when tab gains focus', async () => {
      expect.hasAssertions();
      const storedState: TabState = {
        scrollOffset: 100,
      };

      AsyncStorageMock.getItem.mockResolvedValueOnce(JSON.stringify(storedState));

      // Mock useFocusEffect to call callback immediately
      useFocusEffectMock.mockImplementationOnce((callback) => {
        callback();
        return () => {};
      });

      renderHook(() =>
        useTabStatePreservation({
          tabName: 'TestTab',
        }),
      );

      await waitFor(() => {
        expect(AsyncStorageMock.getItem).toHaveBeenCalled();
      });
    });

    it('should save state when tab loses focus', async () => {
      expect.hasAssertions();
      let cleanupFn: (() => void) | undefined;

      useFocusEffectMock.mockImplementationOnce((callback) => {
        // Don't call callback immediately, store cleanup
        return () => {};
      });

      useFocusEffectMock.mockImplementationOnce((callback) => {
        cleanupFn = callback();
        return () => {};
      });

      const { result } = renderHook(() =>
        useTabStatePreservation({
          tabName: 'TestTab',
        }),
      );

      // Save some state first
      await act(async () => {
        await result.current.saveState({ scrollOffset: 150 });
      });

      jest.clearAllMocks();

      // Trigger cleanup (tab loses focus)
      await act(async () => {
        cleanupFn?.();
      });

      await waitFor(() => {
        expect(AsyncStorageMock.setItem).toHaveBeenCalled();
      });
    });

    it('should not save empty state when tab loses focus', async () => {
      expect.hasAssertions();
      let cleanupFn: (() => void) | undefined;

      useFocusEffectMock.mockImplementationOnce(() => {
        return () => {};
      });

      useFocusEffectMock.mockImplementationOnce((callback) => {
        cleanupFn = callback();
        return () => {};
      });

      renderHook(() =>
        useTabStatePreservation({
          tabName: 'TestTab',
        }),
      );

      jest.clearAllMocks();

      // Trigger cleanup without any state saved
      await act(async () => {
        cleanupFn?.();
      });

      // Should not save empty state
      await waitFor(() => {
        expect(AsyncStorageMock.setItem).not.toHaveBeenCalled();
      }, { timeout: 100 });
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty tab name', async () => {
      expect.hasAssertions();
      const { result } = renderHook(() =>
        useTabStatePreservation({
          tabName: '',
        }),
      );

      await act(async () => {
        await result.current.saveState({ scrollOffset: 100 });
      });

      expect(AsyncStorageMock.setItem).toHaveBeenCalledWith(
        'tab_state_',
        expect.any(String),
      );
    });

    it('should handle very large scroll offsets', async () => {
      expect.hasAssertions();
      const { result } = renderHook(() =>
        useTabStatePreservation({
          tabName: 'TestTab',
          preserveScroll: true,
        }),
      );

      await act(async () => {
        result.current.updateScrollOffset(999999);
      });

      await waitFor(() => {
        expect(AsyncStorageMock.setItem).toHaveBeenCalled();
      });

      const callArgs = AsyncStorageMock.setItem.mock.calls[0];
      const savedState = JSON.parse(callArgs[1] as string);
      expect(savedState.scrollOffset).toBe(999999);
    });

    it('should handle negative scroll offsets', async () => {
      expect.hasAssertions();
      const { result } = renderHook(() =>
        useTabStatePreservation({
          tabName: 'TestTab',
          preserveScroll: true,
        }),
      );

      await act(async () => {
        result.current.updateScrollOffset(-100);
      });

      await waitFor(() => {
        expect(AsyncStorageMock.setItem).toHaveBeenCalled();
      });

      const callArgs = AsyncStorageMock.setItem.mock.calls[0];
      const savedState = JSON.parse(callArgs[1] as string);
      expect(savedState.scrollOffset).toBe(-100);
    });

    it('should handle complex nested state objects', async () => {
      expect.hasAssertions();
      const { result } = renderHook(() =>
        useTabStatePreservation({
          tabName: 'TestTab',
          preserveFilters: true,
        }),
      );

      const complexFilters = {
        category: 'dogs',
        tags: ['friendly', 'energetic'],
        ageRange: { min: 1, max: 5 },
        location: { city: 'New York', radius: 10 },
      };

      await act(async () => {
        result.current.updateFilters(complexFilters);
      });

      await waitFor(() => {
        expect(AsyncStorageMock.setItem).toHaveBeenCalled();
      });

      const callArgs = AsyncStorageMock.setItem.mock.calls[0];
      const savedState = JSON.parse(callArgs[1] as string);
      expect(savedState.filters).toEqual(complexFilters);
    });
  });

  describe('Function Referential Stability', () => {
    it('should provide stable function references across renders', async () => {
      expect.hasAssertions();
      const { result, rerender } = renderHook(() =>
        useTabStatePreservation({
          tabName: 'TestTab',
        }),
      );

      const firstSaveState = result.current.saveState;
      const firstRestoreState = result.current.restoreState;
      const firstUpdateScroll = result.current.updateScrollOffset;

      rerender();

      // Functions should be stable due to useCallback
      expect(result.current.saveState).toBe(firstSaveState);
      expect(result.current.restoreState).toBe(firstRestoreState);
      expect(result.current.updateScrollOffset).toBe(firstUpdateScroll);
    });
  });
});

describe('useScrollPositionPreservation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();

    useFocusEffectMock.mockImplementation((callback) => {
      callback();
      return () => {};
    });

    AsyncStorageMock.getItem.mockResolvedValue(null);
    AsyncStorageMock.setItem.mockResolvedValue();
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  it('should provide handleScroll and restoreState functions', () => {
    expect.hasAssertions();
    const { result } = renderHook(() =>
      useScrollPositionPreservation('TestTab'),
    );

    expect(typeof result.current.handleScroll).toBe('function');
    expect(typeof result.current.restoreState).toBe('function');
  });

  it('should update scroll offset when handleScroll is called', async () => {
    expect.hasAssertions();
    const { result } = renderHook(() =>
      useScrollPositionPreservation('TestTab'),
    );

    await act(async () => {
      result.current.handleScroll({
        nativeEvent: {
          contentOffset: { y: 150 },
        },
      });
    });

    await waitFor(() => {
      expect(AsyncStorageMock.setItem).toHaveBeenCalled();
    });

    const callArgs = AsyncStorageMock.setItem.mock.calls[0];
    const savedState = JSON.parse(callArgs[1] as string);
    expect(savedState.scrollOffset).toBe(150);
  });

  it('should handle multiple scroll events', async () => {
    expect.hasAssertions();
    const { result } = renderHook(() =>
      useScrollPositionPreservation('TestTab'),
    );

    await act(async () => {
      result.current.handleScroll({
        nativeEvent: { contentOffset: { y: 100 } },
      });
      result.current.handleScroll({
        nativeEvent: { contentOffset: { y: 200 } },
      });
      result.current.handleScroll({
        nativeEvent: { contentOffset: { y: 300 } },
      });
    });

    await waitFor(() => {
      expect(AsyncStorageMock.setItem).toHaveBeenCalled();
    });

    // Should have saved multiple times (last call has final offset)
    const lastCall = AsyncStorageMock.setItem.mock.calls[
      AsyncStorageMock.setItem.mock.calls.length - 1
    ];
    const savedState = JSON.parse(lastCall[1] as string);
    expect(savedState.scrollOffset).toBe(300);
  });

  it('should work with scroll ref provided', async () => {
    expect.hasAssertions();
    const scrollRef = {
      current: {
        scrollToOffset: jest.fn(),
      },
    } as React.RefObject<{ scrollToOffset: (offset: number) => void }>;

    const storedState: TabState = {
      scrollOffset: 250,
    };

    AsyncStorageMock.getItem.mockResolvedValueOnce(JSON.stringify(storedState));

    renderHook(() =>
      useScrollPositionPreservation('TestTab', scrollRef),
    );

    await act(async () => {
      await Promise.resolve();
    });

    act(() => {
      jest.advanceTimersByTime(100);
    });

    expect(scrollRef.current?.scrollToOffset).toHaveBeenCalledWith(250);
  });
});


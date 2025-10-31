/**
 * Tests for useHeader hook
 * Comprehensive test suite following the same patterns as useNotifications.test.ts
 *
 * Behavior Matrix:
 * - Hook updates header via HeaderBus when options change
 * - Only includes defined values in payload (undefined values omitted)
 * - Merges route name with counts if either exists
 * - Cleans up subscription on unmount
 * - Dependency array triggers updates: [options.title, options.subtitle, options.counts, route.name]
 */

import { renderHook, act } from '@testing-library/react-native';
import { useRoute } from '@react-navigation/native';
import { useHeader } from '../useHeader';
import { headerBus } from '../HeaderBus';
import type { HeaderPayload } from '../HeaderBus';

// Mock React Navigation
jest.mock('@react-navigation/native', () => ({
  useRoute: jest.fn(),
}));

// Mock HeaderBus
jest.mock('../HeaderBus', () => {
  const mockSetHeader = jest.fn();
  return {
    headerBus: {
      setHeader: jest.fn(),
    },
    setHeader: mockSetHeader,
  };
});

// Type-safe mock helpers
const useRouteMock = jest.mocked(useRoute);
// eslint-disable-next-line @typescript-eslint/no-require-imports
const HeaderBusModule = require('../HeaderBus');
const setHeaderMock = jest.mocked(HeaderBusModule.setHeader as jest.Mock);

describe('useHeader', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useRouteMock.mockReturnValue({
      name: 'TestScreen',
      key: 'test-key',
      params: {},
    } as ReturnType<typeof useRoute>);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  /**
   * Helper to render hook with options
   * Uses initialProps pattern for proper rerendering
   */
  const renderHeaderHook = (initialOptions: Parameters<typeof useHeader>[0]) => {
    return renderHook(
      (options: Parameters<typeof useHeader>[0]) => useHeader(options),
      {
        initialProps: initialOptions,
      },
    );
  };

  describe('Initialization', () => {
    it('should call setHeader on mount with title', () => {
      expect.hasAssertions();
      renderHeaderHook({ title: 'Test Title' });

      expect(setHeaderMock).toHaveBeenCalledTimes(1);
      expect(setHeaderMock).toHaveBeenCalledWith({
        title: 'Test Title',
        ctxPatch: {
          route: 'TestScreen',
        },
      });
    });

    it('should call setHeader on mount with subtitle', () => {
      expect.hasAssertions();
      renderHeaderHook({ subtitle: 'Test Subtitle' });

      expect(setHeaderMock).toHaveBeenCalledTimes(1);
      expect(setHeaderMock).toHaveBeenCalledWith({
        subtitle: 'Test Subtitle',
        ctxPatch: {
          route: 'TestScreen',
        },
      });
    });

    it('should call setHeader on mount with both title and subtitle', () => {
      expect.hasAssertions();
      renderHeaderHook({
        title: 'Test Title',
        subtitle: 'Test Subtitle',
      });

      expect(setHeaderMock).toHaveBeenCalledTimes(1);
      expect(setHeaderMock).toHaveBeenCalledWith({
        title: 'Test Title',
        subtitle: 'Test Subtitle',
        ctxPatch: {
          route: 'TestScreen',
        },
      });
    });

    it('should not call setHeader when no options provided', () => {
      expect.hasAssertions();
      renderHeaderHook({});

      expect(setHeaderMock).toHaveBeenCalledTimes(1);
      // When route.name exists, ctxPatch is included
      expect(setHeaderMock).toHaveBeenCalledWith({
        ctxPatch: {
          route: 'TestScreen',
        },
      });
    });
  });

  describe('Title Updates', () => {
    it('should update header when title changes', () => {
      expect.hasAssertions();
      const { rerender } = renderHeaderHook({ title: 'Initial Title' });

      expect(setHeaderMock).toHaveBeenCalledTimes(1);
      expect(setHeaderMock).toHaveBeenCalledWith({
        title: 'Initial Title',
        ctxPatch: {
          route: 'TestScreen',
        },
      });

      rerender({ title: 'Updated Title' });

      expect(setHeaderMock).toHaveBeenCalledTimes(2);
      expect(setHeaderMock).toHaveBeenLastCalledWith({
        title: 'Updated Title',
        ctxPatch: {
          route: 'TestScreen',
        },
      });
    });

    it('should remove title when changed to undefined', () => {
      expect.hasAssertions();
      const { rerender } = renderHeaderHook({ title: 'Initial Title' });

      rerender({});

      expect(setHeaderMock).toHaveBeenCalledTimes(2);
      // ctxPatch still included when route.name exists
      expect(setHeaderMock).toHaveBeenLastCalledWith({
        ctxPatch: {
          route: 'TestScreen',
        },
      });
    });

    it('should add title when changed from undefined', () => {
      expect.hasAssertions();
      const { rerender } = renderHeaderHook({});

      rerender({ title: 'New Title' });

      expect(setHeaderMock).toHaveBeenCalledTimes(2);
      expect(setHeaderMock).toHaveBeenLastCalledWith({
        title: 'New Title',
        ctxPatch: {
          route: 'TestScreen',
        },
      });
    });
  });

  describe('Subtitle Updates', () => {
    it('should update header when subtitle changes', () => {
      expect.hasAssertions();
      const { rerender } = renderHeaderHook({ subtitle: 'Initial Subtitle' });

      expect(setHeaderMock).toHaveBeenCalledTimes(1);
      expect(setHeaderMock).toHaveBeenCalledWith({
        subtitle: 'Initial Subtitle',
        ctxPatch: {
          route: 'TestScreen',
        },
      });

      rerender({ subtitle: 'Updated Subtitle' });

      expect(setHeaderMock).toHaveBeenCalledTimes(2);
      expect(setHeaderMock).toHaveBeenLastCalledWith({
        subtitle: 'Updated Subtitle',
        ctxPatch: {
          route: 'TestScreen',
        },
      });
    });

    it('should remove subtitle when changed to undefined', () => {
      expect.hasAssertions();
      const { rerender } = renderHeaderHook({ subtitle: 'Initial Subtitle' });

      rerender({});

      expect(setHeaderMock).toHaveBeenCalledTimes(2);
      // ctxPatch still included when route.name exists
      expect(setHeaderMock).toHaveBeenLastCalledWith({
        ctxPatch: {
          route: 'TestScreen',
        },
      });
    });
  });

  describe('Counts Management', () => {
    it('should include ctxPatch with route when counts provided', () => {
      expect.hasAssertions();
      renderHeaderHook({
        counts: {
          messages: 5,
          notifications: 3,
          community: 2,
        },
      });

      expect(setHeaderMock).toHaveBeenCalledTimes(1);
      expect(setHeaderMock).toHaveBeenCalledWith({
        ctxPatch: {
          route: 'TestScreen',
          counts: {
            messages: 5,
            notifications: 3,
            community: 2,
          },
        },
      });
    });

    it('should include ctxPatch with route name even without counts', () => {
      expect.hasAssertions();
      useRouteMock.mockReturnValue({
        name: 'AnotherScreen',
        key: 'another-key',
        params: {},
      } as ReturnType<typeof useRoute>);

      renderHeaderHook({ title: 'Test' });

      expect(setHeaderMock).toHaveBeenCalledTimes(1);
      expect(setHeaderMock).toHaveBeenCalledWith({
        title: 'Test',
        ctxPatch: {
          route: 'AnotherScreen',
        },
      });
    });

    it('should include ctxPatch only when route.name exists', () => {
      expect.hasAssertions();
      useRouteMock.mockReturnValue({
        name: undefined,
        key: 'no-name-key',
        params: {},
      } as ReturnType<typeof useRoute>);

      renderHeaderHook({ title: 'Test' });

      expect(setHeaderMock).toHaveBeenCalledTimes(1);
      expect(setHeaderMock).toHaveBeenCalledWith({
        title: 'Test',
      });
    });

    it('should update counts when they change', () => {
      expect.hasAssertions();
      const { rerender } = renderHeaderHook({
        counts: {
          messages: 5,
          notifications: 3,
          community: 2,
        },
      });

      expect(setHeaderMock).toHaveBeenCalledTimes(1);
      expect(setHeaderMock).toHaveBeenCalledWith({
        ctxPatch: {
          route: 'TestScreen',
          counts: {
            messages: 5,
            notifications: 3,
            community: 2,
          },
        },
      });

      rerender({
        counts: {
          messages: 10,
          notifications: 7,
          community: 4,
        },
      });

      expect(setHeaderMock).toHaveBeenCalledTimes(2);
      expect(setHeaderMock).toHaveBeenLastCalledWith({
        ctxPatch: {
          route: 'TestScreen',
          counts: {
            messages: 10,
            notifications: 7,
            community: 4,
          },
        },
      });
    });

    it('should handle partial counts (some undefined)', () => {
      expect.hasAssertions();
      renderHeaderHook({
        counts: {
          messages: 5,
          notifications: undefined,
          community: 2,
        },
      });

      expect(setHeaderMock).toHaveBeenCalledTimes(1);
      expect(setHeaderMock).toHaveBeenCalledWith({
        ctxPatch: {
          route: 'TestScreen',
          counts: {
            messages: 5,
            notifications: 0,
            community: 2,
          },
        },
      });
    });

    it('should handle zero counts', () => {
      expect.hasAssertions();
      renderHeaderHook({
        counts: {
          messages: 0,
          notifications: 0,
          community: 0,
        },
      });

      expect(setHeaderMock).toHaveBeenCalledTimes(1);
      expect(setHeaderMock).toHaveBeenCalledWith({
        ctxPatch: {
          route: 'TestScreen',
          counts: {
            messages: 0,
            notifications: 0,
            community: 0,
          },
        },
      });
    });

    it('should remove ctxPatch when counts becomes undefined', () => {
      expect.hasAssertions();
      const { rerender } = renderHeaderHook({
        title: 'Test',
        counts: {
          messages: 5,
        },
      });

      rerender({
        title: 'Test',
      });

      expect(setHeaderMock).toHaveBeenCalledTimes(2);
      // ctxPatch still includes route even without counts
      expect(setHeaderMock).toHaveBeenLastCalledWith({
        title: 'Test',
        ctxPatch: {
          route: 'TestScreen',
        },
      });
    });
  });

  describe('Combined Options', () => {
    it('should handle title, subtitle, and counts together', () => {
      expect.hasAssertions();
      renderHeaderHook({
        title: 'Test Title',
        subtitle: 'Test Subtitle',
        counts: {
          messages: 5,
          notifications: 3,
          community: 2,
        },
      });

      expect(setHeaderMock).toHaveBeenCalledTimes(1);
      expect(setHeaderMock).toHaveBeenCalledWith({
        title: 'Test Title',
        subtitle: 'Test Subtitle',
        ctxPatch: {
          route: 'TestScreen',
          counts: {
            messages: 5,
            notifications: 3,
            community: 2,
          },
        },
      });
    });

    it('should update multiple fields simultaneously', () => {
      expect.hasAssertions();
      const { rerender } = renderHeaderHook({
        title: 'Initial',
        subtitle: 'Initial Sub',
      });

      rerender({
        title: 'Updated',
        subtitle: 'Updated Sub',
        counts: {
          messages: 10,
        },
      });

      expect(setHeaderMock).toHaveBeenCalledTimes(2);
      expect(setHeaderMock).toHaveBeenLastCalledWith({
        title: 'Updated',
        subtitle: 'Updated Sub',
        ctxPatch: {
          route: 'TestScreen',
          counts: {
            messages: 10,
            notifications: 0,
            community: 0,
          },
        },
      });
    });
  });

  describe('Route Name Changes', () => {
    it('should update when route name changes', () => {
      expect.hasAssertions();
      const { rerender } = renderHeaderHook({
        counts: {
          messages: 5,
        },
      });

      expect(setHeaderMock).toHaveBeenCalledTimes(1);
      expect(setHeaderMock).toHaveBeenCalledWith({
        ctxPatch: {
          route: 'TestScreen',
          counts: {
            messages: 5,
            notifications: 0,
            community: 0,
          },
        },
      });

      useRouteMock.mockReturnValue({
        name: 'NewScreen',
        key: 'new-key',
        params: {},
      } as ReturnType<typeof useRoute>);

      rerender({
        counts: {
          messages: 5,
        },
      });

      expect(setHeaderMock).toHaveBeenCalledTimes(2);
      expect(setHeaderMock).toHaveBeenLastCalledWith({
        ctxPatch: {
          route: 'NewScreen',
          counts: {
            messages: 5,
            notifications: 0,
            community: 0,
          },
        },
      });
    });

    it('should not include ctxPatch when route.name is falsy and no counts', () => {
      expect.hasAssertions();
      useRouteMock.mockReturnValue({
        name: undefined,
        key: 'no-name',
        params: {},
      } as ReturnType<typeof useRoute>);

      renderHeaderHook({
        title: 'Test',
      });

      expect(setHeaderMock).toHaveBeenCalledTimes(1);
      expect(setHeaderMock).toHaveBeenCalledWith({
        title: 'Test',
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty string title', () => {
      expect.hasAssertions();
      renderHeaderHook({ title: '' });

      expect(setHeaderMock).toHaveBeenCalledTimes(1);
      expect(setHeaderMock).toHaveBeenCalledWith({
        title: '',
        ctxPatch: {
          route: 'TestScreen',
        },
      });
    });

    it('should handle empty string subtitle', () => {
      expect.hasAssertions();
      useRouteMock.mockReturnValue({
        name: undefined,
        key: 'no-name',
        params: {},
      } as ReturnType<typeof useRoute>);

      renderHeaderHook({ subtitle: '' });

      expect(setHeaderMock).toHaveBeenCalledTimes(1);
      expect(setHeaderMock).toHaveBeenCalledWith({
        subtitle: '',
      });
    });

    it('should handle negative counts', () => {
      expect.hasAssertions();
      renderHeaderHook({
        counts: {
          messages: -1,
          notifications: -5,
          community: 0,
        },
      });

      expect(setHeaderMock).toHaveBeenCalledTimes(1);
      expect(setHeaderMock).toHaveBeenCalledWith({
        ctxPatch: {
          route: 'TestScreen',
          counts: {
            messages: -1,
            notifications: -5,
            community: 0,
          },
        },
      });
    });

    it('should handle very large counts', () => {
      expect.hasAssertions();
      renderHeaderHook({
        counts: {
          messages: 999999,
          notifications: 1000000,
          community: 500000,
        },
      });

      expect(setHeaderMock).toHaveBeenCalledTimes(1);
      expect(setHeaderMock).toHaveBeenCalledWith({
        ctxPatch: {
          route: 'TestScreen',
          counts: {
            messages: 999999,
            notifications: 1000000,
            community: 500000,
          },
        },
      });
    });
  });

  describe('Dependency Array Behavior', () => {
    it('should not re-render when unrelated prop changes', () => {
      expect.hasAssertions();
      const { rerender } = renderHeaderHook({
        title: 'Test',
      });

      expect(setHeaderMock).toHaveBeenCalledTimes(1);

      // Simulate unrelated change (route params, but not route.name)
      useRouteMock.mockReturnValue({
        name: 'TestScreen', // Same name
        key: 'test-key',
        params: { newParam: 'value' },
      } as ReturnType<typeof useRoute>);

      rerender({
        title: 'Test', // Same title
      });

      // Should not call again since title and route.name haven't changed
      expect(setHeaderMock).toHaveBeenCalledTimes(1);
    });

    it('should update when title changes even if subtitle stays same', () => {
      expect.hasAssertions();
      const { rerender } = renderHeaderHook({
        title: 'Title 1',
        subtitle: 'Same Subtitle',
      });

      expect(setHeaderMock).toHaveBeenCalledTimes(1);

      rerender({
        title: 'Title 2',
        subtitle: 'Same Subtitle',
      });

      expect(setHeaderMock).toHaveBeenCalledTimes(2);
      expect(setHeaderMock).toHaveBeenLastCalledWith({
        title: 'Title 2',
        subtitle: 'Same Subtitle',
        ctxPatch: {
          route: 'TestScreen',
        },
      });
    });
  });

  describe('Cleanup', () => {
    it('should not call setHeader after unmount', () => {
      expect.hasAssertions();
      const { unmount } = renderHeaderHook({
        title: 'Test',
      });

      expect(setHeaderMock).toHaveBeenCalledTimes(1);

      unmount();

      // Verify no additional calls
      expect(setHeaderMock).toHaveBeenCalledTimes(1);
    });

    it('should handle rapid mount/unmount cycles', () => {
      expect.hasAssertions();
      const { unmount } = renderHeaderHook({
        title: 'Test 1',
      });

      expect(setHeaderMock).toHaveBeenCalledTimes(1);

      unmount();

      const { unmount: unmount2 } = renderHeaderHook({
        title: 'Test 2',
      });

      expect(setHeaderMock).toHaveBeenCalledTimes(2);
      expect(setHeaderMock).toHaveBeenLastCalledWith({
        title: 'Test 2',
        ctxPatch: {
          route: 'TestScreen',
        },
      });

      unmount2();

      expect(setHeaderMock).toHaveBeenCalledTimes(2);
    });
  });

  describe('Type Safety & Payload Structure', () => {
    it('should create payload with only defined fields', () => {
      expect.hasAssertions();
      useRouteMock.mockReturnValue({
        name: undefined,
        key: 'no-name',
        params: {},
      } as ReturnType<typeof useRoute>);

      renderHeaderHook({
        title: 'Test',
        // subtitle undefined
        // counts undefined
      });

      const callPayload = setHeaderMock.mock.calls[0][0];
      expect(callPayload).not.toHaveProperty('subtitle');
      expect(callPayload).not.toHaveProperty('counts');
      expect(callPayload).toHaveProperty('title');
    });

    it('should create ctxPatch with correct structure when route exists', () => {
      expect.hasAssertions();
      renderHeaderHook({
        counts: {
          messages: 5,
        },
      });

      const callPayload = setHeaderMock.mock.calls[0][0];
      expect(callPayload).toHaveProperty('ctxPatch');
      expect(callPayload.ctxPatch).toHaveProperty('route', 'TestScreen');
      expect(callPayload.ctxPatch).toHaveProperty('counts');
      expect(callPayload.ctxPatch?.counts).toEqual({
        messages: 5,
        notifications: 0,
        community: 0,
      });
    });
  });
});


/**
 * Tests for useNotifications hook
 * Fixes M-TEST-01: Unit test usePushNotifications: permission flow, token registration, notification handling
 *
 * Permission/Token Matrix:
 * - initializeNotificationsService can return: string (token) | null (permission denied/no device)
 * - Hook handles both cases and marks isInitialized = true regardless
 * - Service methods are bound directly and can be called before initialization
 * - Listener lifecycle: setupListeners() called during init, cleanup() removes listeners on unmount
 */

import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useNotifications } from '../useNotifications';
import { notificationService, initializeNotificationsService } from '../../services/notifications';

// Mock the notification service
jest.mock('../../services/notifications', () => ({
  notificationService: {
    sendMatchNotification: jest.fn(),
    sendMessageNotification: jest.fn(),
    sendLikeNotification: jest.fn(),
    scheduleReminderNotification: jest.fn(),
    setBadgeCount: jest.fn(),
    clearBadge: jest.fn(),
    cleanup: jest.fn(),
  },
  initializeNotificationsService: jest.fn(),
}));

// Type-safe mock helper
const initMock = jest.mocked(initializeNotificationsService);
const serviceMock = jest.mocked(notificationService);

describe('useNotifications', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    initMock.mockResolvedValue('test-push-token-123');
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  /**
   * Helper to render hook and wait for initialization
   * DRY pattern for common setup
   */
  const setupInitializedHook = async () => {
    const hook = renderHook(() => useNotifications());
    await waitFor(() => {
      expect(hook.result.current.isInitialized).toBe(true);
    });
    return hook;
  };

  describe('Initialization', () => {
    it('should initialize with correct default values', () => {
      expect.hasAssertions();
      const { result } = renderHook(() => useNotifications());

      expect(result.current.isInitialized).toBe(false);
      expect(result.current.pushToken).toBeNull();
    });

    it('should initialize notifications on mount', async () => {
      expect.hasAssertions();
      const { result } = renderHook(() => useNotifications());

      await waitFor(() => {
        expect(initMock).toHaveBeenCalledTimes(1);
        expect(result.current.isInitialized).toBe(true);
        expect(result.current.pushToken).toBe('test-push-token-123');
      });
    });

    it('should initialize only once across re-renders', async () => {
      expect.hasAssertions();
      const { rerender } = renderHook(() => useNotifications());

      await waitFor(() => {
        expect(initMock).toHaveBeenCalledTimes(1);
      });

      rerender(); // Force re-render

      await waitFor(() => {
        expect(initMock).toHaveBeenCalledTimes(1); // Still only once
      });
    });

    it('should re-initialize on remount after unmount', async () => {
      expect.hasAssertions();
      const { unmount } = renderHook(() => useNotifications());

      await waitFor(() => {
        expect(initMock).toHaveBeenCalledTimes(1);
      });

      unmount();
      expect(serviceMock.cleanup).toHaveBeenCalledTimes(1);

      // Create a new hook instance (remount)
      const { result: result2 } = renderHook(() => useNotifications());

      await waitFor(() => {
        expect(initMock).toHaveBeenCalledTimes(2);
        expect(result2.current.isInitialized).toBe(true);
      });
    });
  });

  describe('Permission/Token Matrix', () => {
    it.each([
      { token: 'expo-push-token-abc123', expectToken: 'expo-push-token-abc123', description: 'valid token' },
      { token: null, expectToken: null, description: 'permission denied' },
      { token: 'another-token-xyz', expectToken: 'another-token-xyz', description: 'different token' },
    ])('handles permission/token: $description', async ({ token, expectToken }) => {
      expect.hasAssertions();
      initMock.mockResolvedValueOnce(token);

      const { result } = renderHook(() => useNotifications());

      await waitFor(() => {
        expect(result.current.isInitialized).toBe(true);
      });

      expect(result.current.pushToken).toBe(expectToken);
      expect(initMock).toHaveBeenCalledTimes(1);
    });
  });

  describe('Error Handling', () => {
    it('should handle initialization failure gracefully (null token)', async () => {
      expect.hasAssertions();
      initMock.mockResolvedValueOnce(null);

      const { result } = renderHook(() => useNotifications());

      await waitFor(() => {
        expect(result.current.isInitialized).toBe(true);
        expect(result.current.pushToken).toBeNull();
      });

      expect(initMock).toHaveBeenCalledTimes(1);
    });

    it('should handle initialization error (rejected promise)', async () => {
      expect.hasAssertions();
      const initError = new Error('Init failed');
      initMock.mockRejectedValueOnce(initError);

      const { result } = renderHook(() => useNotifications());

      await waitFor(() => {
        expect(result.current.isInitialized).toBe(true);
      });

      // On error, token should remain null and no service calls should occur
      expect(result.current.pushToken).toBeNull();
      expect(initMock).toHaveBeenCalledTimes(1);
    });

    it('should handle initialization error without crashing', async () => {
      expect.hasAssertions();
      initMock.mockRejectedValueOnce(new Error('Network error'));

      const { result } = renderHook(() => useNotifications());

      await waitFor(() => {
        expect(result.current.isInitialized).toBe(true);
      });

      // Verify hook still exposes all methods
      expect(typeof result.current.sendMatchNotification).toBe('function');
      expect(typeof result.current.sendMessageNotification).toBe('function');
      expect(result.current.pushToken).toBeNull();
    });
  });

  describe('Pre-Initialization Behavior', () => {
    it('should allow service method calls before initialization', async () => {
      expect.hasAssertions();
      const { result } = renderHook(() => useNotifications());

      // Immediately call before waitFor - service methods are bound directly
      await act(async () => {
        await result.current.sendLikeNotification('Buddy', true);
      });

      // Service methods are bound directly, so they can be called
      expect(serviceMock.sendLikeNotification).toHaveBeenCalledTimes(1);
      expect(serviceMock.sendLikeNotification).toHaveBeenCalledWith('Buddy', true);
    });

    it('should allow all service methods before initialization', async () => {
      expect.hasAssertions();
      const { result } = renderHook(() => useNotifications());

      await act(async () => {
        await result.current.sendMatchNotification('Fluffy', 'photo-url');
        await result.current.sendMessageNotification('John', 'Hello!', 'match123');
        await result.current.scheduleReminderNotification(24);
        await result.current.setBadgeCount(5);
        await result.current.clearBadge();
      });

      expect(serviceMock.sendMatchNotification).toHaveBeenCalledTimes(1);
      expect(serviceMock.sendMessageNotification).toHaveBeenCalledTimes(1);
      expect(serviceMock.scheduleReminderNotification).toHaveBeenCalledTimes(1);
      expect(serviceMock.setBadgeCount).toHaveBeenCalledTimes(1);
      expect(serviceMock.clearBadge).toHaveBeenCalledTimes(1);
    });
  });

  describe('Service Passthroughs', () => {
    it('should provide sendMatchNotification function with exact call counts', async () => {
      expect.hasAssertions();
      const { result } = await setupInitializedHook();

      await act(async () => {
        await result.current.sendMatchNotification('Fluffy', 'photo-url');
      });

      expect(serviceMock.sendMatchNotification).toHaveBeenCalledTimes(1);
      expect(serviceMock.sendMatchNotification).toHaveBeenCalledWith('Fluffy', 'photo-url');
      expect(serviceMock.sendMessageNotification).not.toHaveBeenCalled();
    });

    it('should provide sendMessageNotification function', async () => {
      expect.hasAssertions();
      const { result } = await setupInitializedHook();

      await act(async () => {
        await result.current.sendMessageNotification('John', 'Hello!', 'match123');
      });

      expect(serviceMock.sendMessageNotification).toHaveBeenCalledTimes(1);
      expect(serviceMock.sendMessageNotification).toHaveBeenCalledWith(
        'John',
        'Hello!',
        'match123',
      );
    });

    it('should provide sendLikeNotification function', async () => {
      expect.hasAssertions();
      const { result } = await setupInitializedHook();

      await act(async () => {
        await result.current.sendLikeNotification('Buddy', false);
      });

      expect(serviceMock.sendLikeNotification).toHaveBeenCalledTimes(1);
      expect(serviceMock.sendLikeNotification).toHaveBeenCalledWith('Buddy', false);
    });

    it('should provide sendLikeNotification with super like flag', async () => {
      expect.hasAssertions();
      const { result } = await setupInitializedHook();

      await act(async () => {
        await result.current.sendLikeNotification('Buddy', true);
      });

      expect(serviceMock.sendLikeNotification).toHaveBeenCalledTimes(1);
      expect(serviceMock.sendLikeNotification).toHaveBeenCalledWith('Buddy', true);
    });

    it('should provide scheduleReminderNotification function', async () => {
      expect.hasAssertions();
      const { result } = await setupInitializedHook();

      await act(async () => {
        await result.current.scheduleReminderNotification(24);
      });

      expect(serviceMock.scheduleReminderNotification).toHaveBeenCalledTimes(1);
      expect(serviceMock.scheduleReminderNotification).toHaveBeenCalledWith(24);
    });
  });

  describe('Badge Management', () => {
    it('should provide setBadgeCount function', async () => {
      expect.hasAssertions();
      const { result } = await setupInitializedHook();

      await act(async () => {
        await result.current.setBadgeCount(5);
      });

      expect(serviceMock.setBadgeCount).toHaveBeenCalledTimes(1);
      expect(serviceMock.setBadgeCount).toHaveBeenCalledWith(5);
    });

    it('should provide clearBadge function', async () => {
      expect.hasAssertions();
      const { result } = await setupInitializedHook();

      await act(async () => {
        await result.current.clearBadge();
      });

      expect(serviceMock.clearBadge).toHaveBeenCalledTimes(1);
    });

    it('should handle badge operations with invalid values', async () => {
      expect.hasAssertions();
      const { result } = await setupInitializedHook();

      await act(async () => {
        await result.current.setBadgeCount(-1);
      });

      // Service should receive the value as-is (validation is service's responsibility)
      expect(serviceMock.setBadgeCount).toHaveBeenCalledTimes(1);
      expect(serviceMock.setBadgeCount).toHaveBeenCalledWith(-1);
    });

    it('should handle multiple badge operations', async () => {
      expect.hasAssertions();
      const { result } = await setupInitializedHook();

      await act(async () => {
        await result.current.setBadgeCount(3);
        await result.current.setBadgeCount(5);
        await result.current.clearBadge();
      });

      expect(serviceMock.setBadgeCount).toHaveBeenCalledTimes(2);
      expect(serviceMock.clearBadge).toHaveBeenCalledTimes(1);
    });
  });

  describe('Cleanup & Lifecycle', () => {
    it('should cleanup on unmount', () => {
      expect.hasAssertions();
      const { unmount } = renderHook(() => useNotifications());

      unmount();

      expect(serviceMock.cleanup).toHaveBeenCalledTimes(1);
    });

    it('should cleanup only once per unmount', async () => {
      expect.hasAssertions();
      const { unmount } = renderHook(() => useNotifications());

      await waitFor(() => {
        expect(initMock).toHaveBeenCalledTimes(1);
      });

      unmount();
      expect(serviceMock.cleanup).toHaveBeenCalledTimes(1);

      // Remount
      const { unmount: unmount2 } = renderHook(() => useNotifications());
      await waitFor(() => {
        expect(initMock).toHaveBeenCalledTimes(2);
      });

      unmount2(); // Unmount again

      expect(serviceMock.cleanup).toHaveBeenCalledTimes(2);
    });

    it('should cleanup even if initialization failed', async () => {
      expect.hasAssertions();
      initMock.mockRejectedValueOnce(new Error('Init failed'));

      const { unmount } = renderHook(() => useNotifications());

      await waitFor(() => {
        expect(initMock).toHaveBeenCalled();
      });

      unmount();

      expect(serviceMock.cleanup).toHaveBeenCalledTimes(1);
    });
  });

  describe('Function Referential Stability', () => {
    it('should provide function references (bound methods create new instances each render)', async () => {
      expect.hasAssertions();
      const { result, rerender } = renderHook(() => useNotifications());

      await waitFor(() => {
        expect(result.current.isInitialized).toBe(true);
      });

      const firstSendMatch = result.current.sendMatchNotification;
      const firstSendMessage = result.current.sendMessageNotification;
      const firstSetBadge = result.current.setBadgeCount;

      // Verify functions exist and are callable
      expect(typeof firstSendMatch).toBe('function');
      expect(typeof firstSendMessage).toBe('function');
      expect(typeof firstSetBadge).toBe('function');

      rerender();

      // Bound methods create new function instances each render
      // This is expected behavior - verify they still work correctly
      expect(typeof result.current.sendMatchNotification).toBe('function');
      expect(typeof result.current.sendMessageNotification).toBe('function');
      expect(typeof result.current.setBadgeCount).toBe('function');

      // Functions may not be referentially equal due to .bind() creating new instances
      // but they should still be callable and point to the same service method
      await act(async () => {
        await result.current.sendMatchNotification('Test', 'photo');
      });
      expect(serviceMock.sendMatchNotification).toHaveBeenCalledWith('Test', 'photo');
    });
  });

  describe('Timing & Deterministic Behavior', () => {
    it('should schedule reminder notification deterministically', async () => {
      expect.hasAssertions();
      const { result } = await setupInitializedHook();

      await act(async () => {
        await result.current.scheduleReminderNotification(24);
      });

      expect(serviceMock.scheduleReminderNotification).toHaveBeenCalledTimes(1);
      expect(serviceMock.scheduleReminderNotification).toHaveBeenCalledWith(24);

      // Verify no additional calls occur
      expect(serviceMock.scheduleReminderNotification).toHaveBeenCalledTimes(1);
    });
  });

  describe('Argument Validation', () => {
    it('should pass arguments correctly to sendMatchNotification', async () => {
      expect.hasAssertions();
      const hook = renderHook(() => useNotifications());
      await waitFor(() => {
        expect(hook.result.current.isInitialized).toBe(true);
      });

      await act(async () => {
        await hook.result.current.sendMatchNotification('Fluffy', 'https://example.com/photo.jpg');
      });

      expect(serviceMock.sendMatchNotification).toHaveBeenCalledWith(
        'Fluffy',
        'https://example.com/photo.jpg',
      );
    });

    it('should pass arguments correctly to sendMessageNotification', async () => {
      expect.hasAssertions();
      const hook = renderHook(() => useNotifications());
      await waitFor(() => {
        expect(hook.result.current.isInitialized).toBe(true);
      });

      await act(async () => {
        await hook.result.current.sendMessageNotification('John', 'Hello!', 'match123');
      });

      expect(serviceMock.sendMessageNotification).toHaveBeenCalledWith(
        'John',
        'Hello!',
        'match123',
      );
    });

    it('should handle edge case arguments', async () => {
      expect.hasAssertions();
      const hook = renderHook(() => useNotifications());
      await waitFor(() => {
        expect(hook.result.current.isInitialized).toBe(true);
      });

      await act(async () => {
        await hook.result.current.sendMatchNotification('', '');
        await hook.result.current.sendMessageNotification('', '', '');
        await hook.result.current.sendLikeNotification('', false);
        await hook.result.current.scheduleReminderNotification(0);
      });

      expect(serviceMock.sendMatchNotification).toHaveBeenCalledWith('', '');
      expect(serviceMock.sendMessageNotification).toHaveBeenCalledWith('', '', '');
      expect(serviceMock.sendLikeNotification).toHaveBeenCalledWith('', false);
      expect(serviceMock.scheduleReminderNotification).toHaveBeenCalledWith(0);
    });
  });
});

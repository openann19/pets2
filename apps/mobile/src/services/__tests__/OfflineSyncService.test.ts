/**
 * Comprehensive tests for OfflineSyncService
 *
 * Coverage:
 * - Singleton pattern and initialization
 * - Queue management (API calls and user actions)
 * - Network monitoring and online/offline handling
 * - Background sync and manual sync
 * - Priority-based processing
 * - Retry logic and failure handling
 * - Conflict resolution strategies
 * - Persistence and state management
 * - Event listeners and status updates
 * - Error handling and edge cases
 */

import { describe, it, expect, jest, beforeEach, afterEach, beforeAll } from '@jest/globals';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import type { NetInfoState } from '@react-native-community/netinfo';
import { offlineSync, OfflineSyncService } from '../OfflineSyncService';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

// Mock NetInfo
jest.mock('@react-native-community/netinfo', () => ({
  addEventListener: jest.fn(),
  fetch: jest.fn(),
}));

// Mock API service
jest.mock('../api', () => ({
  api: {
    request: jest.fn(),
  },
}));

// Mock logger
jest.mock('@pawfectmatch/core', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
  },
}));

import { api } from '../api';

const mockAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;
const mockNetInfo = NetInfo as jest.Mocked<typeof NetInfo>;
const mockApi = api as jest.Mocked<typeof api>;

// Mock setInterval and clearInterval
jest.useFakeTimers();
const mockSetInterval = jest.spyOn(global, 'setInterval');
const mockClearInterval = jest.spyOn(global, 'clearInterval');

describe('OfflineSyncService', () => {
  let service: OfflineSyncService;
  let mockNetInfoListener: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();

    // Reset singleton instance
    (OfflineSyncService as any).instance = undefined;

    // Setup NetInfo mock
    mockNetInfoListener = jest.fn();
    mockNetInfo.addEventListener.mockImplementation((listener) => {
      mockNetInfoListener = listener;
      return { remove: jest.fn() };
    });
    mockNetInfo.fetch.mockResolvedValue({
      isConnected: true,
      type: 'wifi',
      isInternetReachable: true,
    } as NetInfoState);

    // Setup AsyncStorage mocks
    mockAsyncStorage.getItem.mockResolvedValue(null);
    mockAsyncStorage.setItem.mockResolvedValue(undefined);

    service = OfflineSyncService.getInstance();
  });

  afterEach(() => {
    jest.clearAllTimers();
    mockSetInterval.mockClear();
    mockClearInterval.mockClear();
  });

  describe('Singleton Pattern', () => {
    it('should return the same instance', () => {
      const instance1 = OfflineSyncService.getInstance();
      const instance2 = OfflineSyncService.getInstance();

      expect(instance1).toBe(instance2);
      expect(instance1).toBe(offlineSync);
    });
  });

  describe('Initialization', () => {
    it('should initialize successfully', async () => {
      const storedQueue = JSON.stringify([
        {
          id: 'test-item',
          type: 'api',
          endpoint: '/test',
          method: 'GET',
          timestamp: Date.now(),
          retryCount: 0,
          priority: 'normal',
          onConflict: 'overwrite',
        },
      ]);

      mockAsyncStorage.getItem.mockImplementation((key) => {
        if (key === '@pawfectmatch_offline_queue') {
          return Promise.resolve(storedQueue);
        }
        return Promise.resolve(null);
      });

      await service.initialize();

      expect(mockNetInfo.addEventListener).toHaveBeenCalled();
      expect(mockNetInfo.fetch).toHaveBeenCalled();
      expect(mockAsyncStorage.getItem).toHaveBeenCalledWith('@pawfectmatch_offline_queue');
      expect((service as any).queue).toHaveLength(1);
      expect((service as any).isInitialized).toBe(true);
    });

    it('should handle initialization errors gracefully', async () => {
      mockAsyncStorage.getItem.mockRejectedValue(new Error('Storage error'));

      await service.initialize();

      expect((service as any).isInitialized).toBe(true);
      expect((service as any).queue).toEqual([]);
    });

    it('should not initialize twice', async () => {
      (service as any).isInitialized = true;

      await service.initialize();

      expect(mockNetInfo.addEventListener).not.toHaveBeenCalled();
    });

    it('should start background sync on initialization', async () => {
      await service.initialize();

      expect(mockSetInterval).toHaveBeenCalledWith(
        expect.any(Function),
        30000, // SYNC_INTERVAL
      );
    });
  });

  describe('Queue Management - API Calls', () => {
    beforeEach(async () => {
      await service.initialize();
    });

    it('should queue API call with default parameters', async () => {
      const id = await service.queueApiCall('/test-endpoint');

      expect(id).toMatch(/^[\d_]+$/);
      expect((service as any).queue).toHaveLength(1);

      const queuedItem = (service as any).queue[0];
      expect(queuedItem).toEqual({
        id,
        type: 'api',
        endpoint: '/test-endpoint',
        method: 'GET',
        data: {},
        timestamp: expect.any(Number),
        retryCount: 0,
        priority: 'normal',
        onConflict: 'overwrite',
      });

      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
        '@pawfectmatch_offline_queue',
        expect.any(String),
      );
    });

    it('should queue API call with custom parameters', async () => {
      const testData = { key: 'value' };
      const id = await service.queueApiCall('/test-endpoint', 'POST', testData, 'high', 'merge');

      const queuedItem = (service as any).queue[0];
      expect(queuedItem.method).toBe('POST');
      expect(queuedItem.data).toBe(testData);
      expect(queuedItem.priority).toBe('high');
      expect(queuedItem.onConflict).toBe('merge');
    });

    it('should process queue immediately when online', async () => {
      (service as any).isOnline = true;
      mockApi.request.mockResolvedValue({ success: true });

      await service.queueApiCall('/test-endpoint');

      // Wait for async processing
      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(mockApi.request).toHaveBeenCalledWith('/test-endpoint');
      expect((service as any).queue).toHaveLength(0);
    });

    it('should not process queue when offline', async () => {
      (service as any).isOnline = false;

      await service.queueApiCall('/test-endpoint');

      expect(mockApi.request).not.toHaveBeenCalled();
      expect((service as any).queue).toHaveLength(1);
    });
  });

  describe('Queue Management - User Actions', () => {
    beforeEach(async () => {
      await service.initialize();
    });

    it('should queue user action', async () => {
      const actionData = { action: 'swipe', direction: 'right', petId: 'pet123' };
      const id = await service.queueUserAction('swipe', actionData, 'high');

      expect((service as any).queue).toHaveLength(1);

      const queuedItem = (service as any).queue[0];
      expect(queuedItem.type).toBe('user_action');
      expect(queuedItem.endpoint).toBe('/actions/swipe');
      expect(queuedItem.method).toBe('POST');
      expect(queuedItem.data).toBe(actionData);
      expect(queuedItem.priority).toBe('high');
    });
  });

  describe('Sync Status', () => {
    beforeEach(async () => {
      await service.initialize();
    });

    it('should return correct sync status', () => {
      (service as any).isOnline = true;
      (service as any).syncInProgress = false;
      (service as any).queue = [
        { retryCount: 0 },
        { retryCount: 0 },
        { retryCount: 3 }, // Failed item
      ];

      const status = service.getSyncStatus();

      expect(status).toEqual({
        isOnline: true,
        lastSyncTime: expect.any(Number),
        pendingItems: 3,
        failedItems: 1,
        isSyncing: false,
      });
    });
  });

  describe('Manual Sync', () => {
    beforeEach(async () => {
      await service.initialize();
    });

    it('should sync when online', async () => {
      (service as any).isOnline = true;
      (service as any).queue = [
        {
          id: 'test-item',
          type: 'api',
          endpoint: '/test',
          method: 'GET',
          data: {},
          timestamp: Date.now(),
          retryCount: 0,
          priority: 'normal',
          onConflict: 'overwrite',
        },
      ];

      mockApi.request.mockResolvedValue({ success: true });

      await service.syncNow();

      expect(mockApi.request).toHaveBeenCalledWith('/test');
      expect((service as any).queue).toHaveLength(0);
    });

    it('should throw error when offline', async () => {
      (service as any).isOnline = false;

      await expect(service.syncNow()).rejects.toThrow('Cannot sync while offline');
    });
  });

  describe('Failed Items Management', () => {
    beforeEach(async () => {
      await service.initialize();
    });

    it('should clear failed items from queue', async () => {
      (service as any).queue = [
        { id: 'item1', retryCount: 0 },
        { id: 'item2', retryCount: 3 }, // Failed
        { id: 'item3', retryCount: 4 }, // Failed
      ];

      await service.clearFailedItems();

      expect((service as any).queue).toHaveLength(1);
      expect((service as any).queue[0].id).toBe('item1');
      expect(mockAsyncStorage.setItem).toHaveBeenCalled();
    });
  });

  describe('Network Monitoring', () => {
    beforeEach(async () => {
      await service.initialize();
    });

    it('should handle coming online', () => {
      (service as any).isOnline = false;
      mockApi.request.mockResolvedValue({ success: true });

      // Simulate network change to online
      mockNetInfoListener({
        isConnected: true,
        type: 'wifi',
        isInternetReachable: true,
      } as NetInfoState);

      expect((service as any).isOnline).toBe(true);
    });

    it('should handle going offline', () => {
      (service as any).isOnline = true;

      // Simulate network change to offline
      mockNetInfoListener({
        isConnected: false,
        type: 'none',
        isInternetReachable: false,
      } as NetInfoState);

      expect((service as any).isOnline).toBe(false);
    });

    it('should start queue processing when coming online', () => {
      (service as any).isOnline = false;
      (service as any).queue = [
        {
          id: 'test',
          type: 'api',
          endpoint: '/test',
          method: 'GET',
          data: {},
          timestamp: Date.now(),
          retryCount: 0,
          priority: 'normal',
          onConflict: 'overwrite',
        },
      ];
      mockApi.request.mockResolvedValue({ success: true });

      mockNetInfoListener({
        isConnected: true,
        type: 'wifi',
        isInternetReachable: true,
      } as NetInfoState);

      expect(mockApi.request).toHaveBeenCalledWith('/test');
    });
  });

  describe('Queue Processing', () => {
    beforeEach(async () => {
      await service.initialize();
      (service as any).isOnline = true;
    });

    it('should not process queue when offline', async () => {
      (service as any).isOnline = false;
      (service as any).queue = [
        {
          id: 'test',
          type: 'api',
          endpoint: '/test',
          method: 'GET',
          data: {},
          timestamp: Date.now(),
          retryCount: 0,
          priority: 'normal',
          onConflict: 'overwrite',
        },
      ];

      await (service as any).processQueue();

      expect(mockApi.request).not.toHaveBeenCalled();
    });

    it('should not process queue when already syncing', async () => {
      (service as any).syncInProgress = true;
      (service as any).queue = [
        {
          id: 'test',
          type: 'api',
          endpoint: '/test',
          method: 'GET',
          data: {},
          timestamp: Date.now(),
          retryCount: 0,
          priority: 'normal',
          onConflict: 'overwrite',
        },
      ];

      await (service as any).processQueue();

      expect(mockApi.request).not.toHaveBeenCalled();
    });

    it('should not process empty queue', async () => {
      (service as any).queue = [];

      await (service as any).processQueue();

      expect(mockApi.request).not.toHaveBeenCalled();
    });

    it('should process queue items by priority', async () => {
      (service as any).queue = [
        {
          id: 'low',
          type: 'api',
          endpoint: '/low',
          method: 'GET',
          data: {},
          timestamp: Date.now(),
          retryCount: 0,
          priority: 'low',
          onConflict: 'overwrite',
        },
        {
          id: 'critical',
          type: 'api',
          endpoint: '/critical',
          method: 'GET',
          data: {},
          timestamp: Date.now(),
          retryCount: 0,
          priority: 'critical',
          onConflict: 'overwrite',
        },
        {
          id: 'normal',
          type: 'api',
          endpoint: '/normal',
          method: 'GET',
          data: {},
          timestamp: Date.now(),
          retryCount: 0,
          priority: 'normal',
          onConflict: 'overwrite',
        },
      ];

      mockApi.request.mockResolvedValue({ success: true });

      await (service as any).processQueue();

      expect(mockApi.request).toHaveBeenNthCalledWith(1, '/critical');
      expect(mockApi.request).toHaveBeenNthCalledWith(2, '/normal');
      expect(mockApi.request).toHaveBeenNthCalledWith(3, '/low');
    });

    it('should handle successful item processing', async () => {
      (service as any).queue = [
        {
          id: 'success',
          type: 'api',
          endpoint: '/success',
          method: 'GET',
          data: {},
          timestamp: Date.now(),
          retryCount: 0,
          priority: 'normal',
          onConflict: 'overwrite',
        },
      ];

      mockApi.request.mockResolvedValue({ success: true });

      await (service as any).processQueue();

      expect((service as any).queue).toHaveLength(0);
      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
        '@pawfectmatch_sync_status',
        expect.any(String),
      );
    });

    it('should handle failed items with retry', async () => {
      (service as any).queue = [
        {
          id: 'fail',
          type: 'api',
          endpoint: '/fail',
          method: 'GET',
          data: {},
          timestamp: Date.now(),
          retryCount: 0,
          priority: 'normal',
          onConflict: 'overwrite',
        },
      ];

      mockApi.request.mockRejectedValue(new Error('API Error'));

      await (service as any).processQueue();

      expect((service as any).queue).toHaveLength(1);
      expect((service as any).queue[0].retryCount).toBe(1);
    });

    it('should remove items that exceed max retry count', async () => {
      (service as any).queue = [
        {
          id: 'max-retries',
          type: 'api',
          endpoint: '/fail',
          method: 'GET',
          data: {},
          timestamp: Date.now(),
          retryCount: 2,
          priority: 'normal',
          onConflict: 'overwrite',
        },
      ];

      mockApi.request.mockRejectedValue(new Error('API Error'));

      await (service as any).processQueue();

      expect((service as any).queue).toHaveLength(0);
    });
  });

  describe('Queue Item Processing', () => {
    it('should handle GET requests', async () => {
      const item = {
        id: 'test',
        type: 'api' as const,
        endpoint: '/test',
        method: 'GET' as const,
        data: {},
        timestamp: Date.now(),
        retryCount: 0,
        priority: 'normal' as const,
        onConflict: 'overwrite' as const,
      };

      mockApi.request.mockResolvedValue({ success: true });

      await (service as any).processQueueItem(item);

      expect(mockApi.request).toHaveBeenCalledWith('/test');
    });

    it('should handle POST requests with data', async () => {
      const item = {
        id: 'test',
        type: 'api' as const,
        endpoint: '/test',
        method: 'POST' as const,
        data: { key: 'value' },
        timestamp: Date.now(),
        retryCount: 0,
        priority: 'normal' as const,
        onConflict: 'overwrite' as const,
      };

      mockApi.request.mockResolvedValue({ success: true });

      await (service as any).processQueueItem(item);

      expect(mockApi.request).toHaveBeenCalledWith('/test', {
        method: 'POST',
        body: JSON.stringify({ key: 'value' }),
      });
    });

    it('should handle PUT and DELETE requests', async () => {
      const putItem = {
        id: 'put',
        type: 'api' as const,
        endpoint: '/test',
        method: 'PUT' as const,
        data: { update: true },
        timestamp: Date.now(),
        retryCount: 0,
        priority: 'normal' as const,
        onConflict: 'overwrite' as const,
      };

      const deleteItem = {
        id: 'delete',
        type: 'api' as const,
        endpoint: '/test',
        method: 'DELETE' as const,
        data: {},
        timestamp: Date.now(),
        retryCount: 0,
        priority: 'normal' as const,
        onConflict: 'overwrite' as const,
      };

      mockApi.request.mockResolvedValue({ success: true });

      await (service as any).processQueueItem(putItem);
      expect(mockApi.request).toHaveBeenCalledWith('/test', {
        method: 'PUT',
        body: JSON.stringify({ update: true }),
      });

      await (service as any).processQueueItem(deleteItem);
      expect(mockApi.request).toHaveBeenCalledWith('/test', {
        method: 'DELETE',
      });
    });

    it('should throw error for unsupported HTTP methods', async () => {
      const item = {
        id: 'test',
        type: 'api' as const,
        endpoint: '/test',
        method: 'PATCH' as any,
        data: {},
        timestamp: Date.now(),
        retryCount: 0,
        priority: 'normal' as const,
        onConflict: 'overwrite' as const,
      };

      await expect((service as any).processQueueItem(item)).rejects.toThrow(
        'Unsupported HTTP method: PATCH',
      );
    });
  });

  describe('Event Listeners', () => {
    beforeEach(async () => {
      await service.initialize();
    });

    it('should add and remove sync listeners', () => {
      const listener = jest.fn();

      const unsubscribe = service.addSyncListener(listener);

      expect((service as any).syncListeners).toContain(listener);

      unsubscribe();

      expect((service as any).syncListeners).not.toContain(listener);
    });

    it('should notify listeners of status changes', () => {
      const listener = jest.fn();

      service.addSyncListener(listener);

      (service as any).notifyListeners();

      expect(listener).toHaveBeenCalledWith(service.getSyncStatus());
    });

    it('should handle listener errors gracefully', () => {
      const errorListener = jest.fn(() => {
        throw new Error('Listener error');
      });
      const goodListener = jest.fn();

      service.addSyncListener(errorListener);
      service.addSyncListener(goodListener);

      (service as any).notifyListeners();

      expect(goodListener).toHaveBeenCalled();
    });
  });

  describe('Background Sync', () => {
    beforeEach(async () => {
      await service.initialize();
    });

    it('should trigger sync when online and queue not empty', () => {
      (service as any).isOnline = true;
      (service as any).syncInProgress = false;
      (service as any).queue = [
        {
          id: 'test',
          type: 'api',
          endpoint: '/test',
          method: 'GET',
          data: {},
          timestamp: Date.now(),
          retryCount: 0,
          priority: 'normal',
          onConflict: 'overwrite',
        },
      ];

      mockApi.request.mockResolvedValue({ success: true });

      // Trigger the interval callback
      jest.runOnlyPendingTimers();

      expect(mockApi.request).toHaveBeenCalledWith('/test');
    });

    it('should not trigger sync when offline', () => {
      (service as any).isOnline = false;
      (service as any).queue = [
        {
          id: 'test',
          type: 'api',
          endpoint: '/test',
          method: 'GET',
          data: {},
          timestamp: Date.now(),
          retryCount: 0,
          priority: 'normal',
          onConflict: 'overwrite',
        },
      ];

      jest.runOnlyPendingTimers();

      expect(mockApi.request).not.toHaveBeenCalled();
    });

    it('should not trigger sync when already syncing', () => {
      (service as any).isOnline = true;
      (service as any).syncInProgress = true;
      (service as any).queue = [
        {
          id: 'test',
          type: 'api',
          endpoint: '/test',
          method: 'GET',
          data: {},
          timestamp: Date.now(),
          retryCount: 0,
          priority: 'normal',
          onConflict: 'overwrite',
        },
      ];

      jest.runOnlyPendingTimers();

      expect(mockApi.request).not.toHaveBeenCalled();
    });
  });

  describe('Persistence', () => {
    it('should load queue from storage', async () => {
      const storedQueue = JSON.stringify([
        {
          id: 'stored-item',
          type: 'api',
          endpoint: '/stored',
          method: 'GET',
          data: {},
          timestamp: Date.now(),
          retryCount: 0,
          priority: 'normal',
          onConflict: 'overwrite',
        },
      ]);

      mockAsyncStorage.getItem.mockResolvedValue(storedQueue);

      await (service as any).loadQueue();

      expect((service as any).queue).toHaveLength(1);
      expect((service as any).queue[0].id).toBe('stored-item');
    });

    it('should handle corrupted queue data', async () => {
      mockAsyncStorage.getItem.mockResolvedValue('invalid json');

      await (service as any).loadQueue();

      expect((service as any).queue).toEqual([]);
    });

    it('should persist queue to storage', async () => {
      (service as any).queue = [
        {
          id: 'persist-test',
          type: 'api',
          endpoint: '/test',
          method: 'GET',
          data: {},
          timestamp: Date.now(),
          retryCount: 0,
          priority: 'normal',
          onConflict: 'overwrite',
        },
      ];

      await (service as any).persistQueue();

      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
        '@pawfectmatch_offline_queue',
        expect.any(String),
      );
    });

    it('should handle persistence errors gracefully', async () => {
      mockAsyncStorage.setItem.mockRejectedValue(new Error('Storage full'));

      await (service as any).persistQueue();

      // Should not throw
      expect(mockAsyncStorage.setItem).toHaveBeenCalled();
    });
  });

  describe('Error Handling and Logging', () => {
    it('should log queue operations', async () => {
      const { logger } = require('@pawfectmatch/core');

      await service.queueApiCall('/test-endpoint');

      expect(logger.info).toHaveBeenCalledWith(
        'API call queued for offline sync',
        expect.objectContaining({
          endpoint: '/test-endpoint',
          method: 'GET',
          priority: 'normal',
        }),
      );
    });

    it('should log sync completion', async () => {
      const { logger } = require('@pawfectmatch/core');
      (service as any).isOnline = true;
      (service as any).queue = [
        {
          id: 'test',
          type: 'api',
          endpoint: '/test',
          method: 'GET',
          data: {},
          timestamp: Date.now(),
          retryCount: 0,
          priority: 'normal',
          onConflict: 'overwrite',
        },
      ];

      mockApi.request.mockResolvedValue({ success: true });

      await (service as any).processQueue();

      expect(logger.info).toHaveBeenCalledWith(
        'Queue processing completed',
        expect.objectContaining({
          processed: 1,
          failed: 0,
          remaining: 0,
        }),
      );
    });

    it('should log failed operations', async () => {
      const { logger } = require('@pawfectmatch/core');
      mockApi.request.mockRejectedValue(new Error('API Error'));

      const item = {
        id: 'fail-test',
        type: 'api' as const,
        endpoint: '/fail',
        method: 'GET' as const,
        data: {},
        timestamp: Date.now(),
        retryCount: 0,
        priority: 'normal' as const,
        onConflict: 'overwrite' as const,
      };

      await expect((service as any).processQueueItem(item)).rejects.toThrow();

      expect(logger.error).toHaveBeenCalledWith(
        'Failed to process queue item',
        expect.objectContaining({
          itemId: 'fail-test',
          endpoint: '/fail',
          error: expect.any(Error),
        }),
      );
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty queue processing', async () => {
      (service as any).isOnline = true;
      (service as any).queue = [];

      await (service as any).processQueue();

      expect((service as any).syncInProgress).toBe(false);
    });

    it('should handle network state changes during processing', async () => {
      (service as any).isOnline = true;
      (service as any).queue = [
        {
          id: 'test',
          type: 'api',
          endpoint: '/test',
          method: 'GET',
          data: {},
          timestamp: Date.now(),
          retryCount: 0,
          priority: 'normal',
          onConflict: 'overwrite',
        },
      ];

      // Go offline during processing
      mockApi.request.mockImplementation(async () => {
        (service as any).isOnline = false;
        return { success: true };
      });

      await (service as any).processQueue();

      expect((service as any).syncInProgress).toBe(false);
    });

    it('should handle large queues efficiently', async () => {
      (service as any).isOnline = true;

      // Create a large queue
      const largeQueue = Array.from({ length: 100 }, (_, i) => ({
        id: `item-${i}`,
        type: 'api' as const,
        endpoint: `/test/${i}`,
        method: 'GET' as const,
        data: {},
        timestamp: Date.now(),
        retryCount: 0,
        priority: 'normal' as const,
        onConflict: 'overwrite' as const,
      }));

      (service as any).queue = largeQueue;
      mockApi.request.mockResolvedValue({ success: true });

      await (service as any).processQueue();

      expect(mockApi.request).toHaveBeenCalledTimes(100);
      expect((service as any).queue).toHaveLength(0);
    });

    it('should handle malformed stored queue data', async () => {
      mockAsyncStorage.getItem.mockResolvedValue('{"invalid": json}');

      await (service as any).loadQueue();

      expect((service as any).queue).toEqual([]);
    });

    it('should handle concurrent queue operations', async () => {
      (service as any).isOnline = true;

      // Start multiple queue operations
      const promises = [
        service.queueApiCall('/test1'),
        service.queueApiCall('/test2'),
        service.queueUserAction('action1', { data: 1 }),
        service.queueUserAction('action2', { data: 2 }),
      ];

      await Promise.all(promises);

      expect((service as any).queue).toHaveLength(4);
    });
  });
});

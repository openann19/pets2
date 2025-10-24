/**
 * Offline Scenarios Testing Suite
 * Comprehensive tests for offline functionality, error handling, and edge cases
 */

import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { OfflineService } from '../../web/src/services/OfflineService';
import { useOffline } from '../../web/src/hooks/useOffline';
import { errorHandler } from '../../core/src/services/ErrorHandler';
import { logger } from '../../core/src/services/Logger';

// Mock dependencies
jest.mock('../../core/src/services/ErrorHandler');
jest.mock('../../core/src/services/Logger');

const mockErrorHandler = errorHandler as jest.Mocked<typeof errorHandler>;
const mockLogger = logger as jest.Mocked<typeof logger>;

// Mock navigator.onLine
const mockNavigatorOnline = jest.fn();
Object.defineProperty(navigator, 'onLine', {
  writable: true,
  value: true,
  configurable: true,
});

// Mock network events
const mockOnlineEvent = new Event('online');
const mockOfflineEvent = new Event('offline');

describe('OfflineService', () => {
  let offlineService: OfflineService;

  beforeEach(() => {
    jest.clearAllMocks();
    offlineService = new OfflineService();
    navigator.onLine = true;
  });

  afterEach(() => {
    offlineService.destroy();
  });

  describe('Network Status Detection', () => {
    it('detects online status correctly', () => {
      navigator.onLine = true;
      expect(offlineService.isOnline()).toBe(true);
    });

    it('detects offline status correctly', () => {
      navigator.onLine = false;
      expect(offlineService.isOnline()).toBe(false);
    });

    it('emits online event when network comes back', () => {
      const onlineHandler = jest.fn();
      offlineService.on('online', onlineHandler);

      navigator.onLine = false;
      act(() => {
        window.dispatchEvent(mockOnlineEvent);
      });

      expect(onlineHandler).toHaveBeenCalled();
    });

    it('emits offline event when network goes down', () => {
      const offlineHandler = jest.fn();
      offlineService.on('offline', offlineHandler);

      navigator.onLine = true;
      act(() => {
        window.dispatchEvent(mockOfflineEvent);
      });

      expect(offlineHandler).toHaveBeenCalled();
    });
  });

  describe('Offline Action Queue', () => {
    it('queues actions when offline', async () => {
      navigator.onLine = false;

      const action = {
        type: 'API_CALL',
        endpoint: '/api/test',
        method: 'POST',
        data: { test: 'data' },
        timestamp: Date.now(),
      };

      await offlineService.queueAction(action);

      const queuedActions = offlineService.getQueuedActions();
      expect(queuedActions).toHaveLength(1);
      expect(queuedActions[0]).toMatchObject(action);
    });

    it('executes actions immediately when online', async () => {
      navigator.onLine = true;
      const mockFetch = jest.fn().mockResolvedValue({ ok: true, json: () => ({ success: true }) });
      global.fetch = mockFetch;

      const action = {
        type: 'API_CALL',
        endpoint: '/api/test',
        method: 'POST',
        data: { test: 'data' },
        timestamp: Date.now(),
      };

      await offlineService.queueAction(action);

      expect(mockFetch).toHaveBeenCalledWith('/api/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ test: 'data' }),
      });

      const queuedActions = offlineService.getQueuedActions();
      expect(queuedActions).toHaveLength(0);
    });

    it('processes queued actions when coming back online', async () => {
      navigator.onLine = false;
      const mockFetch = jest.fn().mockResolvedValue({ ok: true, json: () => ({ success: true }) });
      global.fetch = mockFetch;

      // Queue action while offline
      const action = {
        type: 'API_CALL',
        endpoint: '/api/test',
        method: 'POST',
        data: { test: 'data' },
        timestamp: Date.now(),
      };

      await offlineService.queueAction(action);
      expect(offlineService.getQueuedActions()).toHaveLength(1);

      // Come back online
      navigator.onLine = true;
      act(() => {
        window.dispatchEvent(mockOnlineEvent);
      });

      await waitFor(() => {
        expect(offlineService.getQueuedActions()).toHaveLength(0);
      });

      expect(mockFetch).toHaveBeenCalled();
    });
  });

  describe('Failed Action Handling', () => {
    it('handles failed actions and moves them to failed queue', async () => {
      navigator.onLine = true;
      const mockFetch = jest.fn().mockRejectedValue(new Error('Network error'));
      global.fetch = mockFetch;

      const action = {
        type: 'API_CALL',
        endpoint: '/api/test',
        method: 'POST',
        data: { test: 'data' },
        timestamp: Date.now(),
      };

      await offlineService.queueAction(action);

      const failedActions = offlineService.getFailedActions();
      expect(failedActions).toHaveLength(1);
      expect(failedActions[0].error).toBeDefined();
    });

    it('retries failed actions on sync', async () => {
      const mockFetch = jest.fn()
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({ ok: true, json: () => ({ success: true }) });
      global.fetch = mockFetch;

      // Add failed action
      const action = {
        type: 'API_CALL',
        endpoint: '/api/test',
        method: 'POST',
        data: { test: 'data' },
        timestamp: Date.now(),
        error: 'Network error',
      };

      offlineService.addFailedAction(action);

      // Sync should retry
      await offlineService.sync();

      expect(mockFetch).toHaveBeenCalledTimes(2);
      expect(offlineService.getFailedActions()).toHaveLength(0);
    });
  });

  describe('Data Persistence', () => {
    it('persists data when offline', async () => {
      navigator.onLine = false;

      const data = { key: 'test', value: 'offline data' };
      await offlineService.persistData(data.key, data.value);

      const persistedData = offlineService.getPersistedData(data.key);
      expect(persistedData).toEqual(data.value);
    });

    it('syncs persisted data when online', async () => {
      navigator.onLine = false;
      const mockFetch = jest.fn().mockResolvedValue({ ok: true });
      global.fetch = mockFetch;

      // Persist data while offline
      const data = { key: 'test', value: 'offline data' };
      await offlineService.persistData(data.key, data.value);

      // Come back online
      navigator.onLine = true;
      act(() => {
        window.dispatchEvent(mockOnlineEvent);
      });

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalled();
      });
    });
  });

  describe('Error Handling', () => {
    it('handles storage errors gracefully', async () => {
      // Mock localStorage to throw error
      const originalSetItem = localStorage.setItem;
      localStorage.setItem = jest.fn().mockImplementation(() => {
        throw new Error('Storage quota exceeded');
      });

      navigator.onLine = false;

      const action = {
        type: 'API_CALL',
        endpoint: '/api/test',
        method: 'POST',
        data: { test: 'data' },
        timestamp: Date.now(),
      };

      await offlineService.queueAction(action);

      expect(mockErrorHandler.handleError).toHaveBeenCalledWith(
        expect.any(Error),
        expect.objectContaining({
          component: 'OfflineService',
          action: 'queue_action',
        })
      );

      // Restore localStorage
      localStorage.setItem = originalSetItem;
    });

    it('handles sync errors gracefully', async () => {
      const mockFetch = jest.fn().mockRejectedValue(new Error('Sync failed'));
      global.fetch = mockFetch;

      // Add queued action
      const action = {
        type: 'API_CALL',
        endpoint: '/api/test',
        method: 'POST',
        data: { test: 'data' },
        timestamp: Date.now(),
      };

      offlineService.addQueuedAction(action);

      await offlineService.sync();

      expect(mockErrorHandler.handleError).toHaveBeenCalledWith(
        expect.any(Error),
        expect.objectContaining({
          component: 'OfflineService',
          action: 'sync_actions',
        })
      );
    });
  });
});

describe('useOffline Hook', () => {
  const TestComponent = () => {
    const { isOnline, isOffline, queueAction, sync } = useOffline();

    return (
      <div>
        <div data-testid="status">
          {isOnline ? 'Online' : 'Offline'}
        </div>
        <button
          data-testid="queue-action"
          onClick={() => queueAction({
            type: 'API_CALL',
            endpoint: '/api/test',
            method: 'POST',
            data: { test: 'data' },
            timestamp: Date.now(),
          })}
        >
          Queue Action
        </button>
        <button data-testid="sync" onClick={sync}>
          Sync
        </button>
      </div>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('provides online status', () => {
    navigator.onLine = true;
    render(<TestComponent />);

    expect(screen.getByTestId('status')).toHaveTextContent('Online');
  });

  it('provides offline status', () => {
    navigator.onLine = false;
    render(<TestComponent />);

    expect(screen.getByTestId('status')).toHaveTextContent('Offline');
  });

  it('updates status when network changes', () => {
    navigator.onLine = true;
    render(<TestComponent />);

    expect(screen.getByTestId('status')).toHaveTextContent('Online');

    navigator.onLine = false;
    act(() => {
      window.dispatchEvent(mockOfflineEvent);
    });

    expect(screen.getByTestId('status')).toHaveTextContent('Offline');
  });

  it('queues actions when offline', async () => {
    navigator.onLine = false;
    render(<TestComponent />);

    const queueButton = screen.getByTestId('queue-action');
    fireEvent.click(queueButton);

    // Should not throw error
    expect(screen.getByTestId('queue-action')).toBeInTheDocument();
  });
});

describe('Offline Edge Cases', () => {
  let offlineService: OfflineService;

  beforeEach(() => {
    offlineService = new OfflineService();
  });

  afterEach(() => {
    offlineService.destroy();
  });

  describe('Storage Limits', () => {
    it('handles storage quota exceeded', async () => {
      // Mock localStorage to simulate quota exceeded
      const originalSetItem = localStorage.setItem;
      localStorage.setItem = jest.fn().mockImplementation(() => {
        throw new DOMException('QuotaExceededError');
      });

      navigator.onLine = false;

      const action = {
        type: 'API_CALL',
        endpoint: '/api/test',
        method: 'POST',
        data: { test: 'data' },
        timestamp: Date.now(),
      };

      await offlineService.queueAction(action);

      expect(mockErrorHandler.handleError).toHaveBeenCalledWith(
        expect.any(DOMException),
        expect.objectContaining({
          component: 'OfflineService',
          action: 'queue_action',
        })
      );

      localStorage.setItem = originalSetItem;
    });

    it('cleans up old actions when storage is full', async () => {
      navigator.onLine = false;

      // Add many actions to simulate storage pressure
      for (let i = 0; i < 100; i++) {
        await offlineService.queueAction({
          type: 'API_CALL',
          endpoint: `/api/test/${i}`,
          method: 'POST',
          data: { test: `data-${i}` },
          timestamp: Date.now() - (100 - i) * 1000, // Stagger timestamps
        });
      }

      const queuedActions = offlineService.getQueuedActions();
      expect(queuedActions.length).toBeLessThanOrEqual(50); // Should be limited
    });
  });

  describe('Network Flapping', () => {
    it('handles rapid online/offline transitions', async () => {
      const mockFetch = jest.fn().mockResolvedValue({ ok: true, json: () => ({ success: true }) });
      global.fetch = mockFetch;

      // Rapidly toggle network status
      for (let i = 0; i < 5; i++) {
        navigator.onLine = false;
        act(() => {
          window.dispatchEvent(mockOfflineEvent);
        });

        await offlineService.queueAction({
          type: 'API_CALL',
          endpoint: `/api/test/${i}`,
          method: 'POST',
          data: { test: `data-${i}` },
          timestamp: Date.now(),
        });

        navigator.onLine = true;
        act(() => {
          window.dispatchEvent(mockOnlineEvent);
        });

        await new Promise(resolve => setTimeout(resolve, 10));
      }

      // Should handle all transitions gracefully
      expect(offlineService.getQueuedActions()).toHaveLength(0);
    });
  });

  describe('Concurrent Operations', () => {
    it('handles concurrent queue operations', async () => {
      navigator.onLine = false;

      const promises = [];
      for (let i = 0; i < 10; i++) {
        promises.push(offlineService.queueAction({
          type: 'API_CALL',
          endpoint: `/api/test/${i}`,
          method: 'POST',
          data: { test: `data-${i}` },
          timestamp: Date.now(),
        }));
      }

      await Promise.all(promises);

      const queuedActions = offlineService.getQueuedActions();
      expect(queuedActions).toHaveLength(10);
    });

    it('handles concurrent sync operations', async () => {
      const mockFetch = jest.fn().mockResolvedValue({ ok: true, json: () => ({ success: true }) });
      global.fetch = mockFetch;

      // Add multiple actions
      for (let i = 0; i < 5; i++) {
        offlineService.addQueuedAction({
          type: 'API_CALL',
          endpoint: `/api/test/${i}`,
          method: 'POST',
          data: { test: `data-${i}` },
          timestamp: Date.now(),
        });
      }

      // Start multiple sync operations
      const syncPromises = [
        offlineService.sync(),
        offlineService.sync(),
        offlineService.sync(),
      ];

      await Promise.all(syncPromises);

      // Should handle concurrent syncs gracefully
      expect(offlineService.getQueuedActions()).toHaveLength(0);
    });
  });

  describe('Data Corruption', () => {
    it('handles corrupted stored data', async () => {
      // Mock localStorage to return corrupted data
      const originalGetItem = localStorage.getItem;
      localStorage.getItem = jest.fn().mockReturnValue('corrupted-json-data');

      navigator.onLine = false;

      const action = {
        type: 'API_CALL',
        endpoint: '/api/test',
        method: 'POST',
        data: { test: 'data' },
        timestamp: Date.now(),
      };

      await offlineService.queueAction(action);

      expect(mockErrorHandler.handleError).toHaveBeenCalledWith(
        expect.any(Error),
        expect.objectContaining({
          component: 'OfflineService',
          action: 'load_queued_actions',
        })
      );

      localStorage.getItem = originalGetItem;
    });
  });
});

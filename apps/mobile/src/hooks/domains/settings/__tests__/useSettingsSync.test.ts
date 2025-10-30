/**
 * Tests for useSettingsSync hook
 * Tests settings synchronization with backend
 */

import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useSettingsSync } from '../useSettingsSync';
import { matchesAPI } from '../../../../services/api';
import { logger } from '@pawfectmatch/core';
import type { User } from '@pawfectmatch/core';

// Mock dependencies
jest.mock('../../../../services/api');
jest.mock('@pawfectmatch/core', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
  },
}));

const mockMatchesAPI = matchesAPI as jest.Mocked<typeof matchesAPI>;
const mockLogger = logger as jest.Mocked<typeof logger>;

describe('useSettingsSync', () => {
  const mockSettings: User['preferences'] = {
    ageMin: 18,
    ageMax: 35,
    distance: 50,
    showMe: 'all',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockMatchesAPI.updateUserSettings = jest.fn().mockResolvedValue(undefined);
  });

  describe('Initialization', () => {
    it('should initialize with default state', () => {
      const { result } = renderHook(() => useSettingsSync());

      expect(result.current.isSyncing).toBe(false);
      expect(result.current.error).toBeNull();
      expect(result.current.syncSettings).toBeDefined();
    });

    it('should initialize with callbacks', () => {
      const onSyncSuccess = jest.fn();
      const onSyncError = jest.fn();

      const { result } = renderHook(() => useSettingsSync({ onSyncSuccess, onSyncError }));

      expect(result.current.syncSettings).toBeDefined();
    });
  });

  describe('Sync Settings', () => {
    it('should sync settings successfully', async () => {
      const onSyncSuccess = jest.fn();
      const { result } = renderHook(() => useSettingsSync({ onSyncSuccess }));

      let syncPromise: Promise<boolean>;
      act(() => {
        syncPromise = result.current.syncSettings(mockSettings);
      });

      expect(result.current.isSyncing).toBe(true);

      await act(async () => {
        await syncPromise!;
      });

      await waitFor(() => {
        expect(result.current.isSyncing).toBe(false);
      });

      expect(mockMatchesAPI.updateUserSettings).toHaveBeenCalledWith(mockSettings);
      expect(onSyncSuccess).toHaveBeenCalled();
      expect(mockLogger.info).toHaveBeenCalledWith('Settings synced successfully', {
        settings: mockSettings,
      });
    });

    it('should handle sync errors', async () => {
      const error = new Error('Network error');
      mockMatchesAPI.updateUserSettings.mockRejectedValue(error);
      const onSyncError = jest.fn();

      const { result } = renderHook(() => useSettingsSync({ onSyncError }));

      let syncPromise: Promise<boolean>;
      act(() => {
        syncPromise = result.current.syncSettings(mockSettings);
      });

      await act(async () => {
        await syncPromise!;
      });

      await waitFor(() => {
        expect(result.current.isSyncing).toBe(false);
        expect(result.current.error).toBe('Network error');
      });

      expect(onSyncError).toHaveBeenCalledWith(error);
      expect(mockLogger.error).toHaveBeenCalledWith('Failed to sync settings', {
        error: 'Network error',
      });
    });

    it('should handle non-Error exceptions', async () => {
      mockMatchesAPI.updateUserSettings.mockRejectedValue('String error');
      const onSyncError = jest.fn();

      const { result } = renderHook(() => useSettingsSync({ onSyncError }));

      let syncPromise: Promise<boolean>;
      act(() => {
        syncPromise = result.current.syncSettings(mockSettings);
      });

      await act(async () => {
        await syncPromise!;
      });

      await waitFor(() => {
        expect(result.current.error).toBe('Failed to sync settings');
        expect(result.current.isSyncing).toBe(false);
      });

      expect(onSyncError).toHaveBeenCalled();
    });

    it('should return true on success', async () => {
      const { result } = renderHook(() => useSettingsSync());

      let syncResult: boolean;
      act(() => {
        result.current.syncSettings(mockSettings).then((r) => {
          syncResult = r;
        });
      });

      await waitFor(() => {
        expect(syncResult!).toBe(true);
      });
    });

    it('should return false on failure', async () => {
      mockMatchesAPI.updateUserSettings.mockRejectedValue(new Error('Error'));

      const { result } = renderHook(() => useSettingsSync());

      let syncResult: boolean;
      act(() => {
        result.current.syncSettings(mockSettings).then((r) => {
          syncResult = r;
        });
      });

      await waitFor(() => {
        expect(syncResult!).toBe(false);
      });
    });
  });

  describe('State Management', () => {
    it('should set isSyncing during sync', async () => {
      const { result } = renderHook(() => useSettingsSync());

      act(() => {
        result.current.syncSettings(mockSettings);
      });

      expect(result.current.isSyncing).toBe(true);
      expect(result.current.error).toBeNull();

      await waitFor(() => {
        expect(result.current.isSyncing).toBe(false);
      });
    });

    it('should clear previous errors on new sync', async () => {
      mockMatchesAPI.updateUserSettings
        .mockRejectedValueOnce(new Error('First error'))
        .mockResolvedValueOnce(undefined);

      const { result } = renderHook(() => useSettingsSync());

      // First sync fails
      let syncPromise: Promise<boolean>;
      act(() => {
        syncPromise = result.current.syncSettings(mockSettings);
      });

      await act(async () => {
        await syncPromise!;
      });

      await waitFor(() => {
        expect(result.current.error).toBe('First error');
      });

      // Second sync succeeds
      act(() => {
        syncPromise = result.current.syncSettings(mockSettings);
      });

      expect(result.current.error).toBeNull();

      await act(async () => {
        await syncPromise!;
      });

      await waitFor(() => {
        expect(result.current.isSyncing).toBe(false);
        expect(result.current.error).toBeNull();
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty settings object', async () => {
      const { result } = renderHook(() => useSettingsSync());

      await act(async () => {
        await result.current.syncSettings({});
      });

      expect(mockMatchesAPI.updateUserSettings).toHaveBeenCalledWith({});
    });

    it('should work without callbacks', async () => {
      const { result } = renderHook(() => useSettingsSync());

      await act(async () => {
        await result.current.syncSettings(mockSettings);
      });

      expect(mockMatchesAPI.updateUserSettings).toHaveBeenCalled();
      expect(result.current.isSyncing).toBe(false);
    });

    it('should handle multiple rapid sync attempts', async () => {
      const { result } = renderHook(() => useSettingsSync());

      act(() => {
        result.current.syncSettings(mockSettings);
      });

      act(() => {
        result.current.syncSettings(mockSettings);
      });

      await waitFor(() => {
        expect(result.current.isSyncing).toBe(false);
      });

      expect(mockMatchesAPI.updateUserSettings).toHaveBeenCalled();
    });
  });
});

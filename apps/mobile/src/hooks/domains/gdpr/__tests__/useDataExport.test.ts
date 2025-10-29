/**
 * Comprehensive tests for useDataExport hook
 *
 * Coverage:
 * - GDPR data export functionality
 * - Export request initiation
 * - Export status tracking
 * - Download handling
 * - Error states and recovery
 * - Loading states
 * - Cache management
 * - Type safety
 */

import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import { renderHook, act, waitFor } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import { useDataExport } from '../useDataExport';

// Mock dependencies
jest.mock('@react-native-async-storage/async-storage');
jest.mock('expo-file-system', () => ({
  documentDirectory: 'file:///documents/',
  downloadAsync: jest.fn(),
  getInfoAsync: jest.fn(),
  deleteAsync: jest.fn(),
}));

// Mock the GDPR service
jest.mock('../../../services/gdprService', () => ({
  exportUserData: jest.fn(),
  downloadExport: jest.fn(),
}));

// Mock logger
jest.mock('@pawfectmatch/core', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
  },
}));

import { exportUserData, downloadExport } from '../../../services/gdprService';

const mockAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;
const mockFileSystem = FileSystem as jest.Mocked<typeof FileSystem>;
const mockExportUserData = exportUserData as jest.Mock;
const mockDownloadExport = downloadExport as jest.Mock;

describe('useDataExport', () => {
  const mockExportResponse = {
    success: true,
    exportId: 'export-123',
    estimatedTime: '2 minutes',
    message: 'Export started successfully',
    exportData: {
      profile: { name: 'John Doe', email: 'john@example.com' },
      matches: [{ id: 'match1', petName: 'Buddy' }],
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup default mocks
    mockAsyncStorage.getItem.mockResolvedValue(null);
    mockAsyncStorage.setItem.mockResolvedValue(undefined);
    mockAsyncStorage.removeItem.mockResolvedValue(undefined);

    mockExportUserData.mockResolvedValue(mockExportResponse);
    mockDownloadExport.mockResolvedValue(new Blob(['export data']));

    mockFileSystem.downloadAsync.mockResolvedValue({
      uri: 'file:///documents/export.json',
      status: 200,
      headers: {},
      mimeType: 'application/json',
    });

    mockFileSystem.getInfoAsync.mockResolvedValue({
      exists: true,
      size: 1024,
      uri: 'file:///documents/export.json',
      isDirectory: false,
    });
  });

  describe('Initial State', () => {
    it('should initialize with default state', () => {
      const { result } = renderHook(() => useDataExport());

      expect(result.current.isExporting).toBe(false);
      expect(result.current.isDownloading).toBe(false);
      expect(result.current.exportData).toBeNull();
      expect(result.current.downloadUrl).toBeNull();
      expect(result.current.error).toBeNull();
      expect(result.current.lastExportTime).toBeNull();
    });

    it('should load cached export data on mount', async () => {
      const cachedData = {
        exportId: 'cached-export-123',
        exportData: { profile: { name: 'Cached User' } },
        timestamp: Date.now(),
      };

      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(cachedData));

      const { result } = renderHook(() => useDataExport());

      await waitFor(() => {
        expect(result.current.exportData).toEqual(cachedData.exportData);
        expect(result.current.lastExportTime).toBe(cachedData.timestamp);
      });
    });

    it('should handle corrupted cache data gracefully', async () => {
      mockAsyncStorage.getItem.mockResolvedValue('invalid json');

      const { result } = renderHook(() => useDataExport());

      // Should not crash, should use default state
      expect(result.current.exportData).toBeNull();
      expect(result.current.error).toBeNull();
    });
  });

  describe('Export Data', () => {
    it('should successfully export user data with default options', async () => {
      const { result } = renderHook(() => useDataExport());

      await act(async () => {
        await result.current.exportData();
      });

      expect(mockExportUserData).toHaveBeenCalledWith({
        format: 'json',
        includeMessages: true,
        includeMatches: true,
        includeProfileData: true,
        includePreferences: true,
      });

      expect(result.current.isExporting).toBe(false);
      expect(result.current.exportData).toEqual(mockExportResponse.exportData);
      expect(result.current.lastExportTime).toBeGreaterThan(0);
    });

    it('should export data with custom options', async () => {
      const customOptions = {
        format: 'csv' as const,
        includeMessages: false,
        includeMatches: true,
        includeProfileData: true,
        includePreferences: false,
      };

      const { result } = renderHook(() => useDataExport());

      await act(async () => {
        await result.current.exportData(customOptions);
      });

      expect(mockExportUserData).toHaveBeenCalledWith(customOptions);
    });

    it('should handle export in progress state', async () => {
      let resolveExport: (value: any) => void;
      const exportPromise = new Promise((resolve) => {
        resolveExport = resolve;
      });

      mockExportUserData.mockReturnValue(exportPromise);

      const { result } = renderHook(() => useDataExport());

      // Start export
      act(() => {
        result.current.exportData();
      });

      expect(result.current.isExporting).toBe(true);

      // Complete export
      act(() => {
        resolveExport!(mockExportResponse);
      });

      await waitFor(() => {
        expect(result.current.isExporting).toBe(false);
      });
    });

    it('should handle export errors', async () => {
      const errorMessage = 'Export failed due to server error';
      mockExportUserData.mockRejectedValue(new Error(errorMessage));

      const { result } = renderHook(() => useDataExport());

      await act(async () => {
        await result.current.exportData();
      });

      expect(result.current.isExporting).toBe(false);
      expect(result.current.error).toBe(errorMessage);
      expect(result.current.exportData).toBeNull();
    });

    it('should clear previous errors on new export', async () => {
      // First export fails
      mockExportUserData.mockRejectedValueOnce(new Error('First error'));

      const { result } = renderHook(() => useDataExport());

      await act(async () => {
        await result.current.exportData();
      });

      expect(result.current.error).toBe('First error');

      // Second export succeeds
      mockExportUserData.mockResolvedValueOnce(mockExportResponse);

      await act(async () => {
        await result.current.exportData();
      });

      expect(result.current.error).toBeNull();
      expect(result.current.exportData).toEqual(mockExportResponse.exportData);
    });
  });

  describe('Download Export', () => {
    it('should successfully download exported data', async () => {
      const { result } = renderHook(() => useDataExport());

      // Set export data first
      await act(async () => {
        await result.current.exportData();
      });

      // Now download
      await act(async () => {
        await result.current.downloadExport();
      });

      expect(mockDownloadExport).toHaveBeenCalledWith('export-123');
      expect(mockFileSystem.downloadAsync).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          to: expect.stringContaining('gdpr-export'),
        }),
      );

      expect(result.current.isDownloading).toBe(false);
      expect(result.current.downloadUrl).toBe('file:///documents/export.json');
    });

    it('should handle download without export ID', async () => {
      const { result } = renderHook(() => useDataExport());

      await act(async () => {
        await result.current.downloadExport();
      });

      expect(mockDownloadExport).not.toHaveBeenCalled();
      expect(result.current.error).toBe('No export data available');
    });

    it('should handle download in progress state', async () => {
      let resolveDownload: (value: any) => void;
      const downloadPromise = new Promise((resolve) => {
        resolveDownload = resolve;
      });

      mockFileSystem.downloadAsync.mockReturnValue(downloadPromise);

      const { result } = renderHook(() => useDataExport());

      // Set export data
      act(() => {
        result.current.exportData = mockExportResponse.exportData;
        result.current.lastExportTime = Date.now();
      });

      // Start download
      act(() => {
        result.current.downloadExport();
      });

      expect(result.current.isDownloading).toBe(true);

      // Complete download
      act(() => {
        resolveDownload!({
          uri: 'file:///documents/completed-export.json',
          status: 200,
          headers: {},
          mimeType: 'application/json',
        });
      });

      await waitFor(() => {
        expect(result.current.isDownloading).toBe(false);
      });
    });

    it('should handle download errors', async () => {
      mockDownloadExport.mockRejectedValue(new Error('Download failed'));

      const { result } = renderHook(() => useDataExport());

      // Set export data
      act(() => {
        result.current.exportData = mockExportResponse.exportData;
      });

      await act(async () => {
        await result.current.downloadExport();
      });

      expect(result.current.isDownloading).toBe(false);
      expect(result.current.error).toBe('Download failed');
    });

    it('should handle file system errors during download', async () => {
      mockFileSystem.downloadAsync.mockRejectedValue(new Error('File system error'));

      const { result } = renderHook(() => useDataExport());

      // Set export data
      act(() => {
        result.current.exportData = mockExportResponse.exportData;
      });

      await act(async () => {
        await result.current.downloadExport();
      });

      expect(result.current.error).toBe('File system error');
    });
  });

  describe('Cache Management', () => {
    it('should cache export data', async () => {
      const { result } = renderHook(() => useDataExport());

      await act(async () => {
        await result.current.exportData();
      });

      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith('gdpr_export_data', expect.any(String));

      const cachedData = JSON.parse(mockAsyncStorage.setItem.mock.calls[0][1]);
      expect(cachedData.exportData).toEqual(mockExportResponse.exportData);
      expect(cachedData.timestamp).toBeDefined();
    });

    it('should clear cache when requested', async () => {
      const { result } = renderHook(() => useDataExport());

      // Set some data
      act(() => {
        result.current.exportData = mockExportResponse.exportData;
        result.current.lastExportTime = Date.now();
      });

      act(() => {
        result.current.clearCache();
      });

      expect(result.current.exportData).toBeNull();
      expect(result.current.lastExportTime).toBeNull();
      expect(result.current.downloadUrl).toBeNull();
      expect(result.current.error).toBeNull();

      expect(mockAsyncStorage.removeItem).toHaveBeenCalledWith('gdpr_export_data');
    });

    it('should handle cache clearing errors gracefully', async () => {
      mockAsyncStorage.removeItem.mockRejectedValue(new Error('Cache clear failed'));

      const { result } = renderHook(() => useDataExport());

      act(() => {
        result.current.clearCache();
      });

      // Should not throw, should continue with state reset
      expect(result.current.exportData).toBeNull();
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors during export', async () => {
      mockExportUserData.mockRejectedValue(new Error('Network Error'));

      const { result } = renderHook(() => useDataExport());

      await act(async () => {
        await result.current.exportData();
      });

      expect(result.current.error).toBe('Network Error');
    });

    it('should handle server errors with custom messages', async () => {
      mockExportUserData.mockRejectedValue({
        message: 'Server temporarily unavailable',
      });

      const { result } = renderHook(() => useDataExport());

      await act(async () => {
        await result.current.exportData();
      });

      expect(result.current.error).toBe('Server temporarily unavailable');
    });

    it('should handle malformed server responses', async () => {
      mockExportUserData.mockResolvedValue({
        success: true,
        // Missing required fields
      });

      const { result } = renderHook(() => useDataExport());

      await act(async () => {
        await result.current.exportData();
      });

      // Should handle gracefully
      expect(result.current.exportData).toBeDefined();
    });

    it('should reset error state on successful operations', async () => {
      // First operation fails
      mockExportUserData.mockRejectedValueOnce(new Error('First error'));

      const { result } = renderHook(() => useDataExport());

      await act(async () => {
        await result.current.exportData();
      });

      expect(result.current.error).toBe('First error');

      // Second operation succeeds
      mockExportUserData.mockResolvedValueOnce(mockExportResponse);

      await act(async () => {
        await result.current.exportData();
      });

      expect(result.current.error).toBeNull();
    });
  });

  describe('File Management', () => {
    it('should generate proper download filename', async () => {
      const { result } = renderHook(() => useDataExport());

      // Set export data
      act(() => {
        result.current.exportData = mockExportResponse.exportData;
      });

      await act(async () => {
        await result.current.downloadExport();
      });

      expect(mockFileSystem.downloadAsync).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          to: expect.stringContaining('gdpr-export-export-123'),
        }),
      );
    });

    it('should handle file cleanup on errors', async () => {
      mockFileSystem.downloadAsync.mockRejectedValue(new Error('Download failed'));
      mockFileSystem.deleteAsync.mockResolvedValue(undefined);

      const { result } = renderHook(() => useDataExport());

      // Set export data
      act(() => {
        result.current.exportData = mockExportResponse.exportData;
      });

      await act(async () => {
        await result.current.downloadExport();
      });

      // Should attempt to clean up partial downloads
      expect(mockFileSystem.deleteAsync).toHaveBeenCalled();
    });
  });

  describe('Concurrent Operations', () => {
    it('should prevent concurrent exports', async () => {
      let resolveExport: (value: any) => void;
      const exportPromise = new Promise((resolve) => {
        resolveExport = resolve;
      });

      mockExportUserData.mockReturnValue(exportPromise);

      const { result } = renderHook(() => useDataExport());

      // Start first export
      act(() => {
        result.current.exportData();
      });

      // Try second export while first is in progress
      act(() => {
        result.current.exportData();
      });

      expect(mockExportUserData).toHaveBeenCalledTimes(1); // Only one call

      // Complete first export
      act(() => {
        resolveExport!(mockExportResponse);
      });

      await waitFor(() => {
        expect(result.current.isExporting).toBe(false);
      });
    });

    it('should handle concurrent downloads', async () => {
      const { result } = renderHook(() => useDataExport());

      // Set export data
      act(() => {
        result.current.exportData = mockExportResponse.exportData;
      });

      // Start multiple downloads
      await act(async () => {
        await Promise.all([
          result.current.downloadExport(),
          result.current.downloadExport(),
          result.current.downloadExport(),
        ]);
      });

      expect(mockDownloadExport).toHaveBeenCalledTimes(1); // Only one actual download call
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty export data', async () => {
      const emptyResponse = {
        success: true,
        exportId: 'empty-export',
        estimatedTime: '1 minute',
        message: 'Export completed',
        exportData: {},
      };

      mockExportUserData.mockResolvedValue(emptyResponse);

      const { result } = renderHook(() => useDataExport());

      await act(async () => {
        await result.current.exportData();
      });

      expect(result.current.exportData).toEqual({});
    });

    it('should handle very large export data', async () => {
      const largeExportData = {
        profile: { name: 'A'.repeat(1000) },
        matches: Array.from({ length: 500 }, (_, i) => ({
          id: `match${i}`,
          data: 'x'.repeat(100),
        })),
      };

      const largeResponse = {
        success: true,
        exportId: 'large-export',
        estimatedTime: '10 minutes',
        message: 'Large export in progress',
        exportData: largeExportData,
      };

      mockExportUserData.mockResolvedValue(largeResponse);

      const { result } = renderHook(() => useDataExport());

      await act(async () => {
        await result.current.exportData();
      });

      expect(result.current.exportData).toEqual(largeExportData);
    });

    it('should handle export with missing optional fields', async () => {
      const minimalResponse = {
        success: true,
        exportId: 'minimal-export',
        estimatedTime: '30 seconds',
        message: 'Quick export',
        exportData: { profile: { name: 'Test' } },
      };

      mockExportUserData.mockResolvedValue(minimalResponse);

      const { result } = renderHook(() => useDataExport());

      await act(async () => {
        await result.current.exportData();
      });

      expect(result.current.exportData).toEqual({ profile: { name: 'Test' } });
    });

    it('should handle download with non-existent export', async () => {
      mockDownloadExport.mockRejectedValue(new Error('Export not found'));

      const { result } = renderHook(() => useDataExport());

      // Set invalid export data
      act(() => {
        result.current.exportData = { profile: { name: 'Test' } };
      });

      await act(async () => {
        await result.current.downloadExport();
      });

      expect(result.current.error).toBe('Export not found');
    });
  });
});

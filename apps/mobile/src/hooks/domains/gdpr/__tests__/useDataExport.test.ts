/**
 * Comprehensive tests for useDataExport hook
 *
 * Coverage:
 * - GDPR data export functionality
 * - Export request initiation
 * - Error states and recovery
 * - Loading states
 */

import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { renderHook, act, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import { useDataExport } from '../useDataExport';

// Mock dependencies
jest.mock('react-native', () => ({
  Alert: {
    alert: jest.fn(),
  },
}));

// Mock the GDPR service
jest.mock('../../../../services/gdprService', () => ({
  exportUserData: jest.fn(),
  downloadExport: jest.fn(),
  deleteAccount: jest.fn(),
  cancelDeletion: jest.fn(),
  confirmDeletion: jest.fn(),
  getAccountStatus: jest.fn(),
}));

// Mock logger
jest.mock('@pawfectmatch/core', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
  },
}));

import * as gdprService from '../../../../services/gdprService';

const mockExportUserData = gdprService.exportUserData as jest.MockedFunction<
  typeof gdprService.exportUserData
>;

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
    mockExportUserData.mockResolvedValue(mockExportResponse);
  });

  describe('Initial State', () => {
    it('should initialize with default state', () => {
      const { result } = renderHook(() => useDataExport());

      expect(result.current.isExporting).toBe(false);
      expect(result.current.error).toBeNull();
      expect(typeof result.current.exportData).toBe('function');
    });
  });

  describe('Export Data', () => {
    it('should successfully export user data', async () => {
      const { result } = renderHook(() => useDataExport());

      await act(async () => {
        await result.current.exportData();
      });

      expect(mockExportUserData).toHaveBeenCalledWith({});
      expect(result.current.isExporting).toBe(false);
      expect(result.current.error).toBeNull();
      expect(Alert.alert).toHaveBeenCalledWith(
        'Data Export Started',
        "Your data export has been initiated. You'll receive an email when it's ready.",
      );
    });

    it('should handle export in progress state', async () => {
      let resolveExport: (value: any) => void;
      const exportPromise = new Promise((resolve) => {
        resolveExport = resolve;
      });

      mockExportUserData.mockReturnValue(exportPromise as any);

      const { result } = renderHook(() => useDataExport());

      // Start export
      act(() => {
        void result.current.exportData();
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
      expect(Alert.alert).toHaveBeenCalledWith('Error', errorMessage);
    });

    it('should handle export failure response', async () => {
      const failureResponse = {
        success: false,
        message: 'Export failed',
        error: 'SERVER_ERROR',
      };

      mockExportUserData.mockResolvedValue(failureResponse);

      const { result } = renderHook(() => useDataExport());

      await act(async () => {
        await result.current.exportData();
      });

      expect(result.current.isExporting).toBe(false);
      expect(result.current.error).toBeNull();
      expect(Alert.alert).toHaveBeenCalledWith('Error', 'Export failed');
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
      const error = new Error('Server temporarily unavailable');
      mockExportUserData.mockRejectedValue(error);

      const { result } = renderHook(() => useDataExport());

      await act(async () => {
        await result.current.exportData();
      });

      expect(result.current.error).toBe('Server temporarily unavailable');
    });
  });
});

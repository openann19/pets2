/**
 * Comprehensive Tests for useDataExport Hook
 * GDPR Compliance Critical - Article 15 (Right to Data Portability)
 */

import { renderHook, act, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import { useDataExport } from '../useDataExport';
import * as gdprService from '../../../../services/gdprService';
import { logger } from '@pawfectmatch/core';

// Mock dependencies
jest.mock('../../../../services/gdprService', () => ({
  exportUserData: jest.fn(),
}));

jest.mock('@pawfectmatch/core', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
  },
}));

jest.spyOn(Alert, 'alert');

describe('useDataExport', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Initial State', () => {
    it('should initialize with correct default values', () => {
      const { result } = renderHook(() => useDataExport());

      expect(result.current.isExporting).toBe(false);
      expect(result.current.error).toBeNull();
      expect(typeof result.current.exportData).toBe('function');
    });
  });

  describe('Data Export', () => {
    it('should successfully export user data', async () => {
      const mockResponse = {
        success: true,
        exportId: 'export-123',
        url: 'https://example.com/export.json',
        estimatedTime: '5 minutes',
        message: 'Export started',
      };

      (gdprService.exportUserData as jest.Mock).mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useDataExport());

      let exportResult: boolean;
      await act(async () => {
        exportResult = await result.current.exportData();
      });

      await waitFor(() => {
        expect(result.current.isExporting).toBe(false);
      });

      expect(gdprService.exportUserData).toHaveBeenCalled();
      expect(result.current.error).toBeNull();
      expect(exportResult!).toBe(true);
      expect(Alert.alert).toHaveBeenCalledWith(
        'Data Export Started',
        expect.stringContaining('email'),
      );
      expect(logger.info).toHaveBeenCalledWith('Data export requested', {
        exportId: 'export-123',
      });
    });

    it('should handle failed export request', async () => {
      const mockResponse = {
        success: false,
        message: 'Rate limit exceeded',
        error: 'RATE_LIMIT',
      };

      (gdprService.exportUserData as jest.Mock).mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useDataExport());

      let exportResult: boolean;
      await act(async () => {
        exportResult = await result.current.exportData();
      });

      await waitFor(() => {
        expect(result.current.isExporting).toBe(false);
      });

      expect(exportResult!).toBe(false);
      expect(Alert.alert).toHaveBeenCalledWith('Error', 'Rate limit exceeded');
    });

    it('should handle service errors gracefully', async () => {
      const error = new Error('Network error');
      (gdprService.exportUserData as jest.Mock).mockRejectedValue(error);

      const { result } = renderHook(() => useDataExport());

      await act(async () => {
        await result.current.exportData();
      });

      await waitFor(() => {
        expect(result.current.isExporting).toBe(false);
      });

      expect(result.current.error).toBe('Network error');
      expect(Alert.alert).toHaveBeenCalledWith('Error', 'Network error');
      expect(logger.error).toHaveBeenCalledWith('Data export failed:', {
        error: 'Network error',
      });
    });

    it('should set isExporting state during export', async () => {
      let resolvePromise: (value: any) => void;
      const promise = new Promise((resolve) => {
        resolvePromise = resolve;
      });

      (gdprService.exportUserData as jest.Mock).mockReturnValue(promise);

      const { result } = renderHook(() => useDataExport());

      act(() => {
        result.current.exportData();
      });

      expect(result.current.isExporting).toBe(true);

      await act(async () => {
        resolvePromise!({ success: true, exportId: 'export-123' });
        await promise;
      });

      await waitFor(() => {
        expect(result.current.isExporting).toBe(false);
      });
    });

    it('should handle export with estimated completion time', async () => {
      const mockResponse = {
        success: true,
        exportId: 'export-456',
        estimatedCompletion: '2024-12-31T12:00:00Z',
        estimatedTime: '10 minutes',
        message: 'Export queued',
      };

      (gdprService.exportUserData as jest.Mock).mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useDataExport());

      await act(async () => {
        await result.current.exportData();
      });

      expect(result.current.error).toBeNull();
      expect(Alert.alert).toHaveBeenCalled();
      expect(logger.info).toHaveBeenCalledWith('Data export requested', {
        exportId: 'export-456',
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle non-Error exceptions', async () => {
      (gdprService.exportUserData as jest.Mock).mockRejectedValue('String error');

      const { result } = renderHook(() => useDataExport());

      await act(async () => {
        await result.current.exportData();
      });

      await waitFor(() => {
        expect(result.current.isExporting).toBe(false);
      });

      expect(result.current.error).toBe('Failed to export data');
      expect(Alert.alert).toHaveBeenCalledWith('Error', 'Failed to export data');
    });

    it('should clear error state on new export request', async () => {
      (gdprService.exportUserData as jest.Mock)
        .mockRejectedValueOnce(new Error('First error'))
        .mockResolvedValueOnce({ success: true, exportId: 'export-789' });

      const { result } = renderHook(() => useDataExport());

      await act(async () => {
        await result.current.exportData();
      });

      expect(result.current.error).toBe('First error');

      await act(async () => {
        await result.current.exportData();
      });

      await waitFor(() => {
        expect(result.current.error).toBeNull();
      });
    });

    it('should handle missing error message in response', async () => {
      const mockResponse = {
        success: false,
        message: undefined,
      };

      (gdprService.exportUserData as jest.Mock).mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useDataExport());

      await act(async () => {
        await result.current.exportData();
      });

      expect(Alert.alert).toHaveBeenCalledWith('Error', 'Failed to export data');
    });
  });

  describe('Edge Cases', () => {
    it('should handle rapid sequential export requests', async () => {
      (gdprService.exportUserData as jest.Mock).mockResolvedValue({
        success: true,
        exportId: 'export-rapid',
      });

      const { result } = renderHook(() => useDataExport());

      await act(async () => {
        await Promise.all([
          result.current.exportData(),
          result.current.exportData(),
        ]);
      });

      // Should handle both requests
      expect(gdprService.exportUserData).toHaveBeenCalledTimes(2);
    });

    it('should handle export with different formats', async () => {
      const mockResponse = {
        success: true,
        exportId: 'export-format',
        format: 'json',
        url: 'https://example.com/export.json',
      };

      (gdprService.exportUserData as jest.Mock).mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useDataExport());

      await act(async () => {
        await result.current.exportData();
      });

      expect(result.current.error).toBeNull();
      expect(result.current.isExporting).toBe(false);
    });

    it('should handle large export with long estimated time', async () => {
      const mockResponse = {
        success: true,
        exportId: 'export-large',
        estimatedTime: '2 hours',
        estimatedCompletion: '2024-12-31T14:00:00Z',
        message: 'Large export queued',
      };

      (gdprService.exportUserData as jest.Mock).mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useDataExport());

      await act(async () => {
        await result.current.exportData();
      });

      expect(result.current.error).toBeNull();
      expect(Alert.alert).toHaveBeenCalled();
    });
  });
});


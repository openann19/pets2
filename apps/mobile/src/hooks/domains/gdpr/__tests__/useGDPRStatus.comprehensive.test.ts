/**
 * Comprehensive Tests for useGDPRStatus Hook
 * GDPR Compliance Critical - Status Checking and Grace Period Management
 */

import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useGDPRStatus } from '../useGDPRStatus';
import * as gdprService from '../../../../services/gdprService';
import { logger } from '@pawfectmatch/core';

// Mock dependencies
jest.mock('../../../../services/gdprService', () => ({
  getAccountStatus: jest.fn(),
}));

jest.mock('@pawfectmatch/core', () => ({
  logger: {
    error: jest.fn(),
    info: jest.fn(),
  },
}));

describe('useGDPRStatus', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Initial State', () => {
    it('should initialize with correct default values', () => {
      (gdprService.getAccountStatus as jest.Mock).mockResolvedValue({
        success: true,
        status: 'not-found',
      });

      const { result } = renderHook(() => useGDPRStatus());

      expect(result.current.status.isPending).toBe(false);
      expect(result.current.status.daysRemaining).toBeNull();
      expect(result.current.status.gracePeriodEndsAt).toBeNull();
      expect(result.current.status.canCancel).toBe(false);
      expect(result.current.isLoading).toBe(true);
      expect(typeof result.current.refresh).toBe('function');
    });

    it('should auto-refresh on mount', async () => {
      (gdprService.getAccountStatus as jest.Mock).mockResolvedValue({
        success: true,
        status: 'not-found',
      });

      const { result } = renderHook(() => useGDPRStatus());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(gdprService.getAccountStatus).toHaveBeenCalled();
    });
  });

  describe('Pending Deletion Status', () => {
    it('should handle pending deletion status with days remaining', async () => {
      const mockResponse = {
        success: true,
        status: 'pending',
        daysRemaining: 15,
        scheduledDeletionDate: '2024-12-31T00:00:00Z',
        canCancel: true,
      };

      (gdprService.getAccountStatus as jest.Mock).mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useGDPRStatus());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.status.isPending).toBe(true);
      expect(result.current.status.daysRemaining).toBe(15);
      expect(result.current.status.gracePeriodEndsAt).toBe('2024-12-31T00:00:00Z');
      expect(result.current.status.canCancel).toBe(true);
    });

    it('should default to 30 days if daysRemaining not provided', async () => {
      const mockResponse = {
        success: true,
        status: 'pending',
        scheduledDeletionDate: '2024-12-31T00:00:00Z',
        canCancel: true,
      };

      (gdprService.getAccountStatus as jest.Mock).mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useGDPRStatus());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.status.isPending).toBe(true);
      expect(result.current.status.daysRemaining).toBe(30);
    });

    it('should handle pending status without scheduled date', async () => {
      const mockResponse = {
        success: true,
        status: 'pending',
        daysRemaining: 20,
        canCancel: false,
      };

      (gdprService.getAccountStatus as jest.Mock).mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useGDPRStatus());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.status.isPending).toBe(true);
      expect(result.current.status.gracePeriodEndsAt).toBeNull();
      expect(result.current.status.canCancel).toBe(false);
    });
  });

  describe('No Pending Deletion', () => {
    it('should handle not-found status', async () => {
      const mockResponse = {
        success: true,
        status: 'not-found',
      };

      (gdprService.getAccountStatus as jest.Mock).mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useGDPRStatus());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.status.isPending).toBe(false);
      expect(result.current.status.daysRemaining).toBeNull();
      expect(result.current.status.gracePeriodEndsAt).toBeNull();
      expect(result.current.status.canCancel).toBe(false);
    });

    it('should handle processing status', async () => {
      const mockResponse = {
        success: true,
        status: 'processing',
      };

      (gdprService.getAccountStatus as jest.Mock).mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useGDPRStatus());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.status.isPending).toBe(false);
    });

    it('should handle completed status', async () => {
      const mockResponse = {
        success: true,
        status: 'completed',
      };

      (gdprService.getAccountStatus as jest.Mock).mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useGDPRStatus());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.status.isPending).toBe(false);
    });
  });

  describe('Refresh Functionality', () => {
    it('should refresh status when called', async () => {
      (gdprService.getAccountStatus as jest.Mock)
        .mockResolvedValueOnce({
          success: true,
          status: 'not-found',
        })
        .mockResolvedValueOnce({
          success: true,
          status: 'pending',
          daysRemaining: 10,
          scheduledDeletionDate: '2024-12-25T00:00:00Z',
          canCancel: true,
        });

      const { result } = renderHook(() => useGDPRStatus());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.status.isPending).toBe(false);

      await act(async () => {
        await result.current.refresh();
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.status.isPending).toBe(true);
      expect(result.current.status.daysRemaining).toBe(10);
      expect(gdprService.getAccountStatus).toHaveBeenCalledTimes(2);
    });

    it('should handle loading state during refresh', async () => {
      let resolvePromise: (value: any) => void;
      const promise = new Promise((resolve) => {
        resolvePromise = resolve;
      });

      (gdprService.getAccountStatus as jest.Mock)
        .mockResolvedValueOnce({
          success: true,
          status: 'not-found',
        })
        .mockReturnValueOnce(promise);

      const { result } = renderHook(() => useGDPRStatus());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      act(() => {
        result.current.refresh();
      });

      expect(result.current.isLoading).toBe(true);

      await act(async () => {
        resolvePromise!({
          success: true,
          status: 'not-found',
        });
        await promise;
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle service errors gracefully', async () => {
      const error = new Error('Service unavailable');
      (gdprService.getAccountStatus as jest.Mock).mockRejectedValue(error);

      const { result } = renderHook(() => useGDPRStatus());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.status.isPending).toBe(false);
      expect(logger.error).toHaveBeenCalledWith('Failed to check GDPR status:', {
        error,
      });
    });

    it('should handle failed API response', async () => {
      (gdprService.getAccountStatus as jest.Mock).mockResolvedValue({
        success: false,
        status: 'not-found',
      });

      const { result } = renderHook(() => useGDPRStatus());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Should default to no pending deletion
      expect(result.current.status.isPending).toBe(false);
    });

    it('should handle refresh errors', async () => {
      (gdprService.getAccountStatus as jest.Mock)
        .mockResolvedValueOnce({
          success: true,
          status: 'not-found',
        })
        .mockRejectedValueOnce(new Error('Refresh error'));

      const { result } = renderHook(() => useGDPRStatus());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.refresh();
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(logger.error).toHaveBeenCalledWith('Failed to check GDPR status:', {
        error: expect.any(Error),
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle zero days remaining', async () => {
      const mockResponse = {
        success: true,
        status: 'pending',
        daysRemaining: 0,
        scheduledDeletionDate: '2024-01-01T00:00:00Z',
        canCancel: false,
      };

      (gdprService.getAccountStatus as jest.Mock).mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useGDPRStatus());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.status.daysRemaining).toBe(0);
      expect(result.current.status.canCancel).toBe(false);
    });

    it('should handle very large days remaining', async () => {
      const mockResponse = {
        success: true,
        status: 'pending',
        daysRemaining: 999,
        scheduledDeletionDate: '2027-01-01T00:00:00Z',
        canCancel: true,
      };

      (gdprService.getAccountStatus as jest.Mock).mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useGDPRStatus());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.status.daysRemaining).toBe(999);
    });

    it('should handle rapid refresh calls', async () => {
      (gdprService.getAccountStatus as jest.Mock).mockResolvedValue({
        success: true,
        status: 'not-found',
      });

      const { result } = renderHook(() => useGDPRStatus());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await Promise.all([
          result.current.refresh(),
          result.current.refresh(),
          result.current.refresh(),
        ]);
      });

      // Should handle all refresh calls
      expect(gdprService.getAccountStatus).toHaveBeenCalledTimes(4); // 1 initial + 3 refreshes
    });
  });
});


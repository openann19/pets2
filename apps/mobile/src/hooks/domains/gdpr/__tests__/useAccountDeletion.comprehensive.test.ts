/**
 * Comprehensive Tests for useAccountDeletion Hook
 * GDPR Compliance Critical - Article 17 (Right to Erasure)
 */

import { renderHook, act, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import { useAccountDeletion } from '../useAccountDeletion';
import * as gdprService from '../../../../services/gdprService';
import { logger } from '@pawfectmatch/core';

// Mock dependencies
jest.mock('../../../../services/gdprService', () => ({
  deleteAccount: jest.fn(),
  cancelDeletion: jest.fn(),
}));

jest.mock('@pawfectmatch/core', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
  },
}));

jest.spyOn(Alert, 'alert');

describe('useAccountDeletion', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Initial State', () => {
    it('should initialize with correct default values', () => {
      const { result } = renderHook(() => useAccountDeletion());

      expect(result.current.isDeleting).toBe(false);
      expect(result.current.error).toBeNull();
      expect(typeof result.current.requestDeletion).toBe('function');
      expect(typeof result.current.cancelDeletion).toBe('function');
    });
  });

  describe('Request Deletion', () => {
    it('should successfully request account deletion', async () => {
      const mockResponse = {
        success: true,
        deletionId: 'del-123',
        gracePeriodEndsAt: '2024-12-31T00:00:00Z',
        canCancel: true,
        message: 'Deletion requested',
      };

      (gdprService.deleteAccount as jest.Mock).mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useAccountDeletion());

      let deletionResult: boolean;
      await act(async () => {
        deletionResult = await result.current.requestDeletion('password123');
      });

      await waitFor(() => {
        expect(result.current.isDeleting).toBe(false);
      });

      expect(gdprService.deleteAccount).toHaveBeenCalledWith({
        password: 'password123',
        reason: undefined,
        feedback: undefined,
      });
      expect(result.current.error).toBeNull();
      expect(deletionResult!).toBe(true);
      expect(Alert.alert).toHaveBeenCalledWith(
        'Account Deletion Requested',
        expect.stringContaining('30 days'),
        [{ text: 'OK' }],
      );
      expect(logger.info).toHaveBeenCalledWith('Account deletion requested', {
        deletionId: 'del-123',
      });
    });

    it('should handle deletion request with reason and feedback', async () => {
      const mockResponse = {
        success: true,
        deletionId: 'del-456',
        message: 'Deletion requested',
      };

      (gdprService.deleteAccount as jest.Mock).mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useAccountDeletion());

      await act(async () => {
        await result.current.requestDeletion('password123', 'Privacy concerns', 'Better features needed');
      });

      expect(gdprService.deleteAccount).toHaveBeenCalledWith({
        password: 'password123',
        reason: 'Privacy concerns',
        feedback: 'Better features needed',
      });
    });

    it('should handle failed deletion request', async () => {
      const mockResponse = {
        success: false,
        message: 'Invalid password',
        error: 'INVALID_PASSWORD',
      };

      (gdprService.deleteAccount as jest.Mock).mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useAccountDeletion());

      let deletionResult: boolean;
      await act(async () => {
        deletionResult = await result.current.requestDeletion('wrongpassword');
      });

      await waitFor(() => {
        expect(result.current.isDeleting).toBe(false);
      });

      expect(deletionResult!).toBe(false);
      expect(result.current.error).toBeNull(); // Error handled by service
    });

    it('should handle service errors gracefully', async () => {
      const error = new Error('Network error');
      (gdprService.deleteAccount as jest.Mock).mockRejectedValue(error);

      const { result } = renderHook(() => useAccountDeletion());

      await act(async () => {
        await result.current.requestDeletion('password123');
      });

      await waitFor(() => {
        expect(result.current.isDeleting).toBe(false);
      });

      expect(result.current.error).toBe('Network error');
      expect(Alert.alert).toHaveBeenCalledWith('Error', 'Network error');
      expect(logger.error).toHaveBeenCalledWith(
        'Account deletion request failed:',
        { error: 'Network error' },
      );
    });

    it('should set isDeleting state during request', async () => {
      let resolvePromise: (value: any) => void;
      const promise = new Promise((resolve) => {
        resolvePromise = resolve;
      });

      (gdprService.deleteAccount as jest.Mock).mockReturnValue(promise);

      const { result } = renderHook(() => useAccountDeletion());

      act(() => {
        result.current.requestDeletion('password123');
      });

      expect(result.current.isDeleting).toBe(true);

      await act(async () => {
        resolvePromise!({ success: true, message: 'Deletion requested' });
        await promise;
      });

      await waitFor(() => {
        expect(result.current.isDeleting).toBe(false);
      });
    });
  });

  describe('Cancel Deletion', () => {
    it('should successfully cancel account deletion', async () => {
      const mockResponse = {
        success: true,
        message: 'Deletion cancelled',
      };

      (gdprService.cancelDeletion as jest.Mock).mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useAccountDeletion());

      let cancelResult: boolean;
      await act(async () => {
        cancelResult = await result.current.cancelDeletion();
      });

      await waitFor(() => {
        expect(result.current.isDeleting).toBe(false);
      });

      expect(gdprService.cancelDeletion).toHaveBeenCalled();
      expect(result.current.error).toBeNull();
      expect(cancelResult!).toBe(true);
      expect(Alert.alert).toHaveBeenCalledWith(
        'Deletion Cancelled',
        'Your account deletion has been cancelled.',
      );
      expect(logger.info).toHaveBeenCalledWith('Account deletion cancelled');
    });

    it('should handle failed cancellation', async () => {
      const mockResponse = {
        success: false,
        message: 'Cannot cancel',
      };

      (gdprService.cancelDeletion as jest.Mock).mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useAccountDeletion());

      let cancelResult: boolean;
      await act(async () => {
        cancelResult = await result.current.cancelDeletion();
      });

      await waitFor(() => {
        expect(result.current.isDeleting).toBe(false);
      });

      expect(cancelResult!).toBe(false);
    });

    it('should handle cancellation errors gracefully', async () => {
      const error = new Error('Service unavailable');
      (gdprService.cancelDeletion as jest.Mock).mockRejectedValue(error);

      const { result } = renderHook(() => useAccountDeletion());

      await act(async () => {
        await result.current.cancelDeletion();
      });

      await waitFor(() => {
        expect(result.current.isDeleting).toBe(false);
      });

      expect(result.current.error).toBe('Service unavailable');
      expect(logger.error).toHaveBeenCalledWith('Failed to cancel account deletion:', {
        error: 'Service unavailable',
      });
    });

    it('should set isDeleting state during cancellation', async () => {
      let resolvePromise: (value: any) => void;
      const promise = new Promise((resolve) => {
        resolvePromise = resolve;
      });

      (gdprService.cancelDeletion as jest.Mock).mockReturnValue(promise);

      const { result } = renderHook(() => useAccountDeletion());

      act(() => {
        result.current.cancelDeletion();
      });

      expect(result.current.isDeleting).toBe(true);

      await act(async () => {
        resolvePromise!({ success: true, message: 'Cancelled' });
        await promise;
      });

      await waitFor(() => {
        expect(result.current.isDeleting).toBe(false);
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle non-Error exceptions', async () => {
      (gdprService.deleteAccount as jest.Mock).mockRejectedValue('String error');

      const { result } = renderHook(() => useAccountDeletion());

      await act(async () => {
        await result.current.requestDeletion('password123');
      });

      await waitFor(() => {
        expect(result.current.isDeleting).toBe(false);
      });

      expect(result.current.error).toBe('Failed to request account deletion');
    });

    it('should clear error on new deletion request', async () => {
      (gdprService.deleteAccount as jest.Mock)
        .mockRejectedValueOnce(new Error('First error'))
        .mockResolvedValueOnce({ success: true, message: 'Success' });

      const { result } = renderHook(() => useAccountDeletion());

      await act(async () => {
        await result.current.requestDeletion('password123');
      });

      expect(result.current.error).toBe('First error');

      await act(async () => {
        await result.current.requestDeletion('password123');
      });

      await waitFor(() => {
        expect(result.current.error).toBeNull();
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty password', async () => {
      const { result } = renderHook(() => useAccountDeletion());

      await act(async () => {
        await result.current.requestDeletion('');
      });

      // Service should validate, but hook should handle gracefully
      expect(gdprService.deleteAccount).toHaveBeenCalledWith({
        password: '',
        reason: undefined,
        feedback: undefined,
      });
    });

    it('should handle rapid sequential requests', async () => {
      (gdprService.deleteAccount as jest.Mock).mockResolvedValue({
        success: true,
        message: 'Deletion requested',
      });

      const { result } = renderHook(() => useAccountDeletion());

      await act(async () => {
        await Promise.all([
          result.current.requestDeletion('password1'),
          result.current.requestDeletion('password2'),
        ]);
      });

      // Should handle both requests
      expect(gdprService.deleteAccount).toHaveBeenCalledTimes(2);
    });

    it('should handle cancellation during active deletion request', async () => {
      let resolveDeletion: (value: any) => void;
      const deletionPromise = new Promise((resolve) => {
        resolveDeletion = resolve;
      });

      (gdprService.deleteAccount as jest.Mock).mockReturnValue(deletionPromise);
      (gdprService.cancelDeletion as jest.Mock).mockResolvedValue({
        success: true,
        message: 'Cancelled',
      });

      const { result } = renderHook(() => useAccountDeletion());

      act(() => {
        result.current.requestDeletion('password123');
      });

      expect(result.current.isDeleting).toBe(true);

      await act(async () => {
        await result.current.cancelDeletion();
      });

      // Cancellation should work independently
      expect(gdprService.cancelDeletion).toHaveBeenCalled();

      await act(async () => {
        resolveDeletion!({ success: true, message: 'Deletion requested' });
        await deletionPromise;
      });
    });
  });
});


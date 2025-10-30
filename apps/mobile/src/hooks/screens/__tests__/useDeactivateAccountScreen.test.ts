/**
 * useDeactivateAccountScreen Tests
 * Unit tests for account deactivation
 */

import { act, renderHook, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import gdprService from '../../../services/gdprService';
import { useDeactivateAccountScreen } from '../useDeactivateAccountScreen';

jest.mock('../../../services/gdprService');
jest.mock('react-native', () => ({
  Alert: {
    alert: jest.fn(),
  },
}));

jest.mock('expo-haptics', () => ({
  selectionAsync: jest.fn(),
  impactAsync: jest.fn(),
}));

const mockGdprService = gdprService as jest.Mocked<typeof gdprService>;

describe('useDeactivateAccountScreen', () => {
  const mockNavigation = {
    goBack: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Initial State', () => {
    it('should initialize with empty state', () => {
      const { result } = renderHook(() => useDeactivateAccountScreen());

      expect(result.current.reason).toBe('');
      expect(result.current.confirmText).toBe('');
      expect(result.current.loading).toBe(false);
    });

    it('should provide deactivation reasons', () => {
      const { result } = renderHook(() => useDeactivateAccountScreen());

      expect(result.current.reasons).toHaveLength(6);
      expect(result.current.reasons[0]).toBe('Taking a break from dating');
    });
  });

  describe('selectReason', () => {
    it('should set selected reason', () => {
      const { result } = renderHook(() => useDeactivateAccountScreen());

      act(() => {
        result.current.selectReason('Found a partner');
      });

      expect(result.current.reason).toBe('Found a partner');
    });
  });

  describe('setConfirmText', () => {
    it('should update confirmation text', () => {
      const { result } = renderHook(() => useDeactivateAccountScreen());

      act(() => {
        result.current.setConfirmText('deactivate');
      });

      expect(result.current.confirmText).toBe('deactivate');
    });
  });

  describe('handleDeactivate', () => {
    it('should require reason selection', async () => {
      const { result } = renderHook(() => useDeactivateAccountScreen());

      await act(async () => {
        await result.current.handleDeactivate();
      });

      expect(Alert.alert).toHaveBeenCalledWith(
        'Required',
        'Please select a reason for deactivation.',
      );
      expect(mockGdprService.deleteAccount).not.toHaveBeenCalled();
    });

    it('should require confirmation text', async () => {
      const { result } = renderHook(() => useDeactivateAccountScreen());

      act(() => {
        result.current.selectReason('Found a partner');
      });

      await act(async () => {
        await result.current.handleDeactivate();
      });

      expect(Alert.alert).toHaveBeenCalledWith(
        'Confirmation Required',
        'Please type "deactivate" to confirm.',
      );
    });

    it('should deactivate account successfully', async () => {
      mockGdprService.deleteAccount.mockResolvedValue({
        success: true,
        message: 'Account deactivated',
        gracePeriodEndsAt: new Date().toISOString(),
      } as any);

      const { result } = renderHook(() => useDeactivateAccountScreen());

      act(() => {
        result.current.selectReason('Found a partner');
        result.current.setConfirmText('deactivate');
      });

      await act(async () => {
        await result.current.handleDeactivate();
      });

      expect(mockGdprService.deleteAccount).toHaveBeenCalledWith({
        password: 'N/A',
        reason: 'Found a partner',
        feedback: 'deactivate',
      });

      expect(Alert.alert).toHaveBeenCalledWith(
        'Account Deactivated',
        expect.any(String),
        expect.any(Array),
      );
    });
  });

  describe('handleGoBack', () => {
    it('should provide navigation handler', () => {
      const { result } = renderHook(() => useDeactivateAccountScreen());

      expect(result.current.handleGoBack).toBeDefined();
      expect(typeof result.current.handleGoBack).toBe('function');
    });
  });
});

/**
 * useBiometric Hook Tests
 * Comprehensive testing for biometric authentication functionality
 */
/// <reference types="jest" />

import { renderHook, act } from '@testing-library/react-hooks';
import { useBiometric } from '../useBiometric';

// Mock the BiometricService
jest.mock('../services/BiometricService', () => ({
  default: {
    isAvailable: jest.fn(),
    authenticate: jest.fn(),
    enableBiometric: jest.fn(),
    disableBiometric: jest.fn(),
    getBiometryType: jest.fn(),
    isEnabled: jest.fn(),
    storeSecureData: jest.fn(),
    getSecureData: jest.fn(),
    removeSecureData: jest.fn(),
  },
}));

// Mock React Native Alert
jest.mock('react-native', () => ({
  Alert: {
    alert: jest.fn(),
  },
}));

import BiometricService from '../services/BiometricService';
import { Alert } from 'react-native';

const mockBiometricService = BiometricService as jest.Mocked<typeof BiometricService>;

describe('useBiometric', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Initialization', () => {
    it('should initialize with default loading state', () => {
      const { result } = renderHook(() => useBiometric());

      expect(result.current.isLoading).toBe(true);
      expect(result.current.isAvailable).toBe(false);
      expect(result.current.isEnabled).toBe(false);
      expect(result.current.isInitialized).toBe(false);
      expect(result.current.biometryType).toBeNull();
      expect(result.current.error).toBeNull();
    });

    it('should initialize biometric service on mount', async () => {
      mockBiometricService.isAvailable.mockResolvedValue(true);
      mockBiometricService.isEnabled.mockResolvedValue(true);
      mockBiometricService.getBiometryType.mockResolvedValue('FaceID');

      const { result, waitForNextUpdate } = renderHook(() => useBiometric());

      await waitForNextUpdate();

      expect(mockBiometricService.isAvailable).toHaveBeenCalled();
      expect(mockBiometricService.isEnabled).toHaveBeenCalled();
      expect(mockBiometricService.getBiometryType).toHaveBeenCalled();

      expect(result.current.isLoading).toBe(false);
      expect(result.current.isAvailable).toBe(true);
      expect(result.current.isEnabled).toBe(true);
      expect(result.current.isInitialized).toBe(true);
      expect(result.current.biometryType).toBe('FaceID');
    });

    it('should handle initialization errors gracefully', async () => {
      const error = new Error('Biometric initialization failed');
      mockBiometricService.isAvailable.mockRejectedValue(error);

      const { result, waitForNextUpdate } = renderHook(() => useBiometric());

      await waitForNextUpdate();

      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBe('Biometric initialization failed');
      expect(result.current.isAvailable).toBe(false);
      expect(result.current.isInitialized).toBe(true);
    });
  });

  describe('Authentication', () => {
    beforeEach(async () => {
      mockBiometricService.isAvailable.mockResolvedValue(true);
      mockBiometricService.isEnabled.mockResolvedValue(true);
      mockBiometricService.getBiometryType.mockResolvedValue('TouchID');

      const { waitForNextUpdate } = renderHook(() => useBiometric());
      await waitForNextUpdate();
    });

    it('should authenticate successfully', async () => {
      const authResult = { success: true, error: null };
      mockBiometricService.authenticate.mockResolvedValue(authResult);

      const { result } = renderHook(() => useBiometric());

      let authResultValue;
      await act(async () => {
        authResultValue = await result.current.authenticate('Test message');
      });

      expect(mockBiometricService.authenticate).toHaveBeenCalledWith('Test message');
      expect(authResultValue).toEqual(authResult);
    });

    it('should authenticate with default message', async () => {
      const authResult = { success: true, error: null };
      mockBiometricService.authenticate.mockResolvedValue(authResult);

      const { result } = renderHook(() => useBiometric());

      await act(async () => {
        await result.current.authenticate();
      });

      expect(mockBiometricService.authenticate).toHaveBeenCalledWith('Authenticate to continue');
    });

    it('should handle authentication failure', async () => {
      const authResult = { success: false, error: 'Authentication failed' };
      mockBiometricService.authenticate.mockResolvedValue(authResult);

      const { result } = renderHook(() => useBiometric());

      let authResultValue;
      await act(async () => {
        authResultValue = await result.current.authenticate();
      });

      expect(authResultValue).toEqual(authResult);
    });

    it('should provide quick authentication method', async () => {
      const authResult = { success: true, error: null };
      mockBiometricService.authenticate.mockResolvedValue(authResult);

      const { result } = renderHook(() => useBiometric());

      let authResultValue;
      await act(async () => {
        authResultValue = await result.current.quickAuth();
      });

      expect(mockBiometricService.authenticate).toHaveBeenCalledWith('Quick authentication');
      expect(authResultValue).toEqual(authResult);
    });
  });

  describe('Biometric Settings', () => {
    beforeEach(async () => {
      mockBiometricService.isAvailable.mockResolvedValue(true);
      mockBiometricService.isEnabled.mockResolvedValue(false);
      mockBiometricService.getBiometryType.mockResolvedValue('FaceID');

      const { waitForNextUpdate } = renderHook(() => useBiometric());
      await waitForNextUpdate();
    });

    it('should enable biometric authentication', async () => {
      mockBiometricService.enableBiometric.mockResolvedValue(true);

      const { result } = renderHook(() => useBiometric());

      let enableResult;
      await act(async () => {
        enableResult = await result.current.enableBiometric();
      });

      expect(mockBiometricService.enableBiometric).toHaveBeenCalled();
      expect(enableResult).toBe(true);
    });

    it('should disable biometric authentication', async () => {
      mockBiometricService.disableBiometric.mockResolvedValue(true);

      const { result } = renderHook(() => useBiometric());

      let disableResult;
      await act(async () => {
        disableResult = await result.current.disableBiometric();
      });

      expect(mockBiometricService.disableBiometric).toHaveBeenCalled();
      expect(disableResult).toBe(true);
    });

    it('should handle enable/disable failures', async () => {
      mockBiometricService.enableBiometric.mockResolvedValue(false);

      const { result } = renderHook(() => useBiometric());

      let enableResult;
      await act(async () => {
        enableResult = await result.current.enableBiometric();
      });

      expect(enableResult).toBe(false);
    });
  });

  describe('Secure Data Management', () => {
    beforeEach(async () => {
      mockBiometricService.isAvailable.mockResolvedValue(true);
      mockBiometricService.isEnabled.mockResolvedValue(true);
      mockBiometricService.getBiometryType.mockResolvedValue('TouchID');

      const { waitForNextUpdate } = renderHook(() => useBiometric());
      await waitForNextUpdate();
    });

    it('should store secure data', async () => {
      mockBiometricService.storeSecureData.mockResolvedValue(true);

      const { result } = renderHook(() => useBiometric());

      let storeResult;
      await act(async () => {
        storeResult = await result.current.storeSecureData('testKey', 'testData');
      });

      expect(mockBiometricService.storeSecureData).toHaveBeenCalledWith('testKey', 'testData');
      expect(storeResult).toBe(true);
    });

    it('should retrieve secure data', async () => {
      mockBiometricService.getSecureData.mockResolvedValue('retrievedData');

      const { result } = renderHook(() => useBiometric());

      let retrievedData;
      await act(async () => {
        retrievedData = await result.current.getSecureData('testKey');
      });

      expect(mockBiometricService.getSecureData).toHaveBeenCalledWith('testKey');
      expect(retrievedData).toBe('retrievedData');
    });

    it('should return null for non-existent secure data', async () => {
      mockBiometricService.getSecureData.mockResolvedValue(null);

      const { result } = renderHook(() => useBiometric());

      let retrievedData;
      await act(async () => {
        retrievedData = await result.current.getSecureData('nonExistentKey');
      });

      expect(retrievedData).toBeNull();
    });

    it('should remove secure data', async () => {
      mockBiometricService.removeSecureData.mockResolvedValue(true);

      const { result } = renderHook(() => useBiometric());

      let removeResult;
      await act(async () => {
        removeResult = await result.current.removeSecureData('testKey');
      });

      expect(mockBiometricService.removeSecureData).toHaveBeenCalledWith('testKey');
      expect(removeResult).toBe(true);
    });
  });

  describe('Setup and User Experience', () => {
    beforeEach(async () => {
      mockBiometricService.isAvailable.mockResolvedValue(true);
      mockBiometricService.isEnabled.mockResolvedValue(false);
      mockBiometricService.getBiometryType.mockResolvedValue('FaceID');

      const { waitForNextUpdate } = renderHook(() => useBiometric());
      await waitForNextUpdate();
    });

    it('should show setup prompt', async () => {
      mockBiometricService.enableBiometric.mockResolvedValue(true);

      const { result } = renderHook(() => useBiometric());

      let setupResult;
      await act(async () => {
        setupResult = await result.current.showSetupPrompt();
      });

      expect(Alert.alert).toHaveBeenCalledWith(
        'Enable Biometric Authentication',
        'Would you like to enable FaceID for quick and secure authentication?',
        expect.any(Array)
      );
      expect(setupResult).toBe(true);
    });

    it('should refresh biometric state', async () => {
      const { result } = renderHook(() => useBiometric());

      await act(async () => {
        await result.current.refreshState();
      });

      expect(mockBiometricService.isAvailable).toHaveBeenCalledTimes(2);
      expect(mockBiometricService.isEnabled).toHaveBeenCalledTimes(2);
      expect(mockBiometricService.getBiometryType).toHaveBeenCalledTimes(2);
    });
  });

  describe('Error Handling', () => {
    it('should handle biometric service errors', async () => {
      mockBiometricService.authenticate.mockRejectedValue(new Error('Hardware error'));

      const { result } = renderHook(() => useBiometric());

      await expect(result.current.authenticate()).rejects.toThrow('Hardware error');
    });

    it('should handle secure data operation errors', async () => {
      mockBiometricService.storeSecureData.mockRejectedValue(new Error('Storage failed'));

      const { result } = renderHook(() => useBiometric());

      await expect(result.current.storeSecureData('key', 'data')).rejects.toThrow('Storage failed');
    });
  });

  describe('State Management', () => {
    it('should maintain stable function references across rerenders', () => {
      const { result, rerender } = renderHook(() => useBiometric());

      const initialAuthenticate = result.current.authenticate;
      const initialEnableBiometric = result.current.enableBiometric;

      rerender();

      expect(result.current.authenticate).toBe(initialAuthenticate);
      expect(result.current.enableBiometric).toBe(initialEnableBiometric);
    });

    it('should provide all required state properties', () => {
      const { result } = renderHook(() => useBiometric());

      expect(result.current).toHaveProperty('isAvailable');
      expect(result.current).toHaveProperty('isEnabled');
      expect(result.current).toHaveProperty('isInitialized');
      expect(result.current).toHaveProperty('biometryType');
      expect(result.current).toHaveProperty('isLoading');
      expect(result.current).toHaveProperty('error');
    });

    it('should provide all required action functions', () => {
      const { result } = renderHook(() => useBiometric());

      expect(typeof result.current.authenticate).toBe('function');
      expect(typeof result.current.enableBiometric).toBe('function');
      expect(typeof result.current.disableBiometric).toBe('function');
      expect(typeof result.current.quickAuth).toBe('function');
      expect(typeof result.current.showSetupPrompt).toBe('function');
      expect(typeof result.current.storeSecureData).toBe('function');
      expect(typeof result.current.getSecureData).toBe('function');
      expect(typeof result.current.removeSecureData).toBe('function');
      expect(typeof result.current.refreshState).toBe('function');
    });
  });
});

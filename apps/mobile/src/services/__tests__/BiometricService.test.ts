/**
 * Comprehensive tests for BiometricService
 *
 * Coverage:
 * - Biometric authentication (Face ID, Touch ID, Fingerprint)
 * - Secure storage integration
 * - Enable/disable biometric flows
 * - Error handling
 * - Type safety
 */

import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { biometricService } from '../BiometricService';
import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';

// Mock dependencies
jest.mock('expo-local-authentication');
jest.mock('expo-secure-store');
jest.mock('../logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
  },
}));

const mockLocalAuth = LocalAuthentication as jest.Mocked<typeof LocalAuthentication>;
const mockSecureStore = SecureStore as jest.Mocked<typeof SecureStore>;

describe('BiometricService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Happy Path - Check Biometric Support', () => {
    it('should check if device has hardware support', async () => {
      mockLocalAuth.hasHardwareAsync.mockResolvedValueOnce(true);
      mockLocalAuth.isEnrolledAsync.mockResolvedValueOnce(true);
      mockLocalAuth.supportedAuthenticationTypesAsync.mockResolvedValueOnce([
        LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION,
      ]);
      mockLocalAuth.getEnrolledLevelAsync.mockResolvedValueOnce(
        LocalAuthentication.SecurityLevel.STRONG,
      );

      const capabilities = await biometricService.checkBiometricSupport();

      expect(capabilities.hasHardware).toBe(true);
      expect(capabilities.isEnrolled).toBe(true);
      expect(capabilities.supportedTypes).toContain(
        LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION,
      );
      expect(capabilities.securityLevel).toBe(LocalAuthentication.SecurityLevel.STRONG);
    });

    it('should detect fingerprint support', async () => {
      mockLocalAuth.hasHardwareAsync.mockResolvedValueOnce(true);
      mockLocalAuth.isEnrolledAsync.mockResolvedValueOnce(true);
      mockLocalAuth.supportedAuthenticationTypesAsync.mockResolvedValueOnce([
        LocalAuthentication.AuthenticationType.FINGERPRINT,
      ]);
      mockLocalAuth.getEnrolledLevelAsync.mockResolvedValueOnce(
        LocalAuthentication.SecurityLevel.STRONG,
      );

      const capabilities = await biometricService.checkBiometricSupport();

      expect(capabilities.hasHardware).toBe(true);
      expect(capabilities.supportedTypes).toContain(
        LocalAuthentication.AuthenticationType.FINGERPRINT,
      );
    });

    it('should handle missing hardware gracefully', async () => {
      mockLocalAuth.hasHardwareAsync.mockResolvedValueOnce(false);
      mockLocalAuth.isEnrolledAsync.mockResolvedValueOnce(false);
      mockLocalAuth.supportedAuthenticationTypesAsync.mockResolvedValueOnce([]);
      mockLocalAuth.getEnrolledLevelAsync.mockResolvedValueOnce(
        LocalAuthentication.SecurityLevel.NONE,
      );

      const capabilities = await biometricService.checkBiometricSupport();

      expect(capabilities.hasHardware).toBe(false);
      expect(capabilities.isEnrolled).toBe(false);
      expect(capabilities.supportedTypes).toEqual([]);
    });
  });

  describe('Happy Path - Authenticate', () => {
    it('should authenticate with Face ID successfully', async () => {
      mockLocalAuth.hasHardwareAsync.mockResolvedValueOnce(true);
      mockLocalAuth.isEnrolledAsync.mockResolvedValueOnce(true);
      mockLocalAuth.supportedAuthenticationTypesAsync.mockResolvedValueOnce([
        LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION,
      ]);
      mockLocalAuth.authenticateAsync.mockResolvedValueOnce({
        success: true,
        error: '',
        warning: undefined,
      });
      mockLocalAuth.getEnrolledLevelAsync.mockResolvedValueOnce(
        LocalAuthentication.SecurityLevel.STRONG,
      );

      const result = await biometricService.authenticate('Authenticate to access your account');

      expect(result.success).toBe(true);
      expect(result.biometricType).toBe('facial');
      expect(mockLocalAuth.authenticateAsync).toHaveBeenCalledWith({
        promptMessage: 'Authenticate to access your account',
        fallbackLabel: 'Use PIN',
        cancelLabel: 'Cancel',
        disableDeviceFallback: false,
      });
    });

    it('should authenticate with Touch ID successfully', async () => {
      mockLocalAuth.hasHardwareAsync.mockResolvedValueOnce(true);
      mockLocalAuth.isEnrolledAsync.mockResolvedValueOnce(true);
      mockLocalAuth.supportedAuthenticationTypesAsync.mockResolvedValueOnce([
        LocalAuthentication.AuthenticationType.FINGERPRINT,
      ]);
      mockLocalAuth.authenticateAsync.mockResolvedValueOnce({
        success: true,
        error: '',
        warning: undefined,
      });
      mockLocalAuth.getEnrolledLevelAsync.mockResolvedValueOnce(
        LocalAuthentication.SecurityLevel.STRONG,
      );

      const result = await biometricService.authenticate();

      expect(result.success).toBe(true);
      expect(result.biometricType).toBe('fingerprint');
    });

    it('should authenticate with iris scan successfully', async () => {
      mockLocalAuth.hasHardwareAsync.mockResolvedValueOnce(true);
      mockLocalAuth.isEnrolledAsync.mockResolvedValueOnce(true);
      mockLocalAuth.supportedAuthenticationTypesAsync.mockResolvedValueOnce([
        LocalAuthentication.AuthenticationType.IRIS,
      ]);
      mockLocalAuth.authenticateAsync.mockResolvedValueOnce({
        success: true,
        error: '',
        warning: undefined,
      });
      mockLocalAuth.getEnrolledLevelAsync.mockResolvedValueOnce(
        LocalAuthentication.SecurityLevel.STRONG,
      );

      const result = await biometricService.authenticate();

      expect(result.success).toBe(true);
      expect(result.biometricType).toBe('iris');
    });
  });

  describe('Happy Path - Enable Biometric', () => {
    it('should enable biometric authentication successfully', async () => {
      // Mock successful authentication check
      mockLocalAuth.hasHardwareAsync.mockResolvedValue(true);
      mockLocalAuth.isEnrolledAsync.mockResolvedValue(true);
      mockLocalAuth.supportedAuthenticationTypesAsync.mockResolvedValue([
        LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION,
      ]);
      mockLocalAuth.authenticateAsync.mockResolvedValue({
        success: true,
        error: '',
        warning: undefined,
      });
      mockLocalAuth.getEnrolledLevelAsync.mockResolvedValue(
        LocalAuthentication.SecurityLevel.STRONG,
      );

      // Mock secure storage
      mockSecureStore.setItemAsync.mockResolvedValue();

      const result = await biometricService.enableBiometric();

      expect(result).toBe(true);
      expect(mockSecureStore.setItemAsync).toHaveBeenCalledTimes(2);
      expect(mockSecureStore.setItemAsync).toHaveBeenCalledWith('biometric_enabled', 'true');
    });
  });

  describe('Happy Path - Disable Biometric', () => {
    it('should disable biometric authentication successfully', async () => {
      mockSecureStore.deleteItemAsync.mockResolvedValue();

      await biometricService.disableBiometric();

      expect(mockSecureStore.deleteItemAsync).toHaveBeenCalledWith('biometric_enabled');
      expect(mockSecureStore.deleteItemAsync).toHaveBeenCalledWith('biometric_type');
    });
  });

  describe('Happy Path - Check Biometric Status', () => {
    it('should return true when biometric is enabled', async () => {
      mockSecureStore.getItemAsync.mockResolvedValueOnce('true');

      const result = await biometricService.isBiometricEnabled();

      expect(result).toBe(true);
      expect(mockSecureStore.getItemAsync).toHaveBeenCalledWith('biometric_enabled');
    });

    it('should return false when biometric is not enabled', async () => {
      mockSecureStore.getItemAsync.mockResolvedValueOnce(null);

      const result = await biometricService.isBiometricEnabled();

      expect(result).toBe(false);
    });
  });

  describe('Happy Path - Get Biometric Type Name', () => {
    it('should return correct name for facial recognition', () => {
      const name = biometricService.getBiometricTypeName('facial');

      expect(name).toBe('Face ID');
    });

    it('should return correct name for fingerprint', () => {
      const name = biometricService.getBiometricTypeName('fingerprint');

      expect(name).toBe('Touch ID');
    });

    it('should return correct name for iris', () => {
      const name = biometricService.getBiometricTypeName('iris');

      expect(name).toBe('Iris Scan');
    });

    it('should return default name for unknown type', () => {
      const name = biometricService.getBiometricTypeName('unknown');

      expect(name).toBe('Biometric Authentication');
    });
  });

  describe('Error Handling', () => {
    it('should handle missing hardware error', async () => {
      mockLocalAuth.hasHardwareAsync.mockResolvedValueOnce(false);
      mockLocalAuth.isEnrolledAsync.mockResolvedValueOnce(false);
      mockLocalAuth.supportedAuthenticationTypesAsync.mockResolvedValueOnce([]);
      mockLocalAuth.getEnrolledLevelAsync.mockResolvedValueOnce(
        LocalAuthentication.SecurityLevel.NONE,
      );

      const result = await biometricService.authenticate();

      expect(result.success).toBe(false);
      expect(result.error).toBe('Biometric authentication not supported on this device');
    });

    it('should handle not enrolled error', async () => {
      mockLocalAuth.hasHardwareAsync.mockResolvedValueOnce(true);
      mockLocalAuth.isEnrolledAsync.mockResolvedValueOnce(false);
      mockLocalAuth.supportedAuthenticationTypesAsync.mockResolvedValueOnce([]);
      mockLocalAuth.getEnrolledLevelAsync.mockResolvedValueOnce(
        LocalAuthentication.SecurityLevel.NONE,
      );

      const result = await biometricService.authenticate();

      expect(result.success).toBe(false);
      expect(result.error).toBe('No biometric authentication methods enrolled');
    });

    it('should handle authentication failure', async () => {
      mockLocalAuth.hasHardwareAsync.mockResolvedValueOnce(true);
      mockLocalAuth.isEnrolledAsync.mockResolvedValueOnce(true);
      mockLocalAuth.supportedAuthenticationTypesAsync.mockResolvedValueOnce([
        LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION,
      ]);
      mockLocalAuth.authenticateAsync.mockResolvedValueOnce({
        success: false,
        error: 'User cancelled',
        warning: undefined,
      });
      mockLocalAuth.getEnrolledLevelAsync.mockResolvedValueOnce(
        LocalAuthentication.SecurityLevel.STRONG,
      );

      const result = await biometricService.authenticate();

      expect(result.success).toBe(false);
      expect(result.error).toBe('User cancelled');
    });

    it('should handle biometric check errors', async () => {
      mockLocalAuth.hasHardwareAsync.mockRejectedValueOnce(new Error('Hardware check failed'));

      const capabilities = await biometricService.checkBiometricSupport();

      expect(capabilities.hasHardware).toBe(false);
      expect(capabilities.isEnrolled).toBe(false);
      expect(capabilities.supportedTypes).toEqual([]);
    });

    it('should handle enable biometric when authentication fails', async () => {
      mockLocalAuth.hasHardwareAsync.mockResolvedValue(true);
      mockLocalAuth.isEnrolledAsync.mockResolvedValue(true);
      mockLocalAuth.supportedAuthenticationTypesAsync.mockResolvedValue([]);
      mockLocalAuth.authenticateAsync.mockResolvedValue({
        success: false,
        error: 'Authentication failed',
        warning: undefined,
      });
      mockLocalAuth.getEnrolledLevelAsync.mockResolvedValue(LocalAuthentication.SecurityLevel.NONE);

      const result = await biometricService.enableBiometric();

      expect(result).toBe(false);
    });

    it('should handle errors when disabling biometric', async () => {
      mockSecureStore.deleteItemAsync.mockRejectedValueOnce(new Error('Delete failed'));

      await biometricService.disableBiometric();

      expect(mockSecureStore.deleteItemAsync).toHaveBeenCalled();
    });

    it('should handle errors when checking status', async () => {
      mockSecureStore.getItemAsync.mockRejectedValueOnce(new Error('Read failed'));

      const result = await biometricService.isBiometricEnabled();

      expect(result).toBe(false);
    });
  });

  describe('Error Handling - Enable/Disable', () => {
    it('should return false when enable fails', async () => {
      mockLocalAuth.hasHardwareAsync.mockResolvedValue(true);
      mockLocalAuth.isEnrolledAsync.mockResolvedValue(true);
      mockLocalAuth.supportedAuthenticationTypesAsync.mockResolvedValue([
        LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION,
      ]);
      mockLocalAuth.authenticateAsync.mockResolvedValue({
        success: true,
        error: '',
        warning: undefined,
      });
      mockLocalAuth.getEnrolledLevelAsync.mockResolvedValue(
        LocalAuthentication.SecurityLevel.STRONG,
      );
      mockSecureStore.setItemAsync.mockRejectedValueOnce(new Error('Storage failed'));

      const result = await biometricService.enableBiometric();

      expect(result).toBe(false);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty authentication reason', async () => {
      mockLocalAuth.hasHardwareAsync.mockResolvedValueOnce(true);
      mockLocalAuth.isEnrolledAsync.mockResolvedValueOnce(true);
      mockLocalAuth.supportedAuthenticationTypesAsync.mockResolvedValueOnce([
        LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION,
      ]);
      mockLocalAuth.authenticateAsync.mockResolvedValueOnce({
        success: true,
        error: '',
        warning: undefined,
      });
      mockLocalAuth.getEnrolledLevelAsync.mockResolvedValueOnce(
        LocalAuthentication.SecurityLevel.STRONG,
      );

      const result = await biometricService.authenticate('');

      expect(result.success).toBe(true);
      expect(mockLocalAuth.authenticateAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          promptMessage: 'Authenticate to access PawfectMatch',
        }),
      );
    });

    it('should handle unknown biometric type', async () => {
      mockLocalAuth.hasHardwareAsync.mockResolvedValueOnce(true);
      mockLocalAuth.isEnrolledAsync.mockResolvedValueOnce(true);
      mockLocalAuth.supportedAuthenticationTypesAsync.mockResolvedValueOnce([]);
      mockLocalAuth.authenticateAsync.mockResolvedValueOnce({
        success: true,
        error: '',
        warning: undefined,
      });
      mockLocalAuth.getEnrolledLevelAsync.mockResolvedValueOnce(
        LocalAuthentication.SecurityLevel.NONE,
      );

      const result = await biometricService.authenticate();

      expect(result.biometricType).toBe('unknown');
    });

    it('should handle multiple biometric types', async () => {
      mockLocalAuth.hasHardwareAsync.mockResolvedValueOnce(true);
      mockLocalAuth.isEnrolledAsync.mockResolvedValueOnce(true);
      mockLocalAuth.supportedAuthenticationTypesAsync.mockResolvedValueOnce([
        LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION,
        LocalAuthentication.AuthenticationType.FINGERPRINT,
      ]);
      mockLocalAuth.authenticateAsync.mockResolvedValueOnce({
        success: true,
        error: '',
        warning: undefined,
      });
      mockLocalAuth.getEnrolledLevelAsync.mockResolvedValueOnce(
        LocalAuthentication.SecurityLevel.STRONG,
      );

      const capabilities = await biometricService.checkBiometricSupport();

      expect(capabilities.supportedTypes.length).toBeGreaterThan(1);
    });
  });

  describe('Integration', () => {
    it('should integrate with SecureStore for persistence', async () => {
      mockSecureStore.getItemAsync.mockResolvedValueOnce('true');
      mockSecureStore.getItemAsync.mockResolvedValueOnce('facial');

      const isEnabled = await biometricService.isBiometricEnabled();

      expect(isEnabled).toBe(true);
      expect(mockSecureStore.getItemAsync).toHaveBeenCalledWith('biometric_enabled');
    });

    it('should integrate with LocalAuthentication for security', async () => {
      mockLocalAuth.hasHardwareAsync.mockResolvedValue(true);
      mockLocalAuth.isEnrolledAsync.mockResolvedValue(true);
      mockLocalAuth.supportedAuthenticationTypesAsync.mockResolvedValue([
        LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION,
      ]);
      mockLocalAuth.authenticateAsync.mockResolvedValue({
        success: true,
        error: '',
        warning: undefined,
      });
      mockLocalAuth.getEnrolledLevelAsync.mockResolvedValue(
        LocalAuthentication.SecurityLevel.STRONG,
      );
      mockSecureStore.setItemAsync.mockResolvedValue();

      await biometricService.enableBiometric();

      expect(mockLocalAuth.authenticateAsync).toHaveBeenCalled();
      expect(mockSecureStore.setItemAsync).toHaveBeenCalled();
    });
  });

  describe('Type Safety', () => {
    it('should maintain type safety for biometric result', async () => {
      mockLocalAuth.hasHardwareAsync.mockResolvedValueOnce(true);
      mockLocalAuth.isEnrolledAsync.mockResolvedValueOnce(true);
      mockLocalAuth.supportedAuthenticationTypesAsync.mockResolvedValueOnce([
        LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION,
      ]);
      mockLocalAuth.authenticateAsync.mockResolvedValueOnce({
        success: true,
        error: '',
        warning: undefined,
      });
      mockLocalAuth.getEnrolledLevelAsync.mockResolvedValueOnce(
        LocalAuthentication.SecurityLevel.STRONG,
      );

      const result = await biometricService.authenticate();

      expect(typeof result.success).toBe('boolean');
      expect(result.biometricType).toMatch(/^(fingerprint|facial|iris|unknown)$/);
    });

    it('should maintain type safety for capabilities', async () => {
      mockLocalAuth.hasHardwareAsync.mockResolvedValueOnce(true);
      mockLocalAuth.isEnrolledAsync.mockResolvedValueOnce(true);
      mockLocalAuth.supportedAuthenticationTypesAsync.mockResolvedValueOnce([]);
      mockLocalAuth.getEnrolledLevelAsync.mockResolvedValueOnce(
        LocalAuthentication.SecurityLevel.STRONG,
      );

      const capabilities = await biometricService.checkBiometricSupport();

      expect(typeof capabilities.hasHardware).toBe('boolean');
      expect(typeof capabilities.isEnrolled).toBe('boolean');
      expect(Array.isArray(capabilities.supportedTypes)).toBe(true);
      expect(typeof capabilities.securityLevel).toBe('string');
    });
  });
});

/**
 * AuthService Comprehensive Test Suite
 * Tests authentication, token management, biometric auth, and secure storage
 */

import { authService, AuthError } from '../AuthService';
import * as Keychain from 'react-native-keychain';
import * as SecureStore from 'expo-secure-store';
import * as LocalAuthentication from 'expo-local-authentication';
import { api } from '../api';

// Mock all dependencies
jest.mock('react-native-keychain');
jest.mock('expo-secure-store');
jest.mock('expo-local-authentication');
jest.mock('../api', () => ({
  api: {
    request: jest.fn(),
  },
}));

// Mock logger
jest.mock('@pawfectmatch/core', () => ({
  logger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

describe('AuthService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
    jest.useFakeTimers();
    
    // Setup default mocks
    (Keychain.setGenericPassword as jest.Mock).mockResolvedValue(true);
    (Keychain.getGenericPassword as jest.Mock).mockResolvedValue({ password: 'test-value' });
    (Keychain.resetGenericPassword as jest.Mock).mockResolvedValue(true);
    
    (SecureStore.setItemAsync as jest.Mock).mockResolvedValue(undefined);
    (SecureStore.getItemAsync as jest.Mock).mockResolvedValue('test-value');
    (SecureStore.deleteItemAsync as jest.Mock).mockResolvedValue(undefined);
    
    (LocalAuthentication.hasHardwareAsync as jest.Mock).mockResolvedValue(true);
    (LocalAuthentication.isEnrolledAsync as jest.Mock).mockResolvedValue(true);
    (LocalAuthentication.supportedAuthenticationTypesAsync as jest.Mock).mockResolvedValue([
      LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION,
    ]);
    (LocalAuthentication.authenticateAsync as jest.Mock).mockResolvedValue({ success: true });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('Secure Storage', () => {
    it('should store item using Keychain', async () => {
      await authService.login({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(Keychain.setGenericPassword).toHaveBeenCalled();
    });

    it('should fallback to SecureStore if Keychain fails', async () => {
      (Keychain.setGenericPassword as jest.Mock).mockRejectedValueOnce(
        new Error('Keychain error')
      );

      await authService.login({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(SecureStore.setItemAsync).toHaveBeenCalled();
    });

    it('should retrieve item from Keychain', async () => {
      (Keychain.getGenericPassword as jest.Mock).mockResolvedValueOnce({
        password: JSON.stringify({
          id: 'user123',
          email: 'test@example.com',
          name: 'Test User',
          profileComplete: true,
          subscriptionStatus: 'active',
          createdAt: '2024-01-01T00:00:00Z',
        }),
      });

      const user = await authService.getCurrentUser();
      expect(user).toBeDefined();
      expect(user?.email).toBe('test@example.com');
    });

    it('should delete item from Keychain', async () => {
      await authService.logout();

      expect(Keychain.resetGenericPassword).toHaveBeenCalled();
    });
  });

  describe('Login', () => {
    const mockAuthResponse = {
      user: {
        id: 'user123',
        email: 'test@example.com',
        name: 'Test User',
        profileComplete: true,
        subscriptionStatus: 'active',
        createdAt: '2024-01-01T00:00:00Z',
      },
      accessToken: 'access-token-123',
      refreshToken: 'refresh-token-456',
      expiresIn: 3600,
    };

    it('should successfully login with valid credentials', async () => {
      (api.request as jest.Mock).mockResolvedValueOnce(mockAuthResponse);

      const response = await authService.login({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(response).toEqual(mockAuthResponse);
      expect(api.request).toHaveBeenCalledWith('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: 'test@example.com', password: 'password123' }),
      });
    });

    it('should throw AuthError on login failure', async () => {
      (api.request as jest.Mock).mockRejectedValueOnce(new Error('Login failed'));

      await expect(
        authService.login({
          email: 'test@example.com',
          password: 'wrongpassword',
        })
      ).rejects.toThrow(AuthError);
    });

    it('should store auth data after successful login', async () => {
      (api.request as jest.Mock).mockResolvedValueOnce(mockAuthResponse);

      await authService.login({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(Keychain.setGenericPassword).toHaveBeenCalledTimes(5); // access, refresh, user, session_start, last_activity
    });
  });

  describe('Register', () => {
    const mockAuthResponse = {
      user: {
        id: 'user123',
        email: 'newuser@example.com',
        name: 'New User',
        profileComplete: false,
        subscriptionStatus: 'free',
        createdAt: '2024-01-01T00:00:00Z',
      },
      accessToken: 'access-token-123',
      refreshToken: 'refresh-token-456',
      expiresIn: 3600,
    };

    it('should successfully register with valid data', async () => {
      (api.request as jest.Mock).mockResolvedValueOnce(mockAuthResponse);

      const response = await authService.register({
        email: 'newuser@example.com',
        password: 'password123',
        name: 'New User',
        confirmPassword: 'password123',
      });

      expect(response).toEqual(mockAuthResponse);
      expect(api.request).toHaveBeenCalledWith('/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          email: 'newuser@example.com',
          password: 'password123',
          name: 'New User',
        }),
      });
    });

    it('should throw error when passwords do not match', async () => {
      await expect(
        authService.register({
          email: 'newuser@example.com',
          password: 'password123',
          name: 'New User',
          confirmPassword: 'differentpassword',
        })
      ).rejects.toThrow(AuthError);
    });
  });

  describe('Logout', () => {
    it('should successfully logout and clear all data', async () => {
      (api.request as jest.Mock).mockResolvedValueOnce({ success: true });

      await authService.logout();

      expect(Keychain.resetGenericPassword).toHaveBeenCalled();
      expect(api.request).toHaveBeenCalledWith('/auth/logout', {
        method: 'POST',
        body: JSON.stringify({ refreshToken: undefined }),
      });
    });

    it('should clear local data even if server logout fails', async () => {
      (api.request as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      await authService.logout();

      expect(Keychain.resetGenericPassword).toHaveBeenCalled();
    });
  });

  describe('Token Management', () => {
    it('should refresh access token successfully', async () => {
      const mockRefreshResponse = {
        user: {
          id: 'user123',
          email: 'test@example.com',
          name: 'Test User',
          profileComplete: true,
          subscriptionStatus: 'active',
          createdAt: '2024-01-01T00:00:00Z',
        },
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
        expiresIn: 3600,
      };

      (Keychain.getGenericPassword as jest.Mock).mockResolvedValueOnce({
        password: 'refresh-token-456',
      });

      (api.request as jest.Mock).mockResolvedValueOnce(mockRefreshResponse);

      const response = await authService.refreshToken();

      expect(response).toEqual(mockRefreshResponse);
      expect(api.request).toHaveBeenCalledWith('/auth/refresh', {
        method: 'POST',
        body: JSON.stringify({ refreshToken: 'refresh-token-456' }),
      });
    });

    it('should return null if no refresh token exists', async () => {
      (Keychain.getGenericPassword as jest.Mock).mockResolvedValueOnce({
        password: null,
      });

      const response = await authService.refreshToken();

      expect(response).toBeNull();
    });

    it('should rotate tokens and clear auth data on failure', async () => {
      (Keychain.getGenericPassword as jest.Mock).mockResolvedValueOnce({
        password: 'invalid-refresh-token',
      });

      (api.request as jest.Mock).mockRejectedValueOnce(new Error('Token expired'));

      const response = await authService.rotateTokens();

      expect(response).toBe(false);
      expect(Keychain.resetGenericPassword).toHaveBeenCalled();
    });
  });

  describe('Biometric Authentication', () => {
    it('should check if biometric is available', async () => {
      const result = await authService.isBiometricAvailable();

      expect(result.available).toBe(true);
      expect(result.types).toContain(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION);
    });

    it('should enable biometric authentication', async () => {
      (Keychain.getGenericPassword as jest.Mock).mockResolvedValueOnce({
        password: JSON.stringify({
          id: 'user123',
          email: 'test@example.com',
          name: 'Test User',
          profileComplete: true,
          subscriptionStatus: 'active',
          createdAt: '2024-01-01T00:00:00Z',
        }),
      });

      const result = await authService.enableBiometricAuthentication();

      expect(result).toBe(true);
      expect(LocalAuthentication.authenticateAsync).toHaveBeenCalled();
      expect(Keychain.setGenericPassword).toHaveBeenCalled();
    });

    it('should throw error if biometric hardware is not available', async () => {
      (LocalAuthentication.hasHardwareAsync as jest.Mock).mockResolvedValueOnce(false);

      await expect(authService.enableBiometricAuthentication()).rejects.toThrow(AuthError);
    });

    it('should login with biometrics', async () => {
      const mockAuthResponse = {
        user: {
          id: 'user123',
          email: 'test@example.com',
          name: 'Test User',
          profileComplete: true,
          subscriptionStatus: 'active',
          createdAt: '2024-01-01T00:00:00Z',
        },
        accessToken: 'access-token-123',
        refreshToken: 'refresh-token-456',
        expiresIn: 3600,
      };

      (Keychain.getGenericPassword as jest.Mock)
        .mockResolvedValueOnce({ password: 'true' }) // biometric enabled
        .mockResolvedValueOnce({
          password: JSON.stringify({
            email: 'test@example.com',
            biometricToken: 'biometric-token-123',
          }),
        });

      (api.request as jest.Mock).mockResolvedValueOnce(mockAuthResponse);

      const response = await authService.loginWithBiometrics();

      expect(response).toEqual(mockAuthResponse);
      expect(LocalAuthentication.authenticateAsync).toHaveBeenCalled();
      expect(api.request).toHaveBeenCalledWith('/auth/biometric-login', {
        method: 'POST',
        body: JSON.stringify({
          email: 'test@example.com',
          biometricToken: 'biometric-token-123',
        }),
      });
    });

    it('should disable biometric authentication', async () => {
      await authService.disableBiometricAuthentication();

      expect(Keychain.resetGenericPassword).toHaveBeenCalled();
    });

    it('should check if biometric is enabled', async () => {
      (Keychain.getGenericPassword as jest.Mock).mockResolvedValueOnce({
        password: 'true',
      });

      const isEnabled = await authService.isBiometricEnabled();

      expect(isEnabled).toBe(true);
    });
  });

  describe('Session Management', () => {
    it('should record user activity', async () => {
      await authService.recordUserActivity();

      expect(Keychain.setGenericPassword).toHaveBeenCalled();
    });

    it('should logout after session timeout', async () => {
      // Set session start time to 25 hours ago
      const pastTime = (Date.now() - 25 * 60 * 60 * 1000).toString();
      (Keychain.getGenericPassword as jest.Mock).mockResolvedValueOnce({
        password: pastTime,
      });

      // Manually trigger check
      const authService2 = authService as any;
      await authService2.checkSessionValidity();

      expect(Keychain.resetGenericPassword).toHaveBeenCalled();
    });

    it('should logout after inactivity timeout', async () => {
      const pastTime = (Date.now() - 31 * 60 * 1000).toString(); // 31 minutes ago
      (Keychain.getGenericPassword as jest.Mock)
        .mockResolvedValueOnce({ password: Date.now().toString() }) // session start
        .mockResolvedValueOnce({ password: pastTime }); // last activity

      const authService2 = authService as any;
      await authService2.checkSessionValidity();

      expect(Keychain.resetGenericPassword).toHaveBeenCalled();
    });
  });

  describe('User Management', () => {
    it('should get current user', async () => {
      const mockUser = {
        id: 'user123',
        email: 'test@example.com',
        name: 'Test User',
        profileComplete: true,
        subscriptionStatus: 'active',
        createdAt: '2024-01-01T00:00:00Z',
      };

      (Keychain.getGenericPassword as jest.Mock).mockResolvedValueOnce({
        password: JSON.stringify(mockUser),
      });

      const user = await authService.getCurrentUser();

      expect(user).toEqual(mockUser);
    });

    it('should update user data', async () => {
      const mockUser = {
        id: 'user123',
        email: 'test@example.com',
        name: 'Test User',
        profileComplete: true,
        subscriptionStatus: 'active',
        createdAt: '2024-01-01T00:00:00Z',
      };

      (Keychain.getGenericPassword as jest.Mock).mockResolvedValueOnce({
        password: JSON.stringify(mockUser),
      });

      await authService.updateUser({ name: 'Updated Name' });

      expect(Keychain.setGenericPassword).toHaveBeenCalled();
    });

    it('should throw error when updating user without authentication', async () => {
      (Keychain.getGenericPassword as jest.Mock).mockResolvedValueOnce({
        password: null,
      });

      await expect(authService.updateUser({ name: 'Updated Name' })).rejects.toThrow(
        AuthError
      );
    });
  });

  describe('Password Reset', () => {
    it('should request password reset', async () => {
      (api.request as jest.Mock).mockResolvedValueOnce({
        success: true,
        message: 'Reset email sent',
      });

      const response = await authService.forgotPassword('test@example.com');

      expect(response.success).toBe(true);
      expect(api.request).toHaveBeenCalledWith('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email: 'test@example.com' }),
      });
    });

    it('should reset password with token', async () => {
      (api.request as jest.Mock).mockResolvedValueOnce({
        success: true,
        message: 'Password reset successful',
      });

      const response = await authService.resetPassword({
        token: 'reset-token-123',
        password: 'newpassword123',
        confirmPassword: 'newpassword123',
      });

      expect(response.success).toBe(true);
      expect(api.request).toHaveBeenCalledWith('/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({
          token: 'reset-token-123',
          password: 'newpassword123',
        }),
      });
    });

    it('should throw error when passwords do not match during reset', async () => {
      await expect(
        authService.resetPassword({
          token: 'reset-token-123',
          password: 'newpassword123',
          confirmPassword: 'differentpassword',
        })
      ).rejects.toThrow(AuthError);
    });
  });

  describe('Authentication Check', () => {
    it('should check if user is authenticated', async () => {
      (Keychain.getGenericPassword as jest.Mock)
        .mockResolvedValueOnce({ password: 'access-token-123' })
        .mockResolvedValueOnce({
          password: JSON.stringify({
            id: 'user123',
            email: 'test@example.com',
            name: 'Test User',
            profileComplete: true,
            subscriptionStatus: 'active',
            createdAt: '2024-01-01T00:00:00Z',
          }),
        });

      const isAuthenticated = await authService.isAuthenticated();

      expect(isAuthenticated).toBe(true);
    });

    it('should return false when not authenticated', async () => {
      (Keychain.getGenericPassword as jest.Mock)
        .mockResolvedValueOnce({ password: null })
        .mockResolvedValueOnce({ password: null });

      const isAuthenticated = await authService.isAuthenticated();

      expect(isAuthenticated).toBe(false);
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors gracefully', async () => {
      (api.request as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      await expect(
        authService.login({
          email: 'test@example.com',
          password: 'password123',
        })
      ).rejects.toThrow(AuthError);
    });

    it('should handle invalid JSON in stored user data', async () => {
      (Keychain.getGenericPassword as jest.Mock).mockResolvedValueOnce({
        password: 'invalid-json',
      });

      const user = await authService.getCurrentUser();

      expect(user).toBeNull();
    });

    it('should handle Keychain errors gracefully', async () => {
      (Keychain.getGenericPassword as jest.Mock).mockRejectedValueOnce(
        new Error('Keychain error')
      );

      const user = await authService.getCurrentUser();

      expect(user).toBeNull();
    });
  });
});


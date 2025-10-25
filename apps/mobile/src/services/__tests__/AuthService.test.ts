/**
 * Comprehensive tests for AuthService
 * Tests JWT token management, secure storage, biometric auth, and token refresh
 */
import * as SecureStore from "expo-secure-store";
import * as LocalAuthentication from "expo-local-authentication";
import { authService, AuthError } from "../AuthService";
import { api } from "../api";
import * as jwtUtils from "../../utils/jwt";

// Mock dependencies
jest.mock("expo-secure-store");
jest.mock("expo-local-authentication");
jest.mock("../api");
jest.mock("../../utils/secureStorage");
jest.mock("../../utils/jwt");

const mockedSecureStore = SecureStore as jest.Mocked<typeof SecureStore>;
const mockedLocalAuth = LocalAuthentication as jest.Mocked<
  typeof LocalAuthentication
>;

describe("AuthService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Login", () => {
    it("should login successfully and store tokens securely", async () => {
      const credentials = { email: "test@example.com", password: "password123" };
      const mockResponse = {
        accessToken: "access-token",
        refreshToken: "refresh-token",
        user: {
          _id: "user-id",
        email: "test@example.com",
          firstName: "Test",
          lastName: "User",
        },
      };

      (mockedApi.auth.login as jest.Mock).mockResolvedValue(mockResponse);
      mockedSecureStore.setItemAsync.mockResolvedValue();

      const result = await authService.login(credentials);

      expect(result).toEqual(mockResponse);
      expect(mockedApi.auth.login).toHaveBeenCalledWith(credentials);
      expect(mockedSecureStore.setItemAsync).toHaveBeenCalledTimes(5); // tokens, user, timestamps
    });

    it("should throw AuthError on login failure", async () => {
      const credentials = { email: "test@example.com", password: "wrong" };

      mockedApi.auth.login.mockRejectedValue(new Error("Invalid credentials"));

      const mockLogin = jest.fn().mockRejectedValue(new Error("Invalid credentials"));
      jest.spyOn(api, "auth").mockReturnValue({ login: mockLogin } as any);
      
      await expect(authService.login(credentials)).rejects.toThrow(AuthError);
    });
  });

  describe("Token Refresh", () => {
    it("should refresh tokens successfully", async () => {
      const refreshToken = "refresh-token";
      const mockResponse = {
        accessToken: "new-access-token",
        refreshToken: "new-refresh-token",
        user: {
          _id: "user-id",
        email: "test@example.com",
          firstName: "Test",
          lastName: "User",
        },
      };

      mockedSecureStore.getItemAsync.mockResolvedValue(refreshToken);
      const mockRefresh = jest.fn().mockResolvedValue(mockResponse);
      jest.spyOn(api, "auth").mockReturnValue({ refreshToken: mockRefresh } as any);
      mockedSecureStore.setItemAsync.mockResolvedValue();

      const result = await authService.refreshToken();

      expect(result).toEqual(mockResponse);
      expect(mockedApi.auth.refreshToken).toHaveBeenCalledWith(refreshToken);
    });

    it("should return null if no refresh token available", async () => {
      mockedSecureStore.getItemAsync.mockResolvedValue(null);

      const result = await authService.refreshToken();

      expect(result).toBeNull();
      expect(mockedApi.auth.refreshToken).not.toHaveBeenCalled();
    });

    it("should clear tokens if refresh fails", async () => {
      const refreshToken = "invalid-token";

      mockedSecureStore.getItemAsync.mockResolvedValue(refreshToken);
      mockedApi.auth.refreshToken.mockRejectedValue(new Error("Invalid token"));
      mockedSecureStore.deleteItemAsync.mockResolvedValue();

      const result = await authService.refreshToken();

      expect(result).toBeNull();
      expect(mockedSecureStore.deleteItemAsync).toHaveBeenCalled();
    });
  });

  describe("Biometric Authentication", () => {
    it("should check if biometric is available", async () => {
      mockedLocalAuth.hasHardwareAsync.mockResolvedValue(true);
      mockedLocalAuth.isEnrolledAsync.mockResolvedValue(true);
      mockedLocalAuth.supportedAuthenticationTypesAsync.mockResolvedValue([
        LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION,
      ]);

      const result = await authService.isBiometricAvailable();

      expect(result.available).toBe(true);
      expect(result.types).toHaveLength(1);
    });

    it("should return false if no biometric hardware", async () => {
      mockedLocalAuth.hasHardwareAsync.mockResolvedValue(false);
      mockedLocalAuth.isEnrolledAsync.mockResolvedValue(false);

      const result = await authService.isBiometricAvailable();

      expect(result.available).toBe(false);
    });

    it("should enable biometric authentication successfully", async () => {
      mockedLocalAuth.hasHardwareAsync.mockResolvedValue(true);
      mockedLocalAuth.isEnrolledAsync.mockResolvedValue(true);
      mockedLocalAuth.authenticateAsync.mockResolvedValue({ success: true });
      mockedSecureStore.setItemAsync.mockResolvedValue();
      mockedSecureStore.getItemAsync.mockResolvedValue(
        JSON.stringify({
          _id: "user-id",
          email: "test@example.com",
        }),
      );

      const result = await authService.enableBiometricAuthentication();

      expect(result).toBe(true);
      expect(mockedSecureStore.setItemAsync).toHaveBeenCalled();
    });

    it("should login with biometrics successfully", async () => {
      mockedSecureStore.getItemAsync.mockResolvedValue("true");
      mockedLocalAuth.hasHardwareAsync.mockResolvedValue(true);
      mockedLocalAuth.isEnrolledAsync.mockResolvedValue(true);
      mockedLocalAuth.authenticateAsync.mockResolvedValue({ success: true });
      mockedSecureStore.getItemAsync
        .mockResolvedValueOnce("true")
        .mockResolvedValueOnce('{"email":"test@example.com","biometricToken":"token"}');

      const mockResponse = {
        accessToken: "access-token",
        refreshToken: "refresh-token",
        user: { _id: "user-id", email: "test@example.com" },
      };
      mockedApi.auth.biometricLogin.mockResolvedValue(mockResponse);
      mockedSecureStore.setItemAsync.mockResolvedValue();

      const result = await authService.loginWithBiometrics();

      expect(result).toEqual(mockResponse);
      expect(mockedApi.auth.biometricLogin).toHaveBeenCalled();
    });
  });

  describe("Session Management", () => {
    it("should check if user is authenticated", async () => {
      mockedSecureStore.getItemAsync
        .mockResolvedValueOnce("access-token")
        .mockResolvedValueOnce('{"_id":"user-id","email":"test@example.com"}');

      const result = await authService.isAuthenticated();

      expect(result).toBe(true);
    });

    it("should return false if no token", async () => {
      mockedSecureStore.getItemAsync.mockResolvedValue(null);

      const result = await authService.isAuthenticated();

      expect(result).toBe(false);
    });

    it("should clear tokens on logout", async () => {
      mockedApi.auth.logout.mockResolvedValue();
      mockedSecureStore.deleteItemAsync.mockResolvedValue();

      await authService.logout();

      expect(mockedSecureStore.deleteItemAsync).toHaveBeenCalledTimes(5);
      expect(mockedApi.auth.logout).toHaveBeenCalled();
    });

    it("should handle logout even if server request fails", async () => {
      mockedApi.auth.logout.mockRejectedValue(new Error("Network error"));
      mockedSecureStore.deleteItemAsync.mockResolvedValue();

      await expect(authService.logout()).resolves.not.toThrow();

      expect(mockedSecureStore.deleteItemAsync).toHaveBeenCalled();
    });
  });

  describe("User Management", () => {
    it("should get current user", async () => {
      const mockUser = {
        _id: "user-id",
        email: "test@example.com",
        firstName: "Test",
        lastName: "User",
      };

      mockedSecureStore.getItemAsync.mockResolvedValue(JSON.stringify(mockUser));

      const result = await authService.getCurrentUser();

      expect(result).toEqual(mockUser);
    });

    it("should update user data", async () => {
      const currentUser = {
        _id: "user-id",
        email: "test@example.com",
      };
      const updatedFields = { firstName: "Updated" };

      mockedSecureStore.getItemAsync.mockResolvedValue(
        JSON.stringify(currentUser),
      );
      mockedSecureStore.setItemAsync.mockResolvedValue();

      await authService.updateUser(updatedFields);

      expect(mockedSecureStore.setItemAsync).toHaveBeenCalled();
    });

    it("should throw error when updating user without authentication", async () => {
      mockedSecureStore.getItemAsync.mockResolvedValue(null);

      await expect(
        authService.updateUser({ firstName: "Test" }),
      ).rejects.toThrow(AuthError);
    });
  });

  describe("Password Management", () => {
    it("should request password reset", async () => {
      const mockResponse = { success: true, message: "Email sent" };

      mockedApi.auth.forgotPassword.mockResolvedValue(mockResponse);

      const result = await authService.forgotPassword("test@example.com");

      expect(result).toEqual(mockResponse);
      expect(mockedApi.auth.forgotPassword).toHaveBeenCalledWith(
        "test@example.com",
      );
    });

    it("should reset password successfully", async () => {
      const resetData = {
        token: "reset-token",
        password: "newpassword",
        confirmPassword: "newpassword",
      };
      const mockResponse = { success: true, message: "Password reset" };

      mockedApi.auth.resetPassword.mockResolvedValue(mockResponse);

      const result = await authService.resetPassword(resetData);

      expect(result).toEqual(mockResponse);
      expect(mockedApi.auth.resetPassword).toHaveBeenCalled();
    });

    it("should throw error if passwords don't match", async () => {
      const resetData = {
        token: "reset-token",
        password: "newpassword",
        confirmPassword: "mismatched",
      };

      await expect(authService.resetPassword(resetData)).rejects.toThrow(
        AuthError,
      );
      expect(mockedApi.auth.resetPassword).not.toHaveBeenCalled();
    });
  });

  describe("JWT Token Validation (WI-004)", () => {
    const createMockToken = (expiresInMs: number): string => {
      const expiry = Math.floor((Date.now() + expiresInMs) / 1000);
      const payload = { exp: expiry, sub: "user-id", email: "test@example.com" };
      const encodedPayload = btoa(JSON.stringify(payload));
      return `header.${encodedPayload}.signature`;
    };

    it("should validate access token when valid", async () => {
      const validToken = createMockToken(15 * 60 * 1000); // 15 minutes from now
      mockedSecureStore.getItemAsync.mockResolvedValue(validToken);
      
      jest.spyOn(jwtUtils, "validateToken").mockReturnValue({
        isValid: true,
        isExpired: false,
        expiresAt: new Date(Date.now() + 15 * 60 * 1000),
        expiresIn: 15 * 60 * 1000,
        payload: { exp: Math.floor((Date.now() + 15 * 60 * 1000) / 1000), sub: "user-id" },
      });

      const result = await authService.validateAccessToken();

      expect(result.isValid).toBe(true);
      expect(result.isExpired).toBe(false);
    });

    it("should detect expired token", async () => {
      const expiredToken = createMockToken(-1000); // 1 second ago
      mockedSecureStore.getItemAsync.mockResolvedValue(expiredToken);
      
      jest.spyOn(jwtUtils, "validateToken").mockReturnValue({
        isValid: false,
        isExpired: true,
        expiresAt: new Date(Date.now() - 1000),
        expiresIn: 0,
        payload: null,
      });

      const result = await authService.validateAccessToken();

      expect(result.isValid).toBe(false);
      expect(result.isExpired).toBe(true);
    });

    it("should return false when no access token found", async () => {
      mockedSecureStore.getItemAsync.mockResolvedValue(null);

      const result = await authService.needsTokenRefresh();

      expect(result).toBe(false);
    });

    it("should detect when token needs refresh (expiring soon)", async () => {
      const expiringToken = createMockToken(3 * 60 * 1000); // 3 minutes from now
      mockedSecureStore.getItemAsync.mockResolvedValue(expiringToken);
      
      jest.spyOn(jwtUtils, "shouldRefreshToken").mockReturnValue(true);

      const result = await authService.needsTokenRefresh();

      expect(result).toBe(true);
    });

    it("should get token expiration info", async () => {
      const token = createMockToken(10 * 60 * 1000); // 10 minutes from now
      mockedSecureStore.getItemAsync.mockResolvedValue(token);
      
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
      jest.spyOn(jwtUtils, "getTokenExpiration").mockReturnValue(expiresAt);
      jest.spyOn(jwtUtils, "getTokenExpiresIn").mockReturnValue(10 * 60 * 1000);

      const result = await authService.getTokenExpirationInfo();

      expect(result.isValid).toBe(true);
      expect(result.expiresIn).toBeGreaterThan(0);
    });

    it("should automatically refresh token when expiring soon", async () => {
      const token = createMockToken(3 * 60 * 1000); // Expiring in 3 minutes
      mockedSecureStore.getItemAsync.mockResolvedValue(token);
      
      const mockResponse = {
        accessToken: "new-access-token",
        refreshToken: "new-refresh-token",
        user: { _id: "user-id" },
      };

      jest.spyOn(jwtUtils, "validateToken").mockReturnValue({
        isValid: true,
        isExpired: false,
        expiresAt: new Date(Date.now() + 3 * 60 * 1000),
        expiresIn: 3 * 60 * 1000,
        payload: { exp: Math.floor((Date.now() + 3 * 60 * 1000) / 1000) },
      });

      jest.spyOn(jwtUtils, "shouldRefreshToken").mockReturnValue(true);
      
      mockedSecureStore.getItemAsync.mockResolvedValueOnce(token) // for getAccessToken
        .mockResolvedValueOnce("refresh-token"); // for getRefreshToken
      
      mockedApi.auth.refreshToken.mockResolvedValue(mockResponse);
      mockedSecureStore.setItemAsync.mockResolvedValue();

      const result = await authService.ensureValidToken();

      expect(result).toBe(true);
      expect(mockedApi.auth.refreshToken).toHaveBeenCalled();
    });
  });

  describe("Token Refresh with Retry (WI-004)", () => {
    it("should retry failed token refresh up to 3 times", async () => {
      mockedSecureStore.getItemAsync.mockResolvedValue("refresh-token");
      mockedApi.auth.refreshToken
        .mockRejectedValueOnce(new Error("Network error"))
        .mockRejectedValueOnce(new Error("Network error"))
        .mockRejectedValueOnce(new Error("Network error"));

      const result = await authService.refreshToken();

      expect(result).toBeNull();
      expect(mockedApi.auth.refreshToken).toHaveBeenCalledTimes(3);
    });

    it("should succeed on second attempt with exponential backoff", async () => {
      const mockResponse = {
        accessToken: "new-access-token",
        refreshToken: "new-refresh-token",
        user: { _id: "user-id" },
      };

      mockedSecureStore.getItemAsync.mockResolvedValue("refresh-token");
      mockedApi.auth.refreshToken
        .mockRejectedValueOnce(new Error("Network error"))
        .mockResolvedValueOnce(mockResponse);
      
      mockedSecureStore.setItemAsync.mockResolvedValue();

      const result = await authService.refreshToken();

      expect(result).toEqual(mockResponse);
      expect(mockedApi.auth.refreshToken).toHaveBeenCalledTimes(2);
    });
  });

  describe("Error Handling", () => {
    it("should handle storage errors gracefully", async () => {
      mockedApi.auth.login.mockResolvedValue({
        accessToken: "token",
        refreshToken: "refresh",
        user: { _id: "user-id" },
      });
      mockedSecureStore.setItemAsync.mockRejectedValue(
        new Error("Storage error"),
      );

      await expect(
        authService.login({
          email: "test@example.com",
          password: "password",
        }),
      ).rejects.toThrow(AuthError);
    });

    it("should handle network errors during authentication", async () => {
      mockedApi.auth.login.mockRejectedValue(new Error("Network error"));

      await expect(
        authService.login({
        email: "test@example.com",
          password: "password",
        }),
      ).rejects.toThrow(AuthError);
    });
  });
});

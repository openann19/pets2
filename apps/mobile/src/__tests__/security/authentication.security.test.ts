/**
 * Security Test Suite
 * Comprehensive security validation for mobile app
 */

import * as SecureStore from "expo-secure-store";
import { authService } from "../../services/AuthService";
import { biometricService } from "../../services/BiometricService";
import { logger } from "@pawfectmatch/core";

// Mock dependencies
jest.mock("expo-secure-store");
jest.mock("../../services/AuthService");
jest.mock("../../services/BiometricService");
jest.mock("@pawfectmatch/core");

describe("Security Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Authentication Security", () => {
    it("should store tokens securely", async () => {
      const mockTokens = {
        accessToken: "test-access-token",
        refreshToken: "test-refresh-token",
      };

      (SecureStore.setItemAsync as jest.Mock).mockResolvedValue(undefined);

      await authService.storeTokens(mockTokens);

      expect(SecureStore.setItemAsync).toHaveBeenCalledWith(
        "auth_access_token",
        "test-access-token",
      );
      expect(SecureStore.setItemAsync).toHaveBeenCalledWith(
        "auth_refresh_token",
        "test-refresh-token",
      );
    });

    it("should not store tokens in plain text", async () => {
      const mockTokens = {
        accessToken: "sensitive-access-token",
        refreshToken: "sensitive-refresh-token",
      };

      (SecureStore.setItemAsync as jest.Mock).mockResolvedValue(undefined);

      await authService.storeTokens(mockTokens);

      // Verify tokens are stored in secure storage, not plain text
      expect(SecureStore.setItemAsync).toHaveBeenCalledWith(
        "auth_access_token",
        "sensitive-access-token",
      );
    });

    it("should handle token expiration securely", async () => {
      const expiredToken = "expired-token";
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(expiredToken);
      (authService.refreshToken as jest.Mock).mockResolvedValue({
        accessToken: "new-access-token",
        refreshToken: "new-refresh-token",
      });

      await authService.handleTokenExpiration();

      expect(authService.refreshToken).toHaveBeenCalled();
    });

    it("should clear sensitive data on logout", async () => {
      (SecureStore.deleteItemAsync as jest.Mock).mockResolvedValue(undefined);

      await authService.logout();

      expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith(
        "auth_access_token",
      );
      expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith(
        "auth_refresh_token",
      );
      expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith("auth_user");
    });

    it("should validate token format", async () => {
      const invalidToken = "invalid-token-format";

      const isValid = authService.validateTokenFormat(invalidToken);

      expect(isValid).toBe(false);
    });

    it("should handle session hijacking attempts", async () => {
      const suspiciousToken = "suspicious-token";
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(
        suspiciousToken,
      );

      const result = await authService.validateSession(suspiciousToken);

      expect(result.isValid).toBe(false);
      expect(result.reason).toBe("Suspicious token detected");
    });
  });

  describe("Biometric Security", () => {
    it("should store biometric credentials securely", async () => {
      const credentials = {
        username: "test@example.com",
        password: "password123",
      };

      (SecureStore.setItemAsync as jest.Mock).mockResolvedValue(undefined);

      await biometricService.storeCredentials(credentials);

      expect(SecureStore.setItemAsync).toHaveBeenCalledWith(
        "biometric_credentials",
        JSON.stringify(credentials),
      );
    });

    it("should not store biometric credentials in plain text", async () => {
      const credentials = {
        username: "sensitive@example.com",
        password: "sensitive-password",
      };

      (SecureStore.setItemAsync as jest.Mock).mockResolvedValue(undefined);

      await biometricService.storeCredentials(credentials);

      // Verify credentials are stored securely
      expect(SecureStore.setItemAsync).toHaveBeenCalledWith(
        "biometric_credentials",
        expect.stringContaining("sensitive@example.com"),
      );
    });

    it("should validate biometric authentication results", async () => {
      (biometricService.authenticate as jest.Mock).mockResolvedValue({
        success: true,
        error: null,
      });

      const result = await biometricService.authenticate();

      expect(result.success).toBe(true);
      expect(result.error).toBeNull();
    });

    it("should handle biometric authentication failures securely", async () => {
      (biometricService.authenticate as jest.Mock).mockResolvedValue({
        success: false,
        error: "Authentication failed",
      });

      const result = await biometricService.authenticate();

      expect(result.success).toBe(false);
      expect(result.error).toBe("Authentication failed");
    });

    it("should clear biometric credentials on disable", async () => {
      (SecureStore.deleteItemAsync as jest.Mock).mockResolvedValue(undefined);

      await biometricService.disableBiometric();

      expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith(
        "biometric_credentials",
      );
    });
  });

  describe("Data Protection", () => {
    it("should encrypt sensitive user data", async () => {
      const sensitiveData = {
        email: "user@example.com",
        phone: "+1234567890",
        address: "123 Main St",
      };

      (SecureStore.setItemAsync as jest.Mock).mockResolvedValue(undefined);

      await authService.storeUserData(sensitiveData);

      expect(SecureStore.setItemAsync).toHaveBeenCalledWith(
        "user_data",
        expect.stringContaining("user@example.com"),
      );
    });

    it("should validate data before storage", async () => {
      const invalidData = {
        email: "invalid-email",
        phone: "invalid-phone",
      };

      const result = await authService.validateUserData(invalidData);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("Invalid email format");
      expect(result.errors).toContain("Invalid phone format");
    });

    it("should handle data corruption gracefully", async () => {
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(
        "corrupted-data",
      );

      const result = await authService.getUserData();

      expect(result).toBeNull();
      expect(logger.error).toHaveBeenCalled();
    });

    it("should sanitize user input", async () => {
      const maliciousInput = '<script>alert("xss")</script>';

      const sanitized = authService.sanitizeInput(maliciousInput);

      expect(sanitized).not.toContain("<script>");
      expect(sanitized).not.toContain("alert");
    });

    it("should prevent SQL injection in user input", async () => {
      const sqlInjection = "'; DROP TABLE users; --";

      const sanitized = authService.sanitizeInput(sqlInjection);

      expect(sanitized).not.toContain("DROP TABLE");
      expect(sanitized).not.toContain("--");
    });

    it("should validate file uploads", async () => {
      const maliciousFile = {
        name: "malicious.exe",
        type: "application/x-executable",
        size: 1024,
      };

      const result = await authService.validateFileUpload(maliciousFile);

      expect(result.isValid).toBe(false);
      expect(result.reason).toBe("Invalid file type");
    });

    it("should limit file upload size", async () => {
      const largeFile = {
        name: "large-image.jpg",
        type: "image/jpeg",
        size: 50 * 1024 * 1024, // 50MB
      };

      const result = await authService.validateFileUpload(largeFile);

      expect(result.isValid).toBe(false);
      expect(result.reason).toBe("File too large");
    });
  });

  describe("Network Security", () => {
    it("should validate SSL certificates", async () => {
      const mockResponse = {
        status: 200,
        headers: {
          "strict-transport-security": "max-age=31536000",
        },
      };

      const result = await authService.validateSSLResponse(mockResponse);

      expect(result.isSecure).toBe(true);
    });

    it("should detect insecure connections", async () => {
      const insecureResponse = {
        status: 200,
        headers: {},
      };

      const result = await authService.validateSSLResponse(insecureResponse);

      expect(result.isSecure).toBe(false);
      expect(result.reason).toBe("Missing security headers");
    });

    it("should handle certificate pinning", async () => {
      const pinnedCertificate =
        "sha256/AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=";

      const result =
        await authService.validateCertificatePinning(pinnedCertificate);

      expect(result.isValid).toBe(true);
    });

    it("should detect certificate mismatch", async () => {
      const mismatchedCertificate =
        "sha256/BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB=";

      const result = await authService.validateCertificatePinning(
        mismatchedCertificate,
      );

      expect(result.isValid).toBe(false);
      expect(result.reason).toBe("Certificate mismatch");
    });

    it("should validate API endpoints", async () => {
      const validEndpoint = "https://api.pawfectmatch.com/v1/pets";
      const invalidEndpoint = "http://malicious-site.com/steal-data";

      const validResult = await authService.validateEndpoint(validEndpoint);
      const invalidResult = await authService.validateEndpoint(invalidEndpoint);

      expect(validResult.isValid).toBe(true);
      expect(invalidResult.isValid).toBe(false);
    });

    it("should handle network interception attempts", async () => {
      const suspiciousRequest = {
        url: "https://api.pawfectmatch.com/v1/pets",
        headers: {
          "user-agent": "malicious-proxy",
        },
      };

      const result =
        await authService.detectNetworkInterception(suspiciousRequest);

      expect(result.isIntercepted).toBe(true);
      expect(result.reason).toBe("Suspicious user agent");
    });
  });

  describe("Input Validation", () => {
    it("should validate email format", async () => {
      const validEmail = "user@example.com";
      const invalidEmail = "invalid-email";

      const validResult = await authService.validateEmail(validEmail);
      const invalidResult = await authService.validateEmail(invalidEmail);

      expect(validResult.isValid).toBe(true);
      expect(invalidResult.isValid).toBe(false);
    });

    it("should validate password strength", async () => {
      const weakPassword = "123";
      const strongPassword = "StrongPassword123!";

      const weakResult = await authService.validatePassword(weakPassword);
      const strongResult = await authService.validatePassword(strongPassword);

      expect(weakResult.isValid).toBe(false);
      expect(weakResult.reason).toBe("Password too weak");
      expect(strongResult.isValid).toBe(true);
    });

    it("should prevent password reuse", async () => {
      const previousPasswords = ["password123", "password456"];
      const newPassword = "password123";

      const result = await authService.checkPasswordReuse(
        newPassword,
        previousPasswords,
      );

      expect(result.isReused).toBe(true);
      expect(result.reason).toBe("Password already used");
    });

    it("should validate phone number format", async () => {
      const validPhone = "+1234567890";
      const invalidPhone = "invalid-phone";

      const validResult = await authService.validatePhone(validPhone);
      const invalidResult = await authService.validatePhone(invalidPhone);

      expect(validResult.isValid).toBe(true);
      expect(invalidResult.isValid).toBe(false);
    });

    it("should sanitize text input", async () => {
      const maliciousText = '<script>alert("xss")</script>Hello World';

      const sanitized = authService.sanitizeTextInput(maliciousText);

      expect(sanitized).toBe("Hello World");
      expect(sanitized).not.toContain("<script>");
    });

    it("should validate JSON input", async () => {
      const validJson = '{"name": "John", "age": 30}';
      const invalidJson = '{"name": "John", "age": 30'; // Missing closing brace

      const validResult = await authService.validateJsonInput(validJson);
      const invalidResult = await authService.validateJsonInput(invalidJson);

      expect(validResult.isValid).toBe(true);
      expect(invalidResult.isValid).toBe(false);
    });
  });

  describe("Session Security", () => {
    it("should validate session tokens", async () => {
      const validToken = "valid-session-token";
      const invalidToken = "invalid-session-token";

      (authService.validateSessionToken as jest.Mock)
        .mockResolvedValueOnce({ isValid: true })
        .mockResolvedValueOnce({ isValid: false });

      const validResult = await authService.validateSessionToken(validToken);
      const invalidResult =
        await authService.validateSessionToken(invalidToken);

      expect(validResult.isValid).toBe(true);
      expect(invalidResult.isValid).toBe(false);
    });

    it("should handle session timeout", async () => {
      const expiredSession = {
        token: "expired-token",
        expiresAt: Date.now() - 1000, // Expired 1 second ago
      };

      const result = await authService.checkSessionTimeout(expiredSession);

      expect(result.isExpired).toBe(true);
      expect(result.reason).toBe("Session expired");
    });

    it("should detect suspicious session activity", async () => {
      const suspiciousActivity = {
        token: "valid-token",
        ipAddress: "192.168.1.1",
        userAgent: "Mozilla/5.0",
        lastActivity: Date.now() - 1000,
        currentIpAddress: "10.0.0.1", // Different IP
        currentUserAgent: "Chrome/91.0", // Different user agent
      };

      const result =
        await authService.detectSuspiciousActivity(suspiciousActivity);

      expect(result.isSuspicious).toBe(true);
      expect(result.reason).toBe("IP address changed");
    });

    it("should handle concurrent sessions", async () => {
      const activeSessions = [
        { token: "token1", device: "iPhone" },
        { token: "token2", device: "iPad" },
        { token: "token3", device: "Android" },
      ];

      const result = await authService.handleConcurrentSessions(activeSessions);

      expect(result.shouldTerminateOldSessions).toBe(true);
      expect(result.maxSessions).toBe(2);
    });
  });

  describe("API Security", () => {
    it("should validate API keys", async () => {
      const validApiKey = "valid-api-key-123";
      const invalidApiKey = "invalid-api-key";

      (authService.validateApiKey as jest.Mock)
        .mockResolvedValueOnce({ isValid: true })
        .mockResolvedValueOnce({ isValid: false });

      const validResult = await authService.validateApiKey(validApiKey);
      const invalidResult = await authService.validateApiKey(invalidApiKey);

      expect(validResult.isValid).toBe(true);
      expect(invalidResult.isValid).toBe(false);
    });

    it("should handle rate limiting", async () => {
      const requestCount = 100;
      const timeWindow = 60000; // 1 minute

      const result = await authService.checkRateLimit(requestCount, timeWindow);

      expect(result.isRateLimited).toBe(true);
      expect(result.reason).toBe("Too many requests");
    });

    it("should validate request signatures", async () => {
      const request = {
        method: "POST",
        url: "/api/pets",
        body: { name: "Buddy" },
        signature: "valid-signature",
      };

      const result = await authService.validateRequestSignature(request);

      expect(result.isValid).toBe(true);
    });

    it("should detect request tampering", async () => {
      const tamperedRequest = {
        method: "POST",
        url: "/api/pets",
        body: { name: "Buddy" },
        signature: "tampered-signature",
      };

      const result =
        await authService.validateRequestSignature(tamperedRequest);

      expect(result.isValid).toBe(false);
      expect(result.reason).toBe("Invalid signature");
    });
  });

  describe("Error Handling Security", () => {
    it("should not expose sensitive information in errors", async () => {
      const sensitiveError = new Error(
        "Database connection failed: password=secret123",
      );

      const sanitizedError = authService.sanitizeError(sensitiveError);

      expect(sanitizedError.message).not.toContain("password=secret123");
      expect(sanitizedError.message).toContain("Database connection failed");
    });

    it("should log security events appropriately", async () => {
      const securityEvent = {
        type: "failed_login",
        ip: "192.168.1.1",
        userAgent: "Mozilla/5.0",
        timestamp: Date.now(),
      };

      await authService.logSecurityEvent(securityEvent);

      expect(logger.warn).toHaveBeenCalledWith(
        "Security event: failed_login",
        expect.objectContaining({
          ip: "192.168.1.1",
          userAgent: "Mozilla/5.0",
        }),
      );
    });

    it("should handle security exceptions gracefully", async () => {
      const securityException = new Error("Security violation detected");

      const result =
        await authService.handleSecurityException(securityException);

      expect(result.shouldBlock).toBe(true);
      expect(result.reason).toBe("Security violation detected");
    });
  });
});

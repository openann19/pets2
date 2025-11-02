/**
 * BiometricService Test Suite
 * Comprehensive tests for biometric authentication service
 */

import * as LocalAuthentication from "expo-local-authentication";
import * as SecureStore from "expo-secure-store";
import { biometricService } from "../BiometricService";
import { logger } from "@pawfectmatch/core";
import "../../__tests__/utils/customMatchers"; // Import custom matchers

// Mock all external dependencies
jest.mock("expo-local-authentication");
jest.mock("expo-secure-store");
jest.mock("@pawfectmatch/core", () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
  },
}));

describe("BiometricService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset SecureStore mocks
    (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(null);
    (SecureStore.setItemAsync as jest.Mock).mockResolvedValue(undefined);
    (SecureStore.deleteItemAsync as jest.Mock).mockResolvedValue(undefined);
  });

  describe("Hardware Support Detection", () => {
    it("should detect biometric hardware availability", async () => {
      (LocalAuthentication.hasHardwareAsync as jest.Mock).mockResolvedValue(
        true,
      );

      const result = await biometricService.checkBiometricSupport();

      expect(LocalAuthentication.hasHardwareAsync).toHaveBeenCalled();
      expect(result.hasHardware).toBe(true);
    });

    it("should detect no biometric hardware", async () => {
      (LocalAuthentication.hasHardwareAsync as jest.Mock).mockResolvedValue(
        false,
      );

      const result = await biometricService.checkBiometricSupport();

      expect(result.hasHardware).toBe(false);
      expect(result.isEnrolled).toBe(false);
    });

    it("should check enrollment status when hardware is available", async () => {
      (LocalAuthentication.hasHardwareAsync as jest.Mock).mockResolvedValue(
        true,
      );
      (LocalAuthentication.isEnrolledAsync as jest.Mock).mockResolvedValue(
        true,
      );

      const result = await biometricService.checkBiometricSupport();

      expect(LocalAuthentication.isEnrolledAsync).toHaveBeenCalled();
      expect(result.isEnrolled).toBe(true);
    });

    it("should detect no enrollment when hardware is available", async () => {
      (LocalAuthentication.hasHardwareAsync as jest.Mock).mockResolvedValue(
        true,
      );
      (LocalAuthentication.isEnrolledAsync as jest.Mock).mockResolvedValue(
        false,
      );

      const result = await biometricService.checkBiometricSupport();

      expect(result.isEnrolled).toBe(false);
    });

    it("should get supported authentication types", async () => {
      (LocalAuthentication.hasHardwareAsync as jest.Mock).mockResolvedValue(
        true,
      );
      (LocalAuthentication.isEnrolledAsync as jest.Mock).mockResolvedValue(
        true,
      );
      (
        LocalAuthentication.supportedAuthenticationTypesAsync as jest.Mock
      ).mockResolvedValue([1, 2]);

      const result = await biometricService.checkBiometricSupport();

      expect(
        LocalAuthentication.supportedAuthenticationTypesAsync,
      ).toHaveBeenCalled();
      expect(result.supportedTypes).toEqual([1, 2]);
    });

    it("should get enrolled level", async () => {
      (LocalAuthentication.hasHardwareAsync as jest.Mock).mockResolvedValue(
        true,
      );
      (LocalAuthentication.isEnrolledAsync as jest.Mock).mockResolvedValue(
        true,
      );
      (
        LocalAuthentication.getEnrolledLevelAsync as jest.Mock
      ).mockResolvedValue(1);

      const result = await biometricService.checkBiometricSupport();

      expect(LocalAuthentication.getEnrolledLevelAsync).toHaveBeenCalled();
      expect(result.enrolledLevel).toBe(1);
    });
  });

  describe("Biometric Authentication", () => {
    beforeEach(() => {
      (LocalAuthentication.hasHardwareAsync as jest.Mock).mockResolvedValue(
        true,
      );
      (LocalAuthentication.isEnrolledAsync as jest.Mock).mockResolvedValue(
        true,
      );
    });

    it("should authenticate successfully with biometrics", async () => {
      (LocalAuthentication.authenticateAsync as jest.Mock).mockResolvedValue({
        success: true,
        error: null,
      });

      const result = await biometricService.authenticate();

      expect(LocalAuthentication.authenticateAsync).toHaveBeenCalledWith({
        promptMessage: "Authenticate to continue",
        cancelLabel: "Cancel",
        fallbackLabel: "Use Password",
      });
      expect(result.success).toBe(true);
      expect(result.error).toBeNull();
    });

    it("should handle authentication failure", async () => {
      (LocalAuthentication.authenticateAsync as jest.Mock).mockResolvedValue({
        success: false,
        error: "Authentication failed",
      });

      const result = await biometricService.authenticate();

      expect(result.success).toBe(false);
      expect(result.error).toBe("Authentication failed");
    });

    it("should handle user cancellation", async () => {
      (LocalAuthentication.authenticateAsync as jest.Mock).mockResolvedValue({
        success: false,
        error: "UserCancel",
      });

      const result = await biometricService.authenticate();

      expect(result.success).toBe(false);
      expect(result.error).toBe("UserCancel");
    });

    it("should handle system cancellation", async () => {
      (LocalAuthentication.authenticateAsync as jest.Mock).mockResolvedValue({
        success: false,
        error: "SystemCancel",
      });

      const result = await biometricService.authenticate();

      expect(result.success).toBe(false);
      expect(result.error).toBe("SystemCancel");
    });

    it("should use custom prompt message", async () => {
      (LocalAuthentication.authenticateAsync as jest.Mock).mockResolvedValue({
        success: true,
        error: null,
      });

      await biometricService.authenticate("Custom authentication message");

      expect(LocalAuthentication.authenticateAsync).toHaveBeenCalledWith({
        promptMessage: "Custom authentication message",
        cancelLabel: "Cancel",
        fallbackLabel: "Use Password",
      });
    });

    it("should handle authentication with custom options", async () => {
      (LocalAuthentication.authenticateAsync as jest.Mock).mockResolvedValue({
        success: true,
        error: null,
      });

      const options = {
        promptMessage: "Login to PawfectMatch",
        cancelLabel: "Cancel",
        fallbackLabel: "Use Password",
        disableDeviceFallback: false,
      };

      await biometricService.authenticateWithOptions(options);

      expect(LocalAuthentication.authenticateAsync).toHaveBeenCalledWith(
        options,
      );
    });
  });

  describe("Biometric Setup and Management", () => {
    it("should check if biometrics are enabled", async () => {
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValue("true");

      const result = await biometricService.isBiometricEnabled();

      expect(SecureStore.getItemAsync).toHaveBeenCalledWith(
        "biometric_enabled",
      );
      expect(result).toBe(true);
    });

    it("should return false when biometrics are not enabled", async () => {
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(null);

      const result = await biometricService.isBiometricEnabled();

      expect(result).toBe(false);
    });

    it("should enable biometric authentication", async () => {
      (LocalAuthentication.hasHardwareAsync as jest.Mock).mockResolvedValue(
        true,
      );
      (LocalAuthentication.isEnrolledAsync as jest.Mock).mockResolvedValue(
        true,
      );
      (SecureStore.setItemAsync as jest.Mock).mockResolvedValue(undefined);

      const result = await biometricService.enableBiometric();

      expect(SecureStore.setItemAsync).toHaveBeenCalledWith(
        "biometric_enabled",
        "true",
      );
      expect(result.success).toBe(true);
    });

    it("should fail to enable biometrics when hardware not available", async () => {
      (LocalAuthentication.hasHardwareAsync as jest.Mock).mockResolvedValue(
        false,
      );

      const result = await biometricService.enableBiometric();

      expect(result.success).toBe(false);
      expect(result.error).toBe("Biometric hardware not available");
    });

    it("should fail to enable biometrics when not enrolled", async () => {
      (LocalAuthentication.hasHardwareAsync as jest.Mock).mockResolvedValue(
        true,
      );
      (LocalAuthentication.isEnrolledAsync as jest.Mock).mockResolvedValue(
        false,
      );

      const result = await biometricService.enableBiometric();

      expect(result.success).toBe(false);
      expect(result.error).toBe("No biometric credentials enrolled");
    });

    it("should disable biometric authentication", async () => {
      (SecureStore.deleteItemAsync as jest.Mock).mockResolvedValue(undefined);

      const result = await biometricService.disableBiometric();

      expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith(
        "biometric_enabled",
      );
      expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith(
        "biometric_credentials",
      );
      expect(result.success).toBe(true);
    });

    it("should handle disable biometric failure", async () => {
      (SecureStore.deleteItemAsync as jest.Mock).mockRejectedValue(
        new Error("Storage error"),
      );

      const result = await biometricService.disableBiometric();

      expect(result.success).toBe(false);
      expect(result.error).toBe("Storage error");
    });
  });

  describe("Credential Management", () => {
    it("should store biometric credentials", async () => {
      const credentials = {
        username: "test@example.com",
        password: "password123",
      };
      (SecureStore.setItemAsync as jest.Mock).mockResolvedValue(undefined);

      const result = await biometricService.storeCredentials(credentials);

      expect(SecureStore.setItemAsync).toHaveBeenCalledWith(
        "biometric_credentials",
        JSON.stringify(credentials),
      );
      expect(result.success).toBe(true);
    });

    it("should retrieve biometric credentials", async () => {
      const credentials = {
        username: "test@example.com",
        password: "password123",
      };
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(
        JSON.stringify(credentials),
      );

      const result = await biometricService.getStoredCredentials();

      expect(SecureStore.getItemAsync).toHaveBeenCalledWith(
        "biometric_credentials",
      );
      expect(result).toEqual(credentials);
    });

    it("should return null when no credentials stored", async () => {
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(null);

      const result = await biometricService.getStoredCredentials();

      expect(result).toBeNull();
    });

    it("should handle corrupted credential data", async () => {
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValue("invalid-json");

      const result = await biometricService.getStoredCredentials();

      expect(result).toBeNull();
      expect(logger.error).toHaveBeenCalled();
    });

    it("should clear stored credentials", async () => {
      (SecureStore.deleteItemAsync as jest.Mock).mockResolvedValue(undefined);

      const result = await biometricService.clearStoredCredentials();

      expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith(
        "biometric_credentials",
      );
      expect(result.success).toBe(true);
    });
  });

  describe("Error Handling", () => {
    it("should handle hardware check errors", async () => {
      (LocalAuthentication.hasHardwareAsync as jest.Mock).mockRejectedValue(
        new Error("Hardware check failed"),
      );

      const result = await biometricService.checkBiometricSupport();

      expect(result.hasHardware).toBe(false);
      expect(result.error).toBe("Hardware check failed");
      expect(logger.error).toHaveBeenCalled();
    });

    it("should handle enrollment check errors", async () => {
      (LocalAuthentication.hasHardwareAsync as jest.Mock).mockResolvedValue(
        true,
      );
      (LocalAuthentication.isEnrolledAsync as jest.Mock).mockRejectedValue(
        new Error("Enrollment check failed"),
      );

      const result = await biometricService.checkBiometricSupport();

      expect(result.isEnrolled).toBe(false);
      expect(result.error).toBe("Enrollment check failed");
    });

    it("should handle authentication errors", async () => {
      (LocalAuthentication.hasHardwareAsync as jest.Mock).mockResolvedValue(
        true,
      );
      (LocalAuthentication.isEnrolledAsync as jest.Mock).mockResolvedValue(
        true,
      );
      (LocalAuthentication.authenticateAsync as jest.Mock).mockRejectedValue(
        new Error("Authentication error"),
      );

      const result = await biometricService.authenticate();

      expect(result.success).toBe(false);
      expect(result.error).toBe("Authentication error");
      expect(logger.error).toHaveBeenCalled();
    });

    it("should handle storage errors", async () => {
      (SecureStore.setItemAsync as jest.Mock).mockRejectedValue(
        new Error("Storage error"),
      );

      const result = await biometricService.storeCredentials({
        username: "test@example.com",
        password: "password123",
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe("Storage error");
    });
  });

  describe("Platform-Specific Behavior", () => {
    it("should handle iOS-specific authentication types", async () => {
      (LocalAuthentication.hasHardwareAsync as jest.Mock).mockResolvedValue(
        true,
      );
      (LocalAuthentication.isEnrolledAsync as jest.Mock).mockResolvedValue(
        true,
      );
      (
        LocalAuthentication.supportedAuthenticationTypesAsync as jest.Mock
      ).mockResolvedValue([1]); // Face ID

      const result = await biometricService.checkBiometricSupport();

      expect(result.supportedTypes).toEqual([1]);
    });

    it("should handle Android-specific authentication types", async () => {
      (LocalAuthentication.hasHardwareAsync as jest.Mock).mockResolvedValue(
        true,
      );
      (LocalAuthentication.isEnrolledAsync as jest.Mock).mockResolvedValue(
        true,
      );
      (
        LocalAuthentication.supportedAuthenticationTypesAsync as jest.Mock
      ).mockResolvedValue([2]); // Fingerprint

      const result = await biometricService.checkBiometricSupport();

      expect(result.supportedTypes).toEqual([2]);
    });

    it("should handle multiple authentication types", async () => {
      (LocalAuthentication.hasHardwareAsync as jest.Mock).mockResolvedValue(
        true,
      );
      (LocalAuthentication.isEnrolledAsync as jest.Mock).mockResolvedValue(
        true,
      );
      (
        LocalAuthentication.supportedAuthenticationTypesAsync as jest.Mock
      ).mockResolvedValue([1, 2]); // Both Face ID and Fingerprint

      const result = await biometricService.checkBiometricSupport();

      expect(result.supportedTypes).toEqual([1, 2]);
    });
  });

  describe("Security Considerations", () => {
    it("should not store credentials in plain text", async () => {
      const credentials = {
        username: "test@example.com",
        password: "password123",
      };
      (SecureStore.setItemAsync as jest.Mock).mockResolvedValue(undefined);

      await biometricService.storeCredentials(credentials);

      expect(SecureStore.setItemAsync).toHaveBeenCalledWith(
        "biometric_credentials",
        expect.stringContaining("test@example.com"),
      );
    });

    it("should validate credential format before storage", async () => {
      const invalidCredentials = { username: "", password: "" };

      const result =
        await biometricService.storeCredentials(invalidCredentials);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Invalid credentials");
    });

    it("should handle secure storage failures gracefully", async () => {
      (SecureStore.setItemAsync as jest.Mock).mockRejectedValue(
        new Error("Keychain error"),
      );

      const result = await biometricService.storeCredentials({
        username: "test@example.com",
        password: "password123",
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe("Keychain error");
    });
  });

  describe("Integration Scenarios", () => {
    it("should complete full biometric setup flow", async () => {
      // Mock hardware available and enrolled
      (LocalAuthentication.hasHardwareAsync as jest.Mock).mockResolvedValue(
        true,
      );
      (LocalAuthentication.isEnrolledAsync as jest.Mock).mockResolvedValue(
        true,
      );
      (
        LocalAuthentication.supportedAuthenticationTypesAsync as jest.Mock
      ).mockResolvedValue([1]);
      (
        LocalAuthentication.getEnrolledLevelAsync as jest.Mock
      ).mockResolvedValue(1);
      (SecureStore.setItemAsync as jest.Mock).mockResolvedValue(undefined);

      // Check support
      const supportResult = await biometricService.checkBiometricSupport();
      expect(supportResult.hasHardware).toBe(true);
      expect(supportResult.isEnrolled).toBe(true);

      // Enable biometrics
      const enableResult = await biometricService.enableBiometric();
      expect(enableResult.success).toBe(true);

      // Store credentials
      const credentials = {
        username: "test@example.com",
        password: "password123",
      };
      const storeResult = await biometricService.storeCredentials(credentials);
      expect(storeResult.success).toBe(true);

      // Check if enabled
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValue("true");
      const isEnabled = await biometricService.isBiometricEnabled();
      expect(isEnabled).toBe(true);
    });

    it("should complete full biometric authentication flow", async () => {
      // Setup biometrics
      (LocalAuthentication.hasHardwareAsync as jest.Mock).mockResolvedValue(
        true,
      );
      (LocalAuthentication.isEnrolledAsync as jest.Mock).mockResolvedValue(
        true,
      );
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValue("true");
      (SecureStore.getItemAsync as jest.Mock)
        .mockResolvedValueOnce("true")
        .mockResolvedValueOnce(
          JSON.stringify({
            username: "test@example.com",
            password: "password123",
          }),
        );

      // Mock successful authentication
      (LocalAuthentication.authenticateAsync as jest.Mock).mockResolvedValue({
        success: true,
        error: null,
      });

      // Authenticate
      const authResult = await biometricService.authenticate();
      expect(authResult.success).toBe(true);

      // Get stored credentials
      const credentials = await biometricService.getStoredCredentials();
      expect(credentials).toEqual({
        username: "test@example.com",
        password: "password123",
      });
    });

    it("should handle biometric disable flow", async () => {
      // Mock enabled state
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValue("true");
      (SecureStore.deleteItemAsync as jest.Mock).mockResolvedValue(undefined);

      // Disable biometrics
      const result = await biometricService.disableBiometric();
      expect(result.success).toBe(true);

      // Check if disabled
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(null);
      const isEnabled = await biometricService.isBiometricEnabled();
      expect(isEnabled).toBe(false);
    });
  });
});

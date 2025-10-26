/**
 * Biometric Authentication Service for PawfectMatch Mobile App
 * Handles biometric authentication (FaceID, TouchID, Fingerprint)
 */
import * as LocalAuthentication from "expo-local-authentication";
import * as SecureStore from "expo-secure-store";
import { logger } from "@pawfectmatch/core";

export interface BiometricAuthResult {
  success: boolean;
  error?: string;
  biometricType?: "fingerprint" | "facial" | "iris" | "unknown";
}

export interface BiometricCapabilities {
  hasHardware: boolean;
  isEnrolled: boolean;
  supportedTypes: LocalAuthentication.AuthenticationType[];
}

class BiometricService {
  private static readonly BIOMETRIC_ENABLED_KEY = "biometric_enabled";
  private static readonly BIOMETRIC_TYPE_KEY = "biometric_type";

  /**
   * Check if device supports biometric authentication
   */
  async checkBiometricSupport(): Promise<BiometricCapabilities> {
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      const supportedTypes =
        await LocalAuthentication.supportedAuthenticationTypesAsync();

      const capabilities: BiometricCapabilities = {
        hasHardware,
        isEnrolled,
        supportedTypes,
      };

      logger.info("Biometric capabilities checked", {
        hasHardware,
        isEnrolled,
        supportedTypes: supportedTypes.length,
      });

      return capabilities;
    } catch (error) {
      logger.error("Failed to check biometric support", { error });
      return {
        hasHardware: false,
        isEnrolled: false,
        supportedTypes: [],
      };
    }
  }

  /**
   * Authenticate using biometrics
   */
  async authenticate(reason?: string): Promise<BiometricAuthResult> {
    try {
      const capabilities = await this.checkBiometricSupport();

      if (!capabilities.hasHardware) {
        return {
          success: false,
          error: "Biometric authentication not supported on this device",
        };
      }

      if (!capabilities.isEnrolled) {
        return {
          success: false,
          error: "No biometric authentication methods enrolled",
        };
      }

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage:
          reason !== undefined && reason !== ""
            ? reason
            : "Authenticate to access PawfectMatch",
        fallbackLabel: "Use PIN",
        cancelLabel: "Cancel",
        disableDeviceFallback: false,
      });

      const biometricType = this.getBiometricType(capabilities.supportedTypes);

      if (result.success) {
        logger.info("Biometric authentication successful", { biometricType });
        return {
          success: true,
          biometricType,
        };
      } else {
        const error =
          result.error !== "" ? result.error : "Authentication failed";
        logger.warn("Biometric authentication failed", {
          error,
          biometricType,
        });
        return {
          success: false,
          error,
          biometricType,
        };
      }
    } catch (error) {
      logger.error("Biometric authentication error", { error });
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  }

  /**
   * Enable biometric authentication for the app
   */
  async enableBiometric(): Promise<boolean> {
    try {
      // First authenticate to verify biometrics work
      const authResult = await this.authenticate(
        "Enable biometric authentication",
      );

      if (!authResult.success) {
        return false;
      }

      // Store that biometric is enabled
      await SecureStore.setItemAsync(
        BiometricService.BIOMETRIC_ENABLED_KEY,
        "true",
      );
      await SecureStore.setItemAsync(
        BiometricService.BIOMETRIC_TYPE_KEY,
        authResult.biometricType !== undefined
          ? authResult.biometricType
          : "unknown",
      );

      logger.info("Biometric authentication enabled", {
        type: authResult.biometricType,
      });
      return true;
    } catch (error) {
      logger.error("Failed to enable biometric authentication", { error });
      return false;
    }
  }

  /**
   * Disable biometric authentication for the app
   */
  async disableBiometric(): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(BiometricService.BIOMETRIC_ENABLED_KEY);
      await SecureStore.deleteItemAsync(BiometricService.BIOMETRIC_TYPE_KEY);
      logger.info("Biometric authentication disabled");
    } catch (error) {
      logger.error("Failed to disable biometric authentication", { error });
    }
  }

  /**
   * Check if biometric authentication is enabled for the app
   */
  async isBiometricEnabled(): Promise<boolean> {
    try {
      const enabled = await SecureStore.getItemAsync(
        BiometricService.BIOMETRIC_ENABLED_KEY,
      );
      return enabled === "true";
    } catch (error) {
      logger.error("Failed to check biometric status", { error });
      return false;
    }
  }

  /**
   * Get the type of biometric authentication available
   */
  private getBiometricType(
    supportedTypes: LocalAuthentication.AuthenticationType[],
  ): "fingerprint" | "facial" | "iris" | "unknown" {
    if (
      supportedTypes.includes(
        LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION,
      )
    ) {
      return "facial";
    }
    if (
      supportedTypes.includes(
        LocalAuthentication.AuthenticationType.FINGERPRINT,
      )
    ) {
      return "fingerprint";
    }
    if (supportedTypes.includes(LocalAuthentication.AuthenticationType.IRIS)) {
      return "iris";
    }
    return "unknown";
  }

  /**
   * Get user-friendly biometric type name
   */
  getBiometricTypeName(type?: string): string {
    switch (type) {
      case "facial":
        return "Face ID";
      case "fingerprint":
        return "Touch ID";
      case "iris":
        return "Iris Scan";
      default:
        return "Biometric Authentication";
    }
  }

  /**
   * Encrypt sensitive data with biometric protection
   * Uses SecureStore with biometric authentication for production-grade encryption
   */
  async encryptWithBiometric(data: string, key: string): Promise<void> {
    try {
      // Authenticate first
      const authResult = await this.authenticate("Encrypt sensitive data");
      if (!authResult.success) {
        throw new Error("Biometric authentication required for encryption");
      }

      // Store securely in keychain with biometric protection
      await SecureStore.setItemAsync(key, data, {
        requireAuthentication: true,
        authenticationPrompt: "Authenticate to access encrypted data",
        showPrompt: true,
      });

      logger.info("Data encrypted securely with biometric authentication", {
        key,
        biometricType: authResult.biometricType,
      });
    } catch (error) {
      logger.error("Failed to encrypt data with biometric protection", { error });
      throw error;
    }
  }

  /**
   * Decrypt data protected by biometrics
   */
  async decryptWithBiometric(key: string): Promise<string | null> {
    try {
      // First authenticate
      const authResult = await this.authenticate("Decrypt sensitive data");
      if (!authResult.success) {
        throw new Error("Biometric authentication required");
      }

      // Retrieve from secure store (triggers biometric prompt)
      const decryptedData = await SecureStore.getItemAsync(key, {
        requireAuthentication: true,
        authenticationPrompt: "Authenticate to decrypt sensitive data",
        showPrompt: true,
      });

      logger.info("Data decrypted successfully with biometric authentication", {
        key,
        biometricType: authResult.biometricType,
      });

      return decryptedData;
    } catch (error) {
      logger.error("Failed to decrypt biometric data", { error });
      throw error;
    }
  }

  /**
   * Remove encrypted data from biometric-protected storage
   */
  async removeBiometricData(key: string): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(key);
      logger.info("Biometric-protected data removed", { key });
    } catch (error) {
      logger.error("Failed to remove biometric data", { error });
      throw error;
    }
  }
}

// Export singleton instance
export const biometricService = new BiometricService();
export default biometricService;

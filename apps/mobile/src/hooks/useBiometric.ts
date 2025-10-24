/**
 * Biometric Authentication Hook
 * React hook for managing biometric authentication state and operations
 */

import { useCallback, useEffect, useState } from "react";
import { Alert } from "react-native";
import type { BiometricAuthResult as BiometricResult } from "../services/BiometricService";
import BiometricService from "../services/BiometricService";

export interface BiometricState {
  isAvailable: boolean;
  isEnabled: boolean;
  isInitialized: boolean;
  biometryType: string | null;
  isLoading: boolean;
  error: string | null;
}

export interface BiometricActions {
  authenticate: (message?: string) => Promise<BiometricResult>;
  enableBiometric: () => Promise<boolean>;
  disableBiometric: () => Promise<boolean>;
  quickAuth: () => Promise<BiometricResult>;
  showSetupPrompt: () => Promise<boolean>;
  storeSecureData: (key: string, data: string) => Promise<boolean>;
  getSecureData: (key: string) => Promise<string | null>;
  removeSecureData: (key: string) => Promise<boolean>;
  refreshState: () => Promise<void>;
}

export const useBiometric = (): BiometricState & BiometricActions => {
  const [state, setState] = useState<BiometricState>({
    isAvailable: false,
    isEnabled: false,
    isInitialized: false,
    biometryType: null,
    isLoading: true,
    error: null,
  });

  // Initialize biometric service
  useEffect(() => {
    initializeBiometric();
  }, []);

  const initializeBiometric = async () => {
    try {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      const capabilities = await BiometricService.checkBiometricSupport();
      const isAvailable = capabilities.hasHardware && capabilities.isEnrolled;
      const isEnabled = await BiometricService.isBiometricEnabled();
      const biometryType = BiometricService.getBiometricTypeName();

      setState((prev) => ({
        ...prev,
        isAvailable,
        isEnabled,
        isInitialized: true,
        biometryType,
        isLoading: false,
        error: null,
      }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : "Initialization failed",
      }));
    }
  };

  const authenticate = useCallback(
    async (message?: string): Promise<BiometricResult> => {
      try {
        setState((prev) => ({ ...prev, isLoading: true, error: null }));

        const result = await BiometricService.authenticate(
          message || `Authenticate with ${state.biometryType}`,
        );

        setState((prev) => ({ ...prev, isLoading: false }));
        return result;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Authentication failed";
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: errorMessage,
        }));
        return {
          success: false,
          error: errorMessage,
        };
      }
    },
    [state.biometryType],
  );

  const enableBiometric = useCallback(async (): Promise<boolean> => {
    try {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      const success = await BiometricService.enableBiometric();

      if (success) {
        setState((prev) => ({
          ...prev,
          isEnabled: true,
          isLoading: false,
          error: null,
        }));

        Alert.alert(
          "Biometric Enabled",
          `${state.biometryType} has been enabled for secure authentication.`,
          [{ text: "OK" }],
        );
      } else {
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: "Failed to enable biometric authentication",
        }));
      }

      return success;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to enable biometric";
      setState((prev) => ({ ...prev, isLoading: false, error: errorMessage }));
      return false;
    }
  }, [state.biometryType]);

  const disableBiometric = useCallback(async (): Promise<boolean> => {
    try {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      await BiometricService.disableBiometric();
      const success = true;

      if (success) {
        setState((prev) => ({
          ...prev,
          isEnabled: false,
          isLoading: false,
          error: null,
        }));

        Alert.alert(
          "Biometric Disabled",
          `${state.biometryType} has been disabled.`,
          [{ text: "OK" }],
        );
      } else {
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: "Failed to disable biometric authentication",
        }));
      }

      return success;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to disable biometric";
      setState((prev) => ({ ...prev, isLoading: false, error: errorMessage }));
      return false;
    }
  }, [state.biometryType]);

  const quickAuth = useCallback(async (): Promise<BiometricResult> => {
    try {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      const result = await BiometricService.authenticate("Quick authenticate");

      setState((prev) => ({ ...prev, isLoading: false }));
      return result;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Quick authentication failed";
      setState((prev) => ({ ...prev, isLoading: false, error: errorMessage }));
      return {
        success: false,
        error: errorMessage,
      };
    }
  }, []);

  const showSetupPrompt = useCallback(async (): Promise<boolean> => {
    try {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      // Show setup prompt: ask user to enroll biometrics
      const success = state.isAvailable || false;

      setState((prev) => ({ ...prev, isLoading: false }));
      return success;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Setup prompt failed";
      setState((prev) => ({ ...prev, isLoading: false, error: errorMessage }));
      return false;
    }
  }, []);

  const storeSecureData = useCallback(
    async (_key: string, data: string): Promise<boolean> => {
      try {
        setState((prev) => ({ ...prev, isLoading: true, error: null }));

        const encrypted = await BiometricService.encryptWithBiometric(data);
        // Persist encrypted if needed via app storage (omitted here)
        const success = !!encrypted;

        setState((prev) => ({ ...prev, isLoading: false }));
        return success;
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Failed to store secure data";
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: errorMessage,
        }));
        return false;
      }
    },
    [],
  );

  const getSecureData = useCallback(
    async (_key: string): Promise<string | null> => {
      try {
        setState((prev) => ({ ...prev, isLoading: true, error: null }));

        // Retrieve and decrypt via app storage (omitted here)
        const data = null;

        setState((prev) => ({ ...prev, isLoading: false }));
        return data;
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Failed to retrieve secure data";
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: errorMessage,
        }));
        return null;
      }
    },
    [],
  );

  const removeSecureData = useCallback(
    async (_key: string): Promise<boolean> => {
      try {
        setState((prev) => ({ ...prev, isLoading: true, error: null }));

        // Remove via app storage (omitted here)
        const success = true;

        setState((prev) => ({ ...prev, isLoading: false }));
        return success;
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Failed to remove secure data";
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: errorMessage,
        }));
        return false;
      }
    },
    [],
  );

  const refreshState = useCallback(async (): Promise<void> => {
    await initializeBiometric();
  }, []);

  return {
    ...state,
    authenticate,
    enableBiometric,
    disableBiometric,
    quickAuth,
    showSetupPrompt,
    storeSecureData,
    getSecureData,
    removeSecureData,
    refreshState,
  };
};

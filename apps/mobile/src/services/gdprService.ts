/**
 * GDPR Compliance Service for PawfectMatch Mobile
 * Handles user data export and account deletion according to GDPR requirements
 */

import { logger } from "@pawfectmatch/core";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { api } from "./api";

const DELETION_TOKEN_KEY = "gdpr_deletion_token";
const DELETION_REQUEST_KEY = "gdpr_deletion_request";

export interface AccountDeletionStatus {
  success: boolean;
  status: "pending" | "processing" | "completed" | "not-found";
  requestedAt?: string;
  scheduledDeletionDate?: string;
  daysRemaining?: number;
  canCancel?: boolean;
  requestId?: string;
}

export interface DataExportOptions {
  format?: "json" | "csv";
  includeMessages?: boolean;
  includeMatches?: boolean;
  includeProfileData?: boolean;
  includePreferences?: boolean;
}

export interface DataExportResult {
  success: boolean;
  exportId: string;
  estimatedTime: string;
  message: string;
  exportData?: unknown;
}

class GDPRService {
  /**
   * Request account deletion with 30-day grace period
   * @param password User password for authentication
   * @param reason Optional reason for deletion
   * @param feedback Optional feedback about why leaving
   */
  async requestAccountDeletion(
    password: string,
    reason?: string,
    feedback?: string,
  ): Promise<{
    success: boolean;
    message: string;
    gracePeriodEndsAt: string;
    deletionId: string;
  }> {
    try {
      const response = await api.request<{
        success: boolean;
        message: string;
        gracePeriodEndsAt: string;
        deletionId: string;
      }>("/users/delete-account", {
        method: "DELETE",
        body: {
          password,
          reason,
          feedback,
        },
      });
      
      logger.info("Account deletion requested", {
        deletionId: response.deletionId,
      });

      // Store deletion token and request info in AsyncStorage
      try {
        await AsyncStorage.setItem(DELETION_TOKEN_KEY, response.deletionId);
        await AsyncStorage.setItem(
          DELETION_REQUEST_KEY,
          JSON.stringify({
            deletionId: response.deletionId,
            gracePeriodEndsAt: response.gracePeriodEndsAt,
            requestedAt: new Date().toISOString(),
          }),
        );
      } catch (storageError) {
        logger.error("Failed to store deletion token", { storageError });
      }
      
      return {
        success: response.success,
        message: response.message,
        gracePeriodEndsAt: response.gracePeriodEndsAt,
        deletionId: response.deletionId,
      };
    } catch (error) {
      logger.error("Failed to request account deletion", { error });
      throw error;
    }
  }

  /**
   * Cancel account deletion (within grace period)
   * @param token Cancellation token from deletion request
   */
  async cancelDeletion(token: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await api.request<{ success: boolean; message: string }>("/users/cancel-deletion", {
        method: "POST",
        body: { token },
      });
      logger.info("Account deletion cancelled", { token });
      return response;
    } catch (error) {
      logger.error("Failed to cancel account deletion", { error });
      throw error;
    }
  }

  /**
   * Confirm and complete account deletion
   * @param token Confirmation token
   */
  async confirmDeletion(token: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await api.request<{ success: boolean; message: string }>("/users/confirm-deletion", {
        method: "POST",
        body: { token },
      });
      logger.info("Account deletion confirmed", { token });
      return response;
    } catch (error) {
      logger.error("Failed to confirm account deletion", { error });
      throw error;
    }
  }


  /**
   * Get account deletion status
   */
  async getAccountDeletionStatus(): Promise<AccountDeletionStatus> {
    try {
      const response = await api.getAccountDeletionStatus();
      return response;
    } catch (error) {
      logger.error("Failed to get account deletion status", { error });
      throw error;
    }
  }

  /**
   * Export user data (GDPR Article 20 - Right to Data Portability)
   */
  async exportUserData(
    options: DataExportOptions = {},
  ): Promise<DataExportResult> {
    try {
      const response = await api.exportUserData(options);
      logger.info("User data export requested", {
        exportId: response.exportId,
        estimatedTime: response.estimatedTime,
      });
      return response;
    } catch (error) {
      logger.error("Failed to export user data", { error });
      throw error;
    }
  }

  /**
   * Export all user data (convenience method)
   */
  async exportAllUserData(format: "json" | "csv" = "json"): Promise<DataExportResult> {
    return this.exportUserData({
      format,
      includeMessages: true,
      includeMatches: true,
      includeProfileData: true,
      includePreferences: true,
    });
  }

  /**
   * Check if account deletion is pending
   */
  async isDeletionPending(): Promise<boolean> {
    try {
      const status = await this.getAccountDeletionStatus();
      return status.status === "pending";
    } catch {
      return false;
    }
  }

  /**
   * Get days remaining until deletion
   */
  async getDaysUntilDeletion(): Promise<number | null> {
    try {
      const status = await this.getAccountDeletionStatus();
      return status.daysRemaining ?? null;
    } catch {
      return null;
    }
  }

  /**
   * Get stored deletion token from AsyncStorage
   */
  async getStoredDeletionToken(): Promise<string | null> {
    try {
      const token = await AsyncStorage.getItem(DELETION_TOKEN_KEY);
      return token;
    } catch (error) {
      logger.error("Failed to get deletion token from storage", { error });
      return null;
    }
  }

  /**
   * Get stored deletion request info from AsyncStorage
   */
  async getStoredDeletionRequest(): Promise<{
    deletionId: string;
    gracePeriodEndsAt: string;
    requestedAt: string;
  } | null> {
    try {
      const requestStr = await AsyncStorage.getItem(DELETION_REQUEST_KEY);
      if (!requestStr) return null;
      return JSON.parse(requestStr);
    } catch (error) {
      logger.error("Failed to get deletion request from storage", { error });
      return null;
    }
  }

  /**
   * Clear stored deletion data from AsyncStorage
   */
  async clearStoredDeletionData(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([DELETION_TOKEN_KEY, DELETION_REQUEST_KEY]);
      logger.info("Deletion data cleared from storage");
    } catch (error) {
      logger.error("Failed to clear deletion data from storage", { error });
    }
  }
}

// Export singleton instance
export const gdprService = new GDPRService();
export default gdprService;


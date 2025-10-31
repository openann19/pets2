/**
 * 🛡️ GDPR Service
 * GDPR compliance methods matching mobile app structure
 * Articles 17 (Right to Erasure) and 20 (Right to Data Portability)
 */

import { apiInstance } from './api';

export interface DeleteAccountRequest {
  reason?: string;
  feedback?: string;
  confirmEmail?: string;
  twoFactorCode?: string;
}

export interface DeleteAccountResponse {
  success: boolean;
  message: string;
  requestId: string;
  scheduledDeletionDate: string;
  canCancel: boolean;
  gracePeriodDays?: number;
}

export interface CancelDeletionRequest {
  requestId?: string;
}

export interface CancelDeletionResponse {
  success: boolean;
  message: string;
}

export interface DeletionStatusResponse {
  success: boolean;
  status: 'pending' | 'processing' | 'completed' | 'not-found';
  requestedAt?: string;
  scheduledDeletionDate?: string;
  daysRemaining?: number;
  canCancel?: boolean;
  requestId?: string;
}

export interface DataExportOptions {
  format?: 'json' | 'csv';
  includeMessages?: boolean;
  includeMatches?: boolean;
  includeProfileData?: boolean;
  includePreferences?: boolean;
  includePhotos?: boolean;
  includeAnalytics?: boolean;
}

export interface DataExportResponse {
  success: boolean;
  exportId: string;
  estimatedTime: string;
  message: string;
  status?: 'processing' | 'ready' | 'failed';
  exportData?: unknown;
  downloadUrl?: string;
}

export interface GDPRError {
  code: string;
  message: string;
}

/**
 * GDPR Service matching mobile app structure
 */
export const gdprService = {
  /**
   * Request account deletion with grace period (Article 17)
   */
  requestAccountDeletion: async (
    data: DeleteAccountRequest,
  ): Promise<DeleteAccountResponse> => {
    try {
      const response = await apiInstance.request<DeleteAccountResponse>(
        '/account/delete',
        {
          method: 'POST',
          body: JSON.stringify({
            reason: data.reason,
            feedback: data.feedback,
            confirmEmail: data.confirmEmail,
            twoFactorCode: data.twoFactorCode,
          }),
        },
      );

      if (!response || !response.success || !response.data) {
        throw new Error(response?.error || response?.message || 'Failed to request account deletion');
      }

      return response.data;
    } catch (error) {
      const err = error as Error;
      throw new Error(err.message || 'Failed to request account deletion');
    }
  },

  /**
   * Cancel account deletion (within grace period)
   */
  cancelAccountDeletion: async (
    data?: CancelDeletionRequest,
  ): Promise<CancelDeletionResponse> => {
    try {
      const response = await apiInstance.request<CancelDeletionResponse>(
        '/account/cancel-deletion',
        {
          method: 'POST',
          body: JSON.stringify(data ?? {}),
        },
      );

      if (!response || !response.success || !response.data) {
        throw new Error(response?.error || response?.message || 'Failed to cancel account deletion');
      }

      return response.data;
    } catch (error) {
      const err = error as Error;
      throw new Error(err.message || 'Failed to cancel account deletion');
    }
  },

  /**
   * Get account deletion status
   */
  getAccountDeletionStatus: async (): Promise<DeletionStatusResponse> => {
    try {
      const response = await apiInstance.request<DeletionStatusResponse>('/account/status', {
        method: 'GET',
      });

      if (!response || !response.success || !response.data) {
        throw new Error(response?.error || 'Failed to get account status');
      }

      return response.data;
    } catch (error) {
      const err = error as Error;
      throw new Error(err.message || 'Failed to get account status');
    }
  },

  /**
   * Export user data (Article 20)
   */
  exportUserData: async (options: DataExportOptions = {}): Promise<DataExportResponse> => {
    try {
      const response = await apiInstance.request<DataExportResponse>(
        '/account/export-data',
        {
          method: 'POST',
          body: JSON.stringify({
            format: options.format || 'json',
            includeMessages: options.includeMessages ?? false,
            includeMatches: options.includeMatches ?? false,
            includeProfileData: options.includeProfileData ?? true,
            includePreferences: options.includePreferences ?? false,
            includePhotos: options.includePhotos ?? false,
            includeAnalytics: options.includeAnalytics ?? false,
          }),
        },
      );

      if (!response || !response.success || !response.data) {
        throw new Error(response?.error || response?.message || 'Failed to export user data');
      }

      return response.data;
    } catch (error) {
      const err = error as Error;
      throw new Error(err.message || 'Failed to export user data');
    }
  },
};

export default gdprService;


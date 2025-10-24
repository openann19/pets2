/**
 * Account Management Service
 * GDPR-compliant account operations
 */

import type {
  AccountDeletionRequest,
  AccountDeletionResponse,
  AccountReactivationRequest,
  AccountDeactivationRequest,
  AccountDeactivationResponse,
  DataExportRequest,
  DataExportResponse,
  DataExportStatus,
} from '../types/account';

interface ApiError {
  message?: string;
}

export class AccountService {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  /**
   * Request account deletion with 30-day grace period (GDPR Article 17)
   */
  async requestAccountDeletion(
    request: AccountDeletionRequest,
    token: string,
  ): Promise<AccountDeletionResponse> {
    const response = await fetch(`${this.baseUrl}/api/account/delete`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const error: ApiError = await response.json() as ApiError;
      throw new Error(error.message ?? 'Failed to request account deletion');
    }

    return await response.json() as AccountDeletionResponse;
  }

  /**
   * Cancel pending account deletion (within grace period)
   */
  async cancelAccountDeletion(
    request: AccountReactivationRequest,
    token: string,
  ): Promise<{ success: boolean; message: string }> {
    const response = await fetch(`${this.baseUrl}/api/account/cancel-deletion`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const error: ApiError = await response.json() as ApiError;
      throw new Error(error.message ?? 'Failed to cancel account deletion');
    }

    return await response.json() as { success: boolean; message: string };
  }

  /**
   * Deactivate account (temporary suspension)
   */
  async deactivateAccount(
    request: AccountDeactivationRequest,
    token: string,
  ): Promise<AccountDeactivationResponse> {
    const response = await fetch(`${this.baseUrl}/api/account/deactivate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const error: ApiError = await response.json() as ApiError;
      throw new Error(error.message ?? 'Failed to deactivate account');
    }

    return await response.json() as AccountDeactivationResponse;
  }

  /**
   * Reactivate deactivated account
   */
  async reactivateAccount(
    token: string,
  ): Promise<{ success: boolean; message: string }> {
    const response = await fetch(`${this.baseUrl}/api/account/reactivate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error: ApiError = await response.json() as ApiError;
      throw new Error(error.message ?? 'Failed to reactivate account');
    }

    return await response.json() as { success: boolean; message: string };
  }

  /**
   * Request data export (GDPR Article 20)
   */
  async requestDataExport(
    request: DataExportRequest,
    token: string,
  ): Promise<DataExportResponse> {
    const response = await fetch(`${this.baseUrl}/api/account/export-data`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const error: ApiError = await response.json() as ApiError;
      throw new Error(error.message ?? 'Failed to request data export');
    }

    return await response.json() as DataExportResponse;
  }

  /**
   * Check data export status
   */
  async getDataExportStatus(
    exportId: string,
    token: string,
  ): Promise<DataExportStatus> {
    const response = await fetch(
      `${this.baseUrl}/api/account/export-data/${exportId}/status`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      },
    );

    if (!response.ok) {
      const error: ApiError = await response.json() as ApiError;
      throw new Error(error.message ?? 'Failed to get export status');
    }

    return await response.json() as DataExportStatus;
  }

  /**
   * Download data export
   */
  async downloadDataExport(
    exportId: string,
    token: string,
  ): Promise<Blob> {
    const response = await fetch(
      `${this.baseUrl}/api/account/export-data/${exportId}/download`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      },
    );

    if (!response.ok) {
      const error: ApiError = await response.json() as ApiError;
      throw new Error(error.message ?? 'Failed to download data export');
    }

    return await response.blob();
  }
}

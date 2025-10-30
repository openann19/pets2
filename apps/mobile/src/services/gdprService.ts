/**
 * GDPR Service
 * Handles GDPR compliance operations: account deletion, data export, grace period management
 */

import { request } from './api';
import { logger } from '@pawfectmatch/core';
import {
  DeleteAccountRequestSchema,
  DeleteAccountResponseSchema,
  AccountStatusResponseSchema,
  DataExportRequestSchema,
  DataExportResponseSchema,
  ConfirmDeletionRequestSchema,
  ConfirmDeletionResponseSchema,
  parseResponse,
} from '../schemas/api';

export interface GDPRError {
  code: 'INVALID_PASSWORD' | 'ALREADY_DELETING' | 'RATE_LIMIT' | 'SERVER_ERROR';
  message: string;
}

export interface DeleteAccountRequest {
  password: string;
  reason?: string;
  feedback?: string;
}

export interface DeleteAccountResponse {
  success: boolean;
  message: string;
  deletionId?: string;
  gracePeriodEndsAt?: string;
  canCancel?: boolean;
  error?: string;
}

export interface AccountStatusResponse {
  success: boolean;
  status: 'not-found' | 'pending' | 'processing' | 'completed';
  scheduledDeletionDate?: string;
  daysRemaining?: number;
  canCancel?: boolean;
  requestId?: string;
}

export interface DataExportRequest {
  format?: 'json' | 'csv';
  includeMessages?: boolean;
  includeMatches?: boolean;
  includeProfileData?: boolean;
  includePreferences?: boolean;
}

export interface DataExportResponse {
  success: boolean;
  exportId?: string;
  url?: string;
  estimatedTime?: string;
  estimatedCompletion?: string;
  message?: string;
  format?: string;
  expiresAt?: string;
  exportData?: {
    profile?: unknown;
    pets?: unknown[];
    matches?: unknown[];
    messages?: unknown[];
    preferences?: unknown;
  };
  error?: string;
}

/**
 * Delete user account
 * GDPR Article 17 - Right to Erasure
 */
export const deleteAccount = async (data: DeleteAccountRequest): Promise<DeleteAccountResponse> => {
  try {
    // Validate input with Zod
    const validatedInput = DeleteAccountRequestSchema.parse(data);

    const response = await request<DeleteAccountResponse>('/api/users/delete-account', {
      method: 'DELETE',
      body: {
        password: validatedInput.password,
        reason: validatedInput.reason,
        feedback: validatedInput.feedback,
      },
    });

    // Validate response with Zod
    const parsed = parseResponse(DeleteAccountResponseSchema, response);
    if (!parsed.success) {
      logger.error('Invalid delete account response:', parsed.error);
      return {
        success: false,
        message: 'Invalid response from server',
        error: 'SERVER_ERROR',
      };
    }

    return parsed.data;
  } catch (error: unknown) {
    logger.error(
      'Delete account error:',
      error instanceof Error ? error : new Error(String(error)),
    );

    // Extract error code if available
    const errorObj = error as { code?: string; message?: string };
    const errorCode = errorObj?.code || 'SERVER_ERROR';
    const errorMessage = errorObj?.message || 'Failed to delete account';

    return {
      success: false,
      message: errorMessage,
      error: errorCode,
    };
  }
};

/**
 * Cancel account deletion within grace period
 */
export const cancelDeletion = async (): Promise<{
  success: boolean;
  message?: string;
}> => {
  try {
    const response = await request<{ success: boolean; message?: string }>(
      '/api/users/cancel-deletion',
      { method: 'POST' },
    );

    return response;
  } catch (error: unknown) {
    const errorInstance = error instanceof Error ? error : new Error(String(error));
    logger.error('Cancel deletion error:', errorInstance);

    const errorMessage = error instanceof Error ? error.message : 'Failed to cancel deletion';

    return {
      success: false,
      message: errorMessage,
    };
  }
};

/**
 * Get account deletion status
 */
export const getAccountStatus = async (): Promise<AccountStatusResponse> => {
  try {
    const response = await request<AccountStatusResponse>('/api/account/status', { method: 'GET' });

    // Validate response with Zod
    const parsed = parseResponse(AccountStatusResponseSchema, response);
    if (!parsed.success) {
      logger.error('Invalid account status response:', parsed.error);
      return {
        success: false,
        status: 'not-found',
      };
    }

    return parsed.data;
  } catch (error: unknown) {
    logger.error(
      'Get account status error:',
      error instanceof Error ? error : new Error(String(error)),
    );

    return {
      success: false,
      status: 'not-found',
    };
  }
};

/**
 * Export user data
 * GDPR Article 20 - Right to Data Portability
 */
export const exportUserData = async (
  dataRequest: DataExportRequest = {},
): Promise<DataExportResponse> => {
  try {
    // Validate input with Zod
    const validatedInput = DataExportRequestSchema.parse(dataRequest);

    const response = await request<DataExportResponse>('/api/users/request-export', {
      method: 'POST',
      body: {
        format: validatedInput.format || 'json',
        includeMessages: validatedInput.includeMessages !== false,
        includeMatches: validatedInput.includeMatches !== false,
        includeProfileData: validatedInput.includeProfileData !== false,
        includePreferences: validatedInput.includePreferences !== false,
      },
    });

    // Validate response with Zod
    const parsed = parseResponse(DataExportResponseSchema, response);
    if (!parsed.success) {
      logger.error('Invalid export data response:', parsed.error);
      return {
        success: false,
        message: 'Invalid response from server',
        error: 'SERVER_ERROR',
      };
    }

    return parsed.data;
  } catch (error: unknown) {
    logger.error(
      'Export user data error:',
      error instanceof Error ? error : new Error(String(error)),
    );

    return {
      success: false,
      message: 'Failed to export data',
      error: 'SERVER_ERROR',
    };
  }
};

/**
 * Download exported data
 */
export const downloadExport = async (exportId: string): Promise<Blob> => {
  try {
    // First get the export URL from the status
    const exportStatus = await request<{ url: string }>(
      `/api/users/export-data?exportId=${exportId}`,
      {
        method: 'GET',
      },
    );

    // Download the actual file from the URL
    const response = await fetch(exportStatus.url);
    if (!response.ok) {
      throw new Error('Failed to download export');
    }

    return await response.blob();
  } catch (error: unknown) {
    logger.error(
      'Download export error:',
      error instanceof Error ? error : new Error(String(error)),
    );
    throw error instanceof Error ? error : new Error(String(error));
  }
};

/**
 * Confirm account deletion after grace period
 * Finalizes the deletion process
 */
export const confirmDeletion = async (token: string): Promise<{
  success: boolean;
  deletedAt?: string;
  message?: string;
}> => {
  try {
    // Validate input with Zod
    const validatedInput = ConfirmDeletionRequestSchema.parse({ token });

    const response = await request<{
      success: boolean;
      deletedAt?: string;
      message?: string;
    }>(
      '/api/users/confirm-deletion',
      {
        method: 'POST',
        body: { token: validatedInput.token },
      },
    );

    // Validate response with Zod
    const parsed = parseResponse(ConfirmDeletionResponseSchema, response);
    if (!parsed.success) {
      logger.error('Invalid confirm deletion response:', parsed.error);
      return {
        success: false,
        message: 'Invalid response from server',
      };
    }

    return parsed.data;
  } catch (error: unknown) {
    const errorInstance = error instanceof Error ? error : new Error(String(error));
    logger.error('Confirm deletion error:', errorInstance);

    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to confirm deletion',
    };
  }
};

/**
 * GDPR Service Test Suite
 * Tests account deletion, data export, and grace period management
 */

import {
  deleteAccount,
  cancelDeletion,
  getAccountStatus,
  exportUserData,
  downloadExport,
} from '../gdprService';
import { request } from '../api';

// Mock the api service
jest.mock('../api', () => ({
  request: jest.fn(),
}));

// Mock logger
jest.mock('@pawfectmatch/core', () => ({
  logger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

describe('GDPR Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('deleteAccount', () => {
    it('should request account deletion successfully', async () => {
      const mockResponse = {
        success: true,
        message: 'Account deletion requested',
        deletionId: 'del-123',
        gracePeriodEndsAt: '2024-02-01T00:00:00Z',
        canCancel: true,
      };

      (request as jest.Mock).mockResolvedValueOnce(mockResponse);

      const response = await deleteAccount({
        password: 'correctpassword',
        reason: 'User request',
        feedback: 'Good app',
      });

      expect(response).toEqual(mockResponse);
      expect(request).toHaveBeenCalledWith('/api/users/delete-account', {
        method: 'DELETE',
        body: {
          password: 'correctpassword',
          reason: 'User request',
          feedback: 'Good app',
        },
      });
    });

    it('should handle invalid password error', async () => {
      (request as jest.Mock).mockRejectedValueOnce({
        message: 'Invalid password',
        code: 'INVALID_PASSWORD',
      });

      const response = await deleteAccount({
        password: 'wrongpassword',
      });

      expect(response.success).toBe(false);
      expect(response.error).toBe('INVALID_PASSWORD');
    });

    it('should handle server errors', async () => {
      (request as jest.Mock).mockRejectedValueOnce(new Error('Server error'));

      const response = await deleteAccount({
        password: 'correctpassword',
      });

      expect(response.success).toBe(false);
      expect(response.message).toBe('Server error');
    });

    it('should handle rate limiting', async () => {
      (request as jest.Mock).mockRejectedValueOnce({
        message: 'Too many requests',
        code: 'RATE_LIMIT',
      });

      const response = await deleteAccount({
        password: 'correctpassword',
      });

      expect(response.success).toBe(false);
      expect(response.error).toBe('RATE_LIMIT');
    });

    it('should handle already deleting account', async () => {
      (request as jest.Mock).mockRejectedValueOnce({
        message: 'Deletion already in progress',
        code: 'ALREADY_DELETING',
      });

      const response = await deleteAccount({
        password: 'correctpassword',
      });

      expect(response.success).toBe(false);
      expect(response.error).toBe('ALREADY_DELETING');
    });
  });

  describe('cancelDeletion', () => {
    it('should cancel account deletion successfully', async () => {
      const mockResponse = {
        success: true,
        message: 'Account deletion cancelled',
      };

      (request as jest.Mock).mockResolvedValueOnce(mockResponse);

      const response = await cancelDeletion();

      expect(response).toEqual(mockResponse);
      expect(request).toHaveBeenCalledWith('/api/users/cancel-deletion', {
        method: 'POST',
      });
    });

    it('should handle cancellation errors', async () => {
      (request as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      const response = await cancelDeletion();

      expect(response.success).toBe(false);
      expect(response.message).toBe('Network error');
    });

    it('should handle errors during cancellation', async () => {
      (request as jest.Mock).mockRejectedValueOnce({
        message: 'Cancellation failed',
      });

      const response = await cancelDeletion();

      expect(response.success).toBe(false);
      expect(response.message).toBe('Cancellation failed');
    });
  });

  describe('getAccountStatus', () => {
    it('should get account status successfully', async () => {
      const mockResponse = {
        success: true,
        status: 'pending',
        scheduledDeletionDate: '2024-02-01T00:00:00Z',
        daysRemaining: 14,
        canCancel: true,
        requestId: 'del-123',
      };

      (request as jest.Mock).mockResolvedValueOnce(mockResponse);

      const response = await getAccountStatus();

      expect(response).toEqual(mockResponse);
      expect(request).toHaveBeenCalledWith('/api/account/status', {
        method: 'GET',
      });
    });

    it('should return not-found when no deletion request exists', async () => {
      const mockResponse = {
        success: true,
        status: 'not-found',
      };

      (request as jest.Mock).mockResolvedValueOnce(mockResponse);

      const response = await getAccountStatus();

      expect(response.status).toBe('not-found');
    });

    it('should handle errors when getting status', async () => {
      (request as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      const response = await getAccountStatus();

      expect(response.success).toBe(false);
      expect(response.status).toBe('not-found');
    });

    it('should handle processing status', async () => {
      const mockResponse = {
        success: true,
        status: 'processing',
        requestId: 'del-123',
      };

      (request as jest.Mock).mockResolvedValueOnce(mockResponse);

      const response = await getAccountStatus();

      expect(response.status).toBe('processing');
    });

    it('should handle completed deletion status', async () => {
      const mockResponse = {
        success: true,
        status: 'completed',
        requestId: 'del-123',
      };

      (request as jest.Mock).mockResolvedValueOnce(mockResponse);

      const response = await getAccountStatus();

      expect(response.status).toBe('completed');
    });
  });

  describe('exportUserData', () => {
    it('should export user data with defaults', async () => {
      const mockResponse = {
        success: true,
        exportId: 'export-123',
        estimatedTime: '5 minutes',
        message: 'Export started',
        exportData: {
          profile: { name: 'Test User', email: 'test@example.com' },
          matches: [{ id: '1' }],
        },
      };

      (request as jest.Mock).mockResolvedValueOnce(mockResponse);

      const response = await exportUserData();

      expect(response).toEqual(mockResponse);
      expect(request).toHaveBeenCalledWith('/api/users/request-export', {
        method: 'POST',
        body: {
          format: 'json',
          includeMessages: true,
          includeMatches: true,
          includeProfileData: true,
          includePreferences: true,
        },
      });
    });

    it('should export specific data types only', async () => {
      const mockResponse = {
        success: true,
        exportId: 'export-123',
        estimatedTime: '2 minutes',
        message: 'Export started',
        exportData: {
          profile: { name: 'Test User' },
        },
      };

      (request as jest.Mock).mockResolvedValueOnce(mockResponse);

      const response = await exportUserData({
        format: 'csv',
        includeMessages: false,
        includeMatches: false,
        includeProfileData: true,
        includePreferences: false,
      });

      expect(response).toEqual(mockResponse);
      expect(request).toHaveBeenCalledWith('/api/users/request-export', {
        method: 'POST',
        body: {
          format: 'csv',
          includeMessages: false,
          includeMatches: false,
          includeProfileData: true,
          includePreferences: false,
        },
      });
    });

    it('should handle export errors', async () => {
      (request as jest.Mock).mockRejectedValueOnce(new Error('Export failed'));

      const response = await exportUserData();

      expect(response.success).toBe(false);
      expect(response.message).toBe('Failed to export data');
      expect(response.error).toBe('SERVER_ERROR');
    });

    it('should handle large exports', async () => {
      const mockResponse = {
        success: true,
        exportId: 'export-123',
        estimatedTime: '30 minutes',
        message: 'Large export started',
      };

      (request as jest.Mock).mockResolvedValueOnce(mockResponse);

      const response = await exportUserData({
        includeMessages: true,
        includeMatches: true,
        includeProfileData: true,
        includePreferences: true,
      });

      expect(response.estimatedTime).toBe('30 minutes');
    });
  });

  describe('downloadExport', () => {
    it('should download exported data successfully', async () => {
      const mockExportStatus = { url: 'https://example.com/export/export-123.json' };
      const mockBlob = new Blob(['exported data'], { type: 'application/json' });

      // Mock the status request
      (request as jest.Mock).mockResolvedValueOnce(mockExportStatus);

      // Mock fetch for the actual download
      global.fetch = jest.fn().mockResolvedValueOnce({
        ok: true,
        blob: () => Promise.resolve(mockBlob),
      });

      const response = await downloadExport('export-123');

      expect(response).toBe(mockBlob);
      expect(request).toHaveBeenCalledWith('/api/users/export-data?exportId=export-123', {
        method: 'GET',
      });
    });

    it('should handle download errors', async () => {
      (request as jest.Mock).mockRejectedValueOnce(new Error('Download failed'));

      await expect(downloadExport('export-123')).rejects.toThrow('Download failed');
    });

    it('should handle missing export ID', async () => {
      (request as jest.Mock).mockRejectedValueOnce(new Error('Export not found'));

      await expect(downloadExport('invalid-export-id')).rejects.toThrow('Export not found');
    });
  });

  describe('Edge Cases', () => {
    it('should handle network timeouts during deletion', async () => {
      const timeoutError = new Error('Request timeout');
      (request as jest.Mock).mockRejectedValueOnce(timeoutError);

      const response = await deleteAccount({
        password: 'correctpassword',
      });

      expect(response.success).toBe(false);
    });

    it('should handle malformed responses', async () => {
      const mockResponse = {
        success: true,
        message: null,
        deletionId: null,
      };

      (request as jest.Mock).mockResolvedValueOnce(mockResponse);

      const response = await deleteAccount({
        password: 'correctpassword',
      });

      expect(response.success).toBe(true);
    });

    it('should handle concurrent deletion requests', async () => {
      const mockResponse = {
        success: true,
        message: 'Account deletion requested',
      };

      (request as jest.Mock).mockResolvedValue(mockResponse);

      const responses = await Promise.all([
        deleteAccount({ password: 'password' }),
        deleteAccount({ password: 'password' }),
        deleteAccount({ password: 'password' }),
      ]);

      expect(responses).toHaveLength(3);
      expect(responses[0]?.success).toBe(true);
    });

    it('should handle export with no data', async () => {
      const mockResponse = {
        success: true,
        exportId: 'export-123',
        estimatedTime: '1 minute',
        message: 'Export completed',
        exportData: {},
      };

      (request as jest.Mock).mockResolvedValueOnce(mockResponse);

      const response = await exportUserData({
        includeMessages: false,
        includeMatches: false,
        includeProfileData: false,
        includePreferences: false,
      });

      expect(response.exportData).toEqual({});
    });
  });
});

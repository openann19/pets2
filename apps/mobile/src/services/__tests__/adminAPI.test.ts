/**
 * Comprehensive tests for AdminAPIService
 *
 * Coverage:
 * - User management (CRUD operations, status changes, bulk actions)
 * - Chat moderation (blocking, message deletion, chat details)
 * - Upload moderation (approval, rejection, safety moderation)
 * - Verification management (approval, rejection, details)
 * - Analytics and system health monitoring
 * - Security monitoring and alerts
 * - Billing and subscription management
 * - Safety moderation with AI analysis
 * - Error handling and edge cases
 * - Pagination and filtering
 */

import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import { AdminAPIService } from '../adminAPI';

// Mock fetch globally
const mockFetch = jest.fn();
global.fetch = mockFetch;

// Mock logger
jest.mock('@pawfectmatch/core', () => ({
  logger: {
    error: jest.fn(),
  },
}));

describe('AdminAPIService', () => {
  let adminAPI: AdminAPIService;

  beforeEach(() => {
    jest.clearAllMocks();
    adminAPI = new AdminAPIService();

    // Setup default fetch mock
    mockFetch.mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({
        success: true,
        data: {},
      }),
    } as any);
  });

  describe('Core Request Method', () => {
    it('should make successful API requests', async () => {
      const mockResponse = { success: true, data: { test: 'data' } };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue(mockResponse),
      });

      const result = await adminAPI['request']('/test-endpoint');

      expect(mockFetch).toHaveBeenCalledWith('http://localhost:3001/api/test-endpoint', {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      expect(result).toEqual(mockResponse);
    });

    it('should handle custom headers and options', async () => {
      const customHeaders = { 'X-API-Key': 'test-key' };
      const options = {
        method: 'POST',
        headers: customHeaders,
        body: JSON.stringify({ test: 'data' }),
      };

      await adminAPI['request']('/test-endpoint', options);

      expect(mockFetch).toHaveBeenCalledWith('http://localhost:3001/api/test-endpoint', {
        headers: {
          'Content-Type': 'application/json',
          ...customHeaders,
        },
        method: 'POST',
        body: JSON.stringify({ test: 'data' }),
      });
    });

    it('should handle HTTP errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      });

      await expect(adminAPI['request']('/not-found')).rejects.toThrow('HTTP error! status: 404');
    });

    it('should handle network errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(adminAPI['request']('/network-error')).rejects.toThrow('Network error');
    });
  });

  describe('User Management', () => {
    const mockUsersResponse = {
      success: true,
      data: {
        users: [
          {
            _id: 'user1',
            firstName: 'John',
            lastName: 'Doe',
            email: 'john@example.com',
            role: 'user',
            status: 'active',
            isVerified: true,
            createdAt: '2024-01-01T00:00:00Z',
            pets: [{ _id: 'pet1', name: 'Buddy', species: 'dog' }],
          },
        ],
        pagination: {
          page: 1,
          limit: 20,
          total: 1,
          pages: 1,
        },
      },
    };

    it('should get users with pagination', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue(mockUsersResponse),
      });

      const result = await adminAPI.getUsers({ page: 1, limit: 20 });

      expect(result).toEqual(mockUsersResponse);
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/admin/users?page=1&limit=20',
        expect.any(Object),
      );
    });

    it('should get users with filters', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue(mockUsersResponse),
      });

      await adminAPI.getUsers({
        search: 'john',
        status: 'active',
        role: 'user',
        verified: 'true',
      });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('search=john&status=active&role=user&verified=true'),
        expect.any(Object),
      );
    });

    it('should get user details', async () => {
      const mockUserDetails = {
        success: true,
        data: {
          user: mockUsersResponse.data.users[0],
          stats: {
            petCount: 1,
            matchCount: 5,
            messageCount: 25,
          },
        },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue(mockUserDetails),
      });

      const result = await adminAPI.getUserDetails('user1');

      expect(result).toEqual(mockUserDetails);
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/admin/users/user1',
        expect.any(Object),
      );
    });

    it('should suspend user', async () => {
      const mockResponse = {
        success: true,
        data: { message: 'User suspended successfully' },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue(mockResponse),
      });

      const result = await adminAPI.suspendUser('user1', 'Violation of terms', 7);

      expect(result).toEqual(mockResponse);
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/admin/users/user1/suspend',
        expect.objectContaining({
          method: 'PUT',
          body: JSON.stringify({ reason: 'Violation of terms', duration: 7 }),
        }),
      );
    });

    it('should ban user', async () => {
      const mockResponse = {
        success: true,
        data: { message: 'User banned successfully' },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue(mockResponse),
      });

      const result = await adminAPI.banUser('user1', 'Severe violation');

      expect(result).toEqual(mockResponse);
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/admin/users/user1/ban',
        expect.objectContaining({
          method: 'PUT',
          body: JSON.stringify({ reason: 'Severe violation' }),
        }),
      );
    });

    it('should activate user', async () => {
      const mockResponse = {
        success: true,
        data: { message: 'User activated successfully' },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue(mockResponse),
      });

      const result = await adminAPI.activateUser('user1', 'Appeal approved');

      expect(result).toEqual(mockResponse);
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/admin/users/user1/activate',
        expect.objectContaining({
          method: 'PUT',
          body: JSON.stringify({ reason: 'Appeal approved' }),
        }),
      );
    });

    it('should perform bulk user actions', async () => {
      const mockBulkResponse = {
        success: true,
        data: {
          total: 3,
          successful: 2,
          failed: 1,
          results: [
            { userId: 'user1', success: true },
            { userId: 'user2', success: true },
            { userId: 'user3', success: false, error: 'User not found' },
          ],
        },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue(mockBulkResponse),
      });

      const result = await adminAPI.bulkUserAction({
        userIds: ['user1', 'user2', 'user3'],
        action: 'suspend',
        reason: 'Bulk moderation',
      });

      expect(result).toEqual(mockBulkResponse);
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/admin/users/bulk-action',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            userIds: ['user1', 'user2', 'user3'],
            action: 'suspend',
            reason: 'Bulk moderation',
          }),
        }),
      );
    });
  });

  describe('Chat Management', () => {
    const mockChatsResponse = {
      success: true,
      data: {
        chats: [
          {
            _id: 'chat1',
            user1: { _id: 'user1', firstName: 'John', lastName: 'Doe', email: 'john@example.com' },
            user2: {
              _id: 'user2',
              firstName: 'Jane',
              lastName: 'Smith',
              email: 'jane@example.com',
            },
            pet1: { _id: 'pet1', name: 'Buddy', species: 'dog' },
            pet2: { _id: 'pet2', name: 'Luna', species: 'cat' },
            status: 'active',
            isBlocked: false,
            createdAt: '2024-01-01T00:00:00Z',
            messageCount: 15,
          },
        ],
        pagination: {
          page: 1,
          limit: 20,
          total: 1,
          pages: 1,
        },
      },
    };

    it('should get chats with pagination and filters', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue(mockChatsResponse),
      });

      const result = await adminAPI.getChats({ page: 1, limit: 20, status: 'active' });

      expect(result).toEqual(mockChatsResponse);
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/admin/chats?page=1&limit=20&status=active',
        expect.any(Object),
      );
    });

    it('should get chat details with messages', async () => {
      const mockChatDetails = {
        success: true,
        data: {
          chat: mockChatsResponse.data.chats[0],
          messages: [
            {
              _id: 'msg1',
              sender: { _id: 'user1', firstName: 'John', lastName: 'Doe' },
              content: 'Hello!',
              type: 'text',
              createdAt: '2024-01-01T00:00:00Z',
              isDeleted: false,
            },
          ],
        },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue(mockChatDetails),
      });

      const result = await adminAPI.getChatDetails('chat1');

      expect(result).toEqual(mockChatDetails);
    });

    it('should block chat', async () => {
      const mockResponse = {
        success: true,
        data: { message: 'Chat blocked successfully' },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue(mockResponse),
      });

      const result = await adminAPI.blockChat('chat1', 'Inappropriate content', 7);

      expect(result).toEqual(mockResponse);
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/admin/chats/chat1/block',
        expect.objectContaining({
          method: 'PUT',
          body: JSON.stringify({ reason: 'Inappropriate content', duration: 7 }),
        }),
      );
    });

    it('should unblock chat', async () => {
      const mockResponse = {
        success: true,
        data: { message: 'Chat unblocked successfully' },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue(mockResponse),
      });

      const result = await adminAPI.unblockChat('chat1', 'Appeal approved');

      expect(result).toEqual(mockResponse);
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/admin/chats/chat1/unblock',
        expect.objectContaining({
          method: 'PUT',
          body: JSON.stringify({ reason: 'Appeal approved' }),
        }),
      );
    });

    it('should delete message', async () => {
      const mockResponse = {
        success: true,
        data: { message: 'Message deleted successfully' },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue(mockResponse),
      });

      const result = await adminAPI.deleteMessage('chat1', 'msg1', 'Violation of terms');

      expect(result).toEqual(mockResponse);
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/admin/chats/chat1/messages/msg1',
        expect.objectContaining({
          method: 'DELETE',
          body: JSON.stringify({ reason: 'Violation of terms' }),
        }),
      );
    });

    it('should get chat messages with moderation filters', async () => {
      const mockMessagesResponse = {
        success: true,
        data: {
          messages: [
            {
              id: 'msg1',
              chatId: 'chat1',
              senderId: 'user1',
              senderName: 'John Doe',
              receiverId: 'user2',
              receiverName: 'Jane Smith',
              message: 'Hello there!',
              timestamp: '2024-01-01T00:00:00Z',
              flagged: false,
              reviewed: true,
            },
          ],
          pagination: {
            page: 1,
            limit: 20,
            total: 1,
            pages: 1,
          },
        },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue(mockMessagesResponse),
      });

      const result = await adminAPI.getChatMessages({
        filter: 'flagged',
        search: 'inappropriate',
        page: 1,
        limit: 20,
      });

      expect(result).toEqual(mockMessagesResponse);
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/admin/chats/messages?filter=flagged&search=inappropriate&page=1&limit=20',
        expect.any(Object),
      );
    });

    it('should moderate message', async () => {
      const mockResponse = {
        success: true,
        data: {
          success: true,
          message: 'Message approved',
          moderatedMessage: {
            id: 'msg1',
            action: 'approved',
            moderatedAt: '2024-01-01T00:00:00Z',
            moderatedBy: 'admin1',
          },
        },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue(mockResponse),
      });

      const result = await adminAPI.moderateMessage({
        messageId: 'msg1',
        action: 'approve',
      });

      expect(result).toEqual(mockResponse);
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/admin/chats/messages/msg1/moderate',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ action: 'approve' }),
        }),
      );
    });
  });

  describe('Upload Management', () => {
    const mockUploadsResponse = {
      success: true,
      data: {
        uploads: [
          {
            _id: 'upload1',
            userId: { _id: 'user1', firstName: 'John', lastName: 'Doe', email: 'john@example.com' },
            type: 'profile_photo',
            originalName: 'profile.jpg',
            url: 'https://cdn.example.com/profile.jpg',
            mimeType: 'image/jpeg',
            size: 1024000,
            status: 'pending',
            uploadedAt: '2024-01-01T00:00:00Z',
          },
        ],
        pagination: {
          page: 1,
          limit: 20,
          total: 1,
          pages: 1,
        },
      },
    };

    it('should get uploads with filters', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue(mockUploadsResponse),
      });

      const result = await adminAPI.getUploads({
        filter: 'pending',
        status: 'pending',
        search: 'profile',
        page: 1,
        limit: 20,
      });

      expect(result).toEqual(mockUploadsResponse);
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/admin/uploads?filter=pending&status=pending&search=profile&page=1&limit=20',
        expect.any(Object),
      );
    });

    it('should get upload details', async () => {
      const mockUploadDetails = {
        success: true,
        data: {
          upload: mockUploadsResponse.data.uploads[0],
        },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue(mockUploadDetails),
      });

      const result = await adminAPI.getUploadDetails('upload1');

      expect(result).toEqual(mockUploadDetails);
    });

    it('should approve upload', async () => {
      const mockResponse = {
        success: true,
        data: { message: 'Upload approved successfully' },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue(mockResponse),
      });

      const result = await adminAPI.approveUpload('upload1', 'Looks good');

      expect(result).toEqual(mockResponse);
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/admin/uploads/upload1/approve',
        expect.objectContaining({
          method: 'PUT',
          body: JSON.stringify({ notes: 'Looks good' }),
        }),
      );
    });

    it('should reject upload', async () => {
      const mockResponse = {
        success: true,
        data: { message: 'Upload rejected successfully' },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue(mockResponse),
      });

      const result = await adminAPI.rejectUpload(
        'upload1',
        'Inappropriate content',
        'Please upload a different photo',
      );

      expect(result).toEqual(mockResponse);
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/admin/uploads/upload1/reject',
        expect.objectContaining({
          method: 'PUT',
          body: JSON.stringify({
            reason: 'Inappropriate content',
            notes: 'Please upload a different photo',
          }),
        }),
      );
    });

    it('should delete upload', async () => {
      const mockResponse = {
        success: true,
        data: { message: 'Upload deleted successfully' },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue(mockResponse),
      });

      const result = await adminAPI.deleteUpload('upload1', 'Content violation');

      expect(result).toEqual(mockResponse);
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/admin/uploads/upload1',
        expect.objectContaining({
          method: 'DELETE',
          body: JSON.stringify({ reason: 'Content violation' }),
        }),
      );
    });

    it('should moderate upload with approve action', async () => {
      const mockResponse = {
        success: true,
        data: { success: true, message: 'Upload approved' },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue(mockResponse),
      });

      const result = await adminAPI.moderateUpload({
        uploadId: 'upload1',
        action: 'approve',
        reason: 'Good content',
      });

      expect(result).toEqual(mockResponse);
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/admin/uploads/upload1/moderate',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ action: 'approve', reason: 'Good content' }),
        }),
      );
    });

    it('should moderate upload with remove action', async () => {
      const mockDeleteResponse = {
        success: true,
        data: { message: 'Upload deleted' },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue(mockDeleteResponse),
      });

      const result = await adminAPI.moderateUpload({
        uploadId: 'upload1',
        action: 'remove',
        reason: 'Violation',
      });

      expect(result.data).toEqual({ success: true, message: 'Upload deleted' });
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/admin/uploads/upload1',
        expect.objectContaining({
          method: 'DELETE',
          body: JSON.stringify({ reason: 'Violation' }),
        }),
      );
    });
  });

  describe('Verification Management', () => {
    const mockVerificationsResponse = {
      success: true,
      data: {
        verifications: [
          {
            _id: 'verification1',
            userId: { _id: 'user1', firstName: 'John', lastName: 'Doe', email: 'john@example.com' },
            type: 'identity',
            status: 'pending',
            documents: [
              {
                type: 'id_front',
                url: 'id-front.jpg',
                publicId: 'id1',
                uploadedAt: '2024-01-01T00:00:00Z',
              },
            ],
            submittedAt: '2024-01-01T00:00:00Z',
          },
        ],
        pagination: {
          page: 1,
          limit: 20,
          total: 1,
          pages: 1,
        },
      },
    };

    it('should get pending verifications', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue(mockVerificationsResponse),
      });

      const result = await adminAPI.getVerifications({ page: 1, limit: 20, status: 'pending' });

      expect(result).toEqual(mockVerificationsResponse);
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/admin/verifications/pending?page=1&limit=20&status=pending',
        expect.any(Object),
      );
    });

    it('should get verification details', async () => {
      const mockVerificationDetails = {
        success: true,
        data: {
          verification: mockVerificationsResponse.data.verifications[0],
        },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue(mockVerificationDetails),
      });

      const result = await adminAPI.getVerificationDetails('verification1');

      expect(result).toEqual(mockVerificationDetails);
    });

    it('should approve verification', async () => {
      const mockResponse = {
        success: true,
        data: { message: 'Verification approved successfully' },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue(mockResponse),
      });

      const result = await adminAPI.approveVerification('verification1', 'All documents verified');

      expect(result).toEqual(mockResponse);
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/admin/verifications/verification1/approve',
        expect.objectContaining({
          method: 'PUT',
          body: JSON.stringify({ notes: 'All documents verified' }),
        }),
      );
    });

    it('should reject verification', async () => {
      const mockResponse = {
        success: true,
        data: { message: 'Verification rejected successfully' },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue(mockResponse),
      });

      const result = await adminAPI.rejectVerification(
        'verification1',
        'Documents unclear',
        'Please resubmit clearer images',
      );

      expect(result).toEqual(mockResponse);
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/admin/verifications/verification1/reject',
        expect.objectContaining({
          method: 'PUT',
          body: JSON.stringify({
            reason: 'Documents unclear',
            notes: 'Please resubmit clearer images',
          }),
        }),
      );
    });
  });

  describe('Analytics and System Health', () => {
    it('should get analytics data', async () => {
      const mockAnalytics = {
        success: true,
        data: {
          users: {
            total: 1250,
            active: 890,
            suspended: 15,
            banned: 5,
            verified: 750,
            recent24h: 45,
          },
          pets: {
            total: 980,
            active: 920,
            recent24h: 23,
          },
          matches: {
            total: 5420,
            active: 4890,
            blocked: 45,
            recent24h: 156,
          },
          messages: {
            total: 12850,
            deleted: 234,
            recent24h: 890,
          },
        },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue(mockAnalytics),
      });

      const result = await adminAPI.getAnalytics({ period: '24h' });

      expect(result).toEqual(mockAnalytics);
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/admin/analytics?period=24h',
        expect.any(Object),
      );
    });

    it('should get system health status', async () => {
      const mockHealth = {
        success: true,
        data: {
          status: 'healthy',
          uptime: 345600, // seconds
          database: {
            status: 'connected',
            connected: true,
          },
          memory: {
            used: 512,
            total: 1024,
            external: 256,
          },
          environment: 'production',
        },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue(mockHealth),
      });

      const result = await adminAPI.getSystemHealth();

      expect(result).toEqual(mockHealth);
    });

    it('should get audit logs', async () => {
      const mockAuditLogs = {
        success: true,
        data: {
          logs: [
            {
              id: 'log1',
              action: 'user_suspended',
              userId: 'admin1',
              targetUserId: 'user123',
              details: { reason: 'Violation' },
              timestamp: '2024-01-01T00:00:00Z',
            },
          ],
          pagination: {
            page: 1,
            limit: 20,
            total: 1,
            pages: 1,
          },
        },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue(mockAuditLogs),
      });

      const result = await adminAPI.getAuditLogs({ page: 1, limit: 20 });

      expect(result).toEqual(mockAuditLogs);
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/admin/security/audit-logs?page=1&limit=20',
        expect.any(Object),
      );
    });
  });

  describe('Security and Safety Moderation', () => {
    it('should get security alerts', async () => {
      const mockAlerts = {
        success: true,
        data: {
          alerts: [
            {
              id: 'alert1',
              type: 'suspicious_login',
              severity: 'medium',
              userId: 'user123',
              details: { ip: '192.168.1.1', location: 'Unknown' },
              timestamp: '2024-01-01T00:00:00Z',
            },
          ],
        },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue(mockAlerts),
      });

      const result = await adminAPI.getSecurityAlerts({
        page: 1,
        limit: 20,
        sort: 'timestamp',
        order: 'desc',
      });

      expect(result).toEqual(mockAlerts);
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/admin/security/alerts?page=1&limit=20&sort=timestamp&order=desc',
        expect.any(Object),
      );
    });

    it('should resolve security alert', async () => {
      const mockResponse = {
        success: true,
        data: { success: true, message: 'Alert resolved' },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue(mockResponse),
      });

      const result = await adminAPI.resolveSecurityAlert({
        alertId: 'alert1',
        action: 'resolved',
        notes: 'False positive',
      });

      expect(result).toEqual(mockResponse);
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/admin/security/alerts/alert1/resolve',
        expect.objectContaining({
          method: 'PUT',
          body: JSON.stringify({ action: 'resolved', notes: 'False positive' }),
        }),
      );
    });

    it('should block IP address', async () => {
      const mockResponse = {
        success: true,
        data: { success: true, message: 'IP blocked successfully' },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue(mockResponse),
      });

      const result = await adminAPI.blockIPAddress({
        ipAddress: '192.168.1.100',
        reason: 'Suspicious activity',
        duration: 3600,
      });

      expect(result).toEqual(mockResponse);
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/admin/security/block-ip',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            ipAddress: '192.168.1.100',
            reason: 'Suspicious activity',
            duration: 3600,
          }),
        }),
      );
    });

    it('should get safety moderation queue', async () => {
      const mockSafetyQueue = {
        success: true,
        data: {
          uploads: [
            {
              id: 'upload1',
              userId: 'user1',
              petId: 'pet1',
              type: 'profile_photo',
              status: 'pending',
              flagged: true,
              flagReason: 'Potential inappropriate content',
              uploadedAt: '2024-01-01T00:00:00Z',
              analysis: {
                isPet: true,
                labels: [{ label: 'dog', confidence: 0.95 }],
                safety: {
                  safe: false,
                  moderationScore: 0.3,
                  labels: [{ label: 'inappropriate', confidence: 0.8 }],
                },
              },
            },
          ],
          pagination: {
            page: 1,
            limit: 20,
            total: 1,
            pages: 1,
          },
        },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue(mockSafetyQueue),
      });

      const result = await adminAPI.getSafetyModerationQueue({
        status: 'pending',
        page: 1,
        limit: 20,
      });

      expect(result).toEqual(mockSafetyQueue);
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/admin/safety-moderation/queue?status=pending&page=1&limit=20',
        expect.any(Object),
      );
    });

    it('should get safety moderation details', async () => {
      const mockDetails = {
        success: true,
        data: {
          upload: { id: 'upload1', type: 'profile_photo' },
          analysis: {
            isPet: true,
            labels: [{ label: 'dog', confidence: 0.95 }],
            safety: {
              safe: false,
              moderationScore: 0.3,
            },
          },
        },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue(mockDetails),
      });

      const result = await adminAPI.getSafetyModerationDetails('upload1');

      expect(result).toEqual(mockDetails);
    });

    it('should moderate safety upload', async () => {
      const mockResponse = {
        success: true,
        data: { upload: { id: 'upload1', status: 'approved' } },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue(mockResponse),
      });

      const result = await adminAPI.moderateSafetyUpload({
        uploadId: 'upload1',
        decision: 'approve',
        notes: 'Safe content',
      });

      expect(result).toEqual(mockResponse);
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/admin/safety-moderation/uploads/upload1/moderate',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ decision: 'approve', notes: 'Safe content' }),
        }),
      );
    });

    it('should batch moderate safety uploads', async () => {
      const mockResponse = {
        success: true,
        data: {
          results: [
            { id: 'upload1', success: true },
            { id: 'upload2', success: true },
            { id: 'upload3', success: false, error: 'Upload not found' },
          ],
        },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue(mockResponse),
      });

      const result = await adminAPI.batchModerateSafetyUploads({
        uploadIds: ['upload1', 'upload2', 'upload3'],
        decision: 'approve',
        notes: 'Batch approval',
      });

      expect(result).toEqual(mockResponse);
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/admin/safety-moderation/batch-moderate',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            uploadIds: ['upload1', 'upload2', 'upload3'],
            decision: 'approve',
            notes: 'Batch approval',
          }),
        }),
      );
    });

    it('should get safety moderation statistics', async () => {
      const mockStats = {
        success: true,
        data: {
          stats: {
            pending: 25,
            approved: 150,
            rejected: 12,
            flagged: 8,
            total: 195,
          },
          thresholds: {
            autoApprove: 0.9,
            requireReview: 0.7,
            autoReject: 0.3,
          },
        },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue(mockStats),
      });

      const result = await adminAPI.getSafetyModerationStats();

      expect(result).toEqual(mockStats);
    });
  });

  describe('Billing and Subscription Management', () => {
    it('should get subscriptions with pagination', async () => {
      const mockSubscriptions = {
        success: true,
        data: {
          subscriptions: [
            {
              id: 'sub1',
              userId: 'user1',
              status: 'active',
              plan: 'premium',
              amount: 999,
              currency: 'usd',
            },
          ],
          pagination: {
            page: 1,
            limit: 20,
            total: 1,
            pages: 1,
          },
        },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue(mockSubscriptions),
      });

      const result = await adminAPI.getSubscriptions({
        page: 1,
        limit: 20,
        sort: 'created',
        order: 'desc',
      });

      expect(result).toEqual(mockSubscriptions);
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/admin/subscriptions?page=1&limit=20&sort=created&order=desc',
        expect.any(Object),
      );
    });

    it('should get billing metrics', async () => {
      const mockMetrics = {
        success: true,
        data: {
          totalRevenue: 15000,
          monthlyRecurringRevenue: 12000,
          churnRate: 0.05,
          averageRevenuePerUser: 12.5,
          paymentSuccessRate: 0.98,
        },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue(mockMetrics),
      });

      const result = await adminAPI.getBillingMetrics();

      expect(result).toEqual(mockMetrics);
    });

    it('should cancel user subscription', async () => {
      const mockResponse = {
        success: true,
        data: { success: true, message: 'Subscription cancelled successfully' },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue(mockResponse),
      });

      const result = await adminAPI.cancelSubscription({
        userId: 'user1',
        reason: 'User requested cancellation',
      });

      expect(result).toEqual(mockResponse);
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/admin/users/user1/cancel-subscription',
        expect.objectContaining({
          method: 'PUT',
          body: JSON.stringify({ reason: 'User requested cancellation' }),
        }),
      );
    });

    it('should reactivate user subscription', async () => {
      const mockResponse = {
        success: true,
        data: { success: true, message: 'Subscription reactivated successfully' },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue(mockResponse),
      });

      const result = await adminAPI.reactivateSubscription({ userId: 'user1' });

      expect(result).toEqual(mockResponse);
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/admin/users/user1/reactivate-subscription',
        expect.objectContaining({
          method: 'PUT',
          body: JSON.stringify({}),
        }),
      );
    });
  });

  describe('Services Management', () => {
    it('should get services status', async () => {
      const mockServicesStatus = {
        success: true,
        data: {
          database: { status: 'healthy', uptime: 86400 },
          cache: { status: 'healthy', hitRate: 0.95 },
          api: { status: 'healthy', responseTime: 125 },
          backgroundJobs: { status: 'healthy', queuedJobs: 5 },
        },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue(mockServicesStatus),
      });

      const result = await adminAPI.getServicesStatus();

      expect(result).toEqual(mockServicesStatus);
    });

    it('should get services analytics', async () => {
      const mockServicesAnalytics = {
        success: true,
        data: {
          period: '24h',
          api: {
            totalRequests: 12500,
            averageResponseTime: 145,
            errorRate: 0.02,
          },
          database: {
            totalQueries: 45000,
            slowQueries: 125,
            connectionPoolUsage: 0.75,
          },
          cache: {
            hitRate: 0.92,
            totalRequests: 38000,
            evictionRate: 0.05,
          },
        },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue(mockServicesAnalytics),
      });

      const result = await adminAPI.getServicesStats({ period: '24h' });

      expect(result).toEqual(mockServicesAnalytics);
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/admin/services/analytics?period=24h',
        expect.any(Object),
      );
    });

    it('should get combined statistics', async () => {
      const mockCombinedStats = {
        success: true,
        data: {
          period: '7d',
          overview: {
            totalUsers: 1250,
            activeUsers: 890,
            totalRevenue: 15000,
            systemHealth: 'healthy',
          },
          performance: {
            apiResponseTime: 145,
            databaseQueryTime: 12,
            cacheHitRate: 0.92,
          },
          security: {
            failedLogins: 12,
            blockedIPs: 3,
            securityAlerts: 2,
          },
        },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue(mockCombinedStats),
      });

      const result = await adminAPI.getCombinedStats({ period: '7d' });

      expect(result).toEqual(mockCombinedStats);
    });

    it('should toggle service status', async () => {
      const mockResponse = {
        success: true,
        data: { message: 'Service status updated successfully' },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue(mockResponse),
      });

      const result = await adminAPI.toggleService({
        service: 'background-jobs',
        enabled: false,
      });

      expect(result).toEqual(mockResponse);
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/admin/services/toggle',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ service: 'background-jobs', enabled: false }),
        }),
      );
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle API errors gracefully', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(adminAPI.getUsers()).rejects.toThrow('Network error');
    });

    it('should handle HTTP errors with proper messages', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 403,
        statusText: 'Forbidden',
      });

      await expect(adminAPI.getUsers()).rejects.toThrow('HTTP error! status: 403');
    });

    it('should handle malformed response data', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue({ invalid: 'response' }),
      });

      const result = await adminAPI.getUsers();
      // Should still return the response even if data structure is unexpected
      expect(result).toEqual({ invalid: 'response' });
    });

    it('should handle empty pagination parameters', async () => {
      const mockResponse = {
        success: true,
        data: {
          users: [],
          pagination: { page: 1, limit: 20, total: 0, pages: 0 },
        },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue(mockResponse),
      });

      const result = await adminAPI.getUsers({});

      expect(result).toEqual(mockResponse);
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/admin/users',
        expect.any(Object),
      );
    });

    it('should handle very large datasets', async () => {
      const largeResponse = {
        success: true,
        data: {
          users: Array.from({ length: 1000 }, (_, i) => ({
            _id: `user${i}`,
            firstName: `User${i}`,
            lastName: 'Test',
            email: `user${i}@example.com`,
            role: 'user',
            status: 'active',
            isVerified: true,
            createdAt: '2024-01-01T00:00:00Z',
            pets: [],
          })),
          pagination: {
            page: 1,
            limit: 1000,
            total: 1000,
            pages: 1,
          },
        },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue(largeResponse),
      });

      const result = await adminAPI.getUsers({ page: 1, limit: 1000 });

      expect(result.data.users).toHaveLength(1000);
    });

    it('should handle special characters in parameters', async () => {
      const searchTerm = 'café & naïve résumé';
      const mockResponse = {
        success: true,
        data: {
          users: [
            {
              _id: 'user1',
              firstName: 'Café',
              lastName: 'User',
              email: 'cafe@example.com',
              role: 'user',
              status: 'active',
              isVerified: true,
              createdAt: '2024-01-01T00:00:00Z',
              pets: [],
            },
          ],
          pagination: { page: 1, limit: 20, total: 1, pages: 1 },
        },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue(mockResponse),
      });

      const result = await adminAPI.getUsers({ search: searchTerm });

      expect(result).toEqual(mockResponse);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('search=caf%C3%A9%20%26%20na%C3%AFve%20r%C3%A9sum%C3%A9'),
        expect.any(Object),
      );
    });

    it('should handle null and undefined parameter values', async () => {
      const params = {
        page: null,
        limit: undefined,
        search: '',
        status: null,
      };

      const mockResponse = {
        success: true,
        data: {
          users: [],
          pagination: { page: 1, limit: 20, total: 0, pages: 0 },
        },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue(mockResponse),
      });

      const result = await adminAPI.getUsers(params);

      expect(result).toEqual(mockResponse);
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/admin/users',
        expect.any(Object),
      );
    });

    it('should handle concurrent API calls', async () => {
      const mockResponse = { success: true, data: [] };

      mockFetch.mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockResponse),
      });

      const promises = [
        adminAPI.getUsers({ page: 1 }),
        adminAPI.getChats({ page: 1 }),
        adminAPI.getUploads({ page: 1 }),
        adminAPI.getVerifications({ page: 1 }),
      ];

      const results = await Promise.all(promises);

      expect(results).toHaveLength(4);
      results.forEach((result) => {
        expect(result.success).toBe(true);
      });
    });
  });
});

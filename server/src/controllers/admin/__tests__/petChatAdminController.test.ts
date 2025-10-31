/**
 * Admin Pet Chat Controller Tests
 * Comprehensive test suite for admin pet chat management
 */

import type { Request, Response } from 'express';
import {
  getPetChatStats,
  getModerationQueue,
  moderatePlaydate,
  moderateHealthAlert,
  viewPetProfile,
  getCompatibilityReports,
  moderateContent,
  exportPetChatData,
} from '../../../server/src/controllers/admin/petChatAdminController';
import Match from '../../../server/src/models/Match';
import Pet from '../../../server/src/models/Pet';
import User from '../../../server/src/models/User';
import { logAdminActivity } from '../../../server/src/middleware/adminLogger';
import logger from '../../../server/src/utils/logger';

jest.mock('../../../server/src/models/Match');
jest.mock('../../../server/src/models/Pet');
jest.mock('../../../server/src/models/User');
jest.mock('../../../server/src/middleware/adminLogger');
jest.mock('../../../server/src/utils/logger');

const mockMatch = Match as jest.Mocked<typeof Match>;
const mockPet = Pet as jest.Mocked<typeof Pet>;
const mockUser = User as jest.Mocked<typeof User>;
const mockLogAdminActivity = logAdminActivity as jest.MockedFunction<typeof logAdminActivity>;

describe('Admin Pet Chat Controller', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;

  beforeEach(() => {
    jest.clearAllMocks();

    mockReq = {
      userId: 'admin123',
      user: {
        _id: 'admin123',
        firstName: 'Admin',
        lastName: 'User',
      } as any,
      query: {},
      params: {},
      body: {},
    };

    mockRes = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    };
  });

  describe('getPetChatStats', () => {
    it('should return pet chat statistics', async () => {
      const mockMatches = [
        {
          _id: 'match1',
          messages: [
            {
              messageType: 'pet_profile',
              petProfileCard: { breed: 'Golden Retriever' },
            },
            {
              messageType: 'playdate_proposal',
              playdateProposal: {
                venue: { name: 'Dog Park' },
                status: 'accepted',
              },
            },
            {
              messageType: 'compatibility',
              compatibilityIndicator: { score: 85 },
            },
          ],
        },
      ];

      mockMatch.find.mockResolvedValue(mockMatches as any);

      await getPetChatStats(mockReq as any, mockRes as any);

      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: expect.objectContaining({
          totalPetProfilesShared: 1,
          totalPlaydateProposals: 1,
          totalCompatibilityShares: 1,
        }),
      });
      expect(mockLogAdminActivity).toHaveBeenCalled();
    });

    it('should handle date range filters', async () => {
      mockReq.query = {
        startDate: '2024-01-01',
        endDate: '2024-12-31',
      };

      mockMatch.find.mockResolvedValue([]);

      await getPetChatStats(mockReq as any, mockRes as any);

      expect(mockMatch.find).toHaveBeenCalledWith(
        expect.objectContaining({
          'messages.sentAt': expect.objectContaining({
            $gte: expect.any(Date),
            $lte: expect.any(Date),
          }),
        }),
      );
    });

    it('should handle errors', async () => {
      mockMatch.find.mockRejectedValue(new Error('Database error'));

      await getPetChatStats(mockReq as any, mockRes as any);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Failed to get pet chat statistics',
      });
    });
  });

  describe('getModerationQueue', () => {
    it('should return moderation queue items', async () => {
      const mockMatches = [
        {
          _id: 'match1',
          user1: { _id: 'user1', firstName: 'John', lastName: 'Doe' },
          user2: { _id: 'user2', firstName: 'Jane', lastName: 'Smith' },
          pet1: { _id: 'pet1', name: 'Buddy', breed: 'Golden Retriever' },
          pet2: { _id: 'pet2', name: 'Max', breed: 'Labrador' },
          messages: [
            {
              _id: 'msg1',
              messageType: 'playdate_proposal',
              sender: 'user1',
              content: 'Test proposal',
              sentAt: new Date(),
              moderationStatus: 'pending',
            },
          ],
        },
      ];

      mockMatch.find.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue(mockMatches as any),
      } as any);

      mockReq.query = {
        type: 'playdate',
        status: 'pending',
        page: '1',
        limit: '20',
      };

      await getModerationQueue(mockReq as any, mockRes as any);

      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: expect.objectContaining({
          items: expect.any(Array),
          pagination: expect.any(Object),
        }),
      });
    });
  });

  describe('moderatePlaydate', () => {
    it('should successfully moderate playdate proposal', async () => {
      const mockMatchDoc = {
        _id: 'match123',
        messages: [
          {
            messageType: 'playdate_proposal',
            playdateProposal: { proposalId: 'proposal123' },
            save: jest.fn(),
          },
        ],
        save: jest.fn(),
      };

      mockMatch.findOne.mockResolvedValue(mockMatchDoc as any);
      mockMatchDoc.save.mockResolvedValue(mockMatchDoc);

      mockReq.params = {
        matchId: 'match123',
        proposalId: 'proposal123',
      };
      mockReq.body = {
        action: 'approve',
        reason: 'Looks good',
      };

      await moderatePlaydate(mockReq as any, mockRes as any);

      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: 'Playdate proposal approved successfully',
      });
      expect(mockLogAdminActivity).toHaveBeenCalled();
    });

    it('should handle playdate not found', async () => {
      mockMatch.findOne.mockResolvedValue({
        _id: 'match123',
        messages: [],
      } as any);

      mockReq.params = {
        matchId: 'match123',
        proposalId: 'proposal123',
      };

      await moderatePlaydate(mockReq as any, mockRes as any);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Playdate proposal not found',
      });
    });
  });

  describe('moderateHealthAlert', () => {
    it('should successfully moderate health alert', async () => {
      const mockMatchDoc = {
        _id: 'match123',
        messages: [
          {
            messageType: 'health_alert',
            healthAlert: { alertId: 'alert123' },
          },
        ],
        save: jest.fn(),
      };

      mockMatch.findOne.mockResolvedValue(mockMatchDoc as any);
      mockMatchDoc.save.mockResolvedValue(mockMatchDoc);

      mockReq.params = {
        matchId: 'match123',
        alertId: 'alert123',
      };
      mockReq.body = {
        action: 'approve',
        reason: 'Valid alert',
      };

      await moderateHealthAlert(mockReq as any, mockRes as any);

      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: 'Health alert approved successfully',
      });
    });
  });

  describe('viewPetProfile', () => {
    it('should return pet profile', async () => {
      const mockPetDoc = {
        _id: 'pet123',
        name: 'Buddy',
        breed: 'Golden Retriever',
        owner: {
          _id: 'owner123',
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
        },
      };

      mockPet.findById.mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockPetDoc),
      } as any);

      mockReq.params = { petId: 'pet123' };

      await viewPetProfile(mockReq as any, mockRes as any);

      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: mockPetDoc,
      });
      expect(mockLogAdminActivity).toHaveBeenCalled();
    });

    it('should handle pet not found', async () => {
      mockPet.findById.mockReturnValue({
        populate: jest.fn().mockResolvedValue(null),
      } as any);

      mockReq.params = { petId: 'pet123' };

      await viewPetProfile(mockReq as any, mockRes as any);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Pet not found',
      });
    });
  });

  describe('getCompatibilityReports', () => {
    it('should return compatibility reports', async () => {
      const mockMatches = [
        {
          _id: 'match1',
          pet1: { _id: 'pet1', name: 'Buddy', breed: 'Golden Retriever' },
          pet2: { _id: 'pet2', name: 'Max', breed: 'Labrador' },
          user1: { _id: 'user1', firstName: 'John', lastName: 'Doe' },
          user2: { _id: 'user2', firstName: 'Jane', lastName: 'Smith' },
          messages: [
            {
              messageType: 'compatibility',
              compatibilityIndicator: { score: 85, factors: [] },
            },
          ],
        },
      ];

      mockMatch.find.mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockMatches as any),
      } as any);

      await getCompatibilityReports(mockReq as any, mockRes as any);

      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: expect.arrayContaining([
          expect.objectContaining({
            compatibilityScore: 85,
          }),
        ]),
      });
    });

    it('should filter by score range', async () => {
      mockReq.query = {
        minScore: '80',
        maxScore: '90',
      };

      mockMatch.find.mockReturnValue({
        populate: jest.fn().mockResolvedValue([]),
      } as any);

      await getCompatibilityReports(mockReq as any, mockRes as any);

      expect(mockMatch.find).toHaveBeenCalled();
    });
  });

  describe('moderateContent', () => {
    it('should successfully moderate content', async () => {
      const mockMessage = {
        _id: 'msg123',
        messageType: 'text',
        content: 'Test message',
        isDeleted: false,
      };

      const mockMatchDoc = {
        _id: 'match123',
        messages: {
          id: jest.fn().mockReturnValue(mockMessage),
        },
        save: jest.fn(),
      };

      mockMatch.findOne.mockResolvedValue(mockMatchDoc as any);
      mockMatchDoc.save.mockResolvedValue(mockMatchDoc);

      mockReq.params = {
        matchId: 'match123',
        messageId: 'msg123',
      };
      mockReq.body = {
        action: 'delete',
        reason: 'Inappropriate content',
      };

      await moderateContent(mockReq as any, mockRes as any);

      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: 'Message deleted successfully',
      });
      expect(mockLogAdminActivity).toHaveBeenCalled();
    });
  });

  describe('exportPetChatData', () => {
    it('should export pet chat data as JSON', async () => {
      const mockMatches = [
        {
          _id: 'match1',
          user1: { _id: 'user1', firstName: 'John', lastName: 'Doe', email: 'john@example.com' },
          user2: { _id: 'user2', firstName: 'Jane', lastName: 'Smith', email: 'jane@example.com' },
          pet1: { _id: 'pet1', name: 'Buddy', breed: 'Golden Retriever' },
          pet2: { _id: 'pet2', name: 'Max', breed: 'Labrador' },
          messages: [
            {
              _id: 'msg1',
              messageType: 'pet_profile',
              content: 'Test',
              sentAt: new Date(),
              moderationStatus: 'approved',
            },
          ],
        },
      ];

      mockMatch.find.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue(mockMatches as any),
      } as any);

      mockReq.query = { format: 'json' };

      await exportPetChatData(mockReq as any, mockRes as any);

      expect(mockRes.setHeader).toHaveBeenCalledWith('Content-Type', 'application/json');
      expect(mockRes.setHeader).toHaveBeenCalledWith(
        'Content-Disposition',
        expect.stringContaining('attachment'),
      );
      expect(mockLogAdminActivity).toHaveBeenCalled();
    });
  });
});


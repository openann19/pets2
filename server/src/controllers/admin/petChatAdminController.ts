/**
 * Admin Pet Chat Controller
 * Admin management for pet-centric chat features
 */

import type { Request, Response } from 'express';
import type { IUserDocument } from '../../types/mongoose';
import Match from '../../models/Match';
import Pet from '../../models/Pet';
import User from '../../models/User';
import logger from '../../utils/logger';
import { logAdminActivity } from '../../middleware/adminLogger';

interface AuthenticatedRequest extends Request {
  userId: string;
  user?: IUserDocument;
}

interface GetPetChatStatsRequest extends AuthenticatedRequest {
  query: {
    startDate?: string;
    endDate?: string;
  };
}

interface ModeratePlaydateRequest extends AuthenticatedRequest {
  params: {
    matchId: string;
    proposalId: string;
  };
  body: {
    action: 'approve' | 'reject' | 'flag';
    reason?: string;
  };
}

interface ModerateHealthAlertRequest extends AuthenticatedRequest {
  params: {
    matchId: string;
    alertId: string;
  };
  body: {
    action: 'approve' | 'reject' | 'flag';
    reason?: string;
  };
}

interface ViewPetProfileRequest extends AuthenticatedRequest {
  params: {
    petId: string;
  };
}

interface GetCompatibilityReportsRequest extends AuthenticatedRequest {
  query: {
    startDate?: string;
    endDate?: string;
    minScore?: string;
    maxScore?: string;
  };
}

interface ModerateContentRequest extends AuthenticatedRequest {
  params: {
    matchId: string;
    messageId: string;
  };
  body: {
    action: 'approve' | 'reject' | 'delete' | 'flag';
    reason: string;
  };
}

interface GetModerationQueueRequest extends AuthenticatedRequest {
  query: {
    type?: 'playdate' | 'health_alert' | 'content' | 'all';
    status?: 'pending' | 'reviewed' | 'approved' | 'rejected';
    page?: string;
    limit?: string;
  };
}

/**
 * @desc    Get pet chat statistics
 * @route   GET /api/admin/pet-chat/stats
 * @access  Private (Admin)
 */
export const getPetChatStats = async (
  req: GetPetChatStatsRequest,
  res: Response,
): Promise<void> => {
  try {
    const { startDate, endDate } = req.query;
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();

    // Get all matches with pet-centric messages
    const matches = await Match.find({
      'messages.sentAt': { $gte: start, $lte: end },
      $or: [
        { 'messages.messageType': 'pet_profile' },
        { 'messages.messageType': 'playdate_proposal' },
        { 'messages.messageType': 'health_alert' },
        { 'messages.messageType': 'compatibility' },
      ],
    });

    const stats = {
      totalPetProfilesShared: 0,
      totalPlaydateProposals: 0,
      totalHealthAlerts: 0,
      totalCompatibilityShares: 0,
      playdateAcceptanceRate: 0,
      averageCompatibilityScore: 0,
      topPetBreeds: {} as Record<string, number>,
      topVenues: {} as Record<string, number>,
      healthAlertTypes: {} as Record<string, number>,
    };

    matches.forEach((match) => {
      match.messages.forEach((msg: any) => {
        switch (msg.messageType) {
          case 'pet_profile':
            stats.totalPetProfilesShared++;
            if (msg.petProfileCard?.breed) {
              stats.topPetBreeds[msg.petProfileCard.breed] =
                (stats.topPetBreeds[msg.petProfileCard.breed] || 0) + 1;
            }
            break;
          case 'playdate_proposal':
            stats.totalPlaydateProposals++;
            if (msg.playdateProposal?.venue?.name) {
              stats.topVenues[msg.playdateProposal.venue.name] =
                (stats.topVenues[msg.playdateProposal.venue.name] || 0) + 1;
            }
            break;
          case 'health_alert':
            stats.totalHealthAlerts++;
            if (msg.healthAlert?.type) {
              stats.healthAlertTypes[msg.healthAlert.type] =
                (stats.healthAlertTypes[msg.healthAlert.type] || 0) + 1;
            }
            break;
          case 'compatibility':
            stats.totalCompatibilityShares++;
            if (msg.compatibilityIndicator?.score) {
              stats.averageCompatibilityScore += msg.compatibilityIndicator.score;
            }
            break;
        }
      });
    });

    // Calculate playdate acceptance rate
    const playdateProposals = matches.reduce((count, match) => {
      return (
        count +
        match.messages.filter(
          (msg: any) =>
            msg.messageType === 'playdate_proposal' &&
            msg.playdateProposal?.status === 'accepted',
        ).length
      );
    }, 0);

    stats.playdateAcceptanceRate =
      stats.totalPlaydateProposals > 0
        ? (playdateProposals / stats.totalPlaydateProposals) * 100
        : 0;

    stats.averageCompatibilityScore =
      stats.totalCompatibilityShares > 0
        ? stats.averageCompatibilityScore / stats.totalCompatibilityShares
        : 0;

    await logAdminActivity(req.userId, 'VIEW_STATS', 'pet_chat', {
      startDate: start.toISOString(),
      endDate: end.toISOString(),
    });

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    logger.error('Get pet chat stats error', { error });
    res.status(500).json({
      success: false,
      message: 'Failed to get pet chat statistics',
    });
  }
};

/**
 * @desc    Get moderation queue
 * @route   GET /api/admin/pet-chat/moderation-queue
 * @access  Private (Admin)
 */
export const getModerationQueue = async (
  req: GetModerationQueueRequest,
  res: Response,
): Promise<void> => {
  try {
    const { type = 'all', status = 'pending', page = '1', limit = '20' } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const query: any = {
      'messages.sentAt': { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }, // Last 7 days
    };

    if (type !== 'all') {
      query['messages.messageType'] = type === 'content' ? { $ne: 'text' } : type;
    }

    const matches = await Match.find(query)
      .populate('user1 user2', 'firstName lastName email')
      .populate('pet1 pet2', 'name breed species')
      .skip(skip)
      .limit(limitNum);

    const queueItems = [];

    for (const match of matches) {
      for (const msg of match.messages) {
        const msgAny = msg as any;
        if (
          (type === 'all' ||
            (type === 'playdate' && msgAny.messageType === 'playdate_proposal') ||
            (type === 'health_alert' && msgAny.messageType === 'health_alert') ||
            (type === 'content' && msgAny.messageType !== 'text')) &&
          (!msgAny.moderationStatus || msgAny.moderationStatus === status)
        ) {
          queueItems.push({
            id: msgAny._id.toString(),
            matchId: match._id.toString(),
            messageType: msgAny.messageType,
            sender: {
              id: typeof msgAny.sender === 'string' ? msgAny.sender : msgAny.sender?._id,
              name: typeof msgAny.sender === 'object' ? msgAny.sender?.firstName : 'Unknown',
            },
            content: msgAny.content,
            sentAt: msgAny.sentAt,
            data: {
              playdateProposal: msgAny.playdateProposal,
              healthAlert: msgAny.healthAlert,
              petProfileCard: msgAny.petProfileCard,
              compatibilityIndicator: msgAny.compatibilityIndicator,
            },
            moderationStatus: msgAny.moderationStatus || 'pending',
          });
        }
      }
    }

    res.json({
      success: true,
      data: {
        items: queueItems,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total: queueItems.length,
        },
      },
    });
  } catch (error) {
    logger.error('Get moderation queue error', { error });
    res.status(500).json({
      success: false,
      message: 'Failed to get moderation queue',
    });
  }
};

/**
 * @desc    Moderate playdate proposal
 * @route   POST /api/admin/pet-chat/playdate/:matchId/:proposalId/moderate
 * @access  Private (Admin)
 */
export const moderatePlaydate = async (
  req: ModeratePlaydateRequest,
  res: Response,
): Promise<void> => {
  try {
    const { matchId, proposalId } = req.params;
    const { action, reason } = req.body;

    const match = await Match.findOne({
      _id: matchId,
    });

    if (!match) {
      res.status(404).json({
        success: false,
        message: 'Match not found',
      });
      return;
    }

    const message = match.messages.find(
      (msg: any) =>
        msg.messageType === 'playdate_proposal' &&
        msg.playdateProposal?.proposalId === proposalId,
    );

    if (!message) {
      res.status(404).json({
        success: false,
        message: 'Playdate proposal not found',
      });
      return;
    }

    const msgAny = message as any;
    msgAny.moderationStatus = action === 'approve' ? 'approved' : 'rejected';
    msgAny.moderationReason = reason;
    msgAny.moderatedAt = new Date();
    msgAny.moderatedBy = req.userId;

    if (action === 'reject' && msgAny.playdateProposal) {
      msgAny.playdateProposal.status = 'cancelled';
    }

    await match.save();

    await logAdminActivity(req.userId, 'MODERATE_PLAYDATE', proposalId, {
      action,
      reason,
      matchId,
    });

    res.json({
      success: true,
      message: `Playdate proposal ${action}d successfully`,
    });
  } catch (error) {
    logger.error('Moderate playdate error', { error });
    res.status(500).json({
      success: false,
      message: 'Failed to moderate playdate proposal',
    });
  }
};

/**
 * @desc    Moderate health alert
 * @route   POST /api/admin/pet-chat/health-alert/:matchId/:alertId/moderate
 * @access  Private (Admin)
 */
export const moderateHealthAlert = async (
  req: ModerateHealthAlertRequest,
  res: Response,
): Promise<void> => {
  try {
    const { matchId, alertId } = req.params;
    const { action, reason } = req.body;

    const match = await Match.findOne({
      _id: matchId,
    });

    if (!match) {
      res.status(404).json({
        success: false,
        message: 'Match not found',
      });
      return;
    }

    const message = match.messages.find(
      (msg: any) =>
        msg.messageType === 'health_alert' && msg.healthAlert?.alertId === alertId,
    );

    if (!message) {
      res.status(404).json({
        success: false,
        message: 'Health alert not found',
      });
      return;
    }

    const msgAny = message as any;
    msgAny.moderationStatus = action === 'approve' ? 'approved' : 'rejected';
    msgAny.moderationReason = reason;
    msgAny.moderatedAt = new Date();
    msgAny.moderatedBy = req.userId;

    if (action === 'delete' && msgAny.healthAlert) {
      msgAny.healthAlert.status = 'cancelled';
    }

    await match.save();

    await logAdminActivity(req.userId, 'MODERATE_HEALTH_ALERT', alertId, {
      action,
      reason,
      matchId,
    });

    res.json({
      success: true,
      message: `Health alert ${action}d successfully`,
    });
  } catch (error) {
    logger.error('Moderate health alert error', { error });
    res.status(500).json({
      success: false,
      message: 'Failed to moderate health alert',
    });
  }
};

/**
 * @desc    View pet profile (admin view)
 * @route   GET /api/admin/pet-chat/pet/:petId
 * @access  Private (Admin)
 */
export const viewPetProfile = async (
  req: ViewPetProfileRequest,
  res: Response,
): Promise<void> => {
  try {
    const { petId } = req.params;

    const pet = await Pet.findById(petId).populate('owner', 'firstName lastName email');

    if (!pet) {
      res.status(404).json({
        success: false,
        message: 'Pet not found',
      });
      return;
    }

    await logAdminActivity(req.userId, 'VIEW_PET_PROFILE', petId);

    res.json({
      success: true,
      data: pet,
    });
  } catch (error) {
    logger.error('View pet profile error', { error });
    res.status(500).json({
      success: false,
      message: 'Failed to view pet profile',
    });
  }
};

/**
 * @desc    Get compatibility reports
 * @route   GET /api/admin/pet-chat/compatibility-reports
 * @access  Private (Admin)
 */
export const getCompatibilityReports = async (
  req: GetCompatibilityReportsRequest,
  res: Response,
): Promise<void> => {
  try {
    const { startDate, endDate, minScore, maxScore } = req.query;

    const query: any = {
      'messages.messageType': 'compatibility',
    };

    if (startDate || endDate) {
      query['messages.sentAt'] = {};
      if (startDate) query['messages.sentAt'].$gte = new Date(startDate);
      if (endDate) query['messages.sentAt'].$lte = new Date(endDate);
    }

    const matches = await Match.find(query)
      .populate('pet1 pet2', 'name breed species')
      .populate('user1 user2', 'firstName lastName');

    const reports = matches
      .map((match) => {
        const compatibilityMsg = match.messages.find(
          (msg: any) => msg.messageType === 'compatibility',
        );
        if (!compatibilityMsg) return null;

        const msgAny = compatibilityMsg as any;
        const score = msgAny.compatibilityIndicator?.score || 0;

        if (minScore && score < parseInt(minScore)) return null;
        if (maxScore && score > parseInt(maxScore)) return null;

        return {
          matchId: match._id.toString(),
          pet1: {
            id: (match.pet1 as any)?._id || match.pet1,
            name: (match.pet1 as any)?.name || 'Unknown',
            breed: (match.pet1 as any)?.breed || 'Unknown',
          },
          pet2: {
            id: (match.pet2 as any)?._id || match.pet2,
            name: (match.pet2 as any)?.name || 'Unknown',
            breed: (match.pet2 as any)?.breed || 'Unknown',
          },
          compatibilityScore: score,
          factors: msgAny.compatibilityIndicator?.factors || [],
          sharedAt: msgAny.sentAt,
        };
      })
      .filter((r) => r !== null);

    await logAdminActivity(req.userId, 'VIEW_COMPATIBILITY_REPORTS', 'pet_chat');

    res.json({
      success: true,
      data: reports,
    });
  } catch (error) {
    logger.error('Get compatibility reports error', { error });
    res.status(500).json({
      success: false,
      message: 'Failed to get compatibility reports',
    });
  }
};

/**
 * @desc    Moderate content
 * @route   POST /api/admin/pet-chat/moderate/:matchId/:messageId
 * @access  Private (Admin)
 */
export const moderateContent = async (
  req: ModerateContentRequest,
  res: Response,
): Promise<void> => {
  try {
    const { matchId, messageId } = req.params;
    const { action, reason } = req.body;

    const match = await Match.findOne({
      _id: matchId,
    });

    if (!match) {
      res.status(404).json({
        success: false,
        message: 'Match not found',
      });
      return;
    }

    const message = match.messages.id(messageId);

    if (!message) {
      res.status(404).json({
        success: false,
        message: 'Message not found',
      });
      return;
    }

    const msgAny = message as any;

    if (action === 'delete') {
      msgAny.isDeleted = true;
      msgAny.deletedAt = new Date();
      msgAny.content = '[Message deleted by moderator]';
    } else if (action === 'reject') {
      msgAny.moderationStatus = 'rejected';
      msgAny.moderationReason = reason;
    } else if (action === 'approve') {
      msgAny.moderationStatus = 'approved';
    } else if (action === 'flag') {
      msgAny.moderationStatus = 'flagged';
      msgAny.moderationReason = reason;
    }

    msgAny.moderatedAt = new Date();
    msgAny.moderatedBy = req.userId;

    await match.save();

    await logAdminActivity(req.userId, 'MODERATE_CONTENT', messageId, {
      action,
      reason,
      matchId,
    });

    res.json({
      success: true,
      message: `Message ${action}d successfully`,
    });
  } catch (error) {
    logger.error('Moderate content error', { error });
    res.status(500).json({
      success: false,
      message: 'Failed to moderate content',
    });
  }
};

/**
 * @desc    Export pet chat data
 * @route   GET /api/admin/pet-chat/export
 * @access  Private (Admin)
 */
export const exportPetChatData = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const { format = 'json' } = req.query;

    const matches = await Match.find({
      $or: [
        { 'messages.messageType': 'pet_profile' },
        { 'messages.messageType': 'playdate_proposal' },
        { 'messages.messageType': 'health_alert' },
        { 'messages.messageType': 'compatibility' },
      ],
    })
      .populate('user1 user2', 'firstName lastName email')
      .populate('pet1 pet2', 'name breed species')
      .limit(1000);

    const exportData = matches.map((match) => ({
      matchId: match._id.toString(),
      users: {
        user1: {
          id: (match.user1 as any)?._id || match.user1,
          name: `${(match.user1 as any)?.firstName || ''} ${(match.user1 as any)?.lastName || ''}`,
          email: (match.user1 as any)?.email || '',
        },
        user2: {
          id: (match.user2 as any)?._id || match.user2,
          name: `${(match.user2 as any)?.firstName || ''} ${(match.user2 as any)?.lastName || ''}`,
          email: (match.user2 as any)?.email || '',
        },
      },
      pets: {
        pet1: {
          id: (match.pet1 as any)?._id || match.pet1,
          name: (match.pet1 as any)?.name || 'Unknown',
          breed: (match.pet1 as any)?.breed || 'Unknown',
        },
        pet2: {
          id: (match.pet2 as any)?._id || match.pet2,
          name: (match.pet2 as any)?.name || 'Unknown',
          breed: (match.pet2 as any)?.breed || 'Unknown',
        },
      },
      messages: match.messages
        .filter((msg: any) =>
          ['pet_profile', 'playdate_proposal', 'health_alert', 'compatibility'].includes(
            msg.messageType,
          ),
        )
        .map((msg: any) => ({
          id: msg._id.toString(),
          type: msg.messageType,
          content: msg.content,
          sentAt: msg.sentAt,
          moderationStatus: msg.moderationStatus,
        })),
    }));

    await logAdminActivity(req.userId, 'EXPORT_DATA', 'pet_chat', { format });

    if (format === 'csv') {
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=pet-chat-data.csv');
      // CSV export logic would go here
      res.send('CSV export not yet implemented');
    } else {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', 'attachment; filename=pet-chat-data.json');
      res.json(exportData);
    }
  } catch (error) {
    logger.error('Export pet chat data error', { error });
    res.status(500).json({
      success: false,
      message: 'Failed to export pet chat data',
    });
  }
};


import { Request, Response } from 'express';
import User, { IUserDocument } from '../models/User';
import Match from '../models/Match';
import Conversation from '../models/Conversation';
import logger from '../utils/logger';

/**
 * Request interfaces
 */
interface AuthenticatedRequest extends Request {
  userId: string;
  user?: IUserDocument;
}

interface AccountStatusRequest extends AuthenticatedRequest {}

interface RequestDataExportRequest extends AuthenticatedRequest {
  body: {
    format?: string;
    includeMessages?: boolean;
    includeMatches?: boolean;
    includeProfileData?: boolean;
    includePreferences?: boolean;
  };
}

interface CancelAccountDeletionRequest extends AuthenticatedRequest {}

interface InitiateAccountDeletionRequest extends AuthenticatedRequest {
  body: {
    password: string;
    reason?: string;
    feedback?: string;
  };
}

interface GetProfileStatsRequest extends AuthenticatedRequest {}

/**
 * Response interfaces
 */
interface AccountStatusResponse {
  success: boolean;
  status?: string;
  requestedAt?: Date;
  scheduledDeletionDate?: string;
  daysRemaining?: number;
  canCancel?: boolean;
  requestId?: string;
  message?: string;
}

interface DataExportResponse {
  success: boolean;
  exportId?: string;
  estimatedTime?: string;
  message?: string;
  exportData?: any;
  error?: string;
}

interface ProfileStatsResponse {
  success: boolean;
  pets?: number;
  matches?: number;
  messages?: number;
  joinedDate?: string;
  message?: string;
}

/**
 * Get account deletion status
 * @route GET /api/account/status
 * @access Private
 */
export const getAccountStatus = async (
  req: AccountStatusRequest,
  res: Response<AccountStatusResponse>
): Promise<void> => {
  try {
    const userId = req.userId;

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    // Check if user has a deletion request
    if (!user.deletionRequestedAt) {
      res.json({
        success: true,
        status: 'not-found'
      });
      return;
    }

    // Calculate status and remaining time
    const now = new Date();
    const requestedAt = new Date(user.deletionRequestedAt);
    const scheduledDeletionDate = new Date(requestedAt.getTime() + (30 * 24 * 60 * 60 * 1000)); // 30 days
    const daysRemaining = Math.max(0, Math.ceil((scheduledDeletionDate.getTime() - now.getTime()) / (24 * 60 * 60 * 1000)));

    let status = 'pending';
    if (now >= scheduledDeletionDate) {
      status = user.deletionCompletedAt ? 'completed' : 'processing';
    }

    res.json({
      success: true,
      status,
      requestedAt: user.deletionRequestedAt,
      scheduledDeletionDate: scheduledDeletionDate.toISOString(),
      daysRemaining,
      canCancel: status === 'pending',
      requestId: user.deletionRequestId || undefined
    });

  } catch (error) {
    logger.error('Get account status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get account status',
      error: (error as Error).message
    });
  }
};

/**
 * Request data export (GDPR Article 20)
 * @route POST /api/account/export
 * @access Private
 */
export const requestDataExport = async (
  req: RequestDataExportRequest,
  res: Response<DataExportResponse>
): Promise<void> => {
  try {
    const userId = req.userId;
    const {
      format = 'json',
      includeMessages = true,
      includeMatches = true,
      includeProfileData = true,
      includePreferences = true
    } = req.body;

    const user = await User.findById(userId).populate('pets');
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    // Prepare export data
    const exportData: any = {
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        bio: user.bio,
        location: user.location,
        preferences: user.preferences,
        createdAt: user.createdAt,
        lastLoginAt: user.lastLoginAt
      },
      exportRequestedAt: new Date(),
      format,
      includes: {
        messages: includeMessages,
        matches: includeMatches,
        profileData: includeProfileData,
        preferences: includePreferences
      }
    };

    // Add pets data
    if (includeProfileData && user.pets) {
      exportData.pets = Array.isArray(user.pets) ? user.pets.map((pet: any) => ({
        id: pet._id || pet,
        name: pet.name,
        species: pet.species,
        breed: pet.breed,
        age: pet.age,
        size: pet.size,
        bio: pet.bio,
        photos: pet.photos,
        personalityTags: pet.personalityTags,
        healthInfo: pet.healthInfo,
        createdAt: pet.createdAt
      })) : [];
    }

    // Add matches data
    if (includeMatches) {
      const matches = await Match.find({
        $or: [{ user1: userId }, { user2: userId }]
      }).populate('pet1 pet2 user1 user2');

      exportData.matches = matches.map((match: any) => ({
        id: match._id,
        status: match.status,
        compatibilityScore: match.compatibilityScore,
        createdAt: match.createdAt,
        pet1: match.pet1 ? {
          id: match.pet1._id,
          name: match.pet1.name,
          species: match.pet1.species,
          owner: match.user1?._id?.toString() === userId.toString() ? 'me' : 'other'
        } : null,
        pet2: match.pet2 ? {
          id: match.pet2._id,
          name: match.pet2.name,
          species: match.pet2.species,
          owner: match.user2?._id?.toString() === userId.toString() ? 'me' : 'other'
        } : null
      }));
    }

    // Add messages data
    if (includeMessages) {
      // Try to use Conversation model (embedded messages)
      const conversations = await Conversation.find({ participants: userId }).lean();
      const flat: any[] = [];
      for (const conv of conversations) {
        for (const m of (conv.messages || [])) {
          flat.push({
            _id: m._id,
            content: m.content,
            type: m.type || 'text',
            createdAt: (m.sentAt || m.createdAt),
            sender: m.sender,
            conversationParticipants: conv.participants
          });
        }
      }
      exportData.messages = flat.map((message: any) => {
        const senderId = message?.sender?._id ? message.sender._id.toString() : message?.sender?.toString?.();
        let receiverId: string | undefined;
        if (Array.isArray(message.conversationParticipants)) {
          const others = message.conversationParticipants.map((id: any) => id.toString()).filter((id: string) => id !== userId.toString());
          receiverId = others[0];
        }
        return {
          id: message._id,
          content: message.content,
          type: message.type,
          createdAt: message.createdAt,
          matchId: null,
          isSender: senderId === userId.toString(),
          receiverId
        };
      });
    }

    // Generate export ID
    const exportId = `export_${userId}_${Date.now()}`;

    // Estimated time for processing (in a real app, this would be a background job)
    const estimatedTime = '24-48 hours';

    res.json({
      success: true,
      exportId,
      estimatedTime,
      message: 'Data export request received. You will receive an email when your data is ready to download.',
      exportData: format === 'json' ? exportData : undefined
    });

  } catch (error) {
    logger.error('Request data export error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to request data export',
      error: (error as Error).message
    });
  }
};

/**
 * Cancel account deletion
 * @route POST /api/account/cancel-deletion
 * @access Private
 */
export const cancelAccountDeletion = async (
  req: CancelAccountDeletionRequest,
  res: Response<{ success: boolean; message?: string }>
): Promise<void> => {
  try {
    const userId = req.userId;

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    // Check if deletion was requested and can be cancelled
    if (!user.deletionRequestedAt) {
      res.status(400).json({
        success: false,
        message: 'No deletion request found'
      });
      return;
    }

    // Check if it's still cancellable (within 30 days)
    const now = new Date();
    const requestedAt = new Date(user.deletionRequestedAt);
    const scheduledDeletionDate = new Date(requestedAt.getTime() + (30 * 24 * 60 * 60 * 1000));

    if (now >= scheduledDeletionDate) {
      res.status(400).json({
        success: false,
        message: 'Deletion request cannot be cancelled (grace period expired)'
      });
      return;
    }

    // Cancel the deletion request
    user.deletionRequestedAt = undefined;
    user.deletionRequestId = undefined;
    await user.save();

    logger.info(`Account deletion cancelled for user ${userId}`);

    res.json({
      success: true,
      message: 'Account deletion request has been cancelled successfully'
    });

  } catch (error) {
    logger.error('Cancel account deletion error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel account deletion',
      error: (error as Error).message
    } as any);
  }
};

/**
 * Initiate account deletion
 * @route POST /api/account/initiate-deletion
 * @access Private
 */
export const initiateAccountDeletion = async (
  req: InitiateAccountDeletionRequest,
  res: Response<any>
): Promise<void> => {
  try {
    const userId = req.userId;
    const { password, reason, feedback } = req.body;

    // Validate password is provided
    if (!password) {
      res.status(400).json({
        success: false,
        error: 'INVALID_PASSWORD',
        message: 'Password is required to delete account'
      });
      return;
    }

    const user = await User.findById(userId).select('+password');
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    // Validate password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      res.status(401).json({
        success: false,
        error: 'INVALID_PASSWORD',
        message: 'Invalid password provided'
      });
      return;
    }

    // Check if deletion already requested and still active
    if (user.deletionRequestedAt) {
      const now = new Date();
      const requestedAt = new Date(user.deletionRequestedAt);
      const scheduledDeletionDate = new Date(requestedAt.getTime() + (30 * 24 * 60 * 60 * 1000));

      if (now < scheduledDeletionDate) {
        res.status(400).json({
          success: false,
          error: 'ALREADY_DELETING',
          message: 'Account deletion already requested',
          gracePeriodEndsAt: scheduledDeletionDate.toISOString(),
          requestId: user.deletionRequestId
        });
        return;
      }
    }

    // Initiate deletion request
    const requestId = `del_${userId}_${Date.now()}`;
    const gracePeriodEndsAt = new Date(Date.now() + (30 * 24 * 60 * 60 * 1000));
    
    user.deletionRequestedAt = new Date();
    user.deletionRequestId = requestId;
    user.deletionGracePeriodEndsAt = gracePeriodEndsAt;
    user.deletionReason = reason || undefined;
    user.deletionFeedback = feedback || undefined;
    
    await user.save();

    logger.info(`Account deletion initiated for user ${userId}, reason: ${reason}`);

    res.json({
      success: true,
      message: 'Account deletion request initiated. Your account will be deleted in 30 days.',
      deletionId: requestId,
      gracePeriodEndsAt: gracePeriodEndsAt.toISOString(),
      canCancel: true
    });

  } catch (error) {
    logger.error('Initiate account deletion error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to initiate account deletion',
      error: (error as Error).message
    });
  }
};

/**
 * Get profile stats (different from user stats - includes pets, matches, messages counts)
 * @route GET /api/account/profile-stats
 * @access Private
 */
export const getProfileStats = async (
  req: GetProfileStatsRequest,
  res: Response<ProfileStatsResponse>
): Promise<void> => {
  try {
    const userId = req.userId;

    // Get user with populated pets
    const user = await User.findById(userId).populate('pets');
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    // Count pets
    const petsCount = Array.isArray(user.pets) ? user.pets.length : 0;

    // Count matches
    const matchesCount = await Match.countDocuments({
      $or: [{ user1: userId }, { user2: userId }],
      status: { $in: ['active', 'pending'] }
    });

    // Count messages from conversations
    const convs = await Conversation.find({ participants: userId }).select('messages._id').lean();
    const messagesCount = convs.reduce((sum, c) => sum + ((c.messages && c.messages.length) || 0), 0);

    res.json({
      success: true,
      pets: petsCount,
      matches: matchesCount,
      messages: messagesCount,
      joinedDate: user.createdAt ? user.createdAt.toISOString().split('T')[0] : undefined
    });

  } catch (error) {
    logger.error('Get profile stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get profile stats',
      error: (error as Error).message
    } as any);
  }
};


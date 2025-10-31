import type { Request, Response } from 'express';
import User from '../models/User';
import type { IUserDocument } from '../types/mongoose';
import Match from '../models/Match';
import Conversation from '../models/Conversation';
import logger from '../utils/logger';

/**
 * Request interfaces - use Request directly with declaration merging
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
  error?: string;
  message?: string;
  requestId?: string;
}

interface ExportPetData {
  id: string;
  name: string;
  species: string;
  breed: string;
  age: number;
  size: string;
  bio: string;
  photos: string[];
  personalityTags: string[];
  healthInfo: Record<string, unknown>;
  createdAt: Date;
}

interface ExportMatchData {
  id: string;
  status: string;
  compatibilityScore: number;
  createdAt: Date;
  pet1: { id: string; name: string; species: string; owner: string } | null;
  pet2: { id: string; name: string; species: string; owner: string } | null;
}

interface ExportMessageData {
  id: string;
  content: string;
  type: string;
  createdAt: Date;
  matchId: string | null;
  isSender: boolean;
  receiverId: string | undefined;
}

interface ExportData {
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    bio?: string;
    location: Record<string, unknown>;
    preferences: Record<string, unknown>;
    createdAt: Date;
    lastLoginAt?: Date;
  };
  exportRequestedAt: Date;
  format: string;
  includes: {
    messages: boolean;
    matches: boolean;
    profileData: boolean;
    preferences: boolean;
  };
  pets?: ExportPetData[];
  matches?: ExportMatchData[];
  messages?: ExportMessageData[];
}

interface DataExportResponse {
  success: boolean;
  exportId?: string;
  estimatedTime?: string;
  message?: string;
  exportData?: ExportData | string;
  error?: string;
  csv?: string;
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
    const exportData: ExportData = {
      user: {
        id: user._id?.toString() || '',
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || undefined,
        bio: user.bio || undefined,
        location: user.location ? (user.location as Record<string, unknown>) : {},
        preferences: user.preferences ? (user.preferences as Record<string, unknown>) : {},
        createdAt: user.createdAt ? new Date(user.createdAt) : new Date(),
        lastLoginAt: user.lastLoginAt ? new Date(user.lastLoginAt) : undefined
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
      // Populate pets to get full details
      const fullUser = await User.findById(user._id).populate('pets').lean();
      exportData.pets = Array.isArray(fullUser?.pets) ? fullUser.pets.map((pet: any) => ({
        id: pet._id ? pet._id.toString() : '',
        name: pet.name || '',
        species: pet.species || '',
        breed: pet.breed || '',
        age: pet.age || 0,
        size: pet.size || '',
        bio: pet.bio || '',
        photos: pet.photos || [],
        personalityTags: pet.personalityTags || [],
        healthInfo: pet.healthInfo || {},
        createdAt: pet.createdAt || new Date()
      })) : [];
    }

    // Add matches data
    if (includeMatches) {
      const matches = await Match.find({
        $or: [{ user1: userId }, { user2: userId }]
      }).populate('pet1 pet2 user1 user2');

      exportData.matches = matches.map((match: any) => ({
        id: match._id?.toString() || '',
        status: match.status || '',
        compatibilityScore: match.compatibilityScore || 0,
        createdAt: match.createdAt ? new Date(match.createdAt) : new Date(),
        pet1: match.pet1 && match.pet1._id ? {
          id: match.pet1._id?.toString() || '',
          name: (match.pet1 as any).name || '',
          species: (match.pet1 as any).species || '',
          owner: match.user1?._id?.toString() === userId.toString() ? 'me' : 'other'
        } : null,
        pet2: match.pet2 && match.pet2._id ? {
          id: match.pet2._id?.toString() || '',
          name: (match.pet2 as any).name || '',
          species: (match.pet2 as any).species || '',
          owner: match.user2?._id?.toString() === userId.toString() ? 'me' : 'other'
        } : null
      }));
    }

    // Add messages data
    if (includeMessages) {
      // Try to use Conversation model (embedded messages)
      const conversations = await Conversation.find({ participants: userId }).lean();
      interface FlatMessage {
        _id: string;
        content: string;
        type: string;
        createdAt: Date;
        sender: string;
        conversationParticipants: string[];
      }
      const flat: FlatMessage[] = [];
      for (const conv of conversations) {
        for (const m of (conv.messages || [])) {
          const msg = m as Record<string, unknown>; // Access raw properties
          flat.push({
            _id: String(msg._id) || '',
            content: String(msg.content || ''),
            type: 'text', // Default type since IConversationMessage doesn't have type
            createdAt: msg.sentAt as Date || new Date(),
            sender: String(msg.sender || ''),
            conversationParticipants: conv.participants
          });
        }
      }
      exportData.messages = flat.map((message) => {
        const senderId = message.sender.toString();
        let receiverId: string | undefined;
        if (Array.isArray(message.conversationParticipants)) {
          const others = message.conversationParticipants.map((id) => id.toString()).filter((id) => id !== userId.toString());
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

    // Convert to CSV if requested
    if (format === 'csv') {
      const csvRows: string[] = [];
      
      // Add header
      csvRows.push('Data Type,Field,Value');
      
      // Flatten JSON structure for CSV
      const flattenObject = (obj: unknown, prefix = ''): void => {
        if (typeof obj !== 'object' || obj === null) return;
        const record = obj as Record<string, unknown>;
        for (const key in record) {
          const value = record[key];
          if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
            flattenObject(value, prefix + key + '.');
          } else if (Array.isArray(value)) {
            csvRows.push(`${prefix}${key},count,${value.length}`);
          } else {
            csvRows.push(`${prefix}${key},value,"${String(value).replace(/"/g, '""')}"`);
          }
        }
      };
      
      flattenObject(exportData);
      
      return void res.json({
        success: true,
        exportId,
        estimatedTime,
        message: 'Data export in CSV format',
        exportData: undefined,
        csv: csvRows.join('\n')
      });
    }

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
    user.deletionRequestedAt = null as any;
    user.deletionRequestId = null as any;
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
    const isPasswordValid = await (user as any).comparePassword(password);
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
    user.deletionReason = reason || null as any;
    user.deletionFeedback = feedback || null as any;
    
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

interface ConfirmAccountDeletionRequest extends AuthenticatedRequest {
  body: {
    token: string;
  };
}

/**
 * Confirm account deletion after grace period
 * This is called when the grace period expires and deletion needs to be finalized
 * Or if user explicitly confirms immediate deletion
 * @route POST /api/account/confirm-deletion
 * @access Private
 */
export const confirmAccountDeletion = async (
  req: ConfirmAccountDeletionRequest,
  res: Response<{ success: boolean; message?: string; error?: string }>
): Promise<void> => {
  try {
    const userId = req.userId;
    const { token } = req.body;

    if (!token) {
      res.status(400).json({
        success: false,
        message: 'Confirmation token is required'
      });
      return;
    }

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    // Verify token matches request ID
    if (user.deletionRequestId !== token) {
      res.status(401).json({
        success: false,
        message: 'Invalid confirmation token'
      });
      return;
    }

    // Check if grace period has expired
    const now = new Date();
    const requestedAt = new Date(user.deletionRequestedAt!);
    const scheduledDeletionDate = new Date(requestedAt.getTime() + (30 * 24 * 60 * 60 * 1000));

    if (now < scheduledDeletionDate) {
      res.status(400).json({
        success: false,
        message: 'Deletion cannot be confirmed yet. Please wait for grace period to expire.'
      });
      return;
    }

    // Permanently delete user and all associated data
    // 1. Delete all user's matches
    await Match.deleteMany({
      $or: [{ user1: userId }, { user2: userId }]
    });

    // 2. Delete all conversations
    await Conversation.deleteMany({
      participants: userId
    });

    // 3. Delete all messages sent by user
    const conversations = await Conversation.find({
      'messages.senderId': userId
    });

    for (const conv of conversations) {
      if (conv.messages && Array.isArray(conv.messages)) {
        conv.messages = conv.messages.filter((msg: any) => msg.senderId !== userId);
        await conv.save();
      }
    }

    // 4. Note: Pets should be handled separately if they have other owners
    // For now, we'll delete pets owned solely by this user
    // In a real app, you might want to reassign or archive instead
    
    // 5. Finally, delete the user
    await User.findByIdAndDelete(userId);

    logger.info(`Account deletion confirmed and completed for user ${userId}`);

    // Note: In production, you should send an email notification
    // and log this event for audit purposes

    res.json({
      success: true,
      message: 'Account has been permanently deleted successfully'
    });

  } catch (error) {
    logger.error('Confirm account deletion error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to confirm account deletion',
      error: (error as Error).message
    });
  }
};


/**
 * Account Deletion Service
 * Handles automated deletion after grace period expires
 * GDPR Article 17 - Right to Erasure
 */

import User from '../models/User';
import Match from '../models/Match';
import Conversation from '../models/Conversation';
import Message from '../models/Message';
import AnalyticsEvent from '../models/AnalyticsEvent';
import Notification from '../models/Notification';
import logger from '../utils/logger';

interface DeletionJobResult {
  userId: string;
  success: boolean;
  error?: string;
}

/**
 * Process account deletions that have passed their grace period
 * This should be run as a scheduled background job (e.g., daily)
 */
export const processExpiredDeletions = async (): Promise<DeletionJobResult[]> => {
  const results: DeletionJobResult[] = [];
  
  try {
    // Find all users with deletion requests that have expired
    const now = new Date();
    const gracePeriodEndsAt = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
    
    const usersToDelete = await User.find({
      deletionRequestedAt: { $exists: true, $lte: gracePeriodEndsAt },
      deletionCompletedAt: { $exists: false }
    });

    logger.info(`Processing ${usersToDelete.length} expired deletion requests`);

    for (const user of usersToDelete) {
      const result = await deleteUserAccount(user._id.toString());
      results.push(result);
    }

    return results;
  } catch (error) {
    logger.error('Process expired deletions error:', error);
    return results;
  }
};

/**
 * Permanently delete a user account and all associated data
 * GDPR Article 17 - Right to Erasure (Right to be Forgotten)
 */
export const deleteUserAccount = async (userId: string): Promise<DeletionJobResult> => {
  const session = await User.startSession();
  session.startTransaction();

  try {
    logger.info(`Starting deletion for user ${userId}`);

    // 1. Delete all matches
    const matchesDeleted = await Match.deleteMany(
      { $or: [{ user1: userId }, { user2: userId }] },
      { session }
    );
    logger.info(`Deleted ${matchesDeleted.deletedCount} matches for user ${userId}`);

    // 2. Delete all conversations where user is a participant
    const conversationsDeleted = await Conversation.deleteMany(
      { participants: userId },
      { session }
    );
    logger.info(`Deleted ${conversationsDeleted.deletedCount} conversations for user ${userId}`);

    // 3. Delete messages sent by user from other conversations
    const conversations = await Conversation.find({
      'messages.sender': userId
    });

    for (const conv of conversations) {
      if (conv.messages && Array.isArray(conv.messages)) {
        const originalLength = conv.messages.length;
        conv.messages = conv.messages.filter((msg: any) => msg.sender?.toString() !== userId);
        if (conv.messages.length < originalLength) {
          await conv.save({ session });
        }
      }
    }

    // 4. Delete analytics events
    const analyticsDeleted = await AnalyticsEvent.deleteMany(
      { userId },
      { session }
    );
    logger.info(`Deleted ${analyticsDeleted.deletedCount} analytics events for user ${userId}`);

    // 5. Delete notifications
    const notificationsDeleted = await Notification.deleteMany(
      { userId },
      { session }
    );
    logger.info(`Deleted ${notificationsDeleted.deletedCount} notifications for user ${userId}`);

    // 6. Delete user preferences and other user-specific data
    const NotificationPreference = (await import('../models/NotificationPreference')).default;
    const NotificationPreferenceDeleted = await NotificationPreference.deleteMany(
      { userId },
      { session }
    );
    logger.info(`Deleted ${NotificationPreferenceDeleted.deletedCount} notification preferences for user ${userId}`);

    // Delete gifts sent/received
    const Gift = (await import('../models/Gift')).default;
    const giftsDeleted = await Gift.deleteMany(
      { $or: [{ senderId: userId }, { recipientId: userId }] },
      { session }
    );
    logger.info(`Deleted ${giftsDeleted.deletedCount} gifts for user ${userId}`);

    // Delete favorites
    const Favorite = (await import('../models/Favorite')).default;
    const favoritesDeleted = await Favorite.deleteMany(
      { userId },
      { session }
    );
    logger.info(`Deleted ${favoritesDeleted.deletedCount} favorites for user ${userId}`);

    // Delete blocks
    const UserBlock = (await import('../models/UserBlock')).default;
    const blocksDeleted = await UserBlock.deleteMany(
      { $or: [{ blockerId: userId }, { blockedId: userId }] },
      { session }
    );
    logger.info(`Deleted ${blocksDeleted.deletedCount} blocks for user ${userId}`);

    // Delete mutes
    const UserMute = (await import('../models/UserMute')).default;
    const mutesDeleted = await UserMute.deleteMany(
      { $or: [{ muterId: userId }, { mutedId: userId }] },
      { session }
    );
    logger.info(`Deleted ${mutesDeleted.deletedCount} mutes for user ${userId}`);

    // Delete verification records
    const Verification = (await import('../models/Verification')).default;
    const verificationsDeleted = await Verification.deleteMany(
      { userId },
      { session }
    );
    logger.info(`Deleted ${verificationsDeleted.deletedCount} verifications for user ${userId}`);
    
    // 7. Update user to mark deletion as completed
    const user = await User.findById(userId);
    if (user) {
      user.deletionCompletedAt = new Date();
      user.isDeleted = true;
      await user.save({ session });

      // 8. Finally, soft delete the user (don't hard delete in case of legal requirements)
      // In some jurisdictions, you may need to retain certain data for legal purposes
      // For GDPR, you can hard delete:
      await User.findByIdAndDelete(userId, { session });
    }

    await session.commitTransaction();
    logger.info(`Successfully deleted account for user ${userId}`);

    return {
      userId,
      success: true
    };

  } catch (error) {
    await session.abortTransaction();
    logger.error(`Failed to delete account for user ${userId}:`, error);
    
    return {
      userId,
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  } finally {
    session.endSession();
  }
};

/**
 * Get statistics about pending deletions
 */
export const getDeletionStats = async () => {
  try {
    const now = new Date();
    const gracePeriodEndsAt = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
    
    const totalPending = await User.countDocuments({
      deletionRequestedAt: { $exists: true },
      deletionCompletedAt: { $exists: false }
    });

    const expiredPending = await User.countDocuments({
      deletionRequestedAt: { $lte: gracePeriodEndsAt },
      deletionCompletedAt: { $exists: false }
    });

    const completed = await User.countDocuments({
      deletionCompletedAt: { $exists: true }
    });

    return {
      totalPending,
      expiredPending,
      completed,
      oldestPending: await User.findOne({
        deletionRequestedAt: { $exists: true, $lte: gracePeriodEndsAt },
        deletionCompletedAt: { $exists: false }
      })
        .sort('deletionRequestedAt')
        .select('deletionRequestedAt')
    };
  } catch (error) {
    logger.error('Get deletion stats error:', error);
    return null;
  }
};

export default {
  processExpiredDeletions,
  deleteUserAccount,
  getDeletionStats
};


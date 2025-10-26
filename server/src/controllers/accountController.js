const User = require('../models/User');
const Match = require('../models/Match');
let Message;
try {
  // Optional dependency: some environments/tests don't ship a standalone Message model
  Message = require('../models/Message');
} catch {
  Message = null;
}
const Conversation = require('../models/Conversation');
const logger = require('../utils/logger');

// Get account deletion status
const getAccountStatus = async (req, res) => {
  try {
    const userId = req.userId;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if user has a deletion request
    if (!user.deletionRequestedAt) {
      return res.json({
        success: true,
        status: 'not-found'
      });
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
      requestId: user.deletionRequestId
    });

  } catch (error) {
    logger.error('Get account status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get account status',
      error: error.message
    });
  }
};

// Request data export (GDPR Article 20)
const requestDataExport = async (req, res) => {
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
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Prepare export data
    const exportData = {
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
      exportData.pets = user.pets.map(pet => ({
        id: pet._id,
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
      }));
    }

    // Add matches data
    if (includeMatches) {
      const matches = await Match.find({
        $or: [{ user1: userId }, { user2: userId }]
      }).populate('pet1 pet2 user1 user2');

      exportData.matches = matches.map(match => ({
        id: match._id,
        status: match.status,
        compatibilityScore: match.compatibilityScore,
        createdAt: match.createdAt,
        pet1: match.pet1 ? {
          id: match.pet1._id,
          name: match.pet1.name,
          species: match.pet1.species,
          owner: match.user1._id.toString() === userId.toString() ? 'me' : 'other'
        } : null,
        pet2: match.pet2 ? {
          id: match.pet2._id,
          name: match.pet2.name,
          species: match.pet2.species,
          owner: match.user2._id.toString() === userId.toString() ? 'me' : 'other'
        } : null
      }));
    }

    // Add messages data
    if (includeMessages) {
      if (Message && typeof Message.find === 'function') {
        const messages = await Message.find({
          $or: [{ sender: userId }, { receiver: userId }]
        }).populate('sender receiver match');

        exportData.messages = messages.map(message => {
          const senderId = message?.sender?._id ? message.sender._id.toString() : message?.sender?.toString?.();
          return {
            id: message._id,
            content: message.content,
            type: message.type,
            createdAt: message.createdAt,
            matchId: message.match ? (message.match._id || message.match) : null,
            isSender: senderId === userId.toString()
          };
        });
      } else {
        // Fallback: infer messages from Conversation embedded documents
        const conversations = await Conversation.find({ participants: userId }).lean();
        const flat = [];
        for (const conv of conversations) {
          for (const m of (conv.messages || [])) {
            flat.push({
              _id: m._id,
              content: m.content,
              type: m.type,
              createdAt: m.sentAt || m.createdAt,
              sender: m.sender,
              conversationParticipants: conv.participants
            });
          }
        }
        exportData.messages = flat.map(message => {
          const senderId = message?.sender?._id ? message.sender._id.toString() : message?.sender?.toString?.();
          let receiverId;
          if (Array.isArray(message.conversationParticipants)) {
            const others = message.conversationParticipants.map(id => id.toString()).filter(id => id !== userId.toString());
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
    }

    // Generate export ID
    const exportId = `export_${userId}_${Date.now()}`;

    // Store export request (in a real app, you'd queue this for processing)
    // For now, we'll simulate immediate completion
    const estimatedTime = '24-48 hours';

    // TODO: Implement actual export processing (email delivery, file generation, etc.)

    res.json({
      success: true,
      exportId,
      estimatedTime,
      message: 'Data export request received. You will receive an email when your data is ready to download.',
      exportData: format === 'json' ? exportData : undefined // Only return data immediately for JSON format
    });

  } catch (error) {
    logger.error('Request data export error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to request data export',
      error: error.message
    });
  }
};

// Cancel account deletion
const cancelAccountDeletion = async (req, res) => {
  try {
    const userId = req.userId;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if deletion was requested and can be cancelled
    if (!user.deletionRequestedAt) {
      return res.status(400).json({
        success: false,
        message: 'No deletion request found'
      });
    }

    // Check if it's still cancellable (within 30 days)
    const now = new Date();
    const requestedAt = new Date(user.deletionRequestedAt);
    const scheduledDeletionDate = new Date(requestedAt.getTime() + (30 * 24 * 60 * 60 * 1000));

    if (now >= scheduledDeletionDate) {
      return res.status(400).json({
        success: false,
        message: 'Deletion request cannot be cancelled (grace period expired)'
      });
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
      error: error.message
    });
  }
};

// Initiate account deletion
const initiateAccountDeletion = async (req, res) => {
  try {
    const userId = req.userId;
    const { password, reason, feedback } = req.body;

    // Validate password is provided
    if (!password) {
      return res.status(400).json({
        success: false,
        error: 'INVALID_PASSWORD',
        message: 'Password is required to delete account'
      });
    }

    const user = await User.findById(userId).select('+password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Validate password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: 'INVALID_PASSWORD',
        message: 'Invalid password provided'
      });
    }

    // Check if deletion already requested
    if (user.deletionRequestedAt) {
      const now = new Date();
      const requestedAt = new Date(user.deletionRequestedAt);
      const scheduledDeletionDate = new Date(requestedAt.getTime() + (30 * 24 * 60 * 60 * 1000));

      if (now < scheduledDeletionDate) {
        return res.json({
          success: true,
          message: 'Account deletion already requested',
          scheduledDeletionDate: scheduledDeletionDate.toISOString(),
          canCancel: true,
          requestId: user.deletionRequestId
        });
      }
    }

    // Check if deletion already requested
    if (user.deletionRequestedAt) {
      const now = new Date();
      const requestedAt = new Date(user.deletionRequestedAt);
      const scheduledDeletionDate = new Date(requestedAt.getTime() + (30 * 24 * 60 * 60 * 1000));

      if (now < scheduledDeletionDate) {
        return res.status(400).json({
          success: false,
          error: 'ALREADY_DELETING',
          message: 'Account deletion already requested',
          gracePeriodEndsAt: scheduledDeletionDate.toISOString(),
          requestId: user.deletionRequestId
        });
      }
    }

    // Initiate deletion request
    const requestId = `del_${userId}_${Date.now()}`;
    const gracePeriodEndsAt = new Date(Date.now() + (30 * 24 * 60 * 60 * 1000));
    
    user.deletionRequestedAt = new Date();
    user.deletionRequestId = requestId;
    user.deletionGracePeriodEndsAt = gracePeriodEndsAt;
    user.deletionReason = reason || null;
    user.deletionFeedback = feedback || null;
    
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
      error: error.message
    });
  }
};

// Get profile stats (different from user stats - includes pets, matches, messages counts)
const getProfileStats = async (req, res) => {
  try {
    const userId = req.userId;

    // Get user with populated pets
    const user = await User.findById(userId).populate('pets');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Count pets
    const petsCount = user.pets ? user.pets.length : 0;

    // Count matches
    const matchesCount = await Match.countDocuments({
      $or: [{ user1: userId }, { user2: userId }],
      status: { $in: ['active', 'pending'] }
    });

    // Count messages
    let messagesCount = 0;
    if (Message && typeof Message.countDocuments === 'function') {
      messagesCount = await Message.countDocuments({
        $or: [{ sender: userId }, { receiver: userId }]
      });
    } else {
      // Fallback: count embedded messages across user's conversations
      const convs = await Conversation.find({ participants: userId }).select('messages._id').lean();
      messagesCount = convs.reduce((sum, c) => sum + ((c.messages && c.messages.length) || 0), 0);
    }

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
      error: error.message
    });
  }
};

module.exports = {
  getAccountStatus,
  requestDataExport,
  cancelAccountDeletion,
  initiateAccountDeletion,
  getProfileStats
};

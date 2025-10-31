import type { Request, Response } from 'express';
import type { IUserDocument } from '../types/mongoose';
import Match from '../models/Match';
import User from '../models/User';
import Pet from '../models/Pet';
import { sendEmail } from '../services/emailService';
import { getAIRecommendations } from '../services/aiService';
import logger from '../utils/logger';

/**
 * Request interfaces
 */
interface AuthenticatedRequest extends Request {
  userId: string;
  user?: IUserDocument;
}

interface GetRecommendationsRequest extends AuthenticatedRequest {
  query: {
    species?: string;
    minAge?: string;
    maxAge?: string;
    size?: string;
    intent?: string;
    distance?: string;
    breed?: string;
    limit?: string;
  };
}

interface RecordSwipeRequest extends AuthenticatedRequest {
  body: {
    petId: string;
    action: 'like' | 'pass' | 'superlike';
  };
}

interface GetMatchesRequest extends AuthenticatedRequest {
  query: {
    status?: string;
    page?: string;
    limit?: string;
    sortBy?: string;
    order?: string;
    q?: string;
    species?: string;
    minDist?: string;
    maxDist?: string;
    sort?: string;
  };
}

interface GetMatchRequest extends AuthenticatedRequest {
  params: {
    matchId: string;
  };
}

interface GetMessagesRequest extends AuthenticatedRequest {
  params: {
    matchId: string;
  };
  query: {
    page?: string;
    limit?: string;
  };
}

interface SendMessageRequest extends AuthenticatedRequest {
  params: {
    matchId: string;
  };
  body: {
    content: string;
    messageType?: string;
    attachments?: Array<{
      type: 'image' | 'video' | 'file';
      url: string;
      filename?: string;
      mimeType?: string;
      size?: number;
    }>;
  };
}

interface ArchiveMatchRequest extends AuthenticatedRequest {
  params: {
    matchId: string;
  };
}

interface BlockMatchRequest extends AuthenticatedRequest {
  params: {
    matchId: string;
  };
}

interface FavoriteMatchRequest extends AuthenticatedRequest {
  params: {
    matchId: string;
  };
}

interface GetMatchStatsRequest extends AuthenticatedRequest {}

/**
 * @desc    Get pet recommendations for swiping
 * @route   GET /api/matches/recommendations
 * @access  Private
 */
export const getRecommendations = async (
  req: GetRecommendationsRequest,
  res: Response
): Promise<void> => {
  try {
    const {
      species,
      minAge,
      maxAge,
      size,
      intent,
      distance,
      breed,
      limit = '20'
    } = req.query;

    // Build filter object
    const filters: {
      species?: string;
      minAge?: number;
      maxAge?: number;
      size?: string;
      intent?: string;
      distance?: number;
      breed?: string;
    } = {};
    if (species) filters.species = species;
    if (minAge) filters.minAge = parseInt(minAge);
    if (maxAge) filters.maxAge = parseInt(maxAge);
    if (size) filters.size = size;
    if (intent) filters.intent = intent;
    if (distance) filters.distance = parseInt(distance);
    if (breed) filters.breed = breed;

    // Get AI-powered recommendations  
    const petIds: string[] = [];
    const recommendations = await getAIRecommendations(
      req.userId,
      petIds
    );

    res.json({
      success: true,
      data: recommendations,
      count: recommendations.length
    });

  } catch (error) {
    logger.error('Get recommendations error', { error, userId: req.userId });
    res.status(500).json({
      success: false,
      message: 'Failed to get recommendations'
    });
  }
};

/**
 * @desc    Record swipe action
 * @route   POST /api/matches/swipe
 * @access  Private
 */
export const recordSwipe = async (
  req: RecordSwipeRequest,
  res: Response
): Promise<void> => {
  try {
    const { petId, action } = req.body;

    if (!['like', 'pass', 'superlike'].includes(action)) {
      res.status(400).json({
        success: false,
        message: 'Invalid action. Must be like, pass, or superlike'
      });
      return;
    }

    // Check premium limits for swipes
    const user = await User.findById(req.userId);
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    // Check swipe limits for non-premium users - Business Model: 5 daily swipes for free users
    if (!user.premium?.isActive && !user.premium?.features?.unlimitedLikes) {
      const swipesLimit = user.premium?.usage?.swipesLimit || 5; // Default to 5 for free users
      const swipesUsed = user.premium?.usage?.swipesUsed || 0;
      
      // Get today's swipes count (reset daily)
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const swipesToday = user.swipedPets?.filter((swipe: { swipedAt: Date }) => {
        const swipeDate = new Date(swipe.swipedAt);
        return swipeDate >= today;
      }).length || 0;

      if (swipesToday >= swipesLimit) {
        res.status(403).json({
          success: false,
          message: `Daily swipe limit reached (${swipesLimit}/day). Upgrade to premium for unlimited swipes.`,
          code: 'SWIPE_LIMIT_EXCEEDED',
          currentLimit: swipesLimit,
          usedToday: swipesToday
        });
        return;
      }
    }

    // Check superlike limits - Business Model: Free users need to purchase via IAP
    if (action === 'superlike') {
      const isPremium = user.premium?.isActive &&
        (!user.premium.expiresAt || new Date(user.premium.expiresAt) > new Date());
      
      // Premium users have unlimited super likes (but can still purchase more)
      // Free users must have IAP balance
      if (!isPremium || !user.premium?.features?.unlimitedLikes) {
        // Check IAP balance for super likes
        const iapSuperLikes = user.premium?.usage?.iapSuperLikes || 0;
        
        if (iapSuperLikes <= 0) {
          res.status(403).json({
            success: false,
            message: 'No Super Likes remaining. Purchase more from the Premium screen.',
            code: 'SUPERLIKE_INSUFFICIENT_BALANCE',
            canPurchase: true,
            balance: iapSuperLikes,
          });
          return;
        }
        
        // Deduct IAP super like balance
        user.premium.usage = user.premium.usage || {
          swipesUsed: 0,
          swipesLimit: 5,
          superLikesUsed: 0,
          superLikesLimit: 0,
          boostsUsed: 0,
          boostsLimit: 0,
          messagesSent: 0,
          profileViews: 0,
          rewindsUsed: 0,
          iapSuperLikes: 0,
          iapBoosts: 0,
        };
        
        user.premium.usage.iapSuperLikes = Math.max(0, iapSuperLikes - 1);
      }
    }

    // Record the swipe in user's preferences/analytics
    const updateData: {
      $push: Record<string, unknown>;
      $inc: Record<string, number>;
      $set: Record<string, unknown>;
    } = {
      $push: {
        'analytics.events': {
          type: 'swipe',
          petId,
          action,
          timestamp: new Date()
        }
      },
      $inc: {
        'analytics.totalSwipes': 1,
        [`analytics.total${action.charAt(0).toUpperCase() + action.slice(1)}s`]: 1,
        'premium.usage.swipesUsed': action !== 'superlike' ? 1 : 0,
        'premium.usage.superLikesUsed': action === 'superlike' ? 1 : 0
      },
      $set: {
        'analytics.lastActive': new Date()
      }
    };

    await User.findByIdAndUpdate(req.userId, updateData);

    // If it's a like or superlike, check for mutual match
    let matchCreated = false;
    let matchId = null;

    if (action === 'like' || action === 'superlike') {
      // Check if the pet's owner has liked this user back
      const pet = await Pet.findById(petId).populate('owner');
      if (pet && pet.owner) {
        const existingLike = await User.findOne({
          _id: pet.owner._id,
          'swipedPets.petId': req.userId,
          'swipedPets.action': { $in: ['like', 'superlike'] }
        });

        if (existingLike) {
          // Create a match
          const match = new Match({
            pet1: petId,
            user1: pet.owner._id,
            pet2: req.user?.pets?.[0] || null,
            user2: req.userId,
            initiatedBy: req.userId,
            status: 'active' as 'active' | 'pending' | 'expired' | 'blocked'
          });

          await match.save();

          matchCreated = true;
          matchId = match._id;

          // Update both users
          await User.findByIdAndUpdate(pet.owner._id, {
            $push: { matches: match._id },
            $inc: { 'analytics.totalMatches': 1 }
          });

          await User.findByIdAndUpdate(req.userId, {
            $push: { matches: match._id },
            $inc: { 'analytics.totalMatches': 1 }
          });
        }
      }
    }

    res.json({
      success: true,
      data: {
        action,
        petId,
        matchCreated,
        matchId
      }
    });

  } catch (error) {
    logger.error('Record swipe error', { error, userId: req.userId });
    res.status(500).json({
      success: false,
      message: 'Failed to record swipe'
    });
  }
};

/**
 * @desc    Get user's matches with search/filter/sort
 * @route   GET /api/matches
 * @access  Private
 */
export const getMatches = async (
  req: GetMatchesRequest,
  res: Response
): Promise<void> => {
  try {
    const {
      status = 'active',
      page = '1',
      limit = '20',
      sortBy = 'lastActivity',
      order = 'desc',
      q,
      species,
      minDist,
      maxDist,
      sort
    } = req.query;

    const query: {
      $or: Array<{ user1: string } | { user2: string }>;
      status?: string;
    } = {
      $or: [{ user1: req.userId }, { user2: req.userId }],
      status
    };

    const sortOrder = order === 'desc' ? -1 : 1;
    const sortField = sortBy === 'lastActivity' ? 'lastActivity' : 'createdAt';

    // Build aggregation pipeline - lookup pets first to enable filtering
    const pipeline: Record<string, unknown>[] = [
      { $match: query },
      // Join pets early for filtering
      { $lookup: { from: "pets", localField: "pet1", foreignField: "_id", as: "pet1" } },
      { $lookup: { from: "pets", localField: "pet2", foreignField: "_id", as: "pet2" } },
      { $unwind: "$pet1" },
      { $unwind: "$pet2" },
      {
        $addFields: {
          isArchivedByCurrentUser: {
            $cond: {
              if: { $eq: ['$user1', req.userId] },
              then: '$userActions.user1.isArchived',
              else: '$userActions.user2.isArchived'
            }
          },
          unreadCount: {
            $size: {
              $filter: {
                input: '$messages',
                cond: {
                  $and: [
                    { $ne: ['$$this.sender', req.userId] },
                    {
                      $not: {
                        $in: [req.userId, '$$this.readBy.user']
                      }
                    }
                  ]
                }
              }
            }
          }
        }
      },
      {
        $match: {
          isArchivedByCurrentUser: status === 'archived' ? true : { $ne: true }
        }
      }
    ];

    // Apply species filter if provided
    if (species) {
      pipeline.push({
        $match: {
          $or: [{ "pet1.species": species }, { "pet2.species": species }]
        }
      });
    }

    // Apply search filter if provided
    if (q) {
      pipeline.push({
        $match: {
          $or: [
            { "pet1.name": { $regex: q, $options: "i" } },
            { "pet2.name": { $regex: q, $options: "i" } }
          ]
        }
      });
    }

    // Distance filter (if location is available)
    // Note: This requires user location to be stored in the user model
    if (minDist || maxDist) {
      // For now, this is a placeholder - implement actual distance calculation if needed
      // pipeline.unshift({
      //   $geoNear: {
      //     near: { type: "Point", coordinates: [req.user?.lng || 0, req.user?.lat || 0] },
      //     distanceField: "distance",
      //     spherical: true,
      //   },
      // });
      // if (minDist) pipeline.push({ $match: { distance: { $gte: Number(minDist) } } });
      // if (maxDist) pipeline.push({ $match: { distance: { $lte: Number(maxDist) } } });
    }

    // Apply sorting based on sort parameter
    switch (sort) {
      case "oldest":
        pipeline.push({ $sort: { createdAt: 1 } });
        break;
      case "alpha":
        pipeline.push(
          { $addFields: { sortName: { $toLower: "$pet2.name" } } },
          { $sort: { sortName: 1 } }
        );
        break;
      default: // "newest" or default
        pipeline.push({ $sort: { createdAt: -1 } });
    }

    // Add pagination
    pipeline.push({ $skip: (parseInt(page) - 1) * parseInt(limit) });
    pipeline.push({ $limit: parseInt(limit) });

    // Add user lookups
    pipeline.push(
      {
        $lookup: {
          from: 'users',
          localField: 'user1',
          foreignField: '_id',
          as: 'user1',
          pipeline: [
            { $project: { firstName: 1, lastName: 1, avatar: 1, 'premium.isActive': 1 } }
          ]
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'user2',
          foreignField: '_id',
          as: 'user2',
          pipeline: [
            { $project: { firstName: 1, lastName: 1, avatar: 1, 'premium.isActive': 1 } }
          ]
        }
      },
      { $unwind: '$user1' },
      { $unwind: '$user2' }
    );

    const matches = await Match.aggregate(pipeline);

    res.json({
      success: true,
      data: {
        matches,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          hasMore: matches.length === parseInt(limit)
        }
      }
    });

  } catch (error) {
    logger.error('Get matches error', { error, userId: req.userId });
    res.status(500).json({
      success: false,
      message: 'Failed to get matches',
      error: (error as Error).message
    });
  }
};

/**
 * @desc    Get single match with messages
 * @route   GET /api/matches/:matchId
 * @access  Private
 */
export const getMatch = async (
  req: GetMatchRequest,
  res: Response
): Promise<void> => {
  try {
    const { matchId } = req.params;

    const match = await Match.findOne({
      _id: matchId,
      $or: [{ user1: req.userId }, { user2: req.userId }]
    })
    .populate('pet1 pet2')
    .populate('user1 user2', 'firstName lastName avatar bio premium.isActive')
    .populate('messages.sender', 'firstName lastName avatar _id');

    if (!match) {
      res.status(404).json({
        success: false,
        message: 'Match not found'
      });
      return;
    }

    // Check if match is blocked by current user
    if (match.isUserBlocked(req.userId)) {
      res.status(403).json({
        success: false,
        message: 'Match is blocked'
      });
      return;
    }

    // Mark messages as read
    await match.markMessagesAsRead(req.userId);

    res.json({
      success: true,
      data: { match }
    });

  } catch (error) {
    logger.error('Get match error', { error, userId: req.userId, matchId: req.params.matchId });
    res.status(500).json({
      success: false,
      message: 'Failed to get match',
      error: (error as Error).message
    });
  }
};

/**
 * @desc    Get messages for a match
 * @route   GET /api/matches/:matchId/messages
 * @access  Private
 */
export const getMessages = async (
  req: GetMessagesRequest,
  res: Response
): Promise<void> => {
  try {
    const { matchId } = req.params;
    const { page = '1', limit = '50' } = req.query;

    const match = await Match.findOne({
      _id: matchId,
      $or: [{ user1: req.userId }, { user2: req.userId }]
    })
    .populate('messages.sender', 'firstName lastName avatar _id')
    .select('messages');

    if (!match) {
      res.status(404).json({
        success: false,
        message: 'Match not found'
      });
      return;
    }

    // Get paginated messages (newest first)
    const totalMessages = match.messages.length;
    const startIndex = Math.max(0, totalMessages - (parseInt(page) * parseInt(limit)));
    const endIndex = totalMessages - ((parseInt(page) - 1) * parseInt(limit));
    
    const messages = match.messages.slice(startIndex, endIndex).reverse();

    res.json({
      success: true,
      data: {
        messages,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: totalMessages,
          hasMore: startIndex > 0
        }
      }
    });

  } catch (error) {
    logger.error('Get messages error', { error, userId: req.userId, matchId: req.params.matchId });
    res.status(500).json({
      success: false,
      message: 'Failed to get messages',
      error: (error as Error).message
    });
  }
};

/**
 * @desc    Send message in match
 * @route   POST /api/matches/:matchId/messages
 * @access  Private
 */
export const sendMessage = async (
  req: SendMessageRequest,
  res: Response
): Promise<void> => {
  try {
    const { matchId } = req.params;
    const { content, messageType = 'text', attachments = [] } = req.body;

    const match = await Match.findOne({
      _id: matchId,
      $or: [{ user1: req.userId }, { user2: req.userId }]
    }).populate('user1 user2', 'firstName lastName avatar preferences.notifications');

    if (!match) {
      res.status(404).json({
        success: false,
        message: 'Match not found'
      });
      return;
    }

    if (match.status !== 'active') {
      res.status(400).json({
        success: false,
        message: 'Cannot send message to inactive match'
      });
      return;
    }

    if (match.isUserBlocked(req.userId)) {
      res.status(403).json({
        success: false,
        message: 'Cannot send message to blocked match'
      });
      return;
    }

    // Add message
    const message = {
      sender: req.userId,
      content: content.trim(),
      messageType,
      attachments,
      sentAt: new Date(),
      readBy: [{
        user: req.userId,
        readAt: new Date()
      }]
    };

    match.messages.push(message);
    match.lastActivity = new Date();
    await match.save();

    // Populate the new message with consistent data structure
    await match.populate('messages.sender', 'firstName lastName avatar _id');
    const newMessage = match.messages[match.messages.length - 1];

    // Send email notification to other user if they have it enabled
    const otherUser = match.user1._id.toString() === req.userId.toString() 
      ? match.user2 
      : match.user1;

    if (otherUser && otherUser.preferences.notifications.email && 
        otherUser.preferences.notifications.messages) {
      try {
        await sendEmail({
          email: otherUser.email,
          template: 'emailVerification' as 'newMessage' | 'emailVerification', // 'newMessage' template not yet implemented
          data: {
            userName: otherUser.firstName,
            senderName: req.user?.firstName || 'Someone',
            message: content.substring(0, 100),
            chatUrl: `${process.env.CLIENT_URL}/matches/${matchId}`
          }
        });
      } catch (emailError) {
        logger.error('Message notification email error', { error: emailError, matchId: req.params.matchId });
      }
    }

    res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      data: { message: newMessage }
    });

  } catch (error) {
    logger.error('Send message error', { error, userId: req.userId, matchId: req.params.matchId });
    res.status(500).json({
      success: false,
      message: 'Failed to send message',
      error: (error as Error).message
    });
  }
};

/**
 * @desc    Archive/unarchive match
 * @route   PATCH /api/matches/:matchId/archive
 * @access  Private
 */
export const archiveMatch = async (
  req: ArchiveMatchRequest,
  res: Response
): Promise<void> => {
  try {
    const { matchId } = req.params;

    const match = await Match.findOne({
      _id: matchId,
      $or: [{ user1: req.userId }, { user2: req.userId }]
    });

    if (!match) {
      res.status(404).json({
        success: false,
        message: 'Match not found'
      });
      return;
    }

    await match.toggleArchive(req.userId);

    const userKey = match.user1.toString() === req.userId.toString() ? 'user1' : 'user2';
    const isArchived = match.userActions[userKey].isArchived;

    res.json({
      success: true,
      message: `Match ${isArchived ? 'archived' : 'unarchived'} successfully`,
      data: { isArchived }
    });

  } catch (error) {
    logger.error('Archive match error', { error, userId: req.userId, matchId: req.params.matchId });
    res.status(500).json({
      success: false,
      message: 'Failed to archive match',
      error: (error as Error).message
    });
  }
};

/**
 * @desc    Block match
 * @route   PATCH /api/matches/:matchId/block
 * @access  Private
 */
export const blockMatch = async (
  req: BlockMatchRequest,
  res: Response
): Promise<void> => {
  try {
    const { matchId } = req.params;

    const match = await Match.findOne({
      _id: matchId,
      $or: [{ user1: req.userId }, { user2: req.userId }]
    });

    if (!match) {
      res.status(404).json({
        success: false,
        message: 'Match not found'
      });
      return;
    }

    const userKey = match.user1.toString() === req.userId.toString() ? 'user1' : 'user2';
    match.userActions[userKey].isBlocked = true;
    match.status = 'blocked';
    await match.save();

    res.json({
      success: true,
      message: 'Match blocked successfully'
    });

  } catch (error) {
    logger.error('Block match error', { error, userId: req.userId, matchId: req.params.matchId });
    res.status(500).json({
      success: false,
      message: 'Failed to block match',
      error: (error as Error).message
    });
  }
};

/**
 * @desc    Toggle favorite match
 * @route   PATCH /api/matches/:matchId/favorite
 * @access  Private
 */
export const favoriteMatch = async (
  req: FavoriteMatchRequest,
  res: Response
): Promise<void> => {
  try {
    const { matchId } = req.params;

    const match = await Match.findOne({
      _id: matchId,
      $or: [{ user1: req.userId }, { user2: req.userId }]
    });

    if (!match) {
      res.status(404).json({
        success: false,
        message: 'Match not found'
      });
      return;
    }

    await match.toggleFavorite(req.userId);

    const userKey = match.user1.toString() === req.userId.toString() ? 'user1' : 'user2';
    const isFavorite = match.userActions[userKey].isFavorite;

    res.json({
      success: true,
      message: `Match ${isFavorite ? 'added to' : 'removed from'} favorites`,
      data: { isFavorite }
    });

  } catch (error) {
    logger.error('Favorite match error', { error, userId: req.userId, matchId: req.params.matchId });
    res.status(500).json({
      success: false,
      message: 'Failed to update favorite status',
      error: (error as Error).message
    });
  }
};

/**
 * @desc    Get match statistics
 * @route   GET /api/matches/stats
 * @access  Private
 */
export const getMatchStats = async (
  req: GetMatchStatsRequest,
  res: Response
): Promise<void> => {
  try {
    const stats = await Match.aggregate([
      {
        $match: {
          $or: [{ user1: req.userId }, { user2: req.userId }]
        }
      },
      {
        $group: {
          _id: null,
          totalMatches: { $sum: 1 },
          activeMatches: {
            $sum: {
              $cond: [{ $eq: ['$status', 'active'] }, 1, 0]
            }
          },
          totalMessages: {
            $sum: { $size: '$messages' }
          },
          avgMessagesPerMatch: {
            $avg: { $size: '$messages' }
          }
        }
      }
    ]);

    const result = stats[0] || {
      totalMatches: 0,
      activeMatches: 0,
      totalMessages: 0,
      avgMessagesPerMatch: 0
    };

    res.json({
      success: true,
      data: { stats: result }
    });

  } catch (error) {
    logger.error('Get match stats error', { error, userId: req.userId });
    res.status(500).json({
      success: false,
      message: 'Failed to get match statistics',
      error: (error as Error).message
    });
  }
};


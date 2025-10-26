import express, { type Request, type Response, Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import logger from '../utils/logger';
import mongoose from 'mongoose';
import User from '../models/User';
import Pet from '../models/Pet';
import Match from '../models/Match';
import { type IUserDocument } from '../models/User';

interface AuthenticatedRequest extends Request {
  userId: string;
  user?: IUserDocument;
}

const router: Router = express.Router();

// @desc    Get dashboard statistics
// @route   GET /api/dashboard/stats
// @access  Private
router.get('/stats', authenticateToken, async (req: Request, res: Response) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.userId;
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    // Get user's pets
    const userPets = await Pet.find({ owner: userId }).select('_id');
    const petIds = userPets.map(p => p._id);

    // Matches stats
    const totalMatches = await Match.countDocuments({
      $or: [
        { pet1: { $in: petIds } },
        { pet2: { $in: petIds } }
      ]
    });

    const newMatches = await Match.countDocuments({
      $or: [
        { pet1: { $in: petIds } },
        { pet2: { $in: petIds } }
      ],
      createdAt: { $gte: weekAgo }
    });

    const activeMatches = await Match.countDocuments({
      $or: [
        { pet1: { $in: petIds } },
        { pet2: { $in: petIds } }
      ],
      status: 'active'
    });

    const prevWeekMatches = await Match.countDocuments({
      $or: [
        { pet1: { $in: petIds } },
        { pet2: { $in: petIds } }
      ],
      createdAt: { $gte: twoWeeksAgo, $lt: weekAgo }
    });

    const matchTrend = newMatches > prevWeekMatches ? 'up' : newMatches < prevWeekMatches ? 'down' : 'stable';
    const matchPercentage = prevWeekMatches > 0 ? Math.round(((newMatches - prevWeekMatches) / prevWeekMatches) * 100) : 0;

    // Messages stats via Match.messages aggregation
    const uid = new mongoose.Types.ObjectId(userId);
    const messageAgg = await Match.aggregate([
      { $match: { $or: [{ user1: uid }, { user2: uid }] } },
      {
        $project: {
          messageCount: 1,
          totalSent: {
            $size: {
              $filter: {
                input: '$messages',
                as: 'm',
                cond: { $eq: ['$m.sender', uid] }
              }
            }
          },
          unreadForUser: {
            $size: {
              $filter: {
                input: '$messages',
                as: 'm',
                cond: {
                  $and: [
                    { $ne: ['$m.sender', uid] },
                    {
                      $not: {
                        $in: [
                          uid,
                          { $map: { input: '$m.readBy', as: 'r', in: '$r.user' } }
                        ]
                      }
                    }
                  ]
                }
              }
            }
          },
          weekMessagesCount: {
            $size: {
              $filter: {
                input: '$messages',
                as: 'm',
                cond: { $gte: ['$m.sentAt', weekAgo] }
              }
            }
          },
          prevWeekMessagesCount: {
            $size: {
              $filter: {
                input: '$messages',
                as: 'm',
                cond: {
                  $and: [
                    { $gte: ['$m.sentAt', twoWeeksAgo] },
                    { $lt: ['$m.sentAt', weekAgo] }
                  ]
                }
              }
            }
          }
        }
      },
      {
        $group: {
          _id: null,
          totalMessages: { $sum: '$messageCount' },
          unreadMessages: { $sum: '$unreadForUser' },
          sentMessages: { $sum: '$totalSent' },
          weekMessages: { $sum: '$weekMessagesCount' },
          prevWeekMessages: { $sum: '$prevWeekMessagesCount' }
        }
      }
    ]);

    const msg = messageAgg[0] || { totalMessages: 0, unreadMessages: 0, sentMessages: 0, weekMessages: 0, prevWeekMessages: 0 };

    const messageTrend = msg.weekMessages > msg.prevWeekMessages ? 'up' : msg.weekMessages < msg.prevWeekMessages ? 'down' : 'stable';
    const messagePercentage = msg.prevWeekMessages > 0 ? Math.round(((msg.weekMessages - msg.prevWeekMessages) / msg.prevWeekMessages) * 100) : 0;

    const totalMessages = msg.totalMessages;
    const unreadMessages = msg.unreadMessages;
    const sentMessages = msg.sentMessages;

    // Profile stats (from pet analytics)
    const petAnalytics = await Pet.aggregate([
      { $match: { owner: userId } },
      {
        $group: {
          _id: null,
          totalViews: { $sum: '$analytics.views' },
          totalLikes: { $sum: '$analytics.likes' },
          totalSuperLikes: { $sum: '$analytics.superLikes' }
        }
      }
    ]);

    const profileStats = petAnalytics[0] || { totalViews: 0, totalLikes: 0, totalSuperLikes: 0 };

    // Activity stats (from user analytics)
    const user = await User.findById(userId).select('analytics');
    const userAnalytics = user?.analytics || {};

    const stats = {
      matches: {
        total: totalMatches,
        new: newMatches,
        active: activeMatches,
        trend: matchTrend,
        percentage: Math.abs(matchPercentage)
      },
      messages: {
        total: totalMessages,
        unread: unreadMessages,
        sent: sentMessages,
        trend: messageTrend,
        percentage: Math.abs(messagePercentage)
      },
      profile: {
        views: profileStats.totalViews || 0,
        likes: profileStats.totalLikes || 0,
        superLikes: profileStats.totalSuperLikes || 0,
        trend: 'stable' as const,
        percentage: 0
      },
      activity: {
        swipes: (userAnalytics as any).totalSwipes || 0,
        playdates: 0,
        events: Array.isArray((userAnalytics as any).events) ? (userAnalytics as any).events.length : 0,
        trend: 'stable' as const,
        percentage: 0
      }
    };

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    logger.error('Dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard statistics',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// @desc    Get pack suggestions
// @route   GET /api/dashboard/pack-suggestions
// @access  Private
router.get('/pack-suggestions', authenticateToken, async (req: Request, res: Response) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.userId;

    // Load user and pets
    const user = await User.findById(userId).select('location').lean();
    const userPets = await Pet.find({ owner: userId }).select('species intent personalityTags photos name _id').lean();
    const userPetIds = new Set(userPets.map(p => String(p._id)));

    // If no user location, return empty
    const coords = (user as any)?.location?.coordinates;
    if (!coords || coords.length !== 2) {
      return res.json({ success: true, data: [] });
    }

    // Query nearby pets (exclude own pets)
    const nearby = await Pet.find({
      _id: { $nin: Array.from(userPetIds) },
      isActive: true,
      status: 'active',
      'location': {
        $near: {
          $geometry: { type: 'Point', coordinates: coords },
          $maxDistance: 20000 // 20km
        }
      }
    })
      .select('name photos species intent personalityTags location')
      .limit(60)
      .lean();

    // Simple compatibility scoring
    const tagSetArray = (arr: any) => new Set(Array.isArray(arr) ? arr : []);
    const intersectionSize = (a: Set<string>, b: Set<string>) => {
      let size = 0; for (const t of a) if (b.has(t)) size++; return size;
    };

    const scored = nearby.map(p => {
      // species/intent weight
      const base = userPets.some(up => up.species === p.species) ? 40 : 20;
      const intentBoost = userPets.some(up => up.intent === p.intent || up.intent === 'all' || p.intent === 'all') ? 20 : 0;
      // personality overlap
      const userTags = tagSetArray(userPets.flatMap(up => (up as any).personalityTags || []));
      const petTags = tagSetArray((p as any).personalityTags || []);
      const tagScore = Math.min(20, intersectionSize(userTags, petTags) * 5);
      // distance dampening (closer is better)
      const dLng = (p as any).location?.coordinates?.[0] ?? 0 - coords[0];
      const dLat = (p as any).location?.coordinates?.[1] ?? 0 - coords[1];
      const approxDist = Math.sqrt(dLng * dLng + dLat * dLat);
      const distanceScore = Math.max(0, 20 - approxDist * 1000);
      const total = Math.round(base + intentBoost + tagScore + distanceScore);
      return { pet: p, score: Math.max(0, Math.min(100, total)) };
    })
      .sort((a, b) => b.score - a.score)
      .slice(0, 12);

    // Build 3 packs
    const packs = [];
    const names = ['Nearby Playmates', 'Adventure Seekers', 'Chill Companions'];
    for (let i = 0; i < 3; i++) {
      const slice = scored.slice(i * 4, i * 4 + 4);
      if (slice.length === 0) break;
      packs.push({
        id: `pack-${i + 1}`,
        name: names[i] || `Suggested Pack ${i + 1}`,
        description: 'Suggested group based on proximity and compatibility',
        members: slice.map(({ pet, score }) => ({
          id: String((pet as any)._id),
          name: (pet as any).name,
          avatar: (pet as any).photos?.find((ph: any) => ph.isPrimary)?.url || (pet as any).photos?.[0]?.url || null,
          compatibility: score
        })),
        activity: 'Community meetups and playdates',
        nextEvent: null
      });
    }

    res.json({ success: true, data: packs });
  } catch (error) {
    logger.error('Pack suggestions error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch pack suggestions', error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

export default router;


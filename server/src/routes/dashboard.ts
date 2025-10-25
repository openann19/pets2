export {};// Added to mark file as a module
const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const logger = require('../utils/logger');
const mongoose = require('mongoose');
const User = require('../models/User');
const Pet = require('../models/Pet');
const Match = require('../models/Match');

const router = express.Router();

// @desc    Get dashboard statistics
// @route   GET /api/dashboard/stats
// @access  Private
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const userId = req.userId;
    const now = new Date();
    const weekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);
    const twoWeeksAgo = new Date(now - 14 * 24 * 60 * 60 * 1000);

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
      { $match: { $or: [ { user1: uid }, { user2: uid } ] } },
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
        trend: 'stable',
        percentage: 0
      },
      activity: {
        swipes: userAnalytics.totalSwipes || 0,
        playdates: 0,
        events: Array.isArray(userAnalytics.events) ? userAnalytics.events.length : 0,
        trend: 'stable',
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
      error: error.message
    });
  }
});

// @desc    Get pack suggestions
// @route   GET /api/dashboard/pack-suggestions
// @access  Private
router.get('/pack-suggestions', authenticateToken, async (req, res) => {
  try {
    const userId = req.userId;

    // Load user and pets
    const user = await User.findById(userId).select('location').lean();
    const userPets = await Pet.find({ owner: userId }).select('species intent personalityTags photos name _id').lean();
    const userPetIds = new Set(userPets.map(p => String(p._id)));

    // If no user location, return empty
    const coords = user?.location?.coordinates;
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
    const tagSetArray = (arr) => new Set(Array.isArray(arr) ? arr : []);
    const intersectionSize = (a, b) => {
      let size = 0; for (const t of a) if (b.has(t)) size++; return size;
    };

    const scored = nearby.map(p => {
      // species/intent weight
      const base = userPets.some(up => up.species === p.species) ? 40 : 20;
      const intentBoost = userPets.some(up => up.intent === p.intent || up.intent === 'all' || p.intent === 'all') ? 20 : 0;
      // personality overlap
      const userTags = tagSetArray(userPets.flatMap(up => up.personalityTags || []));
      const petTags = tagSetArray(p.personalityTags || []);
      const tagScore = Math.min(20, intersectionSize(userTags, petTags) * 5);
      // distance dampening (closer is better)
      // coords is [lng, lat]
      const dLng = (p.location?.coordinates?.[0] ?? 0) - coords[0];
      const dLat = (p.location?.coordinates?.[1] ?? 0) - coords[1];
      const approxDist = Math.sqrt(dLng*dLng + dLat*dLat); // not meters, used just for ordering
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
        id: `pack-${i+1}`,
        name: names[i] || `Suggested Pack ${i+1}`,
        description: 'Suggested group based on proximity and compatibility',
        members: slice.map(({ pet, score }) => ({
          id: String(pet._id),
          name: pet.name,
          avatar: pet.photos?.find(ph => ph.isPrimary)?.url || pet.photos?.[0]?.url || null,
          compatibility: score
        })),
        activity: 'Community meetups and playdates',
        nextEvent: null
      });
    }

    res.json({ success: true, data: packs });
  } catch (error) {
    logger.error('Pack suggestions error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch pack suggestions', error: error.message });
  }
});

// @desc    Get recent activity
// @route   GET /api/dashboard/recent-activity
// @access  Private
router.get('/recent-activity', authenticateToken, async (req, res) => {
  try {
    const userId = req.userId;
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000);

    // Load matches the user participates in
    const matches = await Match.find({
      $or: [{ user1: userId }, { user2: userId }]
    })
      .select('createdAt lastMessageAt messages pet1 pet2 user1 user2 meetings')
      .populate('pet1', 'name photos')
      .populate('pet2', 'name photos')
      .lean();

    const items = [];

    for (const m of matches) {
      const isUser1 = String(m.user1) === String(userId);
      const otherPet = isUser1 ? m.pet2 : m.pet1;
      const avatar = otherPet?.photos?.find(p => p.isPrimary)?.url || otherPet?.photos?.[0]?.url || null;

      // New match
      if (m.createdAt && m.createdAt >= since) {
        items.push({
          id: `match-${m._id}`,
          type: 'match',
          title: 'New Match!',
          description: otherPet?.name ? `You matched with ${otherPet.name}` : 'You have a new match',
          timestamp: m.createdAt.toISOString(),
          avatar,
          action: 'View Profile'
        });
      }

      // Recent message received
      if (Array.isArray(m.messages) && m.messages.length > 0) {
        const last = [...m.messages].sort((a, b) => new Date(b.sentAt) - new Date(a.sentAt))[0];
        if (last && new Date(last.sentAt) >= since && String(last.sender) !== String(userId)) {
          items.push({
            id: `msg-${m._id}-${last._id || +new Date(last.sentAt)}`,
            type: 'message',
            title: 'Message Received',
            description: (last.content || '').slice(0, 100),
            timestamp: new Date(last.sentAt).toISOString(),
            avatar,
            action: 'Reply'
          });
        }
      }

      // Upcoming playdates (meetings)
      if (Array.isArray(m.meetings) && m.meetings.length > 0) {
        const upcoming = m.meetings.filter(mt => mt.proposedDate && new Date(mt.proposedDate) >= new Date());
        for (const mt of upcoming) {
          items.push({
            id: `meet-${m._id}-${mt._id}`,
            type: 'playdate',
            title: 'Playdate Scheduled',
            description: mt.title || 'Upcoming playdate',
            timestamp: new Date(mt.proposedDate).toISOString(),
            avatar,
            action: 'View Details'
          });
        }
      }
    }

    // Sort by timestamp desc and limit
    items.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    const recentActivity = items.slice(0, 25);

    res.json({ success: true, data: recentActivity });
  } catch (error) {
    logger.error('Recent activity error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch recent activity', error: error.message });
  }
});

// @desc    Get pulse data
// @route   GET /api/dashboard/pulse
// @access  Private
router.get('/pulse', authenticateToken, async (req, res) => {
  try {
    const userId = req.userId;

    // Pull basic analytics from user document
    const user = await User.findById(userId).select('analytics').lean();
    const a = user?.analytics || {};

    // Deterministic scores derived from analytics (0-100)
    const clamp = (n, min, max) => Math.max(min, Math.min(max, Math.round(n)));
    const heartbeat = clamp(70 + (a.totalMessagesSent || 0) / 50, 60, 95);
    const energy = clamp(60 + (a.totalMatches || 0) * 2, 50, 100);
    const social = clamp(60 + (a.totalSwipes || 0) / 10, 50, 100);
    const happiness = clamp(65 + (a.profileViews || 0) / 20, 50, 100);

    const pulseData = {
      heartbeat,
      energy,
      social,
      happiness,
      timestamp: new Date().toISOString()
    };

    res.json({ success: true, data: pulseData });
  } catch (error) {
    logger.error('Pulse data error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch pulse data', error: error.message });
  }
});

// @desc    Get narrative insights
// @route   GET /api/dashboard/narrative-insights
// @access  Private
router.get('/narrative-insights', authenticateToken, async (req, res) => {
  try {
    const userId = req.userId;
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    // Fetch user analytics and recent activity
    const [user, recentMatches, userPets] = await Promise.all([
      User.findById(userId).select('analytics').lean(),
      Match.find({
        $or: [{ user1: userId }, { user2: userId }],
        createdAt: { $gte: weekAgo }
      }).select('createdAt messages').lean(),
      Pet.find({ owner: userId }).select('analytics').lean()
    ]);

    const a = user?.analytics || {};
    const insights = [];

    // Social connections insight
    const newConnections = recentMatches.length;
    if (newConnections > 0) {
      insights.push({
        id: 'insight-social',
        category: 'social',
        title: newConnections >= 10 ? 'Social Butterfly Status' : 'Growing Network',
        description: newConnections >= 10 
          ? 'You\'ve been incredibly active in the community this week'
          : 'You\'re building meaningful connections',
        highlight: `${newConnections} new connection${newConnections !== 1 ? 's' : ''}`,
        trend: 'up',
        color: 'text-pink-600',
        icon: '🦋'
      });
    }

    // Messages insight
    const messagesSent = a.totalMessagesSent || 0;
    if (messagesSent > 20) {
      insights.push({
        id: 'insight-messages',
        category: 'communication',
        title: messagesSent >= 50 ? 'Message Master' : 'Active Communicator',
        description: 'You\'re keeping conversations alive and thriving',
        highlight: `${messagesSent} message${messagesSent !== 1 ? 's' : ''} sent`,
        trend: 'up',
        color: 'text-blue-600',
        icon: '💬'
      });
    }

    // Profile views insight
    const totalViews = userPets.reduce((sum, p) => sum + (p.analytics?.views || 0), 0);
    if (totalViews > 10) {
      insights.push({
        id: 'insight-views',
        category: 'engagement',
        title: 'Profile Popularity',
        description: 'Your pet\'s profile is getting lots of attention',
        highlight: `${totalViews} profile view${totalViews !== 1 ? 's' : ''}`,
        trend: 'up',
        color: 'text-purple-600',
        icon: '👀'
      });
    }

    // Matches insight
    const totalMatches = a.totalMatches || 0;
    if (totalMatches > 5) {
      insights.push({
        id: 'insight-matches',
        category: 'activity',
        title: totalMatches >= 15 ? 'Match Champion' : 'Rising Star',
        description: 'You\'re making great connections in the community',
        highlight: `${totalMatches} total match${totalMatches !== 1 ? 'es' : ''}`,
        trend: 'up',
        color: 'text-green-600',
        icon: '🏆'
      });
    }

    // Default insight if none generated
    if (insights.length === 0) {
      insights.push({
        id: 'insight-welcome',
        category: 'general',
        title: 'Welcome to PawfectMatch',
        description: 'Start swiping to find your pet\'s perfect companions',
        highlight: 'Get started today',
        trend: 'neutral',
        color: 'text-gray-600',
        icon: '🐾'
      });
    }

    res.json({ success: true, data: insights });
  } catch (error) {
    logger.error('Narrative insights error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch narrative insights', error: error.message });
  }
});

module.exports = router;

/**
 * COMMUNITY ROUTES - Advanced Social Features
 *
 * RESTful API routes for community feed, stories, groups, and interactions
 * Integrated with our comprehensive social platform enhancement
 */

import express, { type Request, type Response } from 'express';
import { body, param, query, validationResult } from 'express-validator';
import { authenticateToken as authMiddleware } from '../src/middleware/auth';
import { logger } from '@pawfectmatch/core';

const router = express.Router();

// ==================== COMMUNITY FEED ROUTES ====================

/**
 * GET /api/community/feed
 * Get personalized community feed with advanced algorithms
 */
router.get(
  '/feed',
  authMiddleware,
  [
    query('page').optional().isInt({ min: 1 }).toInt(),
    query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
    query('filter').optional().isString(),
    query('sort').optional().isIn(['recent', 'popular', 'engaging', 'local', 'ai_score']),
  ],
  async (req: Request, res: Response): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }

      const userId = (req as any).user.id;
      const { page = 1, limit = 20, filter = 'all', sort = 'recent' } = req.query;

      // Mock response - replace with actual database query
      const posts = {
        data: [],
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total: 0,
          hasMore: false,
        },
        meta: {
          filter,
          sort,
          timestamp: new Date().toISOString(),
        },
      };

      logger.info('Community feed fetched', { userId, page, limit, filter, sort });
      res.json(posts);
    } catch (error) {
      logger.error('Error fetching community feed:', error);
      res.status(500).json({ error: 'Failed to fetch community feed' });
    }
  }
);

/**
 * POST /api/community/posts
 * Create a new community post
 */
router.post(
  '/posts',
  authMiddleware,
  [
    body('content').optional().isString().trim(),
    body('mediaUrl').optional().isURL(),
    body('mediaType').optional().isIn(['photo', 'video']),
    body('location').optional().isObject(),
    body('petId').optional().isString(),
    body('communityId').optional().isString(),
  ],
  async (req: Request, res: Response): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }

      const userId = (req as any).user.id;
      const postData = req.body;

      // Mock response - replace with actual database insert
      const newPost = {
        _id: `post_${Date.now()}`,
        authorId: userId,
        ...postData,
        createdAt: new Date().toISOString(),
        likes: 0,
        comments: 0,
        shares: 0,
      };

      logger.info('Community post created', { userId, postId: newPost._id });
      res.status(201).json(newPost);
    } catch (error) {
      logger.error('Error creating community post:', error);
      res.status(500).json({ error: 'Failed to create post' });
    }
  }
);

/**
 * POST /api/community/posts/:postId/like
 * Like/unlike a post
 */
router.post(
  '/posts/:postId/like',
  authMiddleware,
  [param('postId').isString()],
  async (req: Request, res: Response): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }

      const userId = (req as any).user.id;
      const { postId } = req.params;

      // Mock response - replace with actual database update
      const result = {
        postId,
        liked: true,
        likeCount: 1,
      };

      logger.info('Post liked', { userId, postId });
      res.json(result);
    } catch (error) {
      logger.error('Error liking post:', error);
      res.status(500).json({ error: 'Failed to like post' });
    }
  }
);

/**
 * POST /api/community/posts/:postId/comment
 * Add a comment to a post
 */
router.post(
  '/posts/:postId/comment',
  authMiddleware,
  [
    param('postId').isString(),
    body('content').isString().trim().notEmpty(),
    body('parentId').optional().isString(),
  ],
  async (req: Request, res: Response): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }

      const userId = (req as any).user.id;
      const { postId } = req.params;
      const { content, parentId } = req.body;

      // Mock response - replace with actual database insert
      const comment = {
        _id: `comment_${Date.now()}`,
        postId,
        authorId: userId,
        content,
        parentId: parentId || null,
        createdAt: new Date().toISOString(),
        likes: 0,
        replies: 0,
      };

      logger.info('Comment added', { userId, postId, commentId: comment._id });
      res.status(201).json(comment);
    } catch (error) {
      logger.error('Error adding comment:', error);
      res.status(500).json({ error: 'Failed to add comment' });
    }
  }
);

// ==================== STORIES ROUTES ====================

/**
 * GET /api/stories
 * Get stories feed
 */
router.get(
  '/stories',
  authMiddleware,
  [
    query('filter').optional().isString(),
    query('limit').optional().isInt({ min: 1, max: 50 }).toInt(),
  ],
  async (req: Request, res: Response): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }

      const userId = (req as any).user.id;
      const { filter = 'all', limit = 20 } = req.query;

      // Mock response - replace with actual database query
      const stories = {
        groups: [],
        meta: {
          filter,
          timestamp: new Date().toISOString(),
        },
      };

      logger.info('Stories fetched', { userId, filter, limit });
      res.json(stories);
    } catch (error) {
      logger.error('Error fetching stories:', error);
      res.status(500).json({ error: 'Failed to fetch stories' });
    }
  }
);

/**
 * POST /api/stories
 * Create a new story
 */
router.post(
  '/stories',
  authMiddleware,
  [
    body('mediaUrl').isURL(),
    body('mediaType').isIn(['photo', 'video']),
    body('petId').optional().isString(),
    body('caption').optional().isString(),
    body('location').optional().isObject(),
    body('storyType').optional().isIn(['photo', 'video', 'playdate', 'achievement', 'mood']),
  ],
  async (req: Request, res: Response): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }

      const userId = (req as any).user.id;
      const storyData = req.body;

      // Mock response - replace with actual database insert
      const story = {
        _id: `story_${Date.now()}`,
        userId,
        ...storyData,
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        views: 0,
        reactions: {},
      };

      logger.info('Story created', { userId, storyId: story._id });
      res.status(201).json(story);
    } catch (error) {
      logger.error('Error creating story:', error);
      res.status(500).json({ error: 'Failed to create story' });
    }
  }
);

/**
 * POST /api/stories/:storyId/view
 * Mark story as viewed
 */
router.post(
  '/stories/:storyId/view',
  authMiddleware,
  [param('storyId').isString()],
  async (req: Request, res: Response): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }

      const userId = (req as any).user.id;
      const { storyId } = req.params;

      logger.info('Story viewed', { userId, storyId });
      res.json({ success: true, storyId, viewCount: 1 });
    } catch (error) {
      logger.error('Error marking story as viewed:', error);
      res.status(500).json({ error: 'Failed to mark story as viewed' });
    }
  }
);

// ==================== COMMUNITIES ROUTES ====================

/**
 * GET /api/communities
 * Discover communities
 */
router.get(
  '/communities',
  authMiddleware,
  [
    query('type').optional().isString(),
    query('category').optional().isString(),
    query('location').optional().isString(),
    query('page').optional().isInt({ min: 1 }).toInt(),
    query('limit').optional().isInt({ min: 1, max: 50 }).toInt(),
  ],
  async (req: Request, res: Response): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }

      const userId = (req as any).user.id;
      const { type, category, location, page = 1, limit = 20 } = req.query;

      // Mock response - replace with actual database query
      const communities = {
        data: [],
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total: 0,
          hasMore: false,
        },
        meta: {
          type,
          category,
          location,
        },
      };

      logger.info('Communities discovered', { userId, type, category, location });
      res.json(communities);
    } catch (error) {
      logger.error('Error discovering communities:', error);
      res.status(500).json({ error: 'Failed to discover communities' });
    }
  }
);

/**
 * POST /api/communities
 * Create a new community
 */
router.post(
  '/communities',
  authMiddleware,
  [
    body('name').isString().trim().notEmpty(),
    body('description').isString().trim(),
    body('type').isIn(['breed_specific', 'location_based', 'activity_based', 'age_based', 'interest_based']),
    body('category').isString(),
    body('avatar').optional().isURL(),
    body('coverImage').optional().isURL(),
    body('criteria').optional().isObject(),
    body('settings').optional().isObject(),
  ],
  async (req: Request, res: Response): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }

      const userId = (req as any).user.id;
      const communityData = req.body;

      // Mock response - replace with actual database insert
      const community = {
        _id: `community_${Date.now()}`,
        creatorId: userId,
        ...communityData,
        createdAt: new Date().toISOString(),
        stats: {
          memberCount: 1,
          postCount: 0,
          activeMembers: 1,
        },
      };

      logger.info('Community created', { userId, communityId: community._id });
      res.status(201).json(community);
    } catch (error) {
      logger.error('Error creating community:', error);
      res.status(500).json({ error: 'Failed to create community' });
    }
  }
);

/**
 * POST /api/communities/:communityId/join
 * Join a community
 */
router.post(
  '/communities/:communityId/join',
  authMiddleware,
  [param('communityId').isString()],
  async (req: Request, res: Response): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }

      const userId = (req as any).user.id;
      const { communityId } = req.params;

      logger.info('User joined community', { userId, communityId });
      res.json({ success: true, communityId, joined: true });
    } catch (error) {
      logger.error('Error joining community:', error);
      res.status(500).json({ error: 'Failed to join community' });
    }
  }
);

// ==================== INTERACTIONS ROUTES ====================

/**
 * POST /api/interactions/reaction
 * Add a reaction to content
 */
router.post(
  '/interactions/reaction',
  authMiddleware,
  [
    body('targetId').isString(),
    body('targetType').isIn(['post', 'comment', 'story']),
    body('reactionType').isIn(['like', 'love', 'laugh', 'wow', 'sad', 'angry']),
  ],
  async (req: Request, res: Response): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }

      const userId = (req as any).user.id;
      const { targetId, targetType, reactionType } = req.body;

      logger.info('Reaction added', { userId, targetId, targetType, reactionType });
      res.json({ success: true, targetId, reactionType });
    } catch (error) {
      logger.error('Error adding reaction:', error);
      res.status(500).json({ error: 'Failed to add reaction' });
    }
  }
);

/**
 * POST /api/interactions/report
 * Report content
 */
router.post(
  '/interactions/report',
  authMiddleware,
  [
    body('targetId').isString(),
    body('targetType').isIn(['post', 'comment', 'user', 'community']),
    body('reason').isString(),
    body('details').optional().isString(),
  ],
  async (req: Request, res: Response): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }

      const userId = (req as any).user.id;
      const { targetId, targetType, reason } = req.body;

      logger.info('Content reported', { userId, targetId, targetType, reason });
      res.json({ success: true, reportId: `report_${Date.now()}` });
    } catch (error) {
      logger.error('Error reporting content:', error);
      res.status(500).json({ error: 'Failed to report content' });
    }
  }
);

// ==================== PET FEED ROUTES ====================

/**
 * GET /api/community/feed/pets
 * Get pets feed for mobile swipe interface
 * Returns paginated pet data compatible with VirtualizedFeed component
 */
router.get(
  '/feed/pets',
  authMiddleware,
  [
    query('page').optional().isInt({ min: 1 }).toInt(),
    query('limit').optional().isInt({ min: 1, max: 50 }).toInt(),
    query('species').optional().isString(),
    query('intent').optional().isString(),
    query('maxDistance').optional().isInt({ min: 1, max: 100 }).toInt(),
    query('minAge').optional().isInt({ min: 0, max: 30 }).toInt(),
    query('maxAge').optional().isInt({ min: 0, max: 30 }).toInt(),
    query('size').optional().isIn(['tiny', 'small', 'medium', 'large', 'extra-large']),
    query('gender').optional().isIn(['male', 'female']),
    query('breed').optional().isString(),
  ],
  async (req: Request, res: Response): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }

      const userId = (req as any).user.id;
      const {
        page = 1,
        limit = 20,
        species,
        intent,
        maxDistance = 50,
        minAge,
        maxAge,
        size,
        gender,
        breed
      } = req.query;

      // Import models dynamically to avoid circular imports
      const { default: Pet } = await import('../src/models/Pet');
      const { default: User } = await import('../src/models/User');
      const { default: Match } = await import('../src/models/Match');

      // Get current user for location-based filtering
      const currentUser = await User.findById(userId);
      if (!currentUser) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      // Build query for pet discovery
      const query: any = {
        owner: { $ne: userId }, // Exclude user's own pets
        'availability.isAvailable': true,
        isActive: true
      };

      // Add filters
      if (species) query.species = species;
      if (intent) query.intent = intent;
      if (size) query.size = size;
      if (gender) query.gender = gender;
      if (breed) query.breed = new RegExp(breed as string, 'i');

      // Age range filter
      if (minAge !== undefined || maxAge !== undefined) {
        query.age = {};
        if (minAge !== undefined) query.age.$gte = Number(minAge);
        if (maxAge !== undefined) query.age.$lte = Number(maxAge);
      }

      // Location-based filtering
      if (currentUser.location && currentUser.location.coordinates) {
        const maxDistanceMeters = Number(maxDistance) * 1000; // Convert km to meters
        query.location = {
          $near: {
            $geometry: currentUser.location,
            $maxDistance: maxDistanceMeters
          }
        };
      }

      // Get user's already swiped pets to exclude them
      const userSwipes = await Match.find({
        $or: [
          { 'pet1.owner': userId },
          { 'pet2.owner': userId }
        ]
      }).distinct('pet1._id pet2._id');

      // Exclude already swiped pets
      const swipedPetIds = userSwipes.filter((id: any) => id.toString() !== userId);
      if (swipedPetIds.length > 0) {
        query._id = { $nin: swipedPetIds };
      }

      const pageNum = Number(page);
      const limitNum = Number(limit);
      const skip = (pageNum - 1) * limitNum;

      // Get pets with owner info
      const pets = await Pet.find(query)
        .populate('owner', 'firstName lastName avatar')
        .sort({ createdAt: -1, 'featured.isFeatured': -1 })
        .skip(skip)
        .limit(limitNum);

      const total = await Pet.countDocuments(query);
      const hasMore = total > skip + limitNum;

      // Transform pets to match mobile Pet interface
      const transformedPets = pets.map((pet: any) => ({
        _id: pet._id.toString(),
        id: pet._id.toString(), // Alias for compatibility
        owner: pet.owner,
        name: pet.name,
        species: pet.species,
        breed: pet.breed || 'Mixed Breed',
        age: pet.age,
        gender: pet.gender,
        size: pet.size,
        weight: pet.weight,
        color: pet.color,
        photos: pet.photos || [],
        videos: pet.videos || [],
        description: pet.description,
        personalityTags: pet.personalityTags || [],
        intent: pet.intent,
        availability: pet.availability,
        healthInfo: pet.healthInfo,
        location: pet.location,
        aiData: pet.aiData,
        featured: pet.featured,
        analytics: pet.analytics,
        isActive: pet.isActive,
        isVerified: pet.isVerified,
        status: pet.status,
        adoptedAt: pet.adoptedAt,
        listedAt: pet.listedAt,
        createdAt: pet.createdAt,
        updatedAt: pet.updatedAt
      }));

      logger.info('Pet feed fetched', {
        userId,
        page: pageNum,
        limit: limitNum,
        total,
        hasMore,
        filters: { species, intent, maxDistance, minAge, maxAge, size, gender, breed }
      });

      res.json({
        pets: transformedPets,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          hasMore
        },
        meta: {
          filters: { species, intent, maxDistance, minAge, maxAge, size, gender, breed },
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      logger.error('Error fetching pet feed:', error);
      res.status(500).json({ error: 'Failed to fetch pet feed' });
    }
  }
);

/**
 * POST /api/community/feed/swipe
 * Handle swipe actions for mobile feed (bulk operations)
 */
router.post(
  '/feed/swipe',
  authMiddleware,
  [
    body('petId').isString(),
    body('action').isIn(['like', 'pass', 'superlike']),
  ],
  async (req: Request, res: Response): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }

      const userId = (req as any).user.id;
      const { petId, action } = req.body;

      // Import models dynamically
      const { default: User } = await import('../src/models/User');
      const { default: Pet } = await import('../src/models/Pet');
      const { default: Match } = await import('../src/models/Match');

      // Get user and check premium status for super likes
      const user = await User.findById(userId);
      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      // Check if already swiped
      const alreadySwiped = (user.swipedPets || []).some(
        (swipe: any) => swipe.petId.toString() === petId
      );

      if (alreadySwiped) {
        res.status(400).json({ error: 'Already swiped on this pet' });
        return;
      }

      // Handle superlike premium check
      if (action === 'superlike') {
        const isPremium = user.premium?.isActive &&
          (!user.premium.expiresAt || new Date(user.premium.expiresAt) > new Date());

        const hasUnlimitedSuperLikes = isPremium && user.premium?.features?.unlimitedLikes;
        const iapSuperLikes = user.premium?.usage?.iapSuperLikes || 0;

        if (!hasUnlimitedSuperLikes && iapSuperLikes <= 0) {
          res.status(403).json({
            error: 'No Super Likes remaining. Purchase more from the Premium screen.',
            code: 'SUPERLIKE_INSUFFICIENT_BALANCE',
            canPurchase: true,
            balance: iapSuperLikes,
            upgradeRequired: !isPremium,
          });
          return;
        }

        // Deduct IAP super like if not unlimited
        if (!hasUnlimitedSuperLikes) {
          await User.findByIdAndUpdate(userId, {
            $inc: { 'premium.usage.iapSuperLikes': -1 }
          });
        }
      }

      // Add to swiped pets
      await User.findByIdAndUpdate(userId, {
        $push: {
          swipedPets: {
            petId,
            action,
            swipedAt: new Date()
          }
        },
        $inc: {
          'analytics.totalSwipes': 1,
          ...(action === 'like' && { 'analytics.totalLikes': 1 })
        }
      });

      // Check for match (if liked/superliked)
      let isMatch = false;
      let matchData = null;

      if (action === 'like' || action === 'superlike') {
        // Get target pet
        const targetPet = await Pet.findById(petId).populate('owner');
        if (targetPet) {
          // Check if reciprocal like exists
          const reciprocalMatch = await Match.findOne({
            'pet1._id': targetPet._id,
            'pet2.owner': userId,
            pet1Action: { $in: ['like', 'superlike'] }
          });

          if (reciprocalMatch) {
            // Create match record
            const match = new Match({
              pet1: {
                _id: targetPet._id,
                owner: (targetPet.owner as any)._id,
                name: targetPet.name,
                photos: targetPet.photos
              },
              pet2: {
                owner: userId,
                name: (user.pets?.[0] as any)?.name || 'Your Pet', // Get user's first pet
                photos: (user.pets?.[0] as any)?.photos || []
              },
              pet1Action: (reciprocalMatch as any).pet1Action,
              pet2Action: action,
              isMatch: true,
              matchedAt: new Date()
            });

            await match.save();
            isMatch = true;
            matchData = match;

            // Update match counts
            await Pet.findByIdAndUpdate(targetPet._id, { $inc: { 'analytics.matches': 1 } });

            // Broadcast match to both users via Socket.IO
            try {
              const { broadcastMatch } = await import('../src/sockets/communitySocket');
              const io = (global as any).socketIO;
              if (io) {
                // Broadcast to current user
                broadcastMatch(io, userId, petId, targetPet, match);
                // Broadcast to target user
                broadcastMatch(io, (targetPet.owner as any)._id.toString(), targetPet._id.toString(), { name: ((user.pets?.[0] as any)?.name as string) || 'Your Pet', photos: ((user.pets?.[0] as any)?.photos as any[]) || [] }, match);
              }
            } catch (socketError) {
              logger.warn('Failed to broadcast match via socket', { error: socketError });
            }
          }
        }
      }

      logger.info('Feed swipe recorded', { userId, petId, action, isMatch });

      res.json({
        success: true,
        action,
        isMatch,
        match: matchData,
        message: isMatch ? 'It\'s a match!' : 'Swipe recorded'
      });
    } catch (error) {
      logger.error('Error recording feed swipe:', error);
      res.status(500).json({ error: 'Failed to record swipe' });
    }
  }
);

export default router;

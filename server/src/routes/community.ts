import express, { type Request, type Response, Router } from 'express';
import { requireAuth } from '../middleware/adminAuth';
import logger from '../utils/logger';
import { type IUserDocument } from '../models/User';
const CommunityPost = require('../models/CommunityPost');

interface AuthenticatedRequest extends Request {
  user?: IUserDocument;
}

const router: Router = express.Router();

// Apply authentication to all community routes
router.use(requireAuth);

// @desc    Get community posts
// @route   GET /api/community/posts
// @access  Private
router.get('/posts', async (req: Request, res: Response) => {
  try {
    const {
      page = 1,
      limit = 20,
      packId,
      userId,
      type
    } = req.query;

    // Build query for community posts
    const query: any = {
      moderationStatus: 'approved',
      isArchived: false
    };
    
    if (packId) query.packId = packId;
    if (userId) query.author = userId;
    if (type) query.type = type;

    // Execute database query
    const posts = await CommunityPost.find(query)
      .populate('author', 'firstName lastName avatar')
      .populate('packId', 'name')
      .sort({ isPinned: -1, createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit))
      .lean();

    const total = await CommunityPost.countDocuments(query);

    // Transform posts to match expected format
    const transformedPosts = posts.map((post: any) => ({
      _id: post._id,
      author: {
        _id: post.author?._id || post.author,
        name: `${post.author?.firstName || ''} ${post.author?.lastName || ''}`.trim(),
        avatar: post.author?.avatar,
      },
      content: post.content,
      images: post.images,
      likes: post.likes?.length || 0,
      liked: false, // This would be calculated based on current user
      comments: post.comments || [],
      createdAt: post.createdAt,
      packId: post.packId,
      packName: post.packId?.name,
      type: post.type,
      activityDetails: post.activityDetails
    }));

    res.json({
      success: true,
      posts: transformedPosts,
      pagination: {
        page: parseInt(page as string, 10),
        limit: parseInt(limit as string, 10),
        total,
        pages: Math.ceil(total / parseInt(limit as string, 10))
      },
      appliedFilters: {
        packId: packId || null,
        userId: userId || null,
        type: type || null,
        matchedCount: filteredTotal
      }
    });
  } catch (error) {
    logger.error('Failed to fetch community posts', { error });
    res.status(500).json({
      success: false,
      message: 'Failed to fetch community posts',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// @desc    Create community post
// @route   POST /api/community/posts
// @access  Private
router.post('/posts', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { content, images = [], packId, type = 'post', activityDetails } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Post content is required'
      });
    }

    // Create new community post
    const postData: any = {
      author: req.user?._id,
      content: content.trim(),
      images,
      packId,
      type,
      activityDetails: type === 'activity' ? activityDetails : undefined,
      moderationStatus: 'approved', // Auto-approve initially
      likes: [],
      comments: [],
      shares: []
    };

    const newPost = await CommunityPost.create(postData);
    await newPost.populate('author', 'firstName lastName avatar');
    await newPost.populate('packId', 'name');

    res.status(201).json({
      success: true,
      post: {
        _id: newPost._id,
        author: {
          _id: (newPost.author as any)?._id || req.user?._id,
          name: req.user ? `${req.user.firstName} ${req.user.lastName}` : 'Unknown User',
          avatar: (newPost.author as any)?.avatar || req.user?.avatar,
        },
        content: newPost.content,
        images: newPost.images,
        likes: 0,
        comments: [],
        createdAt: newPost.createdAt,
        packId: newPost.packId,
        packName: (newPost.packId as any)?.name,
        type: newPost.type,
        activityDetails: newPost.activityDetails
      },
      message: 'Post created successfully'
    });
  } catch (error) {
    logger.error('Failed to create community post', { error });
    res.status(500).json({
      success: false,
      message: 'Failed to create community post',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// @desc    Like/Unlike community post
// @route   POST /api/community/posts/:id/like
// @access  Private
router.post('/posts/:id/like', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { liked } = req.body; // Check if already liked to toggle

    // Toggle like on post
    const post = await CommunityPost.findById(id);
    
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    const wasLiked = post.toggleLike(req.user?._id);
    
    await post.save();
    
    await post.populate('author', 'firstName lastName avatar');
    
    const updatedPost = {
      _id: post._id,
      likes: post.likes?.length || 0,
      liked: wasLiked,
    };

    res.json({
      success: true,
      post: updatedPost,
      message: nowLiked ? 'Post liked successfully' : 'Post unliked successfully'
    });
  } catch (error) {
    logger.error('Failed to like community post', { error });
    res.status(500).json({
      success: false,
      message: 'Failed to like community post',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// @desc    Add comment to community post
// @route   POST /api/community/posts/:id/comments
// @access  Private
router.post('/posts/:id/comments', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Comment content is required'
      });
    }

    // For now, return mock response until Comment model is implemented
    const newComment = {
      _id: `comment-${Date.now()}`,
      author: {
        _id: req.user?._id || 'unknown',
        name: req.user ? `${req.user.firstName} ${req.user.lastName}` : 'Unknown User',
        avatar: req.user?.avatar || '/user-avatar.jpg',
      },
      content: content.trim(),
      createdAt: new Date().toISOString(),
      postId: id,
    };

    res.status(201).json({
      success: true,
      comment: newComment,
      message: 'Comment added successfully'
    });
  } catch (error) {
    logger.error('Failed to add community comment', { error });
    res.status(500).json({
      success: false,
      message: 'Failed to add community comment',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// @desc    Get comments for community post
// @route   GET /api/community/posts/:id/comments
// @access  Private
router.get('/posts/:id/comments', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 20 } = req.query;

    // For now, return mock comments until Comment model is implemented
    const mockComments = [
      {
        _id: 'c1',
        author: { _id: 'user2', name: 'Mike Chen', avatar: '/avatar2.jpg' },
        content: 'Looks like a perfect day! Max is such a handsome boy 😍',
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      },
    ];

    const total = mockComments.length;
    const comments = mockComments.slice((Number(page) - 1) * Number(limit), Number(page) * Number(limit));

    res.json({
      success: true,
      comments,
      pagination: {
        page: parseInt(page as string, 10),
        limit: parseInt(limit as string, 10),
        total,
        pages: Math.ceil(total / parseInt(limit as string, 10))
      },
      postId: id
    });
  } catch (error) {
    logger.error('Failed to fetch community comments', { error });
    res.status(500).json({
      success: false,
      message: 'Failed to fetch community comments',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// @desc    Delete community post
// @route   DELETE /api/community/posts/:id
// @access  Private
router.delete('/posts/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;

    // For now, return mock response
    res.json({
      success: true,
      message: 'Post deleted successfully'
    });
  } catch (error) {
    logger.error('Failed to delete community post', { error });
    res.status(500).json({
      success: false,
      message: 'Failed to delete community post',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// @desc    Update community post
// @route   PUT /api/community/posts/:id
// @access  Private
router.put('/posts/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { content, images, activityDetails } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Post content is required'
      });
    }

    // For now, return mock response
    const updatedPost = {
      _id: id,
      author: {
        _id: req.user?._id || 'unknown',
        name: req.user ? `${req.user.firstName} ${req.user.lastName}` : 'Unknown User',
        avatar: req.user?.avatar || '/user-avatar.jpg',
      },
      content: content.trim(),
      images: images || [],
      likes: 0,
      comments: [],
      createdAt: new Date().toISOString(),
      activityDetails: activityDetails || undefined,
    };

    res.json({
      success: true,
      post: updatedPost,
      message: 'Post updated successfully'
    });
  } catch (error) {
    logger.error('Failed to update community post', { error });
    res.status(500).json({
      success: false,
      message: 'Failed to update community post',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// @desc    Join activity
// @route   POST /api/community/posts/:id/join
// @access  Private
router.post('/posts/:id/join', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;

    // For now, return mock response
    const updatedPost = {
      _id: id,
      activityDetails: {
        date: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
        location: 'Santa Monica Beach, CA',
        maxAttendees: 30,
        currentAttendees: 19, // Incremented
        attending: true,
      },
    };

    res.json({
      success: true,
      post: updatedPost,
      message: 'Successfully joined activity'
    });
  } catch (error) {
    logger.error('Failed to join activity', { error });
    res.status(500).json({
      success: false,
      message: 'Failed to join activity',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// @desc    Leave activity
// @route   POST /api/community/posts/:id/leave
// @access  Private
router.post('/posts/:id/leave', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;

    // For now, return mock response
    const updatedPost = {
      _id: id,
      activityDetails: {
        date: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
        location: 'Santa Monica Beach, CA',
        maxAttendees: 30,
        currentAttendees: 17, // Decremented
        attending: false,
      },
    };

    res.json({
      success: true,
      post: updatedPost,
      message: 'Successfully left activity'
    });
  } catch (error) {
    logger.error('Failed to leave activity', { error });
    res.status(500).json({
      success: false,
      message: 'Failed to leave activity',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// @desc    Report content
// @route   POST /api/community/report
// @access  Private
router.post('/report', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { type, targetId, reason, description } = req.body;

    if (!type || !targetId || !reason) {
      return res.status(400).json({
        success: false,
        message: 'Report type, target ID, and reason are required'
      });
    }

    // For now, return mock response
    logger.info('Content reported', { type, targetId, reason, description, userId: req.user?._id });

    res.json({
      success: true,
      message: 'Report submitted successfully'
    });
  } catch (error) {
    logger.error('Failed to submit report', { error });
    res.status(500).json({
      success: false,
      message: 'Failed to submit report',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// @desc    Block user from community
// @route   POST /api/community/block
// @access  Private
router.post('/block', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    // For now, return mock response
    logger.info('User blocked', { blockedUserId: userId, blockedBy: req.user?._id });

    res.json({
      success: true,
      message: 'User blocked successfully'
    });
  } catch (error) {
    logger.error('Failed to block user', { error });
    res.status(500).json({
      success: false,
      message: 'Failed to block user',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;


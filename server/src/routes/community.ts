import express, { type Request, type Response, Router } from 'express';
import { requireAuth } from '../middleware/adminAuth';
import logger from '../utils/logger';
import User from '../models/User';
import mongoose from 'mongoose';
const CommunityPost = require('../models/CommunityPost');
import Report from '../models/Report';
import Block from '../models/Block';

interface AuthenticatedRequest extends Request {
  user?: any;
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
        matchedCount: total
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
      message: wasLiked ? 'Post liked successfully' : 'Post unliked successfully'
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

    // Add comment to post
    const post = await CommunityPost.findById(id);
    
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    post.addComment({
      author: req.user?._id,
      content: content.trim()
    });
    
    await post.save();
    
    const newComment = {
      _id: post.comments[post.comments.length - 1]._id,
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

    const post = await CommunityPost.findById(id)
      .populate('comments.author', 'firstName lastName avatar')
      .lean();

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    const total = post.comments?.length || 0;
    const skip = (Number(page) - 1) * Number(limit);
    const comments = (post.comments || []).slice(skip, skip + Number(limit));

    const transformedComments = comments.map((comment: any) => ({
      _id: comment._id,
      author: {
        _id: comment.author?._id || comment.author,
        name: comment.author ? `${comment.author.firstName || ''} ${comment.author.lastName || ''}`.trim() : 'Unknown User',
        avatar: comment.author?.avatar
      },
      content: comment.content,
      likes: comment.likes?.length || 0,
      createdAt: comment.createdAt,
      postId: id
    }));

    res.json({
      success: true,
      comments: transformedComments,
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
    const userId = req.user?._id || req.user?.id;

    const post = await CommunityPost.findById(id);
    
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    const isOwner = String(post.author) === String(userId);
    const isAdmin = req.user?.roles?.includes('admin') || false;

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this post'
      });
    }

    await CommunityPost.findByIdAndDelete(id);

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
    const userId = req.user?._id || req.user?.id;

    const post = await CommunityPost.findById(id);
    
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Only post owner can update
    if (String(post.author) !== String(userId)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this post'
      });
    }

    // Update fields
    if (content !== undefined) {
      post.content = content.trim();
    }
    if (images !== undefined) {
      post.images = images;
    }
    if (activityDetails !== undefined && post.type === 'activity') {
      post.activityDetails = activityDetails;
    }

    await post.save();
    await post.populate('author', 'firstName lastName avatar');

    res.json({
      success: true,
      post,
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
    const userId = req.user?._id || req.user?.id;

    const post = await CommunityPost.findByIdAndUpdate(
      id,
      { 
        $addToSet: { 
          'activityDetails.currentAttendees': new mongoose.Types.ObjectId(userId) 
        } 
      },
      { new: true }
    ).populate('author', 'firstName lastName avatar');

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    if (post.type !== 'activity') {
      return res.status(400).json({
        success: false,
        message: 'This is not an activity post'
      });
    }

    res.json({
      success: true,
      participants: post.activityDetails?.currentAttendees || [],
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
    const userId = req.user?._id || req.user?.id;

    const post = await CommunityPost.findByIdAndUpdate(
      id,
      { 
        $pull: { 
          'activityDetails.currentAttendees': new mongoose.Types.ObjectId(userId) 
        } 
      },
      { new: true }
    ).populate('author', 'firstName lastName avatar');

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    if (post.type !== 'activity') {
      return res.status(400).json({
        success: false,
        message: 'This is not an activity post'
      });
    }

    res.json({
      success: true,
      participants: post.activityDetails?.currentAttendees || [],
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
    const { targetType, targetId, reason } = req.body as { 
      targetType: 'post' | 'comment' | 'user'; 
      targetId: string; 
      reason?: string 
    };
    const reporterId = req.user?._id || req.user?.id;

    // Validate target type
    if (!['post', 'comment', 'user'].includes(targetType)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid targetType. Must be one of: post, comment, user'
      });
    }

    if (!targetId) {
      return res.status(400).json({
        success: false,
        message: 'targetId is required'
      });
    }

    // Create report
    await Report.create({
      reporterId,
      reportedUserId: targetType === 'user' ? targetId : undefined,
      reportedPetId: undefined, // Can be extended later if needed
      type: 'inappropriate_content', // Default type, can be extended
      category: targetType === 'post' || targetType === 'comment' ? 'chat' : 'user',
      reason: (reason || '').trim().slice(0, 1000),
      status: 'pending'
    });

    logger.info('Content reported', { 
      targetType, 
      targetId, 
      reason, 
      userId: reporterId 
    });

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
    const { userId } = req.body as { userId: string };
    const blockerId = req.user?._id || req.user?.id;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    if (userId === String(blockerId)) {
      return res.status(400).json({
        success: false,
        message: 'Cannot block yourself'
      });
    }

    // Create or update block (upsert to handle duplicates)
    await Block.updateOne(
      { blockerId, blockedId: userId },
      { $setOnInsert: { blockerId, blockedId: userId } },
      { upsert: true }
    );

    logger.info('User blocked', { 
      blockedUserId: userId, 
      blockedBy: blockerId 
    });

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


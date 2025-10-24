const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/adminAuth');
const logger = require('../utils/logger');

// Apply authentication to all community routes
router.use(requireAuth);

// @desc    Get community posts
// @route   GET /api/community/posts
// @access  Private
router.get('/posts', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      packId,
      userId,
      type
    } = req.query;

    // For now, return mock data until CommunityPost model is implemented
    const mockPosts = [
      {
        _id: '1',
        author: {
          _id: 'user1',
          name: 'Sarah Johnson',
          avatar: '/avatar1.jpg',
        },
        content: 'Just had an amazing walk with Max in Central Park! The weather was perfect and we met some wonderful dogs. 🐕🌳 #DogWalk #CentralPark',
        images: ['/park-photo1.jpg'],
        likes: 12,
        comments: [
          {
            _id: 'c1',
            author: { _id: 'user2', name: 'Mike Chen', avatar: '/avatar2.jpg' },
            content: 'Looks like a perfect day! Max is such a handsome boy 😍',
            createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          },
        ],
        createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        packId: 'pack1',
        packName: 'Central Park Paws',
        type: 'post',
      },
      {
        _id: '2',
        author: {
          _id: 'user3',
          name: 'Emma Davis',
          avatar: '/avatar3.jpg',
        },
        content: '📅 Upcoming Pack Activity: Beach Day at Santa Monica!\n\nJoin us this Saturday for a fun day at the beach. Dogs are welcome (leashed please) and there will be plenty of space to play and socialize.\n\nTime: 10 AM - 4 PM\nLocation: Santa Monica Beach\nBring: Water, sunscreen, waste bags\n\nRSVP by Friday!',
        images: ['/beach-activity.jpg'],
        likes: 25,
        comments: [],
        createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        packId: 'pack2',
        packName: 'Beach Buddies',
        type: 'activity',
        activityDetails: {
          date: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
          location: 'Santa Monica Beach, CA',
          maxAttendees: 30,
          currentAttendees: 18,
        },
      },
    ];

    const total = mockPosts.length;
    const posts = mockPosts
      .filter(post => {
        if (packId && post.packId !== packId) return false;
        if (userId && post.author._id !== userId) return false;
        if (type && post.type !== type) return false;
        return true;
      })
      .slice((page - 1) * limit, page * limit);
    const filteredTotal = posts.length;

    res.json({
      success: true,
      posts,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
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
      error: error.message
    });
  }
});

// @desc    Create community post
// @route   POST /api/community/posts
// @access  Private
router.post('/posts', async (req, res) => {
  try {
    const { content, images = [], packId, type = 'post', activityDetails } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Post content is required'
      });
    }

    // For now, return mock response until CommunityPost model is implemented
    const newPost = {
      _id: `post-${Date.now()}`,
      author: {
        _id: req.user._id,
        name: req.user.firstName + ' ' + req.user.lastName,
        avatar: req.user.avatar || '/user-avatar.jpg',
      },
      content: content.trim(),
      images,
      likes: 0,
      comments: [],
      createdAt: new Date().toISOString(),
      packId,
      type,
      activityDetails: type === 'activity' ? activityDetails : undefined,
    };

    res.status(201).json({
      success: true,
      post: newPost,
      message: 'Post created successfully'
    });
  } catch (error) {
    logger.error('Failed to create community post', { error });
    res.status(500).json({
      success: false,
      message: 'Failed to create community post',
      error: error.message
    });
  }
});

// @desc    Like/Unlike community post
// @route   POST /api/community/posts/:id/like
// @access  Private
router.post('/posts/:id/like', async (req, res) => {
  try {
    const { id } = req.params;

    // For now, return mock response until CommunityPost model is implemented
    const updatedPost = {
      _id: id,
      likes: 13, // Mock increment
      liked: true,
    };

    res.json({
      success: true,
      post: updatedPost,
      message: 'Post liked successfully'
    });
  } catch (error) {
    logger.error('Failed to like community post', { error });
    res.status(500).json({
      success: false,
      message: 'Failed to like community post',
      error: error.message
    });
  }
});

// @desc    Add comment to community post
// @route   POST /api/community/posts/:id/comments
// @access  Private
router.post('/posts/:id/comments', async (req, res) => {
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
        _id: req.user._id,
        name: req.user.firstName + ' ' + req.user.lastName,
        avatar: req.user.avatar || '/user-avatar.jpg',
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
      error: error.message
    });
  }
});

// @desc    Get comments for community post
// @route   GET /api/community/posts/:id/comments
// @access  Private
router.get('/posts/:id/comments', async (req, res) => {
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
    const comments = mockComments.slice((page - 1) * limit, page * limit);

    res.json({
      success: true,
      comments,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      },
      postId: id
    });
  } catch (error) {
    logger.error('Failed to fetch community comments', { error });
    res.status(500).json({
      success: false,
      message: 'Failed to fetch community comments',
      error: error.message
    });
  }
});

module.exports = router;

const express = require('express');
const multer = require('multer');
const { body } = require('express-validator');
const { validate } = require('../middleware/validation');
const { authenticateToken } = require('../middleware/auth');
const {
  getChatHistory,
  markMessagesRead,
  getOnlineUsers,
  getMessages,
  sendMessage,
  editMessage,
  deleteMessage,
  addReaction,
  removeReaction,
  searchMessages,
  getChatStats
} = require('../controllers/chatController');

// Multer configuration for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept images, videos, and audio files
    const allowedMimes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'video/mp4',
      'video/quicktime',
      'audio/m4a',
      'audio/mp3',
    ];
    
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('File type not allowed'), false);
    }
  },
});

const router = express.Router();

// Apply authentication to all chat routes
router.use(authenticateToken);

// Validation rules
const messageValidation = [
  body('content')
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage('Message content is required and must be less than 1000 characters'),
  body('messageType')
    .optional()
    .isIn(['text', 'image', 'location', 'file'])
    .withMessage('Invalid message type'),
  body('attachments')
    .optional()
    .isArray()
    .withMessage('Attachments must be an array')
];

const editMessageValidation = [
  body('content')
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage('Message content is required and must be less than 1000 characters')
];

const reactionValidation = [
  body('emoji')
    .isLength({ min: 1, max: 10 })
    .withMessage('Valid emoji is required')
];

const searchValidation = [
  body('q')
    .optional()
    .isLength({ min: 2 })
    .withMessage('Search query must be at least 2 characters')
];

// Message management routes
router.get('/history/:matchId', getChatHistory);
router.get('/:matchId/messages', getMessages);
router.post('/:matchId/messages', messageValidation, validate, sendMessage);
router.put('/messages/:messageId', editMessageValidation, validate, editMessage);
router.delete('/messages/:messageId', deleteMessage);

// Message reactions
router.post('/messages/:messageId/reactions', reactionValidation, validate, addReaction);
router.delete('/messages/:messageId/reactions/:emoji', removeReaction);

// Message search
router.get('/:matchId/search', searchValidation, validate, searchMessages);

// Chat statistics
router.get('/stats', getChatStats);

// Chat reactions route (simple version for mobile compatibility)
router.post('/reactions', async (req, res) => {
  try {
    const { matchId, messageId, reaction } = req.body;
    
    if (!matchId || !messageId || !reaction) {
      return res.status(400).json({
        success: false,
        error: 'MISSING_PARAMS',
        message: 'Missing required parameters'
      });
    }
    
    // In real implementation, add reaction to message
    res.json({
      success: true,
      messageId,
      reactions: [{ emoji: reaction, userId: req.userId, timestamp: new Date().toISOString() }]
    });
  } catch (error) {
    console.error('Reaction error:', error);
    res.status(500).json({
      success: false,
      error: 'INTERNAL_ERROR',
      message: error.message
    });
  }
});

// Chat attachments route
router.post('/attachments', upload.single('file'), async (req, res) => {
  try {
    const file = req.file;
    
    if (!file) {
      return res.status(400).json({
        success: false,
        error: 'MISSING_FILE',
        message: 'No file provided'
      });
    }
    
    // In real implementation, upload to cloud storage
    const mockUrl = `https://storage.pawfectmatch.com/uploads/${req.userId}/${Date.now()}-${file.originalname}`;
    
    res.json({
      success: true,
      url: mockUrl,
      type: file.mimetype.startsWith('image') ? 'image' : 
            file.mimetype.startsWith('video') ? 'video' : 'file'
    });
  } catch (error) {
    console.error('Attachment upload error:', error);
    res.status(500).json({
      success: false,
      error: 'UPLOAD_FAILED',
      message: error.message
    });
  }
});

// Voice notes route
router.post('/voice', async (req, res) => {
  try {
    const { matchId, duration } = req.body;
    
    if (!matchId || !duration) {
      return res.status(400).json({
        success: false,
        error: 'MISSING_PARAMS',
        message: 'Missing required parameters'
      });
    }
    
    // In real implementation, upload audio blob
    const mockUrl = `https://storage.pawfectmatch.com/voice/${req.userId}/${Date.now()}.m4a`;
    
    res.json({
      success: true,
      url: mockUrl,
      duration: parseFloat(duration)
    });
  } catch (error) {
    console.error('Voice note error:', error);
    res.status(500).json({
      success: false,
      error: 'VOICE_UPLOAD_FAILED',
      message: error.message
    });
  }
});

// Legacy routes (for backward compatibility)
router.post('/:matchId/send', messageValidation, validate, sendMessage);
router.post('/:matchId/read', markMessagesRead);
router.get('/online', getOnlineUsers);

module.exports = router;
import express, { type Request, type Response, Router } from 'express';
import multer from 'multer';
import { body } from 'express-validator';
import { validate } from '../middleware/validation';
import { authenticateToken } from '../middleware/auth';
import { type IUserDocument } from '../models/User';
import {
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
} from '../controllers/chatController';

interface AuthenticatedRequest extends Request {
  userId: string;
  user?: IUserDocument;
}

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

const router: Router = express.Router();

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

// Type-safe wrapper function
const wrapHandler = (handler: (req: any, res: Response) => Promise<void>) => {
  return async (req: Request, res: Response): Promise<void> => {
    return handler(req, res);
  };
};

// Message management routes
router.get('/history/:matchId', wrapHandler(getChatHistory));
router.get('/:matchId/messages', wrapHandler(getMessages));
router.post('/:matchId/messages', messageValidation, validate, wrapHandler(sendMessage));
router.put('/messages/:messageId', editMessageValidation, validate, wrapHandler(editMessage));
router.delete('/messages/:messageId', wrapHandler(deleteMessage));

// Message reactions
router.post('/messages/:messageId/reactions', reactionValidation, validate, wrapHandler(addReaction));
router.delete('/messages/:messageId/reactions/:emoji', wrapHandler(removeReaction));

// Message search
router.get('/:matchId/search', searchValidation, validate, wrapHandler(searchMessages));

// Chat statistics
router.get('/stats', wrapHandler(getChatStats));

// Chat reactions route (simple version for mobile compatibility)
router.post('/reactions', async (req: Request, res: Response) => {
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
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Chat attachments route
router.post('/attachments', upload.single('file'), async (req: Request, res: Response) => {
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
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Voice notes route
router.post('/voice', async (req: Request, res: Response) => {
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
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Legacy routes (for backward compatibility)
router.post('/:matchId/send', messageValidation, validate, wrapHandler(sendMessage));
router.post('/:matchId/read', wrapHandler(markMessagesRead));
router.get('/online', wrapHandler(getOnlineUsers));

export default router;

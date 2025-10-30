import express, { type Request, type Response, Router } from 'express';
import multer from 'multer';
import { body } from 'express-validator';
import { validate } from '../middleware/validation';
import { authenticateToken } from '../middleware/auth';
import { type IUserDocument } from '../models/User';
import {
  getMessages,
  sendMessage,
  editMessage,
  deleteMessage,
  addReaction,
  removeReaction,
  searchMessages,
  getChatStats
} from '../controllers/chatController';
import logger from '../utils/logger';
import { createTypeSafeWrapper, handleRouteError, createRouteError } from '../types/routes';
import type { ChatRequest, ReactionRequest, AuthenticatedFileRequest } from '../types/routes';

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
      cb(new Error('File type not allowed') as Error, false);
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
const wrapHandler = (handler: (req: AuthenticatedRequest, res: Response) => Promise<void>) => {
  return async (req: Request, res: Response): Promise<void> => {
    return handler(req as AuthenticatedRequest, res);
  };
};

// Message management routes
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
router.post('/reactions', wrapHandler(async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { matchId, messageId, reaction } = req.body;
    
    if (!matchId || !messageId || !reaction) {
      res.status(400).json({
        success: false,
        error: 'MISSING_PARAMS',
        message: 'Missing required parameters'
      });
      return;
    }

    const match = await (await import('../models/Match')).default.findOne({
      _id: matchId,
      $or: [{ user1: req.userId }, { user2: req.userId }]
    });

    if (!match) {
      res.status(404).json({
        success: false,
        error: 'MATCH_NOT_FOUND',
        message: 'Match not found or access denied'
      });
      return;
    }

    const matchDoc = match as { messages: { id: (id: string) => unknown } };
    const message = matchDoc.messages.id(messageId);
    if (!message) {
      res.status(404).json({
        success: false,
        error: 'MESSAGE_NOT_FOUND',
        message: 'Message not found'
      });
      return;
    }

    // Add reaction if not already present
    if (!message.reactions) {
      message.reactions = [];
    }

    // Check if user already reacted with this emoji
    const existingIndex = message.reactions.findIndex((r) =>
      r.user?.toString() === req.userId && r.emoji === reaction
    );

    if (existingIndex >= 0) {
      // Remove existing reaction
      message.reactions.splice(existingIndex, 1);
    } else {
      // Add new reaction
      message.reactions.push({
        user: req.userId,
        emoji: reaction,
        reactedAt: new Date()
      });
    }

    await match.save();

    res.json({
      success: true,
      messageId,
      reactions: message.reactions.map((r) => ({
        emoji: r.emoji,
        userId: r.user?.toString(),
        timestamp: r.reactedAt.toISOString()
      }))
    });
  } catch (error) {
    logger.error('Reaction error:', error);
    handleRouteError(error, res);
  }
}));

// Chat attachments route
router.post('/attachments', upload.single('file'), async (req: AuthenticatedFileRequest, res: Response) => {
  try {
    const file = req.file;
    
    if (!file) {
      res.status(400).json({
        success: false,
        error: 'MISSING_FILE',
        message: 'No file provided'
      });
      return;
    }

    const userId = req.userId || req.user?._id;
    if (!userId) {
      res.status(401).json({
        success: false,
        error: 'UNAUTHORIZED',
        message: 'User not authenticated'
      });
      return;
    }

    // Generate S3 key
    const { generateKey } = await import('../services/s3Service');
    const ext = file.mimetype.startsWith('image') ? '.jpg' : 
                file.mimetype.startsWith('video') ? '.mp4' : '.bin';
    const key = generateKey(userId, ext);

    // Upload to S3
    const { putSimple } = await import('../services/s3Service');
    const url = await putSimple(key, file.mimetype, file.buffer);

    // Register in Upload model for tracking
    const Upload = await import('../models/Upload');
    await Upload.default.create({
      userId,
      type: file.mimetype.startsWith('image') ? 'chat_image' : 
            file.mimetype.startsWith('video') ? 'chat_video' : 'chat_file',
      s3Key: key,
      filename: file.originalname,
      url,
      mimeType: file.mimetype,
      size: file.size,
      status: 'uploaded'
    });
    
    res.json({
      success: true,
      url,
      type: file.mimetype.startsWith('image') ? 'image' : 
            file.mimetype.startsWith('video') ? 'video' : 'file'
    });
  } catch (error) {
    logger.error('Attachment upload error:', error);
    handleRouteError(error, res);
  }
});

// Voice notes route
router.post('/:matchId/voice-note', async (req: Request, res: Response) => {
  try {
    const { key, duration, waveform } = req.body as { key: string; duration: number; waveform: number[] };
    
    // In a real implementation, you would:
    // 1. Save the message to the match's messages array
    // 2. Emit to the match's socket room
    // 3. Update lastActivity timestamp
    
    const match = await (await import('../models/Match')).default.findOne({
      _id: req.params.matchId,
      $or: [{ user1: req.userId }, { user2: req.userId }]
    });
    
    if (!match) {
      return res.status(404).json({ success: false, message: 'Match not found' });
    }
    
    const message = {
      sender: req.userId,
      type: 'voice',
      voice: { s3Key: key, duration, waveform },
      createdAt: new Date(),
    };
    
    (match as unknown as { messages: unknown[]; lastActivity: Date }).messages.push(message);
    (match as unknown as { lastActivity: Date }).lastActivity = new Date();
    await match.save();
    
    // Emit to other user via socket.io if available
    const io = (global as { io?: { to: (room: string) => { emit: (event: string, data: unknown) => void } } }).io;
    if (io) {
      io.to(req.params.matchId).emit('message:new', message);
    }
    
    res.json({ success: true, message });
  } catch (error) {
    console.error('Voice note error:', error);
    handleRouteError(error, res);
  }
});

// Voice notes presign route
router.post('/voice/presign', async (req: AuthenticatedFileRequest, res: Response) => {
  try {
    const { contentType = 'audio/webm' } = req.body;
    const userId = req.userId || req.user?._id;
    
    if (!userId) {
      res.status(401).json({
        success: false,
        error: 'UNAUTHORIZED',
        message: 'User not authenticated'
      });
      return;
    }
    
    const { generateKey } = await import('../services/s3Service');
    const key = generateKey(userId, '.webm');

    const { getSignedPutUrl } = await import('../services/s3');
    const url = await getSignedPutUrl(key, contentType, 300); // 5 minutes expiry
    
    res.json({
      success: true,
      url,
      key
    });
  } catch (error) {
    logger.error('Voice presign error:', error);
    handleRouteError(error, res);
  }
});

// Legacy routes (for backward compatibility)
router.post('/:matchId/send', messageValidation, validate, wrapHandler(sendMessage));

export default router;

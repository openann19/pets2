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
import {
  getSmartSuggestions,
  getPetCareAdvice,
  getCompatibilityQuestions,
  getConversationStarters,
} from '../controllers/smartSuggestionsController';
import {
  checkContentSafety,
  reportContent,
  getSafetyGuidelines,
  getEmergencyContacts,
} from '../controllers/contentModerationController';
import {
  initiateCall,
  getCallToken,
  acceptCall,
  rejectCall,
  endCall,
  getActiveCall,
  toggleMute,
  toggleVideo,
  switchCamera,
  reportCallQuality,
  getCallHistory,
} from '../controllers/videoCallController';
import logger from '../utils/logger';
import { createTypeSafeWrapper, handleRouteError, createRouteError } from '../types/routes';
import type { ChatRequest, ReactionRequest, AuthenticatedFileRequest } from '../types/routes';
import type { Server as SocketIOServer } from 'socket.io';
import type { Document } from 'mongoose';

// Type definitions for Match messages
interface MatchMessage {
  _id: string | { toString: () => string };
  sender: string | { toString: () => string };
  content: string;
  messageType: 'text' | 'image' | 'video' | 'location' | 'system' | 'voice' | 'file' | 'gif' | 'sticker';
  attachments?: Array<{
    type?: string;
    fileType?: string;
    fileName?: string;
    fileSize?: number;
    url?: string;
  }>;
  voiceMetadata?: {
    duration: number;
    waveform: number[];
  };
  replyTo?: string | { toString: () => string };
  reactions: Array<{
    user?: string | { toString: () => string };
    emoji: string;
    reactedAt: Date;
  }>;
  status: 'sending' | 'sent' | 'delivered' | 'read' | 'failed';
  readBy: Array<{
    user: string | { toString: () => string };
    readAt: Date;
  }>;
  sentAt: Date;
  deliveredAt?: Date;
  editedAt?: Date;
  isEdited?: boolean;
  isDeleted?: boolean;
  deletedAt?: Date;
}

interface MatchWithMessages extends Document {
  _id: string;
  user1: string | { toString: () => string };
  user2: string | { toString: () => string };
  messages: {
    id: (id: string) => MatchMessage | null;
    push: (message: MatchMessage) => number;
    length: number;
    filter: (predicate: (msg: MatchMessage) => boolean) => MatchMessage[];
    map: <T>(fn: (msg: MatchMessage) => T) => T[];
    [index: number]: MatchMessage;
  };
  lastActivity: Date;
  lastMessageAt?: Date;
  status: 'active' | 'archived' | 'blocked' | 'deleted' | 'completed';
  populate: (paths: string | Array<string | { path: string; select?: string }>) => Promise<MatchWithMessages>;
  save: () => Promise<MatchWithMessages>;
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

// Authenticated request interface
interface AuthenticatedRequest extends Request {
  userId: string;
  user?: IUserDocument;
  params: {
    matchId?: string;
    messageId?: string;
    rootMessageId?: string;
    emoji?: string;
  };
  body: {
    matchId?: string;
    messageId?: string;
    reaction?: string;
    url?: string;
    duration?: number;
    waveform?: number[];
    contentType?: string;
    [key: string]: unknown;
  };
}

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

// Reply threads
router.get('/:matchId/thread/:rootMessageId', authenticateToken, wrapHandler(async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { matchId, rootMessageId } = req.params;

    const Match = (await import('../models/Match')).default;
    const match = await Match.findOne({
      _id: matchId,
      $or: [{ user1: req.userId }, { user2: req.userId }]
    });

    if (!match) {
      res.status(404).json({
        success: false,
        message: 'Match not found or access denied'
      });
      return;
    }

    // Find root message
    const matchTyped = match as unknown as MatchWithMessages;
    const rootMessage = matchTyped.messages.id(rootMessageId);
    if (!rootMessage) {
      res.status(404).json({
        success: false,
        message: 'Root message not found'
      });
      return;
    }

    // Find all replies to this message (recursive)
    interface ThreadMessage {
      message: MatchMessage;
      replies: ThreadMessage[];
    }
    
    const findReplies = (messageId: string): ThreadMessage[] => {
      return matchTyped.messages
        .filter((msg: MatchMessage) => {
          if (!msg.replyTo) return false;
          const replyToId = typeof msg.replyTo === 'string' ? msg.replyTo : msg.replyTo.toString();
          const msgId = typeof msg._id === 'string' ? msg._id : msg._id.toString();
          return replyToId === messageId.toString();
        })
        .map((msg: MatchMessage) => {
          const msgId = typeof msg._id === 'string' ? msg._id : msg._id.toString();
          return {
            message: msg,
            replies: findReplies(msgId)
          };
        });
    };

    const threadMessages = findReplies(rootMessageId);

    // Populate sender info
    await match.populate([
      { path: 'messages.sender', select: 'firstName lastName avatar' },
      { path: 'messages.replyTo.sender', select: 'firstName lastName avatar' }
    ]);

    res.json({
      success: true,
      data: {
        rootMessage,
        threadMessages
      }
    });
  } catch (error) {
    logger.error('Get thread messages error:', error);
    handleRouteError(error, res);
  }
}));

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

    const matchTyped = match as unknown as MatchWithMessages;
    const message = matchTyped.messages.id(messageId);
    if (!message) {
      res.status(404).json({
        success: false,
        error: 'MESSAGE_NOT_FOUND',
        message: 'Message not found'
      });
      return;
    }

    // Add reaction if not already present
    const messageTyped = message as MatchMessage;
    if (!messageTyped.reactions) {
      messageTyped.reactions = [];
    }

    // Check if user already reacted with this emoji
    const existingIndex = messageTyped.reactions.findIndex((r) => {
      const userId = typeof r.user === 'string' ? r.user : r.user?.toString();
      return userId === req.userId && r.emoji === reaction;
    });

    if (existingIndex >= 0) {
      // Remove existing reaction
      messageTyped.reactions.splice(existingIndex, 1);
    } else {
      // Add new reaction
      messageTyped.reactions.push({
        user: req.userId,
        emoji: reaction,
        reactedAt: new Date()
      });
    }

    await matchTyped.save();

    res.json({
      success: true,
      messageId,
      reactions: messageTyped.reactions.map((r) => {
        const userId = typeof r.user === 'string' ? r.user : r.user?.toString();
        return {
          emoji: r.emoji,
          userId,
          timestamp: r.reactedAt.toISOString()
        };
      })
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
router.post('/:matchId/voice-note', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { url, duration, waveform } = req.body as { url: string; duration: number; waveform?: number[] };
    const matchId = req.params.matchId;
    const userId = req.userId || req.user?._id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'UNAUTHORIZED',
        message: 'User not authenticated',
      });
    }

    if (!url || !duration) {
      return res.status(400).json({
        success: false,
        error: 'MISSING_DATA',
        message: 'URL and duration are required',
      });
    }

    const Match = require('../models/Match').default;
    const match = await Match.findOne({
      _id: matchId,
      $or: [{ user1: userId }, { user2: userId }],
    }).populate('user1 user2', 'firstName lastName avatar');

    if (!match) {
      return res.status(404).json({
        success: false,
        error: 'MATCH_NOT_FOUND',
        message: 'Match not found',
      });
    }

    if (match.status !== 'active') {
      return res.status(400).json({
        success: false,
        error: 'INACTIVE_MATCH',
        message: 'Cannot send message to inactive match',
      });
    }

    // Add voice note message to match
    const matchTyped = match as unknown as MatchWithMessages;
    const voiceMessage: MatchMessage = {
      _id: new Date().getTime().toString(), // Temporary ID, will be replaced by mongoose
      sender: userId,
      content: '[Voice Note]',
      messageType: 'voice',
      attachments: [{
        url,
        fileType: 'audio/m4a',
        fileName: `voice_${Date.now()}.m4a`,
        fileSize: 0, // Would need actual file size if available
      }],
      sentAt: new Date(),
      readBy: [{
        user: userId,
        readAt: new Date(),
      }],
      status: 'sent',
      reactions: [],
      // Store voice-specific metadata
      voiceMetadata: {
        duration,
        waveform: waveform || [],
      },
    };

    matchTyped.messages.push(voiceMessage);
    matchTyped.lastActivity = new Date();
    matchTyped.lastMessageAt = new Date();
    await matchTyped.save();

    // Get the saved message
    const savedMessage = matchTyped.messages[matchTyped.messages.length - 1];
    if (savedMessage && req.user) {
      savedMessage.sender = req.user._id.toString();
    }

    // Emit to match room via socket.io
    const globalSocket = global as { io?: SocketIOServer };
    const io = globalSocket.io;
    if (io) {
      io.to(`match_${matchId}`).emit('new_message', {
        matchId,
        message: savedMessage,
      });
    }

    logger.info('Voice note sent', { matchId, userId, duration });

    res.json({
      success: true,
      message: savedMessage,
    });
  } catch (error) {
    logger.error('Voice note error:', { error });
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

// Phase 2: Message Scheduling
import {
  createScheduled,
  getScheduled,
  cancelScheduled,
} from '../controllers/messageSchedulingController';
router.post('/schedule', authenticateToken, wrapHandler(createScheduled));
router.get('/schedule', authenticateToken, wrapHandler(getScheduled));
router.delete('/schedule/:messageId', authenticateToken, wrapHandler(cancelScheduled));

// Phase 2: Translation
import { translateMessage } from '../controllers/translationController';
router.post('/translate', authenticateToken, wrapHandler(translateMessage));

// Phase 2: Message Templates
import {
  createTemplate,
  getTemplates,
  renderTemplate,
  updateTemplate,
  deleteTemplate,
} from '../controllers/messageTemplateController';
router.post('/templates', authenticateToken, wrapHandler(createTemplate));
router.get('/templates', authenticateToken, wrapHandler(getTemplates));
router.post('/templates/:templateId/render', authenticateToken, wrapHandler(renderTemplate));
router.put('/templates/:templateId', authenticateToken, wrapHandler(updateTemplate));
router.delete('/templates/:templateId', authenticateToken, wrapHandler(deleteTemplate));

// Phase 2: Smart Suggestions
import { getSuggestions } from '../controllers/smartSuggestionsController';
router.post('/suggestions', authenticateToken, wrapHandler(getSuggestions));

// Phase 2: Offline Outbox Sync
import { syncOutboxItems } from '../controllers/outboxSyncController';
router.post('/outbox/sync', authenticateToken, wrapHandler(syncOutboxItems));

// Pet-centric chat features
router.post('/:matchId/share-pet-profile', authenticateToken, wrapHandler(sharePetProfile));
router.get('/:matchId/compatibility', authenticateToken, wrapHandler(getCompatibilityIndicator));
router.post('/:matchId/playdate-proposal', authenticateToken, wrapHandler(createPlaydateProposal));
router.post('/:matchId/playdate/:proposalId/accept', authenticateToken, wrapHandler(async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { matchId, proposalId } = req.params;
    const Match = (await import('../models/Match')).default;
    const match = await Match.findOne({
      _id: matchId,
      $or: [{ user1: req.userId }, { user2: req.userId }]
    });

    if (!match) {
      res.status(404).json({ success: false, message: 'Match not found' });
      return;
    }

    // Find message with playdate proposal
    const message = match.messages.find((msg: any) => 
      msg.playdateProposal?.proposalId === proposalId
    );

    if (!message || !(message as any).playdateProposal) {
      res.status(404).json({ success: false, message: 'Proposal not found' });
      return;
    }

    const proposal = (message as any).playdateProposal;
    proposal.status = 'accepted';
    proposal.acceptedAt = new Date().toISOString();

    await match.save();

    res.json({
      success: true,
      data: { proposal }
    });
  } catch (error) {
    logger.error('Accept playdate error', { error });
    res.status(500).json({ success: false, message: 'Failed to accept playdate' });
  }
}));
router.post('/:matchId/playdate/:proposalId/decline', authenticateToken, wrapHandler(async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { matchId, proposalId } = req.params;
    const Match = (await import('../models/Match')).default;
    const match = await Match.findOne({
      _id: matchId,
      $or: [{ user1: req.userId }, { user2: req.userId }]
    });

    if (!match) {
      res.status(404).json({ success: false, message: 'Match not found' });
      return;
    }

    const message = match.messages.find((msg: any) => 
      msg.playdateProposal?.proposalId === proposalId
    );

    if (!message || !(message as any).playdateProposal) {
      res.status(404).json({ success: false, message: 'Proposal not found' });
      return;
    }

    const proposal = (message as any).playdateProposal;
    proposal.status = 'declined';
    proposal.declinedAt = new Date().toISOString();

    await match.save();

    res.json({ success: true });
  } catch (error) {
    logger.error('Decline playdate error', { error });
    res.status(500).json({ success: false, message: 'Failed to decline playdate' });
  }
}));
router.post('/:matchId/health-alert', authenticateToken, wrapHandler(createHealthAlert));

// Smart Suggestions routes
router.post('/:matchId/suggestions', authenticateToken, wrapHandler(getSmartSuggestions));
router.post('/:matchId/suggestions/care-advice', authenticateToken, wrapHandler(getPetCareAdvice));
router.get('/:matchId/suggestions/compatibility-questions', authenticateToken, wrapHandler(getCompatibilityQuestions));
router.post('/:matchId/suggestions/conversation-starters', authenticateToken, wrapHandler(getConversationStarters));

// Content Moderation routes
router.post('/moderation/check', authenticateToken, wrapHandler(checkContentSafety));
router.post('/moderation/report', authenticateToken, wrapHandler(reportContent));
router.get('/moderation/guidelines', authenticateToken, wrapHandler(getSafetyGuidelines));
router.get('/moderation/emergency-contacts', authenticateToken, wrapHandler(getEmergencyContacts));

// Video Call routes
router.post('/video-call/initiate', authenticateToken, wrapHandler(initiateCall));
router.get('/video-call/:sessionId/token', authenticateToken, wrapHandler(getCallToken));
router.post('/video-call/:sessionId/accept', authenticateToken, wrapHandler(acceptCall));
router.post('/video-call/:sessionId/reject', authenticateToken, wrapHandler(rejectCall));
router.post('/video-call/:sessionId/end', authenticateToken, wrapHandler(endCall));
router.get('/video-call/active/:matchId', authenticateToken, wrapHandler(getActiveCall));
router.post('/video-call/:sessionId/mute', authenticateToken, wrapHandler(toggleMute));
router.post('/video-call/:sessionId/video', authenticateToken, wrapHandler(toggleVideo));
router.post('/video-call/:sessionId/switch-camera', authenticateToken, wrapHandler(switchCamera));

// Video Call Quality & History routes
router.post('/video-call/:sessionId/quality', authenticateToken, wrapHandler(reportCallQuality));
router.get('/video-call/history/:matchId', authenticateToken, wrapHandler(getCallHistory));

export default router;

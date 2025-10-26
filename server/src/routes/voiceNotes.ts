import { Router } from 'express';
import multer from 'multer';
import { authenticateToken } from '../middleware/auth';
import { uploadVideo } from '../services/cloudinaryService';
import Message from '../models/Message';
import logger from '../utils/logger';

const router = Router();
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit for voice notes
});

/**
 * POST /api/chat/:matchId/voice
 * Upload and store a voice note
 */
router.post('/:matchId/voice', authenticateToken, upload.single('voice'), async (req, res) => {
  try {
    const userId = (req as any).userId;
    const { matchId } = req.params;
    const { duration } = req.body;

    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No file uploaded' });
    }

    // Upload to Cloudinary
    const url = await uploadVideo(req.file.buffer, 'pawfectmatch/voice');

    // Create message record
    const message = await Message.create({
      matchId,
      senderId: userId,
      type: 'voice',
      content: url,
      duration: duration ? parseInt(duration) : undefined,
    });

    // Emit socket event
    const io = req.app.get('io');
    if (io) {
      io.to(matchId).emit('message:new', message);
    }

    res.json({ success: true, data: { message } });
  } catch (error: any) {
    logger.error('Voice note upload failed', { error: error.message });
    res.status(500).json({ success: false, error: 'Failed to upload voice note' });
  }
});

/**
 * GET /api/chat/:matchId/voice/:messageId
 * Stream voice note (with authentication check)
 */
router.get('/:matchId/voice/:messageId', authenticateToken, async (req, res) => {
  try {
    const { messageId } = req.params;
    const message = await Message.findById(messageId);

    if (!message || message.type !== 'voice') {
      return res.status(404).json({ success: false, error: 'Voice note not found' });
    }

    // Return Cloudinary URL (they handle streaming)
    res.json({ success: true, data: { url: message.content } });
  } catch (error: any) {
    logger.error('Voice note fetch failed', { error: error.message });
    res.status(500).json({ success: false, error: 'Failed to fetch voice note' });
  }
});

export default router;


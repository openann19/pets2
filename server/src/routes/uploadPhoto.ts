import { Router, Request, Response } from 'express';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import streamifier from 'streamifier';
import { authenticateToken } from '../middleware/auth';
import logger from '../utils/logger';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD || process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_KEY || process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_SECRET || process.env.CLOUDINARY_API_SECRET,
});

const upload = multer();
const router = Router();

/**
 * POST /api/upload/photo
 * Upload a photo to Cloudinary
 * Accepts: multipart/form-data with 'file' field
 */
router.post('/photo', authenticateToken, upload.single('file'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'NO_FILE' });
    }

    const stream = cloudinary.uploader.upload_stream(
      { folder: 'pawfect/pets', resource_type: 'image' },
      (err, result) => {
        if (err || !result) {
          logger.error('Cloudinary upload failed', { error: err });
          return res.status(500).json({ success: false, error: 'UPLOAD_FAIL' });
        }
        res.json({ success: true, data: { url: result.secure_url } });
      }
    );

    streamifier.createReadStream(req.file.buffer).pipe(stream);
  } catch (error: any) {
    logger.error('Photo upload error', { error: error.message });
    res.status(500).json({ success: false, error: 'UPLOAD_FAIL' });
  }
});

/**
 * POST /api/upload/voice
 * Upload a voice note to Cloudinary
 * Accepts: multipart/form-data with 'file' field
 */
router.post('/voice', authenticateToken, upload.single('file'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'NO_FILE' });
    }

    const stream = cloudinary.uploader.upload_stream(
      { folder: 'pawfect/voice', resource_type: 'video', format: 'webm' },
      (err, result) => {
        if (err || !result) {
          logger.error('Voice upload failed', { error: err });
          return res.status(500).json({ success: false });
        }
        res.json({ success: true, data: { url: result.secure_url } });
      }
    );

    streamifier.createReadStream(req.file.buffer).pipe(stream);
  } catch (error: any) {
    logger.error('Voice upload error', { error: error.message });
    res.status(500).json({ success: false });
  }
});

export default router;


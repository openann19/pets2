/**
 * Uploads Routes for PawReels
 */

import { Router } from 'express';
import { z } from 'zod';
import { presignUpload, validatePresignedUpload } from '../services/s3';

const router = Router();

const presignSchema = z.object({
  files: z.array(z.object({
    key: z.string(),
    contentType: z.string().optional(),
  })),
});

/**
 * POST /uploads/sign
 * Generate signed URLs for direct S3 uploads
 */
router.post('/sign', async (req, res) => {
  try {
    const body = presignSchema.parse(req.body);
    
    const urls = await Promise.all(
      body.files.map(async (file) => {
        if (file.contentType) {
          validatePresignedUpload(file.key, file.contentType);
        }
        return await presignUpload({ key: file.key, contentType: file.contentType });
      })
    );
    
    res.json(urls);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

export default router;

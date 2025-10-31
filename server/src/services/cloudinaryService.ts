import { v2 as cloudinary } from 'cloudinary';
import streamifier from 'streamifier';
import logger from '../utils/logger';
import { getCDNUrl, getOptimizedImageUrl } from '../config/cdn';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});

export interface UploadOptions {
  folder?: string;
  resource_type?: 'image' | 'video' | 'raw' | 'auto';
  transformation?: any[];
  format?: string;
}

/**
 * Upload file buffer to Cloudinary
 */
export function uploadToCloudinary(
  buffer: Buffer,
  options: UploadOptions = {}
): Promise<cloudinary.UploadApiResponse> {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: options.folder || 'pawfectmatch',
        resource_type: options.resource_type || 'image',
        transformation: options.transformation,
        format: options.format,
      },
      (error, result) => {
        if (error) {
          logger.error('Cloudinary upload error', { error: error.message });
          reject(error);
        } else if (result) {
          resolve(result);
        } else {
          reject(new Error('Upload failed with no error or result'));
        }
      }
    );

    streamifier.createReadStream(buffer).pipe(uploadStream);
  });
}

/**
 * Upload image file
 */
export async function uploadImage(buffer: Buffer, folder = 'pawfectmatch/photos'): Promise<string> {
  try {
    const result = await uploadToCloudinary(buffer, {
      folder,
      resource_type: 'image',
      transformation: [
        { width: 800, height: 800, crop: 'limit', quality: 'auto' },
        { fetch_format: 'auto' }
      ],
    });
    
    // Return CDN URL if configured, otherwise return Cloudinary URL
    const cdnUrl = getCDNUrl(result.secure_url, {
      format: 'webp',
      quality: 80,
    });
    return cdnUrl;
  } catch (error) {
    logger.error('Image upload failed', { error: (error as Error).message });
    throw error;
  }
}

/**
 * Upload video/voice note
 */
export async function uploadVideo(buffer: Buffer, folder = 'pawfectmatch/voice'): Promise<string> {
  try {
    const result = await uploadToCloudinary(buffer, {
      folder,
      resource_type: 'video',
      format: 'webm',
    });
    
    // Return CDN URL if configured, otherwise return Cloudinary URL
    const cdnUrl = getCDNUrl(result.secure_url);
    return cdnUrl;
  } catch (error) {
    logger.error('Video upload failed', { error: (error as Error).message });
    throw error;
  }
}

/**
 * Delete file from Cloudinary
 */
export async function deleteFromCloudinary(publicId: string): Promise<void> {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    logger.error('Cloudinary delete error', { error: (error as Error).message, publicId });
    throw error;
  }
}

export default {
  uploadToCloudinary,
  uploadImage,
  uploadVideo,
  deleteFromCloudinary,
};

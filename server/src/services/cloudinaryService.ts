import { v2 as cloudinary } from 'cloudinary';
const logger = require('../utils/logger');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Cloudinary upload result interface
export interface CloudinaryUploadResult {
  asset_id: string;
  public_id: string;
  version: number;
  version_id: string;
  signature: string;
  width: number;
  height: number;
  format: string;
  resource_type: string;
  created_at: string;
  tags: string[];
  bytes: number;
  type: string;
  etag: string;
  placeholder: boolean;
  url: string;
  secure_url: string;
  access_mode: string;
  overwritten: boolean;
  pages?: number;
  folder: string;
  path?: string;
}

// Cloudinary deletion result interface
export interface CloudinaryDeletionResult {
  result: 'ok' | 'not found';
  public_id: string;
}

// Upload options interface
export interface CloudinaryUploadOptions {
  folder?: string;
  resource_type?: 'auto' | 'image' | 'video' | 'raw';
  transformation?: any[];
  [key: string]: any;
}

// Image transformations interface
export interface ImageTransformations {
  width?: number;
  height?: number;
  crop?: string;
  quality?: string | number;
  fetch_format?: string;
  dpr?: string | number;
  [key: string]: any;
}

// Image variants interface
export interface ImageVariants {
  thumbnail: string;
  small: string;
  medium: string;
  large: string;
  original: string;
}

/**
 * Upload image to Cloudinary
 * @param fileBuffer - Image buffer
 * @param folder - Cloudinary folder
 * @param options - Additional upload options
 * @returns Promise resolving to upload result
 */
export const uploadToCloudinary = (
  fileBuffer: Buffer | string,
  folder: string = 'pawfectmatch',
  options: CloudinaryUploadOptions = {}
): Promise<CloudinaryUploadResult> => {
  return new Promise((resolve, reject) => {
    const uploadOptions: CloudinaryUploadOptions = {
      folder,
      resource_type: 'auto',
      transformation: [
        { width: 800, height: 800, crop: 'limit', quality: 'auto:good', dpr: 'auto' },
        { fetch_format: 'auto' }
      ],
      ...options
    };

    cloudinary.uploader.upload_stream(
      uploadOptions,
      (error, result) => {
        if (error) {
          logger.error('Cloudinary upload error:', { error });
          reject(error);
        } else if (result) {
          resolve(result as unknown as CloudinaryUploadResult);
        } else {
          reject(new Error('Upload failed: no result returned'));
        }
      }
    ).end(fileBuffer);
  });
};

/**
 * Delete image from Cloudinary
 * @param publicId - Cloudinary public ID
 * @returns Promise resolving to deletion result
 */
export const deleteFromCloudinary = (publicId: string): Promise<CloudinaryDeletionResult> => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.destroy(publicId, (error, result) => {
      if (error) {
        logger.error('Cloudinary deletion error:', { error });
        reject(error);
      } else if (result) {
        resolve(result as unknown as CloudinaryDeletionResult);
      } else {
        reject(new Error('Deletion failed: no result returned'));
      }
    });
  });
};

/**
 * Generate optimized image URL
 * @param publicId - Cloudinary public ID
 * @param transformations - Image transformations
 * @returns Optimized image URL
 */
export const getOptimizedImageUrl = (
  publicId: string,
  transformations: ImageTransformations = {}
): string => {
  const defaultTransformations: ImageTransformations = {
    width: 400,
    height: 400,
    crop: 'fill',
    quality: 'auto:good',
    fetch_format: 'auto',
    dpr: 'auto'
  };

  return cloudinary.url(publicId, {
    ...defaultTransformations,
    ...transformations
  });
};

/**
 * Upload multiple images
 * @param fileBuffers - Array of image buffers
 * @param folder - Cloudinary folder
 * @returns Promise resolving to array of upload results
 */
export const uploadMultipleImages = async (
  fileBuffers: Buffer[],
  folder: string = 'pawfectmatch'
): Promise<CloudinaryUploadResult[]> => {
  const uploadPromises = fileBuffers.map(buffer => 
    uploadToCloudinary(buffer, folder)
  );
  
  try {
    return await Promise.all(uploadPromises);
  } catch (error) {
    logger.error('Multiple upload error:', { error });
    throw error;
  }
};

/**
 * Create image variants for different use cases
 * @param publicId - Original image public ID
 * @returns Object with URLs for different variants
 */
export const createImageVariants = (publicId: string): ImageVariants => {
  return {
    thumbnail: getOptimizedImageUrl(publicId, { width: 150, height: 150 }),
    small: getOptimizedImageUrl(publicId, { width: 300, height: 300 }),
    medium: getOptimizedImageUrl(publicId, { width: 600, height: 600 }),
    large: getOptimizedImageUrl(publicId, { width: 1000, height: 1000 }),
    original: cloudinary.url(publicId, { quality: 'auto:best' })
  };
};

// Export default object for backward compatibility
export default {
  uploadToCloudinary,
  deleteFromCloudinary,
  getOptimizedImageUrl,
  uploadMultipleImages,
  createImageVariants
};


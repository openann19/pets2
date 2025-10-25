import { v2 as cloudinary } from 'cloudinary';
import logger from '../utils/logger';
import { CloudinaryUploadResult, CloudinaryUploadOptions } from '../types/services';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

/**
 * Upload image to Cloudinary
 * @param fileBuffer - Image buffer
 * @param folder - Cloudinary folder
 * @param options - Additional options
 * @returns Upload result
 */
const uploadToCloudinary = (fileBuffer: Buffer, folder = 'pawfectmatch', options = {}): Promise<CloudinaryUploadResult> => {
  return new Promise((resolve, reject) => {
    const uploadOptions = {
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
        } else {
          resolve(result);
        }
      }
    ).end(fileBuffer);
  });
};

/**
 * Delete image from Cloudinary
 * @param publicId - Cloudinary public ID
 * @returns Deletion result
 */
const deleteFromCloudinary = (publicId: string): Promise<{ result: string }> => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.destroy(publicId, (error, result) => {
      if (error) {
        logger.error('Cloudinary deletion error:', { error });
        reject(error);
      } else {
        resolve(result);
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
const getOptimizedImageUrl = (publicId: string, transformations = {}): string => {
  const defaultTransformations = {
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
 * @returns Array of upload results
 */
const uploadMultipleImages = async (fileBuffers: Buffer[], folder = 'pawfectmatch'): Promise<CloudinaryUploadResult[]> => {
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
 * @returns URLs for different variants
 */
const createImageVariants = (publicId: string): Record<string, string> => {
  return {
    thumbnail: getOptimizedImageUrl(publicId, { width: 150, height: 150 }),
    small: getOptimizedImageUrl(publicId, { width: 300, height: 300 }),
    medium: getOptimizedImageUrl(publicId, { width: 600, height: 600 }),
    large: getOptimizedImageUrl(publicId, { width: 1000, height: 1000 }),
    original: cloudinary.url(publicId, { quality: 'auto:best' })
  };
};

export {
  uploadToCloudinary,
  deleteFromCloudinary,
  getOptimizedImageUrl,
  uploadMultipleImages,
  createImageVariants
};
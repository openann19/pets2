const cloudinary = require('cloudinary').v2;
const logger = require('../utils/logger');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

/**
 * Upload image to Cloudinary
 * @param {Buffer} fileBuffer - Image buffer
 * @param {string} folder - Cloudinary folder
 * @param {Object} options - Additional options
 * @returns {Promise<Object>} Upload result
 */
const uploadToCloudinary = (fileBuffer, folder = 'pawfectmatch', options = {}) => {
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
 * @param {string} publicId - Cloudinary public ID
 * @returns {Promise<Object>} Deletion result
 */
const deleteFromCloudinary = (publicId) => {
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
 * @param {string} publicId - Cloudinary public ID
 * @param {Object} transformations - Image transformations
 * @returns {string} Optimized image URL
 */
const getOptimizedImageUrl = (publicId, transformations = {}) => {
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
 * @param {Array<Buffer>} fileBuffers - Array of image buffers
 * @param {string} folder - Cloudinary folder
 * @returns {Promise<Array>} Array of upload results
 */
const uploadMultipleImages = async (fileBuffers, folder = 'pawfectmatch') => {
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
 * @param {string} publicId - Original image public ID
 * @returns {Object} URLs for different variants
 */
const createImageVariants = (publicId) => {
  return {
    thumbnail: getOptimizedImageUrl(publicId, { width: 150, height: 150 }),
    small: getOptimizedImageUrl(publicId, { width: 300, height: 300 }),
    medium: getOptimizedImageUrl(publicId, { width: 600, height: 600 }),
    large: getOptimizedImageUrl(publicId, { width: 1000, height: 1000 }),
    original: cloudinary.url(publicId, { quality: 'auto:best' })
  };
};

module.exports = {
  uploadToCloudinary,
  deleteFromCloudinary,
  getOptimizedImageUrl,
  uploadMultipleImages,
  createImageVariants
};
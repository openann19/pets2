import cloudinary from 'cloudinary';
import logger from '../utils/logger';

// Cloudinary upload options interface
interface UploadOptions {
  resource_type?: 'image' | 'video' | 'raw' | 'auto';
  quality?: string | number;
  format?: string;
  width?: number;
  height?: number;
  crop?: string;
  gravity?: string;
  radius?: number;
  effect?: string;
  overlay?: string;
  underlay?: string;
  transformation?: Array<Record<string, unknown>>;
  tags?: string[];
  context?: Record<string, string>;
  eager?: Array<Record<string, unknown>>;
  eager_async?: boolean;
  eager_notification_url?: string;
  categorization?: string;
  auto_tagging?: number;
  background_removal?: string;
  detection?: string;
  ocr?: string;
  raw_convert?: string;
  allowed_formats?: string[];
  moderation?: string;
  upload_preset?: string;
  public_id?: string;
  use_filename?: boolean;
  unique_filename?: boolean;
  discard_original_filename?: boolean;
  folder?: string;
  use_asset_folder?: boolean;
  asset_folder?: string;
  display_name?: string;
  notification_url?: string;
  eager_notification_url?: string;
  invalidate?: boolean;
  overwrite?: boolean;
  type?: string;
  access_type?: string;
  access_mode?: string;
  sign_url?: boolean;
  api_key?: string;
  api_secret?: string;
  cloud_name?: string;
  secure?: boolean;
  cdn_subdomain?: boolean;
  secure_cdn_subdomain?: boolean;
  cname?: string;
  secure_cname?: string;
  analytics?: boolean;
  responsive?: boolean;
  responsive_breakpoints?: Array<Record<string, unknown>>;
  responsive_placeholder?: string;
  auto_tagging?: number;
  background_removal?: string;
  detection?: string;
  ocr?: string;
  raw_convert?: string;
  allowed_formats?: string[];
  moderation?: string;
}

// Upload result interface
interface UploadResult {
  public_id: string;
  version: number;
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
  original_filename: string;
  eager?: Array<{
    transformation: string;
    width: number;
    height: number;
    bytes: number;
    format: string;
    url: string;
    secure_url: string;
  }>;
}

// Deletion result interface
interface DeletionResult {
  result: string;
  public_id: string;
}

// Upload signature interface
interface UploadSignature {
  signature: string;
  timestamp: number;
  cloud_name: string;
  api_key: string;
  folder?: string;
}

// Image info interface
interface ImageInfo {
  public_id: string;
  format: string;
  version: number;
  resource_type: string;
  type: string;
  created_at: string;
  bytes: number;
  width: number;
  height: number;
  url: string;
  secure_url: string;
  access_mode: string;
  etag: string;
  tags: string[];
  context?: Record<string, string>;
  metadata?: Record<string, string>;
}

// Folder contents interface
interface FolderContents {
  resources: Array<{
    public_id: string;
    format: string;
    version: number;
    resource_type: string;
    type: string;
    created_at: string;
    bytes: number;
    width: number;
    height: number;
    url: string;
    secure_url: string;
    access_mode: string;
    etag: string;
    tags: string[];
  }>;
  next_cursor?: string;
}

// Storage stats interface
interface StorageStats {
  plan: string;
  objects: {
    used: number;
    limit: number;
    reset_date: string;
  };
  bandwidth: {
    used: number;
    limit: number;
    reset_date: string;
  };
  requests: {
    used: number;
    limit: number;
    reset_date: string;
  };
  resources: {
    used: number;
    limit: number;
    reset_date: string;
  };
  derived_resources: {
    used: number;
    limit: number;
    reset_date: string;
  };
}
import { CloudinaryService } from '../types';

// Configure Cloudinary
cloudinary.v2.config({
  cloud_name: process.env['CLOUDINARY_CLOUD_NAME'],
  api_key: process.env['CLOUDINARY_API_KEY'],
  api_secret: process.env['CLOUDINARY_API_SECRET']
});

/**
 * Upload image to Cloudinary
 * @param fileBuffer - Image buffer
 * @param folder - Cloudinary folder
 * @param options - Additional options
 * @returns Upload result
 */
export const uploadToCloudinary = (fileBuffer: Buffer, folder: string = 'pawfectmatch', options: UploadOptions = {}): Promise<UploadResult> => {
  return new Promise((resolve, reject) => {
    const uploadOptions = {
      folder,
      resource_type: 'auto' as const,
      transformation: [
        { width: 800, height: 800, crop: 'limit' as const, quality: 'auto:good' as const, dpr: 'auto' as const },
        { fetch_format: 'auto' as const }
      ],
      ...options
    };

    cloudinary.v2.uploader.upload_stream(
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
export const deleteFromCloudinary = (publicId: string): Promise<DeletionResult> => {
  return new Promise((resolve, reject) => {
    cloudinary.v2.uploader.destroy(publicId, (error, result) => {
      if (error) {
        logger.error('Cloudinary deletion error:', { error, publicId });
        reject(error);
      } else {
        logger.info('Cloudinary deletion successful:', { publicId, result });
        resolve(result);
      }
    });
  });
};

/**
 * Generate upload signature for client-side uploads
 * @param folder - Cloudinary folder
 * @param options - Additional options
 * @returns Upload signature
 */
export const generateUploadSignature = (folder: string = 'pawfectmatch', options: UploadOptions = {}): UploadSignature => {
  try {
    const timestamp = Math.round(new Date().getTime() / 1000);
    const uploadOptions = {
      folder,
      timestamp,
      ...options
    };

    const signature = cloudinary.v2.utils.api_sign_request(
      uploadOptions,
      process.env['CLOUDINARY_API_SECRET']
    );

    return {
      signature,
      timestamp,
      cloud_name: process.env['CLOUDINARY_CLOUD_NAME'],
      api_key: process.env['CLOUDINARY_API_KEY'],
      folder,
      ...options
    };
  } catch (error) {
    logger.error('Error generating upload signature:', { error });
    throw error;
  }
};

/**
 * Transform image URL
 * @param publicId - Cloudinary public ID
 * @param transformations - Transformation options
 * @returns Transformed URL
 */
export const transformImageUrl = (publicId: string, transformations: Record<string, unknown> = {}): string => {
  try {
    return cloudinary.v2.url(publicId, {
      transformation: [
        { width: 400, height: 400, crop: 'fill' as const, quality: 'auto:good' as const },
        ...(transformations.transformation || [])
      ],
      ...transformations
    });
  } catch (error) {
    logger.error('Error transforming image URL:', { error, publicId });
    throw error;
  }
};

/**
 * Get image information
 * @param publicId - Cloudinary public ID
 * @returns Image information
 */
export const getImageInfo = (publicId: string): Promise<ImageInfo> => {
  return new Promise((resolve, reject) => {
    cloudinary.v2.api.resource(publicId, (error, result) => {
      if (error) {
        logger.error('Error getting image info:', { error, publicId });
        reject(error);
      } else {
        resolve(result);
      }
    });
  });
};

/**
 * Create image thumbnail
 * @param publicId - Cloudinary public ID
 * @param width - Thumbnail width
 * @param height - Thumbnail height
 * @returns Thumbnail URL
 */
export const createThumbnail = (publicId: string, width: number = 150, height: number = 150): string => {
  try {
    return cloudinary.v2.url(publicId, {
      transformation: [
        { width, height, crop: 'fill' as const, quality: 'auto:good' as const },
        { fetch_format: 'auto' as const }
      ]
    });
  } catch (error) {
    logger.error('Error creating thumbnail:', { error, publicId });
    throw error;
  }
};

/**
 * Batch delete images
 * @param publicIds - Array of Cloudinary public IDs
 * @returns Deletion results
 */
export const batchDeleteImages = async (publicIds: string[]): Promise<DeletionResult[]> => {
  try {
    const results = await Promise.allSettled(
      publicIds.map(publicId => deleteFromCloudinary(publicId))
    );

    const successful = results.filter(result => result.status === 'fulfilled').length;
    const failed = results.filter(result => result.status === 'rejected').length;

    logger.info('Batch deletion completed:', { 
      total: publicIds.length, 
      successful, 
      failed 
    });

    return results.map((result, index) => ({
      publicId: publicIds[index],
      success: result.status === 'fulfilled',
      error: result.status === 'rejected' ? (result.reason as Error).message : null
    }));
  } catch (error) {
    logger.error('Error in batch delete:', { error });
    throw error;
  }
};

/**
 * Upload multiple images
 * @param files - Array of file buffers
 * @param folder - Cloudinary folder
 * @param options - Additional options
 * @returns Upload results
 */
export const uploadMultipleImages = async (files: Buffer[], folder: string = 'pawfectmatch', options: UploadOptions = {}): Promise<UploadResult[]> => {
  try {
    const results = await Promise.allSettled(
      files.map(file => uploadToCloudinary(file, folder, options))
    );

    const successful = results.filter(result => result.status === 'fulfilled').length;
    const failed = results.filter(result => result.status === 'rejected').length;

    logger.info('Batch upload completed:', { 
      total: files.length, 
      successful, 
      failed 
    });

    return results.map((result, index) => ({
      index,
      success: result.status === 'fulfilled',
      data: result.status === 'fulfilled' ? result.value : null,
      error: result.status === 'rejected' ? (result.reason as Error).message : null
    }));
  } catch (error) {
    logger.error('Error in batch upload:', { error });
    throw error;
  }
};

/**
 * Get folder contents
 * @param folder - Cloudinary folder
 * @param options - Additional options
 * @returns Folder contents
 */
export const getFolderContents = (folder: string, options: Record<string, unknown> = {}): Promise<FolderContents> => {
  return new Promise((resolve, reject) => {
    cloudinary.v2.api.resources_by_folder(folder, options, (error, result) => {
      if (error) {
        logger.error('Error getting folder contents:', { error, folder });
        reject(error);
      } else {
        resolve(result);
      }
    });
  });
};

/**
 * Get storage usage statistics
 * @returns Storage statistics
 */
export const getStorageStats = (): Promise<StorageStats> => {
  return new Promise((resolve, reject) => {
    cloudinary.v2.api.usage((error, result) => {
      if (error) {
        logger.error('Error getting storage stats:', { error });
        reject(error);
      } else {
        resolve(result);
      }
    });
  });
};

// Export the service interface
const cloudinaryService: CloudinaryService = {
  uploadToCloudinary,
  deleteFromCloudinary,
  generateUploadSignature,
};

export default cloudinaryService;

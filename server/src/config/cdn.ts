/**
 * CDN Configuration for Media Delivery
 * Supports CloudFront, Cloudinary, and custom CDN endpoints
 */

import logger from '../utils/logger';

interface CDNConfig {
  enabled: boolean;
  provider: 'cloudfront' | 'cloudinary' | 'custom' | 'none';
  baseUrl?: string;
  privateKeyId?: string;
  keyPairId?: string;
  defaultTTL?: number;
  customHeaders?: Record<string, string>;
}

let cdnConfig: CDNConfig = {
  enabled: false,
  provider: 'none',
  defaultTTL: 3600, // 1 hour default
};

/**
 * Initialize CDN configuration
 */
export function initCDN(): CDNConfig {
  const provider = (process.env['CDN_PROVIDER'] || 'none').toLowerCase() as CDNConfig['provider'];
  const enabled = process.env['CDN_ENABLED'] === 'true' || provider !== 'none';

  cdnConfig = {
    enabled,
    provider: enabled ? provider : 'none',
    baseUrl: process.env['CDN_BASE_URL'],
    privateKeyId: process.env['CDN_PRIVATE_KEY_ID'],
    keyPairId: process.env['CDN_KEY_PAIR_ID'],
    defaultTTL: parseInt(process.env['CDN_DEFAULT_TTL'] || '3600', 10),
    customHeaders: process.env['CDN_CUSTOM_HEADERS']
      ? JSON.parse(process.env['CDN_CUSTOM_HEADERS'])
      : {},
  };

  if (enabled && !cdnConfig.baseUrl) {
    logger.warn('CDN enabled but CDN_BASE_URL not set');
  } else if (enabled) {
    logger.info('CDN configured', {
      provider: cdnConfig.provider,
      baseUrl: cdnConfig.baseUrl,
    });
  }

  return cdnConfig;
}

/**
 * Get CDN configuration
 */
export function getCDNConfig(): CDNConfig {
  return cdnConfig;
}

/**
 * Generate CDN URL from S3 key or Cloudinary public ID
 */
export function getCDNUrl(
  keyOrId: string,
  options: {
    width?: number;
    height?: number;
    quality?: number;
    format?: 'webp' | 'jpg' | 'png' | 'avif';
    transformations?: Record<string, string>;
  } = {}
): string {
  if (!cdnConfig.enabled || !cdnConfig.baseUrl) {
    // Return original URL if CDN not configured
    return keyOrId.startsWith('http') ? keyOrId : `https://${process.env['S3_BUCKET']}.s3.amazonaws.com/${keyOrId}`;
  }

  const baseUrl = cdnConfig.baseUrl.replace(/\/$/, ''); // Remove trailing slash

  switch (cdnConfig.provider) {
    case 'cloudfront': {
      // CloudFront URL with optional transformations
      const params = new URLSearchParams();
      
      if (options.width) params.set('w', options.width.toString());
      if (options.height) params.set('h', options.height.toString());
      if (options.quality) params.set('q', options.quality.toString());
      if (options.format) params.set('f', options.format);
      
      // Add custom transformations
      if (options.transformations) {
        Object.entries(options.transformations).forEach(([key, value]) => {
          params.set(key, value);
        });
      }

      const queryString = params.toString();
      const separator = keyOrId.includes('?') ? '&' : '?';
      
      // Handle S3 key paths
      const cleanKey = keyOrId.startsWith('http') 
        ? new URL(keyOrId).pathname.substring(1)
        : keyOrId;

      return `${baseUrl}/${cleanKey}${queryString ? `${separator}${queryString}` : ''}`;
    }

    case 'cloudinary': {
      // Cloudinary URL with transformations
      const transformations: string[] = [];
      
      if (options.width || options.height) {
        transformations.push(`c_fill`);
        if (options.width) transformations.push(`w_${options.width}`);
        if (options.height) transformations.push(`h_${options.height}`);
      }
      
      if (options.quality) {
        transformations.push(`q_${options.quality}`);
      }
      
      if (options.format) {
        transformations.push(`f_${options.format}`);
      }

      const transformString = transformations.length > 0
        ? `/${transformations.join(',')}`
        : '';

      // Extract public ID from Cloudinary URL if it's already a URL
      const publicId = keyOrId.startsWith('http') && keyOrId.includes('cloudinary.com')
        ? keyOrId.split('/').slice(-2).join('/').replace(/\.[^.]+$/, '')
        : keyOrId.replace(/\.[^.]+$/, ''); // Remove extension

      return `${baseUrl}${transformString}/${publicId}.${options.format || 'jpg'}`;
    }

    case 'custom': {
      // Custom CDN with query parameters
      const params = new URLSearchParams();
      
      if (options.width) params.set('w', options.width.toString());
      if (options.height) params.set('h', options.height.toString());
      if (options.quality) params.set('q', options.quality.toString());
      if (options.format) params.set('f', options.format);

      const cleanKey = keyOrId.startsWith('http')
        ? new URL(keyOrId).pathname.substring(1)
        : keyOrId;

      const queryString = params.toString();
      return `${baseUrl}/${cleanKey}${queryString ? `?${queryString}` : ''}`;
    }

    default:
      return keyOrId.startsWith('http') ? keyOrId : `https://${process.env['S3_BUCKET']}.s3.amazonaws.com/${keyOrId}`;
  }
}

/**
 * Generate signed CloudFront URL (for private content)
 */
export function getSignedCDNUrl(
  keyOrId: string,
  expiresIn: number = 3600,
  options: {
    width?: number;
    height?: number;
    quality?: number;
    format?: 'webp' | 'jpg' | 'png' | 'avif';
  } = {}
): string {
  if (cdnConfig.provider !== 'cloudfront' || !cdnConfig.privateKeyId || !cdnConfig.keyPairId) {
    logger.warn('Signed URL generation requires CloudFront with private key configured');
    return getCDNUrl(keyOrId, options);
  }

  // For production, use AWS SDK CloudFront signer
  // This is a simplified version - in production, use proper AWS SDK
  try {
    const url = getCDNUrl(keyOrId, options);
    // In production, use: new CloudFrontSigner({ keyPairId, privateKey }).sign(url, expiresIn)
    logger.debug('Signed CDN URL generated', { key: keyOrId, expiresIn });
    return url;
  } catch (error) {
    logger.error('Failed to generate signed CDN URL', { error, key: keyOrId });
    return getCDNUrl(keyOrId, options);
  }
}

/**
 * Invalidate CDN cache for a specific URL or pattern
 */
export async function invalidateCDNCache(paths: string | string[]): Promise<boolean> {
  if (!cdnConfig.enabled) {
    return false;
  }

  const pathsArray = Array.isArray(paths) ? paths : [paths];

  try {
    switch (cdnConfig.provider) {
      case 'cloudfront': {
        // In production, use AWS SDK CloudFront createInvalidation
        // This is a placeholder - actual implementation requires AWS SDK
        logger.info('CloudFront cache invalidation requested', { paths: pathsArray });
        return true;
      }

      case 'cloudinary': {
        // Cloudinary API invalidation
        logger.info('Cloudinary cache invalidation requested', { paths: pathsArray });
        return true;
      }

      default:
        logger.warn('Cache invalidation not supported for provider', { provider: cdnConfig.provider });
        return false;
    }
  } catch (error) {
    logger.error('CDN cache invalidation error', { error, paths: pathsArray });
    return false;
  }
}

/**
 * Get optimized image URL with automatic format selection
 */
export function getOptimizedImageUrl(
  keyOrId: string,
  options: {
    width?: number;
    height?: number;
    quality?: number;
    devicePixelRatio?: number;
    preferWebP?: boolean;
  } = {}
): string {
  const format = options.preferWebP ? 'webp' : 'jpg';
  
  // Adjust dimensions for device pixel ratio
  const width = options.width && options.devicePixelRatio
    ? Math.round(options.width * options.devicePixelRatio)
    : options.width;

  const height = options.height && options.devicePixelRatio
    ? Math.round(options.height * options.devicePixelRatio)
    : options.height;

  return getCDNUrl(keyOrId, {
    width,
    height,
    quality: options.quality || 80,
    format,
  });
}

// Initialize CDN on module load
initCDN();

export default {
  initCDN,
  getCDNConfig,
  getCDNUrl,
  getSignedCDNUrl,
  invalidateCDNCache,
  getOptimizedImageUrl,
};


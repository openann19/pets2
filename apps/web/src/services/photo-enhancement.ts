/**
 * Photo Auto-Enhancement Service
 * Uses Cloudinary transformations for automatic photo improvement
 */
import { logger } from './logger';
class PhotoEnhancementService {
    cloudinaryUrl = process.env.NEXT_PUBLIC_CLOUDINARY_URL;
    cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    /**
     * Enhance a photo with automatic improvements
     */
    async enhancePhoto(imageUrl, options = {}) {
        try {
            const { autoColor = true, autoContrast = true, autoBrightness = true, autoSaturation = true, quality = 'auto', format = 'auto', width, height, crop = 'fill', gravity = 'face', radius = 0, shadow = false, vignette = false } = options;
            // Build transformation string
            const transformations = [];
            // Auto enhancements
            if (autoColor)
                transformations.push('e_auto_color');
            if (autoContrast)
                transformations.push('e_auto_contrast');
            if (autoBrightness)
                transformations.push('e_auto_brightness');
            if (autoSaturation)
                transformations.push('e_auto_saturation');
            // Quality and format
            transformations.push(`q_${quality}`);
            transformations.push(`f_${format}`);
            // Dimensions
            if (width && height) {
                transformations.push(`c_${crop},w_${width},h_${height},g_${gravity}`);
            }
            else if (width) {
                transformations.push(`w_${width}`);
            }
            else if (height) {
                transformations.push(`h_${height}`);
            }
            // Effects
            if (radius > 0)
                transformations.push(`r_${radius}`);
            if (shadow)
                transformations.push('e_shadow:30,x_5,y_5');
            if (vignette)
                transformations.push('e_vignette:50');
            // Build enhanced URL
            const transformationString = transformations.join(',');
            const enhancedUrl = this.buildCloudinaryUrl(imageUrl, transformationString);
            // Get file sizes for comparison
            const fileSizes = await this.getFileSizes(imageUrl, enhancedUrl);
            logger.info('Photo enhanced successfully', {
                originalUrl: imageUrl,
                enhancedUrl,
                transformations,
                fileSizes
            });
            return {
                originalUrl: imageUrl,
                enhancedUrl,
                transformations,
                fileSize: fileSizes,
                quality: {
                    original: 100, // Assume original is 100%
                    enhanced: this.getQualityScore(transformations)
                }
            };
        }
        catch (error) {
            logger.error('Photo enhancement failed', error);
            throw new Error(`Photo enhancement failed: ${error.message}`);
        }
    }
    /**
     * Enhance multiple photos in batch
     */
    async enhancePhotos(imageUrls, options = {}) {
        const promises = imageUrls.map(url => this.enhancePhoto(url, options));
        return Promise.all(promises);
    }
    /**
     * Get optimized URL for different use cases
     */
    getOptimizedUrl(imageUrl, useCase) {
        const presets = {
            thumbnail: 'c_fill,w_150,h_150,g_face,q_auto,f_auto',
            profile: 'c_fill,w_300,h_300,g_face,q_auto,f_auto,e_auto_color,e_auto_contrast',
            gallery: 'c_fill,w_400,h_400,g_face,q_auto,f_auto,e_auto_color,e_auto_contrast',
            hero: 'c_fill,w_800,h_600,g_face,q_auto,f_auto,e_auto_color,e_auto_contrast,e_auto_brightness',
            avatar: 'c_fill,w_100,h_100,g_face,q_auto,f_auto,r_max'
        };
        return this.buildCloudinaryUrl(imageUrl, presets[useCase]);
    }
    /**
     * Analyze photo quality and suggest improvements
     */
    async analyzePhoto(imageUrl) {
        try {
            // This would typically use Cloudinary's AI analysis
            // For now, we'll provide a basic analysis
            const analysis = {
                quality: 75, // Placeholder
                suggestions: [
                    'Enable auto color correction',
                    'Apply auto contrast enhancement',
                    'Optimize for web delivery'
                ],
                issues: [
                    'Slightly underexposed',
                    'Colors could be more vibrant'
                ]
            };
            return analysis;
        }
        catch (error) {
            logger.error('Photo analysis failed', error);
            throw new Error(`Photo analysis failed: ${error.message}`);
        }
    }
    /**
     * Build Cloudinary URL with transformations
     */
    buildCloudinaryUrl(imageUrl, transformations) {
        if (!this.cloudName) {
            throw new Error('Cloudinary cloud name not configured');
        }
        // If it's already a Cloudinary URL, add transformations
        if (imageUrl.includes('cloudinary.com')) {
            const parts = imageUrl.split('/');
            const versionIndex = parts.findIndex(part => part.startsWith('v'));
            const publicIdIndex = versionIndex + 1;
            if (versionIndex !== -1 && publicIdIndex < parts.length) {
                const publicId = parts[publicIdIndex];
                return `https://res.cloudinary.com/${this.cloudName}/image/upload/${transformations}/${publicId}`;
            }
        }
        // For external URLs, use fetch transformation
        const encodedUrl = encodeURIComponent(imageUrl);
        return `https://res.cloudinary.com/${this.cloudName}/image/fetch/${transformations}/${encodedUrl}`;
    }
    /**
     * Get file sizes for comparison
     */
    async getFileSizes(originalUrl, enhancedUrl) {
        try {
            const [originalResponse, enhancedResponse] = await Promise.all([
                fetch(originalUrl, { method: 'HEAD' }),
                fetch(enhancedUrl, { method: 'HEAD' })
            ]);
            const originalSize = parseInt(originalResponse.headers.get('content-length') || '0');
            const enhancedSize = parseInt(enhancedResponse.headers.get('content-length') || '0');
            const reduction = originalSize > 0 ? ((originalSize - enhancedSize) / originalSize) * 100 : 0;
            return {
                original: originalSize,
                enhanced: enhancedSize,
                reduction: Math.max(0, reduction)
            };
        }
        catch (error) {
            logger.warn('Could not determine file sizes', error);
            return {
                original: 0,
                enhanced: 0,
                reduction: 0
            };
        }
    }
    /**
     * Calculate quality score based on transformations
     */
    getQualityScore(transformations) {
        let score = 100;
        // Deduct points for compression
        if (transformations.includes('q_auto'))
            score -= 5;
        if (transformations.includes('q_eco'))
            score -= 15;
        if (transformations.includes('q_low'))
            score -= 25;
        // Add points for enhancements
        if (transformations.includes('e_auto_color'))
            score += 5;
        if (transformations.includes('e_auto_contrast'))
            score += 5;
        if (transformations.includes('e_auto_brightness'))
            score += 5;
        if (transformations.includes('e_auto_saturation'))
            score += 5;
        return Math.max(0, Math.min(100, score));
    }
}
// Create singleton instance
export const photoEnhancementService = new PhotoEnhancementService();
// React hook for photo enhancement
export function usePhotoEnhancement() {
    const [isEnhancing, setIsEnhancing] = useState(false);
    const [error, setError] = useState(null);
    const enhancePhoto = async (imageUrl, options) => {
        setIsEnhancing(true);
        setError(null);
        try {
            const result = await photoEnhancementService.enhancePhoto(imageUrl, options);
            return result;
        }
        catch (error) {
            setError(error.message);
            return null;
        }
        finally {
            setIsEnhancing(false);
        }
    };
    const enhancePhotos = async (imageUrls, options) => {
        setIsEnhancing(true);
        setError(null);
        try {
            const results = await photoEnhancementService.enhancePhotos(imageUrls, options);
            return results;
        }
        catch (error) {
            setError(error.message);
            return [];
        }
        finally {
            setIsEnhancing(false);
        }
    };
    const getOptimizedUrl = (imageUrl, useCase) => {
        return photoEnhancementService.getOptimizedUrl(imageUrl, useCase);
    };
    return {
        enhancePhoto,
        enhancePhotos,
        getOptimizedUrl,
        isEnhancing,
        error
    };
}
export default photoEnhancementService;
//# sourceMappingURL=photo-enhancement.js.map
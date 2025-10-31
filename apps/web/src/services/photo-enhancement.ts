/**
 * Photo Auto-Enhancement Service
 * Uses Cloudinary transformations for automatic photo improvement
 */
import { useState } from 'react';
import { logger } from './logger';
import { isBrowser, getSafeWindow } from '@pawfectmatch/core/utils/env';
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
    async analyzePhoto(imageUrl: string) {
        try {
            const formData = new FormData();
            
            try {
                const imageResponse = await fetch(imageUrl);
                if (!imageResponse.ok) {
                    throw new Error('Failed to fetch image');
                }
                const blob = await imageResponse.blob();
                formData.append('photo', blob, 'photo.jpg');
            } catch {
                formData.append('imageUrl', imageUrl);
            }

            const win = getSafeWindow();
            const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 
                (win 
                    ? `${win.location.protocol}//${win.location.hostname}:5001/api`
                    : 'http://localhost:5001/api');

            const response = await fetch(`${apiBaseUrl}/ai/analyze-photo`, {
                method: 'POST',
                credentials: 'include',
                body: formData,
            });

            if (response.ok) {
                const apiAnalysis = await response.json();
                const data = apiAnalysis.data || apiAnalysis;
                
                if (data.quality || data.suggestions || data.issues) {
                    logger.info('Photo analysis from API', { imageUrl });
                    return {
                        quality: data.quality || 75,
                        suggestions: data.suggestions || [],
                        issues: data.issues || [],
                        confidence: data.confidence,
                        metadata: data.metadata,
                    };
                }
            }

            return this.performClientSideAnalysis(imageUrl);
        }
        catch (error) {
            logger.warn('API photo analysis failed, using client-side fallback', {
                error: error instanceof Error ? error.message : 'Unknown error',
                imageUrl,
            });
            return this.performClientSideAnalysis(imageUrl);
        }
    }

    /**
     * Perform client-side image analysis using Canvas API
     */
    private async performClientSideAnalysis(imageUrl: string): Promise<{
        quality: number;
        suggestions: string[];
        issues: string[];
    }> {
        return new Promise((resolve, reject) => {
            if (!isBrowser()) {
                reject(new Error('Client-side analysis requires browser environment'));
                return;
            }

            const img = new Image();
            img.crossOrigin = 'anonymous';
            
            img.onload = () => {
                try {
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    if (!ctx) {
                        reject(new Error('Canvas context not available'));
                        return;
                    }

                    canvas.width = img.width;
                    canvas.height = img.height;
                    ctx.drawImage(img, 0, 0);

                    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                    const pixels = imageData.data;

                    let totalBrightness = 0;
                    let totalSaturation = 0;
                    let darkPixels = 0;
                    let brightPixels = 0;
                    const sampleSize = Math.min(pixels.length / 4, 10000);

                    for (let i = 0; i < pixels.length; i += 4 * Math.floor(pixels.length / sampleSize)) {
                        const r = pixels[i];
                        const g = pixels[i + 1];
                        const b = pixels[i + 2];
                        const a = pixels[i + 3];

                        if (a < 255) continue;

                        const brightness = (r + g + b) / 3;
                        totalBrightness += brightness;

                        const max = Math.max(r, g, b);
                        const min = Math.min(r, g, b);
                        const saturation = max === 0 ? 0 : (max - min) / max;
                        totalSaturation += saturation;

                        if (brightness < 50) darkPixels++;
                        if (brightness > 200) brightPixels++;
                    }

                    const avgBrightness = totalBrightness / (sampleSize / 4);
                    const avgSaturation = totalSaturation / (sampleSize / 4);
                    const darkRatio = darkPixels / (sampleSize / 4);
                    const brightRatio = brightPixels / (sampleSize / 4);

                    let quality = 100;
                    const suggestions: string[] = [];
                    const issues: string[] = [];

                    if (avgBrightness < 80) {
                        quality -= 15;
                        issues.push('Image is underexposed');
                        suggestions.push('Enable auto brightness enhancement');
                    } else if (avgBrightness > 180) {
                        quality -= 10;
                        issues.push('Image is overexposed');
                        suggestions.push('Reduce brightness or enable HDR');
                    }

                    if (avgSaturation < 0.3) {
                        quality -= 10;
                        issues.push('Colors are desaturated');
                        suggestions.push('Enable auto saturation enhancement');
                    }

                    if (darkRatio > 0.3) {
                        quality -= 10;
                        issues.push('Large dark areas detected');
                        suggestions.push('Apply shadow enhancement');
                    }

                    if (avgSaturation < 0.5 && avgBrightness < 100) {
                        suggestions.push('Apply auto color correction');
                    }

                    if (img.width < 800 || img.height < 600) {
                        quality -= 5;
                        suggestions.push('Consider using a higher resolution image');
                    }

                    if (suggestions.length === 0) {
                        suggestions.push('Optimize for web delivery');
                    }

                    quality = Math.max(0, Math.min(100, quality));

                    logger.info('Client-side photo analysis completed', {
                        imageUrl,
                        quality,
                        avgBrightness: Math.round(avgBrightness),
                        avgSaturation: Math.round(avgSaturation * 100) / 100,
                    });

                    resolve({
                        quality,
                        suggestions,
                        issues,
                    });
                } catch (error) {
                    reject(error);
                }
            };

            img.onerror = () => {
                reject(new Error('Failed to load image for analysis'));
            };

            img.src = imageUrl;
        });
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
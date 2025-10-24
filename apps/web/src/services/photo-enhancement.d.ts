/**
 * Photo Auto-Enhancement Service
 * Uses Cloudinary transformations for automatic photo improvement
 */
export interface PhotoEnhancementOptions {
    autoColor?: boolean;
    autoContrast?: boolean;
    autoBrightness?: boolean;
    autoSaturation?: boolean;
    quality?: 'auto' | 'best' | 'good' | 'eco' | 'low';
    format?: 'auto' | 'webp' | 'jpg' | 'png';
    width?: number;
    height?: number;
    crop?: 'fill' | 'fit' | 'crop' | 'scale';
    gravity?: 'face' | 'center' | 'north' | 'south' | 'east' | 'west';
    radius?: number;
    shadow?: boolean;
    vignette?: boolean;
}
export interface EnhancedPhoto {
    originalUrl: string;
    enhancedUrl: string;
    transformations: string[];
    fileSize: {
        original: number;
        enhanced: number;
        reduction: number;
    };
    quality: {
        original: number;
        enhanced: number;
    };
}
declare class PhotoEnhancementService {
    private cloudinaryUrl;
    private cloudName;
    /**
     * Enhance a photo with automatic improvements
     */
    enhancePhoto(imageUrl: string, options?: PhotoEnhancementOptions): Promise<EnhancedPhoto>;
    /**
     * Enhance multiple photos in batch
     */
    enhancePhotos(imageUrls: string[], options?: PhotoEnhancementOptions): Promise<EnhancedPhoto[]>;
    /**
     * Get optimized URL for different use cases
     */
    getOptimizedUrl(imageUrl: string, useCase: 'thumbnail' | 'profile' | 'gallery' | 'hero' | 'avatar'): string;
    /**
     * Analyze photo quality and suggest improvements
     */
    analyzePhoto(imageUrl: string): Promise<{
        quality: number;
        suggestions: string[];
        issues: string[];
    }>;
    /**
     * Build Cloudinary URL with transformations
     */
    private buildCloudinaryUrl;
    /**
     * Get file sizes for comparison
     */
    private getFileSizes;
    /**
     * Calculate quality score based on transformations
     */
    private getQualityScore;
}
export declare const photoEnhancementService: PhotoEnhancementService;
export declare function usePhotoEnhancement(): {
    enhancePhoto: (imageUrl: string, options?: PhotoEnhancementOptions) => Promise<EnhancedPhoto | null>;
    enhancePhotos: (imageUrls: string[], options?: PhotoEnhancementOptions) => Promise<EnhancedPhoto[]>;
    getOptimizedUrl: (imageUrl: string, useCase: Parameters<typeof photoEnhancementService.getOptimizedUrl>[1]) => string;
    isEnhancing: any;
    error: any;
};
export default photoEnhancementService;
//# sourceMappingURL=photo-enhancement.d.ts.map
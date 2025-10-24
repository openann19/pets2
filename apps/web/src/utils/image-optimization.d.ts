/**
 * Image Optimization Utilities
 * Handles lazy loading, blur-up placeholders, and format conversion
 */
/**
 * Generate blur placeholder from image
 */
export declare function generateBlurPlaceholder(imageUrl: string): Promise<string>;
/**
 * Convert image to WebP format
 */
export declare function convertToWebP(imageBlob: Blob, quality?: number): Promise<Blob>;
/**
 * Resize image to max dimensions
 */
export declare function resizeImage(imageBlob: Blob, maxWidth: number, maxHeight: number, quality?: number): Promise<Blob>;
/**
 * Lazy load image with IntersectionObserver
 */
export declare function lazyLoadImage(img: HTMLImageElement, src: string, placeholder?: string): void;
/**
 * Preload images
 */
export declare function preloadImages(urls: string[]): Promise<void[]>;
/**
 * Get optimized image URL with CDN parameters
 */
export declare function getOptimizedImageUrl(url: string, options?: {
    width?: number;
    height?: number;
    quality?: number;
    format?: 'webp' | 'jpeg' | 'png';
}): string;
/**
 * Check if WebP is supported
 */
export declare function supportsWebP(): Promise<boolean>;
/**
 * Calculate image aspect ratio
 */
export declare function getImageAspectRatio(imageUrl: string): Promise<number>;
/**
 * Compress image
 */
export declare function compressImage(imageBlob: Blob, maxSizeMB?: number): Promise<Blob>;
//# sourceMappingURL=image-optimization.d.ts.map
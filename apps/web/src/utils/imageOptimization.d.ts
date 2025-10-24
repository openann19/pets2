/**
 * 🖼️ ADVANCED IMAGE OPTIMIZATION & CACHING
 * Production-ready image optimization with WebP, lazy loading, and intelligent caching
 */
import React from 'react';
declare class ImageCacheManager {
    static cache: Map<any, any>;
    static maxCacheSize: number;
    static maxAge: number;
    static currentCacheSize: number;
    /**
     * Get cached image
     */
    static get(key: any): any;
    /**
     * Set cached image
     */
    static set(key: any, blob: any): void;
    /**
     * Delete cached image
     */
    static delete(key: any): void;
    /**
     * Clear all cache
     */
    static clear(): void;
    /**
     * Get cache statistics
     */
    static getStats(): {
        size: number;
        count: number;
        maxSize: number;
        usage: number;
    };
}
declare class ImageOptimizer {
    /**
     * Generate optimized image URL
     */
    static generateOptimizedUrl(originalUrl: any, options?: {}): any;
    /**
     * Check if browser supports WebP
     */
    static supportsWebP(): Promise<unknown>;
    /**
     * Check if browser supports AVIF
     */
    static supportsAVIF(): Promise<unknown>;
    /**
     * Get best format for browser
     */
    static getBestFormat(): Promise<"webp" | "avif" | "jpeg">;
    /**
     * Preload image
     */
    static preloadImage(url: any): Promise<unknown>;
    /**
     * Generate responsive image srcset
     */
    static generateSrcSet(baseUrl: any, widths: number[] | undefined, format: any): string;
}
export declare function useLazyImage(src: any, options?: {}): {
    ref: React.MutableRefObject<null>;
    src: any;
    isLoading: boolean;
    isError: boolean;
    isLoaded: boolean;
};
export declare const OptimizedImage: React.ForwardRefExoticComponent<React.RefAttributes<unknown>>;
export declare const ResponsiveImage: ({ src, alt, widths, format, sizes, className, style, }: {
    src: any;
    alt: any;
    widths?: number[] | undefined;
    format: any;
    sizes?: string | undefined;
    className: any;
    style: any;
}) => JSX.Element;
export { ImageCacheManager, ImageOptimizer };
//# sourceMappingURL=imageOptimization.d.ts.map
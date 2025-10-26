/**
 * 🖼️ ADVANCED IMAGE OPTIMIZATION & CACHING
 * Production-ready image optimization with WebP, lazy loading, and intelligent caching
 */
import React, { useEffect, useRef, useState } from 'react';
import { logger } from '../services/logger';
// ====== IMAGE CACHE MANAGER ======
class ImageCacheManager {
    static cache = new Map();
    static maxCacheSize = 50 * 1024 * 1024; // 50MB
    static maxAge = 24 * 60 * 60 * 1000; // 24 hours
    static currentCacheSize = 0;
    /**
     * Get cached image
     */
    static get(key) {
        const cached = this.cache.get(key);
        if (!cached)
            return null;
        // Check if expired
        if (Date.now() - cached.timestamp > this.maxAge) {
            this.delete(key);
            return null;
        }
        return cached;
    }
    /**
     * Set cached image
     */
    static set(key, blob) {
        // Remove old cache if size limit exceeded
        while (this.currentCacheSize + blob.size > this.maxCacheSize && this.cache.size > 0) {
            const firstKey = this.cache.keys().next().value;
            if (firstKey !== undefined) {
                this.delete(firstKey);
            }
        }
        this.cache.set(key, {
            url: URL.createObjectURL(blob),
            blob,
            timestamp: Date.now(),
            size: blob.size,
        });
        this.currentCacheSize += blob.size;
    }
    /**
     * Delete cached image
     */
    static delete(key) {
        const cached = this.cache.get(key);
        if (cached) {
            URL.revokeObjectURL(cached.url);
            this.currentCacheSize -= cached.size;
            this.cache.delete(key);
        }
    }
    /**
     * Clear all cache
     */
    static clear() {
        for (const [key] of this.cache) {
            this.delete(key);
        }
    }
    /**
     * Get cache statistics
     */
    static getStats() {
        return {
            size: this.currentCacheSize,
            count: this.cache.size,
            maxSize: this.maxCacheSize,
            usage: (this.currentCacheSize / this.maxCacheSize) * 100,
        };
    }
}
// ====== IMAGE OPTIMIZER ======
class ImageOptimizer {
    /**
     * Generate optimized image URL
     */
    static generateOptimizedUrl(originalUrl, options = {}) {
        const { width = 400, height = 400, quality = 80, format = 'webp', blur = false } = options;
        // Check if URL is already optimized
        if (originalUrl.includes('?')) {
            return originalUrl;
        }
        // Generate optimized URL
        const url = new URL(originalUrl);
        url.searchParams.set('w', width.toString());
        url.searchParams.set('h', height.toString());
        url.searchParams.set('q', quality.toString());
        url.searchParams.set('f', format);
        if (blur) {
            url.searchParams.set('blur', '1');
        }
        return url.toString();
    }
    /**
     * Check if browser supports WebP
     */
    static supportsWebP() {
        return new Promise((resolve) => {
            const webP = new Image();
            webP.onload = webP.onerror = () => {
                resolve(webP.height === 2);
            };
            webP.src =
                'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
        });
    }
    /**
     * Check if browser supports AVIF
     */
    static supportsAVIF() {
        return new Promise((resolve) => {
            const avif = new Image();
            avif.onload = avif.onerror = () => {
                resolve(avif.height === 2);
            };
            avif.src =
                'data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAAB0AAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAEAAAABAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQAMAAAAABNjb2xybmNseAACAAIABoAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAAB9tZGF0EgAKCBgABogQEAwgMgkf';
        });
    }
    /**
     * Get best format for browser
     */
    static async getBestFormat() {
        if (await this.supportsAVIF())
            return 'avif';
        if (await this.supportsWebP())
            return 'webp';
        return 'jpeg';
    }
    /**
     * Preload image
     */
    static preloadImage(url) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = reject;
            img.src = url;
        });
    }
    /**
     * Generate responsive image srcset
     */
    static generateSrcSet(baseUrl, widths = [320, 640, 1024, 1280, 1920], format) {
        return widths
            .map((width) => {
            const opts = { width };
            if (format !== undefined) {
                opts.format = format;
            }
            return `${this.generateOptimizedUrl(baseUrl, opts)} ${width}w`;
        })
            .join(', ');
    }
}
// ====== LAZY IMAGE HOOK ======
export function useLazyImage(src, options = {}) {
    const [imageState, setImageState] = useState({
        src: options.placeholder || '',
        isLoading: true,
        isError: false,
        isLoaded: false,
    });
    const [isIntersecting, setIsIntersecting] = useState(false);
    const imgRef = useRef(null);
    const observerRef = useRef(null);
    // Intersection observer for lazy loading
    useEffect(() => {
        if (!options.lazy || !imgRef.current)
            return;
        observerRef.current = new IntersectionObserver(([entry]) => {
            if (entry !== undefined && entry.isIntersecting) {
                setIsIntersecting(true);
                observerRef.current?.disconnect();
            }
        }, { threshold: 0.1 });
        observerRef.current.observe(imgRef.current);
        return () => {
            observerRef.current?.disconnect();
        };
    }, [options.lazy]);
    // Load image when intersecting or not lazy
    useEffect(() => {
        if (!isIntersecting && options.lazy)
            return;
        const loadImage = async () => {
            try {
                setImageState((prev) => ({ ...prev, isLoading: true, isError: false }));
                // Check cache first
                const cacheKey = `${src}_${JSON.stringify(options)}`;
                const cached = ImageCacheManager.get(cacheKey);
                if (cached) {
                    setImageState({
                        src: cached.url,
                        isLoading: false,
                        isError: false,
                        isLoaded: true,
                    });
                    return;
                }
                // Generate optimized URL
                const optimizedUrl = ImageOptimizer.generateOptimizedUrl(src, options);
                // Load image
                const img = await ImageOptimizer.preloadImage(optimizedUrl);
                // Convert to blob for caching
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                canvas.width = img.width;
                canvas.height = img.height;
                ctx?.drawImage(img, 0, 0);
                canvas.toBlob((blob) => {
                    if (blob) {
                        ImageCacheManager.set(cacheKey, blob);
                        setImageState({
                            src: URL.createObjectURL(blob),
                            isLoading: false,
                            isError: false,
                            isLoaded: true,
                        });
                    }
                }, `image/${options.format || 'webp'}`, options.quality || 80);
            }
            catch (error) {
                logger.error('Failed to load image', { error });
                setImageState((prev) => ({
                    ...prev,
                    isLoading: false,
                    isError: true,
                    src: options.fallback || '/placeholder-image.jpg',
                }));
            }
        };
        loadImage();
    }, [src, isIntersecting, options]);
    return {
        ...imageState,
        ref: imgRef,
    };
}
// ====== OPTIMIZED IMAGE COMPONENT ======
export const OptimizedImage = React.forwardRef(({ src, alt, options = {}, className = '', style, onLoad, onError }, ref) => {
    const { src: optimizedSrc, isLoading, isError, isLoaded } = useLazyImage(src, options);
    useEffect(() => {
        if (isLoaded && onLoad)
            onLoad();
        if (isError && onError)
            onError();
    }, [isLoaded, isError, onLoad, onError]);
    return (<div className={`relative ${className}`} style={style}>
      {/* Using native img for advanced optimization features that next/image doesn't support */}
      <img ref={ref} src={optimizedSrc} alt={alt} className={`w-full h-full object-cover transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'}`} loading={options.lazy ? 'lazy' : 'eager'}/>

      {/* Loading placeholder */}
      {isLoading ? <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"/>
        </div> : null}

      {/* Error placeholder */}
      {isError ? <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
          <div className="text-gray-400 text-center">
            <div className="text-2xl mb-2">📷</div>
            <div className="text-sm">Failed to load image</div>
          </div>
        </div> : null}
    </div>);
});
OptimizedImage.displayName = 'OptimizedImage';
// ====== RESPONSIVE IMAGE COMPONENT ======
export const ResponsiveImage = ({ src, alt, widths = [320, 640, 1024, 1280, 1920], format, sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw', className, style, }) => {
    const [bestFormat, setBestFormat] = useState('jpeg');
    useEffect(() => {
        ImageOptimizer.getBestFormat().then(setBestFormat);
    }, []);
    const effectiveFormat = format ?? bestFormat;
    const srcSet = ImageOptimizer.generateSrcSet(src, widths, effectiveFormat);
    const fallbackSrc = ImageOptimizer.generateOptimizedUrl(src, { format: 'jpeg' });
    return (
    /* Using native img for responsive srcset optimization */
    <img src={fallbackSrc} srcSet={srcSet} sizes={sizes} alt={alt} className={className} style={style} loading="lazy"/>);
};
// ====== EXPORTS ======
export { ImageCacheManager, ImageOptimizer };
//# sourceMappingURL=imageOptimization.jsx.map
//# sourceMappingURL=imageOptimization.jsx.map
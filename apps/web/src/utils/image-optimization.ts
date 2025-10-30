/**
 * Image Optimization Utilities
 * Handles lazy loading, blur-up placeholders, and format conversion
 */
/**
 * Generate blur placeholder from image
 */
export async function generateBlurPlaceholder(imageUrl) {
    return await new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            if (!ctx) {
                reject(new Error('Could not get canvas context'));
                return;
            }
            // Small size for blur placeholder
            canvas.width = 10;
            canvas.height = 10;
            ctx.drawImage(img, 0, 0, 10, 10);
            // Get base64 data URL
            const blurDataUrl = canvas.toDataURL('image/jpeg', 0.1);
            resolve(blurDataUrl);
        };
        img.onerror = () => { reject(new Error('Failed to load image')); };
        img.src = imageUrl;
    });
}
/**
 * Convert image to WebP format
 */
export async function convertToWebP(imageBlob, quality = 0.8) {
    return await new Promise((resolve, reject) => {
        const img = new Image();
        const url = URL.createObjectURL(imageBlob);
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            if (!ctx) {
                reject(new Error('Could not get canvas context'));
                return;
            }
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);
            canvas.toBlob((blob) => {
                URL.revokeObjectURL(url);
                if (blob) {
                    resolve(blob);
                }
                else {
                    reject(new Error('Failed to convert to WebP'));
                }
            }, 'image/webp', quality);
        };
        img.onerror = () => {
            URL.revokeObjectURL(url);
            reject(new Error('Failed to load image'));
        };
        img.src = url;
    });
}
/**
 * Resize image to max dimensions
 */
export async function resizeImage(imageBlob, maxWidth, maxHeight, quality = 0.9) {
    return await new Promise((resolve, reject) => {
        const img = new Image();
        const url = URL.createObjectURL(imageBlob);
        img.onload = () => {
            let { width, height } = img;
            // Calculate new dimensions
            if (width > maxWidth || height > maxHeight) {
                const ratio = Math.min(maxWidth / width, maxHeight / height);
                width *= ratio;
                height *= ratio;
            }
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            if (!ctx) {
                reject(new Error('Could not get canvas context'));
                return;
            }
            canvas.width = width;
            canvas.height = height;
            // Use better image smoothing
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
            ctx.drawImage(img, 0, 0, width, height);
            canvas.toBlob((blob) => {
                URL.revokeObjectURL(url);
                if (blob) {
                    resolve(blob);
                }
                else {
                    reject(new Error('Failed to resize image'));
                }
            }, 'image/jpeg', quality);
        };
        img.onerror = () => {
            URL.revokeObjectURL(url);
            reject(new Error('Failed to load image'));
        };
        img.src = url;
    });
}
/**
 * Lazy load image with IntersectionObserver
 */
export function lazyLoadImage(img, src, placeholder) {
    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    const image = entry.target;
                    image.src = src;
                    image.classList.remove('lazy');
                    observer.unobserve(image);
                }
            });
        }, {
            rootMargin: '50px',
        });
        if (placeholder) {
            img.src = placeholder;
        }
        img.classList.add('lazy');
        observer.observe(img);
    }
    else {
        // Fallback for browsers without IntersectionObserver
        img.src = src;
    }
}
/**
 * Preload images
 */
export function preloadImages(urls) {
    return Promise.all(urls.map((url) => new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => { resolve(); };
        img.onerror = () => { reject(new Error(`Failed to preload ${url}`)); };
        img.src = url;
    })));
}
/**
 * Get optimized image URL with CDN parameters
 */
export function getOptimizedImageUrl(url, options = {}) {
    // If using a CDN like Cloudinary or imgix, add transformation parameters
    const params = new URLSearchParams();
    if (options.width)
        params.set('w', options.width.toString());
    if (options.height)
        params.set('h', options.height.toString());
    if (options.quality)
        params.set('q', options.quality.toString());
    if (options.format)
        params.set('f', options.format);
    const separator = url.includes('?') ? '&' : '?';
    return params.toString() ? `${url}${separator}${params.toString()}` : url;
}
/**
 * Check if WebP is supported
 */
export function supportsWebP() {
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
 * Calculate image aspect ratio
 */
export async function getImageAspectRatio(imageUrl) {
    return await new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            resolve(img.width / img.height);
        };
        img.onerror = () => { reject(new Error('Failed to load image')); };
        img.src = imageUrl;
    });
}
/**
 * Compress image
 */
export async function compressImage(imageBlob, maxSizeMB = 1) {
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (imageBlob.size <= maxSizeBytes) {
        return imageBlob;
    }
    // Calculate quality based on size
    const ratio = maxSizeBytes / imageBlob.size;
    const quality = Math.max(0.1, Math.min(0.9, ratio));
    return await resizeImage(imageBlob, 2048, 2048, quality);
}
//# sourceMappingURL=image-optimization.js.map
import React, { memo, useCallback, useEffect, useRef, useState } from 'react';
/**
 * Optimized Image Component with lazy loading and responsive images
 */
export const OptimizedImage = memo(({ src, alt, className = '', priority = false, sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw' }) => {
    const [isLoaded, setIsLoaded] = useState(false);
    const [hasError, setHasError] = useState(false);
    const [isInView, setIsInView] = useState(priority);
    const imgRef = useRef(null);
    // Intersection Observer for lazy loading
    useEffect(() => {
        if (priority)
            return; // Skip lazy loading for priority images
        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) {
                setIsInView(true);
                observer.disconnect();
            }
        }, { threshold: 0.1, rootMargin: '50px' });
        if (imgRef.current) {
            observer.observe(imgRef.current);
        }
        return () => observer.disconnect();
    }, [priority]);
    const handleLoad = useCallback(() => {
        setIsLoaded(true);
    }, []);
    const handleError = useCallback(() => {
        setHasError(true);
    }, []);
    if (hasError) {
        return (<div className={`bg-gray-200 dark:bg-gray-700 flex items-center justify-center ${className}`}>
        <span className="text-gray-500 text-sm">Image unavailable</span>
      </div>);
    }
    return (<div className={`relative overflow-hidden ${className}`}>
      {/* Loading placeholder */}
      {!isLoaded && (<div className="absolute inset-0 bg-gray-200 dark:bg-gray-700 animate-pulse"/>)}

      {/* Optimized image with responsive srcSet */}
      {isInView && (<img ref={imgRef} src={src} alt={alt} className={`w-full h-full object-cover transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'}`} loading={priority ? 'eager' : 'lazy'} onLoad={handleLoad} onError={handleError} sizes={sizes} 
        // Add srcSet for responsive images (basic implementation)
        srcSet={`${src} 1x, ${src} 2x`}/>)}
    </div>);
});
//# sourceMappingURL=OptimizedImage.jsx.map
//# sourceMappingURL=OptimizedImage.jsx.map
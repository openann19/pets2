'use client';
import { motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
export const LazyImage = ({ src, alt, className = '', placeholder, blurDataURL, width, height, priority = false, onLoad, onError, }) => {
    const [isLoaded, setIsLoaded] = useState(false);
    const [isInView, setIsInView] = useState(priority);
    const [hasError, setHasError] = useState(false);
    const imgRef = useRef(null);
    useEffect(() => {
        if (priority)
            return;
        const observer = new IntersectionObserver((entries) => {
            const entry = entries[0];
            if (!entry)
                return;
            if (entry.isIntersecting) {
                setIsInView(true);
                observer.disconnect();
            }
        }, {
            threshold: 0.1,
            rootMargin: '50px',
        });
        if (imgRef.current) {
            observer.observe(imgRef.current);
        }
        return () => { observer.disconnect(); };
    }, [priority]);
    const handleLoad = () => {
        setIsLoaded(true);
        onLoad?.();
    };
    const handleError = () => {
        setHasError(true);
        onError?.();
    };
    return (<div ref={imgRef} className={`relative overflow-hidden ${className}`} style={{ width, height }}>
      {/* Placeholder/Blur */}
      {!isLoaded && !hasError && (<motion.div initial={{ opacity: 1 }} animate={{ opacity: isLoaded ? 0 : 1 }} transition={{ duration: 0.3 }} className="absolute inset-0 bg-gray-200 dark:bg-gray-700">
          {blurDataURL ? (<img src={blurDataURL} alt="" className="w-full h-full object-cover filter blur-sm"/>) : (<div className="w-full h-full bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 animate-pulse"/>)}
        </motion.div>)}

      {/* Main Image */}
      {isInView && (<motion.img src={src} alt={alt} className={`w-full h-full object-cover transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'}`} onLoad={handleLoad} onError={handleError} loading={priority ? 'eager' : 'lazy'} decoding="async"/>)}

      {/* Error State */}
      {hasError && (<div className="absolute inset-0 bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
          <div className="text-center">
            <svg className="w-8 h-8 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
            </svg>
            <p className="text-xs text-gray-500 dark:text-gray-400">Failed to load</p>
          </div>
        </div>)}

      {/* Loading Spinner */}
      {!isLoaded && !hasError && isInView && (<div className="absolute inset-0 flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-pink-600 border-t-transparent rounded-full animate-spin"/>
        </div>)}
    </div>);
};
//# sourceMappingURL=LazyImage.jsx.map
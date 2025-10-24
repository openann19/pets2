/**
 * SafeImage Component
 *
 * A bulletproof image component that handles:
 * - Missing images (404 errors)
 * - Broken URLs
 * - Loading states
 * - Fallback placeholders
 * - Progressive loading with blur placeholders
 * - Dark mode support
 */
import React, { useState, useEffect } from 'react'
import { logger } from '@pawfectmatch/core';
;
import { motion } from 'framer-motion';
import Image from 'next/image';
import { getBlurData, getPetPhotoBlur } from '@/lib/getBlur';
// SVG Data URLs for instant placeholder rendering (no 404 errors!)
const FALLBACK_IMAGES = {
    pet: `data:image/svg+xml,%3Csvg width='400' height='400' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3ClinearGradient id='grad' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' style='stop-color:rgb(236,72,153);stop-opacity:1' /%3E%3Cstop offset='100%25' style='stop-color:rgb(147,51,234);stop-opacity:1' /%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='400' height='400' fill='%23f3f4f6'/%3E%3Ccircle cx='200' cy='200' r='80' fill='url(%23grad)' opacity='0.2'/%3E%3Cpath d='M200,120 Q180,100 160,120 Q140,140 160,160 L200,200 L240,160 Q260,140 240,120 Q220,100 200,120' fill='url(%23grad)'/%3E%3Ccircle cx='180' cy='140' r='8' fill='white'/%3E%3Ccircle cx='220' cy='140' r='8' fill='white'/%3E%3Cpath d='M170,170 Q200,190 230,170' stroke='url(%23grad)' stroke-width='4' fill='none' stroke-linecap='round'/%3E%3Ctext x='200' y='320' font-family='Arial, sans-serif' font-size='20' fill='%239ca3af' text-anchor='middle'%3E%F0%9F%90%BE%3C/text%3E%3C/svg%3E`,
    user: `data:image/svg+xml,%3Csvg width='400' height='400' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='400' height='400' fill='%23e5e7eb'/%3E%3Ccircle cx='200' cy='160' r='60' fill='%239ca3af'/%3E%3Cellipse cx='200' cy='340' rx='120' ry='80' fill='%239ca3af'/%3E%3C/svg%3E`,
    generic: `data:image/svg+xml,%3Csvg width='400' height='400' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='400' height='400' fill='%23f3f4f6'/%3E%3Cpath d='M150,150 L250,150 L250,250 L150,250 Z M170,180 L230,180 L230,220 L170,220 Z' fill='%23d1d5db'/%3E%3Ctext x='200' y='320' font-family='Arial' font-size='16' fill='%239ca3af' text-anchor='middle'%3ENo Image%3C/text%3E%3C/svg%3E`,
};
export default function SafeImage({ src, alt, fallbackType = 'pet', showLoadingSpinner = false, enableBlurPlaceholder = true, blurDataURL, priority = false, sizes, className = '', ...props }) {
    const [imageSrc, setImageSrc] = useState(src || FALLBACK_IMAGES[fallbackType]);
    const [isLoading, setIsLoading] = useState(!!src);
    const [hasError, setHasError] = useState(false);
    const [blurPlaceholder, setBlurPlaceholder] = useState(blurDataURL);
    useEffect(() => {
        // Reset state when src changes
        if (src) {
            setImageSrc(src);
            setIsLoading(true);
            setHasError(false);
            // Generate blur placeholder if enabled and not provided
            if (enableBlurPlaceholder && !blurDataURL && src) {
                const generateBlur = async () => {
                    try {
                        const blur = fallbackType === 'pet'
                            ? await getPetPhotoBlur(src)
                            : await getBlurData(src);
                        setBlurPlaceholder(blur);
                    }
                    catch (error) {
                        logger.warn('Failed to generate blur placeholder:', { error });
                    }
                };
                generateBlur();
            }
        }
        else {
            setImageSrc(FALLBACK_IMAGES[fallbackType]);
            setIsLoading(false);
            setHasError(false);
            setBlurPlaceholder(undefined);
        }
    }, [src, fallbackType, enableBlurPlaceholder, blurDataURL]);
    const handleError = () => {
        logger.warn(`[SafeImage] Failed to load image: ${src}`);
        setImageSrc(FALLBACK_IMAGES[fallbackType]);
        setIsLoading(false);
        setHasError(true);
    };
    const handleLoad = () => {
        setIsLoading(false);
        setHasError(false);
    };
    return (<div className="relative inline-block">
      {showLoadingSpinner && isLoading && !hasError && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 flex items-center justify-center bg-neutral-100/50 dark:bg-neutral-800/50 backdrop-blur-sm rounded-lg z-10">
          <div className="w-8 h-8 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin"/>
        </motion.div>)}
      
      <Image {...props} src={imageSrc} alt={alt} onError={handleError} onLoad={handleLoad} priority={priority} sizes={sizes} placeholder={blurPlaceholder ? 'blur' : 'empty'} blurDataURL={blurPlaceholder} className={`${className} ${isLoading && !hasError ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}/>
    </div>);
}
//# sourceMappingURL=SafeImage.jsx.map
//# sourceMappingURL=SafeImage.jsx.map
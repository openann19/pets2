'use client';
import { SPRING_CONFIG } from '@/constants/animations';
import { useScreenReaderAnnouncement } from '@/hooks/useAccessibility';
import { MapPinIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon, SparklesIcon } from '@heroicons/react/24/solid';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { LazyImage } from '../Performance/LazyImage';
import { withErrorBoundary } from '../providers/AppErrorBoundary';
/**
 * Optimized SwipeCard component with enhanced performance, accessibility, and UX
 * Features:
 * - Memoized motion values and handlers
 * - Keyboard navigation support
 * - Screen reader announcements
 * - Haptic feedback
 * - Loading states
 * - Error boundaries
 * - Performance optimizations
 */
const OptimizedSwipeCard = ({ pet, onSwipe, onCardClick, style, dragConstraints, hapticFeedback, premiumEffects, accessibilityEnabled = true, isLoading = false, ariaLabel, }) => {
    // Accessibility hook
    const { announce } = useScreenReaderAnnouncement();
    // Refs for performance optimization
    const cardRef = useRef(null);
    const timeoutRefs = useRef([]);
    // State management
    const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
    const [isExiting, setIsExiting] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [showOverlay, setShowOverlay] = useState(false);
    // Motion values - memoized for performance
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    // Transform values - memoized to prevent recalculation
    // Uncomment these if needed in the component
    // const rotate = useMemo(() => useTransform(x, [-300, 300], [-30, 30]), [x]);
    // const cardOpacity = useMemo(() => useTransform(x, [-300, -150, 0, 150, 300], [0, 1, 1, 1, 0]), [x]);
    // const cardScale = useMemo(() => useTransform(x, [-300, 0, 300], [0.8, 1, 0.8]), [x]);
    // Overlay opacities - call hooks at top level
    const likeOverlayOpacity = useTransform(x, [60, 140], [0, 1]);
    const passOverlayOpacity = useTransform(x, [-140, -60], [1, 0]);
    const superLikeOverlayOpacity = useTransform(y, [-200, -100], [1, 0]);
    // Cleanup timeouts on unmount
    useEffect(() => {
        return () => {
            timeoutRefs.current.forEach(clearTimeout);
        };
    }, []);
    // Memoized handlers to prevent unnecessary re-renders
    const handleSwipe = useCallback((direction) => {
        if (isExiting)
            return;
        setIsExiting(true);
        // Announce action for screen readers
        if (accessibilityEnabled) {
            const actionText = {
                like: `Liked ${pet.name}`,
                pass: `Passed on ${pet.name}`,
                superlike: `Super liked ${pet.name}`,
            };
            announce(actionText[direction], 'polite');
        }
        // Haptic feedback
        if (hapticFeedback) {
            hapticFeedback('medium');
        }
        // Call the onSwipe callback
        onSwipe(direction);
    }, [isExiting, pet.name, accessibilityEnabled, announce, hapticFeedback, onSwipe]);
    const handleDragEnd = useCallback((_event, info) => {
        setIsDragging(false);
        const threshold = 100;
        const velocity = info.velocity.x;
        const offset = info.offset.x;
        const verticalOffset = info.offset.y;
        // Determine swipe direction based on velocity and offset
        if (Math.abs(velocity) > 500 || Math.abs(offset) > threshold) {
            if (verticalOffset < -threshold && Math.abs(offset) < threshold) {
                // Super like (swipe up)
                handleSwipe('superlike');
            }
            else if (offset > 0) {
                // Like (swipe right)
                handleSwipe('like');
            }
            else {
                // Pass (swipe left)
                handleSwipe('pass');
            }
        }
        else {
            // Snap back to center
            x.set(0);
            y.set(0);
        }
    }, [handleSwipe, x, y]);
    const handleDragStart = useCallback(() => {
        setIsDragging(true);
        setShowOverlay(true);
    }, []);
    const handleCardClick = useCallback(() => {
        if (!isDragging && onCardClick) {
            onCardClick();
        }
    }, [isDragging, onCardClick]);
    const handleKeyDown = useCallback((event) => {
        if (!accessibilityEnabled)
            return;
        switch (event.key) {
            case 'ArrowLeft':
                event.preventDefault();
                handleSwipe('pass');
                break;
            case 'ArrowRight':
                event.preventDefault();
                handleSwipe('like');
                break;
            case 'ArrowUp':
                event.preventDefault();
                handleSwipe('superlike');
                break;
            case 'Enter':
            case ' ':
                event.preventDefault();
                handleCardClick();
                break;
        }
    }, [accessibilityEnabled, handleSwipe, handleCardClick]);
    // Memoized photo navigation handlers - used in event handlers
    // Keeping them for potential future use
    /*
    const handleNextPhoto = useCallback(() => {
      if (pet.photos && pet.photos.length > 1) {
        setCurrentPhotoIndex((prev) => (prev + 1) % pet.photos.length);
      }
    }, [pet.photos]);
  
    const handlePrevPhoto = useCallback(() => {
      if (pet.photos && pet.photos.length > 1) {
        setCurrentPhotoIndex((prev) => (prev - 1 + pet.photos.length) % pet.photos.length);
      }
    }, [pet.photos]);
    */
    // Memoized styles for performance
    const cardStyle = useMemo(() => ({
        ...style,
        cursor: isDragging ? 'grabbing' : 'grab',
    }), [style, isDragging]);
    // Loading state
    if (isLoading) {
        return (<div className="relative w-full h-full bg-neutral-100 dark:bg-neutral-800 rounded-2xl shadow-lg animate-pulse">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"/>
        </div>
      </div>);
    }
    // Exiting state
    if (isExiting) {
        return null;
    }
    return (<motion.div ref={cardRef} className="relative w-full h-full bg-white dark:bg-neutral-800 rounded-2xl shadow-xl overflow-hidden" style={cardStyle} drag dragConstraints={dragConstraints} dragElastic={0.2} dragMomentum={false} onDragStart={handleDragStart} onDragEnd={handleDragEnd} onKeyDown={handleKeyDown} tabIndex={accessibilityEnabled ? 0 : -1} role="button" aria-label={ariaLabel || `Pet card for ${pet.name}`} aria-describedby={`pet-info-${pet._id}`} initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }} transition={SPRING_CONFIG} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
      {/* Pet Image */}
      <div className="relative w-full h-full">
        <LazyImage src={pet.photos?.[currentPhotoIndex] || ''} alt={`${pet.name} - ${pet.breed}`} className="w-full h-full object-cover" loading="eager"/>

        {/* Photo Navigation Dots */}
        {pet.photos && pet.photos.length > 1 && (<div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
            {pet.photos.map((_, index) => (<button key={index} className={`w-2 h-2 rounded-full transition-colors ${index === currentPhotoIndex ? 'bg-white' : 'bg-white/50'}`} onClick={(e) => {
                    e.stopPropagation();
                    setCurrentPhotoIndex(index);
                }} aria-label={`View photo ${index + 1}`}/>))}
          </div>)}

        {/* Premium Badge */}
        {premiumEffects && (<div className="absolute top-4 right-4 bg-gradient-to-r from-yellow-400 to-yellow-600 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg">
            <SparklesIcon className="w-3 h-3 inline mr-1"/>
            Premium
          </div>)}
      </div>

      {/* Overlay Effects */}
      {showOverlay && (<>
          {/* Like Overlay */}
          <motion.div className="absolute inset-0 bg-green-500/20 flex items-center justify-center pointer-events-none" style={{ opacity: likeOverlayOpacity }}>
            <div className="bg-green-500 text-white px-6 py-3 rounded-full text-lg font-bold shadow-lg">
              <HeartSolidIcon className="w-6 h-6 inline mr-2"/>
              LIKE
            </div>
          </motion.div>

          {/* Pass Overlay */}
          <motion.div className="absolute inset-0 bg-red-500/20 flex items-center justify-center pointer-events-none" style={{ opacity: passOverlayOpacity }}>
            <div className="bg-red-500 text-white px-6 py-3 rounded-full text-lg font-bold shadow-lg">
              <XMarkIcon className="w-6 h-6 inline mr-2"/>
              PASS
            </div>
          </motion.div>

          {/* Super Like Overlay */}
          <motion.div className="absolute inset-0 bg-blue-500/20 flex items-center justify-center pointer-events-none" style={{ opacity: superLikeOverlayOpacity }}>
            <div className="bg-blue-500 text-white px-6 py-3 rounded-full text-lg font-bold shadow-lg">
              <SparklesIcon className="w-6 h-6 inline mr-2"/>
              SUPER LIKE
            </div>
          </motion.div>
        </>)}

      {/* Pet Information */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold">{pet.name}</h3>
            <p className="text-lg opacity-90">{pet.breed}</p>
            <div className="flex items-center mt-2">
              <MapPinIcon className="w-4 h-4 mr-1"/>
              <span className="text-sm">{pet.location?.address?.city || 'Unknown location'}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <button onClick={(e) => {
            e.stopPropagation();
            handleSwipe('pass');
        }} className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-colors" aria-label="Pass on this pet">
              <XMarkIcon className="w-6 h-6"/>
            </button>

            <button onClick={(e) => {
            e.stopPropagation();
            handleSwipe('superlike');
        }} className="w-12 h-12 bg-blue-500/80 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-blue-500 transition-colors" aria-label="Super like this pet">
              <SparklesIcon className="w-6 h-6"/>
            </button>

            <button onClick={(e) => {
            e.stopPropagation();
            handleSwipe('like');
        }} className="w-12 h-12 bg-green-500/80 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-green-500 transition-colors" aria-label="Like this pet">
              <HeartSolidIcon className="w-6 h-6"/>
            </button>
          </div>
        </div>
      </div>

      {/* Hidden pet info for screen readers */}
      <div id={`pet-info-${pet._id}`} className="sr-only">
        {pet.name} is a {pet.age} year old {pet.breed} located in {pet.location?.address?.city || 'Unknown location'}.
        {pet.description && ` ${pet.description}`}
        {/* Premium pet information would go here */}
      </div>
    </motion.div>);
};
// Export with error boundary
export const SwipeCard = withErrorBoundary(OptimizedSwipeCard, {
    fallback: (<div className="w-full h-full bg-neutral-100 dark:bg-neutral-800 rounded-2xl flex items-center justify-center">
      <p className="text-neutral-500">Failed to load pet card</p>
    </div>),
});
export default SwipeCard;
//# sourceMappingURL=OptimizedSwipeCard.jsx.map
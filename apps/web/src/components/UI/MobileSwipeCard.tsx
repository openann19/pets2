/**
 * 📱 Mobile-Optimized SwipeCard Component
 * Professional mobile swipe interface with haptic feedback and accessibility
 */
'use client';
import React, { useRef, useState, useCallback, useEffect } from 'react';
import { motion, useMotionValue, useSpring, PanInfo } from 'framer-motion';
import { HeartIcon, XMarkIcon, StarIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import { SPRING_CONFIGS, GESTURE_CONFIGS } from '@/constants/animations';
import { useHaptics, useAccessibility } from '@/hooks/useAccessibility';
import { Pet } from '@/types';
const SWIPE_THRESHOLD = 100;
const ROTATION_FACTOR = 0.1;
export default function MobileSwipeCard({ pet, onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown, disabled = false, className = '', showActions = true, haptic = true, sound = true, }) {
    const cardRef = useRef(null);
    const [isDragging, setIsDragging] = useState(false);
    const [swipeDirection, setSwipeDirection] = useState(null);
    const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
    const { triggerHaptic } = useHaptics();
    const { announce, isReducedMotion } = useAccessibility();
    // Motion values for drag
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const rotate = useMotionValue(0);
    // Spring animations
    const springX = useSpring(x, SPRING_CONFIGS.standard);
    const springY = useSpring(y, SPRING_CONFIGS.standard);
    const springRotate = useSpring(rotate, SPRING_CONFIGS.standard);
    // Handle drag start
    const handleDragStart = useCallback(() => {
        if (disabled)
            return;
        setIsDragging(true);
        if (haptic)
            triggerHaptic('light');
    }, [disabled, haptic, triggerHaptic]);
    // Handle drag
    const handleDrag = useCallback((event, info) => {
        if (disabled)
            return;
        const { offset } = info;
        const absX = Math.abs(offset.x);
        const absY = Math.abs(offset.y);
        // Determine swipe direction
        if (absX > absY) {
            setSwipeDirection(offset.x > 0 ? 'right' : 'left');
        }
        else {
            setSwipeDirection(offset.y > 0 ? 'down' : 'up');
        }
        // Apply rotation based on horizontal movement
        rotate.set(offset.x * ROTATION_FACTOR);
    }, [disabled, rotate]);
    // Handle drag end
    const handleDragEnd = useCallback((event, info) => {
        if (disabled)
            return;
        const { offset, velocity } = info;
        const absX = Math.abs(offset.x);
        const absY = Math.abs(offset.y);
        const absVelX = Math.abs(velocity.x);
        const absVelY = Math.abs(velocity.y);
        // Determine if swipe threshold is met
        const isSwipeX = absX > SWIPE_THRESHOLD || absVelX > 500;
        const isSwipeY = absY > SWIPE_THRESHOLD || absVelY > 500;
        if (isSwipeX && absX > absY) {
            // Horizontal swipe
            if (offset.x > 0) {
                // Swipe right (like)
                triggerHaptic('medium');
                announce('Liked pet profile');
                onSwipeRight(pet);
            }
            else {
                // Swipe left (pass)
                triggerHaptic('medium');
                announce('Passed on pet profile');
                onSwipeLeft(pet);
            }
        }
        else if (isSwipeY && absY > absX) {
            // Vertical swipe
            if (offset.y < 0) {
                // Swipe up (super like)
                triggerHaptic('heavy');
                announce('Super liked pet profile');
                onSwipeUp(pet);
            }
            else if (onSwipeDown) {
                // Swipe down
                triggerHaptic('medium');
                announce('Viewed pet details');
                onSwipeDown(pet);
            }
        }
        else {
            // Return to center
            x.set(0);
            y.set(0);
            rotate.set(0);
        }
        setIsDragging(false);
        setSwipeDirection(null);
    }, [disabled, x, y, rotate, triggerHaptic, announce, onSwipeRight, onSwipeLeft, onSwipeUp, onSwipeDown, pet]);
    // Handle keyboard navigation
    const handleKeyDown = useCallback((event) => {
        if (disabled)
            return;
        switch (event.key) {
            case 'ArrowLeft':
                event.preventDefault();
                triggerHaptic('medium');
                announce('Passed on pet profile');
                onSwipeLeft(pet);
                break;
            case 'ArrowRight':
                event.preventDefault();
                triggerHaptic('medium');
                announce('Liked pet profile');
                onSwipeRight(pet);
                break;
            case 'ArrowUp':
                event.preventDefault();
                triggerHaptic('heavy');
                announce('Super liked pet profile');
                onSwipeUp(pet);
                break;
            case 'ArrowDown':
                if (onSwipeDown) {
                    event.preventDefault();
                    triggerHaptic('medium');
                    announce('Viewed pet details');
                    onSwipeDown(pet);
                }
                break;
            case ' ':
            case 'Enter':
                event.preventDefault();
                triggerHaptic('medium');
                announce('Liked pet profile');
                onSwipeRight(pet);
                break;
        }
    }, [disabled, triggerHaptic, announce, onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown, pet]);
    // Photo navigation
    const nextPhoto = useCallback(() => {
        if (pet.photos && currentPhotoIndex < pet.photos.length - 1) {
            setCurrentPhotoIndex(prev => prev + 1);
        }
    }, [pet.photos, currentPhotoIndex]);
    const prevPhoto = useCallback(() => {
        if (currentPhotoIndex > 0) {
            setCurrentPhotoIndex(prev => prev - 1);
        }
    }, [currentPhotoIndex]);
    // Get current photo
    const currentPhoto = pet.photos?.[currentPhotoIndex];
    // Swipe overlay styles
    const getSwipeOverlayStyle = () => {
        if (!swipeDirection)
            return {};
        const baseStyle = {
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '2rem',
            fontWeight: 'bold',
            borderRadius: '1rem',
            zIndex: 10,
        };
        switch (swipeDirection) {
            case 'right':
                return {
                    ...baseStyle,
                    background: 'rgba(34, 197, 94, 0.2)',
                    color: '#22c55e',
                };
            case 'left':
                return {
                    ...baseStyle,
                    background: 'rgba(239, 68, 68, 0.2)',
                    color: '#ef4444',
                };
            case 'up':
                return {
                    ...baseStyle,
                    background: 'rgba(59, 130, 246, 0.2)',
                    color: '#3b82f6',
                };
            case 'down':
                return {
                    ...baseStyle,
                    background: 'rgba(168, 85, 247, 0.2)',
                    color: '#a855f7',
                };
            default:
                return {};
        }
    };
    const getSwipeOverlayText = () => {
        switch (swipeDirection) {
            case 'right': return 'LIKE';
            case 'left': return 'PASS';
            case 'up': return 'SUPER LIKE';
            case 'down': return 'DETAILS';
            default: return '';
        }
    };
    return (<div className={`relative w-full max-w-sm mx-auto ${className}`}>
      <motion.div ref={cardRef} className="relative bg-white rounded-2xl shadow-lg overflow-hidden cursor-grab active:cursor-grabbing" drag={!disabled} dragConstraints={GESTURE_CONFIGS.swipe.dragConstraints} dragElastic={GESTURE_CONFIGS.swipe.dragElastic} onDragStart={handleDragStart} onDrag={handleDrag} onDragEnd={handleDragEnd} style={{
            x: springX,
            y: springY,
            rotate: springRotate,
        }} whileTap={{ scale: 0.98 }} transition={isReducedMotion ? { duration: 0 } : SPRING_CONFIGS.standard} tabIndex={0} onKeyDown={handleKeyDown} aria-label={`Pet profile: ${pet.name}, ${pet.breed}, ${pet.age} years old. Use arrow keys to like, pass, or super like.`} aria-describedby={`pet-info-${pet._id}`} role="region">
        {/* Pet Image */}
        <div className="relative h-96 bg-gray-200">
          {currentPhoto ? (<img src={currentPhoto.url} alt={`${pet.name} - Photo ${currentPhotoIndex + 1}`} className="w-full h-full object-cover" draggable={false}/>) : (<div className="w-full h-full flex items-center justify-center bg-gray-200">
              <span className="text-gray-500">No photo available</span>
            </div>)}

          {/* Photo indicators */}
          {pet.photos && pet.photos.length > 1 && (<div className="absolute top-4 left-4 flex space-x-1">
              {pet.photos.map((_, index) => (<button key={index} className={`w-2 h-2 rounded-full transition-colors ${index === currentPhotoIndex ? 'bg-white' : 'bg-white/50'}`} onClick={() => setCurrentPhotoIndex(index)} aria-label={`Go to photo ${index + 1}`}/>))}
            </div>)}

          {/* Swipe overlay */}
          {swipeDirection && (<motion.div style={getSwipeOverlayStyle()} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} transition={SPRING_CONFIGS.snappy}>
              {getSwipeOverlayText()}
            </motion.div>)}

          {/* Photo navigation buttons */}
          {pet.photos && pet.photos.length > 1 && (<>
              <button className="absolute left-2 top-1/2 transform -translate-y-1/2 p-2 bg-black/20 rounded-full text-white hover:bg-black/40 transition-colors" onClick={prevPhoto} disabled={currentPhotoIndex === 0} aria-label="Previous photo">
                ←
              </button>
              <button className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 bg-black/20 rounded-full text-white hover:bg-black/40 transition-colors" onClick={nextPhoto} disabled={currentPhotoIndex === pet.photos.length - 1} aria-label="Next photo">
                →
              </button>
            </>)}
        </div>

        {/* Pet Info */}
        <div className="p-4" id={`pet-info-${pet._id}`}>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xl font-bold text-gray-900">{pet.name}</h3>
            <span className="text-gray-500">{pet.age} years old</span>
          </div>
          <p className="text-gray-600 mb-2">{pet.breed}</p>
          {pet.description && (<p className="text-sm text-gray-500 line-clamp-2">{pet.description}</p>)}
          
          {/* Personality tags */}
          {pet.personalityTags && pet.personalityTags.length > 0 && (<div className="flex flex-wrap gap-1 mt-3">
              {pet.personalityTags.slice(0, 3).map((tag, index) => (<span key={index} className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">
                  {tag}
                </span>))}
            </div>)}
        </div>

        {/* Action Buttons */}
        {showActions && (<div className="flex justify-center gap-3 sm:gap-4 p-4 bg-gray-50">
            <button className="p-3 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2" onClick={() => onSwipeLeft(pet)} aria-label="Pass on this pet">
              <XMarkIcon className="w-6 h-6"/>
            </button>
            
            <button className="p-3 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2" onClick={() => onSwipeUp(pet)} aria-label="Super like this pet">
              <StarIcon className="w-6 h-6"/>
            </button>
            
            <button className="p-3 bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2" onClick={() => onSwipeRight(pet)} aria-label="Like this pet">
              <HeartIcon className="w-6 h-6"/>
            </button>
          </div>)}
      </motion.div>

      {/* Screen reader content */}
      <div className="sr-only">
        <p>Pet name: {pet.name}</p>
        <p>Age: {pet.age} years old</p>
        <p>Breed: {pet.breed}</p>
        <p>Description: {pet.description}</p>
        <p>Personality: {pet.personalityTags?.join(', ')}</p>
        <p>Use arrow keys to navigate: Left to pass, Right to like, Up to super like</p>
      </div>
    </div>);
}
//# sourceMappingURL=MobileSwipeCard.jsx.map
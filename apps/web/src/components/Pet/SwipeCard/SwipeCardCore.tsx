/**
 * 🎯 SWIPE CARD CORE COMPONENT
 * Optimized core functionality with comprehensive keyboard navigation and ARIA support
 *
 * Keyboard Controls:
 * - ArrowLeft: Pass (swipe left)
 * - ArrowRight: Like (swipe right)
 * - ArrowUp: Superlike (swipe up)
 * - Enter/Space: Activate focused button
 * - Escape: Cancel/unfocus
 * - Tab: Navigate between action buttons
 */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
export const SwipeCardCore = ({ pet, onSwipe, onCardClick, style, dragConstraints, }) => {
    const cardRef = useRef(null);
    const passButtonRef = useRef(null);
    const superlikeButtonRef = useRef(null);
    const likeButtonRef = useRef(null);
    const [isExiting, setIsExiting] = useState(false);
    const [focusedAction, setFocusedAction] = useState(null);
    const [announcement, setAnnouncement] = useState('');
    // Motion values for smooth interactions
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const rotate = useTransform(x, [-300, 300], [-30, 30]);
    const opacity = useTransform(x, [-300, -150, 0, 150, 300], [0, 1, 1, 1, 0]);
    // Overlay opacities
    const likeOverlayOpacity = useTransform(x, [60, 140], [0, 1]);
    const passOverlayOpacity = useTransform(x, [-140, -60], [1, 0]);
    /**
     * Screen reader announcement
     */
    const announce = useCallback((message) => {
        setAnnouncement(message);
        setTimeout(() => { setAnnouncement(''); }, 1000);
    }, []);
    /**
     * Handle keyboard navigation
     */
    const handleKeyDown = useCallback((event) => {
        // Prevent default for arrow keys to avoid page scroll
        if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'Escape'].includes(event.key)) {
            event.preventDefault();
        }
        switch (event.key) {
            case 'ArrowLeft':
                handleButtonClick('pass');
                announce(`Passed on ${pet.name}`);
                break;
            case 'ArrowRight':
                handleButtonClick('like');
                announce(`Liked ${pet.name}`);
                break;
            case 'ArrowUp':
                handleButtonClick('superlike');
                announce(`Super liked ${pet.name}`);
                break;
            case 'Escape':
                // Unfocus any focused element
                if (document.activeElement instanceof HTMLElement) {
                    document.activeElement.blur();
                }
                setFocusedAction(null);
                break;
        }
    }, [pet.name]);
    /**
     * Setup keyboard event listeners
     */
    useEffect(() => {
        const cardElement = cardRef.current;
        if (!cardElement)
            return;
        cardElement.addEventListener('keydown', handleKeyDown);
        return () => {
            cardElement.removeEventListener('keydown', handleKeyDown);
        };
    }, [handleKeyDown]);
    const handleDragEnd = (event, info) => {
        const threshold = 100;
        const velocity = info.velocity.x;
        const offset = info.offset.x;
        const verticalOffset = info.offset.y;
        // Determine swipe direction based on velocity and offset
        if (verticalOffset < -threshold && Math.abs(offset) < 50) {
            // Superlike (swipe up)
            onSwipe('superlike');
            announce(`Super liked ${pet.name}`);
            setIsExiting(true);
        }
        else if (Math.abs(velocity) > 500 || Math.abs(offset) > threshold) {
            if (offset > 0) {
                onSwipe('like');
                announce(`Liked ${pet.name}`);
            }
            else {
                onSwipe('pass');
                announce(`Passed on ${pet.name}`);
            }
            setIsExiting(true);
        }
    };
    const handleButtonClick = (action) => {
        onSwipe(action);
        setIsExiting(true);
    };
    /**
     * Handle button focus for visual feedback
     */
    const handleButtonFocus = (action) => {
        setFocusedAction(action);
    };
    const handleButtonBlur = () => {
        setFocusedAction(null);
    };
    if (isExiting) {
        return null;
    }
    return (<>
      {/* Screen Reader Announcements */}
      <div role="status" aria-live="polite" aria-atomic="true" className="sr-only">
        {announcement}
      </div>

      <motion.div ref={cardRef} className="relative w-full h-full cursor-grab active:cursor-grabbing focus:outline-none focus:ring-4 focus:ring-purple-500 focus:ring-opacity-50 rounded-2xl" style={{
            ...(style || {}),
            x,
            y,
            rotate,
            opacity,
        }} drag dragConstraints={dragConstraints} dragElastic={0.2} dragTransition={{ bounceStiffness: 300, bounceDamping: 20 }} onDragEnd={handleDragEnd} onClick={onCardClick} whileTap={{ scale: 0.95 }} initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }} transition={{ type: 'spring', stiffness: 300, damping: 30 }} tabIndex={0} role="article" aria-label={`${pet.name}, ${pet.breed}, ${pet.age} years old. Use arrow keys to swipe: left to pass, right to like, up for superlike.`}>
        {/* Card Content */}
        <div className="relative w-full h-full bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Pet Image */}
          <div className="relative w-full h-3/4">
            <img src={pet.photos?.[0] || '/placeholder-pet.jpg'} alt={`${pet.name}, a ${pet.age} year old ${pet.breed}`} className="w-full h-full object-cover" loading="lazy"/>

            {/* Overlay Effects with ARIA labels */}
            <motion.div className="absolute inset-0 bg-green-500 bg-opacity-20 flex items-center justify-center pointer-events-none" style={{ opacity: likeOverlayOpacity }} aria-hidden="true">
              <div className="text-white text-6xl font-bold transform -rotate-12">LIKE</div>
            </motion.div>

            <motion.div className="absolute inset-0 bg-red-500 bg-opacity-20 flex items-center justify-center pointer-events-none" style={{ opacity: passOverlayOpacity }} aria-hidden="true">
              <div className="text-white text-6xl font-bold transform rotate-12">PASS</div>
            </motion.div>
          </div>

          {/* Pet Info */}
          <div className="p-4 h-1/4 flex flex-col justify-between">
            <div>
              <h3 className="text-xl font-bold text-gray-900">{pet.name}</h3>
              <p className="text-gray-600">{pet.breed}</p>
              <p className="text-sm text-gray-500">{pet.age} years old</p>
            </div>

            {/* Action Buttons with Full Accessibility */}
            <div className="flex justify-center space-x-4 mt-2" role="group" aria-label="Swipe actions">
              {/* Pass Button */}
              <button ref={passButtonRef} onClick={(e) => {
            e.stopPropagation();
            handleButtonClick('pass');
        }} onFocus={() => { handleButtonFocus('pass'); }} onBlur={handleButtonBlur} onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                e.stopPropagation();
                handleButtonClick('pass');
            }
        }} className={`w-12 h-12 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-all transform hover:scale-110 ${focusedAction === 'pass' ? 'ring-4 ring-red-300 scale-110' : ''}`} aria-label={`Pass on ${pet.name}. Keyboard shortcut: Left arrow`} title="Pass (←)">
                <span className="text-2xl" aria-hidden="true">✕</span>
              </button>

              {/* Superlike Button */}
              <button ref={superlikeButtonRef} onClick={(e) => {
            e.stopPropagation();
            handleButtonClick('superlike');
        }} onFocus={() => { handleButtonFocus('superlike'); }} onBlur={handleButtonBlur} onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                e.stopPropagation();
                handleButtonClick('superlike');
            }
        }} className={`w-12 h-12 bg-blue-500 text-white rounded-full flex items-center justify-center hover:bg-blue-600 transition-all transform hover:scale-110 ${focusedAction === 'superlike' ? 'ring-4 ring-blue-300 scale-110' : ''}`} aria-label={`Super like ${pet.name}. Keyboard shortcut: Up arrow`} title="Super Like (↑)">
                <span className="text-2xl" aria-hidden="true">⭐</span>
              </button>

              {/* Like Button */}
              <button ref={likeButtonRef} onClick={(e) => {
            e.stopPropagation();
            handleButtonClick('like');
        }} onFocus={() => { handleButtonFocus('like'); }} onBlur={handleButtonBlur} onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                e.stopPropagation();
                handleButtonClick('like');
            }
        }} className={`w-12 h-12 bg-green-500 text-white rounded-full flex items-center justify-center hover:bg-green-600 transition-all transform hover:scale-110 ${focusedAction === 'like' ? 'ring-4 ring-green-300 scale-110' : ''}`} aria-label={`Like ${pet.name}. Keyboard shortcut: Right arrow`} title="Like (→)">
                <span className="text-2xl" aria-hidden="true">♥</span>
              </button>
            </div>
          </div>
        </div>

        {/* Keyboard Hint Overlay (Shows on first focus) */}
        {focusedAction && (<div className="absolute bottom-24 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-75 text-white px-4 py-2 rounded-lg text-sm whitespace-nowrap pointer-events-none">
            Use arrow keys: ← Pass | ↑ Super | → Like
          </div>)}
      </motion.div>
    </>);
};
//# sourceMappingURL=SwipeCardCore.jsx.map
//# sourceMappingURL=SwipeCardCore.jsx.map
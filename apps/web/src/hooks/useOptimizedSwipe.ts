/**
 * 🃏 OPTIMIZED SWIPE HOOK
 * Enhanced swipe mechanics based on Tinder clone optimizations
 * Provides smooth, responsive swipe interactions with haptic feedback
 */
import { useCallback, useRef, useState } from 'react';
import { useMotionValue, useTransform, PanInfo } from 'framer-motion';
export const useOptimizedSwipe = (config = {}, callbacks) => {
    const { threshold = 100, superThreshold = 120, velocityThreshold = 500, hapticEnabled = true, soundEnabled = true, } = config;
    const { onSwipe, onSwipeStart, onSwipeEnd, onThresholdReach } = callbacks;
    // Motion values for smooth interactions
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const rotate = useTransform(x, [-300, 300], [-30, 30]);
    const opacity = useTransform(x, [-300, -150, 0, 150, 300], [0, 1, 1, 1, 0]);
    // Overlay opacities for visual feedback
    const likeOverlayOpacity = useTransform(x, [60, 140], [0, 1]);
    const passOverlayOpacity = useTransform(x, [-140, -60], [1, 0]);
    const superLikeOverlayOpacity = useTransform(y, [-160, -80], [1, 0]);
    // State management
    const [isExiting, setIsExiting] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const thresholdReachedRef = useRef(null);
    // Enhanced haptic feedback
    const triggerHaptic = useCallback((type = 'medium') => {
        if (!hapticEnabled || !('vibrate' in navigator))
            return;
        const patterns = {
            light: [10],
            medium: [20],
            heavy: [30, 10, 30]
        };
        navigator.vibrate(patterns[type]);
    }, [hapticEnabled]);
    // Enhanced sound feedback
    const triggerSound = useCallback((type) => {
        if (!soundEnabled)
            return;
        try {
            const sounds = {
                swipe: '/sounds/swipe.mp3',
                threshold: '/sounds/threshold.mp3',
                complete: '/sounds/complete.mp3'
            };
            const audio = new Audio(sounds[type]);
            audio.volume = 0.2;
            audio.play().catch(() => { });
        }
        catch (error) {
            // Fallback to haptic feedback
            triggerHaptic('light');
        }
    }, [soundEnabled, triggerHaptic]);
    // Optimized drag start handler
    const handleDragStart = useCallback(() => {
        setIsDragging(true);
        thresholdReachedRef.current = null;
        onSwipeStart?.();
    }, [onSwipeStart]);
    // Optimized drag end handler with enhanced logic
    const handleDragEnd = useCallback((_, info) => {
        setIsDragging(false);
        onSwipeEnd?.();
        const velocity = info.velocity.x;
        const offset = info.offset.x;
        const yOffset = info.offset.y;
        // Check for super like (swipe up) - Enhanced detection
        if (yOffset < -superThreshold && Math.abs(offset) < 50) {
            triggerHaptic('heavy');
            triggerSound('complete');
            setIsExiting(true);
            setTimeout(() => onSwipe('superlike'), 200);
            return;
        }
        // Enhanced velocity-based detection
        const isStrongSwipe = Math.abs(velocity) > velocityThreshold;
        const isDragBeyondThreshold = Math.abs(offset) > threshold;
        if (isStrongSwipe || isDragBeyondThreshold) {
            triggerHaptic('medium');
            triggerSound('complete');
            setIsExiting(true);
            if (offset > 0 || velocity > 0) {
                setTimeout(() => onSwipe('like'), 200);
            }
            else {
                setTimeout(() => onSwipe('pass'), 200);
            }
        }
        else {
            // Snap back with light feedback
            triggerHaptic('light');
            x.set(0);
            y.set(0);
        }
    }, [
        threshold,
        superThreshold,
        velocityThreshold,
        triggerHaptic,
        triggerSound,
        onSwipe,
        onSwipeEnd,
        x,
        y
    ]);
    // Enhanced button click handler
    const handleButtonClick = useCallback((action) => {
        // Different haptic patterns for different actions
        if (action === 'superlike') {
            triggerHaptic('heavy');
        }
        else {
            triggerHaptic('medium');
        }
        triggerSound('complete');
        setIsExiting(true);
        setTimeout(() => onSwipe(action), 200);
    }, [triggerHaptic, triggerSound, onSwipe]);
    // Threshold detection for visual feedback
    const checkThreshold = useCallback((offset, yOffset) => {
        // Like threshold
        if (offset > 60 && thresholdReachedRef.current !== 'like') {
            thresholdReachedRef.current = 'like';
            onThresholdReach?.('like');
            triggerHaptic('light');
        }
        // Pass threshold
        else if (offset < -60 && thresholdReachedRef.current !== 'pass') {
            thresholdReachedRef.current = 'pass';
            onThresholdReach?.('pass');
            triggerHaptic('light');
        }
        // Super like threshold
        else if (yOffset < -80 && thresholdReachedRef.current !== 'superlike') {
            thresholdReachedRef.current = 'superlike';
            onThresholdReach?.('superlike');
            triggerHaptic('medium');
        }
        // Reset threshold
        else if (Math.abs(offset) < 40 && Math.abs(yOffset) < 60) {
            thresholdReachedRef.current = null;
        }
    }, [onThresholdReach, triggerHaptic]);
    // Reset function
    const reset = useCallback(() => {
        setIsExiting(false);
        setIsDragging(false);
        thresholdReachedRef.current = null;
        x.set(0);
        y.set(0);
    }, [x, y]);
    return {
        // Motion values
        x,
        y,
        rotate,
        opacity,
        likeOverlayOpacity,
        passOverlayOpacity,
        superLikeOverlayOpacity,
        // State
        isExiting,
        isDragging,
        // Handlers
        handleDragStart,
        handleDragEnd,
        handleButtonClick,
        checkThreshold,
        reset,
        // Utilities
        triggerHaptic,
        triggerSound,
    };
};
//# sourceMappingURL=useOptimizedSwipe.js.map
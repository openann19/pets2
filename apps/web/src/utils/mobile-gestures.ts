/**
 * Mobile Gestures Utilities
 * Advanced gesture recognition and handling for mobile devices
 */
import { useCallback, useRef, useState, useEffect } from 'react'
import { logger } from '@pawfectmatch/core';
;
/**
 * Hook for swipe gesture detection
 */
export function useSwipeGesture(onSwipe, config = {}) {
    const defaultConfig = {
        threshold: 50,
        velocity: 0.3,
        direction: 'both',
        preventDefault: true,
        stopPropagation: false,
    };
    const finalConfig = { ...defaultConfig, ...config };
    const touchStartRef = useRef(null);
    const elementRef = useRef(null);
    const handleTouchStart = useCallback((e) => {
        if (e.touches.length !== 1)
            return;
        const touch = e.touches[0];
        touchStartRef.current = {
            x: touch.clientX,
            y: touch.clientY,
            time: Date.now(),
        };
        if (finalConfig.preventDefault) {
            e.preventDefault();
        }
        if (finalConfig.stopPropagation) {
            e.stopPropagation();
        }
    }, [finalConfig]);
    const handleTouchEnd = useCallback((e) => {
        if (!touchStartRef.current || e.changedTouches.length !== 1)
            return;
        const touch = e.changedTouches[0];
        const endTime = Date.now();
        const duration = endTime - touchStartRef.current.time;
        const deltaX = touch.clientX - touchStartRef.current.x;
        const deltaY = touch.clientY - touchStartRef.current.y;
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        const velocity = distance / duration;
        if (distance < finalConfig.threshold || velocity < finalConfig.velocity) {
            touchStartRef.current = null;
            return;
        }
        let direction;
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
            // Horizontal swipe
            if (finalConfig.direction === 'vertical')
                return;
            direction = deltaX > 0 ? 'right' : 'left';
        }
        else {
            // Vertical swipe
            if (finalConfig.direction === 'horizontal')
                return;
            direction = deltaY > 0 ? 'down' : 'up';
        }
        const gesture = {
            direction,
            distance,
            velocity,
            duration,
        };
        onSwipe(gesture);
        touchStartRef.current = null;
        if (finalConfig.preventDefault) {
            e.preventDefault();
        }
        if (finalConfig.stopPropagation) {
            e.stopPropagation();
        }
    }, [finalConfig, onSwipe]);
    const attachGestures = useCallback((element) => {
        elementRef.current = element;
        element.addEventListener('touchstart', handleTouchStart, { passive: false });
        element.addEventListener('touchend', handleTouchEnd, { passive: false });
    }, [handleTouchStart, handleTouchEnd]);
    const detachGestures = useCallback(() => {
        if (elementRef.current) {
            elementRef.current.removeEventListener('touchstart', handleTouchStart);
            elementRef.current.removeEventListener('touchend', handleTouchEnd);
            elementRef.current = null;
        }
    }, [handleTouchStart, handleTouchEnd]);
    useEffect(() => {
        return () => {
            detachGestures();
        };
    }, [detachGestures]);
    return { attachGestures, detachGestures };
}
/**
 * Hook for pinch gesture detection
 */
export function usePinchGesture(onPinch, config = {}) {
    const { threshold = 0.1, preventDefault = true } = config;
    const touchStartRef = useRef(null);
    const elementRef = useRef(null);
    const getDistance = useCallback((touches) => {
        if (touches.length < 2)
            return 0;
        const dx = touches[0].clientX - touches[1].clientX;
        const dy = touches[0].clientY - touches[1].clientY;
        return Math.sqrt(dx * dx + dy * dy);
    }, []);
    const getCenter = useCallback((touches) => {
        if (touches.length < 2)
            return { x: 0, y: 0 };
        return {
            x: (touches[0].clientX + touches[1].clientX) / 2,
            y: (touches[0].clientY + touches[1].clientY) / 2,
        };
    }, []);
    const handleTouchStart = useCallback((e) => {
        if (e.touches.length !== 2)
            return;
        const distance = getDistance(e.touches);
        touchStartRef.current = {
            touches: e.touches,
            distance,
        };
        if (preventDefault) {
            e.preventDefault();
        }
    }, [getDistance, preventDefault]);
    const handleTouchMove = useCallback((e) => {
        if (!touchStartRef.current || e.touches.length !== 2)
            return;
        const currentDistance = getDistance(e.touches);
        const scale = currentDistance / touchStartRef.current.distance;
        const center = getCenter(e.touches);
        if (Math.abs(scale - 1) > threshold) {
            const gesture = {
                scale,
                center,
                distance: currentDistance,
            };
            onPinch(gesture);
        }
        if (preventDefault) {
            e.preventDefault();
        }
    }, [getDistance, getCenter, threshold, onPinch, preventDefault]);
    const handleTouchEnd = useCallback((e) => {
        touchStartRef.current = null;
    }, []);
    const attachGestures = useCallback((element) => {
        elementRef.current = element;
        element.addEventListener('touchstart', handleTouchStart, { passive: false });
        element.addEventListener('touchmove', handleTouchMove, { passive: false });
        element.addEventListener('touchend', handleTouchEnd, { passive: false });
    }, [handleTouchStart, handleTouchMove, handleTouchEnd]);
    const detachGestures = useCallback(() => {
        if (elementRef.current) {
            elementRef.current.removeEventListener('touchstart', handleTouchStart);
            elementRef.current.removeEventListener('touchmove', handleTouchMove);
            elementRef.current.removeEventListener('touchend', handleTouchEnd);
            elementRef.current = null;
        }
    }, [handleTouchStart, handleTouchMove, handleTouchEnd]);
    useEffect(() => {
        return () => {
            detachGestures();
        };
    }, [detachGestures]);
    return { attachGestures, detachGestures };
}
/**
 * Hook for pan gesture detection
 */
export function usePanGesture(onPan, config = {}) {
    const { threshold = 10, preventDefault = true } = config;
    const touchStartRef = useRef(null);
    const lastMoveRef = useRef(null);
    const elementRef = useRef(null);
    const handleTouchStart = useCallback((e) => {
        if (e.touches.length !== 1)
            return;
        const touch = e.touches[0];
        const now = Date.now();
        touchStartRef.current = { x: touch.clientX, y: touch.clientY, time: now };
        lastMoveRef.current = { x: touch.clientX, y: touch.clientY, time: now };
        if (preventDefault) {
            e.preventDefault();
        }
    }, [preventDefault]);
    const handleTouchMove = useCallback((e) => {
        if (!touchStartRef.current || !lastMoveRef.current || e.touches.length !== 1)
            return;
        const touch = e.touches[0];
        const now = Date.now();
        const deltaX = touch.clientX - touchStartRef.current.x;
        const deltaY = touch.clientY - touchStartRef.current.y;
        const totalDistance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        if (totalDistance < threshold)
            return;
        const moveDeltaX = touch.clientX - lastMoveRef.current.x;
        const moveDeltaY = touch.clientY - lastMoveRef.current.y;
        const moveTime = now - lastMoveRef.current.time;
        const velocityX = moveTime > 0 ? moveDeltaX / moveTime : 0;
        const velocityY = moveTime > 0 ? moveDeltaY / moveTime : 0;
        let direction = 'none';
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
            direction = deltaX > 0 ? 'right' : 'left';
        }
        else if (Math.abs(deltaY) > Math.abs(deltaX)) {
            direction = deltaY > 0 ? 'down' : 'up';
        }
        const gesture = {
            deltaX,
            deltaY,
            velocity: { x: velocityX, y: velocityY },
            direction,
        };
        onPan(gesture);
        lastMoveRef.current = { x: touch.clientX, y: touch.clientY, time: now };
        if (preventDefault) {
            e.preventDefault();
        }
    }, [threshold, onPan, preventDefault]);
    const handleTouchEnd = useCallback(() => {
        touchStartRef.current = null;
        lastMoveRef.current = null;
    }, []);
    const attachGestures = useCallback((element) => {
        elementRef.current = element;
        element.addEventListener('touchstart', handleTouchStart, { passive: false });
        element.addEventListener('touchmove', handleTouchMove, { passive: false });
        element.addEventListener('touchend', handleTouchEnd, { passive: false });
    }, [handleTouchStart, handleTouchMove, handleTouchEnd]);
    const detachGestures = useCallback(() => {
        if (elementRef.current) {
            elementRef.current.removeEventListener('touchstart', handleTouchStart);
            elementRef.current.removeEventListener('touchmove', handleTouchMove);
            elementRef.current.removeEventListener('touchend', handleTouchEnd);
            elementRef.current = null;
        }
    }, [handleTouchStart, handleTouchMove, handleTouchEnd]);
    useEffect(() => {
        return () => {
            detachGestures();
        };
    }, [detachGestures]);
    return { attachGestures, detachGestures };
}
/**
 * Hook for pull-to-refresh functionality
 */
export function usePullToRefresh(onRefresh, config = {}) {
    const { threshold = 100, resistance = 0.5, maxPullDistance = 200, preventDefault = true, } = config;
    const [state, setState] = useState({
        isPulling: false,
        pullDistance: 0,
        isRefreshing: false,
        canRefresh: false,
    });
    const touchStartRef = useRef(null);
    const elementRef = useRef(null);
    const handleTouchStart = useCallback((e) => {
        if (e.touches.length !== 1)
            return;
        const element = elementRef.current;
        if (!element)
            return;
        const touch = e.touches[0];
        touchStartRef.current = {
            y: touch.clientY,
            scrollTop: element.scrollTop,
        };
        if (preventDefault) {
            e.preventDefault();
        }
    }, [preventDefault]);
    const handleTouchMove = useCallback((e) => {
        if (!touchStartRef.current || e.touches.length !== 1)
            return;
        const element = elementRef.current;
        if (!element)
            return;
        const touch = e.touches[0];
        const deltaY = touch.clientY - touchStartRef.current.y;
        // Only trigger pull-to-refresh if at the top of the scroll
        if (element.scrollTop <= 0 && deltaY > 0) {
            const pullDistance = Math.min(deltaY * resistance, maxPullDistance);
            const canRefresh = pullDistance >= threshold;
            setState({
                isPulling: true,
                pullDistance,
                isRefreshing: false,
                canRefresh,
            });
            if (preventDefault) {
                e.preventDefault();
            }
        }
    }, [threshold, resistance, maxPullDistance, preventDefault]);
    const handleTouchEnd = useCallback(async () => {
        if (!state.isPulling)
            return;
        if (state.canRefresh && !state.isRefreshing) {
            setState(prev => ({ ...prev, isRefreshing: true, isPulling: false }));
            try {
                await onRefresh();
            }
            catch (error) {
                logger.error('Pull-to-refresh failed:', { error });
            }
            finally {
                setState({
                    isPulling: false,
                    pullDistance: 0,
                    isRefreshing: false,
                    canRefresh: false,
                });
            }
        }
        else {
            setState({
                isPulling: false,
                pullDistance: 0,
                isRefreshing: false,
                canRefresh: false,
            });
        }
        touchStartRef.current = null;
    }, [state, onRefresh]);
    const attachGestures = useCallback((element) => {
        elementRef.current = element;
        element.addEventListener('touchstart', handleTouchStart, { passive: false });
        element.addEventListener('touchmove', handleTouchMove, { passive: false });
        element.addEventListener('touchend', handleTouchEnd, { passive: false });
    }, [handleTouchStart, handleTouchMove, handleTouchEnd]);
    const detachGestures = useCallback(() => {
        if (elementRef.current) {
            elementRef.current.removeEventListener('touchstart', handleTouchStart);
            elementRef.current.removeEventListener('touchmove', handleTouchMove);
            elementRef.current.removeEventListener('touchend', handleTouchEnd);
            elementRef.current = null;
        }
    }, [handleTouchStart, handleTouchMove, handleTouchEnd]);
    useEffect(() => {
        return () => {
            detachGestures();
        };
    }, [detachGestures]);
    return {
        state,
        attachGestures,
        detachGestures,
        setState,
    };
}
/**
 * Hook for long press gesture detection
 */
export function useLongPress(onLongPress, config = {}) {
    const { delay = 500, preventDefault = true } = config;
    const timeoutRef = useRef(null);
    const elementRef = useRef(null);
    const handleTouchStart = useCallback((e) => {
        if (e.touches.length !== 1)
            return;
        timeoutRef.current = setTimeout(() => {
            onLongPress();
        }, delay);
        if (preventDefault) {
            e.preventDefault();
        }
    }, [delay, onLongPress, preventDefault]);
    const handleTouchEnd = useCallback(() => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }
    }, []);
    const handleTouchCancel = useCallback(() => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }
    }, []);
    const attachGestures = useCallback((element) => {
        elementRef.current = element;
        element.addEventListener('touchstart', handleTouchStart, { passive: false });
        element.addEventListener('touchend', handleTouchEnd, { passive: false });
        element.addEventListener('touchcancel', handleTouchCancel, { passive: false });
    }, [handleTouchStart, handleTouchEnd, handleTouchCancel]);
    const detachGestures = useCallback(() => {
        if (elementRef.current) {
            elementRef.current.removeEventListener('touchstart', handleTouchStart);
            elementRef.current.removeEventListener('touchend', handleTouchEnd);
            elementRef.current.removeEventListener('touchcancel', handleTouchCancel);
            elementRef.current = null;
        }
    }, [handleTouchStart, handleTouchEnd, handleTouchCancel]);
    useEffect(() => {
        return () => {
            detachGestures();
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, [detachGestures]);
    return { attachGestures, detachGestures };
}
/**
 * Utility functions for gesture handling
 */
export const gestureUtils = {
    // Prevent default touch behaviors
    preventDefault: (e) => {
        e.preventDefault();
    },
    // Stop event propagation
    stopPropagation: (e) => {
        e.stopPropagation();
    },
    // Check if device supports touch
    isTouchDevice: () => {
        return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    },
    // Get touch point from event
    getTouchPoint: (e, index = 0) => {
        if (e.touches.length > index) {
            return {
                x: e.touches[index].clientX,
                y: e.touches[index].clientY,
            };
        }
        return null;
    },
    // Calculate distance between two points
    getDistance: (point1, point2) => {
        const dx = point1.x - point2.x;
        const dy = point1.y - point2.y;
        return Math.sqrt(dx * dx + dy * dy);
    },
    // Calculate angle between two points
    getAngle: (point1, point2) => {
        const dx = point2.x - point1.x;
        const dy = point2.y - point1.y;
        return Math.atan2(dy, dx) * (180 / Math.PI);
    },
    // Add haptic feedback (if supported)
    hapticFeedback: (type = 'medium') => {
        if ('vibrate' in navigator) {
            const patterns = {
                light: [10],
                medium: [20],
                heavy: [30, 10, 20],
            };
            navigator.vibrate(patterns[type]);
        }
    },
};
//# sourceMappingURL=mobile-gestures.js.map
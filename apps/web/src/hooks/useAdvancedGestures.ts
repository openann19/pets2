'use client';
import { useCallback, useRef, useState, useEffect } from 'react';
// ====== DEFAULT CONFIG ======
const DEFAULT_CONFIG = {
    tapThreshold: 10,
    doubleTapDelay: 300,
    longPressDelay: 500,
    swipeThreshold: 50,
    pinchThreshold: 0.1,
    rotateThreshold: 5,
    panThreshold: 10,
    preventDefault: true,
    stopPropagation: false,
};
// ====== UTILITY FUNCTIONS ======
const getDistance = (touch1, touch2) => {
    const dx = touch1.clientX - touch2.clientX;
    const dy = touch1.clientY - touch2.clientY;
    return Math.sqrt(dx * dx + dy * dy);
};
const getAngle = (touch1, touch2) => {
    return Math.atan2(touch2.clientY - touch1.clientY, touch2.clientX - touch1.clientX) * 180 / Math.PI;
};
const getCenter = (touches) => {
    if (touches.length === 0)
        return { x: 0, y: 0 };
    let x = 0;
    let y = 0;
    for (const touch of touches) {
        x += touch.clientX;
        y += touch.clientY;
    }
    return {
        x: x / touches.length,
        y: y / touches.length,
    };
};
const getVelocity = (startPos, endPos, time) => {
    const deltaTime = time / 1000; // Convert to seconds
    return {
        x: (endPos.x - startPos.x) / deltaTime,
        y: (endPos.y - startPos.y) / deltaTime,
    };
};
// ====== MAIN HOOK ======
export const useAdvancedGestures = (config = {}, callbacks = {}) => {
    const finalConfig = { ...DEFAULT_CONFIG, ...config };
    const gestureState = useRef({
        startPosition: { x: 0, y: 0 },
        currentPosition: { x: 0, y: 0 },
        startTime: 0,
        lastTapTime: 0,
        tapCount: 0,
        isLongPress: false,
        isPinching: false,
        isRotating: false,
        isPanning: false,
        initialDistance: 0,
        initialAngle: 0,
        lastScale: 1,
        lastRotation: 0,
        touches: [],
    });
    const longPressTimeout = useRef();
    const doubleTapTimeout = useRef();
    // ====== EVENT HANDLERS ======
    const handleTouchStart = useCallback((event) => {
        // Guard against SSR
        if (typeof window === 'undefined')
            return;
        if (finalConfig.preventDefault) {
            event.preventDefault();
        }
        if (finalConfig.stopPropagation) {
            event.stopPropagation();
        }
        const touches = Array.from(event.touches);
        const center = getCenter(touches);
        const now = Date.now();
        gestureState.current = {
            ...gestureState.current,
            startPosition: center,
            currentPosition: center,
            startTime: now,
            touches,
        };
        // Handle single touch
        if (touches.length === 1) {
            const touch = touches[0];
            gestureState.current.startPosition = { x: touch.clientX, y: touch.clientY };
            gestureState.current.currentPosition = { x: touch.clientX, y: touch.clientY };
            // Check for double tap
            if (now - gestureState.current.lastTapTime < finalConfig.doubleTapDelay) {
                gestureState.current.tapCount++;
            }
            else {
                gestureState.current.tapCount = 1;
            }
            gestureState.current.lastTapTime = now;
            // Start long press timer
            longPressTimeout.current = setTimeout(() => {
                if (!gestureState.current.isLongPress) {
                    gestureState.current.isLongPress = true;
                    const gestureEvent = {
                        type: 'longPress',
                        position: gestureState.current.currentPosition,
                        timestamp: now,
                        touches,
                    };
                    callbacks.onLongPress?.(gestureEvent);
                    callbacks.onGestureStart?.(gestureEvent);
                }
            }, finalConfig.longPressDelay);
        }
        // Handle multi-touch
        if (touches.length === 2) {
            const distance = getDistance(touches[0], touches[1]);
            const angle = getAngle(touches[0], touches[1]);
            gestureState.current.initialDistance = distance;
            gestureState.current.initialAngle = angle;
            gestureState.current.isPinching = true;
            gestureState.current.isRotating = true;
        }
    }, [finalConfig, callbacks]);
    const handleTouchMove = useCallback((event) => {
        // Guard against SSR
        if (typeof window === 'undefined')
            return;
        if (finalConfig.preventDefault) {
            event.preventDefault();
        }
        if (finalConfig.stopPropagation) {
            event.stopPropagation();
        }
        const touches = Array.from(event.touches);
        const center = getCenter(touches);
        const now = Date.now();
        gestureState.current.currentPosition = center;
        gestureState.current.touches = touches;
        // Handle single touch movement
        if (touches.length === 1) {
            const touch = touches[0];
            const currentPos = { x: touch.clientX, y: touch.clientY };
            const delta = {
                x: currentPos.x - gestureState.current.startPosition.x,
                y: currentPos.y - gestureState.current.startPosition.y,
            };
            const distance = Math.sqrt(delta.x * delta.x + delta.y * delta.y);
            // Check if it's a pan gesture
            if (distance > finalConfig.panThreshold && !gestureState.current.isLongPress) {
                if (!gestureState.current.isPanning) {
                    gestureState.current.isPanning = true;
                    const gestureEvent = {
                        type: 'pan',
                        position: currentPos,
                        delta,
                        timestamp: now,
                        touches,
                    };
                    callbacks.onPan?.(gestureEvent);
                    callbacks.onGestureStart?.(gestureEvent);
                }
                else {
                    const velocity = getVelocity(gestureState.current.startPosition, currentPos, now - gestureState.current.startTime);
                    const gestureEvent = {
                        type: 'pan',
                        position: currentPos,
                        delta,
                        velocity,
                        timestamp: now,
                        touches,
                    };
                    callbacks.onPan?.(gestureEvent);
                }
            }
        }
        // Handle multi-touch movement
        if (touches.length === 2) {
            const distance = getDistance(touches[0], touches[1]);
            const angle = getAngle(touches[0], touches[1]);
            // Handle pinch gesture
            if (gestureState.current.isPinching) {
                const scale = distance / gestureState.current.initialDistance;
                const scaleDelta = scale - gestureState.current.lastScale;
                if (Math.abs(scaleDelta) > finalConfig.pinchThreshold) {
                    const gestureEvent = {
                        type: 'pinch',
                        position: center,
                        scale,
                        timestamp: now,
                        touches,
                    };
                    callbacks.onPinch?.(gestureEvent);
                    gestureState.current.lastScale = scale;
                }
            }
            // Handle rotate gesture
            if (gestureState.current.isRotating) {
                const rotation = angle - gestureState.current.initialAngle;
                const rotationDelta = rotation - gestureState.current.lastRotation;
                if (Math.abs(rotationDelta) > finalConfig.rotateThreshold) {
                    const gestureEvent = {
                        type: 'rotate',
                        position: center,
                        rotation,
                        timestamp: now,
                        touches,
                    };
                    callbacks.onRotate?.(gestureEvent);
                    gestureState.current.lastRotation = rotation;
                }
            }
        }
    }, [finalConfig, callbacks]);
    const handleTouchEnd = useCallback((event) => {
        // Guard against SSR
        if (typeof window === 'undefined')
            return;
        if (finalConfig.preventDefault) {
            event.preventDefault();
        }
        if (finalConfig.stopPropagation) {
            event.stopPropagation();
        }
        const touches = Array.from(event.touches);
        const now = Date.now();
        const deltaTime = now - gestureState.current.startTime;
        // Clear long press timeout
        if (longPressTimeout.current) {
            clearTimeout(longPressTimeout.current);
        }
        // Handle single touch end
        if (gestureState.current.touches.length === 1) {
            const touch = gestureState.current.touches[0];
            const endPos = { x: touch.clientX, y: touch.clientY };
            const delta = {
                x: endPos.x - gestureState.current.startPosition.x,
                y: endPos.y - gestureState.current.startPosition.y,
            };
            const distance = Math.sqrt(delta.x * delta.x + delta.y * delta.y);
            const velocity = getVelocity(gestureState.current.startPosition, endPos, deltaTime);
            // Determine gesture type
            if (gestureState.current.isLongPress) {
                // Long press already handled
            }
            else if (gestureState.current.isPanning) {
                // Pan gesture
                const gestureEvent = {
                    type: 'pan',
                    position: endPos,
                    delta,
                    velocity,
                    timestamp: now,
                    touches,
                };
                callbacks.onPan?.(gestureEvent);
                callbacks.onGestureEnd?.(gestureEvent);
            }
            else if (distance > finalConfig.swipeThreshold) {
                // Swipe gesture
                const gestureEvent = {
                    type: 'swipe',
                    position: endPos,
                    delta,
                    velocity,
                    timestamp: now,
                    touches,
                };
                callbacks.onSwipe?.(gestureEvent);
                callbacks.onGestureEnd?.(gestureEvent);
            }
            else if (distance < finalConfig.tapThreshold) {
                // Tap gesture
                if (gestureState.current.tapCount === 2) {
                    // Double tap
                    const gestureEvent = {
                        type: 'doubleTap',
                        position: endPos,
                        timestamp: now,
                        touches,
                    };
                    callbacks.onDoubleTap?.(gestureEvent);
                    callbacks.onGestureEnd?.(gestureEvent);
                }
                else {
                    // Single tap (with delay to check for double tap)
                    doubleTapTimeout.current = setTimeout(() => {
                        if (gestureState.current.tapCount === 1) {
                            const gestureEvent = {
                                type: 'tap',
                                position: endPos,
                                timestamp: now,
                                touches,
                            };
                            callbacks.onTap?.(gestureEvent);
                            callbacks.onGestureEnd?.(gestureEvent);
                        }
                    }, finalConfig.doubleTapDelay);
                }
            }
        }
        // Handle multi-touch end
        if (gestureState.current.touches.length === 2) {
            const gestureEvent = {
                type: 'pinch',
                position: gestureState.current.currentPosition,
                scale: gestureState.current.lastScale,
                rotation: gestureState.current.lastRotation,
                timestamp: now,
                touches,
            };
            callbacks.onPinch?.(gestureEvent);
            callbacks.onRotate?.(gestureEvent);
            callbacks.onGestureEnd?.(gestureEvent);
        }
        // Reset gesture state
        gestureState.current = {
            ...gestureState.current,
            isLongPress: false,
            isPinching: false,
            isRotating: false,
            isPanning: false,
            lastScale: 1,
            lastRotation: 0,
            touches: [],
        };
    }, [finalConfig, callbacks]);
    // ====== CLEANUP ======
    useEffect(() => {
        // Add event listeners to window for global gesture handling
        const addEventListeners = () => {
            if (typeof window !== 'undefined') {
                window.addEventListener('touchstart', handleTouchStart, { passive: false });
                window.addEventListener('touchmove', handleTouchMove, { passive: false });
                window.addEventListener('touchend', handleTouchEnd, { passive: false });
                window.addEventListener('pointermove', handleTouchMove, { passive: false });
            }
        };
        // Remove event listeners from window
        const removeEventListeners = () => {
            if (typeof window !== 'undefined') {
                window.removeEventListener('touchstart', handleTouchStart);
                window.removeEventListener('touchmove', handleTouchMove);
                window.removeEventListener('touchend', handleTouchEnd);
                window.removeEventListener('pointermove', handleTouchMove);
            }
        };
        // Add listeners
        addEventListeners();
        // Cleanup function
        return () => {
            // Remove event listeners
            removeEventListeners();
            // Clear timeouts
            if (longPressTimeout.current) {
                clearTimeout(longPressTimeout.current);
            }
            if (doubleTapTimeout.current) {
                clearTimeout(doubleTapTimeout.current);
            }
            // Reset gesture state
            gestureState.current = {
                startPosition: { x: 0, y: 0 },
                currentPosition: { x: 0, y: 0 },
                startTime: 0,
                lastTapTime: 0,
                tapCount: 0,
                isLongPress: false,
                isPinching: false,
                isRotating: false,
                isPanning: false,
                initialDistance: 0,
                initialAngle: 0,
                lastScale: 1,
                lastRotation: 0,
                touches: [],
            };
        };
    }, [handleTouchStart, handleTouchMove, handleTouchEnd]);
    // ====== RETURN GESTURE HANDLERS ======
    return {
        onTouchStart: handleTouchStart,
        onTouchMove: handleTouchMove,
        onTouchEnd: handleTouchEnd,
        gestureState: gestureState.current,
    };
};
// ====== SPECIALIZED GESTURE HOOKS ======
export const useSwipeGestures = (callbacks) => {
    return useAdvancedGestures({ swipeThreshold: 50 }, {
        onSwipe: (event) => {
            const { delta, velocity } = event;
            if (!delta)
                return;
            const absX = Math.abs(delta.x);
            const absY = Math.abs(delta.y);
            if (absX > absY) {
                // Horizontal swipe
                if (delta.x > 0) {
                    callbacks.onSwipeRight?.();
                    callbacks.onSwipe?.('right', velocity || { x: 0, y: 0 });
                }
                else {
                    callbacks.onSwipeLeft?.();
                    callbacks.onSwipe?.('left', velocity || { x: 0, y: 0 });
                }
            }
            else {
                // Vertical swipe
                if (delta.y > 0) {
                    callbacks.onSwipeDown?.();
                    callbacks.onSwipe?.('down', velocity || { x: 0, y: 0 });
                }
                else {
                    callbacks.onSwipeUp?.();
                    callbacks.onSwipe?.('up', velocity || { x: 0, y: 0 });
                }
            }
        },
    });
};
export const usePinchGestures = (callbacks) => {
    const lastScale = useRef(1);
    return useAdvancedGestures({ pinchThreshold: 0.05 }, {
        onPinch: (event) => {
            const { scale } = event;
            if (!scale)
                return;
            const delta = scale - lastScale.current;
            if (delta > 0) {
                callbacks.onPinchOut?.(scale);
            }
            else {
                callbacks.onPinchIn?.(scale);
            }
            callbacks.onPinch?.(scale, delta);
            lastScale.current = scale;
        },
    });
};
export const useRotateGestures = (callbacks) => {
    const lastRotation = useRef(0);
    return useAdvancedGestures({ rotateThreshold: 2 }, {
        onRotate: (event) => {
            const { rotation } = event;
            if (rotation === undefined)
                return;
            const delta = rotation - lastRotation.current;
            callbacks.onRotate?.(rotation, delta);
            lastRotation.current = rotation;
        },
    });
};
export const usePanGestures = (callbacks) => {
    return useAdvancedGestures({ panThreshold: 10 }, {
        onPan: (event) => {
            const { delta, velocity } = event;
            if (!delta || !velocity)
                return;
            callbacks.onPan?.(delta, velocity);
        },
        onGestureStart: (event) => {
            if (event.type === 'pan') {
                callbacks.onPanStart?.();
            }
        },
        onGestureEnd: (event) => {
            if (event.type === 'pan') {
                callbacks.onPanEnd?.();
            }
        },
    });
};
// ====== EXPORT ALL HOOKS ======
export { useAdvancedGestures as default, useSwipeGestures, usePinchGestures, useRotateGestures, usePanGestures, };
//# sourceMappingURL=useAdvancedGestures.js.map
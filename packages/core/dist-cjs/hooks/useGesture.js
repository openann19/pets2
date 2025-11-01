"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useGesture = useGesture;
const react_1 = require("react");
const environment_1 = require("../utils/environment");
function useGesture(onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown) {
    const startPos = (0, react_1.useRef)({ x: 0, y: 0, time: 0 });
    const currentPos = (0, react_1.useRef)({ x: 0, y: 0, time: 0 });
    const lastPos = (0, react_1.useRef)({ x: 0, y: 0, time: 0 });
    const handleTouchStart = (0, react_1.useCallback)((e) => {
        if (e.touches.length > 0) {
            const touch = e.touches[0];
            if (touch != null) {
                startPos.current = { x: touch.clientX, y: touch.clientY, time: Date.now() };
                currentPos.current = { x: touch.clientX, y: touch.clientY, time: Date.now() };
                lastPos.current = { x: touch.clientX, y: touch.clientY, time: Date.now() };
            }
        }
    }, []);
    const handleTouchMove = (0, react_1.useCallback)((e) => {
        if (e.touches.length > 0) {
            const touch = e.touches[0];
            if (touch != null) {
                lastPos.current = currentPos.current;
                currentPos.current = { x: touch.clientX, y: touch.clientY, time: Date.now() };
            }
        }
    }, []);
    const handleTouchEnd = (0, react_1.useCallback)((_e) => {
        const now = Date.now();
        const deltaTime = now - startPos.current.time;
        // Only consider swipes that are quick enough (under 300ms)
        if (deltaTime > 300)
            return;
        const deltaX = currentPos.current.x - startPos.current.x;
        const deltaY = currentPos.current.y - startPos.current.y;
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        // Only consider significant movements (over 50px)
        if (distance < 50)
            return;
        // Determine primary direction
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
            // Horizontal swipe
            if (deltaX > 0 && onSwipeRight != null) {
                onSwipeRight();
            }
            else if (deltaX < 0 && onSwipeLeft != null) {
                onSwipeLeft();
            }
        }
        else {
            // Vertical swipe
            if (deltaY > 0 && onSwipeDown != null) {
                onSwipeDown();
            }
            else if (deltaY < 0 && onSwipeUp != null) {
                onSwipeUp();
            }
        }
    }, [onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown]);
    (0, react_1.useEffect)(() => {
        const element = (0, environment_1.getDocumentElement)();
        if (element == null) {
            return undefined;
        }
        (0, environment_1.addEventListenerSafely)(element, 'touchstart', handleTouchStart);
        (0, environment_1.addEventListenerSafely)(element, 'touchmove', handleTouchMove);
        (0, environment_1.addEventListenerSafely)(element, 'touchend', handleTouchEnd);
        return () => {
            (0, environment_1.removeEventListenerSafely)(element, 'touchstart', handleTouchStart);
            (0, environment_1.removeEventListenerSafely)(element, 'touchmove', handleTouchMove);
            (0, environment_1.removeEventListenerSafely)(element, 'touchend', handleTouchEnd);
        };
    }, [handleTouchStart, handleTouchMove, handleTouchEnd]);
    return {
        handleTouchStart,
        handleTouchMove,
        handleTouchEnd
    };
}

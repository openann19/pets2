import { useEffect, useRef, useCallback } from 'react';
import {
  addEventListenerSafely,
  getDocumentElement,
  removeEventListenerSafely,
} from '../utils/environment';

interface Position {
  x: number;
  y: number;
  time: number;
}

export function useGesture(
  onSwipeLeft?: () => void,
  onSwipeRight?: () => void,
  onSwipeUp?: () => void,
  onSwipeDown?: () => void,
) {
  const startPos = useRef<Position>({ x: 0, y: 0, time: 0 });
  const currentPos = useRef<Position>({ x: 0, y: 0, time: 0 });
  const lastPos = useRef<Position>({ x: 0, y: 0, time: 0 });

  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (e.touches.length > 0) {
      const touch = e.touches[0];
      if (touch != null) {
        startPos.current = { x: touch.clientX, y: touch.clientY, time: Date.now() };
        currentPos.current = { x: touch.clientX, y: touch.clientY, time: Date.now() };
        lastPos.current = { x: touch.clientX, y: touch.clientY, time: Date.now() };
      }
    }
  }, []);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (e.touches.length > 0) {
      const touch = e.touches[0];
      if (touch != null) {
        lastPos.current = currentPos.current;
        currentPos.current = { x: touch.clientX, y: touch.clientY, time: Date.now() };
      }
    }
  }, []);

  const handleTouchEnd = useCallback(
    (_e: TouchEvent) => {
      const now = Date.now();
      const deltaTime = now - startPos.current.time;

      // Only consider swipes that are quick enough (under 300ms)
      if (deltaTime > 300) return;

      const deltaX = currentPos.current.x - startPos.current.x;
      const deltaY = currentPos.current.y - startPos.current.y;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

      // Only consider significant movements (over 50px)
      if (distance < 50) return;

      // Determine primary direction
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        // Horizontal swipe
        if (deltaX > 0 && onSwipeRight != null) {
          onSwipeRight();
        } else if (deltaX < 0 && onSwipeLeft != null) {
          onSwipeLeft();
        }
      } else {
        // Vertical swipe
        if (deltaY > 0 && onSwipeDown != null) {
          onSwipeDown();
        } else if (deltaY < 0 && onSwipeUp != null) {
          onSwipeUp();
        }
      }
    },
    [onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown],
  );

  useEffect(() => {
    const element = getDocumentElement();
    if (element == null) {
      return undefined;
    }

    addEventListenerSafely(element, 'touchstart', handleTouchStart as EventListener);
    addEventListenerSafely(element, 'touchmove', handleTouchMove as EventListener);
    addEventListenerSafely(element, 'touchend', handleTouchEnd as EventListener);

    return () => {
      removeEventListenerSafely(element, 'touchstart', handleTouchStart as EventListener);
      removeEventListenerSafely(element, 'touchmove', handleTouchMove as EventListener);
      removeEventListenerSafely(element, 'touchend', handleTouchEnd as EventListener);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  return {
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
  };
}

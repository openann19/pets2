/**
 * useSwipeGestures Hook
 * 
 * Extracts pan responder logic from SwipeScreen for improved modularity and testability.
 * Handles swipe gesture detection and triggers appropriate actions.
 * 
 * @example
 * ```typescript
 * const { panResponder, gestureState } = useSwipeGestures({
 *   onSwipeRight: async (petId, index) => {
 *     await handleLike(petId);
 *   },
 *   onSwipeLeft: async (petId, index) => {
 *     await handlePass(petId);
 *   },
 * });
 * ```
 */

import { useRef, useCallback } from "react";
import { PanResponder, Dimensions } from "react-native";
import type { GestureResponderEvent, PanResponderGestureState } from "react-native";

const { width: screenWidth } = Dimensions.get("window");

export interface UseSwipeGesturesParams {
  /**
   * Threshold for detecting a swipe (default: 120px)
   */
  swipeThreshold?: number;
  
  /**
   * Current pet ID
   */
  currentPetId: string | undefined;
  
  /**
   * Current index in the pets array
   */
  currentIndex: number;
  
  /**
   * Callback when user swipes right (like)
   */
  onSwipeRight?: (petId: string, index: number) => Promise<void> | void;
  
  /**
   * Callback when user swipes left (pass)
   */
  onSwipeLeft?: (petId: string, index: number) => Promise<void> | void;
  
  /**
   * Callback when gesture starts (optional)
   */
  onGestureStart?: () => void;
  
  /**
   * Callback when gesture ends (optional)
   */
  onGestureEnd?: () => void;
}

export interface UseSwipeGesturesReturn {
  /**
   * Pan responder handler props to spread on animated view
   */
  panHandlers: ReturnType<typeof PanResponder.create>["panHandlers"];
  
  /**
   * Determine if a gesture should trigger based on delta
   */
  shouldTriggerSwipe: (
    gestureState: PanResponderGestureState,
    direction: "left" | "right"
  ) => boolean;
}

/**
 * Creates a pan responder for swipe gestures with configurable thresholds and callbacks.
 * 
 * @param params - Configuration for swipe gestures
 * @returns Pan responder handlers and utility functions
 */
export const useSwipeGestures = (params: UseSwipeGesturesParams): UseSwipeGesturesReturn => {
  const {
    swipeThreshold = 120,
    currentPetId,
    currentIndex,
    onSwipeRight,
    onSwipeLeft,
    onGestureStart,
    onGestureEnd,
  } = params;

  // Track if gesture is in progress to prevent race conditions
  const gestureInProgress = useRef(false);

  /**
   * Check if gesture state indicates a swipe in specified direction
   */
  const shouldTriggerSwipe = useCallback(
    (gestureState: PanResponderGestureState, direction: "left" | "right"): boolean => {
      if (gestureState.dx > swipeThreshold) return direction === "right";
      if (gestureState.dx < -swipeThreshold) return direction === "left";
      return false;
    },
    [swipeThreshold]
  );

  /**
   * Handle gesture start
   */
  const handleGestureStart = useCallback(() => {
    gestureInProgress.current = true;
    onGestureStart?.();
  }, [onGestureStart]);

  /**
   * Handle gesture end - execute swipe action
   */
  const handleGestureEnd = useCallback(
    async (_evt: GestureResponderEvent, gestureState: PanResponderGestureState) => {
      gestureInProgress.current = false;
      onGestureEnd?.();

      if (!currentPetId) return;

      // Swipe right - like
      if (shouldTriggerSwipe(gestureState, "right")) {
        await onSwipeRight?.(currentPetId, currentIndex);
      }
      // Swipe left - pass
      else if (shouldTriggerSwipe(gestureState, "left")) {
        await onSwipeLeft?.(currentPetId, currentIndex);
      }
      // Else: cancel gesture (handled by animation hook)
    },
    [currentPetId, currentIndex, shouldTriggerSwipe, onSwipeRight, onSwipeLeft, onGestureEnd]
  );

  // Create pan responder with gesture handlers
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: handleGestureStart,
      onPanResponderRelease: handleGestureEnd,
      onPanResponderTerminate: () => {
        gestureInProgress.current = false;
      },
    })
  ).current;

  return {
    panHandlers: panResponder.panHandlers,
    shouldTriggerSwipe,
  };
};


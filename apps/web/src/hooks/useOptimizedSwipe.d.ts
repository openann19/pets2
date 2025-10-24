/**
 * 🃏 OPTIMIZED SWIPE HOOK
 * Enhanced swipe mechanics based on Tinder clone optimizations
 * Provides smooth, responsive swipe interactions with haptic feedback
 */
import { PanInfo } from 'framer-motion';
interface SwipeConfig {
    threshold?: number;
    superThreshold?: number;
    velocityThreshold?: number;
    hapticEnabled?: boolean;
    soundEnabled?: boolean;
}
interface SwipeCallbacks {
    onSwipe: (direction: 'like' | 'pass' | 'superlike') => void;
    onSwipeStart?: () => void;
    onSwipeEnd?: () => void;
    onThresholdReach?: (direction: 'like' | 'pass' | 'superlike') => void;
}
export declare const useOptimizedSwipe: (config: SwipeConfig | undefined, callbacks: SwipeCallbacks) => {
    x: import("framer-motion").MotionValue<number>;
    y: import("framer-motion").MotionValue<number>;
    rotate: import("framer-motion").MotionValue<number>;
    opacity: import("framer-motion").MotionValue<number>;
    likeOverlayOpacity: import("framer-motion").MotionValue<number>;
    passOverlayOpacity: import("framer-motion").MotionValue<number>;
    superLikeOverlayOpacity: import("framer-motion").MotionValue<number>;
    isExiting: boolean;
    isDragging: boolean;
    handleDragStart: () => void;
    handleDragEnd: (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => void;
    handleButtonClick: (action: "like" | "pass" | "superlike") => void;
    checkThreshold: (offset: number, yOffset: number) => void;
    reset: () => void;
    triggerHaptic: (type?: "light" | "medium" | "heavy") => void;
    triggerSound: (type: "swipe" | "threshold" | "complete") => void;
};
export {};
//# sourceMappingURL=useOptimizedSwipe.d.ts.map
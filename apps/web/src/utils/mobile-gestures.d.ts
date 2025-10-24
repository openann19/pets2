/**
 * Mobile Gestures Utilities
 * Advanced gesture recognition and handling for mobile devices
 */
export interface GestureConfig {
    threshold: number;
    velocity: number;
    direction: 'horizontal' | 'vertical' | 'both';
    preventDefault: boolean;
    stopPropagation: boolean;
}
export interface SwipeGesture {
    direction: 'left' | 'right' | 'up' | 'down';
    distance: number;
    velocity: number;
    duration: number;
}
export interface PinchGesture {
    scale: number;
    center: {
        x: number;
        y: number;
    };
    distance: number;
}
export interface PanGesture {
    deltaX: number;
    deltaY: number;
    velocity: {
        x: number;
        y: number;
    };
    direction: 'left' | 'right' | 'up' | 'down' | 'none';
}
export interface PullToRefreshState {
    isPulling: boolean;
    pullDistance: number;
    isRefreshing: boolean;
    canRefresh: boolean;
}
/**
 * Hook for swipe gesture detection
 */
export declare function useSwipeGesture(onSwipe: (gesture: SwipeGesture) => void, config?: Partial<GestureConfig>): {
    attachGestures: (element: HTMLElement) => void;
    detachGestures: () => void;
};
/**
 * Hook for pinch gesture detection
 */
export declare function usePinchGesture(onPinch: (gesture: PinchGesture) => void, config?: {
    threshold?: number;
    preventDefault?: boolean;
}): {
    attachGestures: (element: HTMLElement) => void;
    detachGestures: () => void;
};
/**
 * Hook for pan gesture detection
 */
export declare function usePanGesture(onPan: (gesture: PanGesture) => void, config?: {
    threshold?: number;
    preventDefault?: boolean;
}): {
    attachGestures: (element: HTMLElement) => void;
    detachGestures: () => void;
};
/**
 * Hook for pull-to-refresh functionality
 */
export declare function usePullToRefresh(onRefresh: () => Promise<void>, config?: {
    threshold?: number;
    resistance?: number;
    maxPullDistance?: number;
    preventDefault?: boolean;
}): {
    state: PullToRefreshState;
    attachGestures: (element: HTMLElement) => void;
    detachGestures: () => void;
    setState: import("react").Dispatch<import("react").SetStateAction<PullToRefreshState>>;
};
/**
 * Hook for long press gesture detection
 */
export declare function useLongPress(onLongPress: () => void, config?: {
    delay?: number;
    preventDefault?: boolean;
}): {
    attachGestures: (element: HTMLElement) => void;
    detachGestures: () => void;
};
/**
 * Utility functions for gesture handling
 */
export declare const gestureUtils: {
    preventDefault: (e: TouchEvent) => void;
    stopPropagation: (e: TouchEvent) => void;
    isTouchDevice: () => boolean;
    getTouchPoint: (e: TouchEvent, index?: number) => {
        x: number;
        y: number;
    } | null;
    getDistance: (point1: {
        x: number;
        y: number;
    }, point2: {
        x: number;
        y: number;
    }) => number;
    getAngle: (point1: {
        x: number;
        y: number;
    }, point2: {
        x: number;
        y: number;
    }) => number;
    hapticFeedback: (type?: "light" | "medium" | "heavy") => void;
};
//# sourceMappingURL=mobile-gestures.d.ts.map
export interface GestureEvent {
    type: 'tap' | 'doubleTap' | 'longPress' | 'swipe' | 'pinch' | 'rotate' | 'pan';
    position: {
        x: number;
        y: number;
    };
    delta?: {
        x: number;
        y: number;
    };
    scale?: number;
    rotation?: number;
    velocity?: {
        x: number;
        y: number;
    };
    touches?: Touch[];
    timestamp: number;
}
export interface GestureConfig {
    tapThreshold?: number;
    doubleTapDelay?: number;
    longPressDelay?: number;
    swipeThreshold?: number;
    pinchThreshold?: number;
    rotateThreshold?: number;
    panThreshold?: number;
    preventDefault?: boolean;
    stopPropagation?: boolean;
}
export interface GestureCallbacks {
    onTap?: (event: GestureEvent) => void;
    onDoubleTap?: (event: GestureEvent) => void;
    onLongPress?: (event: GestureEvent) => void;
    onSwipe?: (event: GestureEvent) => void;
    onPinch?: (event: GestureEvent) => void;
    onRotate?: (event: GestureEvent) => void;
    onPan?: (event: GestureEvent) => void;
    onGestureStart?: (event: GestureEvent) => void;
    onGestureEnd?: (event: GestureEvent) => void;
}
interface GestureState {
    startPosition: {
        x: number;
        y: number;
    };
    currentPosition: {
        x: number;
        y: number;
    };
    startTime: number;
    lastTapTime: number;
    tapCount: number;
    isLongPress: boolean;
    isPinching: boolean;
    isRotating: boolean;
    isPanning: boolean;
    initialDistance: number;
    initialAngle: number;
    lastScale: number;
    lastRotation: number;
    touches: Touch[];
}
export declare const useAdvancedGestures: (config?: GestureConfig, callbacks?: GestureCallbacks) => {
    onTouchStart: (event: TouchEvent) => void;
    onTouchMove: (event: TouchEvent) => void;
    onTouchEnd: (event: TouchEvent) => void;
    gestureState: GestureState;
};
export declare const useSwipeGestures: (callbacks: {
    onSwipeLeft?: () => void;
    onSwipeRight?: () => void;
    onSwipeUp?: () => void;
    onSwipeDown?: () => void;
    onSwipe?: (direction: "left" | "right" | "up" | "down", velocity: {
        x: number;
        y: number;
    }) => void;
}) => {
    onTouchStart: (event: TouchEvent) => void;
    onTouchMove: (event: TouchEvent) => void;
    onTouchEnd: (event: TouchEvent) => void;
    gestureState: GestureState;
};
export declare const usePinchGestures: (callbacks: {
    onPinchIn?: (scale: number) => void;
    onPinchOut?: (scale: number) => void;
    onPinch?: (scale: number, delta: number) => void;
}) => {
    onTouchStart: (event: TouchEvent) => void;
    onTouchMove: (event: TouchEvent) => void;
    onTouchEnd: (event: TouchEvent) => void;
    gestureState: GestureState;
};
export declare const useRotateGestures: (callbacks: {
    onRotate?: (rotation: number, delta: number) => void;
}) => {
    onTouchStart: (event: TouchEvent) => void;
    onTouchMove: (event: TouchEvent) => void;
    onTouchEnd: (event: TouchEvent) => void;
    gestureState: GestureState;
};
export declare const usePanGestures: (callbacks: {
    onPan?: (delta: {
        x: number;
        y: number;
    }, velocity: {
        x: number;
        y: number;
    }) => void;
    onPanStart?: () => void;
    onPanEnd?: () => void;
}) => {
    onTouchStart: (event: TouchEvent) => void;
    onTouchMove: (event: TouchEvent) => void;
    onTouchEnd: (event: TouchEvent) => void;
    gestureState: GestureState;
};
export { useAdvancedGestures as default, useSwipeGestures, usePinchGestures, useRotateGestures, usePanGestures, };
//# sourceMappingURL=useAdvancedGestures.d.ts.map
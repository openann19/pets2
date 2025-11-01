export declare function useGesture(onSwipeLeft?: () => void, onSwipeRight?: () => void, onSwipeUp?: () => void, onSwipeDown?: () => void): {
    handleTouchStart: (e: TouchEvent) => void;
    handleTouchMove: (e: TouchEvent) => void;
    handleTouchEnd: (_e: TouchEvent) => void;
};

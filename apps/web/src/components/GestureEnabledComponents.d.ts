export declare function PullToRefresh({ children, onRefresh, threshold, resistance, maxPullDistance, className, }: {
    children: any;
    onRefresh: any;
    threshold?: number | undefined;
    resistance?: number | undefined;
    maxPullDistance?: number | undefined;
    className?: string | undefined;
}): JSX.Element;
export declare function SwipeableCard({ children, onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown, threshold, velocity, className, hapticFeedback, }: {
    children: any;
    onSwipeLeft: any;
    onSwipeRight: any;
    onSwipeUp: any;
    onSwipeDown: any;
    threshold?: number | undefined;
    velocity?: number | undefined;
    className?: string | undefined;
    hapticFeedback?: boolean | undefined;
}): JSX.Element;
export declare function LongPress({ children, onLongPress, delay, className, hapticFeedback, }: {
    children: any;
    onLongPress: any;
    delay?: number | undefined;
    className?: string | undefined;
    hapticFeedback?: boolean | undefined;
}): JSX.Element;
export declare function PinchToZoom({ children, minScale, maxScale, className, hapticFeedback, }: {
    children: any;
    minScale?: number | undefined;
    maxScale?: number | undefined;
    className?: string | undefined;
    hapticFeedback?: boolean | undefined;
}): JSX.Element;
export declare function PanGesture({ children, onPan, threshold, className, hapticFeedback, }: {
    children: any;
    onPan: any;
    threshold?: number | undefined;
    className?: string | undefined;
    hapticFeedback?: boolean | undefined;
}): JSX.Element;
/**
 * Gesture Demo Component
 */
export declare function GestureDemo(): JSX.Element;
//# sourceMappingURL=GestureEnabledComponents.d.ts.map
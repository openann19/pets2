/**
 * 📜 SCROLL DIRECTION HOOK
 * Detects scroll direction and provides smooth header hide/show functionality
 */
interface UseScrollDirectionOptions {
    threshold?: number;
    debounceMs?: number;
    initialDirection?: 'up' | 'down';
}
interface ScrollDirectionState {
    direction: 'up' | 'down';
    isScrolling: boolean;
    scrollY: number;
    isAtTop: boolean;
    isAtBottom: boolean;
    shouldHideHeader: boolean;
}
export declare function useScrollDirection(options?: UseScrollDirectionOptions): ScrollDirectionState;
export declare function useHeaderVisibility(options?: UseScrollDirectionOptions): {
    isVisible: boolean;
    isTransitioning: boolean;
    headerClasses: string;
    direction: "up" | "down";
    isScrolling: boolean;
    scrollY: number;
    isAtTop: boolean;
    isAtBottom: boolean;
    shouldHideHeader: boolean;
};
export declare function useBackToTop(options?: {
    threshold?: number;
}): {
    showButton: boolean;
    scrollToTop: () => void;
    scrollY: number;
};
export default useScrollDirection;
//# sourceMappingURL=useScrollDirection.d.ts.map
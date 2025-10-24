/**
 * 📜 SCROLL DIRECTION HOOK
 * Detects scroll direction and provides smooth header hide/show functionality
 */
import { useState, useEffect, useRef } from 'react';
export function useScrollDirection(options = {}) {
    const { threshold = 10, debounceMs = 100, initialDirection = 'up' } = options;
    const [state, setState] = useState({
        direction: initialDirection,
        isScrolling: false,
        scrollY: 0,
        isAtTop: true,
        isAtBottom: false,
        shouldHideHeader: false
    });
    const lastScrollY = useRef(0);
    const ticking = useRef(false);
    const scrollTimeout = useRef();
    useEffect(() => {
        const handleScroll = () => {
            if (!ticking.current) {
                requestAnimationFrame(() => {
                    const currentScrollY = window.scrollY;
                    const scrollDirection = currentScrollY > lastScrollY.current ? 'down' : 'up';
                    const scrollDifference = Math.abs(currentScrollY - lastScrollY.current);
                    // Only update if scroll difference is significant
                    if (scrollDifference > threshold) {
                        const isAtTop = currentScrollY <= threshold;
                        const isAtBottom = currentScrollY >= document.documentElement.scrollHeight - window.innerHeight - threshold;
                        // Determine if header should be hidden
                        const shouldHideHeader = scrollDirection === 'down' &&
                            currentScrollY > 100 &&
                            !isAtTop &&
                            !isAtBottom;
                        setState({
                            direction: scrollDirection,
                            isScrolling: true,
                            scrollY: currentScrollY,
                            isAtTop,
                            isAtBottom,
                            shouldHideHeader
                        });
                        lastScrollY.current = currentScrollY;
                    }
                    ticking.current = false;
                });
                ticking.current = true;
            }
            // Clear existing timeout
            if (scrollTimeout.current) {
                clearTimeout(scrollTimeout.current);
            }
            // Set new timeout to detect when scrolling stops
            scrollTimeout.current = setTimeout(() => {
                setState(prev => ({
                    ...prev,
                    isScrolling: false
                }));
            }, debounceMs);
        };
        // Add scroll listener
        window.addEventListener('scroll', handleScroll, { passive: true });
        // Initial state
        lastScrollY.current = window.scrollY;
        setState(prev => ({
            ...prev,
            scrollY: window.scrollY,
            isAtTop: window.scrollY <= threshold
        }));
        return () => {
            window.removeEventListener('scroll', handleScroll);
            if (scrollTimeout.current) {
                clearTimeout(scrollTimeout.current);
            }
        };
    }, [threshold, debounceMs]);
    return state;
}
// Hook for header visibility with smooth transitions
export function useHeaderVisibility(options = {}) {
    const scrollState = useScrollDirection(options);
    const [isVisible, setIsVisible] = useState(true);
    const [isTransitioning, setIsTransitioning] = useState(false);
    useEffect(() => {
        if (scrollState.shouldHideHeader && isVisible) {
            setIsTransitioning(true);
            setTimeout(() => {
                setIsVisible(false);
                setIsTransitioning(false);
            }, 150);
        }
        else if (!scrollState.shouldHideHeader && !isVisible) {
            setIsTransitioning(true);
            setTimeout(() => {
                setIsVisible(true);
                setIsTransitioning(false);
            }, 150);
        }
    }, [scrollState.shouldHideHeader, isVisible]);
    return {
        ...scrollState,
        isVisible,
        isTransitioning,
        headerClasses: `
      transition-transform duration-300 ease-out
      ${isVisible ? 'translate-y-0' : '-translate-y-full'}
      ${isTransitioning ? 'transition-transform' : ''}
    `.trim()
    };
}
// Hook for back-to-top button visibility
export function useBackToTop(options = {}) {
    const { threshold = 400 } = options;
    const scrollState = useScrollDirection();
    const [showButton, setShowButton] = useState(false);
    useEffect(() => {
        setShowButton(scrollState.scrollY > threshold);
    }, [scrollState.scrollY, threshold]);
    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };
    return {
        showButton,
        scrollToTop,
        scrollY: scrollState.scrollY
    };
}
export default useScrollDirection;
//# sourceMappingURL=useScrollDirection.js.map
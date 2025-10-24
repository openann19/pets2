/**
 * useClickOutside Hook
 *
 * Universal hook for implementing click-outside-to-close pattern
 */
import { useEffect, RefObject } from 'react';
export function useClickOutside(ref, handler, enabled = true) {
    useEffect(() => {
        if (!enabled)
            return;
        const listener = (event) => {
            const element = ref.current;
            // Do nothing if clicking ref's element or descendent elements
            if (!element || element.contains(event.target)) {
                return;
            }
            handler(event);
        };
        document.addEventListener('mousedown', listener);
        document.addEventListener('touchstart', listener);
        return () => {
            document.removeEventListener('mousedown', listener);
            document.removeEventListener('touchstart', listener);
        };
    }, [ref, handler, enabled]);
}
//# sourceMappingURL=useClickOutside.js.map
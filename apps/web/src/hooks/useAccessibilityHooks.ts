import { useReducedMotion as useFramerReducedMotion } from 'framer-motion';
/**
 * Enhanced version of Framer Motion's useReducedMotion hook
 * that always returns a boolean value (never null)
 */
export function useReducedMotion() {
    const prefersReducedMotion = useFramerReducedMotion();
    // Convert null to false to ensure consistent boolean return value
    return prefersReducedMotion === true;
}
//# sourceMappingURL=useAccessibilityHooks.js.map
/*
 * FRAMER MOTION MOCK - Testing Stub
 * Simplified mock for framer-motion in test environment
 * Provides basic component stubs for animation testing
 */
import React from 'react';
export const motion = new Proxy({}, {
    get: (_target, prop) => {
        return React.forwardRef((props, ref) => React.createElement(prop, { ...props, ref }));
    },
});
// Mock AnimatePresence
export const AnimatePresence = ({ children }) => {
    return React.createElement(React.Fragment, null, children);
};
// Mock useAnimation
export const useAnimation = () => ({
    start: jest.fn(),
    stop: jest.fn(),
    set: jest.fn(),
});
// Mock useMotionValue
export const useMotionValue = (initial) => ({
    get: () => initial,
    set: jest.fn(),
    onChange: jest.fn(),
});
// Mock useTransform
export const useTransform = () => ({ get: () => 0, set: jest.fn() });
// Mock useSpring (generic)
export const useSpring = (value) => value;
// Mock useScroll
export const useScroll = () => ({
    scrollX: { get: () => 0 },
    scrollY: { get: () => 0 },
    scrollXProgress: { get: () => 0 },
    scrollYProgress: { get: () => 0 },
});
// Mock useReducedMotion
export const useReducedMotion = () => false;
// Mock useDragControls
export const useDragControls = () => ({
    start: jest.fn(),
});
export default motion;
//# sourceMappingURL=framer-motion.js.map
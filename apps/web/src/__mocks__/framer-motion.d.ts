import React from 'react';
export interface MotionComponentProps {
    children?: React.ReactNode;
    className?: string;
    style?: React.CSSProperties;
    initial?: Record<string, unknown>;
    animate?: Record<string, unknown>;
    exit?: Record<string, unknown>;
    transition?: Record<string, unknown>;
    whileHover?: Record<string, unknown>;
    whileTap?: Record<string, unknown>;
    drag?: boolean;
    dragConstraints?: unknown;
    dragElastic?: number;
    onDragEnd?: (event: unknown, info: unknown) => void;
    onClick?: () => void;
    [key: string]: unknown;
}
type ProxyTarget = Record<string, React.ComponentType<MotionComponentProps>>;
export declare const motion: ProxyTarget;
export declare const AnimatePresence: React.FC<{
    children: React.ReactNode;
}>;
export declare const useAnimation: () => {
    start: jest.Mock<any, any, any>;
    stop: jest.Mock<any, any, any>;
    set: jest.Mock<any, any, any>;
};
export declare const useMotionValue: (initial: number) => {
    get: () => number;
    set: jest.Mock<any, any, any>;
    onChange: jest.Mock<any, any, any>;
};
export declare const useTransform: () => {
    get: () => number;
    set: jest.Mock<any, any, any>;
};
export declare const useSpring: <T>(value: T) => T;
export declare const useScroll: () => {
    scrollX: {
        get: () => number;
    };
    scrollY: {
        get: () => number;
    };
    scrollXProgress: {
        get: () => number;
    };
    scrollYProgress: {
        get: () => number;
    };
};
export declare const useReducedMotion: () => boolean;
export declare const useDragControls: () => {
    start: jest.Mock<any, any, any>;
};
export default motion;
//# sourceMappingURL=framer-motion.d.ts.map
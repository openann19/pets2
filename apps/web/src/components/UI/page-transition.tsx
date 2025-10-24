import React from 'react';
import { AnimatePresence } from 'framer-motion';
import { MotionDiv } from './motion-helper';
import { usePathname } from 'next/navigation';
const pageVariants = {
    initial: {
        opacity: 0,
        y: 20,
    },
    enter: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.3,
            ease: [0.22, 1, 0.36, 1],
        },
    },
    exit: {
        opacity: 0,
        y: -20,
        transition: {
            duration: 0.2,
            ease: [0.22, 1, 0.36, 1],
        },
    },
};
export function PageTransition({ children }) {
    const pathname = usePathname();
    return (<AnimatePresence mode="wait" initial={false}>
      <MotionDiv key={pathname} variants={pageVariants} initial="initial" animate="enter" exit="exit">
        <div>{children}</div>
      </MotionDiv>
    </AnimatePresence>);
}
// Slide transition variant
export function SlideTransition({ children }) {
    const pathname = usePathname();
    const slideVariants = {
        initial: { x: 100, opacity: 0 },
        enter: {
            x: 0,
            opacity: 1,
            transition: {
                type: 'spring',
                stiffness: 300,
                damping: 30,
            },
        },
        exit: {
            x: -100,
            opacity: 0,
            transition: { duration: 0.2 },
        },
    };
    return (<AnimatePresence mode="wait">
      <MotionDiv key={pathname} variants={slideVariants} initial="initial" animate="enter" exit="exit">
        <div>{children}</div>
      </MotionDiv>
    </AnimatePresence>);
}
// Scale transition variant
export function ScaleTransition({ children }) {
    const pathname = usePathname();
    const scaleVariants = {
        initial: { scale: 0.95, opacity: 0 },
        enter: {
            scale: 1,
            opacity: 1,
            transition: {
                type: 'spring',
                stiffness: 400,
                damping: 25,
            },
        },
        exit: {
            scale: 1.05,
            opacity: 0,
            transition: { duration: 0.15 },
        },
    };
    return (<AnimatePresence mode="wait">
      <MotionDiv key={pathname} variants={scaleVariants} initial="initial" animate="enter" exit="exit">
        <div>{children}</div>
      </MotionDiv>
    </AnimatePresence>);
}
//# sourceMappingURL=page-transition.jsx.map
//# sourceMappingURL=page-transition.jsx.map
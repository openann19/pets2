/**
 * Transition presets with spring physics
 */
export declare const transitionPresets: {
    fade: {
        initial: {
            opacity: number;
        };
        animate: {
            opacity: number;
        };
        exit: {
            opacity: number;
        };
        transition: {
            type: string;
            stiffness: number;
            damping: number;
        };
    };
    scale: {
        initial: {
            opacity: number;
            scale: number;
        };
        animate: {
            opacity: number;
            scale: number;
        };
        exit: {
            opacity: number;
            scale: number;
        };
        transition: {
            type: string;
            stiffness: number;
            damping: number;
        };
    };
    slideRight: {
        initial: {
            opacity: number;
            x: number;
        };
        animate: {
            opacity: number;
            x: number;
        };
        exit: {
            opacity: number;
            x: number;
        };
        transition: {
            type: string;
            stiffness: number;
            damping: number;
        };
    };
    slideLeft: {
        initial: {
            opacity: number;
            x: number;
        };
        animate: {
            opacity: number;
            x: number;
        };
        exit: {
            opacity: number;
            x: number;
        };
        transition: {
            type: string;
            stiffness: number;
            damping: number;
        };
    };
    slideUp: {
        initial: {
            opacity: number;
            y: number;
        };
        animate: {
            opacity: number;
            y: number;
        };
        exit: {
            opacity: number;
            y: number;
        };
        transition: {
            type: string;
            stiffness: number;
            damping: number;
        };
    };
    zoom: {
        initial: {
            opacity: number;
            scale: number;
        };
        animate: {
            opacity: number;
            scale: number;
        };
        exit: {
            opacity: number;
            scale: number;
        };
        transition: {
            type: string;
            stiffness: number;
            damping: number;
        };
    };
    blurFade: {
        initial: {
            opacity: number;
            filter: string;
        };
        animate: {
            opacity: number;
            filter: string;
        };
        exit: {
            opacity: number;
            filter: string;
        };
        transition: {
            type: string;
            stiffness: number;
            damping: number;
        };
    };
};
export declare function PageTransition({ children, preset, className, variants, disabled, }: {
    children: any;
    preset?: string | undefined;
    className?: string | undefined;
    variants: any;
    disabled?: boolean | undefined;
}): JSX.Element;
export declare function StaggerContainer({ children, staggerDelay, className }: {
    children: any;
    staggerDelay?: number | undefined;
    className?: string | undefined;
}): JSX.Element;
export declare function StaggerItem({ children, className }: {
    children: any;
    className?: string | undefined;
}): JSX.Element;
export declare function SharedLayout({ children, layoutId, className }: {
    children: any;
    layoutId: any;
    className?: string | undefined;
}): JSX.Element;
export declare function Presence({ children, show, preset, className }: {
    children: any;
    show: any;
    preset?: string | undefined;
    className?: string | undefined;
}): JSX.Element;
export declare function ScrollReveal({ children, className, threshold }: {
    children: any;
    className?: string | undefined;
    threshold?: number | undefined;
}): JSX.Element;
export declare function HoverCard({ children, className, scale }: {
    children: any;
    className?: string | undefined;
    scale?: number | undefined;
}): JSX.Element;
export declare function Bounce({ children, className, delay }: {
    children: any;
    className?: string | undefined;
    delay?: number | undefined;
}): JSX.Element;
export declare function Pulse({ children, className }: {
    children: any;
    className?: string | undefined;
}): JSX.Element;
/**
 * Route-specific transition variants
 */
export declare const routeTransitions: {
    '/dashboard': {
        initial: {
            opacity: number;
        };
        animate: {
            opacity: number;
        };
        exit: {
            opacity: number;
        };
        transition: {
            type: string;
            stiffness: number;
            damping: number;
        };
    };
    '/swipe': {
        initial: {
            opacity: number;
            scale: number;
        };
        animate: {
            opacity: number;
            scale: number;
        };
        exit: {
            opacity: number;
            scale: number;
        };
        transition: {
            type: string;
            stiffness: number;
            damping: number;
        };
    };
    '/matches': {
        initial: {
            opacity: number;
            x: number;
        };
        animate: {
            opacity: number;
            x: number;
        };
        exit: {
            opacity: number;
            x: number;
        };
        transition: {
            type: string;
            stiffness: number;
            damping: number;
        };
    };
    '/chat': {
        initial: {
            opacity: number;
            x: number;
        };
        animate: {
            opacity: number;
            x: number;
        };
        exit: {
            opacity: number;
            x: number;
        };
        transition: {
            type: string;
            stiffness: number;
            damping: number;
        };
    };
    '/profile': {
        initial: {
            opacity: number;
            scale: number;
        };
        animate: {
            opacity: number;
            scale: number;
        };
        exit: {
            opacity: number;
            scale: number;
        };
        transition: {
            type: string;
            stiffness: number;
            damping: number;
        };
    };
    '/settings': {
        initial: {
            opacity: number;
            y: number;
        };
        animate: {
            opacity: number;
            y: number;
        };
        exit: {
            opacity: number;
            y: number;
        };
        transition: {
            type: string;
            stiffness: number;
            damping: number;
        };
    };
    '/premium': {
        initial: {
            opacity: number;
            filter: string;
        };
        animate: {
            opacity: number;
            filter: string;
        };
        exit: {
            opacity: number;
            filter: string;
        };
        transition: {
            type: string;
            stiffness: number;
            damping: number;
        };
    };
};
/**
 * Get transition preset based on route
 */
export declare function getRouteTransition(pathname: any): string;
//# sourceMappingURL=PageTransition.d.ts.map
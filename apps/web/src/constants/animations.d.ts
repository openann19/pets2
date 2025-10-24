/**
 * Animation Constants for PawfectMatch Premium
 * Centralized animation configuration for consistent motion design
 */
export declare const SPRING_CONFIG: {
    gentle: {
        type: "spring";
        stiffness: number;
        damping: number;
        mass: number;
    };
    standard: {
        type: "spring";
        stiffness: number;
        damping: number;
        mass: number;
    };
    bouncy: {
        type: "spring";
        stiffness: number;
        damping: number;
        mass: number;
    };
    quick: {
        type: "spring";
        stiffness: number;
        damping: number;
        mass: number;
    };
    instant: {
        type: "spring";
        stiffness: number;
        damping: number;
        mass: number;
    };
    slow: {
        type: "spring";
        stiffness: number;
        damping: number;
        mass: number;
    };
    snappy: {
        type: "spring";
        stiffness: number;
        damping: number;
        mass: number;
    };
    smooth: {
        type: "spring";
        stiffness: number;
        damping: number;
        mass: number;
    };
    default: {
        type: "spring";
        stiffness: number;
        damping: number;
        mass: number;
    };
};
export declare const EASING: {
    easeIn: readonly [0.4, 0, 1, 1];
    easeOut: readonly [0, 0, 0.2, 1];
    easeInOut: readonly [0.4, 0, 0.2, 1];
    premium: readonly [0.25, 0.46, 0.45, 0.94];
    smooth: readonly [0.4, 0, 0.2, 1];
    bounce: readonly [0.68, -0.55, 0.265, 1.55];
    material: readonly [0.4, 0, 0.2, 1];
    materialDecelerate: readonly [0, 0, 0.2, 1];
    materialAccelerate: readonly [0.4, 0, 1, 1];
};
export declare const DURATION: {
    instant: number;
    fast: number;
    quick: number;
    normal: number;
    standard: number;
    slow: number;
    slower: number;
    pageTransition: number;
    modalTransition: number;
    loading: number;
    pulse: number;
};
export declare const STAGGER: {
    small: number;
    normal: number;
    large: number;
    cards: number;
    list: number;
    grid: number;
};
export declare const VARIANTS: {
    fade: {
        hidden: {
            opacity: number;
        };
        visible: {
            opacity: number;
        };
        exit: {
            opacity: number;
        };
    };
    slideUp: {
        hidden: {
            opacity: number;
            y: number;
        };
        visible: {
            opacity: number;
            y: number;
        };
        exit: {
            opacity: number;
            y: number;
        };
    };
    slideDown: {
        hidden: {
            opacity: number;
            y: number;
        };
        visible: {
            opacity: number;
            y: number;
        };
        exit: {
            opacity: number;
            y: number;
        };
    };
    slideLeft: {
        hidden: {
            opacity: number;
            x: number;
        };
        visible: {
            opacity: number;
            x: number;
        };
        exit: {
            opacity: number;
            x: number;
        };
    };
    slideRight: {
        hidden: {
            opacity: number;
            x: number;
        };
        visible: {
            opacity: number;
            x: number;
        };
        exit: {
            opacity: number;
            x: number;
        };
    };
    scale: {
        hidden: {
            opacity: number;
            scale: number;
        };
        visible: {
            opacity: number;
            scale: number;
        };
        exit: {
            opacity: number;
            scale: number;
        };
    };
    scaleUp: {
        hidden: {
            opacity: number;
            scale: number;
        };
        visible: {
            opacity: number;
            scale: number;
        };
        exit: {
            opacity: number;
            scale: number;
        };
    };
    rotate: {
        hidden: {
            opacity: number;
            rotate: number;
        };
        visible: {
            opacity: number;
            rotate: number;
        };
        exit: {
            opacity: number;
            rotate: number;
        };
    };
    slideScale: {
        hidden: {
            opacity: number;
            y: number;
            scale: number;
        };
        visible: {
            opacity: number;
            y: number;
            scale: number;
        };
        exit: {
            opacity: number;
            y: number;
            scale: number;
        };
    };
    premiumEntrance: {
        hidden: {
            opacity: number;
            y: number;
            scale: number;
            filter: string;
        };
        visible: {
            opacity: number;
            y: number;
            scale: number;
            filter: string;
            transition: {
                type: string;
                stiffness: number;
                damping: number;
                mass: number;
            };
        };
        exit: {
            opacity: number;
            y: number;
            scale: number;
            filter: string;
        };
    };
    hover: {
        scale: number;
        transition: {
            type: "spring";
            stiffness: number;
            damping: number;
            mass: number;
        };
    };
    tap: {
        scale: number;
        transition: {
            type: "spring";
            stiffness: number;
            damping: number;
            mass: number;
        };
    };
    pulse: {
        scale: number[];
        transition: {
            duration: number;
            repeat: number;
            ease: readonly [0.4, 0, 0.2, 1];
        };
    };
    pawPrint: {
        hidden: {
            opacity: number;
            scale: number;
            rotate: number;
        };
        visible: {
            opacity: number;
            scale: number;
            rotate: number;
            transition: {
                type: string;
                stiffness: number;
                damping: number;
                mass: number;
            };
        };
        exit: {
            opacity: number;
            scale: number;
            rotate: number;
        };
    };
};
export declare const CONTAINER_VARIANTS: {
    hidden: {
        opacity: number;
    };
    visible: {
        opacity: number;
        transition: {
            staggerChildren: number;
            delayChildren: number;
        };
    };
    exit: {
        opacity: number;
        transition: {
            staggerChildren: number;
            staggerDirection: number;
        };
    };
};
export declare const BUTTON_VARIANTS: {
    magnetic: {
        rest: {
            scale: number;
        };
        hover: {
            scale: number;
            transition: {
                type: "spring";
                stiffness: number;
                damping: number;
                mass: number;
            };
        };
        tap: {
            scale: number;
            transition: {
                type: "spring";
                stiffness: number;
                damping: number;
                mass: number;
            };
        };
    };
    glow: {
        rest: {
            boxShadow: string;
        };
        hover: {
            boxShadow: string;
            transition: {
                duration: number;
                ease: readonly [0, 0, 0.2, 1];
            };
        };
    };
    ripple: {
        rest: {
            scale: number;
        };
        tap: {
            scale: number;
            transition: {
                duration: number;
                ease: readonly [0, 0, 0.2, 1];
            };
        };
    };
};
export declare const CARD_VARIANTS: {
    tilt: {
        rest: {
            rotateX: number;
            rotateY: number;
            scale: number;
        };
        hover: {
            rotateX: number;
            rotateY: number;
            scale: number;
            transition: {
                type: "spring";
                stiffness: number;
                damping: number;
                mass: number;
            };
        };
    };
    float: {
        rest: {
            y: number;
        };
        hover: {
            y: number;
            transition: {
                duration: number;
                ease: readonly [0, 0, 0.2, 1];
            };
        };
    };
    glassEntrance: {
        hidden: {
            opacity: number;
            backdropFilter: string;
            scale: number;
        };
        visible: {
            opacity: number;
            backdropFilter: string;
            scale: number;
            transition: {
                duration: number;
                ease: readonly [0.25, 0.46, 0.45, 0.94];
            };
        };
    };
};
export declare const PAGE_VARIANTS: {
    initial: {
        opacity: number;
        y: number;
        filter: string;
    };
    in: {
        opacity: number;
        y: number;
        filter: string;
        transition: {
            duration: number;
            ease: readonly [0.25, 0.46, 0.45, 0.94];
        };
    };
    out: {
        opacity: number;
        y: number;
        filter: string;
        transition: {
            duration: number;
            ease: readonly [0.4, 0, 1, 1];
        };
    };
};
export declare const MODAL_VARIANTS: {
    overlay: {
        hidden: {
            opacity: number;
        };
        visible: {
            opacity: number;
            transition: {
                duration: number;
                ease: readonly [0, 0, 0.2, 1];
            };
        };
        exit: {
            opacity: number;
            transition: {
                duration: number;
                ease: readonly [0.4, 0, 1, 1];
            };
        };
    };
    content: {
        hidden: {
            opacity: number;
            scale: number;
            y: number;
        };
        visible: {
            opacity: number;
            scale: number;
            y: number;
            transition: {
                duration: number;
                ease: readonly [0.25, 0.46, 0.45, 0.94];
            };
        };
        exit: {
            opacity: number;
            scale: number;
            y: number;
            transition: {
                duration: number;
                ease: readonly [0.4, 0, 1, 1];
            };
        };
    };
};
export declare const TOAST_VARIANTS: {
    hidden: {
        opacity: number;
        x: number;
        scale: number;
    };
    visible: {
        opacity: number;
        x: number;
        scale: number;
        transition: {
            type: string;
            stiffness: number;
            damping: number;
            mass: number;
        };
    };
    exit: {
        opacity: number;
        x: number;
        scale: number;
        transition: {
            duration: number;
            ease: readonly [0.4, 0, 1, 1];
        };
    };
};
export declare const SPINNER_VARIANTS: {
    rotate: {
        rotate: number;
        transition: {
            duration: number;
            repeat: number;
            ease: string;
        };
    };
    bounce: {
        y: number[];
        transition: {
            duration: number;
            repeat: number;
            ease: readonly [0.4, 0, 0.2, 1];
        };
    };
    pulse: {
        scale: number[];
        opacity: number[];
        transition: {
            duration: number;
            repeat: number;
            ease: readonly [0.4, 0, 0.2, 1];
        };
    };
};
export declare const SPRING_CONFIGS: {
    gentle: {
        type: "spring";
        stiffness: number;
        damping: number;
        mass: number;
    };
    standard: {
        type: "spring";
        stiffness: number;
        damping: number;
        mass: number;
    };
    bouncy: {
        type: "spring";
        stiffness: number;
        damping: number;
        mass: number;
    };
    quick: {
        type: "spring";
        stiffness: number;
        damping: number;
        mass: number;
    };
    instant: {
        type: "spring";
        stiffness: number;
        damping: number;
        mass: number;
    };
    slow: {
        type: "spring";
        stiffness: number;
        damping: number;
        mass: number;
    };
    snappy: {
        type: "spring";
        stiffness: number;
        damping: number;
        mass: number;
    };
    smooth: {
        type: "spring";
        stiffness: number;
        damping: number;
        mass: number;
    };
    default: {
        type: "spring";
        stiffness: number;
        damping: number;
        mass: number;
    };
};
export declare const PREMIUM_VARIANTS: {
    card: {
        hidden: {
            opacity: number;
            backdropFilter: string;
            scale: number;
        };
        visible: {
            opacity: number;
            backdropFilter: string;
            scale: number;
            transition: {
                duration: number;
                ease: readonly [0.25, 0.46, 0.45, 0.94];
            };
        };
    };
    button: {
        rest: {
            scale: number;
        };
        hover: {
            scale: number;
            transition: {
                type: "spring";
                stiffness: number;
                damping: number;
                mass: number;
            };
        };
        tap: {
            scale: number;
            transition: {
                type: "spring";
                stiffness: number;
                damping: number;
                mass: number;
            };
        };
    };
    entrance: {
        hidden: {
            opacity: number;
            y: number;
            scale: number;
            filter: string;
        };
        visible: {
            opacity: number;
            y: number;
            scale: number;
            filter: string;
            transition: {
                type: string;
                stiffness: number;
                damping: number;
                mass: number;
            };
        };
        exit: {
            opacity: number;
            y: number;
            scale: number;
            filter: string;
        };
    };
    slide: {
        hidden: {
            opacity: number;
            y: number;
        };
        visible: {
            opacity: number;
            y: number;
        };
        exit: {
            opacity: number;
            y: number;
        };
    };
    scale: {
        hidden: {
            opacity: number;
            scale: number;
        };
        visible: {
            opacity: number;
            scale: number;
        };
        exit: {
            opacity: number;
            scale: number;
        };
    };
    fade: {
        hidden: {
            opacity: number;
        };
        visible: {
            opacity: number;
        };
        exit: {
            opacity: number;
        };
    };
    fadeInUp: {
        hidden: {
            opacity: number;
            y: number;
        };
        visible: {
            opacity: number;
            y: number;
        };
        exit: {
            opacity: number;
            y: number;
        };
    };
    fadeInDown: {
        hidden: {
            opacity: number;
            y: number;
        };
        visible: {
            opacity: number;
            y: number;
        };
        exit: {
            opacity: number;
            y: number;
        };
    };
    fadeInLeft: {
        hidden: {
            opacity: number;
            x: number;
        };
        visible: {
            opacity: number;
            x: number;
        };
        exit: {
            opacity: number;
            x: number;
        };
    };
    fadeInRight: {
        hidden: {
            opacity: number;
            x: number;
        };
        visible: {
            opacity: number;
            x: number;
        };
        exit: {
            opacity: number;
            x: number;
        };
    };
    slideScale: {
        hidden: {
            opacity: number;
            y: number;
            scale: number;
        };
        visible: {
            opacity: number;
            y: number;
            scale: number;
        };
        exit: {
            opacity: number;
            y: number;
            scale: number;
        };
    };
    rotate: {
        hidden: {
            opacity: number;
            rotate: number;
        };
        visible: {
            opacity: number;
            rotate: number;
        };
        exit: {
            opacity: number;
            rotate: number;
        };
    };
    pulse: {
        scale: number[];
        transition: {
            duration: number;
            repeat: number;
            ease: readonly [0.4, 0, 0.2, 1];
        };
    };
    hover: {
        scale: number;
        transition: {
            type: "spring";
            stiffness: number;
            damping: number;
            mass: number;
        };
    };
    tap: {
        scale: number;
        transition: {
            type: "spring";
            stiffness: number;
            damping: number;
            mass: number;
        };
    };
    pawPrint: {
        hidden: {
            opacity: number;
            scale: number;
            rotate: number;
        };
        visible: {
            opacity: number;
            scale: number;
            rotate: number;
            transition: {
                type: string;
                stiffness: number;
                damping: number;
                mass: number;
            };
        };
        exit: {
            opacity: number;
            scale: number;
            rotate: number;
        };
    };
};
export declare const STAGGER_CONFIG: {
    small: number;
    normal: number;
    large: number;
    cards: number;
    list: number;
    grid: number;
};
export declare const BOUNCY_CONFIG: {
    type: "spring";
    stiffness: number;
    damping: number;
    mass: number;
};
export declare const MICRO_CONFIG: {
    duration: number;
    ease: readonly [0, 0, 0.2, 1];
};
export declare const GESTURE_CONFIGS: {
    swipe: {
        dragConstraints: {
            left: number;
            right: number;
            top: number;
            bottom: number;
        };
        dragElastic: number;
        dragTransition: {
            min: number;
            max: number;
            bounceStiffness: number;
            bounceDamping: number;
        };
        swipeThreshold: number;
        velocityThreshold: number;
        rotationFactor: number;
        scaleFactor: number;
    };
    tap: {
        tapThreshold: number;
        tapTime: number;
    };
    pan: {
        panThreshold: number;
        panTime: number;
    };
};
export declare const ANIMATION_CONFIG: {
    readonly spring: {
        gentle: {
            type: "spring";
            stiffness: number;
            damping: number;
            mass: number;
        };
        standard: {
            type: "spring";
            stiffness: number;
            damping: number;
            mass: number;
        };
        bouncy: {
            type: "spring";
            stiffness: number;
            damping: number;
            mass: number;
        };
        quick: {
            type: "spring";
            stiffness: number;
            damping: number;
            mass: number;
        };
        instant: {
            type: "spring";
            stiffness: number;
            damping: number;
            mass: number;
        };
        slow: {
            type: "spring";
            stiffness: number;
            damping: number;
            mass: number;
        };
        snappy: {
            type: "spring";
            stiffness: number;
            damping: number;
            mass: number;
        };
        smooth: {
            type: "spring";
            stiffness: number;
            damping: number;
            mass: number;
        };
        default: {
            type: "spring";
            stiffness: number;
            damping: number;
            mass: number;
        };
    };
    readonly easing: {
        easeIn: readonly [0.4, 0, 1, 1];
        easeOut: readonly [0, 0, 0.2, 1];
        easeInOut: readonly [0.4, 0, 0.2, 1];
        premium: readonly [0.25, 0.46, 0.45, 0.94];
        smooth: readonly [0.4, 0, 0.2, 1];
        bounce: readonly [0.68, -0.55, 0.265, 1.55];
        material: readonly [0.4, 0, 0.2, 1];
        materialDecelerate: readonly [0, 0, 0.2, 1];
        materialAccelerate: readonly [0.4, 0, 1, 1];
    };
    readonly duration: {
        instant: number;
        fast: number;
        quick: number;
        normal: number;
        standard: number;
        slow: number;
        slower: number;
        pageTransition: number;
        modalTransition: number;
        loading: number;
        pulse: number;
    };
    readonly stagger: {
        small: number;
        normal: number;
        large: number;
        cards: number;
        list: number;
        grid: number;
    };
    readonly variants: {
        fade: {
            hidden: {
                opacity: number;
            };
            visible: {
                opacity: number;
            };
            exit: {
                opacity: number;
            };
        };
        slideUp: {
            hidden: {
                opacity: number;
                y: number;
            };
            visible: {
                opacity: number;
                y: number;
            };
            exit: {
                opacity: number;
                y: number;
            };
        };
        slideDown: {
            hidden: {
                opacity: number;
                y: number;
            };
            visible: {
                opacity: number;
                y: number;
            };
            exit: {
                opacity: number;
                y: number;
            };
        };
        slideLeft: {
            hidden: {
                opacity: number;
                x: number;
            };
            visible: {
                opacity: number;
                x: number;
            };
            exit: {
                opacity: number;
                x: number;
            };
        };
        slideRight: {
            hidden: {
                opacity: number;
                x: number;
            };
            visible: {
                opacity: number;
                x: number;
            };
            exit: {
                opacity: number;
                x: number;
            };
        };
        scale: {
            hidden: {
                opacity: number;
                scale: number;
            };
            visible: {
                opacity: number;
                scale: number;
            };
            exit: {
                opacity: number;
                scale: number;
            };
        };
        scaleUp: {
            hidden: {
                opacity: number;
                scale: number;
            };
            visible: {
                opacity: number;
                scale: number;
            };
            exit: {
                opacity: number;
                scale: number;
            };
        };
        rotate: {
            hidden: {
                opacity: number;
                rotate: number;
            };
            visible: {
                opacity: number;
                rotate: number;
            };
            exit: {
                opacity: number;
                rotate: number;
            };
        };
        slideScale: {
            hidden: {
                opacity: number;
                y: number;
                scale: number;
            };
            visible: {
                opacity: number;
                y: number;
                scale: number;
            };
            exit: {
                opacity: number;
                y: number;
                scale: number;
            };
        };
        premiumEntrance: {
            hidden: {
                opacity: number;
                y: number;
                scale: number;
                filter: string;
            };
            visible: {
                opacity: number;
                y: number;
                scale: number;
                filter: string;
                transition: {
                    type: string;
                    stiffness: number;
                    damping: number;
                    mass: number;
                };
            };
            exit: {
                opacity: number;
                y: number;
                scale: number;
                filter: string;
            };
        };
        hover: {
            scale: number;
            transition: {
                type: "spring";
                stiffness: number;
                damping: number;
                mass: number;
            };
        };
        tap: {
            scale: number;
            transition: {
                type: "spring";
                stiffness: number;
                damping: number;
                mass: number;
            };
        };
        pulse: {
            scale: number[];
            transition: {
                duration: number;
                repeat: number;
                ease: readonly [0.4, 0, 0.2, 1];
            };
        };
        pawPrint: {
            hidden: {
                opacity: number;
                scale: number;
                rotate: number;
            };
            visible: {
                opacity: number;
                scale: number;
                rotate: number;
                transition: {
                    type: string;
                    stiffness: number;
                    damping: number;
                    mass: number;
                };
            };
            exit: {
                opacity: number;
                scale: number;
                rotate: number;
            };
        };
    };
    readonly container: {
        hidden: {
            opacity: number;
        };
        visible: {
            opacity: number;
            transition: {
                staggerChildren: number;
                delayChildren: number;
            };
        };
        exit: {
            opacity: number;
            transition: {
                staggerChildren: number;
                staggerDirection: number;
            };
        };
    };
    readonly button: {
        magnetic: {
            rest: {
                scale: number;
            };
            hover: {
                scale: number;
                transition: {
                    type: "spring";
                    stiffness: number;
                    damping: number;
                    mass: number;
                };
            };
            tap: {
                scale: number;
                transition: {
                    type: "spring";
                    stiffness: number;
                    damping: number;
                    mass: number;
                };
            };
        };
        glow: {
            rest: {
                boxShadow: string;
            };
            hover: {
                boxShadow: string;
                transition: {
                    duration: number;
                    ease: readonly [0, 0, 0.2, 1];
                };
            };
        };
        ripple: {
            rest: {
                scale: number;
            };
            tap: {
                scale: number;
                transition: {
                    duration: number;
                    ease: readonly [0, 0, 0.2, 1];
                };
            };
        };
    };
    readonly card: {
        tilt: {
            rest: {
                rotateX: number;
                rotateY: number;
                scale: number;
            };
            hover: {
                rotateX: number;
                rotateY: number;
                scale: number;
                transition: {
                    type: "spring";
                    stiffness: number;
                    damping: number;
                    mass: number;
                };
            };
        };
        float: {
            rest: {
                y: number;
            };
            hover: {
                y: number;
                transition: {
                    duration: number;
                    ease: readonly [0, 0, 0.2, 1];
                };
            };
        };
        glassEntrance: {
            hidden: {
                opacity: number;
                backdropFilter: string;
                scale: number;
            };
            visible: {
                opacity: number;
                backdropFilter: string;
                scale: number;
                transition: {
                    duration: number;
                    ease: readonly [0.25, 0.46, 0.45, 0.94];
                };
            };
        };
    };
    readonly page: {
        initial: {
            opacity: number;
            y: number;
            filter: string;
        };
        in: {
            opacity: number;
            y: number;
            filter: string;
            transition: {
                duration: number;
                ease: readonly [0.25, 0.46, 0.45, 0.94];
            };
        };
        out: {
            opacity: number;
            y: number;
            filter: string;
            transition: {
                duration: number;
                ease: readonly [0.4, 0, 1, 1];
            };
        };
    };
    readonly modal: {
        overlay: {
            hidden: {
                opacity: number;
            };
            visible: {
                opacity: number;
                transition: {
                    duration: number;
                    ease: readonly [0, 0, 0.2, 1];
                };
            };
            exit: {
                opacity: number;
                transition: {
                    duration: number;
                    ease: readonly [0.4, 0, 1, 1];
                };
            };
        };
        content: {
            hidden: {
                opacity: number;
                scale: number;
                y: number;
            };
            visible: {
                opacity: number;
                scale: number;
                y: number;
                transition: {
                    duration: number;
                    ease: readonly [0.25, 0.46, 0.45, 0.94];
                };
            };
            exit: {
                opacity: number;
                scale: number;
                y: number;
                transition: {
                    duration: number;
                    ease: readonly [0.4, 0, 1, 1];
                };
            };
        };
    };
    readonly toast: {
        hidden: {
            opacity: number;
            x: number;
            scale: number;
        };
        visible: {
            opacity: number;
            x: number;
            scale: number;
            transition: {
                type: string;
                stiffness: number;
                damping: number;
                mass: number;
            };
        };
        exit: {
            opacity: number;
            x: number;
            scale: number;
            transition: {
                duration: number;
                ease: readonly [0.4, 0, 1, 1];
            };
        };
    };
    readonly spinner: {
        rotate: {
            rotate: number;
            transition: {
                duration: number;
                repeat: number;
                ease: string;
            };
        };
        bounce: {
            y: number[];
            transition: {
                duration: number;
                repeat: number;
                ease: readonly [0.4, 0, 0.2, 1];
            };
        };
        pulse: {
            scale: number[];
            opacity: number[];
            transition: {
                duration: number;
                repeat: number;
                ease: readonly [0.4, 0, 0.2, 1];
            };
        };
    };
    readonly gesture: {
        swipe: {
            dragConstraints: {
                left: number;
                right: number;
                top: number;
                bottom: number;
            };
            dragElastic: number;
            dragTransition: {
                min: number;
                max: number;
                bounceStiffness: number;
                bounceDamping: number;
            };
            swipeThreshold: number;
            velocityThreshold: number;
            rotationFactor: number;
            scaleFactor: number;
        };
        tap: {
            tapThreshold: number;
            tapTime: number;
        };
        pan: {
            panThreshold: number;
            panTime: number;
        };
    };
};
export default ANIMATION_CONFIG;
//# sourceMappingURL=animations.d.ts.map
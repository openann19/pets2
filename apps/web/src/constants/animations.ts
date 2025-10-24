/**
 * Animation Constants for PawfectMatch Premium
 * Centralized animation configuration for consistent motion design
 */
// Spring physics configuration for smooth, natural animations
export const SPRING_CONFIG = {
    // Gentle spring for subtle interactions
    gentle: {
        type: 'spring',
        stiffness: 200,
        damping: 20,
        mass: 1,
    },
    // Standard spring for most UI interactions
    standard: {
        type: 'spring',
        stiffness: 300,
        damping: 25,
        mass: 1,
    },
    // Bouncy spring for playful interactions
    bouncy: {
        type: 'spring',
        stiffness: 400,
        damping: 15,
        mass: 1,
    },
    // Quick spring for rapid feedback
    quick: {
        type: 'spring',
        stiffness: 500,
        damping: 30,
        mass: 0.8,
    },
    // Instant spring for immediate feedback
    instant: {
        type: 'spring',
        stiffness: 1000,
        damping: 50,
        mass: 0.5,
    },
    // Slow spring for dramatic reveals
    slow: {
        type: 'spring',
        stiffness: 100,
        damping: 20,
        mass: 1.2,
    },
    // Snappy spring for quick interactions
    snappy: {
        type: 'spring',
        stiffness: 600,
        damping: 35,
        mass: 0.7,
    },
    // Smooth spring for fluid animations
    smooth: {
        type: 'spring',
        stiffness: 250,
        damping: 30,
        mass: 1.1,
    },
    // Default spring configuration
    default: {
        type: 'spring',
        stiffness: 300,
        damping: 25,
        mass: 1,
    },
};
// Easing functions for different animation types
export const EASING = {
    // Standard easing curves
    easeIn: [0.4, 0, 1, 1],
    easeOut: [0, 0, 0.2, 1],
    easeInOut: [0.4, 0, 0.2, 1],
    // Custom easing for premium feel
    premium: [0.25, 0.46, 0.45, 0.94],
    smooth: [0.4, 0, 0.2, 1],
    bounce: [0.68, -0.55, 0.265, 1.55],
    // Material Design easing
    material: [0.4, 0, 0.2, 1],
    materialDecelerate: [0, 0, 0.2, 1],
    materialAccelerate: [0.4, 0, 1, 1],
};
// Animation durations (in seconds)
export const DURATION = {
    // Quick interactions
    instant: 0,
    fast: 0.15,
    quick: 0.2,
    // Standard interactions
    normal: 0.3,
    standard: 0.4,
    // Slow interactions
    slow: 0.6,
    slower: 0.8,
    // Page transitions
    pageTransition: 0.5,
    modalTransition: 0.4,
    // Loading states
    loading: 1.2,
    pulse: 2,
};
// Stagger delays for sequential animations
export const STAGGER = {
    // Small stagger for subtle sequences
    small: 0.05,
    // Standard stagger for most sequences
    normal: 0.1,
    // Large stagger for dramatic reveals
    large: 0.2,
    // Custom stagger values
    cards: 0.08,
    list: 0.12,
    grid: 0.15,
};
// Animation variants for common patterns
export const VARIANTS = {
    // Fade animations
    fade: {
        hidden: { opacity: 0 },
        visible: { opacity: 1 },
        exit: { opacity: 0 },
    },
    // Slide animations
    slideUp: {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -20 },
    },
    slideDown: {
        hidden: { opacity: 0, y: -20 },
        visible: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: 20 },
    },
    slideLeft: {
        hidden: { opacity: 0, x: 20 },
        visible: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: -20 },
    },
    slideRight: {
        hidden: { opacity: 0, x: -20 },
        visible: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: 20 },
    },
    // Scale animations
    scale: {
        hidden: { opacity: 0, scale: 0.8 },
        visible: { opacity: 1, scale: 1 },
        exit: { opacity: 0, scale: 0.8 },
    },
    scaleUp: {
        hidden: { opacity: 0, scale: 0.9 },
        visible: { opacity: 1, scale: 1 },
        exit: { opacity: 0, scale: 1.1 },
    },
    // Rotate animations
    rotate: {
        hidden: { opacity: 0, rotate: -10 },
        visible: { opacity: 1, rotate: 0 },
        exit: { opacity: 0, rotate: 10 },
    },
    // Combined animations
    slideScale: {
        hidden: { opacity: 0, y: 20, scale: 0.9 },
        visible: { opacity: 1, y: 0, scale: 1 },
        exit: { opacity: 0, y: -20, scale: 0.9 },
    },
    // Premium entrance animations
    premiumEntrance: {
        hidden: {
            opacity: 0,
            y: 30,
            scale: 0.95,
            filter: 'blur(4px)',
        },
        visible: {
            opacity: 1,
            y: 0,
            scale: 1,
            filter: 'blur(0px)',
            transition: {
                type: 'spring',
                stiffness: 300,
                damping: 25,
                mass: 1,
            },
        },
        exit: {
            opacity: 0,
            y: -30,
            scale: 0.95,
            filter: 'blur(4px)',
        },
    },
    // Hover animations
    hover: {
        scale: 1.02,
        transition: SPRING_CONFIG.quick,
    },
    tap: {
        scale: 0.98,
        transition: SPRING_CONFIG.instant,
    },
    // Loading animations
    pulse: {
        scale: [1, 1.05, 1],
        transition: {
            duration: DURATION.pulse,
            repeat: Infinity,
            ease: EASING.easeInOut,
        },
    },
    // Paw print specific animations
    pawPrint: {
        hidden: {
            opacity: 0,
            scale: 0,
            rotate: -180,
        },
        visible: {
            opacity: 1,
            scale: 1,
            rotate: 0,
            transition: {
                type: 'spring',
                stiffness: 400,
                damping: 20,
                mass: 0.8,
            },
        },
        exit: {
            opacity: 0,
            scale: 0,
            rotate: 180,
        },
    },
};
// Container variants for staggered animations
export const CONTAINER_VARIANTS = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: STAGGER.normal,
            delayChildren: 0.1,
        },
    },
    exit: {
        opacity: 0,
        transition: {
            staggerChildren: STAGGER.small,
            staggerDirection: -1,
        },
    },
};
// Button animation variants
export const BUTTON_VARIANTS = {
    // Magnetic effect
    magnetic: {
        rest: { scale: 1 },
        hover: {
            scale: 1.05,
            transition: SPRING_CONFIG.bouncy,
        },
        tap: {
            scale: 0.95,
            transition: SPRING_CONFIG.quick,
        },
    },
    // Glow effect
    glow: {
        rest: {
            boxShadow: '0 0 0 0 rgba(236, 72, 153, 0)',
        },
        hover: {
            boxShadow: '0 0 20px 5px rgba(236, 72, 153, 0.3)',
            transition: {
                duration: DURATION.quick,
                ease: EASING.easeOut,
            },
        },
    },
    // Ripple effect
    ripple: {
        rest: { scale: 1 },
        tap: {
            scale: 0.9,
            transition: {
                duration: DURATION.fast,
                ease: EASING.easeOut,
            },
        },
    },
};
// Card animation variants
export const CARD_VARIANTS = {
    // 3D tilt effect
    tilt: {
        rest: {
            rotateX: 0,
            rotateY: 0,
            scale: 1,
        },
        hover: {
            rotateX: 5,
            rotateY: 5,
            scale: 1.02,
            transition: SPRING_CONFIG.gentle,
        },
    },
    // Floating effect
    float: {
        rest: { y: 0 },
        hover: {
            y: -8,
            transition: {
                duration: DURATION.normal,
                ease: EASING.easeOut,
            },
        },
    },
    // Glass morphism entrance
    glassEntrance: {
        hidden: {
            opacity: 0,
            backdropFilter: 'blur(0px)',
            scale: 0.95,
        },
        visible: {
            opacity: 1,
            backdropFilter: 'blur(10px)',
            scale: 1,
            transition: {
                duration: DURATION.standard,
                ease: EASING.premium,
            },
        },
    },
};
// Page transition variants
export const PAGE_VARIANTS = {
    initial: {
        opacity: 0,
        y: 20,
        filter: 'blur(4px)',
    },
    in: {
        opacity: 1,
        y: 0,
        filter: 'blur(0px)',
        transition: {
            duration: DURATION.pageTransition,
            ease: EASING.premium,
        },
    },
    out: {
        opacity: 0,
        y: -20,
        filter: 'blur(4px)',
        transition: {
            duration: DURATION.quick,
            ease: EASING.easeIn,
        },
    },
};
// Modal animation variants
export const MODAL_VARIANTS = {
    overlay: {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                duration: DURATION.quick,
                ease: EASING.easeOut,
            },
        },
        exit: {
            opacity: 0,
            transition: {
                duration: DURATION.fast,
                ease: EASING.easeIn,
            },
        },
    },
    content: {
        hidden: {
            opacity: 0,
            scale: 0.9,
            y: 20,
        },
        visible: {
            opacity: 1,
            scale: 1,
            y: 0,
            transition: {
                duration: DURATION.modalTransition,
                ease: EASING.premium,
            },
        },
        exit: {
            opacity: 0,
            scale: 0.9,
            y: 20,
            transition: {
                duration: DURATION.fast,
                ease: EASING.easeIn,
            },
        },
    },
};
// Toast notification variants
export const TOAST_VARIANTS = {
    hidden: {
        opacity: 0,
        x: 300,
        scale: 0.8,
    },
    visible: {
        opacity: 1,
        x: 0,
        scale: 1,
        transition: {
            type: 'spring',
            stiffness: 400,
            damping: 25,
            mass: 0.8,
        },
    },
    exit: {
        opacity: 0,
        x: 300,
        scale: 0.8,
        transition: {
            duration: DURATION.fast,
            ease: EASING.easeIn,
        },
    },
};
// Loading spinner variants
export const SPINNER_VARIANTS = {
    rotate: {
        rotate: 360,
        transition: {
            duration: 1,
            repeat: Infinity,
            ease: 'linear',
        },
    },
    bounce: {
        y: [0, -10, 0],
        transition: {
            duration: 0.6,
            repeat: Infinity,
            ease: EASING.easeInOut,
        },
    },
    pulse: {
        scale: [1, 1.2, 1],
        opacity: [1, 0.7, 1],
        transition: {
            duration: 1.5,
            repeat: Infinity,
            ease: EASING.easeInOut,
        },
    },
};
// Legacy exports for backward compatibility
export const SPRING_CONFIGS = SPRING_CONFIG;
export const PREMIUM_VARIANTS = {
    card: CARD_VARIANTS.glassEntrance,
    button: BUTTON_VARIANTS.magnetic,
    entrance: VARIANTS.premiumEntrance,
    slide: VARIANTS.slideUp,
    scale: VARIANTS.scale,
    fade: VARIANTS.fade,
    fadeInUp: VARIANTS.slideUp,
    fadeInDown: VARIANTS.slideDown,
    fadeInLeft: VARIANTS.slideLeft,
    fadeInRight: VARIANTS.slideRight,
    slideScale: VARIANTS.slideScale,
    rotate: VARIANTS.rotate,
    pulse: VARIANTS.pulse,
    hover: VARIANTS.hover,
    tap: VARIANTS.tap,
    pawPrint: VARIANTS.pawPrint,
};
export const STAGGER_CONFIG = STAGGER;
export const BOUNCY_CONFIG = SPRING_CONFIG.bouncy;
export const MICRO_CONFIG = {
    duration: DURATION.fast,
    ease: EASING.easeOut,
};
// Gesture configuration for swipe interactions
export const GESTURE_CONFIGS = {
    swipe: {
        dragConstraints: { left: -200, right: 200, top: -200, bottom: 200 },
        dragElastic: 0.2,
        dragTransition: {
            min: 0,
            max: 100,
            bounceStiffness: 600,
            bounceDamping: 10
        },
        swipeThreshold: 50,
        velocityThreshold: 500,
        rotationFactor: 0.1,
        scaleFactor: 0.95
    },
    tap: {
        tapThreshold: 3,
        tapTime: 300
    },
    pan: {
        panThreshold: 10,
        panTime: 100
    }
};
// Export default configuration
export const ANIMATION_CONFIG = {
    spring: SPRING_CONFIG,
    easing: EASING,
    duration: DURATION,
    stagger: STAGGER,
    variants: VARIANTS,
    container: CONTAINER_VARIANTS,
    button: BUTTON_VARIANTS,
    card: CARD_VARIANTS,
    page: PAGE_VARIANTS,
    modal: MODAL_VARIANTS,
    toast: TOAST_VARIANTS,
    spinner: SPINNER_VARIANTS,
    gesture: GESTURE_CONFIGS,
};
export default ANIMATION_CONFIG;
//# sourceMappingURL=animations.js.map
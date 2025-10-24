/**
 * Premium Animation Constants
 * Following Phase 2 Rule: "stiffness: 300-400, damping: 25-30"
 * Rules specify: stiffness: 300, damping: 30 for spring physics
 */
export declare const SPRING_CONFIG: {
    type: "spring";
    stiffness: number;
    damping: number;
};
export declare const STAGGER_CONFIG: {
    staggerChildren: number;
};
export declare const _LAYOUT_TRANSITION: {
    type: "spring";
    stiffness: number;
    damping: number;
};
export declare const _INTERACTION_VARIANTS: {
    hover: {
        scale: number;
        rotateY: number;
        transition: {
            type: "spring";
            stiffness: number;
            damping: number;
        };
    };
    tap: {
        scale: number;
        rotateY: number;
        transition: {
            type: "spring";
            stiffness: number;
            damping: number;
        };
    };
};
export declare const _LIST_VARIANTS: {
    visible: {
        opacity: number;
        transition: {
            staggerChildren: number;
            type: "spring";
            stiffness: number;
            damping: number;
        };
    };
    hidden: {
        opacity: number;
    };
};
export declare const _PAGE_VARIANTS: {
    initial: {
        opacity: number;
        scale: number;
    };
    animate: {
        opacity: number;
        scale: number;
        transition: {
            type: "spring";
            stiffness: number;
            damping: number;
        };
    };
    exit: {
        opacity: number;
        scale: number;
        transition: {
            type: "spring";
            stiffness: number;
            damping: number;
        };
    };
};
//# sourceMappingURL=animations.d.ts.map
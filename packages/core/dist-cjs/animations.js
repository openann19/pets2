"use strict";
/**
 * Premium Animation Constants
 * Following Phase 2 Rule: "stiffness: 300-400, damping: 25-30"
 * Rules specify: stiffness: 300, damping: 30 for spring physics
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports._PAGE_VARIANTS = exports._LIST_VARIANTS = exports._INTERACTION_VARIANTS = exports._LAYOUT_TRANSITION = exports.STAGGER_CONFIG = exports.SPRING_CONFIG = void 0;
// Standard spring configuration per Rule II.5
exports.SPRING_CONFIG = {
    type: "spring",
    stiffness: 300, // Rules-compliant value (was 400)
    damping: 30 // Rules-compliant value (was 17)
};
// Staggered animation configuration per Rule II.5
exports.STAGGER_CONFIG = {
    staggerChildren: 0.07 // Rules specify 0.07 (was incorrectly 0.1)
};
// Shared layout animation configuration
exports._LAYOUT_TRANSITION = {
    ...exports.SPRING_CONFIG,
    // Additional layout-specific configs can go here
};
// Hover/tap animation variants
exports._INTERACTION_VARIANTS = {
    hover: {
        scale: 1.02,
        rotateY: 1,
        transition: exports.SPRING_CONFIG
    },
    tap: {
        scale: 0.98,
        rotateY: -1,
        transition: exports.SPRING_CONFIG
    }
};
// List entrance animation
exports._LIST_VARIANTS = {
    visible: {
        opacity: 1,
        transition: {
            ...exports.SPRING_CONFIG,
            ...exports.STAGGER_CONFIG
        }
    },
    hidden: {
        opacity: 0
    }
};
// Page transition variants
exports._PAGE_VARIANTS = {
    initial: { opacity: 0, scale: 0.95 },
    animate: {
        opacity: 1,
        scale: 1,
        transition: exports.SPRING_CONFIG
    },
    exit: {
        opacity: 0,
        scale: 1.05,
        transition: exports.SPRING_CONFIG
    }
};
//# sourceMappingURL=animations.js.map
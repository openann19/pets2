"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultAnimationConfig = exports.animationDefinitionSchema = exports.animationTypeSchema = exports.animationSpringConfigSchema = void 0;
const zod_1 = require("zod");
/**
 * Animation spring physics configuration.
 * Matches premium design specs: stiffness 300, damping 30.
 */
exports.animationSpringConfigSchema = zod_1.z.object({
    stiffness: zod_1.z.number().int().min(1).default(300),
    damping: zod_1.z.number().int().min(1).default(30),
    mass: zod_1.z.number().int().min(1).default(1),
    overshootClamping: zod_1.z.boolean().default(false),
    restDelta: zod_1.z.number().min(0).default(0.01),
    restSpeed: zod_1.z.number().min(0).default(0.01),
});
/**
 * Supported animation types for PawfectMatch.
 */
exports.animationTypeSchema = zod_1.z.enum([
    "fade",
    "scale",
    "slide",
    "flip",
    "bounce",
    "stagger",
    "presence",
]);
/**
 * Animation definition for UI components.
 */
exports.animationDefinitionSchema = zod_1.z.object({
    type: exports.animationTypeSchema,
    spring: exports.animationSpringConfigSchema,
    delay: zod_1.z.number().min(0).default(0),
    duration: zod_1.z.number().min(0).default(0.3), // Only used for non-spring fallback
    initial: zod_1.z.record(zod_1.z.any()).optional(),
    animate: zod_1.z.record(zod_1.z.any()).optional(),
    exit: zod_1.z.record(zod_1.z.any()).optional(),
    accessibilityLabel: zod_1.z.string().min(1),
});
/**
 * Default animation configuration
 */
exports.defaultAnimationConfig = {
    enabled: true,
    spring: {
        default: { stiffness: 300, damping: 30, mass: 1, overshootClamping: false, restDelta: 0.01, restSpeed: 0.01 },
        gentle: { stiffness: 200, damping: 25, mass: 1, overshootClamping: false, restDelta: 0.01, restSpeed: 0.01 },
        bouncy: { stiffness: 400, damping: 20, mass: 1, overshootClamping: false, restDelta: 0.01, restSpeed: 0.01 },
        stiff: { stiffness: 500, damping: 35, mass: 1, overshootClamping: true, restDelta: 0.01, restSpeed: 0.01 },
    },
    timing: {
        fast: { duration: 0.15 },
        normal: { duration: 0.3 },
        slow: { duration: 0.6 },
    },
    buttons: {
        enabled: true,
        preset: 'default',
        hapticFeedback: true,
    },
    cards: {
        enabled: true,
        preset: 'gentle',
        parallax: true,
    },
    lists: {
        enabled: true,
        stagger: true,
        staggerDelay: 0.05,
    },
    celebrations: {
        enabled: true,
        confetti: true,
        haptics: true,
    },
    mobile: {
        reducedMotion: false,
        performance: 'high',
    },
    web: {
        reducedMotion: false,
        respectSystemPreferences: true,
    },
};
//# sourceMappingURL=animations.js.map
import { z } from "zod";
/**
 * Animation spring physics configuration.
 * Matches premium design specs: stiffness 300, damping 30.
 */
export declare const animationSpringConfigSchema: z.ZodObject<{
    stiffness: z.ZodDefault<z.ZodNumber>;
    damping: z.ZodDefault<z.ZodNumber>;
    mass: z.ZodDefault<z.ZodNumber>;
    overshootClamping: z.ZodDefault<z.ZodBoolean>;
    restDelta: z.ZodDefault<z.ZodNumber>;
    restSpeed: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    stiffness: number;
    damping: number;
    mass: number;
    overshootClamping: boolean;
    restDelta: number;
    restSpeed: number;
}, {
    stiffness?: number | undefined;
    damping?: number | undefined;
    mass?: number | undefined;
    overshootClamping?: boolean | undefined;
    restDelta?: number | undefined;
    restSpeed?: number | undefined;
}>;
export type AnimationSpringConfig = z.infer<typeof animationSpringConfigSchema>;
/**
 * Supported animation types for PawfectMatch.
 */
export declare const animationTypeSchema: z.ZodEnum<["fade", "scale", "slide", "flip", "bounce", "stagger", "presence"]>;
export type AnimationType = z.infer<typeof animationTypeSchema>;
/**
 * Animation definition for UI components.
 */
export declare const animationDefinitionSchema: z.ZodObject<{
    type: z.ZodEnum<["fade", "scale", "slide", "flip", "bounce", "stagger", "presence"]>;
    spring: z.ZodObject<{
        stiffness: z.ZodDefault<z.ZodNumber>;
        damping: z.ZodDefault<z.ZodNumber>;
        mass: z.ZodDefault<z.ZodNumber>;
        overshootClamping: z.ZodDefault<z.ZodBoolean>;
        restDelta: z.ZodDefault<z.ZodNumber>;
        restSpeed: z.ZodDefault<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        stiffness: number;
        damping: number;
        mass: number;
        overshootClamping: boolean;
        restDelta: number;
        restSpeed: number;
    }, {
        stiffness?: number | undefined;
        damping?: number | undefined;
        mass?: number | undefined;
        overshootClamping?: boolean | undefined;
        restDelta?: number | undefined;
        restSpeed?: number | undefined;
    }>;
    delay: z.ZodDefault<z.ZodNumber>;
    duration: z.ZodDefault<z.ZodNumber>;
    initial: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    animate: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    exit: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    accessibilityLabel: z.ZodString;
}, "strip", z.ZodTypeAny, {
    spring: {
        stiffness: number;
        damping: number;
        mass: number;
        overshootClamping: boolean;
        restDelta: number;
        restSpeed: number;
    };
    duration: number;
    type: "fade" | "scale" | "slide" | "flip" | "bounce" | "stagger" | "presence";
    delay: number;
    accessibilityLabel: string;
    initial?: Record<string, any> | undefined;
    animate?: Record<string, any> | undefined;
    exit?: Record<string, any> | undefined;
}, {
    spring: {
        stiffness?: number | undefined;
        damping?: number | undefined;
        mass?: number | undefined;
        overshootClamping?: boolean | undefined;
        restDelta?: number | undefined;
        restSpeed?: number | undefined;
    };
    type: "fade" | "scale" | "slide" | "flip" | "bounce" | "stagger" | "presence";
    accessibilityLabel: string;
    duration?: number | undefined;
    delay?: number | undefined;
    initial?: Record<string, any> | undefined;
    animate?: Record<string, any> | undefined;
    exit?: Record<string, any> | undefined;
}>;
export type AnimationDefinition = z.infer<typeof animationDefinitionSchema>;
/**
 * Animation configuration interface with feature flags and component settings
 */
export interface AnimationConfig {
    enabled: boolean;
    spring: {
        default: AnimationSpringConfig;
        gentle: AnimationSpringConfig;
        bouncy: AnimationSpringConfig;
        stiff: AnimationSpringConfig;
    };
    timing: {
        fast: {
            duration: number;
        };
        normal: {
            duration: number;
        };
        slow: {
            duration: number;
        };
    };
    buttons: {
        enabled: boolean;
        preset: 'default' | 'gentle' | 'bouncy' | 'stiff';
        hapticFeedback: boolean;
    };
    cards: {
        enabled: boolean;
        preset: 'default' | 'gentle' | 'bouncy' | 'stiff';
        parallax: boolean;
    };
    lists: {
        enabled: boolean;
        stagger: boolean;
        staggerDelay: number;
    };
    celebrations: {
        enabled: boolean;
        confetti: boolean;
        haptics: boolean;
    };
    mobile: {
        reducedMotion: boolean;
        performance: 'low' | 'medium' | 'high';
    };
    web: {
        reducedMotion: boolean;
        respectSystemPreferences: boolean;
    };
}
/**
 * Default animation configuration
 */
export declare const defaultAnimationConfig: AnimationConfig;
//# sourceMappingURL=animations.d.ts.map
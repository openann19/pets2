/**
 * Accessibility utilities for the application
 */
export declare function hexToRgb(hex: string): {
    r: number;
    g: number;
    b: number;
} | null;
export declare function getLuminance(r: number, g: number, b: number): number;
export declare function isLightColor(hex: string): boolean;

"use strict";
/**
 * Accessibility utilities for the application
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.hexToRgb = hexToRgb;
exports.getLuminance = getLuminance;
exports.isLightColor = isLightColor;
// Convert hex color to RGB
function hexToRgb(hex) {
    // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
    const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthandRegex, (m) => {
        return m.charAt(1) + m.charAt(1) + m.charAt(2) + m.charAt(2) + m.charAt(3) + m.charAt(3);
    });
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result != null ? {
        r: parseInt(result[1] ?? "0", 16),
        g: parseInt(result[2] ?? "0", 16),
        b: parseInt(result[3] ?? "0", 16)
    } : null;
}
// Calculate relative luminance of a color
function getLuminance(r, g, b) {
    const a = [r, g, b].map((v) => {
        v /= 255;
        return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return (a[0] != null ? a[0] : 0) * 0.2126 + (a[1] != null ? a[1] : 0) * 0.7152 + (a[2] != null ? a[2] : 0) * 0.0722;
}
// Check if a hex color is light or dark
function isLightColor(hex) {
    const rgb = hexToRgb(hex);
    if (rgb == null)
        return false;
    const luminance = getLuminance(rgb.r, rgb.g, rgb.b);
    return luminance > 0.5;
}

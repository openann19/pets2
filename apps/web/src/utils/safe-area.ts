/**
 * iOS Safe Area Utilities
 * Handles safe area insets for devices with notches, dynamic islands, and home indicators
 */
import { useState, useEffect } from 'react';
/**
 * Get current safe area insets from CSS environment variables
 */
export function getSafeAreaInsets() {
    if (typeof window === 'undefined') {
        return { top: 0, right: 0, bottom: 0, left: 0 };
    }
    const root = document.documentElement;
    const computedStyle = getComputedStyle(root);
    return {
        top: parseInt(computedStyle.getPropertyValue('--sat-inset-top') || '0'),
        right: parseInt(computedStyle.getPropertyValue('--sat-inset-right') || '0'),
        bottom: parseInt(computedStyle.getPropertyValue('--sat-inset-bottom') || '0'),
        left: parseInt(computedStyle.getPropertyValue('--sat-inset-left') || '0'),
    };
}
/**
 * Check if device has safe area insets (notch, dynamic island, etc.)
 */
export function hasSafeAreaInsets() {
    const insets = getSafeAreaInsets();
    return insets.top > 0 || insets.bottom > 0 || insets.left > 0 || insets.right > 0;
}
/**
 * Check if device is iOS
 */
export function isIOS() {
    if (typeof window === 'undefined')
        return false;
    return /iPad|iPhone|iPod/.test(navigator.userAgent) ||
        (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
}
/**
 * Check if device is Android
 */
export function isAndroid() {
    if (typeof window === 'undefined')
        return false;
    return /Android/.test(navigator.userAgent);
}
/**
 * Check if device is mobile
 */
export function isMobile() {
    return isIOS() || isAndroid();
}
/**
 * Get device type for responsive design
 */
export function getDeviceType() {
    if (typeof window === 'undefined')
        return 'desktop';
    const width = window.innerWidth;
    if (width < 768)
        return 'mobile';
    if (width < 1024)
        return 'tablet';
    return 'desktop';
}
/**
 * CSS classes for safe area handling
 */
export const safeAreaClasses = {
    // Top safe area (notch, dynamic island)
    top: 'pt-[env(safe-area-inset-top)]',
    // Bottom safe area (home indicator)
    bottom: 'pb-[env(safe-area-inset-bottom)]',
    // Left safe area (landscape mode)
    left: 'pl-[env(safe-area-inset-left)]',
    // Right safe area (landscape mode)
    right: 'pr-[env(safe-area-inset-right)]',
    // All sides
    all: 'pt-[env(safe-area-inset-top)] pr-[env(safe-area-inset-right)] pb-[env(safe-area-inset-bottom)] pl-[env(safe-area-inset-left)]',
    // Horizontal only
    horizontal: 'px-[env(safe-area-inset-left)] px-[env(safe-area-inset-right)]',
    // Vertical only
    vertical: 'py-[env(safe-area-inset-top)] py-[env(safe-area-inset-bottom)]',
};
/**
 * React hook for safe area insets
 */
export function useSafeAreaInsets() {
    const [insets, setInsets] = useState({ top: 0, right: 0, bottom: 0, left: 0 });
    useEffect(() => {
        const updateInsets = () => {
            setInsets(getSafeAreaInsets());
        };
        updateInsets();
        window.addEventListener('resize', updateInsets);
        window.addEventListener('orientationchange', updateInsets);
        return () => {
            window.removeEventListener('resize', updateInsets);
            window.removeEventListener('orientationchange', updateInsets);
        };
    }, []);
    return insets;
}
/**
 * React hook for device detection
 */
export function useDeviceDetection() {
    const [deviceInfo, setDeviceInfo] = useState({
        isIOS: false,
        isAndroid: false,
        isMobile: false,
        deviceType: 'desktop',
        hasSafeArea: false,
    });
    useEffect(() => {
        const updateDeviceInfo = () => {
            setDeviceInfo({
                isIOS: isIOS(),
                isAndroid: isAndroid(),
                isMobile: isMobile(),
                deviceType: getDeviceType(),
                hasSafeArea: hasSafeAreaInsets(),
            });
        };
        updateDeviceInfo();
        window.addEventListener('resize', updateDeviceInfo);
        window.addEventListener('orientationchange', updateDeviceInfo);
        return () => {
            window.removeEventListener('resize', updateDeviceInfo);
            window.removeEventListener('orientationchange', updateDeviceInfo);
        };
    }, []);
    return deviceInfo;
}
//# sourceMappingURL=safe-area.js.map
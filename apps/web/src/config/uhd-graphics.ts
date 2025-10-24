/**
 * 🎨 UHD/4K GRAPHICS CONFIGURATION
 * Ultra High Definition graphics settings for maximum visual quality
 */
export const UHD_GRAPHICS_CONFIG = {
    // 4K UHD Resolution Settings
    resolutions: {
        // Standard UHD Resolutions
        UHD_4K: { width: 3840, height: 2160, dpi: 144 },
        UHD_8K: { width: 7680, height: 4320, dpi: 288 },
        // High DPI Mobile Resolutions
        MOBILE_UHD: { width: 1080, height: 2400, dpi: 420 },
        TABLET_UHD: { width: 2048, height: 2732, dpi: 264 },
        // Desktop High DPI
        DESKTOP_RETINA: { width: 2560, height: 1440, dpi: 110 },
        DESKTOP_4K: { width: 3840, height: 2160, dpi: 144 },
    },
    // Image Quality Settings
    imageQuality: {
        // Maximum quality settings
        jpeg: {
            quality: 100,
            progressive: true,
            mozjpeg: true,
        },
        png: {
            quality: 100,
            compressionLevel: 0, // No compression for maximum quality
            progressive: true,
        },
        webp: {
            quality: 100,
            lossless: true,
            method: 6, // Best compression method
        },
        avif: {
            quality: 100,
            lossless: true,
            speed: 0, // Best quality, slower encoding
        },
    },
    // Device Pixel Ratios for High DPI
    devicePixelRatios: {
        standard: 1,
        retina: 2,
        superRetina: 3,
        ultraRetina: 4,
    },
    // Viewport Breakpoints for UHD
    breakpoints: {
        mobile: { min: 0, max: 767, dpr: 3 },
        tablet: { min: 768, max: 1023, dpr: 2 },
        desktop: { min: 1024, max: 1919, dpr: 2 },
        uhd: { min: 1920, max: 3839, dpr: 2 },
        '4k': { min: 3840, max: 7679, dpr: 2 },
        '8k': { min: 7680, max: Infinity, dpr: 2 },
    },
    // Animation Quality Settings
    animation: {
        // 60fps for smooth UHD animations
        frameRate: 60,
        // High precision for UHD displays
        precision: 'highp',
        // GPU acceleration for UHD
        gpuAcceleration: true,
    },
    // Canvas and WebGL Settings
    canvas: {
        // High precision canvas for UHD
        alpha: true,
        antialias: true,
        depth: true,
        stencil: true,
        preserveDrawingBuffer: true,
        powerPreference: 'high-performance',
        desynchronized: true,
    },
    // Video Quality Settings
    video: {
        // 4K video support
        maxWidth: 3840,
        maxHeight: 2160,
        bitrate: '50M', // High bitrate for 4K
        framerate: 60,
        codec: 'h264',
    },
    // Font Rendering for UHD
    typography: {
        // High DPI font rendering
        fontSmoothing: 'antialiased',
        webkitFontSmoothing: 'antialiased',
        mozOsxFontSmoothing: 'grayscale',
        // Subpixel rendering for crisp text
        textRendering: 'optimizeLegibility',
    },
    // CSS Media Queries for UHD
    mediaQueries: {
        // High DPI displays
        retina: '@media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi)',
        superRetina: '@media (-webkit-min-device-pixel-ratio: 3), (min-resolution: 288dpi)',
        ultraRetina: '@media (-webkit-min-device-pixel-ratio: 4), (min-resolution: 384dpi)',
        // UHD Resolution queries
        uhd: '@media (min-width: 1920px) and (min-height: 1080px)',
        '4k': '@media (min-width: 3840px) and (min-height: 2160px)',
        '8k': '@media (min-width: 7680px) and (min-height: 4320px)',
    },
    // Performance Optimizations for UHD
    performance: {
        // Lazy loading for UHD images
        lazyLoading: true,
        // Progressive loading
        progressiveLoading: true,
        // Image preloading for critical UHD images
        preloadCritical: true,
        // WebP/AVIF format detection
        formatDetection: true,
    },
};
// Helper functions for UHD graphics
export const getOptimalImageSize = (containerWidth, containerHeight, dpr = 2) => {
    return {
        width: Math.ceil(containerWidth * dpr),
        height: Math.ceil(containerHeight * dpr),
    };
};
export const getOptimalImageFormat = () => {
    if (typeof window === 'undefined')
        return 'webp';
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (ctx?.getContextAttributes().willReadFrequently) {
        return 'avif';
    }
    return 'webp';
};
export const getDevicePixelRatio = () => {
    if (typeof window === 'undefined')
        return 1;
    return Math.min(window.devicePixelRatio || 1, 4); // Cap at 4x for performance
};
export const isUHDDisplay = () => {
    if (typeof window === 'undefined')
        return false;
    return window.screen.width >= 1920 && window.screen.height >= 1080;
};
export const is4KDisplay = () => {
    if (typeof window === 'undefined')
        return false;
    return window.screen.width >= 3840 && window.screen.height >= 2160;
};
// CSS classes for UHD optimization
export const UHD_CSS_CLASSES = {
    // High DPI image optimization
    highDpiImage: 'uhd-high-dpi-image',
    // GPU acceleration
    gpuAccelerated: 'uhd-gpu-accelerated',
    // Crisp text rendering
    crispText: 'uhd-crisp-text',
    // Smooth animations
    smoothAnimation: 'uhd-smooth-animation',
};
export default UHD_GRAPHICS_CONFIG;
//# sourceMappingURL=uhd-graphics.js.map
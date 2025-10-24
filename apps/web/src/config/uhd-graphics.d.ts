/**
 * 🎨 UHD/4K GRAPHICS CONFIGURATION
 * Ultra High Definition graphics settings for maximum visual quality
 */
export declare const UHD_GRAPHICS_CONFIG: {
    readonly resolutions: {
        readonly UHD_4K: {
            readonly width: 3840;
            readonly height: 2160;
            readonly dpi: 144;
        };
        readonly UHD_8K: {
            readonly width: 7680;
            readonly height: 4320;
            readonly dpi: 288;
        };
        readonly MOBILE_UHD: {
            readonly width: 1080;
            readonly height: 2400;
            readonly dpi: 420;
        };
        readonly TABLET_UHD: {
            readonly width: 2048;
            readonly height: 2732;
            readonly dpi: 264;
        };
        readonly DESKTOP_RETINA: {
            readonly width: 2560;
            readonly height: 1440;
            readonly dpi: 110;
        };
        readonly DESKTOP_4K: {
            readonly width: 3840;
            readonly height: 2160;
            readonly dpi: 144;
        };
    };
    readonly imageQuality: {
        readonly jpeg: {
            readonly quality: 100;
            readonly progressive: true;
            readonly mozjpeg: true;
        };
        readonly png: {
            readonly quality: 100;
            readonly compressionLevel: 0;
            readonly progressive: true;
        };
        readonly webp: {
            readonly quality: 100;
            readonly lossless: true;
            readonly method: 6;
        };
        readonly avif: {
            readonly quality: 100;
            readonly lossless: true;
            readonly speed: 0;
        };
    };
    readonly devicePixelRatios: {
        readonly standard: 1;
        readonly retina: 2;
        readonly superRetina: 3;
        readonly ultraRetina: 4;
    };
    readonly breakpoints: {
        readonly mobile: {
            readonly min: 0;
            readonly max: 767;
            readonly dpr: 3;
        };
        readonly tablet: {
            readonly min: 768;
            readonly max: 1023;
            readonly dpr: 2;
        };
        readonly desktop: {
            readonly min: 1024;
            readonly max: 1919;
            readonly dpr: 2;
        };
        readonly uhd: {
            readonly min: 1920;
            readonly max: 3839;
            readonly dpr: 2;
        };
        readonly '4k': {
            readonly min: 3840;
            readonly max: 7679;
            readonly dpr: 2;
        };
        readonly '8k': {
            readonly min: 7680;
            readonly max: number;
            readonly dpr: 2;
        };
    };
    readonly animation: {
        readonly frameRate: 60;
        readonly precision: "highp";
        readonly gpuAcceleration: true;
    };
    readonly canvas: {
        readonly alpha: true;
        readonly antialias: true;
        readonly depth: true;
        readonly stencil: true;
        readonly preserveDrawingBuffer: true;
        readonly powerPreference: "high-performance";
        readonly desynchronized: true;
    };
    readonly video: {
        readonly maxWidth: 3840;
        readonly maxHeight: 2160;
        readonly bitrate: "50M";
        readonly framerate: 60;
        readonly codec: "h264";
    };
    readonly typography: {
        readonly fontSmoothing: "antialiased";
        readonly webkitFontSmoothing: "antialiased";
        readonly mozOsxFontSmoothing: "grayscale";
        readonly textRendering: "optimizeLegibility";
    };
    readonly mediaQueries: {
        readonly retina: "@media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi)";
        readonly superRetina: "@media (-webkit-min-device-pixel-ratio: 3), (min-resolution: 288dpi)";
        readonly ultraRetina: "@media (-webkit-min-device-pixel-ratio: 4), (min-resolution: 384dpi)";
        readonly uhd: "@media (min-width: 1920px) and (min-height: 1080px)";
        readonly '4k': "@media (min-width: 3840px) and (min-height: 2160px)";
        readonly '8k': "@media (min-width: 7680px) and (min-height: 4320px)";
    };
    readonly performance: {
        readonly lazyLoading: true;
        readonly progressiveLoading: true;
        readonly preloadCritical: true;
        readonly formatDetection: true;
    };
};
export declare const getOptimalImageSize: (containerWidth: number, containerHeight: number, dpr?: number) => {
    width: number;
    height: number;
};
export declare const getOptimalImageFormat: () => string;
export declare const getDevicePixelRatio: () => number;
export declare const isUHDDisplay: () => boolean;
export declare const is4KDisplay: () => boolean;
export declare const UHD_CSS_CLASSES: {
    readonly highDpiImage: "uhd-high-dpi-image";
    readonly gpuAccelerated: "uhd-gpu-accelerated";
    readonly crispText: "uhd-crisp-text";
    readonly smoothAnimation: "uhd-smooth-animation";
};
export default UHD_GRAPHICS_CONFIG;
//# sourceMappingURL=uhd-graphics.d.ts.map
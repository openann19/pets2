"use strict";
/**
 * Shared types and interfaces for Swipe functionality
 * Used across web and mobile platforms
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_ANIMATION_CONFIG = exports.DEFAULT_SWIPE_CONFIG = void 0;
exports.DEFAULT_SWIPE_CONFIG = {
    threshold: 120,
    rotationMultiplier: 0.1,
    velocityThreshold: 0.3,
    directionalOffset: 80,
};
exports.DEFAULT_ANIMATION_CONFIG = {
    duration: 300,
    tension: 100,
    friction: 8,
    useNativeDriver: true,
};
//# sourceMappingURL=swipe.js.map
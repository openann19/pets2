"use strict";
/**
 * PawfectMatch Core - Shared Business Logic
 * Rule II.1: Pure, platform-agnostic TypeScript logic
 * Shared between web (React) and mobile (React Native)
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports._VERSION = exports.useRealtimeSocket = exports.useEventTracking = exports.useKeyboardShortcut = exports.useGesture = exports.useFocusTrap = exports.errorHandler = exports.AccountService = exports.useAnimationConfig = exports.animationConfig = exports.SETTINGS = exports.HAPTIC_SETTINGS = exports.HAPTICS = void 0;
// Export all types
__exportStar(require("./schemas"), exports);
__exportStar(require("./types"), exports);
__exportStar(require("./types/haptics"), exports);
// Export constants
var constants_1 = require("./constants");
Object.defineProperty(exports, "HAPTICS", { enumerable: true, get: function () { return constants_1.HAPTICS; } });
Object.defineProperty(exports, "HAPTIC_SETTINGS", { enumerable: true, get: function () { return constants_1.HAPTIC_SETTINGS; } });
Object.defineProperty(exports, "SETTINGS", { enumerable: true, get: function () { return constants_1.SETTINGS; } });
// Export animation configuration
var animationConfig_1 = require("./services/animationConfig");
Object.defineProperty(exports, "animationConfig", { enumerable: true, get: function () { return animationConfig_1.animationConfig; } });
Object.defineProperty(exports, "useAnimationConfig", { enumerable: true, get: function () { return animationConfig_1.useAnimationConfig; } });
__exportStar(require("./types/animations"), exports);
// Export utility functions
__exportStar(require("./utils"), exports);
__exportStar(require("./utils/env"), exports);
// Export global state stores
__exportStar(require("./stores"), exports);
// Export services (logger from utils only to avoid conflicts)
var AccountService_1 = require("./services/AccountService");
Object.defineProperty(exports, "AccountService", { enumerable: true, get: function () { return AccountService_1.AccountService; } });
var ErrorHandler_1 = require("./services/ErrorHandler");
Object.defineProperty(exports, "errorHandler", { enumerable: true, get: function () { return ErrorHandler_1.errorHandler; } });
// Export feature flags via root to support public consumption
__exportStar(require("./featureFlags"), exports);
// Export API client and hooks
__exportStar(require("./api"), exports);
// Note: useMatchAnalytics and useUserAnalytics exported from ./api, not ./hooks to avoid duplication
var hooks_1 = require("./hooks");
Object.defineProperty(exports, "useFocusTrap", { enumerable: true, get: function () { return hooks_1.useFocusTrap; } });
Object.defineProperty(exports, "useGesture", { enumerable: true, get: function () { return hooks_1.useGesture; } });
Object.defineProperty(exports, "useKeyboardShortcut", { enumerable: true, get: function () { return hooks_1.useKeyboardShortcut; } });
Object.defineProperty(exports, "useEventTracking", { enumerable: true, get: function () { return hooks_1.useEventTracking; } });
Object.defineProperty(exports, "useRealtimeSocket", { enumerable: true, get: function () { return hooks_1.useRealtimeSocket; } });
// Export mappers
__exportStar(require("./mappers"), exports);
// Version
exports._VERSION = '1.0.0';
//# sourceMappingURL=index.js.map
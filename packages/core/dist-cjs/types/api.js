"use strict";
/**
 * Common API and TypeScript utility types
 * Used to enforce type safety across the application
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.isNonNullable = isNonNullable;
exports.isError = isError;
exports.ensureArray = ensureArray;
exports.getProperty = getProperty;
/**
 * Ensures a value is not null or undefined
 * Use with type guards: `if (isNonNullable(value)) { ... }`
 */
function isNonNullable(value) {
    return value !== null && value !== undefined;
}
/**
 * Type guard for checking if a value is an Error
 */
function isError(value) {
    return value instanceof Error;
}
/**
 * Ensures a value is an array
 * If not already an array, wraps it in an array
 */
function ensureArray(value) {
    return Array.isArray(value) ? value : [value];
}
/**
 * Type-safe object property access
 */
function getProperty(obj, key) {
    return obj?.[key];
}
//# sourceMappingURL=api.js.map
"use strict";
/**
 * API Response Types for PawfectMatch
 * Strict TypeScript interfaces for all API responses
 * Rule II.1: Cross-Platform Architecture - shared types in packages/core
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.isApiErrorResponse = isApiErrorResponse;
exports.isApiSuccessResponse = isApiSuccessResponse;
// ============================================================================
// Type Guards
// ============================================================================
function isApiErrorResponse(response) {
    return (typeof response === 'object' &&
        response !== null &&
        'error' in response &&
        'message' in response);
}
function isApiSuccessResponse(response) {
    return (typeof response === 'object' &&
        response !== null &&
        'success' in response &&
        response.success);
}

/**
 * JWT Token Utilities
 * 
 * Provides JWT token decoding and validation functionality
 * for authentication token management.
 * 
 * Addresses WI-004: Real Authentication APIs - JWT Token Management
 */

import { logger } from "@pawfectmatch/core";

export interface JWTPayload {
  exp?: number;
  iat?: number;
  sub?: string;
  email?: string;
  [key: string]: unknown;
}

export interface TokenValidationResult {
  isValid: boolean;
  isExpired: boolean;
  expiresAt: Date | null;
  expiresIn: number;
  payload: JWTPayload | null;
  error?: string;
}

/**
 * Decode JWT token without verification (client-side only)
 * Note: This does not verify the signature, only decodes the payload
 */
export function decodeJWT(token: string): JWTPayload | null {
  try {
    const parts = token.split(".");
    
    if (parts.length !== 3) {
      logger.warn("jwt.invalid-format", { tokenLength: token.length });
      return null;
    }

    // Decode the payload (second part)
    const encodedPayload = parts[1];
    
    if (!encodedPayload) {
      logger.warn("jwt.invalid-format", { partsLength: parts.length });
      return null;
    }
    
    // Base64 decode
    const decodedPayload = base64UrlDecode(encodedPayload);
    
    // Parse JSON
    const payload = JSON.parse(decodedPayload) as JWTPayload;
    
    return payload;
  } catch (error) {
    logger.error("jwt.decode-failed", { error });
    return null;
  }
}

/**
 * Base64 URL decode (JWT-safe)
 */
function base64UrlDecode(str: string): string {
  // Replace URL-safe characters
  const base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  
  // Add padding if needed
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  
  // Decode
  const decoded = atob(base64 + padding);
  
  return decoded;
}

/**
 * Check if JWT token is expired
 */
export function isTokenExpired(token: string): boolean {
  const payload = decodeJWT(token);
  
  if (!payload || payload.exp === undefined) {
    return false; // Can't determine expiration
  }
  
  const expirationTime = payload.exp * 1000; // Convert to milliseconds
  const now = Date.now();
  
  return now >= expirationTime;
}

/**
 * Get token expiration time
 */
export function getTokenExpiration(token: string): Date | null {
  const payload = decodeJWT(token);
  
  if (!payload || payload.exp === undefined) {
    return null;
  }
  
  return new Date(payload.exp * 1000);
}

/**
 * Get time until token expiration in milliseconds
 */
export function getTokenExpiresIn(token: string): number {
  const payload = decodeJWT(token);
  
  if (!payload || payload.exp === undefined) {
    return 0;
  }
  
  const expirationTime = payload.exp * 1000;
  const now = Date.now();
  const expiresIn = expirationTime - now;
  
  return Math.max(0, expiresIn);
}

/**
 * Check if token should be refreshed (expiring soon)
 * Default threshold: 5 minutes before expiration
 */
export function shouldRefreshToken(
  token: string,
  thresholdMs: number = 5 * 60 * 1000,
): boolean {
  const expiresIn = getTokenExpiresIn(token);
  return expiresIn > 0 && expiresIn < thresholdMs;
}

/**
 * Validate JWT token structure and expiration
 */
export function validateToken(token: string): TokenValidationResult {
  try {
    const payload = decodeJWT(token);
    
    if (!payload) {
      return {
        isValid: false,
        isExpired: false,
        expiresAt: null,
        expiresIn: 0,
        payload: null,
        error: "Invalid token format",
      };
    }
    
    const isExpired = isTokenExpired(token);
    const expiresAt = getTokenExpiration(token);
    const expiresIn = getTokenExpiresIn(token);
    
    return {
      isValid: !isExpired,
      isExpired,
      expiresAt,
      expiresIn,
      payload,
    };
  } catch (error) {
    return {
      isValid: false,
      isExpired: false,
      expiresAt: null,
      expiresIn: 0,
      payload: null,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Extract user ID from JWT token
 */
export function getUserIdFromToken(token: string): string | null {
  const payload = decodeJWT(token);
  if (!payload) {
    return null;
  }
  
  // Try different common fields
  if (typeof payload.sub === "string") {
    return payload.sub;
  }
  if (typeof payload.userId === "string") {
    return payload.userId;
  }
  if (typeof payload.id === "string") {
    return payload.id;
  }
  if (typeof payload._id === "string") {
    return payload._id;
  }
  
  return null;
}

/**
 * Get token issuer and audience info
 */
export function getTokenMetadata(token: string): {
  issuer?: string;
  audience?: string;
  issuedAt: Date | null;
  expiresAt: Date | null;
} {
  const payload = decodeJWT(token);
  
  if (!payload) {
      return {
        issuedAt: null,
        expiresAt: null,
      };
    }

    return {
      ...(typeof payload.iss === "string" && { issuer: payload.iss }),
      ...(typeof payload.aud === "string" && { audience: payload.aud }),
      issuedAt: payload.iat !== undefined ? new Date(payload.iat * 1000) : null,
      expiresAt: payload.exp !== undefined ? new Date(payload.exp * 1000) : null,
    };
}


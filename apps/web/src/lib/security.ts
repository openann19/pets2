/**
 * Security Configuration and Utilities
 * Implements comprehensive security measures for the web application
 */
import { SecurityEventDetails } from '@/types/common'
import { logger } from '@pawfectmatch/core';
;
// Content Security Policy configuration
export const CSP_CONFIG = {
    'default-src': ["'self'"],
    'script-src': [
        "'self'",
        "'unsafe-inline'", // Required for Next.js
        "'unsafe-eval'", // Required for development
        'https://js.stripe.com',
        'https://checkout.stripe.com',
    ],
    'style-src': [
        "'self'",
        "'unsafe-inline'", // Required for Tailwind CSS
        'https://fonts.googleapis.com',
    ],
    'font-src': [
        "'self'",
        'https://fonts.gstatic.com',
        'data:',
    ],
    'img-src': [
        "'self'",
        'data:',
        'blob:',
        'https://images.unsplash.com',
        'https://res.cloudinary.com',
        'https://i.pravatar.cc',
    ],
    'media-src': [
        "'self'",
        'blob:',
        'https://res.cloudinary.com',
    ],
    'connect-src': [
        "'self'",
        'ws://localhost:5001',
        'wss://localhost:5001',
        'https://api.stripe.com',
        'https://checkout.stripe.com',
    ],
    'frame-src': [
        "'self'",
        'https://js.stripe.com',
        'https://checkout.stripe.com',
    ],
    'object-src': ["'none'"],
    'base-uri': ["'self'"],
    'form-action': ["'self'"],
    'frame-ancestors': ["'none'"],
    'upgrade-insecure-requests': [],
};
// Generate CSP header string
export function generateCSPHeader() {
    return Object.entries(CSP_CONFIG)
        .map(([directive, sources]) => {
        if (sources.length === 0) {
            return directive;
        }
        return `${directive} ${sources.join(' ')}`;
    })
        .join('; ');
}
// Security headers configuration
export const SECURITY_HEADERS = {
    'Content-Security-Policy': generateCSPHeader(),
    'X-Frame-Options': 'DENY',
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'X-XSS-Protection': '1; mode=block',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=()',
};
// CSRF token management
class CSRFManager {
    token = null;
    tokenExpiry = 0;
    generateToken() {
        const array = new Uint8Array(32);
        crypto.getRandomValues(array);
        this.token = Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
        this.tokenExpiry = Date.now() + (15 * 60 * 1000); // 15 minutes
        return this.token;
    }
    getToken() {
        if (!this.token || Date.now() > this.tokenExpiry) {
            return this.generateToken();
        }
        return this.token;
    }
    validateToken(token) {
        return this.token === token && Date.now() <= this.tokenExpiry;
    }
    clearToken() {
        this.token = null;
        this.tokenExpiry = 0;
    }
}
export const csrfManager = new CSRFManager();
// Input sanitization utilities
export class InputSanitizer {
    // Sanitize HTML content
    static sanitizeHTML(input) {
        const div = document.createElement('div');
        div.textContent = input;
        return div.innerHTML;
    }
    // Sanitize user input for display
    static sanitizeInput(input) {
        return input
            .replace(/[<>]/g, '') // Remove potential HTML tags
            .replace(/javascript:/gi, '') // Remove javascript: protocol
            .replace(/on\w+=/gi, '') // Remove event handlers
            .trim();
    }
    // Validate email format
    static validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    // Validate password strength
    static validatePassword(password) {
        const errors = [];
        if (password.length < 8) {
            errors.push('Password must be at least 8 characters long');
        }
        if (!/[A-Z]/.test(password)) {
            errors.push('Password must contain at least one uppercase letter');
        }
        if (!/[a-z]/.test(password)) {
            errors.push('Password must contain at least one lowercase letter');
        }
        if (!/\d/.test(password)) {
            errors.push('Password must contain at least one number');
        }
        if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
            errors.push('Password must contain at least one special character');
        }
        return {
            isValid: errors.length === 0,
            errors
        };
    }
    // Sanitize file name
    static sanitizeFileName(fileName) {
        return fileName
            .replace(/[^a-zA-Z0-9.-]/g, '_')
            .replace(/_{2,}/g, '_')
            .toLowerCase();
    }
}
// Rate limiting utilities
export class RateLimiter {
    requests = new Map();
    maxRequests;
    windowMs;
    constructor(maxRequests = 100, windowMs = 60000) {
        this.maxRequests = maxRequests;
        this.windowMs = windowMs;
    }
    isAllowed(identifier) {
        const now = Date.now();
        const requests = this.requests.get(identifier) || [];
        // Remove old requests outside the window
        const validRequests = requests.filter(time => now - time < this.windowMs);
        if (validRequests.length >= this.maxRequests) {
            return false;
        }
        // Add current request
        validRequests.push(now);
        this.requests.set(identifier, validRequests);
        return true;
    }
    getRemainingRequests(identifier) {
        const now = Date.now();
        const requests = this.requests.get(identifier) || [];
        const validRequests = requests.filter(time => now - time < this.windowMs);
        return Math.max(0, this.maxRequests - validRequests.length);
    }
    reset(identifier) {
        this.requests.delete(identifier);
    }
}
// Create rate limiters for different endpoints
export const rateLimiters = {
    auth: new RateLimiter(5, 60000), // 5 requests per minute for auth
    api: new RateLimiter(100, 60000), // 100 requests per minute for API
    upload: new RateLimiter(10, 60000), // 10 uploads per minute
};
// Secure cookie utilities
export class SecureCookie {
    static set(name, value, options = {}) {
        const { maxAge = 3600, httpOnly = false, secure = location.protocol === 'https:', sameSite = 'lax', path = '/' } = options;
        let cookie = `${name}=${value}; Max-Age=${maxAge}; Path=${path}; SameSite=${sameSite}`;
        if (secure) {
            cookie += '; Secure';
        }
        if (httpOnly) {
            cookie += '; HttpOnly';
        }
        document.cookie = cookie;
    }
    static get(name) {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) {
            return parts.pop()?.split(';').shift() || null;
        }
        return null;
    }
    static delete(name, path = '/') {
        document.cookie = `${name}=; Max-Age=0; Path=${path}; SameSite=lax`;
    }
}
// Security event logging
export class SecurityLogger {
    static logSecurityEvent(event) {
        const logEntry = {
            timestamp: new Date().toISOString(),
            type: event.type,
            details: event.details,
            userAgent: event.userAgent || navigator.userAgent,
            url: window.location.href,
            userId: event.userId,
        };
        // Log to console in development
        if (process.env.NODE_ENV === 'development') {
            logger.warn('[Security Event]', { logEntry });
        }
        // Send to security monitoring service in production
        if (process.env.NODE_ENV === 'production') {
            fetch('/api/security/log', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(logEntry),
            }).catch(() => {
                // Silently fail if logging fails
            });
        }
    }
}
// XSS protection utilities
export class XSSProtection {
    // Escape HTML entities
    static escapeHTML(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }
    // Check for potential XSS patterns
    static detectXSS(input) {
        const xssPatterns = [
            /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
            /javascript:/gi,
            /on\w+\s*=/gi,
            /<iframe/gi,
            /<object/gi,
            /<embed/gi,
            /<link/gi,
            /<meta/gi,
        ];
        return xssPatterns.some(pattern => pattern.test(input));
    }
    // Sanitize user-generated content
    static sanitizeContent(content) {
        if (this.detectXSS(content)) {
            SecurityLogger.logSecurityEvent({
                type: 'suspicious_activity',
                details: { content: content.substring(0, 100) },
            });
            return this.escapeHTML(content);
        }
        return content;
    }
}
// Secure storage utilities
export class SecureStorage {
    // Encrypt sensitive data before storing
    static async encrypt(data, key) {
        const encoder = new TextEncoder();
        const dataBuffer = encoder.encode(data);
        const keyBuffer = encoder.encode(key);
        const cryptoKey = await crypto.subtle.importKey('raw', keyBuffer, { name: 'PBKDF2' }, false, ['deriveKey']);
        const derivedKey = await crypto.subtle.deriveKey({
            name: 'PBKDF2',
            salt: new Uint8Array(16),
            iterations: 100000,
            hash: 'SHA-256',
        }, cryptoKey, { name: 'AES-GCM', length: 256 }, false, ['encrypt']);
        const iv = crypto.getRandomValues(new Uint8Array(12));
        const encrypted = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, derivedKey, dataBuffer);
        return btoa(String.fromCharCode(...new Uint8Array([...iv, ...new Uint8Array(encrypted)])));
    }
    // Decrypt sensitive data
    static async decrypt(encryptedData, key) {
        try {
            const data = new Uint8Array(atob(encryptedData).split('').map(c => c.charCodeAt(0)));
            const iv = data.slice(0, 12);
            const encrypted = data.slice(12);
            const encoder = new TextEncoder();
            const keyBuffer = encoder.encode(key);
            const cryptoKey = await crypto.subtle.importKey('raw', keyBuffer, { name: 'PBKDF2' }, false, ['deriveKey']);
            const derivedKey = await crypto.subtle.deriveKey({
                name: 'PBKDF2',
                salt: new Uint8Array(16),
                iterations: 100000,
                hash: 'SHA-256',
            }, cryptoKey, { name: 'AES-GCM', length: 256 }, false, ['decrypt']);
            const decrypted = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, derivedKey, encrypted);
            return new TextDecoder().decode(decrypted);
        }
        catch (error) {
            throw new Error('Failed to decrypt data');
        }
    }
}
export default {
    CSP_CONFIG,
    SECURITY_HEADERS,
    generateCSPHeader,
    csrfManager,
    InputSanitizer,
    rateLimiters,
    SecureCookie,
    SecurityLogger,
    XSSProtection,
    SecureStorage,
};
//# sourceMappingURL=security.js.map
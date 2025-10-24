/**
 * 🛡️ COMPREHENSIVE INPUT VALIDATION & SANITIZATION
 * Production-ready input validation with XSS protection and data sanitization
 */
import DOMPurify from 'isomorphic-dompurify';
import React from 'react';
import validator from 'validator';
// ====== INPUT SANITIZER ======
export class InputSanitizer {
    /**
     * Sanitize HTML content to prevent XSS attacks
     */
    static sanitizeHtml(input) {
        if (typeof input !== 'string')
            return '';
        return DOMPurify.sanitize(input, {
            ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p', 'br', 'a'],
            ALLOWED_ATTR: ['href', 'title'],
            ALLOW_DATA_ATTR: false,
            FORBID_TAGS: ['script', 'object', 'embed', 'iframe', 'form', 'input'],
            FORBID_ATTR: ['onload', 'onerror', 'onclick', 'onmouseover'],
        });
    }
    /**
     * Sanitize text input by removing dangerous characters
     */
    static sanitizeText(input) {
        if (typeof input !== 'string')
            return '';
        return input
            .replace(/[<>'"&]/g, '') // Remove dangerous HTML characters
            .replace(/javascript:/gi, '') // Remove javascript: protocol
            .replace(/data:/gi, '') // Remove data: protocol
            .trim();
    }
    /**
     * Sanitize email input
     */
    static sanitizeEmail(input) {
        if (typeof input !== 'string')
            return '';
        return validator.normalizeEmail(input) || '';
    }
    /**
     * Sanitize URL input
     */
    static sanitizeUrl(input) {
        if (typeof input !== 'string')
            return '';
        try {
            const url = new URL(input);
            // Only allow http/https protocols
            if (['http:', 'https:'].includes(url.protocol)) {
                return url.toString();
            }
        }
        catch {
            // Invalid URL
        }
        return '';
    }
    /**
     * Sanitize phone number
     */
    static sanitizePhone(input) {
        if (typeof input !== 'string')
            return '';
        return input.replace(/[^\d+\-() \s]/g, '').trim();
    }
    /**
     * Sanitize numeric input
     */
    static sanitizeNumber(input) {
        if (typeof input === 'number') {
            return isFinite(input) ? input : null;
        }
        if (typeof input === 'string') {
            const num = parseFloat(input);
            return isFinite(num) ? num : null;
        }
        return null;
    }
}
// ====== VALIDATION ENGINE ======
export class ValidationEngine {
    /**
     * Validate input against schema
     */
    static validate(input, schema) {
        const errors = [];
        const sanitizedData = {};
        for (const [field, rules] of Object.entries(schema)) {
            const value = input[field];
            // Check required fields
            if (rules.required && (value === undefined || value === null || value === '')) {
                errors.push(`${field} is required`);
                continue;
            }
            // Skip validation for optional empty fields
            if (!rules.required && (value === undefined || value === null || value === '')) {
                sanitizedData[field] = value;
                continue;
            }
            // Type validation
            const typeError = this.validateType(value, rules.type, field);
            if (typeError) {
                errors.push(typeError);
                continue;
            }
            // Sanitize based on type
            const sanitizedValue = this.sanitizeByType(value, rules.type, rules.sanitize);
            // Additional validations
            const validationErrors = this.validateRules(sanitizedValue, rules, field);
            errors.push(...validationErrors);
            // Custom validation
            if (rules.custom && !rules.custom(sanitizedValue)) {
                errors.push(`${field} failed custom validation`);
            }
            sanitizedData[field] = sanitizedValue;
        }
        return {
            isValid: errors.length === 0,
            errors,
            sanitizedData,
        };
    }
    /**
     * Validate data type
     */
    static validateType(value, type, field) {
        switch (type) {
            case 'string':
                return typeof value === 'string' ? null : `${field} must be a string`;
            case 'number':
                return typeof value === 'number' && isFinite(value) ? null : `${field} must be a number`;
            case 'boolean':
                return typeof value === 'boolean' ? null : `${field} must be a boolean`;
            case 'email':
                return typeof value === 'string' && validator.isEmail(value)
                    ? null
                    : `${field} must be a valid email`;
            case 'url':
                return typeof value === 'string' && validator.isURL(value)
                    ? null
                    : `${field} must be a valid URL`;
            case 'date':
                return typeof value === 'string' && validator.isISO8601(value)
                    ? null
                    : `${field} must be a valid date`;
            case 'array':
                return Array.isArray(value) ? null : `${field} must be an array`;
            case 'object':
                return typeof value === 'object' && value !== null ? null : `${field} must be an object`;
            default:
                return null;
        }
    }
    /**
     * Sanitize value based on type
     */
    static sanitizeByType(value, type, sanitize) {
        if (!sanitize)
            return value;
        switch (type) {
            case 'string':
                return InputSanitizer.sanitizeText(String(value));
            case 'email':
                return InputSanitizer.sanitizeEmail(String(value));
            case 'url':
                return InputSanitizer.sanitizeUrl(String(value));
            case 'number':
                return InputSanitizer.sanitizeNumber(value);
            default:
                return value;
        }
    }
    /**
     * Validate against specific rules
     */
    static validateRules(value, rules, field) {
        const errors = [];
        // String validations
        if (typeof value === 'string') {
            if (typeof rules.minLength === 'number' && value.length < rules.minLength) {
                errors.push(`${field} must be at least ${rules.minLength} characters`);
            }
            if (typeof rules.maxLength === 'number' && value.length > rules.maxLength) {
                errors.push(`${field} must be no more than ${rules.maxLength} characters`);
            }
            if (rules.pattern && !rules.pattern.test(value)) {
                errors.push(`${field} format is invalid`);
            }
        }
        // Number validations
        if (typeof value === 'number') {
            if (typeof rules.min === 'number' && value < rules.min) {
                errors.push(`${field} must be at least ${rules.min}`);
            }
            if (typeof rules.max === 'number' && value > rules.max) {
                errors.push(`${field} must be no more than ${rules.max}`);
            }
        }
        // Enum validation
        if (Array.isArray(rules.enum)) {
            const strVal = String(value);
            if (!rules.enum.includes(strVal)) {
                errors.push(`${field} must be one of: ${rules.enum.join(', ')}`);
            }
        }
        return errors;
    }
}
// ====== COMMON VALIDATION SCHEMAS ======
export const ValidationSchemas = {
    // User registration
    userRegistration: {
        email: {
            type: 'email',
            required: true,
            maxLength: 255,
            sanitize: true,
        },
        password: {
            type: 'string',
            required: true,
            minLength: 8,
            maxLength: 128,
            pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
            sanitize: true,
        },
        name: {
            type: 'string',
            required: true,
            minLength: 2,
            maxLength: 100,
            sanitize: true,
        },
        phone: {
            type: 'string',
            required: false,
            maxLength: 20,
            sanitize: true,
        },
    },
    // Pet profile
    petProfile: {
        name: {
            type: 'string',
            required: true,
            minLength: 2,
            maxLength: 50,
            sanitize: true,
        },
        age: {
            type: 'number',
            required: true,
            min: 0,
            max: 30,
        },
        breed: {
            type: 'string',
            required: true,
            minLength: 2,
            maxLength: 100,
            sanitize: true,
        },
        description: {
            type: 'string',
            required: false,
            maxLength: 1000,
            sanitize: true,
        },
        location: {
            type: 'object',
            required: true,
        },
    },
    // Chat message
    chatMessage: {
        content: {
            type: 'string',
            required: true,
            minLength: 1,
            maxLength: 1000,
            sanitize: true,
        },
        type: {
            type: 'string',
            required: true,
            enum: ['text', 'image', 'emoji'],
            sanitize: true,
        },
    },
    // Admin action
    adminAction: {
        action: {
            type: 'string',
            required: true,
            enum: ['suspend', 'activate', 'ban', 'unban', 'delete'],
            sanitize: true,
        },
        reason: {
            type: 'string',
            required: true,
            minLength: 10,
            maxLength: 500,
            sanitize: true,
        },
        userId: {
            type: 'string',
            required: true,
            pattern: /^[a-f\d]{24}$/i, // MongoDB ObjectId pattern
        },
    },
};
export function createValidationMiddleware(schema) {
    return (req, res, next) => {
        const result = ValidationEngine.validate(req.body, schema);
        if (!result.isValid) {
            return res.status(400).json({
                error: 'Validation failed',
                details: result.errors,
            });
        }
        req.body = result.sanitizedData;
        next();
    };
}
// ====== REACT HOOK FOR VALIDATION ======
export function useInputValidation(schema) {
    const [errors, setErrors] = React.useState([]);
    const [isValid, setIsValid] = React.useState(false);
    const validate = React.useCallback((data) => {
        const result = ValidationEngine.validate(data, schema);
        setErrors(result.errors);
        setIsValid(result.isValid);
        return result;
    }, [schema]);
    const sanitize = React.useCallback((data) => {
        const sanitized = {};
        for (const [field] of Object.entries(schema)) {
            if (data[field] !== undefined) {
                sanitized[field] = InputSanitizer.sanitizeText(String(data[field]));
            }
        }
        return sanitized;
    }, [schema]);
    return {
        validate,
        sanitize,
        errors,
        isValid,
    };
}
// ====== EXPORT UTILITIES ======
// Named exports above already export all symbols
//# sourceMappingURL=inputValidation.js.map
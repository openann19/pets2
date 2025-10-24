/**
 * 🛡️ COMPREHENSIVE INPUT VALIDATION & SANITIZATION
 * Production-ready input validation with XSS protection and data sanitization
 */
export interface ValidationSchema {
    [key: string]: {
        type: 'string' | 'number' | 'boolean' | 'email' | 'url' | 'date' | 'array' | 'object';
        required?: boolean;
        minLength?: number;
        maxLength?: number;
        pattern?: RegExp;
        min?: number;
        max?: number;
        enum?: string[];
        sanitize?: boolean;
        custom?: (value: unknown) => boolean | string;
    };
}
export declare class InputSanitizer {
    /**
     * Sanitize HTML content to prevent XSS attacks
     */
    static sanitizeHtml(input: string): string;
    /**
     * Sanitize text input by removing dangerous characters
     */
    static sanitizeText(input: string): string;
    /**
     * Sanitize email input
     */
    static sanitizeEmail(input: string): string;
    /**
     * Sanitize URL input
     */
    static sanitizeUrl(input: string): string;
    /**
     * Sanitize phone number
     */
    static sanitizePhone(input: string): string;
    /**
     * Sanitize numeric input
     */
    static sanitizeNumber(input: unknown): number | null;
}
export declare class ValidationEngine {
    /**
     * Validate input against schema
     */
    static validate(input: Record<string, unknown>, schema: ValidationSchema): {
        isValid: boolean;
        errors: string[];
        sanitizedData: Record<string, unknown>;
    };
    /**
     * Validate data type
     */
    private static validateType;
    /**
     * Sanitize value based on type
     */
    private static sanitizeByType;
    /**
     * Validate against specific rules
     */
    private static validateRules;
}
export declare const ValidationSchemas: {
    userRegistration: {
        email: {
            type: "email";
            required: boolean;
            maxLength: number;
            sanitize: boolean;
        };
        password: {
            type: "string";
            required: boolean;
            minLength: number;
            maxLength: number;
            pattern: RegExp;
            sanitize: boolean;
        };
        name: {
            type: "string";
            required: boolean;
            minLength: number;
            maxLength: number;
            sanitize: boolean;
        };
        phone: {
            type: "string";
            required: boolean;
            maxLength: number;
            sanitize: boolean;
        };
    };
    petProfile: {
        name: {
            type: "string";
            required: boolean;
            minLength: number;
            maxLength: number;
            sanitize: boolean;
        };
        age: {
            type: "number";
            required: boolean;
            min: number;
            max: number;
        };
        breed: {
            type: "string";
            required: boolean;
            minLength: number;
            maxLength: number;
            sanitize: boolean;
        };
        description: {
            type: "string";
            required: boolean;
            maxLength: number;
            sanitize: boolean;
        };
        location: {
            type: "object";
            required: boolean;
        };
    };
    chatMessage: {
        content: {
            type: "string";
            required: boolean;
            minLength: number;
            maxLength: number;
            sanitize: boolean;
        };
        type: {
            type: "string";
            required: boolean;
            enum: string[];
            sanitize: boolean;
        };
    };
    adminAction: {
        action: {
            type: "string";
            required: boolean;
            enum: string[];
            sanitize: boolean;
        };
        reason: {
            type: "string";
            required: boolean;
            minLength: number;
            maxLength: number;
            sanitize: boolean;
        };
        userId: {
            type: "string";
            required: boolean;
            pattern: RegExp;
        };
    };
};
interface Request {
    body: Record<string, unknown>;
}
interface Response {
    status: (code: number) => Response;
    json: (data: unknown) => void;
}
type NextFunction = () => void;
export declare function createValidationMiddleware(schema: ValidationSchema): (req: Request, res: Response, next: NextFunction) => void;
export declare function useInputValidation(schema: ValidationSchema): {
    validate: (data: Record<string, unknown>) => {
        isValid: boolean;
        errors: string[];
        sanitizedData: Record<string, unknown>;
    };
    sanitize: (data: Record<string, unknown>) => Record<string, unknown>;
    errors: string[];
    isValid: boolean;
};
export {};
//# sourceMappingURL=inputValidation.d.ts.map
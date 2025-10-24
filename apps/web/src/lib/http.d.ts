/**
 * Typed HTTP Client
 * Centralized fetch wrapper with timeouts, retries, CSRF, and runtime validation
 */
import { z } from 'zod';
interface FetchOptions extends RequestInit {
    timeout?: number;
    retries?: number;
    retryDelay?: number;
    validateStatus?: (status: number) => boolean;
}
interface HttpClientOptions {
    baseURL?: string;
    timeout?: number;
    retries?: number;
    headers?: Record<string, string>;
}
declare class HttpClient {
    private baseURL;
    private defaultTimeout;
    private defaultRetries;
    private defaultHeaders;
    constructor(options?: HttpClientOptions);
    /**
     * Set CSRF token from cookie or header
     */
    private getCsrfToken;
    /**
     * Normalize different HeadersInit shapes to a plain object
     */
    private normalizeHeaders;
    /**
     * Fetch with timeout
     */
    private fetchWithTimeout;
    /**
     * Fetch with retries for idempotent requests
     */
    private fetchWithRetries;
    /**
     * Make HTTP request
     */
    private request;
    /**
     * Make request with Zod schema validation
     */
    requestWithSchema<T>(url: string, schema: z.ZodSchema<T>, options?: FetchOptions): Promise<T>;
    /**
     * GET request
     */
    get<T>(url: string, options?: FetchOptions): Promise<T>;
    /**
     * GET request with schema validation
     */
    getWithSchema<T>(url: string, schema: z.ZodSchema<T>, options?: FetchOptions): Promise<T>;
    /**
     * POST request
     */
    post<T>(url: string, data?: unknown, options?: FetchOptions): Promise<T>;
    /**
     * POST request with schema validation
     */
    postWithSchema<T>(url: string, schema: z.ZodSchema<T>, data?: unknown, options?: FetchOptions): Promise<T>;
    /**
     * PUT request
     */
    put<T>(url: string, data?: unknown, options?: FetchOptions): Promise<T>;
    /**
     * PATCH request
     */
    patch<T>(url: string, data?: unknown, options?: FetchOptions): Promise<T>;
    /**
     * DELETE request
     */
    delete<T>(url: string, options?: FetchOptions): Promise<T>;
}
/**
 * Custom HTTP Error
 */
export declare class HttpError extends Error {
    status: number;
    data?: unknown | undefined;
    constructor(message: string, status: number, data?: unknown | undefined);
}
/**
 * Validation Error
 */
export declare class ValidationError extends Error {
    errors: z.ZodIssue[];
    constructor(message: string, errors: z.ZodIssue[]);
}
export declare const http: HttpClient;
export default http;
//# sourceMappingURL=http.d.ts.map
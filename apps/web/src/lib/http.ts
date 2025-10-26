/**
 * Typed HTTP Client
 * Centralized fetch wrapper with timeouts, retries, CSRF, and runtime validation
 */
import { z } from 'zod';
class HttpClient {
    baseURL;
    defaultTimeout;
    defaultRetries;
    defaultHeaders;
    constructor(options = {}) {
        this.baseURL = options.baseURL || '';
        this.timeout = options.timeout || 30000;
        this.retries = options.retries || 0;
        this.headers = {
            'Content-Type': 'application/json',
            ...options.headers,
        };
    }
    /**
     * Set CSRF token from cookie or header
     */
    getCsrfToken() {
        if (typeof document === 'undefined')
            return null;
        // Try to get from cookie
        const cookies = document.cookie.split(';');
        for (const cookie of cookies) {
            const [key, value] = cookie.trim().split('=');
            if ((key === 'csrf-token' || key === 'XSRF-TOKEN') && typeof value === 'string' && value.length > 0) {
                return decodeURIComponent(value);
            }
        }
        return null;
    }
    /**
     * Normalize different HeadersInit shapes to a plain object
     */
    normalizeHeaders(init) {
        if (!init)
            return {};
        if (typeof Headers !== 'undefined' && init instanceof Headers) {
            return Object.fromEntries(init.entries());
        }
        if (Array.isArray(init)) {
            return Object.fromEntries(init);
        }
        return init;
    }
    /**
     * Fetch with timeout
     */
    async fetchWithTimeout(url, options) {
        const timeout = options.timeout || this.default;
        const controller = new AbortController();
        const timeoutId = setTimeout(() => { controller.abort(); }, timeout);
        try {
            const response = await fetch(url, {
                ...options,
                signal: controller.signal,
            });
            clearTimeout(timeoutId);
            return response;
        }
        catch (error) {
            clearTimeout(timeoutId);
            if (error instanceof Error && error.name === 'AbortError') {
                throw new Error(`Request timeout after ${timeout}ms`);
            }
            throw error;
        }
    }
    /**
     * Fetch with retries for idempotent requests
     */
    async fetchWithRetries(url, options) {
        const retries = options.retries ?? this.default;
        const retryDelay = options.retryDelay || 1000;
        const isIdempotent = !options.method || ['GET', 'HEAD', 'OPTIONS'].includes(options.method);
        let lastError = null;
        const attempts = isIdempotent ? retries + 1 : 1;
        for (let attempt = 0; attempt < attempts; attempt++) {
            try {
                const response = await this.fetchWithTimeout(url, options);
                // Check if we should retry based on status
                const shouldRetry = isIdempotent &&
                    attempt < attempts - 1 &&
                    (response.status === 429 || response.status >= 500);
                if (shouldRetry) {
                    const delay = retryDelay * Math.pow(2, attempt); // Exponential backoff
                    await new Promise(resolve => setTimeout(resolve, delay));
                    continue;
                }
                return response;
            }
            catch (error) {
                lastError = error;
                if (attempt < attempts - 1 && isIdempotent) {
                    const delay = retryDelay * Math.pow(2, attempt);
                    await new Promise(resolve => setTimeout(resolve, delay));
                    continue;
                }
                throw error;
            }
        }
        throw lastError || new Error('Request failed');
    }
    /**
     * Make HTTP request
     */
    async request(url, options = {}) {
        const fullURL = url.startsWith('http') ? url : `${this.baseURL}${url}`;
        // Get CSRF token for state-changing operations
        const csrfToken = this.getCsrfToken();
        const headersObj = {
            ...this.default,
            ...this.normalizeHeaders(options.headers),
        };
        // Add CSRF token for non-GET requests
        if (csrfToken && options.method && !['GET', 'HEAD', 'OPTIONS'].includes(options.method)) {
            headersObj['X-CSRF-Token'] = csrfToken;
        }
        const fetchOptions = {
            ...options,
            headers: headersObj,
            credentials: 'include', // Always send cookies
        };
        const response = await this.fetchWithRetries(fullURL, fetchOptions);
        // Handle non-2xx responses
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new HttpError(errorData.message || `HTTP ${response.status}: ${response.statusText}`, response.status, errorData);
        }
        // Parse JSON response
        return response.json();
    }
    /**
     * Make request with Zod schema validation
     */
    async requestWithSchema(url, schema, options = {}) {
        const data = await this.request(url, options);
        try {
            return schema.parse(data);
        }
        catch (error) {
            if (error instanceof z.ZodError) {
                throw new ValidationError('Response validation failed', error.errors);
            }
            throw error;
        }
    }
    /**
     * GET request
     */
    async get(url, options) {
        return this.request(url, { ...options, method: 'GET' });
    }
    /**
     * GET request with schema validation
     */
    async getWithSchema(url, schema, options) {
        return this.requestWithSchema(url, schema, { ...options, method: 'GET' });
    }
    /**
     * POST request
     */
    async post(url, data, options) {
        return this.request(url, {
            ...options,
            method: 'POST',
            body: data ? JSON.stringify(data) : null,
        });
    }
    /**
     * POST request with schema validation
     */
    async postWithSchema(url, schema, data, options) {
        return this.requestWithSchema(url, schema, {
            ...options,
            method: 'POST',
            body: data ? JSON.stringify(data) : null,
        });
    }
    /**
     * PUT request
     */
    async put(url, data, options) {
        return this.request(url, {
            ...options,
            method: 'PUT',
            body: data ? JSON.stringify(data) : null,
        });
    }
    /**
     * PATCH request
     */
    async patch(url, data, options) {
        return this.request(url, {
            ...options,
            method: 'PATCH',
            body: data ? JSON.stringify(data) : null,
        });
    }
    /**
     * DELETE request
     */
    async delete(url, options) {
        return this.request(url, { ...options, method: 'DELETE' });
    }
}
/**
 * Custom HTTP Error
 */
export class HttpError extends Error {
    status;
    data;
    constructor(message, status, data) {
        super(message);
        this.status = status;
        this.data = data;
        this.name = 'HttpError';
    }
}
/**
 * Validation Error
 */
export class ValidationError extends Error {
    errors;
    constructor(message, errors) {
        super(message);
        this.errors = errors;
        this.name = 'ValidationError';
    }
}
// Export singleton instance
export const http = new HttpClient({
    baseURL: '',
    timeout: 30000,
    retries: 2,
});
export default http;
//# sourceMappingURL=http.js.map
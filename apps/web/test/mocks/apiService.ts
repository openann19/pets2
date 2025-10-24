/**
 * Mock API service for testing
 * Provides typed mocks that align with the actual API service interface
 */

interface ApiResponse<T = unknown> {
    data: T;
    status: number;
    statusText: string;
    headers: Record<string, string>;
}

interface ApiError {
    message: string;
    status: number;
    code?: string;
}

/**
 * Mock API client that mimics the real API service structure
 */
export class MockApiService {
    // Mock data storage
    private data: Map<string, unknown> = new Map();
    private responses: Map<string, unknown> = new Map();
    private errors: Map<string, ApiError> = new Map();

    // Request tracking for assertions
    public requests: Array<{
        method: string;
        url: string;
        data?: unknown;
        headers?: Record<string, string>;
        timestamp: number;
    }> = [];

    /**
     * Mock GET request
     */
    async get<T = unknown>(url: string, config?: { headers?: Record<string, string> }): Promise<ApiResponse<T>> {
        this.trackRequest('GET', url, undefined, config?.headers);

        if (this.errors.has(url)) {
            const error = this.errors.get(url);
            if (error !== undefined) {
                throw new Error(error.message);
            }
        }

        const data = (this.responses.get(url) ?? this.data.get(url)) ?? {};
        return this.createResponse(data as T);
    }

    /**
     * Mock POST request
     */
    async post<T = unknown>(url: string, data?: unknown, config?: { headers?: Record<string, string> }): Promise<ApiResponse<T>> {
        this.trackRequest('POST', url, data, config?.headers);

        if (this.errors.has(url)) {
            const error = this.errors.get(url);
            if (error !== undefined) {
                throw new Error(error.message);
            }
        }

        const responseData = (this.responses.get(url) as T) ?? { id: this.generateId(), ...data } as T;
        return this.createResponse(responseData);
    }

    /**
     * Mock PUT request
     */
    async put<T = unknown>(url: string, data?: unknown, config?: { headers?: Record<string, string> }): Promise<ApiResponse<T>> {
        this.trackRequest('PUT', url, data, config?.headers);

        if (this.errors.has(url)) {
            const error = this.errors.get(url);
            if (error !== undefined) {
                throw new Error(error.message);
            }
        }

        const responseData = (this.responses.get(url) as T) ?? { ...data } as T;
        return this.createResponse(responseData);
    }

    /**
     * Mock DELETE request
     */
    async delete<T = unknown>(url: string, config?: { headers?: Record<string, string> }): Promise<ApiResponse<T>> {
        this.trackRequest('DELETE', url, undefined, config?.headers);

        if (this.errors.has(url)) {
            const error = this.errors.get(url);
            if (error !== undefined) {
                throw new Error(error.message);
            }
        }

        const responseData = (this.responses.get(url) as T) ?? { success: true } as T;
        return this.createResponse(responseData);
    }

    /**
     * Mock PATCH request
     */
    async patch<T = unknown>(url: string, data?: unknown, config?: { headers?: Record<string, string> }): Promise<ApiResponse<T>> {
        this.trackRequest('PATCH', url, data, config?.headers);

        if (this.errors.has(url)) {
            const error = this.errors.get(url);
            if (error !== undefined) {
                throw new Error(error.message);
            }
        }

        const responseData = (this.responses.get(url) as T) ?? { ...data } as T;
        return this.createResponse(responseData);
    }

    // Mock configuration methods

    /**
     * Set mock response for a specific URL
     */
    mockResponse(url: string, data: unknown): void {
        this.responses.set(url, data);
    }

    /**
     * Set mock error for a specific URL
     */
    mockError(url: string, error: Partial<ApiError>): void {
        const apiError: ApiError = {
            message: error.message ?? 'API Error',
            status: error.status ?? 500,
        };
        if (error.code !== undefined) {
            apiError.code = error.code;
        }
        this.errors.set(url, apiError);
    }

    /**
     * Set persistent data that will be returned if no specific response is set
     */
    setData(key: string, data: unknown): void {
        this.data.set(key, data);
    }

    /**
     * Clear all mocks and request history
     */
    reset(): void {
        this.data.clear();
        this.responses.clear();
        this.errors.clear();
        this.requests = [];
    }

    /**
     * Get request history for assertions
     */
    getRequests(method?: string, url?: string): typeof this.requests {
        let filtered = this.requests;

        if (method !== undefined) {
            filtered = filtered.filter(req => req.method === method);
        }

        if (url !== undefined) {
            filtered = filtered.filter(req => req.url.includes(url));
        }

        return filtered;
    }

    /**
     * Check if a request was made
     */
    wasRequestMade(method: string, url: string): boolean {
        return this.requests.some(req => req.method === method && req.url.includes(url));
    }

    /**
     * Get the last request made
     */
    getLastRequest(): typeof this.requests[0] | undefined {
        return this.requests[this.requests.length - 1];
    }

    // Private helper methods

    private trackRequest(method: string, url: string, data?: unknown, headers?: Record<string, string>): void {
        const request: {
            method: string;
            url: string;
            data?: unknown;
            headers?: Record<string, string>;
            timestamp: number;
        } = {
            method,
            url,
            timestamp: Date.now(),
        };
        if (data !== undefined) request.data = data;
        if (headers !== undefined) request.headers = headers;

        this.requests.push(request);
    }

    private createResponse<T>(data: T): ApiResponse<T> {
        return {
            data,
            status: 200,
            statusText: 'OK',
            headers: {
                'content-type': 'application/json',
            },
        };
    }

    private generateId(): string {
        return Math.random().toString(36).substring(2, 11);
    }
}

/**
 * Create a fresh mock API service instance
 */
export function createMockApiService(): MockApiService {
    return new MockApiService();
}

/**
 * Jest mock factory for API service
 */
export function createApiServiceMock() {
    const mockService = new MockApiService();

    // Override with jest mocks while preserving functionality
    mockService.get = jest.fn().mockImplementation(mockService.get.bind(mockService));
    mockService.post = jest.fn().mockImplementation(mockService.post.bind(mockService));
    mockService.put = jest.fn().mockImplementation(mockService.put.bind(mockService));
    mockService.delete = jest.fn().mockImplementation(mockService.delete.bind(mockService));
    mockService.patch = jest.fn().mockImplementation(mockService.patch.bind(mockService));

    return mockService;
}

/**
 * Higher-level API mocks for specific endpoints
 */
export const apiMocks = {
    /**
     * Mock successful user profile fetch
     */
    mockUserProfile: (apiService: MockApiService, userData: Record<string, unknown>) => {
        apiService.mockResponse('/user/profile', userData);
    },

    /**
     * Mock successful pets list fetch
     */
    mockPetsList: (apiService: MockApiService, petsData: Record<string, unknown>[]) => {
        apiService.mockResponse('/pets', petsData);
    },

    /**
     * Mock successful match creation
     */
    mockCreateMatch: (apiService: MockApiService, matchData: Record<string, unknown>) => {
        apiService.mockResponse('/matches', matchData);
    },

    /**
     * Mock authentication failure
     */
    mockAuthError: (apiService: MockApiService) => {
        apiService.mockError('/auth/login', {
            message: 'Invalid credentials',
            status: 401,
            code: 'INVALID_CREDENTIALS'
        });
    },

    /**
     * Mock server error
     */
    mockServerError: (apiService: MockApiService, url: string) => {
        apiService.mockError(url, {
            message: 'Internal server error',
            status: 500,
            code: 'INTERNAL_ERROR'
        });
    },

    /**
     * Mock network error
     */
    mockNetworkError: (apiService: MockApiService, url: string) => {
        apiService.mockError(url, {
            message: 'Network error',
            status: 0,
            code: 'NETWORK_ERROR'
        });
    },
};
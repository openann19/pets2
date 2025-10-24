"use strict";
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
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.apiClient = void 0;
const axios_1 = __importStar(require("axios"));
const environment_1 = require("../utils/environment");
class ApiClient {
    client;
    constructor() {
        this.client = axios_1.default.create({
            baseURL: process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:5000/api',
            timeout: 10000,
            headers: {
                'Content-Type': 'application/json',
            },
        });
        this.setupInterceptors();
    }
    setupInterceptors() {
        // Request interceptor to add auth token
        this.client.interceptors.request.use((config) => {
            const storage = (0, environment_1.getLocalStorage)();
            const token = storage?.getItem('accessToken');
            if (typeof token === 'string' && token.trim().length > 0) {
                const bearerToken = `Bearer ${token.trim()}`;
                const headers = isAxiosHeaders(config.headers)
                    ? config.headers
                    : new axios_1.AxiosHeaders(config.headers ?? {});
                headers.set('Authorization', bearerToken);
                config.headers = headers;
            }
            return config;
        }, (error) => Promise.reject(new Error(extractErrorMessage(error, 'Request interceptor failed'))));
        // Response interceptor for error handling
        this.client.interceptors.response.use((response) => response, (error) => {
            console.error('Response interceptor error:', extractErrorMessage(error, 'Unknown error'));
            if (isAxiosErrorLike(error)) {
                if (error.response?.status === 401) {
                    const storage = (0, environment_1.getLocalStorage)();
                    storage?.removeItem('accessToken');
                    storage?.removeItem('refreshToken');
                    (0, environment_1.redirectTo)('/login');
                }
                const statusCode = error.response?.status;
                return Promise.reject(new Error(`API request failed: ${statusCode?.toString() ?? 'Unknown error'}`));
            }
            return Promise.reject(new Error(extractErrorMessage(error, 'Response interceptor failed')));
        });
    }
    // Generic request methods with proper error handling
    async get(url, config) {
        try {
            const response = await this.client.get(url, config);
            return response.data;
        }
        catch (error) {
            throw new Error(extractErrorMessage(error, 'Request failed'));
        }
    }
    async post(url, data, config) {
        try {
            const response = await this.client.post(url, data, config);
            return response.data;
        }
        catch (error) {
            throw new Error(extractErrorMessage(error, 'Request failed'));
        }
    }
    async put(url, data, config) {
        try {
            const response = await this.client.put(url, data, config);
            return response.data;
        }
        catch (error) {
            throw new Error(extractErrorMessage(error, 'Request failed'));
        }
    }
    async patch(url, data, config) {
        try {
            const response = await this.client.patch(url, data, config);
            return response.data;
        }
        catch (error) {
            throw new Error(extractErrorMessage(error, 'Request failed'));
        }
    }
    async delete(url, config) {
        try {
            const response = await this.client.delete(url, config);
            return response.data;
        }
        catch (error) {
            throw new Error(extractErrorMessage(error, 'Request failed'));
        }
    }
    // File upload helper with proper typing
    async uploadFile(url, config) {
        try {
            const formData = new FormData();
            formData.append('file', config.file);
            if (config.additionalData != null) {
                Object.entries(config.additionalData).forEach(([key, value]) => {
                    formData.append(key, String(value));
                });
            }
            const axiosConfig = {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            };
            if (config.onProgress != null) {
                axiosConfig.onUploadProgress = (progressEvent) => {
                    if (progressEvent.total != null && progressEvent.total > 0) {
                        const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                        config.onProgress(progress);
                    }
                };
            }
            const response = await this.client.post(url, formData, axiosConfig);
            return response.data;
        }
        catch (error) {
            throw new Error(extractErrorMessage(error, 'Upload failed'));
        }
    }
}
// Create and export singleton instance
exports.apiClient = new ApiClient();
exports.default = exports.apiClient;
const isAxiosErrorLike = (error) => {
    return typeof error === 'object' && error !== null && 'response' in error;
};
const isAxiosHeaders = (headers) => {
    return (typeof headers === 'object' &&
        headers !== null &&
        'set' in headers &&
        typeof headers.set === 'function');
};
const extractErrorMessage = (error, fallback) => {
    if (isAxiosErrorLike(error)) {
        const message = error.response?.data?.message ?? error.message;
        if (typeof message === 'string' && message.trim().length > 0) {
            return message;
        }
    }
    if (error instanceof Error && error.message.trim().length > 0) {
        return error.message;
    }
    if (typeof error === 'string' && error.trim().length > 0) {
        return error.trim();
    }
    return fallback;
};
//# sourceMappingURL=client.js.map
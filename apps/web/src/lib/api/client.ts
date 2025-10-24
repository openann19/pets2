import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
class ApiClient {
    client;
    constructor() {
        this.client = axios.create({
            baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
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
            const token = localStorage.getItem('accessToken');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
            return config;
        }, (error) => {
            return Promise.reject(error);
        });
        // Response interceptor for error handling
        this.client.interceptors.response.use((response) => response, (error) => {
            if (error.response?.status === 401) {
                // Handle token refresh or logout
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                window.location.href = '/login';
            }
            return Promise.reject(error);
        });
    }
    // Generic request methods
    async get(url, config) {
        try {
            const response = await this.client.get(url, config);
            return response.data;
        }
        catch (error) {
            throw new Error(error.response?.data?.message || error.message || 'Request failed');
        }
    }
    async post(url, data, config) {
        try {
            const response = await this.client.post(url, data, config);
            return response.data;
        }
        catch (error) {
            throw new Error(error.response?.data?.message || error.message || 'Request failed');
        }
    }
    async put(url, data, config) {
        try {
            const response = await this.client.put(url, data, config);
            return response.data;
        }
        catch (error) {
            throw new Error(error.response?.data?.message || error.message || 'Request failed');
        }
    }
    async patch(url, data, config) {
        try {
            const response = await this.client.patch(url, data, config);
            return response.data;
        }
        catch (error) {
            throw new Error(error.response?.data?.message || error.message || 'Request failed');
        }
    }
    async delete(url, config) {
        try {
            const response = await this.client.delete(url, config);
            return response.data;
        }
        catch (error) {
            throw new Error(error.response?.data?.message || error.message || 'Request failed');
        }
    }
    // File upload helper
    async uploadFile(url, file, additionalData) {
        try {
            const formData = new FormData();
            formData.append('file', file);
            if (additionalData) {
                Object.entries(additionalData).forEach(([key, value]) => {
                    formData.append(key, value);
                });
            }
            const response = await this.client.post(url, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return response.data;
        }
        catch (error) {
            throw new Error(error.response?.data?.message || error.message || 'Upload failed');
        }
    }
}
// Create and export singleton instance
export const apiClient = new ApiClient();
export default apiClient;
//# sourceMappingURL=client.js.map
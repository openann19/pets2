import type { AxiosRequestConfig } from 'axios';
export interface ApiClientResponse<T = unknown> {
    success: boolean;
    data?: T;
    message?: string;
    error?: string;
}
export interface ApiError {
    message: string;
    code?: string;
    details?: Record<string, unknown>;
    statusCode?: number;
}
export interface RequestConfig {
    timeout?: number;
    retries?: number;
    retryDelay?: number;
    headers?: Record<string, string>;
    params?: Record<string, string | number | boolean>;
}
export interface FileUploadConfig {
    file: File;
    additionalData?: Record<string, string | number | boolean>;
    onProgress?: (progress: number) => void;
    maxFileSize?: number;
    allowedTypes?: string[];
}
declare class ApiClient {
    private client;
    constructor();
    private setupInterceptors;
    get<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<ApiClientResponse<T>>;
    post<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<ApiClientResponse<T>>;
    put<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<ApiClientResponse<T>>;
    patch<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<ApiClientResponse<T>>;
    delete<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<ApiClientResponse<T>>;
    uploadFile<T = unknown>(url: string, config: FileUploadConfig): Promise<ApiClientResponse<T>>;
}
export declare const apiClient: ApiClient;
export default apiClient;

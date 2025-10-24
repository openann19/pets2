import { AxiosRequestConfig } from 'axios';
export interface ApiClientResponse<T = any> {
    success: boolean;
    data?: T;
    message?: string;
    error?: string;
}
declare class ApiClient {
    private client;
    constructor();
    private setupInterceptors;
    get<T = any>(url: string, config?: AxiosRequestConfig): Promise<ApiClientResponse<T>>;
    post<T = any>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<ApiClientResponse<T>>;
    put<T = any>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<ApiClientResponse<T>>;
    patch<T = any>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<ApiClientResponse<T>>;
    delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<ApiClientResponse<T>>;
    uploadFile<T = any>(url: string, file: File, additionalData?: Record<string, any>): Promise<ApiClientResponse<T>>;
}
export declare const apiClient: ApiClient;
export default apiClient;
//# sourceMappingURL=client.d.ts.map
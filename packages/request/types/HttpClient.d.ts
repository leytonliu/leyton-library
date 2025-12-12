import { AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
/**
 * Configuration interface for the HttpClient.
 */
export interface HttpClientConfig {
    /** Base URL for all requests */
    baseURL?: string;
    /** Request timeout in milliseconds */
    timeout?: number;
    /** Key to retrieve the auth token from storage (localStorage) */
    tokenStorageKey?: string;
    /** Whether to send cookies with requests */
    withCredentials?: boolean;
    /** Default headers */
    headers?: Record<string, string>;
    /** Callback for 401 Unauthorized errors */
    onUnauthorized?: () => void;
    /** Callback for other errors */
    onError?: (error: ApiError) => void;
    /** Function to retrieve token dynamically (overrides tokenStorageKey if provided) */
    getToken?: () => string | Promise<string | null> | null;
}
/**
 * Standard API Response structure.
 * Adjust this to match your backend's response format.
 */
export interface ApiResponse<T = unknown> {
    code: number;
    success: boolean;
    message: string;
    data: T;
}
/**
 * Unified API Error type.
 */
export interface ApiError extends Error {
    response?: AxiosResponse<ApiResponse>;
    config?: AxiosRequestConfig;
    code?: string;
    isCancel?: boolean;
    originalError?: AxiosError;
}
export declare class HttpClient {
    private service;
    private config;
    constructor(config?: HttpClientConfig);
    /**
     * Generates a unique key for the request to handle cancellation and deduplication.
     */
    private generateRequestKey;
    private setupInterceptors;
    /**
     * Generic request method.
     */
    request<T = any>(url: string, options?: AxiosRequestConfig): Promise<T>;
    get<T = any>(url: string, params?: Record<string, any>, options?: AxiosRequestConfig): Promise<T>;
    post<T = any>(url: string, data?: any, options?: AxiosRequestConfig): Promise<T>;
    put<T = any>(url: string, data?: any, options?: AxiosRequestConfig): Promise<T>;
    delete<T = any>(url: string, params?: Record<string, any>, options?: AxiosRequestConfig): Promise<T>;
    patch<T = any>(url: string, data?: any, options?: AxiosRequestConfig): Promise<T>;
    upload<T = any>(url: string, file: File | Blob, fieldName?: string, options?: AxiosRequestConfig): Promise<T>;
    cancelAllRequests(message?: string): void;
    getRequestKey(config: AxiosRequestConfig): string;
}
export default HttpClient;

import axios, {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  CancelTokenSource,
  InternalAxiosRequestConfig,
} from 'axios';
import { uniAdapter } from './uni-adapter';

declare const uni: any;
declare const wx: any;

// --- Interfaces ---

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

// --- Request Cancellation Management ---
const pendingRequests = new Map<string, CancelTokenSource>();

export class HttpClient {
  private service: AxiosInstance;
  private config: Required<HttpClientConfig>;

  constructor(config: HttpClientConfig = {}) {
    this.config = {
      baseURL: '',
      timeout: 15000,
      tokenStorageKey: 'token',
      withCredentials: false,
      headers: {},
      onUnauthorized: () => {
      },
      onError: () => {
      },
      getToken: null,
      ...config,
    } as Required<HttpClientConfig>;

    const instanceConfig: AxiosRequestConfig = {
      baseURL: this.config.baseURL,
      timeout: this.config.timeout,
      withCredentials: this.config.withCredentials,
      headers: {
        'Content-Type': 'application/json;charset=utf-8',
        ...this.config.headers,
      },
    };

    // Environment detection for UniApp / WeChat MiniProgram
    const isUniAppOrMiniProgram = typeof uni !== 'undefined' || typeof wx !==
      'undefined';
    if (isUniAppOrMiniProgram) {
      instanceConfig.adapter = uniAdapter;
    }

    this.service = axios.create(instanceConfig);
    this.setupInterceptors();
  }

  /**
   * Generates a unique key for the request to handle cancellation and deduplication.
   */
  private generateRequestKey(config: AxiosRequestConfig): string {
    const {method, url, params, data} = config;
    // Note: JSON.stringify is not stable for object key order.
    // For production use with heavy caching, consider a stable stringify function.
    return `${method}:${url}:${JSON.stringify(params)}:${JSON.stringify(data)}`;
  }

  private setupInterceptors(): void {
    // --- Request Interceptor ---
    this.service.interceptors.request.use(
      async (config: InternalAxiosRequestConfig) => {
        // 1. Attach Token
        let token: string | null = null;
        if (this.config.getToken) {
          token = await this.config.getToken();
        } else if (typeof localStorage !== 'undefined' &&
          this.config.tokenStorageKey) {
          token = localStorage.getItem(this.config.tokenStorageKey);
        }

        if (token) {
          config.headers.set('Authorization', `Bearer ${token}`);
        }

        // 2. Cancellation & Deduplication
        const requestKey = this.generateRequestKey(config);
        if (pendingRequests.has(requestKey)) {
          const source = pendingRequests.get(requestKey)!;
          source.cancel(`Request cancelled by new same request: ${requestKey}`);
          pendingRequests.delete(requestKey);
        }

        const source = axios.CancelToken.source();
        config.cancelToken = source.token;
        pendingRequests.set(requestKey, source);

        return config;
      },
      (error) => Promise.reject(error),
    );

    // --- Response Interceptor ---
    this.service.interceptors.response.use(
      ((response: AxiosResponse<ApiResponse>) => {
        const requestKey = this.generateRequestKey(response.config);
        pendingRequests.delete(requestKey);

        const res = response.data;
        console.log('res.code', res.code);
        // Adjust success condition based on your backend
        if (res.code === 200 || res.success === true) {
          return res.data; // Return the inner data directly
        }

        // Handle logical errors (e.g., business logic failure but HTTP 200)
        if (res.code === 401) {
          this.config.onUnauthorized();
        }

        const error = new Error(
          res.message || 'Business Logic 2Error') as ApiError;
        error.response = response;
        error.config = response.config;
        return Promise.reject(error);
      }) as any,
      (error: AxiosError<ApiResponse>) => {
        if (axios.isCancel(error)) {
          // Wrap cancel error
          const cancelError = new Error(error.message) as ApiError;
          cancelError.isCancel = true;
          return Promise.reject(cancelError);
        }

        if (error.config) {
          const requestKey = this.generateRequestKey(error.config);
          pendingRequests.delete(requestKey);
        }

        // Create a unified ApiError
        const apiError: ApiError = new Error(error.message || 'Network Error');
        apiError.response = error.response;
        apiError.config = error.config;
        apiError.code = error.code;
        apiError.originalError = error;

        if (error.response?.status === 401) {
          this.config.onUnauthorized();
        }

        this.config.onError(apiError);

        // Optional: Log error
        // console.error(`[HttpClient]:`, apiError);

        return Promise.reject(apiError);
      },
    );
  }

  /**
   * Generic request method.
   */
  public request<T = any>(
    url: string, options: AxiosRequestConfig = {}): Promise<T> {
    return this.service.request<any, T>({
      url,
      method: 'GET',
      ...options,
    });
  }

  public get<T = any>(
    url: string, params?: Record<string, any>,
    options?: AxiosRequestConfig): Promise<T> {
    return this.request<T>(url, {...options, method: 'GET', params});
  }

  public post<T = any>(
    url: string, data?: any, options?: AxiosRequestConfig): Promise<T> {
    return this.request<T>(url, {...options, method: 'POST', data});
  }

  public put<T = any>(
    url: string, data?: any, options?: AxiosRequestConfig): Promise<T> {
    return this.request<T>(url, {...options, method: 'PUT', data});
  }

  public delete<T = any>(
    url: string, params?: Record<string, any>,
    options?: AxiosRequestConfig): Promise<T> {
    return this.request<T>(url, {...options, method: 'DELETE', params});
  }

  public patch<T = any>(
    url: string, data?: any, options?: AxiosRequestConfig): Promise<T> {
    return this.request<T>(url, {...options, method: 'PATCH', data});
  }

  public cancelAllRequests(message: string = 'All requests manually cancelled'): void {
    pendingRequests.forEach((source) => source.cancel(message));
    pendingRequests.clear();
  }

  public getRequestKey(config: AxiosRequestConfig): string {
    return this.generateRequestKey(config);
  }
}

export default HttpClient;

/**
 * Miniprogram network utilities
 */
export interface RequestOptions {
    url: string;
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
    data?: any;
    header?: Record<string, string>;
    timeout?: number;
}
/**
 * 发起网络请求
 */
export declare function request<T = any>(options: RequestOptions): Promise<T>;
/**
 * GET请求
 */
export declare function get<T = any>(url: string, data?: any, header?: Record<string, string>): Promise<T>;
/**
 * POST请求
 */
export declare function post<T = any>(url: string, data?: any, header?: Record<string, string>): Promise<T>;
/**
 * 上传文件
 */
export declare function uploadFile(url: string, filePath: string, name: string, formData?: Record<string, any>): Promise<WechatMiniprogram.UploadFileSuccessCallbackResult>;
/**
 * 下载文件
 */
export declare function downloadFile(url: string): Promise<WechatMiniprogram.DownloadFileSuccessCallbackResult>;

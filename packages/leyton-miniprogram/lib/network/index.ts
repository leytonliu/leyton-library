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
export function request<T = any>(options: RequestOptions): Promise<T> {
  return new Promise((resolve, reject) => {
    wx.request({
      url: options.url,
      method: options.method || 'GET',
      data: options.data,
      header: options.header,
      timeout: options.timeout,
      success: (res) => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(res.data as T);
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${res.errMsg}`));
        }
      },
      fail: reject
    });
  });
}

/**
 * GET请求
 */
export function get<T = any>(url: string, data?: any, header?: Record<string, string>): Promise<T> {
  return request<T>({
    url,
    method: 'GET',
    data,
    header
  });
}

/**
 * POST请求
 */
export function post<T = any>(url: string, data?: any, header?: Record<string, string>): Promise<T> {
  return request<T>({
    url,
    method: 'POST',
    data,
    header
  });
}

/**
 * 上传文件
 */
export function uploadFile(
  url: string,
  filePath: string,
  name: string,
  formData?: Record<string, any>
): Promise<WechatMiniprogram.UploadFileSuccessCallbackResult> {
  return new Promise((resolve, reject) => {
    wx.uploadFile({
      url,
      filePath,
      name,
      formData,
      success: resolve,
      fail: reject
    });
  });
}

/**
 * 下载文件
 */
export function downloadFile(url: string): Promise<WechatMiniprogram.DownloadFileSuccessCallbackResult> {
  return new Promise((resolve, reject) => {
    wx.downloadFile({
      url,
      success: resolve,
      fail: reject
    });
  });
}
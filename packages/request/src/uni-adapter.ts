import { AxiosPromise, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios';

declare const uni: {
  request: (options: any) => any;
};

declare const wx: {
  request: (options: any) => any;
};

/**
 * Axios Adapter for uni-app / WeChat MiniProgram
 * Maps Axios config to uni.request or wx.request calls.
 */
export function uniAdapter(config: AxiosRequestConfig): AxiosPromise {
  const requestApi = typeof uni !== 'undefined' ? uni.request : (typeof wx !== 'undefined' ? wx.request : null);

  if (!requestApi) {
    return Promise.reject(new Error('Environment not supported: uni.request or wx.request not found.'));
  }

  return new Promise((resolve, reject) => {
    // Construct full URL
    let url = config.url || '';
    if (config.baseURL && !/^https?:\/\//.test(url)) {
       url = config.baseURL + url;
    }

    const requestTask = requestApi({
      url: url,
      method: (config.method || 'GET').toUpperCase(),
      data: config.data || config.params, // uni.request uses 'data' for both body and query params depending on method
      header: config.headers,
      timeout: config.timeout,
      dataType: 'json',
      responseType: config.responseType === 'arraybuffer' ? 'arraybuffer' : 'text', // support arraybuffer
      success: (res: any) => {
        const response: AxiosResponse = {
          data: res.data,
          status: res.statusCode,
          statusText: String(res.statusCode),
          headers: res.header,
          config: config as InternalAxiosRequestConfig,
          request: requestTask,
        };
        settle(resolve, reject, response);
      },
      fail: (err: any) => {
        const error = new Error(err.errMsg || 'Request Business Logic Error via uni.request/wx.request') as any;
        error.request = requestTask;
        error.config = config;
        reject(error);
      },
    });

    if (config.cancelToken) {
      config.cancelToken.promise.then((cancel) => {
        if (!requestTask) {
          return;
        }
        requestTask.abort();
        reject(cancel);
      });
    }
  });
}

/**
 * Standard settle helper from axios (simplified)
 */
function settle(resolve: (value: AxiosResponse | PromiseLike<AxiosResponse>) => void, reject: (reason?: any) => void, response: AxiosResponse) {
  const validateStatus = response.config.validateStatus;
  if (!response.status || !validateStatus || validateStatus(response.status)) {
    resolve(response);
  } else {
    reject(new Error(`Request failed with status code ${response.status}`));
  }
}

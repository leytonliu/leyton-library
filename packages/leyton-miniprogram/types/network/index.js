/**
 * Miniprogram network utilities
 */
/**
 * 发起网络请求
 */
export function request(options) {
    return new Promise((resolve, reject) => {
        wx.request({
            url: options.url,
            method: options.method || 'GET',
            data: options.data,
            header: options.header,
            timeout: options.timeout,
            success: (res) => {
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    resolve(res.data);
                }
                else {
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
export function get(url, data, header) {
    return request({
        url,
        method: 'GET',
        data,
        header
    });
}
/**
 * POST请求
 */
export function post(url, data, header) {
    return request({
        url,
        method: 'POST',
        data,
        header
    });
}
/**
 * 上传文件
 */
export function uploadFile(url, filePath, name, formData) {
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
export function downloadFile(url) {
    return new Promise((resolve, reject) => {
        wx.downloadFile({
            url,
            success: resolve,
            fail: reject
        });
    });
}

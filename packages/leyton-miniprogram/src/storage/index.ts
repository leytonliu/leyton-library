/**
 * Miniprogram storage utilities
 */

/**
 * 设置本地存储
 */
export function setStorage<T>(key: string, data: T): Promise<void> {
  return new Promise((resolve, reject) => {
    wx.setStorage({
      key,
      data,
      success: () => resolve(),
      fail: reject
    });
  });
}

/**
 * 获取本地存储
 */
export function getStorage<T>(key: string): Promise<T> {
  return new Promise((resolve, reject) => {
    wx.getStorage({
      key,
      success: (res) => resolve(res.data as T),
      fail: reject
    });
  });
}

/**
 * 删除本地存储
 */
export function removeStorage(key: string): Promise<void> {
  return new Promise((resolve, reject) => {
    wx.removeStorage({
      key,
      success: () => resolve(),
      fail: reject
    });
  });
}

/**
 * 清空本地存储
 */
export function clearStorage(): Promise<void> {
  return new Promise((resolve, reject) => {
    wx.clearStorage({
      success: () => resolve(),
      fail: reject
    });
  });
}

/**
 * 获取存储信息
 */
export function getStorageInfo(): Promise<WechatMiniprogram.GetStorageInfoSuccessCallbackOption> {
  return new Promise((resolve, reject) => {
    wx.getStorageInfo({
      success: (res) => resolve(res),
      fail: reject
    });
  });
}
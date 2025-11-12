/**
 * Miniprogram utility functions
 */

/**
 * 获取系统信息
 */
export function getSystemInfo(): Promise<WechatMiniprogram.SystemInfo> {
  return new Promise((resolve, reject) => {
    wx.getSystemInfo({
      success: (res) => resolve(res),
      fail: reject
    });
  });
}

/**
 * 显示Toast消息
 */
export function showToast(title: string, icon: 'success' | 'error' | 'loading' | 'none' = 'none', duration = 2000) {
  wx.showToast({
    title,
    icon,
    duration
  });
}

/**
 * 显示加载中
 */
export function showLoading(title = '加载中...') {
  wx.showLoading({
    title,
    mask: true
  });
}

/**
 * 隐藏加载中
 */
export function hideLoading() {
  wx.hideLoading();
}

/**
 * 显示确认对话框
 */
export function showModal(
  title: string,
  content: string,
  confirmText = '确定',
  cancelText = '取消'
): Promise<boolean> {
  return new Promise((resolve) => {
    wx.showModal({
      title,
      content,
      confirmText,
      cancelText,
      success: (res) => {
        resolve(res.confirm);
      }
    });
  });
}
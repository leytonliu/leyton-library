/**
 * Miniprogram utility functions
 */
/**
 * 获取系统信息
 */
export declare function getSystemInfo(): Promise<WechatMiniprogram.SystemInfo>;
/**
 * 显示Toast消息
 */
export declare function showToast(title: string, icon?: 'success' | 'error' | 'loading' | 'none', duration?: number): void;
/**
 * 显示加载中
 */
export declare function showLoading(title?: string): void;
/**
 * 隐藏加载中
 */
export declare function hideLoading(): void;
/**
 * 显示确认对话框
 */
export declare function showModal(title: string, content: string, confirmText?: string, cancelText?: string): Promise<boolean>;

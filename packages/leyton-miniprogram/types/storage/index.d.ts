/**
 * Miniprogram storage utilities
 */
/**
 * 设置本地存储
 */
export declare function setStorage<T>(key: string, data: T): Promise<void>;
/**
 * 获取本地存储
 */
export declare function getStorage<T>(key: string): Promise<T>;
/**
 * 删除本地存储
 */
export declare function removeStorage(key: string): Promise<void>;
/**
 * 清空本地存储
 */
export declare function clearStorage(): Promise<void>;
/**
 * 获取存储信息
 */
export declare function getStorageInfo(): Promise<WechatMiniprogram.GetStorageInfoSuccessCallbackOption>;

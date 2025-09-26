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
export declare function getStorage<T>(key: string): Promise<T | null>;
/**
 * 异步获取本地存储
 */
export declare function getStorageInfo(): Promise<WechatMiniprogram.GetStorageInfoSuccessCallbackOption>;
/**
 * 删除本地存储
 */
export declare function removeStorage(key: string): Promise<void>;
/**
 * 清空本地存储
 */
export declare function clearStorage(): Promise<void>;
/**
 * 存储 Access Token 和 Refresh Token
 * @param accessToken
 * @param refreshToken
 */
export declare function setTokens({ accessToken, refreshToken }: {
    accessToken: string;
    refreshToken: string;
}): Promise<void>;
/**
 * 获取 Access Token
 */
export declare function getAccessToken(): Promise<string | null>;
/**
 * 获取 Refresh Token
 */
export declare function getRefreshToken(): Promise<string | null>;
/**
 * 清除所有 Token
 */
export declare function clearTokens(): Promise<void>;

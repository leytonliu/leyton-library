/**
 * Miniprogram storage utilities
 */
const ACCESS_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';
/**
 * 设置本地存储
 */
export function setStorage(key, data) {
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
export function getStorage(key) {
    return new Promise((resolve, reject) => {
        wx.getStorage({
            key,
            success: (res) => resolve(res.data),
            // 小程序中，如果 key 不存在，会进入 fail 回调
            fail: () => resolve(null)
        });
    });
}
/**
 * 异步获取本地存储
 */
export function getStorageInfo() {
    return new Promise((resolve, reject) => {
        wx.getStorageInfo({
            success: (res) => resolve(res),
            fail: reject
        });
    });
}
/**
 * 删除本地存储
 */
export function removeStorage(key) {
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
export function clearStorage() {
    return new Promise((resolve, reject) => {
        wx.clearStorage({
            success: () => resolve(),
            fail: reject
        });
    });
}
// --- Token Specific Functions ---
/**
 * 存储 Access Token 和 Refresh Token
 * @param accessToken
 * @param refreshToken
 */
export async function setTokens({ accessToken, refreshToken }) {
    await Promise.all([
        setStorage(ACCESS_TOKEN_KEY, accessToken),
        setStorage(REFRESH_TOKEN_KEY, refreshToken)
    ]);
}
/**
 * 获取 Access Token
 */
export function getAccessToken() {
    return getStorage(ACCESS_TOKEN_KEY);
}
/**
 * 获取 Refresh Token
 */
export function getRefreshToken() {
    return getStorage(REFRESH_TOKEN_KEY);
}
/**
 * 清除所有 Token
 */
export async function clearTokens() {
    await Promise.all([
        removeStorage(ACCESS_TOKEN_KEY),
        removeStorage(REFRESH_TOKEN_KEY)
    ]);
}

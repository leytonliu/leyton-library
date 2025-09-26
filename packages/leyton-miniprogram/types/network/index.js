import axios from 'axios';
import { getAccessToken, getRefreshToken, setTokens, clearTokens } from '../storage';
// --- 配置 --- //
// 刷新 token 的 API 地址
const REFRESH_TOKEN_URL = '/api/auth/refresh';
// 不需要携带 token 的 API 地址白名单
const API_WHITE_LIST = [REFRESH_TOKEN_URL, '/api/auth/login'];
// --- 变量 --- //
// 是否正在刷新 token 的标志，防止重复刷新
let isRefreshing = false;
// 因 token 失效而等待重发的请求队列
let failedQueue = [];
// --- 内部函数 --- //
/**
 * 处理等待中的请求队列
 * @param error - 如果刷新失败，则为错误对象
 * @param newAccessToken - 如果刷新成功，则为新的 access token
 */
const processQueue = (error, newAccessToken = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        }
        else {
            prom.resolve(newAccessToken);
        }
    });
    failedQueue = [];
};
// --- Axios 实例 --- //
const service = axios.create({
    // 在小程序中，baseURL 通常在实际请求时动态设置或为空
    // baseURL: 'https://your-api-domain.com/api',
    timeout: 10000, // 请求超时
});
// --- 拦截器 --- //
// 请求拦截器
service.interceptors.request.use(async (config) => {
    // 1. 如果是白名单中的 URL，则直接发送请求
    if (API_WHITE_LIST.includes(config.url || '')) {
        return config;
    }
    // 2. 获取 Access Token
    const accessToken = await getAccessToken();
    // 3. 如果存在 Token，则添加到请求头中
    if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});
// 响应拦截器
service.interceptors.response.use((response) => {
    // 直接返回响应数据
    return response.data;
}, async (error) => {
    const originalRequest = error.config;
    // 1. 如果错误不是 401，或者请求是白名单地址，则直接抛出错误
    if (error.response?.status !== 401 || API_WHITE_LIST.includes(originalRequest.url || '')) {
        return Promise.reject(error);
    }
    // 2. 如果正在刷新 token，则将当前失败的请求加入队列等待
    if (isRefreshing) {
        return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
        })
            .then(newAccessToken => {
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            return service(originalRequest); // 使用新的 token 重新发送原始请求
        })
            .catch(err => {
            return Promise.reject(err);
        });
    }
    // 3. 开始刷新 token
    isRefreshing = true;
    const refreshToken = await getRefreshToken();
    // 4. 如果没有 Refresh Token，则认证失败，清空 token 并重定向到登录页
    if (!refreshToken) {
        isRefreshing = false;
        await clearTokens();
        // 在小程序中，通常使用 wx.reLaunch 跳转
        wx.reLaunch({ url: '/pages/login/index' });
        return Promise.reject(new Error('Refresh token not found, redirecting to login.'));
    }
    // 5. 发起刷新请求
    try {
        const refreshResponse = await axios.post(REFRESH_TOKEN_URL, { refreshToken });
        const { accessToken: newAccessToken, refreshToken: newRefreshToken } = refreshResponse.data;
        // 6. 存储新的 tokens
        await setTokens({ accessToken: newAccessToken, refreshToken: newRefreshToken });
        // 7. 用新 token 重试原始请求
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        // 8. 处理因 token 失效而挂起的请求队列
        processQueue(null, newAccessToken);
        return service(originalRequest);
    }
    catch (refreshError) {
        // 9. 如果刷新 token 失败，则认证彻底失败
        await clearTokens();
        processQueue(refreshError, null);
        wx.reLaunch({ url: '/pages/login/index' });
        return Promise.reject(refreshError);
    }
    finally {
        isRefreshing = false;
    }
});
export default service;

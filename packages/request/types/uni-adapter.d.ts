import { AxiosPromise, AxiosRequestConfig } from 'axios';
/**
 * Axios Adapter for uni-app / WeChat MiniProgram
 * Maps Axios config to uni.request or wx.request calls.
 */
export declare function uniAdapter(config: AxiosRequestConfig): AxiosPromise;

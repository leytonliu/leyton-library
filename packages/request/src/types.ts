import type { AxiosRequestConfig, AxiosResponse } from 'axios'

export interface RequestOptions {
  // Whether to process the request result
  isReturnNativeResponse?: boolean
  // Whether to join url
  joinPrefix?: boolean
  // Interface address, use the default apiUrl if you leave it blank
  apiUrl?: string
  // Error message prompt type
  errorMessageMode?: 'none' | 'modal'
}

export interface RequestResult<T = any> {
  code: number
  type: 'success' | 'error' | 'warning'
  message: string
  result: T
}

export interface RequestConfig<T = any> extends AxiosRequestConfig {
  data?: T
  options?: RequestOptions
}

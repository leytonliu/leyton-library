import axios from 'axios'
import type { AxiosInstance, AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios'
import type { RequestConfig, RequestResult, RequestOptions } from './types'

const DEFAULT_REQUEST_OPTIONS: RequestOptions = {
  isReturnNativeResponse: false,
  joinPrefix: true,
  errorMessageMode: 'modal'
}

class Request {
  private instance: AxiosInstance
  private readonly options: RequestOptions

  constructor(options: RequestConfig) {
    this.instance = axios.create(options)
    this.options = { ...DEFAULT_REQUEST_OPTIONS, ...options.options }

    this.setupInterceptors()
  }

  private setupInterceptors() {
    this.instance.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        // Add platform-specific logic here if needed
        // For example, in uni-app, you might need to add a loading indicator
        return config
      },
      (error: AxiosError) => {
        return Promise.reject(error)
      }
    )

    this.instance.interceptors.response.use(
      (response: AxiosResponse<RequestResult>) => {
        if (response.config.options?.isReturnNativeResponse) {
          return response
        }
        const { data } = response
        // Unified error handling
        if (data.code !== 0) {
          // Handle error message based on errorMessageMode
          if (response.config.options?.errorMessageMode === 'modal') {
            // TODO: Implement modal display
            console.error(data.message)
          } else if (response.config.options?.errorMessageMode === 'none') {
            // Do nothing
          }
          return Promise.reject(new Error(data.message))
        }
        return data.result
      },
      (error: AxiosError<RequestResult>) => {
        // Handle HTTP errors
        if (error.response) {
          const { data, status } = error.response
          if (response.config.options?.errorMessageMode === 'modal') {
            // TODO: Implement modal display
            console.error(`Error: ${status} - ${data?.message || error.message}`)
          } else if (response.config.options?.errorMessageMode === 'none') {
            // Do nothing
          }
        } else if (error.request) {
          // Request was made but no response was received
          console.error('No response received', error.message)
        } else {
          // Something happened in setting up the request that triggered an Error
          console.error('Error', error.message)
        }
        return Promise.reject(error)
      }
    )
  }

  get<T = any>(url: string, config?: RequestConfig): Promise<T> {
    return this.instance.get(url, config)
  }

  post<T = any>(url: string, data?: any, config?: RequestConfig): Promise<T> {
    return this.instance.post(url, data, config)
  }

  put<T = any>(url: string, data?: any, config?: RequestConfig): Promise<T> {
    return this.instance.put(url, data, config)
  }

  delete<T = any>(url: string, config?: RequestConfig): Promise<T> {
    return this.instance.delete(url, config)
  }
}

export default Request

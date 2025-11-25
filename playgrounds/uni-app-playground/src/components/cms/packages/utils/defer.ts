/**
 * 定义 Deferred 对象的接口
 */
export interface Deferred<T> {
  promise: Promise<T>;
  resolve: (value: T | PromiseLike<T>) => void;
  reject: (reason?: any) => void;
}

/**
 * 创建一个 Deferred 对象
 * 允许在 Promise 构造函数外部控制 resolve 和 reject
 */
export const defer = <T = any>(): Deferred<T> => {
  const dfd = {} as Deferred<T>;
  
  dfd.promise = new Promise<T>((resolve, reject) => {
    dfd.resolve = resolve;
    dfd.reject = reject;
  });
  
  return dfd;
};
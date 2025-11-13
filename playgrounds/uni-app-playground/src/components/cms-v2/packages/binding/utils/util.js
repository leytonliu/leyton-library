import env from '@/env/index';

let prefix = null;

/**
 * 获取资源的静态路径（补充oss前缀）
 * @author  韦胜健
 * @date    2022/9/19 20:46
 */
export function getOssImagePrefix(url) {
  if (!prefix) {
    prefix = env.OSS_URL;
  }
  return `${prefix}${url || ''}`;
}

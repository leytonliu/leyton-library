import { CSSProperties } from 'vue';

/**
 * 将驼峰命名（camelCase / PascalCase）字符串
 * 转换为中划线命名（kebab-case）字符串。
 *
 * 例如：
 *   backgroundColor → background-color
 *   WebkitTransform → -webkit-transform
 *   FontSize → font-size
 *
 * @param str - 要转换的字符串
 * @returns 转换后的 kebab-case 字符串
 */
export const kebabCase = (str: string): string => {
  if (str.length > 1 && /[A-Z]/.test(str.charAt(0))) {
    str = str.charAt(0).toLowerCase() + str.substring(1);
  }
  return str.replace(/[A-Z]/g, (i) => '-' + i.toLowerCase());
};

/**
 * 将样式对象（例如 { backgroundColor: 'red', fontSize: '14px' }）
 * 转换成内联样式字符串（"background-color:red;font-size:14px"）
 * 会自动将驼峰命名转化为中划线命名
 *
 * @param CSSProperties - 样式对象或字符串
 * @returns string | null - 转换后的样式字符串
 */
export const convertStyleToString = (styleObject: CSSProperties) => {
  if (styleObject == null) {
    return styleObject;
  }
  if (typeof styleObject == 'string') {
    return styleObject;
  }
  return Object.entries(styleObject)
    .reduce<string[]>((prev, [key, value]) => {
      // 忽略 undefined 或 null 值
      if (value != null) {
        prev.push(`${kebabCase(key)}:${value}`);
      }
      return prev;
    }, [])
    .join(';');
};

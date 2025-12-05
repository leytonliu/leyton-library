import { CSSProperties } from 'vue';
import { CmsComponentData } from '../../cms';

/**
 * 按顺序获取第一个“有效”的值 (即非 null 且非 undefined 的值)。
 * @param args - 任意数量的参数
 * @returns 第一个有效值，如果全无效则返回 undefined
 */
export const getFirstDefinedValue = (...args: any[]): any => {
  for (const arg of args) {
    // 检查非 null 且非 undefined 的值
    if (arg !== null && arg !== undefined) {
      return arg; // 立即返回
    }
  }
  return undefined;
};

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
  // 特殊处理 Vendor 前缀 (如 Webkit, Moz)，保留首字母大写以便生成前缀 dash (e.g. -webkit-)
  const isVendorPrefix = /^(Webkit|Moz|O|ms)/.test(str);

  if (!isVendorPrefix && str.length > 1 && /[A-Z]/.test(str.charAt(0))) {
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
      // 忽略 undefined 或 null 值, 优化 url('undefined') 问题
      if (value === null || value === undefined) {
        return prev;
      }
      const strValue = String(value).trim();
      if (strValue === '') {
        return prev;
      }
      if (
        strValue === 'undefined' ||
        strValue === 'null' ||
        strValue.includes("('undefined')") || // 针对 url('undefined')
        strValue.includes('("undefined")') ||
        strValue.includes("('null')")
      ) {
        console.warn(`[Style Warn] 忽略了无效样式: ${key}: ${value}`);
        return prev;
      }
      if (typeof value === 'number' && isNaN(value)) {
        return prev;
      }
      prev.push(`${kebabCase(key)}:${strValue}`);
      return prev;
    }, [])
    .join(';');
};

/**
 * 深度递归遍历一个对象/数组
 * @param target 要遍历的目标
 * @param handler (key: string, value: any) => void
 */
function deepIterate(
  target: any,
  handler: (key: string, value: any) => void
): void {
  // 终止条件：如果不是对象或数组 (或为 null)，则停止递归
  if (target === null || typeof target !== 'object') {
    return;
  }

  // 递归遍历
  // Object.entries 对数组和对象都有效
  Object.entries(target).forEach(([key, value]) => {
    // 1. 对当前键值对执行 handler
    handler(key, value);

    // 2. [Bug 修复] 对“值”进行递归 (原版递归方式混乱且低效)
    deepIterate(value, handler);
  });
}

/**
 * 获取所有的子节点数据 (合并 childrenData 和 readonlyData 中的)
 */
export function getAllChildrenData(
  componentData: CmsComponentData
): CmsComponentData[] {
  // 明确 childrenData 的类型
  const childrenData: CmsComponentData[] = [
    ...(componentData.childrenData || []),
  ];

  if (componentData.readonlyData) {
    deepIterate(componentData.readonlyData, (key: string, value: any) => {
      // [类型增强] 确保 value 是一个数组
      if (key === 'childrenData' && Array.isArray(value)) {
        // 确保 value 数组中的元素是 CmsComponentData
        childrenData.push(...(value as CmsComponentData[]));
      }
    });
  }
  return childrenData;
}

/**
 * 访问者函数 (fn) 的类型签名
 * @param componentData 当前组件
 * @param childrenData 当前组件所在的数组
 * @returns boolean | void - 如果返回 true, 则提前终止遍历
 */
type IterateFn = (
  componentData: CmsComponentData,
  childrenData: CmsComponentData[]
) => boolean | void | undefined;

/**
 * 遍历树的私有辅助函数 (原版的 iterator)
 */
const traverse = (fn: IterateFn, childrenData: CmsComponentData[]): void => {
  if (!Array.isArray(childrenData)) {
    return;
  }

  for (let i = 0; i < childrenData.length; i++) {
    const componentData = childrenData[i];
    if (!componentData) {
      continue;
    }

    // 1. 对当前组件执行 fn
    const flag = fn(componentData, childrenData);
    if (flag) {
      return; // 提前终止
    }

    // 2. 获取所有子节点 (包括 readonlyData 中的)
    const allChildrenData = getAllChildrenData(componentData);

    // 3. 递归进入子节点
    if (allChildrenData.length > 0) {
      traverse(fn, allChildrenData);
    }
  }
};

/**
 * 导出：遍历 CMS 组件数据的公共函数
 * (原版的 iterateComponentData, 已移除 IIFE)
 */
export const iterateComponentData = (
  fn: IterateFn,
  childrenData: CmsComponentData[]
): void => {
  traverse(fn, childrenData);
};

/**
 * 创建一个“父节点地图”。
 */
export const buildParentMapper = (pageConfig: CmsPageConfig) => {
  const mapper: Record<string, CmsComponentData> = {};

  if (!pageConfig || !pageConfig.childrenData) {
    return { value: mapper };
  }

  // 定义遍历时执行的回调
  const visitor = (parent: CmsComponentData) => {
    parent.childrenData?.forEach((child: CmsComponentData) => {
      if (child) {
        // 使用 if(child) 更清晰
        mapper[child.componentId] = parent;
      }
    });
  };

  // 执行遍历
  iterateComponentData(visitor, pageConfig.childrenData);

  // 保持您原有的 { value: ... } 返回结构
  return { value: mapper };
};

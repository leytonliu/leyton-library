import { CSSProperties } from 'vue';
import { CmsComponentData, CmsPageConfig } from '../cms';
/**
 * 按顺序获取第一个“有效”的值 (即非 null 且非 undefined 的值)。
 * @param args - 任意数量的参数
 * @returns 第一个有效值，如果全无效则返回 undefined
 */
export declare const getFirstDefinedValue: (...args: any[]) => any;
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
export declare const kebabCase: (str: string) => string;
/**
 * 将样式对象（例如 { backgroundColor: 'red', fontSize: '14px' }）
 * 转换成内联样式字符串（"background-color:red;font-size:14px"）
 * 会自动将驼峰命名转化为中划线命名
 *
 * @param CSSProperties - 样式对象或字符串
 * @returns string | null - 转换后的样式字符串
 */
export declare const convertStyleToString: (styleObject: CSSProperties) => string;
/**
 * 获取所有的子节点数据 (合并 childrenData 和 readonlyData 中的)
 */
export declare function getAllChildrenData(componentData: CmsComponentData): CmsComponentData[];
/**
 * 访问者函数 (fn) 的类型签名
 * @param componentData 当前组件
 * @param childrenData 当前组件所在的数组
 * @returns boolean | void - 如果返回 true, 则提前终止遍历
 */
type IterateFn = (componentData: CmsComponentData, childrenData: CmsComponentData[]) => boolean | void | undefined;
/**
 * 导出：遍历 CMS 组件数据的公共函数
 * (原版的 iterateComponentData, 已移除 IIFE)
 */
export declare const iterateComponentData: (fn: IterateFn, childrenData: CmsComponentData[]) => void;
/**
 * 创建一个“父节点地图”。
 */
export declare const buildParentMapper: (pageConfig: CmsPageConfig) => {
    value: Record<string, CmsComponentData>;
};
export {};

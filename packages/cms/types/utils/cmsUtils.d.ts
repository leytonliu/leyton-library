import { CmsComponentData, CmsBindingValueManager } from '../cms';
/**
 * 判断组件数据是否可见
 * @param data 组件数据
 * @param bindingManager (可选) 绑定管理器，用于解析 @@绑定值
 */
export declare function checkComponentVisible(data: CmsComponentData, bindingValue?: CmsBindingValueManager): boolean;

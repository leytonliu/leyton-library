// cms.ts
import type { CSSProperties } from 'vue';

/**
 * 页面配置（最外层 CMS 页面结构）
 */
export interface CmsPageConfig {
  name: string; // 页面名称
  style: CSSProperties;
  childrenData: CmsComponentConfig[]; // 页面内组件树
  [key: string]: any; // 允许动态扩展字段
}

/**
 * 组件配置（CMS 组件的基础定义）
 */
export interface CmsComponentConfig {
  componentId: string; // 组件唯一 ID
  componentCode: string; // 组件编码（标识类型）
  componentName: string; // 组件展示名
  data: CmsComponentData; // 组件绑定数据
  style: CSSProperties; // 样式配置
  childrenData: CmsComponentConfig[]; // 嵌套子组件（可选）
  actions?: CmsActionConfig; // 组件行为配置
  [key: string]: any;
}

/**
 * 组件绑定的数据结构（通常来自 CMS 配置的字段）
 */
export interface CmsComponentData {
  [key: string]: any;
}

/**
 * 组件行为配置（点击、跳转、埋点等）
 */
export interface CmsActionConfig {
  code: string; // 行为类型（例如 "navigate"、"popup"）
  data: any; // 行为参数
  [key: string]: any;
}

/**
 * 环境配置（全局 CMS 运行环境）
 */
export interface CmsEnvConfig {
  [key: string]: any;
}

export interface CmsBaseComponentProps {
  data: CmsComponentConfig; // 节点数据
  index: number; // 节点数据在数组中的索引
  childrenStyles?: CSSProperties; // 父节点设置子节点（当前节点的）样式
  autoGetRect?: string; // 父组件是否需要当前子节点自动获取高度
  isFirstFloorNode?: boolean; // 是否是第一层节点
  isHidden?: boolean | null; // 节点是否隐藏
}

export interface UseCmsComponentOptions {
  /**
   * 一个可选函数，用于在最后阶段调整最终的样式对象
   * @param styles 计算得出的 CSSProperties 对象
   * @returns 调整后的 CSSProperties 对象
   */
  adjustStyles?: (styles: CSSProperties) => CSSProperties | void | undefined;

  /**
   * 是否为Base Component，用于区分是 CMS 组件还是 cms-base-component
   *
   */
  isBaseComponent?: boolean;
}

export interface CmsBindingValueConfig {
  code: string;
  name: string;
  getter: (data: CmsComponentData) => { done: boolean; val: any };
}
export type CmsParentMapperWrapper = {
  value: Record<string, CmsComponentData>;
};

export interface CmsBindingValueManager {
  state: { configs: CmsBindingValueConfig[] };
  registry: (config: CmsBindingValueConfig) => void;
  getBindingValue: (value: string, data: CmsComponentData) => any;
  actualParentMapper: CmsParentMapperWrapper;
  // (以后还可以加上 fakeDataManager)
}

export type CmsBindingPlugin = (params: {
  bindingValue: CmsBindingValueManager;
}) => void;

/**
 * Cms Action 相关
 */
export interface CmsActionState {
  configs: Record<string, CmsActionHandler>;
}

export type CmsActionHandler = (
  data: CmsComponentData,
  bindValue?: CmsBindingValueManager
) => void;
export interface CmsActionRenderManager {
  registryActionRender: (
    actionCode: string, // 动作的唯一标识 (如 'bind-weapp-page')
    handler: CmsActionHandler // 触发时执行的函数
  ) => void;
  handleTapBaseContainer: (data: CmsComponentData) => void;
}
export interface CmsCustomActionParams {
  actionRender: CmsActionRenderManager;
}

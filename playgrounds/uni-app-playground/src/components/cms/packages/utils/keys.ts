import { InjectionKey, Ref } from "vue";
import { CmsActionRenderManager, CmsBindingValueManager, CmsEnvConfig, CmsPageConfig } from "../../cms";
import { HeightCoordinator } from "../hooks/useAdaptiveHeight";

/**
 * cms 环境变量Key
 */
export const envConfigKey: InjectionKey<Ref<CmsEnvConfig>> = Symbol('CmsEnvConfig');
/**
 * cms 页面配置Key
 */
export const cmsPageConfigKey: InjectionKey<Ref<CmsPageConfig>> = Symbol('CmsPageConfig');
/**
 * 数据绑定管理器Key
 */
export const bindingValueKey: InjectionKey<CmsBindingValueManager> = Symbol('CmsBindingValue');
/**
 * 动作绑定管理器Key
 */
export const actionRenderKey: InjectionKey<CmsActionRenderManager> = Symbol('CmsActionRender');
/**
 * 高度收集器Key
 */
export const heightCoordinatorKey: InjectionKey<HeightCoordinator> = Symbol('HeightCoordinator');

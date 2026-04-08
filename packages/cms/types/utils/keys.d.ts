import { InjectionKey, Ref } from "vue";
import { CmsActionRenderManager, CmsBindingValueManager, CmsEnvConfig, CmsPageConfig } from "../cms";
import { HeightCoordinator } from "../hooks/useAdaptiveHeight";
/**
 * cms 环境变量Key
 */
export declare const envConfigKey: InjectionKey<Ref<CmsEnvConfig>>;
/**
 * cms 页面配置Key
 */
export declare const cmsPageConfigKey: InjectionKey<Ref<CmsPageConfig>>;
/**
 * 数据绑定管理器Key
 */
export declare const bindingValueKey: InjectionKey<CmsBindingValueManager>;
/**
 * 动作绑定管理器Key
 */
export declare const actionRenderKey: InjectionKey<CmsActionRenderManager>;
/**
 * 高度收集器Key
 */
export declare const heightCoordinatorKey: InjectionKey<HeightCoordinator>;

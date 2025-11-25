import {
  CmsBindingPlugin,
  CmsBindingValueConfig,
  CmsBindingValueManager,
  CmsComponentData,
  CmsPageConfig,
} from '../../cms';
import { buildParentMapper } from '../utils/utils';
import { createFakeDataManager } from './createFakeDateManager';
import { cmsTabContainerBindingValue } from './custom/cmsTabContainerBindingValue';

const bindings: CmsBindingPlugin[] = [cmsTabContainerBindingValue];
/**
 * 创建一个绑定值管理对象
 */
export const createCmsBindingValue = (
  pageConfig: CmsPageConfig
): CmsBindingValueManager => {
  /**
   * 管理绑定值对象
   */
  const state: { configs: CmsBindingValueConfig[] } = {
    configs: [],
  };

  /**
   * 注册一个绑定值
   * @param config
   */
  const registry = (config: CmsBindingValueConfig) => {
    state.configs.push(config);
  };

  /**
   * 创建真实映射
   */
  const actualParentMapper = buildParentMapper(pageConfig);

  /**
   * 创建伪造数据管理器
   */
  const fakeDataManager = createFakeDataManager();

  /**
   * 根据值（有可能是绑定配置的code）或者对应的绑定配置，如果返回undefined证明该值不是任何一个绑定配置的code
   * @param valueMaybeCode
   * @returns
   */
  const getBindValueConfig = (valueMaybeCode: string | null) => {
    if (valueMaybeCode == null) {
      return undefined;
    }
    return state.configs.find((i) => i.code === valueMaybeCode);
  };

  const getBindingValue = (value: string, data: CmsComponentData): any => {
    if (!value) {
      return null;
    }
    // 检查是否注册了 bindingValue
    const bindValueConfig = getBindValueConfig(value);
    if (!bindValueConfig) {
      return value;
    }

    let currentData: CmsComponentData | undefined = data;
    const { value: mapper } = actualParentMapper;

    let { val, done } = bindValueConfig.getter(currentData);
    currentData =
      mapper[currentData.componentId] ||
      fakeDataManager.get(currentData.componentId);

    // 循环爬树
    while (!done && currentData) {
      const result = bindValueConfig.getter(currentData);
      val = result.val;
      done = result.done;
      if (done) break;
      // 继续向上找爸爸 (真实 或 伪造)
      currentData =
        mapper[currentData.componentId] ||
        fakeDataManager.get(currentData.componentId);
    }

    return val;
  };

  const refer = {
    state,
    registry,
    getBindingValue,
    actualParentMapper,
    fakeDataManager,
  };

  bindings.forEach((binding) => binding({ bindingValue: refer }));

  return refer;
};

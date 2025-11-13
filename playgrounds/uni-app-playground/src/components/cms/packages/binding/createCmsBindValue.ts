import {
  CmsBindingPlugin,
  CmsBindingValueConfig,
  CmsBindingValueManager,
  CmsComponentData,
  CmsPageConfig,
} from '../../cms';
import { buildParentMapper } from '../utils/utils';

const bindings: CmsBindingPlugin[] = [];
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
   * 真实节点与父节点数据映射
   */
  const actualParentMapper = buildParentMapper(pageConfig);

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
      return value; // 不是，直接返回原始值
    }

    // 2. 准备“爬树”
    let currentData: CmsComponentData | undefined = data;
    const { value: mapper } = actualParentMapper;

    let val: any; // 用来存储最后一次的 val
    let done = false; // 用来标记是否已找到

    // 3. 只要还有节点可以问，就一直循环
    while (currentData) {
      // 4. 询问“当前”节点 (自己, 爸爸, 爷爷...)
      const result = bindValueConfig.getter(currentData);
      val = result.val;
      done = result.done;

      // 5. 如果找到了，就立即停止“爬树”
      if (done) {
        break;
      }

      // 6. 没找到？爬到上一层（爸爸/爷爷）
      currentData = mapper[currentData.componentId];
    }

    // 7. 返回最后一次询问到的 val
    return val;
  };

  const refer = {
    state,
    registry,
    getBindingValue,
    actualParentMapper,
  };

  bindings.forEach((binding) => binding({ bindingValue: refer }));

  return refer;
};

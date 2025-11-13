import { iterateComponentData } from '@/components/cms/packages/utils/iterateComponentData';
import { cmsTabsBindingValue } from '@/components/cms/packages/binding/custom/tabs/cms.tabs.bindingValue';
import { cmsProductListBindingValue } from '@/components/cms/packages/binding/custom/product/cms.productList.bindingValue';
import { cmsLiveBindingValue } from '@/components/cms/packages/binding/custom/live/cms.live.bindingValue';
import { cmsCategoryBindingValue } from '@/components/cms/packages/binding/custom/category/cms.category.bindingValue';
import { cmsTabContainerBindingValue } from '@/components/cms/packages/binding/custom/tabContainer/cms.tab.container.bindingValue';
import { cmsSpecialColumnBindingValue } from '@/components/cms/packages/binding/custom/specialColumn/cms.specialColumn.bindingValue';
import { cmsPointProductListBindingValue } from '@/components/cms/packages/binding/custom/pointProduct/cms.pointProductList.bindingValue';
import { cmsPointTabsBindingValue } from '@/components/cms/packages/binding/custom/pointTabs/cms.pointTabs.bindingValue';

/**
 * 预定义好的数据绑定配置
 * @author  韦胜健
 * @date    2022.9.18 12:37
 */
const bindings = [cmsTabsBindingValue, cmsProductListBindingValue, cmsLiveBindingValue, cmsCategoryBindingValue, cmsTabContainerBindingValue, cmsSpecialColumnBindingValue, cmsPointProductListBindingValue, cmsPointTabsBindingValue];

/**
 * 创建一个绑定值管理对象
 * @author  韦胜健
 * @date    2022/9/19 20:47
 */
export function createCmsBindValue(pageData) {
  const state = {
    configs: [], // 绑定值注册信息
  };

  /**
   * 注册一个绑定值
   * @author  韦胜健
   * @date    2022.9.15 18:35
   */
  const registry = (config) => {
    state.configs.push(config);
  };

  /**
   * 真实节点父节点数据映射
   * @author  韦胜健
   * @date    2022.9.18 12:15
   */
  const actualParentMapper = (() => {
    const mapper = {};
    if (!pageData) {
      return { value: mapper };
    }
    iterateComponentData((parent) => {
      parent.childrenData?.forEach((child) => {
        !!child && (mapper[child.componentId] = parent);
      });
    }, pageData.childrenData);
    return { value: mapper };
  })();

  /**
   * 伪造数据管理对象，由于伪造的数据的id是随机生成的，为了实现绑定数据寻找父节点绑定数据的功能，这里在渲染
   * 伪造数据的时候给伪造的数据生成id，并且记录在fakeStateMapper中
   * @author  韦胜健
   * @date    2022/3/2 16:43
   */
  const fakeDataManager = (() => {
    let count = 1;
    const fakeStateMapper = {};
    const parentsToChildrenIdsMapper = {};

    /**
     * 清理伪造节点的历史数据（每次render都要清理）
     * @author  韦胜健
     * @date    2022/3/31 14:30
     */
    const resetFakeData = (parent) => {
      let parentsToChildrenIds = parentsToChildrenIdsMapper[parent.componentId];
      if (!parentsToChildrenIds) {
        parentsToChildrenIds = parentsToChildrenIdsMapper[parent.componentId] = [];
      } else {
        parentsToChildrenIds.forEach((id) => {
          delete fakeStateMapper[id];
        });
        parentsToChildrenIds.splice(0, parentsToChildrenIds.length);
      }
      return parentsToChildrenIds;
    };

    /**
     * 处理假节点数据，补充假节点id，关联父子节点映射到fakeStateMapper
     * @author  韦胜健
     * @date    2022/9/19 20:46
     */
    const processFakeData = (parent, list, reset) => {
      const nextFakeId = () => `${parent.componentId},${count++},${parent.componentId}`;
      if (reset) {
        resetFakeData(parent);
      }
      const parentsToChildrenIds = parentsToChildrenIdsMapper[parent.componentId];
      // 这里注释掉，并不希望伪造的子节点找上真实的父节点数据
      // list.forEach(item => {fakeStateMapper[item.componentId] = parent});

      list.forEach((childData) => {
        childData.componentId = nextFakeId();
        childData.readonly = true;
      });
      iterateComponentData((data) => {
        data.childrenData?.forEach((childData) => {
          if (!childData) {
            return;
          }
          childData.componentId = nextFakeId();
          childData.readonly = true;
          fakeStateMapper[childData.componentId] = data;
          parentsToChildrenIds.push(childData.componentId);
        });
      }, list);
    };

    /**
     * 获取父节点
     * @author  韦胜健
     * @date    2022/9/19 20:47
     */
    const get = (id) => fakeStateMapper[id];

    return {
      resetFakeData,
      processFakeData,
      get,
    };
  })();

  /**
   * 根据值（有可能是绑定配置的code）或者对应的绑定配置，如果返回undefined证明该值不是任何一个绑定配置的code
   * @author  韦胜健
   * @date    2022.9.15 18:36
   */
  const getBindValueConfig = (valueMaybeCode) => {
    if (valueMaybeCode == null) {
      return undefined;
    }
    return state.configs.find((i) => i.code === valueMaybeCode);
  };

  /**
   * 获取绑定值
   * @author  韦胜健
   * @date    2022.9.15 18:40
   */
  const getBindingValue = (value, data) => {
    if (!value) {
      return null;
    }

    const bindValueConfig = getBindValueConfig(value);
    if (!bindValueConfig || !data) {
      return value;
    }
    let currentData = data;
    const { value: mapper } = actualParentMapper;
    let { val, done } = bindValueConfig.getter(currentData);
    currentData = mapper[currentData.componentId] || fakeDataManager.get(currentData.componentId);
    while (!done && !!currentData) {
      const result = bindValueConfig.getter(currentData);
      currentData = mapper[currentData.componentId] || fakeDataManager.get(currentData.componentId);
      val = result.val;
      done = result.done;
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

  /*注册所有的绑定值配置*/
  bindings.forEach((i) => i({ bindingValue: refer }));

  return refer;
}

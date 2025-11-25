import { CmsComponentData } from '../../cms';
import { iterateComponentData } from '../utils/utils'; // 假设这是您的遍历工具

/**
 * [新] 伪造数据管理器的类型定义
 */
export interface CmsFakeDataManager {
  resetFakeData: (parent: CmsComponentData) => string[];
  processFakeData: (
    parent: CmsComponentData,
    list: CmsComponentData[],
    reset?: boolean
  ) => void;
  get: (id: string) => CmsComponentData | undefined;
}

/**
 * 创建伪造数据管理器
 *
 */
export const createFakeDataManager = (): CmsFakeDataManager => {
  let count = 1;

  // 记录伪造节点的 ID -> 数据对象的映射
  const fakeStateMapper: Record<string, CmsComponentData> = {};
  // 记录父节点 -> 伪造子节点 ID 列表的映射
  const parentsToChildrenIdsMapper: Record<string, string[]> = {};

  const resetFakeData = (parent: CmsComponentData) => {
    let parentsToChildrenIds = parentsToChildrenIdsMapper[parent.componentId];
    if (!parentsToChildrenIds) {
      parentsToChildrenIds = parentsToChildrenIdsMapper[parent.componentId] =
        [];
    } else {
      parentsToChildrenIds.forEach((id) => {
        delete fakeStateMapper[id];
      });
      parentsToChildrenIds.splice(0, parentsToChildrenIds.length);
    }
    return parentsToChildrenIds;
  };

  const processFakeData = (
    parent: CmsComponentData,
    list: CmsComponentData[],
    reset?: boolean
  ) => {
    const nextFakeId = () =>
      `${parent.componentId},${count++},${parent.componentId}`;
    if (reset) {
      resetFakeData(parent);
    }
    const parentsToChildrenIds = parentsToChildrenIdsMapper[parent.componentId];

    list.forEach((childData) => {
      childData.componentId = nextFakeId();
      // @ts-ignore 如果 readonly 属性在类型定义里不存在，可以忽略或补上类型
      childData.readonly = true;
    });

    iterateComponentData((data: CmsComponentData) => {
      data.childrenData?.forEach((childData: CmsComponentData) => {
        if (!childData) return;

        childData.componentId = nextFakeId();
        // @ts-ignore
        childData.readonly = true;

        // [!] 关键：建立映射
        fakeStateMapper[childData.componentId] = data;
        parentsToChildrenIds?.push(childData.componentId);
      });
    }, list);
  };

  const get = (id: string) => fakeStateMapper[id];

  return {
    resetFakeData,
    processFakeData,
    get,
  };
};

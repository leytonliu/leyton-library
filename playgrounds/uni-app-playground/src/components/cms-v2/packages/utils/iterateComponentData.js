/**
 * 深度递归组件数据
 * @author  韦胜健
 * @date    2022.4.30 15:16
 */
function deepIterate(target, handler) {
  const iterator = (target, handler) => {
    if (target == null) {
      return;
    }
    Object.entries(target).forEach(([key, value]) => {
      handler(key, value);
      if (Array.isArray(value) || typeof value === 'object') {
        deepIterate(value, handler);
      }
    });
  };

  iterator(target, handler);
}

/**
 * 获取所有的子节点数据 包含data.childrenData以及data.readonlyData中所有的childrenData
 * @author  韦胜健
 * @date    2022.4.30 15:15
 */
export function getAllChildrenData(componentData) {
  const childrenData = [...(componentData.childrenData || [])];
  !!componentData.readonlyData &&
    deepIterate(componentData.readonlyData, (key, value) => {
      if (key === 'childrenData' && !!value) {
        childrenData.push(...value);
      }
    });
  return childrenData;
}

/**
 * 遍历子节点数据
 * @author  韦胜健
 * @date    2022/2/26 16:16
 */
export const iterateComponentData = (() => {
  const iterator = (fn, childrenData) => {
    for (let i = 0; i < childrenData.length; i++) {
      const componentData = childrenData[i];
      if (!componentData) {
        continue;
      }
      const flag = fn(componentData, childrenData);
      if (flag) {
        return;
      }
      const allChildrenData = getAllChildrenData(componentData);
      if (allChildrenData.length > 0) {
        iterator(fn, allChildrenData);
      }
    }
  };
  return (fn, childrenData) => {
    iterator(fn, childrenData);
  };
})();

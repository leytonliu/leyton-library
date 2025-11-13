function getTabContainerMetaValue(data, key) {
  /* 先找data.data.tab，这个tab的值是伪造来的，一般情况下不能手动给节点绑定这个tab值 */
  const tabGroupMeta = data.data.tab;

  if (tabGroupMeta) {
    return {
      done: true,
      val: tabGroupMeta[key] || '',
    };
  }
  /* 否则找data.readonlyData.panes，如果这个数组存在，则取这个数组中的第一个元素的对象作为绑定值对象取值 */
  const panes = data.readonlyData?.panes;

  if (panes) {
    var _;

    return {
      done: true,
      val: (_ = panes[0]) === null || _ === void 0 ? void 0 : _[key],
    };
  }

  return {
    done: false,
    val: null,
  };
}

export function cmsTabContainerBindingValue({ bindingValue }) {
  bindingValue.registry({
    code: '@@tab-container-title',
    name: '绑定页签标题',
    getter: (data) => getTabContainerMetaValue(data, 'title'),
  });
  bindingValue.registry({
    code: '@@tab-container-url',
    name: '绑定页签图片',
    getter: (data) => getTabContainerMetaValue(data, 'url'),
  });
}

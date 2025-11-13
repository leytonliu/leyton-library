/**
 * 从componentData中找到绑定的选项卡的值
 * @author  韦胜健
 * @date    2022/3/31 11:54
 */
function getTabMetaValue(data, key) {
  /* 先找data.data.tab，这个tab的值是伪造来的，一般情况下不能手动给节点绑定这个tab值 */
  const productGroupMeta = data.data.tab;

  if (productGroupMeta) {
    return {
      done: true,
      val: productGroupMeta[key] || '',
    };
  }
  /* 否则找data.data.tabGroup，如果这个数组存在，则取这个数组中的第一个元素的对象作为绑定值对象取值 */
  const tabGroup = data.data.tabGroup;

  if (tabGroup) {
    var _;

    return {
      done: true,
      val: (_ = tabGroup[0]) === null || _ === void 0 ? void 0 : _[key],
    };
  }

  return {
    done: false,
    val: null,
  };
}

export function cmsPointTabsBindingValue({ bindingValue }) {
  bindingValue.registry({
    code: '@@point-tab-title',
    name: '绑定积分选项卡标题',
    getter: (data) => getTabMetaValue(data, 'title'),
  });
}

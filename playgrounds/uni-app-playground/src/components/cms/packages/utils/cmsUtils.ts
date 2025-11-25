import { CmsComponentData, CmsBindingValueManager } from '../../cms';

/**
 * 判断组件数据是否可见
 * @param data 组件数据
 * @param bindingManager (可选) 绑定管理器，用于解析 @@绑定值
 */
export function checkComponentVisible(
  data: CmsComponentData,
  bindingValue?: CmsBindingValueManager
): boolean {
  const rawFlag = data.data?.visibleFlag;

  // 1. 默认可见
  if (rawFlag === undefined || rawFlag === null) return true;

  // 2. 解析绑定值 (如果有)
  let finalFlag = rawFlag;
  if (bindingValue && typeof rawFlag === 'string') {
    finalFlag = bindingValue.getBindingValue(rawFlag, data);
  }

  // 3. 判断真假 (兼容 0/1 和 false/true)
  if (finalFlag === 0 || finalFlag === false) return false;

  return true;
}

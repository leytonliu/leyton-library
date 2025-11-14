import { CmsComponentData, CmsBindingValueManager } from '../../../cms';

export const cmsTabContainerBindingValue = ({
  bindingValue,
}: {
  bindingValue: CmsBindingValueManager;
}) => {
  bindingValue.registry({
    code: '@@tab-container-title',
    name: '绑定页签标题',
    getter: (data: CmsComponentData) => {
      const hasTitle = data.title !== undefined && data.title !== null;
      return {
        val: hasTitle ? data.title : null, // 返回找到的值
        done: hasTitle, // 如果找到了 (true)，就告诉 getBindingValue 停止“爬树”
      };
    },
  });
};

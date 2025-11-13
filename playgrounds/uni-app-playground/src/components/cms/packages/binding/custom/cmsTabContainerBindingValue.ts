import { CmsComponentData } from '../../../cms';

export const cmsTabContainerBindingValue = ({ bindingValue }) => {
  bindingValue.registry({
    code: '@@tab-container-title',
    name: '绑定页签标题',
    getter: (data: CmsComponentData) => data.title,
  });
};

import { CmsCustomActionParams } from '../../cms';

/**
 * 预定义动作
 */
export const customActionRender = ({
  actionRender: { registryActionRender },
}: CmsCustomActionParams) => {
  registryActionRender('bind-weapp-page', (data) => {
    // 跳转页面逻辑
    console.log('触发了bind-weapp-page事件', data);
  });

  registryActionRender('pdp', (data) => {
    // 触发
    console.log('触发了pdp事件', data);
  });
};

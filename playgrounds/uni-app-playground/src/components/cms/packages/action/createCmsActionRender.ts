import {
  CmsActionHandler,
  CmsActionRenderManager,
  CmsActionState,
  CmsBindingValueManager,
  CmsComponentData,
} from '../../cms';

export const createCmsActionRender = (
  bindValue: CmsBindingValueManager
): CmsActionRenderManager => {
  const state: CmsActionState = {
    configs: {},
  };

  const registryActionRender = (
    actionCode: string,
    handler: CmsActionHandler
  ) => {
    if (state.configs[actionCode]) {
      console.error('已经存在同名的action code：' + actionCode);
    } else {
      state.configs[actionCode] = handler;
    }
  };

  const handleTapBaseContainer = (data: CmsComponentData) => {
    if (!!data && !!data.action && !!data.action.code) {
      const handler = state.configs[data.action.code];
      if (!handler) {
        // 没有处理action code：${data.action.code} 的动作配置！
        uni.showModal({ content: `${data.action.code}` });
      } else {
        handler(data, bindValue);
      }
    }
  };
  return { registryActionRender, handleTapBaseContainer };
};

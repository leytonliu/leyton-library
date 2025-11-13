import { trackCmsAction } from '@/components/cms/packages/utils/cmsTrackers';

/**
 * 创建一个动作处理管理对象，用来注册动作处理函数
 * @author  韦胜健
 * @date    2022/9/19 20:40
 */
export function createCmsActionRender(bindValue) {
  const state = {
    configs: {},
  };
  /**
   * 注册动作
   * @author  韦胜健
   * @date    2022/9/19 20:40
   */
  const registryActionRender = (actionCode, handler) => {
    if (state.configs[actionCode]) {
      console.error('已经存在同名的action code：' + actionCode);
    } else {
      state.configs[actionCode] = handler;
    }
  };
  /**
   * 处理base container的点击动作,如果base container对应的节点数据配置有action字段则从动作配置中找到对应的配置处理点击事件
   * @author  韦胜健
   * @date    2022/9/19 20:40
   */
  const handleTapBaseContainer = (data) => {
    if (!!data && !!data.action && !!data.action.code) {
      const handler = state.configs[data.action.code];
      if (!handler) {
        // 没有处理action code：${data.action.code} 的动作配置！
        uni.showModal({ content: `${data.action.code}` });
      } else {
        trackCmsAction(data);
        handler(data, bindValue);
      }
    }
  };
  return { registryActionRender, handleTapBaseContainer };
}

import Vue from 'vue';
import env from '@/env/index';

/**
 * 注册自定义的动作处理逻辑
 * @author  韦胜健
 * @date    2022/9/19 20:41
 */
export function customActionRender({ actionRender: { registryActionRender } }) {
  registryActionRender('@@fixed', (data) => {
    // #ifdef H5
    const reg = /(http|https):\/\/([\w.]+\/?)\S*/gi;
    window.location.href = data.action.data.match(reg)
      ? data.action.data
      : `#${data.action.data}`;
    // #endif
    // #ifdef MP-WEIXIN
    Vue.prototype.$Router.push({
      name: 'webPage',
      params: { path: data.action.data, title: '', cmsAction: true },
    });
    // #endif
  });
}

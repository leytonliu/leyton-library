import { ref, getCurrentInstance, onUnmounted } from 'vue';

/**
 * 用于页面组件混入滚动逻辑的公共逻辑，使得子组件能够注入这个对象，获取页面滚动高度以及监听页面滚动高度
 * Vue3 Composable 版本
 * @author  韦胜健
 * @date    2022/9/20 9:36
 */
export function usePageScroll() {
  const listeners = [];
  const state = ref({ scrollTop: 0 });

  const on = (context, listener) => {
    listeners.push(listener);

    // 返回一个注销监听的函数
    const off = () => {
      const index = listeners.indexOf(listener);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    };

    // 自动监听组件销毁的时候注销监听的事件
    onUnmounted(off);

    return off;
  };

  const emit = (options) => {
    state.value.scrollTop = options.scrollTop;
    listeners.forEach((i) => i(options));
  };

  const getScrollTop = () => state.value.scrollTop;

  return {
    pageScrollEvent: {
      on,
      emit,
      getScrollTop,
    },
  };
}

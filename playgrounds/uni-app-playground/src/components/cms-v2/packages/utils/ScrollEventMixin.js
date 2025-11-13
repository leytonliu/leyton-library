/**
 * 用于页面组件混入滚动逻辑的公共逻辑，使得子组件能够注入这个对象，获取页面滚动高度以及监听页面滚动高度
 * @author  韦胜健
 * @date    2022/9/20 9:36
 */
export const ScrollEventMixin = {
  provide() {
    return {
      pageScrollEvent: this.pageScrollEvent,
    };
  },
  data() {
    return {
      pageScrollEvent: (() => {
        const listeners = [];
        const state = { scrollTop: 0 };
        const on = (context, listener) => {
          listeners.push(listener);
          /*返回一个注销监听的函数，执行这个函数可以注销事件*/
          const off = () => {
            const index = listeners.indexOf(listener);
            if (index > -1) {
              listeners.splice(index, 1);
            }
          };
          /*自动监听组件销毁的时候注销监听的事件*/
          context.$on('hook:beforeDestroy', off);
          return off;
        };
        const emit = (options) => {
          state.scrollTop = options.scrollTop;
          listeners.forEach((i) => i(options));
        };
        return { on, emit, getScrollTop: () => state.scrollTop };
      })(),
    };
  },
  /**
   * 监听页面级别的滚动事件，调用pageScrollEvent派发事件
   * @author  韦胜健
   * @date    2022/9/20 9:38
   */
  onPageScroll(options) {
    this.pageScrollEvent.emit(options);
  },
};

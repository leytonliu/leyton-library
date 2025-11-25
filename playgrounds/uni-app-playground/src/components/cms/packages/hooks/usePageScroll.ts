import { provide, inject, onUnmounted, type InjectionKey } from 'vue';
import { onPageScroll } from '@dcloudio/uni-app'; // Uni-app 的生命周期钩子

// --- 类型定义 ---
export interface PageScrollOptions {
  scrollTop: number;
}

type ScrollListener = (options: PageScrollOptions) => void;

export interface PageScrollContext {
  /** 注册监听器，返回一个用于注销的函数 */
  on: (listener: ScrollListener) => () => void;
  /** 获取当前滚动高度 */
  getScrollTop: () => number;
}

// --- Injection Key ---
export const PageScrollKey: InjectionKey<PageScrollContext> =
  Symbol('PageScrollKey');

// ==========================================
// 1. Provider: 仅在页面(Page)中使用
// ==========================================
export function usePageScrollProvider() {
  const listeners = new Set<ScrollListener>();
  let currentScrollTop = 0;

  // 监听 Uni-app 的页面滚动
  onPageScroll((e) => {
    currentScrollTop = e.scrollTop;
    // 触发所有订阅者
    for (const listener of listeners) {
      listener(e);
    }
  });

  const context: PageScrollContext = {
    on: (listener: ScrollListener) => {
      listeners.add(listener);
      // 返回清理函数 (off)
      return () => {
        listeners.delete(listener);
      };
    },
    getScrollTop: () => currentScrollTop,
  };

  // 向下提供服务
  provide(PageScrollKey, context);

  return context;
}

// ==========================================
// 2. Consumer: 在子组件(Component)中使用
// ==========================================
export function usePageScroll() {
  const context = inject(PageScrollKey, null);

  if (!context) {
    console.warn(
      'usePageScroll 必须在使用了 usePageScrollProvider 的页面组件内部使用'
    );
  }

  /**
   * 注册滚动监听的辅助函数
   * 自动处理组件卸载时的清理工作
   */
  const onScroll = (listener: ScrollListener) => {
    if (!context) return;

    // 注册监听
    const off = context.on(listener);

    // [关键] Vue 3 的自动清理
    // 等同于原代码的 context.$on('hook:beforeDestroy', off)
    onUnmounted(() => {
      off();
    });
  };

  return {
    onScroll,
    getScrollTop: () => context?.getScrollTop() || 0,
  };
}

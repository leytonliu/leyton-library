// src/composables/useAdaptiveHeight.ts

import {
  reactive,
  computed,
  provide,
  readonly,
  onUnmounted,
  type InjectionKey,
} from 'vue';

export interface HeightCoordinator {
  // 子组件调用此函数来上报自己的身高
  reportHeight: (id: string, height: number) => void;
  // 子组件在卸载时调用此函数
  unregister: (id: string) => void;
}

export const heightCoordinatorKey: InjectionKey<HeightCoordinator> =
  Symbol('HeightCoordinator');

export function useAdaptiveHeight() {
  // 使用 Map 来存储所有子组件的 { id: height }
  const childrenHeights = reactive(new Map<string, number>());

  // 4. 计算出“最大高度”
  const maxHeight = computed(() => {
    if (childrenHeights.size === 0) {
      return 0;
    }
    // 自动从所有子组件的高度中找到最大值
    return Math.max(...childrenHeights.values());
  });

  // 5. 定义子组件可以调用的“服务”
  const coordinator: HeightCoordinator = {
    reportHeight: (id, height) => {
      // 收到上报，更新 Map
      childrenHeights.set(id, height);
    },
    unregister: (id) => {
      // 子组件卸载了，从 Map 中移除
      childrenHeights.delete(id);
    },
  };

  // 6. [关键] 将这个服务“提供”给所有后代
  provide(heightCoordinatorKey, coordinator);

  // 7. 父组件卸载时，清空 Map
  onUnmounted(() => {
    childrenHeights.clear();
  });

  return {
    maxHeight: readonly(maxHeight),
    childrenHeights: readonly(childrenHeights),
  };
}

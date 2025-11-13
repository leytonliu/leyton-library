import { onMounted } from 'vue';
import { createAutoGetRect } from './createAutoGetRect';
import { defer } from './dfd';

/**
 * 图片高度计算 Composable
 * Vue3 版本
 * @author  wanghuanhuan
 * @date    2023-12-11 17:46:16
 */
export function useImageRect(props, queryRectPrepare = defer()) {
  const getRect = async () => {
    if (props.autoGetRect) {
      if (queryRectPrepare) {
        await queryRectPrepare.promise;
      }

      const instance = getCurrentInstance();
      if (instance) {
        uni.createSelectorQuery()
          .in(instance)
          .select(props.computedClassName || '.cms-visual-editor-base-container')
          .boundingClientRect()
          .exec((res) => {
            if (res && res[0] && res[0].height) {
              createAutoGetRect.rect(props.autoGetRect, res[0]);
            }
          });
      }
    }
  };

  onMounted(async () => {
    await getRect();
  });

  return {
    getRect,
  };
}

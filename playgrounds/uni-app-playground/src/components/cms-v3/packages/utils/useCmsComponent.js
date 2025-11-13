import { computed, inject, watch, onMounted, onUnmounted, getCurrentInstance, ref } from 'vue';
import { useStore } from 'vuex';
import { kebabCase, convertStyleToString } from '@/utils/utils';
import { createAutoGetRect } from './createAutoGetRect';

/**
 * CMS 组件通用 Composable
 * Vue3 版本，替代原来的 CmsComponentMixin
 * @author  韦胜健
 * @date    2022/9/20 9:32
 */
export function useCmsComponent(props, options = {}) {
  const instance = getCurrentInstance();
  const store = useStore();

  // 注入依赖
  const cmsPageData = inject('cmsPageData', {});
  const bindingValue = inject('bindingValue', {});
  const actionRender = inject('actionRender', {});
  const stateProvider = inject('stateProvider', {});
  const env = inject('env', {});
  const statusBarHeight = inject('statusBarHeight', 0);
  const isProvideHidden = inject('isProvideHidden', null);

  const isComputedHidden = computed(() => {
    return props.isHidden != null ? props.isHidden : isProvideHidden != null ? isProvideHidden() : null;
  });

  // 样式对象
  const styleObject = computed(() => {
    let styles = {};

    // 如果父节点有设置子节点样式，则应用父节点设置的子节点样式
    if (props.childrenStyles) {
      Object.assign(styles, props.childrenStyles);
    }

    // 如果子节点自己有设置样式，则以子节点设置的为准
    if (props.data.style) {
      Object.assign(styles, props.data.style);
    }

    if (styles.backgroundImage) {
      styles.backgroundImage = `url('${styles.backgroundImage}')`;
    }

    // 如果有设置宽度，则弹性放大以及压缩都为0，表示不放大以及压缩
    if (styles.width) {
      styles.flex = '0 0 auto';
    }

    // 如果某个子组件有配置adjustStyles函数，则调用这个函数调整base container的样式
    if (options.adjustStyles) {
      styles = options.adjustStyles(styles) || styles;
    }

    return styles;
  });

  const styles = computed(() => {
    return convertStyleToString(styleObject.value);
  });

  const classes = computed(() => {
    const componentName = instance?.type?.name || '';
    return [
      kebabCase(componentName),
      'cms-visual-editor-base-container',
      props.data.componentId,
    ].filter(Boolean);
  });

  // 获取绑定值
  const getBindingValue = (value) => {
    return bindingValue.getBindingValue(value, props.data);
  };

  // 处理点击事件
  const handleTapBaseContainer = () => {
    actionRender.handleTapBaseContainer(props.data);
  };

  // 获取元素尺寸
  const getRect = async (queryRectPrepare) => {
    if (props.autoGetRect && !options.isBaseComponent) {
      if (queryRectPrepare) {
        await queryRectPrepare.promise;
      }

      setTimeout(() => {
        uni.createSelectorQuery()
          .in(instance)
          .select('.cms-visual-editor-base-container')
          .boundingClientRect()
          .exec((res) => {
            if (res[0]?.height) {
              createAutoGetRect.rect(props.autoGetRect, res[0]);
            }
          });
      }, 300);
    }
  };

  // 处理锚点
  if (!options.isBaseComponent && props.data.anchorTitle) {
    const effects = [];
    const clearEffects = () => effects.forEach((i) => i());

    watch(
      () => isComputedHidden.value,
      async (hidden, oldVal) => {
        if (hidden === oldVal) {
          return;
        }

        clearEffects();

        if (hidden) {
          return;
        }

        // 等待一个时间片
        if (typeof wx !== 'undefined') {
          await new Promise((resolve) => wx.nextTick(() => resolve()));
        } else {
          await new Promise((resolve) => setTimeout(() => resolve()));
        }

        const anchorListState = stateProvider.getStateHandler('anchorList');
        const currentValue = [...anchorListState.getValue()];
        const anchorInfo = {
          componentId: props.data.componentId,
          anchorTitle: props.data.anchorTitle,
          seq: currentValue.length + 1,
          getContext: () => instance,
        };
        anchorListState.setValue([...currentValue, anchorInfo]);

        effects.push(() => {
          const currentValue = [...anchorListState.getValue()];
          const index = currentValue.findIndex((i) => (i.componentId = anchorInfo.componentId));
          if (index > -1) {
            currentValue.splice(index, 1);
            anchorListState.setValue(currentValue);
          }
        });
      },
      { immediate: true }
    );

    onUnmounted(() => clearEffects());
  }

  // 监听 activeTabbar 变化
  const activeTabbar = computed(() => store.state.activeTabbar);
  const activeMallTabbar = computed(() => store.state.activeMallTabbar);

  watch(activeTabbar, async (val) => {
    const route = instance?.proxy?.$Route;
    if (val === 'home' && route?.name === 'index') {
      await getRect();
    }
  });

  onMounted(async () => {
    await getRect();
  });

  return {
    cmsPageData,
    bindingValue,
    actionRender,
    stateProvider,
    env,
    statusBarHeight,
    isComputedHidden,
    styleObject,
    styles,
    classes,
    activeTabbar,
    activeMallTabbar,
    getBindingValue,
    handleTapBaseContainer,
    getRect,
  };
}

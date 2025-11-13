import {
  computed,
  CSSProperties,
  getCurrentInstance,
  inject,
  onMounted,
  Ref,
} from 'vue';
import {
  CmsBaseComponentProps,
  CmsBindingValueManager,
  CmsEnvConfig,
  CmsPageConfig,
  UseCmsComponentOptions,
} from '../../cms';
import { convertStyleToString, kebabCase } from '../utils/utils';

const useCmsComponent = (
  props: CmsBaseComponentProps,
  options?: UseCmsComponentOptions
) => {
  const instance = getCurrentInstance();
  const envConfig = inject<Ref<CmsEnvConfig>>('envConfig');
  const cmsPageConfig = inject<Ref<CmsPageConfig>>('cmsPageConfig');
  const bindingValue = inject<CmsBindingValueManager>('bindingValue');

  /**
   * 样式合并策略
   */
  const styleObject = computed(() => {
    let styles: CSSProperties = {};

    // 如果父节点有设置子节点样式，则应用父节点设置的子节点样式
    if (props.childrenStyles) {
      Object.assign(styles, props.childrenStyles);
    }

    // 如果子节点自己有设置样式，则以子节点设置的为准，某些外边距
    if (props.data.style) {
      Object.assign(styles, props.data.style);
    }

    // backgroundImage 处理
    if (styles.backgroundImage) {
      styles.backgroundImage = `url('${styles.backgroundImage}')`;
    }

    // 如果有设置宽度，则弹性放大以及压缩都为0，表示不放大以及压缩
    if (styles.width) {
      styles.flex = '0 0 auto';
    }

    // 如果某个子组件有配置adjustStyles函数，则调用这个函数调整base container的样式
    if (options?.adjustStyles) {
      styles = options.adjustStyles(styles) || styles;
    }

    return styles;
  });

  /**
   * styles 转化为绑定字符串形式的内联样式
   */
  const styles = computed(() => convertStyleToString(styleObject.value));

  /**
   * 组件样式类名
   */
  const classes = computed(() => {
    const componentName = instance?.type?.name || '';
    return [
      kebabCase(componentName),
      'cms-visual-editor-base-container',
      props.data.componentId,
    ].filter(Boolean);
  });

  /**
   * 是否为BaseComponent
   */
  const isBaseComponent = computed(() => {
    return !!options?.isBaseComponent;
  });

  const getRect = () => {
    return new Promise((resolve) => {
      uni
        .createSelectorQuery()
        .in(instance)
        .select('.cms-visual-editor-base-container')
        .boundingClientRect()
        .exec((rect = []) => resolve(rect));
    });
  };

  const getBindingValue = (value: string) => {
    return bindingValue?.getBindingValue(value, props.data);
  };

  onMounted(async () => {
    const rect = await getRect();
    console.log('rect', rect);
  });

  return {
    envConfig,
    cmsPageConfig,
    styleObject,
    styles,
    classes,
    isBaseComponent,
    getBindingValue,
  };
};
export default useCmsComponent;

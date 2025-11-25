import {
  computed,
  CSSProperties,
  getCurrentInstance,
  inject,
  onMounted,
  onUnmounted,
  Ref,
  useAttrs,
} from 'vue';
import {
  CmsActionRenderManager,
  CmsBaseComponentProps,
  CmsBindingValueManager,
  CmsEnvConfig,
  CmsPageConfig,
  UseCmsComponentOptions,
} from '../../cms';
import { convertStyleToString, kebabCase } from '../utils/utils';
import { HeightCoordinator } from './useAdaptiveHeight';
import {
  actionRenderKey,
  bindingValueKey,
  cmsPageConfigKey,
  envConfigKey,
  heightCoordinatorKey,
} from '../utils/keys';
import { checkComponentVisible } from '../utils/cmsUtils';

const useCmsComponent = (
  props: CmsBaseComponentProps,
  options?: UseCmsComponentOptions
) => {
  const instance = getCurrentInstance();
  const envConfig = inject<Ref<CmsEnvConfig>>(envConfigKey);
  const cmsPageConfig = inject<Ref<CmsPageConfig>>(cmsPageConfigKey);
  const bindingValue = inject<CmsBindingValueManager>(bindingValueKey);
  const actionRender = inject<CmsActionRenderManager>(actionRenderKey);
  const coordinator = inject<HeightCoordinator | null>(
    heightCoordinatorKey,
    null
  );

  const { style: attrStyles } = useAttrs();

  /**
   * 样式合并策略
   */
  const styleObject = computed(() => {
    let styles: CSSProperties = {};

    console.log('attrStyles', attrStyles);
    if (attrStyles) {
      Object.assign(styles, attrStyles);
    }

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

  /**
   * 当前组件是否渲染
   */
  const isVisible = computed(() => {
    return checkComponentVisible(props.data, bindingValue);
  });

  /**
   * 获取绑定值
   */
  const getBindingValue = (value: string) => {
    return bindingValue?.getBindingValue(value, props.data);
  };

  /**
   * 处理点击base container的动作
   */
  const handleTapBaseContainer = () => {
    actionRender?.handleTapBaseContainer(props.data);
  };

  /**
   * 收集当前容器高度并上报
   * @returns
   */
  const measureAndReportHeight = () => {
    // 如果父组件没有“要求”上报身高(coordinator为null)，则跳过(并且跳过 BaseComponent)
    if (!coordinator || isBaseComponent.value || !instance) {
      return;
    }
    uni
      .createSelectorQuery()
      .in(instance)
      .select('.cms-visual-editor-base-container')
      .boundingClientRect()
      .exec((res) => {
        if (res && res[0] && res[0].height) {
          coordinator.reportHeight(props.data.componentId, res[0].height);
        }
      });
  };

  onMounted(async () => {
    const { autoReportHeightOnMounted = true } = options || {};
    if (autoReportHeightOnMounted) {
      measureAndReportHeight();
    }
  });

  onUnmounted(() => {
    if (coordinator) {
      coordinator.unregister(props.data.componentId);
    }
  });

  return {
    envConfig,
    cmsPageConfig,
    bindingValue,
    styleObject,
    styles,
    classes,
    isBaseComponent,
    isVisible,
    getBindingValue,
    handleTapBaseContainer,
    measureAndReportHeight,
  };
};
export default useCmsComponent;

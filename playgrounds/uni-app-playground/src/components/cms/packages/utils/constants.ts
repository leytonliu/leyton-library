import { CSSProperties, PropType } from 'vue';
import { CmsComponentConfig, CmsComponentData } from '../../cms';

export const defaultCmsPageConfig = {
  name: '',
  style: {},
  childrenData: [],
};

export const defaultCmsComponentConfig = {
  componentId: '',
  componentCode: '',
  componentName: '',
  data: {},
  style: {},
  childrenData: [],
};
export const defaultCmsEnvConfig = {};

export const cmsBaseComponentProps = {
  data: {
    type: Object as PropType<CmsComponentConfig>,
    required: true,
  },
  index: {
    type: Number,
    required: true,
  },
  childrenStyles: {
    type: Object as PropType<CSSProperties>,
  },
  autoGetRect: { type: String },
  isFirstFloorNode: { type: Boolean, default: false },
  isHidden: { type: Boolean, default: null },
};

export const cmsBaseComponentDefaults = {
  // childrenStyles 是一个对象，所以必须用工厂函数
  childrenStyles: () => ({}),

  // 是否为顶层组件
  isFirstFloorNode: false,

  // 是否隐藏
  isHidden: null,
};

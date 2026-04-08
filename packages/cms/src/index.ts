// CMS Component System for uni-app
// A declarative page rendering engine based on Vue 3

// Main components
export { default as CmsPage } from './cms-page.vue';
export { default as CmsPreview } from './cms-preview.vue';
export { default as CmsBaseComponent } from './cms-base-component.vue';

// Individual components
export { default as CmsText } from './components/cms-text.vue';
export { default as CmsImage } from './components/cms-image.vue';
export { default as CmsButton } from './components/cms-button.vue';
export { default as CmsIcon } from './components/cms-icon.vue';
export { default as CmsRowsContainer } from './components/cms-rows-container.vue';
export { default as CmsColumnContainer } from './components/cms-column-container.vue';
export { default as CmsCarouselContainer } from './components/cms-carousel-container.vue';
export { default as CmsFixedSizeContainer } from './components/cms-fixed-size-container.vue';
export { default as CmsCardStack } from './components/cms-card-stack.vue';
export { default as CmsDialogContainer } from './components/cms-dialog-container.vue';
export { default as CmsTabContainer } from './components/cms-tab-container.vue';
export { default as CmsProductList } from './components/cms-product-list.vue';

// Hooks
export { default as useCmsComponent } from './hooks/useCmsComponent';
export { useAdaptiveHeight } from './hooks/useAdaptiveHeight';
export { usePageScroll } from './hooks/usePageScroll';
export { useCmsDialogDisplay } from './hooks/useCmsDialogDisplay';

// Utils
export {
  getFirstDefinedValue,
  kebabCase,
  convertStyleToString,
  getAllChildrenData,
  iterateComponentData,
  buildParentMapper,
} from './utils/utils';
export { checkComponentVisible } from './utils/cmsUtils';
export {
  defaultCmsPageConfig,
  defaultCmsComponentConfig,
  defaultCmsEnvConfig,
  cmsBaseComponentProps,
  cmsBaseComponentDefaults,
} from './utils/constants';
export {
  bindingValueKey,
  actionRenderKey,
  envConfigKey,
  cmsPageConfigKey,
  heightCoordinatorKey,
} from './utils/keys';

// Action system
export { createCmsActionRender } from './action/createCmsActionRender';
export { customActionRender } from './action/customActionRender';

// Binding system
export { createCmsBindingValue } from './binding/createCmsBindValue';
export { createFakeDataManager } from './binding/createFakeDateManager';
export { cmsTabContainerBindingValue } from './binding/custom/cmsTabContainerBindingValue';

// Type definitions
export type {
  CmsPageConfig,
  CmsComponentConfig,
  CmsComponentData,
  CmsActionConfig,
  CmsEnvConfig,
  CmsBaseComponentProps,
  UseCmsComponentOptions,
  CmsBindingValueConfig,
  CmsParentMapperWrapper,
  CmsBindingValueManager,
  CmsBindingPlugin,
  CmsActionState,
  CmsActionHandler,
  CmsActionRenderManager,
  CmsCustomActionParams,
} from './cms';

// Re-export types from hooks
export type { HeightCoordinator } from './hooks/useAdaptiveHeight';

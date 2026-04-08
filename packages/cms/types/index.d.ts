// Type declarations for @leyton/cms
import type { CSSProperties, InjectionKey, Ref } from 'vue';

// ===== Core Types =====

export interface CmsPageConfig {
  name: string;
  style: CSSProperties;
  childrenData: CmsComponentConfig[];
  gutter?: number;
  [key: string]: any;
}

export interface CmsComponentConfig {
  componentId: string;
  componentCode: string;
  componentName: string;
  data: CmsComponentData;
  style: CSSProperties;
  childrenData: CmsComponentConfig[];
  actions?: CmsActionConfig;
  [key: string]: any;
}

export interface CmsComponentData {
  visibleFlag?: boolean | number;
  [key: string]: any;
}

export interface CmsActionConfig {
  code: string;
  data: any;
  [key: string]: any;
}

export interface CmsEnvConfig {
  getProductList?: (options: { params: { codes: string[] } }) => Promise<any[]>;
  [key: string]: any;
}

export interface CmsBaseComponentProps {
  data: CmsComponentConfig;
  index: number;
  childrenStyles?: CSSProperties;
  autoGetRect?: string;
  isFirstFloorNode?: boolean;
}

export interface UseCmsComponentOptions {
  adjustStyles?: (styles: CSSProperties) => CSSProperties | void | undefined;
  isBaseComponent?: boolean;
  autoReportHeightOnMounted?: boolean;
}

// ===== Binding Types =====

export interface CmsBindingValueConfig {
  code: string;
  name: string;
  getter: (data: CmsComponentData) => { done: boolean; val: any };
}

export type CmsParentMapperWrapper = {
  value: Record<string, CmsComponentData>;
};

export interface CmsBindingValueManager {
  state: { configs: CmsBindingValueConfig[] };
  registry: (config: CmsBindingValueConfig) => void;
  getBindingValue: (value: string, data: CmsComponentData) => any;
  actualParentMapper: CmsParentMapperWrapper;
  fakeDataManager: CmsFakeDataManager;
}

export type CmsBindingPlugin = (params: {
  bindingValue: CmsBindingValueManager;
}) => void;

export interface CmsFakeDataManager {
  get: (id: string) => CmsComponentData | undefined;
  set: (id: string, data: CmsComponentData) => void;
  has: (id: string) => boolean;
}

// ===== Action Types =====

export interface CmsActionState {
  configs: Record<string, CmsActionHandler>;
}

export type CmsActionHandler = (
  data: CmsComponentData,
  bindValue?: CmsBindingValueManager
) => void;

export interface CmsActionRenderManager {
  registryActionRender: (
    actionCode: string,
    handler: CmsActionHandler
  ) => void;
  handleTapBaseContainer: (data: CmsComponentData) => void;
}

export interface CmsCustomActionParams {
  actionRender: CmsActionRenderManager;
}

// ===== Hook Types =====

export interface HeightCoordinator {
  reportHeight: (id: string, height: number) => void;
  unregister: (id: string) => void;
}

// ===== Component Exports =====

export const CmsPage: any;
export const CmsPreview: any;
export const CmsBaseComponent: any;
export const CmsText: any;
export const CmsImage: any;
export const CmsButton: any;
export const CmsIcon: any;
export const CmsRowsContainer: any;
export const CmsColumnContainer: any;
export const CmsCarouselContainer: any;
export const CmsFixedSizeContainer: any;
export const CmsCardStack: any;
export const CmsDialogContainer: any;
export const CmsTabContainer: any;
export const CmsProductList: any;

// ===== Hook Exports =====

export function useCmsComponent(
  props: CmsBaseComponentProps,
  options?: UseCmsComponentOptions
): {
  envConfig: Ref<CmsEnvConfig> | undefined;
  cmsPageConfig: Ref<CmsPageConfig> | undefined;
  bindingValue: CmsBindingValueManager | undefined;
  styleObject: any;
  styles: any;
  classes: any;
  isBaseComponent: any;
  isVisible: any;
  getBindingValue: (value: string) => any;
  handleTapBaseContainer: () => void;
  measureAndReportHeight: () => void;
};

export function useAdaptiveHeight(): {
  maxHeight: Readonly<Ref<number>>;
  childrenHeights: Readonly<Ref<Map<string, number>>>;
};

export function usePageScroll(callback?: (scrollTop: number) => void): void;

export function useCmsDialogDisplay(): {
  visible: Ref<boolean>;
  open: () => void;
  close: () => void;
};

// ===== Utils =====

export function getFirstDefinedValue(...args: any[]): any;
export function kebabCase(str: string): string;
export function convertStyleToString(styleObject: CSSProperties): string | null;
export function getAllChildrenData(componentData: CmsComponentData): CmsComponentData[];
export function iterateComponentData(
  fn: (componentData: CmsComponentData, childrenData: CmsComponentData[]) => boolean | void | undefined,
  childrenData: CmsComponentData[]
): void;
export function buildParentMapper(pageConfig: CmsPageConfig): { value: Record<string, CmsComponentData> };
export function checkComponentVisible(
  data: CmsComponentData,
  bindingValue?: CmsBindingValueManager
): boolean;

// ===== Constants =====

export const defaultCmsPageConfig: Partial<CmsPageConfig>;
export const defaultCmsComponentConfig: Partial<CmsComponentConfig>;
export const defaultCmsEnvConfig: CmsEnvConfig;
export const cmsBaseComponentProps: any;
export const cmsBaseComponentDefaults: any;

// ===== Keys =====

export const envConfigKey: InjectionKey<Ref<CmsEnvConfig>>;
export const cmsPageConfigKey: InjectionKey<Ref<CmsPageConfig>>;
export const bindingValueKey: InjectionKey<CmsBindingValueManager>;
export const actionRenderKey: InjectionKey<CmsActionRenderManager>;
export const heightCoordinatorKey: InjectionKey<HeightCoordinator>;

// ===== Action System =====

export function createCmsActionRender(
  bindValue: CmsBindingValueManager
): CmsActionRenderManager;

export function customActionRender(params: CmsCustomActionParams): void;

// ===== Binding System =====

export function createCmsBindingValue(
  pageConfig: CmsPageConfig
): CmsBindingValueManager;

export function createFakeDataManager(): CmsFakeDataManager;

export function cmsTabContainerBindingValue(params: {
  bindingValue: CmsBindingValueManager;
}): void;

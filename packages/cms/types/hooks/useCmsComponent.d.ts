import { CSSProperties, Ref } from 'vue';
import { CmsBaseComponentProps, CmsBindingValueManager, CmsEnvConfig, CmsPageConfig, UseCmsComponentOptions } from '../cms';
declare const useCmsComponent: (props: CmsBaseComponentProps, options?: UseCmsComponentOptions) => {
    envConfig: Ref<CmsEnvConfig, CmsEnvConfig> | undefined;
    cmsPageConfig: Ref<CmsPageConfig, CmsPageConfig> | undefined;
    bindingValue: CmsBindingValueManager | undefined;
    styleObject: import("vue").ComputedRef<CSSProperties>;
    styles: import("vue").ComputedRef<string>;
    classes: import("vue").ComputedRef<string[]>;
    isBaseComponent: import("vue").ComputedRef<boolean>;
    isVisible: import("vue").ComputedRef<boolean>;
    getBindingValue: (value: string) => any;
    handleTapBaseContainer: () => void;
    measureAndReportHeight: () => void;
};
export default useCmsComponent;

import { CSSProperties, PropType } from 'vue';
import { CmsComponentConfig } from '../cms';
export declare const defaultCmsPageConfig: {
    name: string;
    style: {};
    childrenData: never[];
};
export declare const defaultCmsComponentConfig: {
    componentId: string;
    componentCode: string;
    componentName: string;
    data: {};
    style: {};
    childrenData: never[];
};
export declare const defaultCmsEnvConfig: {};
export declare const cmsBaseComponentProps: {
    data: {
        type: PropType<CmsComponentConfig>;
        required: boolean;
    };
    index: {
        type: NumberConstructor;
        required: boolean;
    };
    childrenStyles: {
        type: PropType<CSSProperties>;
    };
    isFirstFloorNode: {
        type: BooleanConstructor;
        default: boolean;
    };
};
export declare const cmsBaseComponentDefaults: {
    childrenStyles: () => {};
    isFirstFloorNode: boolean;
};

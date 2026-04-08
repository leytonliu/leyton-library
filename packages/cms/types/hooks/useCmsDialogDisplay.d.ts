interface TimeConfig {
    start: string;
    end: string;
    num: number;
}
interface DatetimeConfig {
    date: string[];
    time: TimeConfig[];
}
interface CmsComponentData {
    datetimeList?: DatetimeConfig[];
    [key: string]: any;
}
/**
 * Hook: CMS 显示规则判断
 * @param data 组件数据 (包含 datetimeList)
 * @param componentId 组件ID
 */
export declare function useCmsDialogDisplay(data: CmsComponentData, componentId: string): {
    shouldShow: boolean;
    markAsShown: () => void;
};
export {};

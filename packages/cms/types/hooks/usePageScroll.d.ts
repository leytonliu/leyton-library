import { type InjectionKey } from 'vue';
export interface PageScrollOptions {
    scrollTop: number;
}
type ScrollListener = (options: PageScrollOptions) => void;
export interface PageScrollContext {
    /** 注册监听器，返回一个用于注销的函数 */
    on: (listener: ScrollListener) => () => void;
    /** 获取当前滚动高度 */
    getScrollTop: () => number;
}
export declare const PageScrollKey: InjectionKey<PageScrollContext>;
export declare function usePageScrollProvider(): PageScrollContext;
export declare function usePageScroll(): {
    onScroll: (listener: ScrollListener) => void;
    getScrollTop: () => number;
};
export {};

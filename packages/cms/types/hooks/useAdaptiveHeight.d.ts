export interface HeightCoordinator {
    reportHeight: (id: string, height: number) => void;
    unregister: (id: string) => void;
}
export declare function useAdaptiveHeight(): {
    maxHeight: Readonly<import("vue").Ref<number, number>>;
    childrenHeights: ReadonlyMap<string, number>;
};

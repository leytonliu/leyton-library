import { CmsComponentData } from '../cms';
/**
 * [新] 伪造数据管理器的类型定义
 */
export interface CmsFakeDataManager {
    resetFakeData: (parent: CmsComponentData) => string[];
    processFakeData: (parent: CmsComponentData, list: CmsComponentData[], reset?: boolean) => void;
    get: (id: string) => CmsComponentData | undefined;
}
/**
 * 创建伪造数据管理器
 *
 */
export declare const createFakeDataManager: () => CmsFakeDataManager;

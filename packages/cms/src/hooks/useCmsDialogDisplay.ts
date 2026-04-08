import { ref } from 'vue';

// --- 类型定义 (根据您的业务数据结构) ---
interface TimeConfig {
  start: string; // "00:00:00"
  end: string; // "23:59:59"
  num: number; // 限制次数
}

interface DatetimeConfig {
  date: string[]; // ["2023-11-15", "2023-11-16"]
  time: TimeConfig[];
}

interface CmsComponentData {
  datetimeList?: DatetimeConfig[];
  [key: string]: any;
}

// --- 内部工具：日期处理 ---
const DateUtils = {
  getNowDateObj: () => new Date(),
  pad: (n: number) => String(n).padStart(2, '0'),

  // 获取 "YYYY-MM-DD"
  getYMD(dateObj: Date = new Date()) {
    return `${dateObj.getFullYear()}-${DateUtils.pad(
      dateObj.getMonth() + 1
    )}-${DateUtils.pad(dateObj.getDate())}`;
  },

  // 获取 "HH:mm:ss"
  getHms(dateObj: Date = new Date()) {
    return `${DateUtils.pad(dateObj.getHours())}:${DateUtils.pad(
      dateObj.getMinutes()
    )}:${DateUtils.pad(dateObj.getSeconds())}`;
  },

  // 将 "HH:mm:ss" 转为数字 123000 (方便比较)
  hms2number(hms: string) {
    return Number(hms.replace(/:/g, ''));
  },
};

// --- 内部工具：缓存管理 ---
const CACHE_KEY = '@@CMS_DIALOG_CONTAINER_CACHE';

const CacheHandler = {
  // 获取今日针对特定组件的缓存对象
  getCache(componentId: string) {
    const allCache = uni.getStorageSync(CACHE_KEY) || {};
    const todayYMD = DateUtils.getYMD();
    const todayCache = allCache[todayYMD] || {};
    return todayCache[componentId] || {};
  },

  // 更新缓存
  updateCache(componentId: string, timeKey: string, newCount: number) {
    const allCache = uni.getStorageSync(CACHE_KEY) || {};
    const todayYMD = DateUtils.getYMD();

    const newCache = {
      ...allCache,
      [todayYMD]: {
        ...(allCache[todayYMD] || {}),
        [componentId]: {
          ...(allCache[todayYMD]?.[componentId] || {}),
          [timeKey]: newCount,
        },
      },
    };

    uni.setStorageSync(CACHE_KEY, newCache);
  },
};

/**
 * Hook: CMS 显示规则判断
 * @param data 组件数据 (包含 datetimeList)
 * @param componentId 组件ID
 */
export function useCmsDialogDisplay(
  data: CmsComponentData,
  componentId: string
) {
  // 存储匹配到的规则 Key (用于后续更新缓存)
  const matchedRuleKey = ref<string | null>(null);
  // 存储当前的计数
  const currentCount = ref(0);

  /**
   * 核心判定逻辑
   * @returns boolean 是否应该显示
   */
  const checkShouldShow = (): boolean => {
    const datetimeList = data.datetimeList;

    // 1. 如果没有配置规则，默认不显示 (或者根据业务需求改为 true)
    if (!datetimeList || datetimeList.length === 0) {
      return false;
    }

    const now = new Date();
    const todayYMD = DateUtils.getYMD(now);
    const nowHmsNum = DateUtils.hms2number(DateUtils.getHms(now));

    // 获取当前组件的缓存记录
    const cache = CacheHandler.getCache(componentId);

    // 遍历所有日期配置
    for (const config of datetimeList) {
      // 2. 检查日期是否命中
      if (config.date && config.date.includes(todayYMD)) {
        // 3. 遍历时间段配置
        for (const timeItem of config.time || []) {
          const { start, end, num } = timeItem;
          const startNum = DateUtils.hms2number(start);
          const endNum = DateUtils.hms2number(end);

          // 4. 检查当前时间是否在范围内
          if (nowHmsNum >= startNum && nowHmsNum <= endNum) {
            // 构造缓存Key (start_end)
            const key = `${start}_${end}`;
            const usedNum = cache[key] || 0;

            // 5. 检查频次是否超限
            if (usedNum < num) {
              // 命中！记录必要信息，暂停循环
              matchedRuleKey.value = key;
              currentCount.value = usedNum;
              return true;
            }
          }
        }
      }
    }

    return false;
  };

  /**
   * 标记为已显示 (副作用：写入缓存)
   * 建议在组件真正展示（v-if=true）后调用
   */
  const markAsShown = () => {
    if (matchedRuleKey.value) {
      const newCount = currentCount.value + 1;
      CacheHandler.updateCache(componentId, matchedRuleKey.value, newCount);
      // 更新本地状态，防止重复计数
      currentCount.value = newCount;
      matchedRuleKey.value = null; //以此防止重复调用
    }
  };

  // 立即执行一次检查
  const shouldShow = checkShouldShow();

  return {
    shouldShow, // boolean, 仅仅表示“是否有资格”显示
    markAsShown, // function, 调用它来消耗一次显示次数
  };
}

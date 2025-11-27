<template>
  <view
    :id="containerId"
    :class="classes"
    :data-component="data.componentCode"
    :style="[containerStyles, cssVars, { minHeight: containerMinHeight }]"
    class="cms-tab-container"
    @tap="handleTapBaseContainer"
  >
    <view class="cms-tab-header-sticky-wrapper">
      <scroll-view
        class="cms-tab-header-scroll"
        scroll-with-animation
        scroll-x
        :scroll-into-view="scrollIntoViewId"
      >
        <view class="cms-tab-header-flex">
          <view
            v-for="(tab, index) in processedTabs"
            :id="`tab-item-${index}`"
            :key="tab.uniqueKey"
            class="cms-tab-header-item"
            :class="{
              'is-active': activeIndex === index,
              'has-underline': hasUnderline,
            }"
            @tap="handleSwitchTab(index)"
          >
            <cms-base-component
              :data="tab.headerComponentData"
              :index="index"
            />
          </view>
        </view>
      </scroll-view>
    </view>

    <view class="cms-tab-content-wrapper">
      <template v-for="(tab, index) in processedTabs" :key="tab.uniqueKey">
        <view
          v-if="tab.hasBeenRendered"
          v-show="activeIndex === index"
          class="cms-tab-content-pane"
        >
          <cms-base-component
            v-for="(item, i) in tab.contentChildren"
            :key="item.componentId"
            :data="item"
            :index="i"
          />
        </view>
      </template>
    </view>
  </view>
</template>

<script lang="ts" setup>
import {
  ref,
  computed,
  watch,
  provide,
  getCurrentInstance,
  nextTick,
  type CSSProperties,
} from 'vue';
import { CmsBaseComponentProps, CmsComponentConfig } from '../../cms';
import { cmsBaseComponentDefaults } from '../utils/constants';
import useCmsComponent from '../hooks/useCmsComponent';
import CmsBaseComponent from '../cms-base-component.vue';
import { deepcopy } from '../utils/deepcopy';
import { usePageScroll } from '../hooks/usePageScroll';

// --- 类型定义 ---
interface ProcessedTab {
  uniqueKey: string;
  headerComponentData: CmsComponentConfig;
  contentChildren: CmsComponentConfig[];
  hasBeenRendered: boolean;
}

// 补充 UniApp 的 NodeInfo 类型定义 (如果没有全局定义)
type RectResult = UniApp.NodeInfo | null;

defineOptions({
  name: 'CmsTabContainer',
  options: {
    virtualHost: true,
    styleIsolation: 'shared',
  },
});

const props = withDefaults(defineProps<CmsBaseComponentProps>(), {
  ...cmsBaseComponentDefaults,
});

// --- 1. 基础 Hook 集成 ---
const {
  classes,
  envConfig,
  styles: containerStyles,
  handleTapBaseContainer,
  bindingValue,
} = useCmsComponent(props);

const instance = getCurrentInstance();
const containerId = `cms-tab-container-${
  instance?.uid || Math.random().toString(36).slice(2)
}`;

// 滚动监听 (业务预留)
const { onScroll } = usePageScroll();
onScroll(({ scrollTop }) => {
  /* optional logic */
});

// --- 2. 状态管理 ---
const activeIndex = ref(0);
const scrollIntoViewId = ref('');
const containerMinHeight = ref(''); // 动态高度锁
const processedTabs = ref<ProcessedTab[]>([]);

// --- 3. 核心逻辑：数据处理 ---

/**
 * 将原始配置转换为视图层可用的 Tab 结构
 * 包含数据清洗、模板应用、伪造数据处理
 */
const transformTabsData = (newData: CmsBaseComponentProps['data']) => {
  if (!newData.childrenData?.[0]) return [];

  const templateData = newData.childrenData[0];
  const panes = newData.readonlyData?.panes || [];

  // 1. 映射数据结构
  const list: ProcessedTab[] = panes.map((pane: any, index: number) => {
    const headerData = deepcopy({
      ...templateData,
      data: { ...templateData.data, tab: pane },
    });

    return {
      uniqueKey: pane.id || `tab_${index}`,
      headerComponentData: headerData,
      contentChildren: (pane.childrenData || []).filter((i: any) => i),
      hasBeenRendered: index === 0, // 默认只渲染第一个
    };
  });

  // 2. 处理编辑器模式下的伪造数据 (Fake Data)
  if (bindingValue?.fakeDataManager) {
    bindingValue.fakeDataManager.resetFakeData(newData);
    const headerList = list.map((t) => t.headerComponentData);
    bindingValue.fakeDataManager.processFakeData(newData, headerList);
  }

  return list;
};

watch(
  () => props.data,
  (newData) => {
    const list = transformTabsData(newData);
    processedTabs.value = list;

    // 索引越界修正
    if (list.length > 0 && activeIndex.value >= list.length) {
      activeIndex.value = 0;
    }
  },
  { immediate: true, deep: true }
);

// --- 4. 样式逻辑 ---

const hasUnderline = computed(() => {
  const d = props.data.data;
  return !!(d?.underlineWidth && d?.underlineHeight && d?.underlineColor);
});

const cssVars = computed(() => {
  const d = props.data.data || {};

  // [!核心逻辑] 计算吸顶的 Top 阈值
  const sysInfo = uni.getSystemInfoSync();
  const navStyle = envConfig?.value?.navigationStyle || 'default';
  const isCustom = navStyle === 'custom';
  let baseStickyTop = 0;

  // #ifdef H5
  // H5 不需要判断 custom，因为 windowTop 会自动处理导航栏高度
  baseStickyTop = sysInfo.windowTop || 0;
  // #endif

  // #ifndef H5
  if (isCustom) {
    // 如果是自定义导航栏，吸顶需要避开：状态栏 + 胶囊栏(44px)
    const statusBarH = sysInfo.statusBarHeight || 0;
    const navBarH = 44; // 胶囊高度通常固定为44，也可动态计算
    baseStickyTop = statusBarH + navBarH;
  } else {
    // 如果是默认导航栏，内容从导航栏下方开始，top 为 0 即可
    baseStickyTop = 0;
  }
  // #endif

  const fixedTopH = envConfig?.value?.fixedTopHeight || 0;
  const totalStickyTop = baseStickyTop + fixedTopH;

  // 总吸顶距离
  console.log('totalStickyTop', totalStickyTop);

  const activeW = parseInt(d.borderWeightActive) || 0;
  const inactiveW = parseInt(d.borderWeightInactive) || 0;

  // 2. [关键] 取最大值，作为统一的占位宽度
  const maxBorderW = Math.max(activeW, inactiveW);

  return {
    '--tab-font-size': d.textFontSize,
    '--tab-line-height': d.textLineHeight,
    '--tab-border-radius': d.textBorderRadius,
    '--tab-border-width': `${maxBorderW}px`,
    '--tab-padding-x': d.textPaddingX,
    '--tab-margin-x': d.textMarginX,
    '--active-bg': d.textBackgroundActive,
    '--active-color': d.textColorActive,
    '--active-border-color': d.borderColorActive || 'transparent',
    '--active-border-width': d.borderWeightActive || '0px',
    '--inactive-bg': d.textBackgroundInactive,
    '--inactive-color': d.textColorInactive,
    '--inactive-border-color': d.borderColorInactive || 'transparent',
    '--inactive-border-width': d.borderWeightInactive || '0px',
    '--underline-width': d.underlineWidth,
    '--underline-height': d.underlineHeight,
    '--underline-color': d.underlineColor,
    '--underline-radius': d.underlineBorderRadius,
    '--sticky-top': `${totalStickyTop}px`,
    '--header-bg': '#ffffff',
  } as CSSProperties;
});

provide('activeTabIndex', activeIndex);

// --- 5. 交互逻辑 (Helper Functions) ---

/**
 * [工具] 异步获取节点信息 (Promise化)
 */
const getRect = (selector: string): Promise<RectResult> => {
  return new Promise((resolve) => {
    if (!instance) return resolve(null);
    uni
      .createSelectorQuery()
      .in(instance)
      .select(selector)
      .boundingClientRect((res) => resolve(res as RectResult))
      .exec();
  });
};

/**
 * [核心] 切换 Tab 处理
 * 包含：懒加载触发、高度锁防止塌陷、智能回滚
 */
const handleSwitchTab = async (index: number) => {
  if (index === activeIndex.value) return;

  // 1. 【高度锁】切换前测量当前高度
  const containerRect = await getRect(`#${containerId}`);

  // 如果有高度，先强行锁死 min-height
  // 防止“长内容切短内容”时页面瞬间塌陷导致滚动条跳动
  if (containerRect?.height) {
    containerMinHeight.value = `${containerRect.height}px`;
  }

  // 2. 强制等待 DOM 样式生效
  await nextTick();

  // 3. 【切换】状态变更
  const targetTab = processedTabs.value[index];
  if (targetTab) targetTab.hasBeenRendered = true; // 触发懒加载
  activeIndex.value = index;

  // 4. 【智能回滚】检查头部位置
  const headerRect = await getRect('.cms-tab-header-sticky-wrapper');
  const stickyTop = parseInt(String(cssVars.value['--sticky-top'])) || 0;

  // 如果头部已经滚出去了（或者滚得太远），说明用户在浏览下方内容
  // 此时需要把页面拉回到 Tab 顶部，模拟“新页面”的感觉
  if (
    headerRect &&
    headerRect.top !== undefined &&
    headerRect.top <= stickyTop + 5
  ) {
    uni.pageScrollTo({
      selector: `#${containerId}`,
      duration: 0, // 必须是0，瞬间完成
      offsetTop: -stickyTop, // 抵消吸顶高度
    });
  }

  // 5. 【解锁】延迟释放高度
  // 稍微延迟一点，确保滚动动作完成且新内容已渲染
  setTimeout(() => {
    containerMinHeight.value = ''; // 清空，交还给 CSS 控制
  }, 100);

  // 6. 头部横向滚动 (居中策略：滚到前一个)
  // scrollIntoViewId.value = index > 0 ? `tab-item-${index - 1}` : `tab-item-0`;
};
</script>

<style lang="scss" scoped>
.cms-tab-container {
  position: relative;
  box-sizing: border-box;

  // 默认最小高度兜底
  min-height: 60vh;

  // --- 头部样式 ---
  .cms-tab-header-sticky-wrapper {
    position: sticky;
    top: var(--sticky-top);
    z-index: 100;
    background-color: var(--header-bg, #fff);
    width: 100%;
    max-width: 100vw;
    overflow: hidden;
    padding: 20rpx 0 20rpx;

    .cms-tab-header-scroll {
      white-space: nowrap;
      width: 100%;
      ::-webkit-scrollbar {
        display: none;
        width: 0 !important;
        height: 0 !important;
        -webkit-appearance: none;
        background: transparent;
      }

      .cms-tab-header-flex {
        display: flex;
        align-items: center;
      }

      .cms-tab-header-item {
        flex-shrink: 0;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        position: relative;
        box-sizing: border-box;
        border-style: solid;

        // 变量应用
        font-size: var(--tab-font-size);
        line-height: var(--tab-line-height);
        border-radius: var(--tab-border-radius);
        padding: 0 var(--tab-padding-x);
        margin-right: var(--tab-margin-x);

        // 默认状态
        background-color: var(--inactive-bg);
        color: var(--inactive-color);
        border-color: var(--inactive-border-color);
        border-width: var(--tab-border-width);
        box-sizing: border-box;

        &:last-child {
          margin-right: 0;
        }

        // 激活状态
        &.is-active {
          background-color: var(--active-bg);
          color: var(--active-color);
          border-color: var(--active-border-color);
        }

        // 下划线
        &.is-active.has-underline::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 50%;
          transform: translateX(-50%);
          width: var(--underline-width);
          height: var(--underline-height);
          border-radius: var(--underline-radius);
          background-color: var(--underline-color);
        }
      }
    }
  }

  // --- 内容样式 ---
  .cms-tab-content-wrapper {
    width: 100%;
    box-sizing: border-box;
    overflow-x: hidden;

    // 平滑过渡高度变化
    transition: min-height 0.3s ease-out;

    .cms-tab-content-pane {
      width: 100%;
      box-sizing: border-box;
      min-height: 100rpx;

      // 新内容淡入
      animation: fadeIn 0.3s ease-out;
    }
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
}
</style>

<template>
  <view
    :id="containerId"
    :class="classes"
    :data-component="data.componentCode"
    :style="[containerStyles, cssVars, { minHeight: containerMinHeight }]"
    class="cms-tab-container"
    @tap="handleTapBaseContainer"
  >
    <view class="cms-tab-header-wrapper">
      <scroll-view class="cms-tab-header-scroll" scroll-with-animation scroll-x>
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
import { CmsBaseComponentProps, CmsComponentData } from '../../cms';
import { cmsBaseComponentDefaults } from '../utils/constants';
import useCmsComponent from '../hooks/useCmsComponent';
import CmsBaseComponent from '../cms-base-component.vue';
import { deepcopy } from '../utils/deepcopy';
import { usePageScroll } from '../hooks/usePageScroll';

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

// --- Hook 集成 ---
const {
  classes,
  styles: containerStyles,
  handleTapBaseContainer,
  bindingValue,
} = useCmsComponent(props);

const instance = getCurrentInstance();
// 生成唯一ID用于滚动定位
const containerId = `cms-tab-container-${
  instance?.uid || Math.random().toString(36).slice(2)
}`;

// (保留滚动监听，如果业务需要)
const { onScroll } = usePageScroll();
onScroll(({ scrollTop }) => {
  // console.log('onScroll', scrollTop);
});

const activeIndex = ref(0);
const scrollIntoViewId = ref('');
// [!新增] 用于动态撑住容器高度
const containerMinHeight = ref('');

// --- 数据结构定义 ---
interface ProcessedTab {
  uniqueKey: string;
  headerComponentData: CmsComponentData;
  contentChildren: CmsComponentData[];
  hasBeenRendered: boolean;
}

const processedTabs = ref<ProcessedTab[]>([]);

// --- 核心逻辑：数据处理 ---
watch(
  () => props.data,
  (newData) => {
    if (!newData.childrenData || !newData.childrenData[0]) return;

    const templateData = newData.childrenData[0];
    const panes = newData.readonlyData?.panes || [];

    const list: ProcessedTab[] = panes.map((pane: any, index: number) => {
      const headerData = deepcopy({
        ...templateData,
        data: { ...templateData.data, tab: pane },
      });

      return {
        uniqueKey: pane.id || `tab_${index}`,
        headerComponentData: headerData,
        contentChildren: (pane.childrenData || []).filter((i: any) => i),
        hasBeenRendered: index === 0,
      };
    });

    if (bindingValue?.fakeDataManager) {
      bindingValue.fakeDataManager.resetFakeData(newData);
      const headerList = list.map((t) => t.headerComponentData);
      bindingValue.fakeDataManager.processFakeData(newData, headerList);
    }

    processedTabs.value = list;

    if (activeIndex.value >= list.length) {
      activeIndex.value = 0;
    }
  },
  { immediate: true, deep: true }
);

// --- 样式逻辑 ---
const hasUnderline = computed(() => {
  const d = props.data.data;
  return !!(d && d.underlineWidth && d.underlineHeight && d.underlineColor);
});

const cssVars = computed(() => {
  const d = props.data.data || {};

  // 假设吸顶高度是固定的或者动态计算的，这里填入您实际的逻辑
  const stickyTopVal = 0;

  return {
    '--tab-font-size': d.textFontSize,
    '--tab-line-height': d.textLineHeight,
    '--tab-border-radius': d.textBorderRadius,
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
    '--sticky-top': `${stickyTopVal}px`,
  } as CSSProperties;
});

provide('activeTabIndex', activeIndex);

// --- 交互逻辑 (核心修改) ---
const handleSwitchTab = async (index: number) => {
  if (index === activeIndex.value) return;

  // 1. [撑杆跳策略] 切换前，先测量当前高度
  if (instance) {
    const rect = await new Promise<UniApp.NodeInfo>((resolve) => {
      uni
        .createSelectorQuery()
        .in(instance)
        .select(`#${containerId}`) // 选中最外层容器
        .boundingClientRect(resolve)
        .exec();
    });

    // 如果当前高度很高，先把它锁死！
    // 防止切换瞬间页面高度塌陷，导致浏览器强行重置滚动条
    if (rect && rect.height) {
      containerMinHeight.value = `${rect.height}px`;
    }
  }

  // 2. 强制等待 DOM 更新，确保 min-height 生效
  await nextTick();

  // 3. 触发懒加载并切换显示
  if (processedTabs.value[index]) {
    processedTabs.value[index]!.hasBeenRendered = true;
  }
  activeIndex.value = index;

  // 4. [智能回滚] 检查是否需要滚回顶部
  if (instance) {
    uni
      .createSelectorQuery()
      .in(instance)
      .select('.cms-tab-header-sticky-wrapper')
      .boundingClientRect((res) => {
        const headerRect = res as UniApp.NodeInfo;
        const stickyTop = parseInt(String(cssVars.value['--sticky-top'])) || 0;

        // 如果头部已经滚出去了（top < stickyTop），或者滚得太远
        if (headerRect && headerRect.top <= stickyTop + 5) {
          uni.pageScrollTo({
            selector: `#${containerId}`, // 滚回容器顶部
            duration: 0, // 瞬时完成
            offsetTop: -stickyTop,
          });
        }
      })
      .exec();
  }

  // 5. [撤销撑杆] 延迟解锁高度
  // 稍微延迟一点，确保滚动动作完成，且新 Tab 已经渲染
  setTimeout(() => {
    // 清空内联样式，让 CSS 接管 (回退到默认的 min-height)
    containerMinHeight.value = '';
  }, 100);

  // 6. 头部横向滚动 (可选)
  // scrollIntoViewId.value = index > 0 ? `tab-item-${index - 1}` : `tab-item-0`;
};
</script>

<style lang="scss" scoped>
.cms-tab-container {
  position: relative;
  // 确保内边距不撑大容器
  box-sizing: border-box;

  // [!关键] 默认给一个最小高度，防止解锁后变为0
  min-height: 60vh;

  // --- 头部样式 ---
  .cms-tab-header-sticky-wrapper {
    position: sticky;
    top: var(--sticky-top);
    z-index: 10;
    background-color: #fff;
    width: 100%;
    max-width: 100vw;
    overflow: hidden;
  }

  .cms-tab-header-scroll {
    white-space: nowrap;
    width: 100%;

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

      font-size: var(--tab-font-size);
      line-height: var(--tab-line-height);
      border-radius: var(--tab-border-radius);
      padding: 0 var(--tab-padding-x);
      margin-right: var(--tab-margin-x);
      border-style: solid;
      box-sizing: border-box;

      background-color: var(--inactive-bg);
      color: var(--inactive-color);
      border-color: var(--inactive-border-color);
      border-width: var(--inactive-border-width);

      &:last-child {
        margin-right: 0;
      }

      &.is-active {
        background-color: var(--active-bg);
        color: var(--active-color);
        border-color: var(--active-border-color);
        border-width: var(--active-border-width);
      }

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

  // --- 内容样式 ---
  .cms-tab-content-wrapper {
    width: 100%;
    box-sizing: border-box;
    overflow-x: hidden;
    transition: min-height 0.3s ease-out;

    .cms-tab-content-pane {
      width: 100%;
      box-sizing: border-box;
      min-height: 100rpx;
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

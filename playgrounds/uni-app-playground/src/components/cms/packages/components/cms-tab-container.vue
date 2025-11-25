<template>
  <view
    :class="classes"
    :data-component="data.componentCode"
    :style="[containerStyles, cssVars]"
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
import { ref, computed, watch, provide, type CSSProperties } from 'vue';
import { CmsBaseComponentProps, CmsComponentData } from '../../cms';
import { cmsBaseComponentDefaults } from '../utils/constants';
import useCmsComponent from '../hooks/useCmsComponent';
import CmsBaseComponent from '../cms-base-component.vue';
import { deepcopy } from '../utils/deepcopy';

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

// --- 状态管理 ---
const activeIndex = ref(0);
const scrollIntoViewId = ref('');

// --- 数据结构定义 ---
interface ProcessedTab {
  uniqueKey: string;
  headerComponentData: CmsComponentData;
  contentChildren: CmsComponentData[];
  hasBeenRendered: boolean;
}

const processedTabs = ref<ProcessedTab[]>([]);

// --- 核心逻辑：数据处理 ---
// 监听数据变化，生成 Tab 结构。使用 watch 而不是 computed 以便处理 fakeData 副作用
watch(
  () => props.data,
  (newData) => {
    if (!newData.childrenData || !newData.childrenData[0]) return;

    const templateData = newData.childrenData[0]; // 标题模板组件
    const panes = newData.readonlyData?.panes || [];

    const list: ProcessedTab[] = panes.map((pane: any, index: number) => {
      // 基于模板，构造标题组件的数据
      const headerData = deepcopy({
        ...templateData,
        data: { ...templateData.data, tab: pane },
      });

      return {
        uniqueKey: pane.id || `tab_${index}`,
        headerComponentData: headerData,
        // 过滤无效子组件
        contentChildren: (pane.childrenData || []).filter((i: any) => i),
        // 初始化策略：默认只渲染第 0 个，其他的懒加载
        hasBeenRendered: index === 0,
      };
    });

    // 处理编辑器模式下的伪造数据 ID (关键)
    if (bindingValue?.fakeDataManager) {
      bindingValue.fakeDataManager.resetFakeData(newData);
      const headerList = list.map((t) => t.headerComponentData);
      bindingValue.fakeDataManager.processFakeData(newData, headerList);
    }

    processedTabs.value = list;

    // 越界修正（防止数据更新后 activeIndex 超出范围）
    if (activeIndex.value >= list.length) {
      activeIndex.value = 0;
    }
  },
  { immediate: true, deep: true }
);

// --- 样式逻辑：CSS 变量 ---
const hasUnderline = computed(() => {
  const d = props.data.data;
  return !!(d && d.underlineWidth && d.underlineHeight && d.underlineColor);
});

const cssVars = computed(() => {
  const d = props.data.data || {};

  // 将所有配置样式映射为 CSS 变量，极大简化模板
  return {
    // 字体与间距
    '--tab-font-size': d.textFontSize,
    '--tab-line-height': d.textLineHeight,
    '--tab-border-radius': d.textBorderRadius,
    '--tab-padding-x': d.textPaddingX,
    '--tab-margin-x': d.textMarginX,

    // 激活状态
    '--active-bg': d.textBackgroundActive,
    '--active-color': d.textColorActive,
    '--active-border-color': d.borderColorActive || 'transparent',
    '--active-border-width': d.borderWeightActive || '0px',

    // 未激活状态
    '--inactive-bg': d.textBackgroundInactive,
    '--inactive-color': d.textColorInactive,
    '--inactive-border-color': d.borderColorInactive || 'transparent',
    '--inactive-border-width': d.borderWeightInactive || '0px',

    // 下划线
    '--underline-width': d.underlineWidth,
    '--underline-height': d.underlineHeight,
    '--underline-color': d.underlineColor,
    '--underline-radius': d.underlineBorderRadius,
  } as CSSProperties;
});

// 向下提供当前激活的 index，子组件(如Video)可能需要知道自己是否显示
provide('activeTabIndex', activeIndex);

// --- 交互逻辑 ---
const handleSwitchTab = (index: number) => {
  if (index === activeIndex.value) return;

  // 1. 触发懒加载：标记该 tab 为“已渲染”
  processedTabs.value[index]!.hasBeenRendered = true;

  // 2. 切换视图
  activeIndex.value = index;

  // // 3. 头部自动滚动居中 (简单策略：滚到前一个 item)
  // // 这样当前 item 会靠左或居中显示
  // scrollIntoViewId.value = index > 0 ? `tab-item-${index - 1}` : `tab-item-0`;
};
</script>

<style lang="scss" scoped>
.cms-tab-container {
  position: relative;
  // [!删除] 不要写 width: 100%;
  // 因为 useCmsComponent 的 styles 可能包含 margin/padding
  // 块级元素默认会自动填满剩余空间，写了 100% 反而会撑破

  // [!新增] 确保内边距不撑大容器
  box-sizing: border-box;

  // --- 头部样式 ---
  .cms-tab-header-sticky-wrapper {
    position: sticky;
    top: var(--sticky-top);
    z-index: 10;
    background-color: #fff;

    // [!修改] 头部必须限制宽度，否则 scroll-view 无法滚动
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

      // 应用 CSS 变量
      font-size: var(--tab-font-size);
      line-height: var(--tab-line-height);
      border-radius: var(--tab-border-radius);
      padding: 0 var(--tab-padding-x);
      margin-right: var(--tab-margin-x);

      // 默认样式
      border-style: solid;
      background-color: var(--inactive-bg);
      color: var(--inactive-color);
      border-color: var(--inactive-border-color);
      border-width: var(--inactive-border-width);

      // 确保盒模型正确
      box-sizing: border-box;

      &:last-child {
        margin-right: 0;
      }

      // 激活样式
      &.is-active {
        background-color: var(--active-bg);
        color: var(--active-color);
        border-color: var(--active-border-color);
        border-width: var(--active-border-width);
      }

      // 下划线样式
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
    // [!修改] 同样去掉 width: 100% 或者加上 box-sizing
    // 建议直接用 100% 配合 border-box
    width: 100%;
    box-sizing: border-box;

    // [!新增] 防止子元素意外撑开导致页面横向滚动
    overflow-x: hidden;

    .cms-tab-content-pane {
      width: 100%;
      box-sizing: border-box;
      min-height: 100rpx;
    }
  }
}
</style>

<template>
  <view
    :id="tabId"
    :class="classes"
    :data-component="data.componentCode"
    :style="styles"
    @tap="handleTapBaseContainer"
  >
    <scroll-view
      :scroll-into-view="`${
        activeTab.index ? `tab-${activeTab.index - 1}` : ''
      }`"
      :style="headerStyles"
      class="cms-tab-header-wrapper"
      scroll-with-animation
      scroll-x
    >
      <view class="cms-tab-header-title">
        <view
          v-for="(tab, index) in tabsTitleChildrenData.filter((i) => i)"
          :id="`tab-${index}`"
          :key="tab.componentId"
          :style="
            tabs[index].active
              ? innerStyles.activeStyles
              : innerStyles.inactiveStyles
          "
          class="cms-tab-header-item"
          :class="
            tabs[index].active &&
            data.data.underlineWidth &&
            data.data.underlineHeight &&
            data.data.underlineColor
              ? 'cms-tab-header-item-active-underLine'
              : ''
          "
          @tap="showTab(tabs[index])"
        >
          <cms-base-component :data="tab" :index="index" />
        </view>
      </view>
    </scroll-view>
    <template v-for="(tab, tabIndex) in tabs">
      <view
        v-if="!!tab.init"
        :key="tab.title"
        :style="tabStyles[tabIndex]"
        class="cms-tab-content"
      >
        <cms-base-component
          v-for="(item, index) in tab.childrenData.filter((i) => i)"
          :key="item.componentId"
          :data="item"
          :index="index"
          :is-hidden="!tab.active || !tab.init"
        />
      </view>
    </template>
  </view>
</template>

<script lang="ts" setup>
import { CmsBaseComponentProps } from '../../cms';
import { cmsBaseComponentDefaults } from '../utils/constants';
import useCmsComponent from '../hooks/useCmsComponent';
import {
  computed,
  getCurrentInstance,
  inject,
  nextTick,
  onMounted,
  onUnmounted,
  provide,
  reactive,
  ref,
} from 'vue';
import { convertStyleToString, iterateComponentData } from '../utils/utils';
import { deepcopy } from '../utils/deepcopy';
import { defer } from '../utils/defer';
import CmsBaseComponent from '../cms-base-component.vue';

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

const { classes, styles, handleTapBaseContainer, envConfig, bindingValue } =
  useCmsComponent(props);

const instance = getCurrentInstance();

// --- ID 生成 ---
const nextTabId = (() => {
  let count = 0;
  return () => `tab_header_${count++}`;
})();
const tabId = ref(nextTabId());

// --- 注入依赖 ---
const pageScrollEvent: any = inject('pageScrollEvent', {});
const tabPos: any = inject('tabPos', () => ({}));
const changeFirstPos: any = inject('changeFirstPos', () => {});

// --- 状态定义 ---
const statusBarHeight = uni.getSystemInfoSync().statusBarHeight || 0;
// 假设 envConfig 中有这些配置，如果没有则给默认值
const env = computed(() => ({
  fixedTopHeight: envConfig?.value?.fixedTopHeight || 0,
  navHeight: envConfig?.value?.navHeight || 44,
}));

const headerStickyTop = ref(0);
const headerStickyTopStyles = ref('');

const tabs = reactive(
  (props.data.readonlyData?.panes || []).map((item: any, index: number) => ({
    ...item,
    index,
    active: false,
    init: false,
    scrollTop: null as number | null,
  }))
);

const activeTab = ref<any>({});
const videoDataMap = reactive<Record<number, any>>({});
const minHeight = ref<string | null>(null);

const opacityState = reactive({
  opacity: 1,
  transition: 'opacity .05s',
});
const opacityControl = {
  show: () => {
    opacityState.opacity = 1;
  },
  hide: () => {
    opacityState.opacity = 0.3;
  },
};

provide(
  'activeTabIndex',
  computed(() => activeTab.value.index)
);

const headerStyles = computed(() => {
  return convertStyleToString({ top: headerStickyTopStyles.value });
});

const hasUnderline = computed(() => {
  const d = props.data.data;
  return d && d.underlineWidth && d.underlineHeight && d.underlineColor;
});

const tabStyles = computed(() => {
  // 获取当前路由名称 (需要根据您的路由插件调整)
  const pages = getCurrentPages();
  const currentRoute = pages[pages.length - 1]?.route || '';
  const isCourseCLP = currentRoute.includes('cmsCourseCLP');

  return tabs.map((item: any) =>
    convertStyleToString({
      display: item.active && item.init ? 'block' : 'none',
      left: 0,
      top: 0,
      opacity: opacityState.opacity,
      transition: isCourseCLP ? 'unset' : opacityState.transition,
      minHeight: minHeight.value || 0,
    })
  );
});

const innerStyles = computed(() => {
  const d = props.data.data || {};
  const publicStyles = {
    lineHeight: d.textLineHeight,
    fontSize: d.textFontSize,
    borderRadius: d.textBorderRadius,
    paddingLeft: d.textPaddingX,
    paddingRight: d.textPaddingX,
    marginRight: d.textMarginX,
    '--underline-width': d.underlineWidth,
    '--underline-height': d.underlineHeight,
    '--underline-color': d.underlineColor,
    '--underline-border-radius': d.underlineBorderRadius,
  };

  const activeStyles = {
    ...publicStyles,
    backgroundColor: d.textBackgroundActive,
    color: d.textColorActive,
    borderColor: d.borderColorActive,
    borderWidth: d.borderWeightActive,
    ...(d.borderColorActive && d.borderWeightActive
      ? { borderStyle: 'solid' }
      : {}),
  };

  const inactiveStyles = {
    ...publicStyles,
    backgroundColor: d.textBackgroundInactive,
    color: d.textColorInactive,
    borderColor: d.borderColorInactive,
    borderWidth: d.borderWeightInactive,
    ...(d.borderColorInactive && d.borderWeightInactive
      ? { borderStyle: 'solid' }
      : {}),
  };

  return {
    activeStyles: convertStyleToString(activeStyles),
    inactiveStyles: convertStyleToString(inactiveStyles),
  };
});

/**
 * 标题子节点数据 (包含伪造数据逻辑)
 */
const tabsTitleChildrenData = computed(() => {
  if (!props.data.childrenData || !props.data.childrenData[0]) {
    console.error('tab-container：当前未配置标签容器标题模板');
    return [];
  }

  const templateData = props.data.childrenData[0];
  const list = (props.data.readonlyData?.panes || []).map((item: any) =>
    deepcopy({
      ...templateData,
      data: {
        ...templateData.data,
        tab: item,
      },
    })
  );

  // [!重要] 这里使用了 bindingValue 中的伪造数据管理器
  if (bindingValue?.fakeDataManager) {
    bindingValue.fakeDataManager.resetFakeData(props.data);
    bindingValue.fakeDataManager.processFakeData(props.data, list);
  }

  return list;
});

const initTab = () => {
  tabs.forEach((item: any, index: number) => {
    item.active = index === 0;
    item.init = index === 0;
  });
  activeTab.value = tabs[0];
};

const getTabHeight = async () => {
  // 确保在组件实例范围内查询
  if (!instance) return;
  return new Promise((resolve, reject) => {
    uni
      .createSelectorQuery()
      .in(instance)
      .select('.cms-tab-content')
      .boundingClientRect()
      .exec((res) => {
        if (res && res[0]) {
          minHeight.value = `${res[0].height}px`;
          resolve(res[0]);
        } else {
          // 可能是第一次渲染还未完成，不 reject，直接返回
          resolve(null);
        }
      });
  });
};

const getScrollTop = () => {
  if (pageScrollEvent && pageScrollEvent.getScrollTop) {
    return pageScrollEvent.getScrollTop();
  }
  return 0;
};

const getHeadOffsetTop = () => {
  const dfd = defer();
  if (instance) {
    uni
      .createSelectorQuery()
      .in(instance)
      .select('.cms-tab-header-wrapper')
      .boundingClientRect()
      .exec((res) => {
        if (res && res[0]) {
          dfd.resolve(res[0].top);
        } else {
          dfd.resolve(0);
        }
      });
  } else {
    dfd.resolve(0);
  }
  return dfd.promise;
};

const showTab = async (tab: any) => {
  if (tab.active) return;

  // 路由判断 (替换原有的 this.$Route)
  const pages = getCurrentPages();
  const currentRoute = pages[pages.length - 1]?.route || '';
  const isCourseCLP = currentRoute.includes('cmsCourseCLP');

  if (!isCourseCLP) {
    await getTabHeight();
  }

  const currentActive = tabs.find((i) => i.active) || tabs[0];

  // 隐藏旧 Tab
  opacityControl.hide();

  if (!isCourseCLP) {
    const pageScrollTop = getScrollTop();
    const headOffsetTop: any = await getHeadOffsetTop();

    // 判断是否吸顶
    // 注意：这里可能存在精度问题，原代码用 ===，建议允许微小误差
    if (Math.abs(headOffsetTop - headerStickyTop.value) < 2) {
      setTimeout(() => {
        if (tab.scrollTop != null) {
          uni.pageScrollTo({ scrollTop: tab.scrollTop, duration: 0 });
        } else {
          // 滚动到 Tab 容器顶部
          uni.pageScrollTo({
            selector: `.cms-page >>> #${tabId.value}`,
            duration: 0,
          });
        }
        opacityControl.show();
      }, 10);
      // 记录旧 Tab 的滚动位置
      tabs[currentActive.index].scrollTop = pageScrollTop;
    } else {
      setTimeout(() => {
        opacityControl.show();
      }, 10);
      tabs[currentActive.index].scrollTop = null;
    }
  } else {
    setTimeout(() => {
      opacityControl.show();
    }, 10);
    tabs[currentActive.index].scrollTop = null;
  }

  // 切换状态
  tabs[currentActive.index].active = false;
  if (!tab.init) {
    tabs[tab.index].init = true;
  }
  tabs[tab.index].active = true;
  activeTab.value = tabs[tab.index];

  uni.$emit('switchTab', {
    videoComponentId: videoDataMap[tab.index]?.componentId,
  });

  if (changeFirstPos && typeof changeFirstPos === 'function') {
    changeFirstPos(tab.title);
  }
};

// --- 生命周期 ---

onMounted(() => {
  // 计算吸顶高度初始值
  headerStickyTop.value =
    env.value.fixedTopHeight + env.value.navHeight + statusBarHeight;
  headerStickyTopStyles.value = `calc(${
    (env.value.fixedTopHeight + env.value.navHeight) * 2
  }rpx + ${statusBarHeight}px)`;

  // 处理初始定位
  if (tabPos && typeof tabPos === 'function') {
    const { firstPos = '' } = tabPos() || {};
    if (firstPos) {
      const targetTab = tabs.find((i) => i.title === firstPos);
      if (targetTab) {
        tabs[targetTab.index].active = true;
        activeTab.value = tabs[targetTab.index];
        if (!targetTab.init) {
          tabs[targetTab.index].init = true;
        }
        // 延迟一下 emit，确保子组件已挂载
        nextTick(() => {
          uni.$emit('switchTab', {
            videoComponentId: videoDataMap[activeTab.value.index]?.componentId,
          });
        });
      } else {
        initTab();
      }
    } else {
      initTab();
    }
  } else {
    initTab();
  }

  // 监听吸顶高度变化
  uni.$on('hasFixedContainer', ({ height }) => {
    headerStickyTopStyles.value = `calc(${
      (env.value.fixedTopHeight + env.value.navHeight) * 2
    }rpx + ${height}px + ${statusBarHeight}px)`;
    headerStickyTop.value =
      height + env.value.navHeight + env.value.fixedTopHeight + statusBarHeight;
  });

  // 收集 Video 数据
  tabs.forEach((tab: any) => {
    iterateComponentData((data) => {
      if (data.componentCode === 'video') {
        videoDataMap[tab.index] = deepcopy(data);
      }
    }, tab.childrenData || []);
  });
});

onUnmounted(() => {
  uni.$off('hasFixedContainer');
  uni.$off('cmsVideoData'); // 原代码有这个 off，但没看到 on，保留以防万一
});
</script>

<style lang="scss">
.cms-tab-container {
  .cms-tab-header-wrapper {
    white-space: nowrap;
    width: 100%;
    position: sticky;
    z-index: 3;
    .cms-tab-header-item {
      flex-shrink: 0;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      &:last-child {
        margin-right: 0 !important;
      }
    }
    .cms-tab-header-item-active-underLine {
      position: relative;
      &::after {
        content: '';
        position: absolute;
        bottom: 0;
        left: calc(50% - 1 / 2 * var(--underline-width));
        width: var(--underline-width);
        height: var(--underline-height);
        border-radius: var(--underline-border-radius);
        background-color: var(--underline-color);
      }
    }
  }
}
</style>

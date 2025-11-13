z
<template>
  <view id="tabId" :class="classes" :data-component="data.componentCode" :style="styles" @tap="handleTapBaseContainer">
    <scroll-view :enable-flex="true" :scroll-y="true" class="vertical-tab-header-wrapper">
      <view class="vertical-tab-header">
        <view v-for="tab in tabs" :key="tab.title" :class="['tab-header-item', { 'tab-header-active': tab.active }]" @tap="showTab(tab)">
          <view :class="['tab-header-item-label']">
            {{ tab.title }}
          </view>
        </view>
      </view>
    </scroll-view>
    <view v-if="isCourseClpPage" class="vertical-tab-content-wrapper">
      <view class="vertical-tab-content" :style="{ height: '100%' }">
        <template v-for="(tab, tabIndex) in tabs">
          <view v-if="!!tab.init" :key="tab.title" :style="tabStyles[tabIndex]">
            <cms-base-component v-for="(item, index) in tab.childrenData" :key="item.componentId" :data="item" :index="index" />
          </view>
        </template>
      </view>
    </view>
    <scroll-view v-else class="vertical-tab-content-wrapper">
      <view class="vertical-tab-content">
        <template v-for="(tab, tabIndex) in tabs">
          <view v-if="!!tab.init" :key="tab.title" :style="tabStyles[tabIndex]">
            <cms-base-component v-for="(item, index) in tab.childrenData" :key="item.componentId" :data="item" :index="index" />
          </view>
        </template>
      </view>
    </scroll-view>
  </view>
</template>
<script>
  import { CmsComponentMixin } from '@/components/cms/packages/utils/CmsComponentMixin';
  import { convertStyleToString } from '@/utils/utils';

  export default {
    name: 'CmsVerticalTabContainer',
    mixins: [CmsComponentMixin],
    inject: {
      tabPos: { value: 'tabPos', default: () => {} },
      changeSecondPos: { value: 'changeSecondPos', default: () => {} },
    },
    data() {
      return {
        statusBarHeight: 0,
        tabs: this.data.readonlyData.panes.map((item) => ({
          ...item,
          active: false, // 当前是否显示
          init: false, // 当前是否已经初始化，不能一开始就初始化所有的页签。某些组件初始化的时候如果没有高度会导致无法显示
        })),
      };
    },
    mounted() {
      this.statusBarHeight = uni.getSystemInfoSync().statusBarHeight + 'px';

      // 父页面如果指定了tab,优先展示
      let secondPosition = null;
      if (this.tabPos) {
        const { secondPos = '' } = this.tabPos() || {};
        secondPosition = secondPos;
      }

      if (secondPosition) {
        const activeTab = this.tabs.find((i) => i.title === secondPosition);
        if (activeTab) {
          this.showTab(activeTab);
        } else {
          this.showTab(this.tabs[0]);
        }
      } else {
        this.showTab(this.tabs[0]);
      }
    },
    computed: {
      tabStyles() {
        return this.tabs.map((item) =>
          convertStyleToString({
            display: item.active && item.init ? 'block' : 'none',
            ...(this.isCourseClpPage && { height: '100%' }),
          }),
        );
      },
      // 选中tab页签的下标
      activeTabIndex() {
        return this.tabs.findIndex((item) => item.active);
      },
      isCourseClpPage() {
        return this.$Route.name === 'cmsCourseCLP';
      },
    },
    methods: {
      adjustStyles(styles) {
        // #ifdef MP-WEIXIN || APP-PLUS
        if (this.$Route.name === 'cmsCourseCLP') {
          // 减去tab-header的高度(80rpx)
          styles.height = `calc(100vh - var(--SEARCH-BAR-HEIGHT) - var(--NAV-HEIGHT) - env(safe-area-inset-bottom) - ${this.statusBarHeight} - 80rpx)`;
        } else {
          styles.height = `calc(100vh - var(--TABBAR-HEIGHT) - var(--SEARCH-BAR-HEIGHT) - var(--NAV-HEIGHT) - env(safe-area-inset-bottom) - ${this.statusBarHeight})`;
        }
        // #endif
        styles.overflow = 'hidden';
      },
      showTab(tab) {
        if (tab.active) {
          return;
        }
        const activeTab = this.tabs.find((i) => i.active) || this.tabs[0];
        /*旧的tab隐藏，新的tab显示*/
        activeTab.active = false;
        /*如果显示的tab没有初始化则初始化*/
        if (!tab.init) {
          tab.init = true;
        }
        tab.active = true;
        if (this.changeSecondPos) this.changeSecondPos(tab.title);
      },
    },
  };
</script>
<style lang="scss">
  .cms-vertical-tab-container {
    display: flex !important;
    /* #ifdef H5 */
    height: calc(100vh - var(--TABBAR-HEIGHT));
    /* #endif */

    .vertical-tab-header-wrapper {
      width: 168rpx;
      overflow-x: hidden;
      flex-shrink: 0;
      background-color: var(--GREY4);

      .vertical-tab-header {
        display: flex;
        flex-direction: column;

        .tab-header-item {
          width: 100%;
          height: 112rpx;
          padding: 0 8rpx;
          box-sizing: border-box;
          line-height: 102rpx;
          text-align: center;
          display: flex;
          align-items: center;
          justify-content: center;

          .tab-header-item-label {
            font-size: 24rpx;
            @include font-regular();
            font-weight: 400;
            color: #828485;
            line-height: 36rpx;
            display: -webkit-box;
            -webkit-box-orient: vertical;
            -webkit-line-clamp: 2;
            overflow: hidden;
            text-overflow: ellipsis;
          }
        }

        .tab-header-active {
          position: relative;
          background: var(--WHITE);

          &:after {
            content: '';
            position: absolute;
            display: block;
            left: 0;
            top: 22rpx;
            height: 68rpx;
            width: 2rpx;
            background: #000;
          }

          .tab-header-item-label {
            @include font-medium();
            color: #000000;
            font-weight: 500;
          }
        }

        .tab-header-prevBorder {
          border-radius: 0 0 30rpx 0;
        }

        .tab-header-nextBorder {
          border-radius: 0 30rpx 0 0;
        }
      }
    }

    .vertical-tab-content-wrapper {
      flex: 1;
      width: calc(100% - 192rpx);
      height: 100%;
    }
  }
</style>

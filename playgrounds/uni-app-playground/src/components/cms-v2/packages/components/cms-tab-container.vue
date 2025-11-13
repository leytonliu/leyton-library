<template>
  <view :id="tabId" :class="classes" :data-component="data.componentCode" :style="styles" @tap="handleTapBaseContainer">
    <scroll-view :scroll-into-view="`${activeTab.index ? `tab-${activeTab.index - 1}` : ''}`" :style="headerStyles" class="cms-tab-header-wrapper" scroll-with-animation scroll-x>
      <view class="cms-tab-header-title">
        <view v-for="(tab, index) in tabsTitleChildrenData.filter((i) => i)" :id="`tab-${index}`" :key="tab.componentId" :style="tabs[index].active ? innerStyles.activeStyles : innerStyles.inactiveStyles" class="cms-tab-header-item" :class="tabs[index].active && data.data.underlineWidth && data.data.underlineHeight && data.data.underlineColor ? 'cms-tab-header-item-active-underLine' : ''" @tap="showTab(tabs[index])">
          <cms-base-component :data="tab" :index="index" />
        </view>
      </view>
    </scroll-view>
    <template v-for="(tab, tabIndex) in tabs">
      <view v-if="!!tab.init" :key="tab.title" :style="tabStyles[tabIndex]" class="cms-tab-content">
        <cms-base-component v-for="(item, index) in tab.childrenData.filter((i) => i)" :key="item.componentId" :data="item" :index="index" :is-hidden="!tab.active || !tab.init" />
      </view>
    </template>
  </view>
</template>

<script>
  import { CmsComponentMixin } from '@/components/cms/packages/utils/CmsComponentMixin';
  import { convertStyleToString } from '@/utils/utils';
  import { defer } from '@/utils/defer';
  import { deepcopy } from '../utils/deepcopy';
  import { iterateComponentData } from '../utils/iterateComponentData';
  import { trackCmsTabClick } from '@/components/cms/packages/utils/cmsTrackers';

  /**
   * 获取一个tab id，用来滚动的时候，pageScrollTo滚动到这个selector。前提是cms所在的页面根节点必须有一个叫做cms-page的根节点样式
   * @author  韦胜健
   * @date    2022/9/20 9:15
   */
  const nextTabId = (() => {
    let count = 0;
    return () => `tab_header_${count++}`;
  })();

  export default {
    name: 'CmsTabContainer',
    mixins: [CmsComponentMixin],
    provide() {
      return {
        activeTabIndex: () => this.activeTab.index,
      };
    },
    inject: {
      pageScrollEvent: { value: 'pageScrollEvent', default: {} },
      tabPos: { value: 'tabPos', default: () => {} },
      changeFirstPos: { value: 'changeFirstPos', default: () => {} },
    },
    data() {
      return {
        tabId: nextTabId(),
        /*标题粘性定位，距离顶部距离*/
        headerStickyTop: this.env.fixedTopHeight + this.env.navHeight + this.statusBarHeight,
        headerStickyTopStyles: `calc(${(this.env.fixedTopHeight + this.env.navHeight) * 2}rpx + ${this.statusBarHeight}px)`,
        /*页签数据*/
        tabs: this.data.readonlyData.panes.map((item, index) => ({
          ...item,
          index,
          active: false, // 当前是否显示
          init: false, // 当前是否已经初始化，不能一开始就初始化所有的页签。某些组件初始化的时候如果没有高度会导致无法显示
          scrollTop: null, // 页签的缓存滚动高度，用于显示页签的时候滚动到之前隐藏页签的时候的高度
        })),
        activeTab: {}, // 当前激活的tab数据
        /**
         * 在切换页签的时候设置透明度为0，待滚动高度设置完毕之后再设置为1显示，不过由于小程序中的UI是异步渲染，这里感觉好像没什么用
         * @author  韦胜健
         * @date    2022/9/20 9:18
         */
        opacityControl: (() => {
          const state = {
            opacity: 1,
            transition: 'opacity .05s',
          };
          const show = () => {
            // this.opacityControl.state.transition = 'opacity .5s';
            this.opacityControl.state.opacity = 1;
          };
          const hide = () => {
            // this.opacityControl.state.transition = 'opacity .5s';
            this.opacityControl.state.opacity = 0.3;
          };
          return { state, show, hide };
        })(),
        videoDataMap: {},
        minHeight: null,
      };
    },
    computed: {
      /**
       * header容器黏在顶部样式定位
       * @author  韦胜健
       * @date    2022/9/20 9:19
       */
      headerStyles() {
        return convertStyleToString({ top: this.headerStickyTopStyles });
      },
      /**
       * 每个tab子页签的样式
       * @author  韦胜健
       * @date    2022/9/20 9:19
       */
      tabStyles() {
        return this.tabs.map((item) =>
          convertStyleToString({
            display: item.active && item.init ? 'block' : 'none',
            // position: item.active && item.init ? 'static' : 'absolute',
            left: 0,
            top: 0,
            opacity: this.opacityControl.state.opacity,
            transition: this.$Route.name === 'cmsCourseCLP' ? 'unset' : this.opacityControl.state.transition,
            minHeight: this.minHeight,
          }),
        );
      },
      innerStyles() {
        const publicStyles = {
          lineHeight: this.data.data.textLineHeight,
          fontSize: this.data.data.textFontSize,
          borderRadius: this.data.data.textBorderRadius,
          paddingLeft: this.data.data.textPaddingX,
          paddingRight: this.data.data.textPaddingX,
          marginRight: this.data.data.textMarginX,
          '--underline-width': this.data.data.underlineWidth,
          '--underline-height': this.data.data.underlineHeight,
          '--underline-color': this.data.data.underlineColor,
          '--underline-border-radius': this.data.data.underlineBorderRadius,
        };

        const activeStyles = {
          ...publicStyles,
          backgroundColor: this.data.data.textBackgroundActive,
          color: this.data.data.textColorActive,
          borderColor: this.data.data.borderColorActive,
          borderWidth: this.data.data.borderWeightActive,
          ...(this.data.data.borderColorActive && this.data.data.borderWeightActive ? { borderStyle: 'solid' } : {}),
        };
        const inactiveStyles = {
          ...publicStyles,
          backgroundColor: this.data.data.textBackgroundInactive,
          color: this.data.data.textColorInactive,
          borderColor: this.data.data.borderColorInactive,
          borderWidth: this.data.data.borderWeightInactive,
          ...(this.data.data.borderColorInactive && this.data.data.borderWeightInactive ? { borderStyle: 'solid' } : {}),
        };

        return { activeStyles: convertStyleToString(activeStyles), inactiveStyles: convertStyleToString(inactiveStyles) };
      },
      /**
       * 标题子节点数据
       */
      tabsTitleChildrenData() {
        if (!this.data.childrenData || !this.data.childrenData[0]) {
          console.error('tab-container：当前未配置标签容器标题模板');
          return [];
        }
        // 模板数据
        const templateData = this.data.childrenData?.[0];
        const list = (this.data.readonlyData.panes || []).map((item) =>
          deepcopy({
            ...templateData,
            data: {
              ...templateData.data,
              tab: item,
            },
          }),
        );
        /*处理伪造的数据*/
        this.bindingValue.fakeDataManager.resetFakeData(this.data);
        this.bindingValue.fakeDataManager.processFakeData(this.data, list);

        return list;
      },
    },
    mounted() {
      if (this.tabPos) {
        // tabPos()这里只能用方法获取参数，否则拿不到数据
        const { firstPos = '' } = this.tabPos() || {};
        // 当配置了目标页签，则直接跳转到对应页签，否则默认打开第一个页签
        if (firstPos) {
          const activeTab = this.tabs.find((i) => i.title === firstPos);
          this.tabs[activeTab.index].active = true;
          this.activeTab = this.tabs[activeTab.index];
          if (!activeTab.init) {
            this.tabs[activeTab.index].init = true;
          }
          uni.$emit('switchTab', { videoComponentId: this.videoDataMap[activeTab.index]?.componentId });
        } else {
          this.initTab();
        }
      } else {
        this.initTab();
      }

      uni.$on('hasFixedContainer', ({ height }) => {
        this.headerStickyTopStyles = `calc(${(this.env.fixedTopHeight + this.env.navHeight) * 2}rpx + ${height}px + ${this.statusBarHeight}px)`;
        this.headerStickyTop = height + this.env.navHeight + this.env.fixedTopHeight + this.statusBarHeight;
      });
      this.tabs.forEach((tab) => {
        iterateComponentData((data) => {
          if (data.componentCode === 'video') {
            this.$set(this.videoDataMap, tab.index, deepcopy(data));
          }
        }, tab.childrenData);
      });
    },
    destroyed() {
      uni.$off('hasFixedContainer');
      uni.$off('cmsVideoData');
    },
    methods: {
      // 这初始化tab选中第一个页签
      initTab() {
        this.tabs = this.tabs.map((item, index) => ({
          ...item,
          active: index === 0,
          init: index === 0,
        }));
        this.activeTab = this.tabs[0];
      },
      /**
       * 获取当前页签的高度
       */
      async getTabHeight() {
        const data = await new Promise((resolve, reject) => {
          uni
            .createSelectorQuery()
            .in(this)
            .select('.cms-tab-content')
            .boundingClientRect()
            .exec((res) => {
              if (res[0]) {
                resolve(res[0]);
                this.minHeight = `${res[0].height}px`;
              } else {
                reject(`query .cms-page boundingClientRect failed!`);
              }
            });
        });
        return data;
      },
      /**
       * 获取当前页面滚动高度
       * @author  韦胜健
       * @date    2022/9/19 19:44
       */
      getScrollTop() {
        if (this.pageScrollEvent && this.pageScrollEvent.getScrollTop) {
          return this.pageScrollEvent?.getScrollTop();
        }
      },
      /**
       * 获取Head的top值
       * @author  韦胜健
       * @date    2022/9/19 19:44
       */
      getHeadOffsetTop() {
        const dfd = defer();
        const query = this.createSelectorQuery();
        query.select('.cms-tab-header-wrapper').boundingClientRect();
        query.exec((res) => {
          dfd.resolve(res[0].top);
        });
        return dfd.promise;
      },
      /**
       * 显示某个tab
       * @author  韦胜健
       * @date    2022/9/20 9:20
       */
      async showTab(tab) {
        // Tab切换埋点
        trackCmsTabClick({ title: tab.title });
        /*如果已经显示则不做任何处理*/
        if (tab.active) {
          return;
        }

        // 全部课程分类页不执行这段逻辑
        if (this.$Route.name !== 'cmsCourseCLP') {
          await this.getTabHeight();
        }

        const activeTab = this.tabs.find((i) => i.active) || {};

        /*先令所有tab透明不显示*/
        this.opacityControl.hide();

        // 全部课程分类页不执行这段逻辑
        if (this.$Route.name !== 'cmsCourseCLP') {
          /*获取当前滚动高度*/
          const pageScrollTop = this.getScrollTop();
          /*获取header与顶部距离*/
          const headOffsetTop = await this.getHeadOffsetTop();

          /*如果header与顶部距离等于设置的黏在顶部的距离大小，证明当前已经黏住*/
          if (headOffsetTop === this.headerStickyTop) {
            /*当前已经黏住*/
            setTimeout(() => {
              /*已经黏住，应用完数据之后*/
              if (tab.scrollTop != null) {
                /*如果显示的tab已经有缓存的scrollTop，则应用显示的tab缓存的scrollTop*/
                uni.pageScrollTo({ scrollTop: tab.scrollTop, duration: 0 });
              } else {
                /*如果显示的tab没有缓存的scrollTop，则应该滚动到刚好黏住的位置*/
                /*这里必须确保页面组件的根节点有一个叫做cms-page的样式类名*/
                uni.pageScrollTo({ selector: `.cms-page >>> #${this.tabId}`, duration: 0 });
              }
              /*透明度显示*/
              this.opacityControl.show();
            }, 10);
            /*缓存隐藏的tab的滚动位置*/
            this.tabs[activeTab.index].scrollTop = pageScrollTop;
          } else {
            /*没有黏住，应用完数据之后什么也不做*/
            setTimeout(() => {
              this.opacityControl.show();
            }, 10);
            /*当前未黏住，将隐藏的tab的scrollTop设置为null，下次打开的时候要么刚好黏住显示，要么未黏住显示*/
            this.tabs[activeTab.index].scrollTop = null;
          }
        } else {
          setTimeout(() => {
            this.opacityControl.show();
          }, 10);
          this.tabs[activeTab.index].scrollTop = null;
        }

        /*旧的tab隐藏，新的tab显示*/
        this.tabs[activeTab.index].active = false;
        /*如果显示的tab没有初始化则初始化*/
        if (!tab.init) {
          this.tabs[tab.index].init = true;
        }
        this.tabs[tab.index].active = true;
        this.activeTab = this.tabs[tab.index];
        uni.$emit('switchTab', { videoComponentId: this.videoDataMap[tab.index]?.componentId });
        if (this.changeFirstPos) this.changeFirstPos(tab.title);
      },
    },
  };
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

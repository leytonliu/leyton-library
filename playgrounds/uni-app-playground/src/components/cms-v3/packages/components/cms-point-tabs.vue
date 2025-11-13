<template>
  <view :id="tabId" :class="classes" :data-component="data.componentCode" :style="styles" @tap="handleTapBaseContainer">
    <scroll-view :scroll-into-view="`${activeTab.index ? `tab-${activeTab.index - 1}` : ''}`" :style="headerStyles" class="cms-tabs-header-wrapper" scroll-with-animation scroll-x>
      <view v-for="(item, index) in tabsTitleChildrenData" :id="`tab-${index}`" :key="item.componentId" class="cms-tabs-header-item" :style="tabs[index].active ? innerStyles.activeStyles : innerStyles.inactiveStyles" :class="tabs[index].active && data.data.underlineWidth && data.data.underlineHeight && data.data.underlineColor ? 'cms-tab-header-item-active-underLine' : ''" @tap="showTab(tabs[index])">
        <cms-base-component :data="item" :index="index" />
      </view>
    </scroll-view>
    <template v-for="(tab, tabIndex) in tabs">
      <view v-if="!!tab.init" :key="tab.title" :style="tabStyles[tabIndex]" class="cms-tabs-content">
        <view v-for="item in tabsProductChildrenData" :key="item.componentId" class="tabs-product-content" @tap="jumpPage(item.data.product)">
          <o2-image :src="item.data.product.imageUrl" width="331" height="328" class="tabs-product-image" />
          <view class="tabs-product-title">{{ item.data.product.exchangeableTypeCode === 'COUPON' ? item.data.product.couponName : item.data.product.platformProductName }}</view>
          <view class="df aic jcsb tabs-point-content">
            <view class="point">
              <text>{{ item.data.product.point }}</text>
              <text>积分</text>
            </view>
            <view class="change-btn df aic jcc">
              <text>兑换</text>
            </view>
          </view>
        </view>
      </view>
    </template>
    <view class="cms-tabs-loading">
      <view v-if="tabs[activeIndex].loading" class="loading">
        <o2-image :width="48" is-absolute :src="minioUrl + imagePath + '/easy-loadimage/loading.gif'" />
        <text class="tip text-body2 color-grey2">{{ intl('b2c.component.cmsTabs.loading').d(`加载中`) }}</text>
      </view>
      <view v-else-if="!tabs[activeIndex].list.length" class="empty">
        <text class="line"></text>
        <text class="tip text-body2 color-grey2">{{ intl('b2c.component.cmsTabs.noData').d(`暂无数据`) }}</text>
        <text class="line"></text>
      </view>
      <view v-else-if="tabs[activeIndex].noMore" class="empty">
        <text class="line"></text>
        <text class="tip text-body2 color-grey2">{{ intl('b2c.component.cmsTabs.noMore').d(`没有更多了`) }}</text>
        <text class="line"></text>
      </view>
    </view>
    <coupon-exchange-popup ref="couponExchangePopup" />
  </view>
</template>

<script>
  import { CmsComponentMixin } from '@/components/cms/packages/utils/CmsComponentMixin';
  import { convertStyleToString } from '@/utils/utils';
  import { iterateComponentData } from '@/components/cms/packages/utils/iterateComponentData';
  import { CouponExchangePopup } from '@/components/coupon-exchange-popup';
  import { defer } from '@/utils/defer';
  import { removeUnit } from '../utils/removeUnit';
  import { deepcopy } from '../utils/deepcopy';
  import env from '@/env/index';
  import { trackCmsTabClick } from '@/components/cms/packages/utils/cmsTrackers';

  /**
   * 获取一个tab id，用来滚动的时候，pageScrollTo滚动到这个selector。前提是cms所在的页面根节点必须有一个叫做cms-page的根节点样式
   * @author  韦胜健
   * @date    2022/9/20 9:15
   */
  const nextTabId = (() => {
    let count = 0;
    return () => `tabs_header_${count++}`;
  })();

  const size = 10;

  export default {
    name: 'CmsPointTabs',
    mixins: [CmsComponentMixin],
    components: { CouponExchangePopup },
    inject: {
      pageScrollEvent: {},
    },
    data() {
      return {
        minioUrl: env.OSS_URL,
        imagePath: env.DEFAULT_IMAGE_PATH + env.theme, // oss资源路径
        activeIndex: 0,
        tabId: nextTabId(),
        /*标题粘性定位，距离顶部距离*/
        isSticky: false,
        headerStickyTop: this.env.navHeight + this.env.fixedTopHeight + this.statusBarHeight,
        headerStickyTopStyles: `calc(${(this.env.fixedTopHeight + this.env.navHeight + this.statusBarHeight) * (750 / uni.getSystemInfoSync().screenWidth)}rpx)`,
        activeTab: {}, // 当前激活的tab数据
        /*页签数据*/
        tabs: this.data.data.tabGroup.map((item, index) => ({
          ...item,
          index,
          loading: true,
          active: index === 0, // 当前是否显示
          init: index === 0, // 当前是否已经初始化，不能一开始就初始化所有的页签。某些组件初始化的时候如果没有高度会导致无法显示
          scrollTop: null, // 页签的缓存滚动高度，用于显示页签的时候滚动到之前隐藏页签的时候的高度
          noMore: false,
          page: 0,
          total: 0,
          list: [],
        })),
        stickyTop: 0,
        /**
         * 在切换页签的时候设置透明度为0，待滚动高度设置完毕之后再设置为1显示，不过由于小程序中的UI是异步渲染，这里感觉好像没什么用
         * @author  韦胜健
         * @date    2022/9/20 9:18
         */
        opacityControl: (() => {
          const state = {
            opacity: 1,
            transformDuration: 0,
          };
          const show = () => {
            this.opacityControl.state.transformDuration = 100;
            this.opacityControl.state.opacity = 1;
          };
          const hide = () => {
            this.opacityControl.state.transformDuration = 0;
            this.opacityControl.state.opacity = 0;
          };
          return { state, show, hide };
        })(),
      };
    },
    computed: {
      /**
       * header容器黏在顶部样式定位
       * @author  韦胜健
       * @date    2022/9/20 9:19
       */
      headerStyles() {
        return convertStyleToString({ top: this.headerStickyTopStyles, backgroundColor: this.data.data.titleBgColor });
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
            opacity: this.opacityControl.state.opacity,
            transformDuration: this.opacityControl.state.transformDuration,
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

      /*
       * @Description: 商品子节点数据
       * @Author: sunliu
       * @Date: 2022-10-12 11:41:37
       */
      tabsProductChildrenData() {
        if (!this.data.childrenData || !this.data.childrenData[1]) {
          console.error('tabs：当前未配置选项卡组件商品模板');
          return [];
        }
        /*模板数据*/
        const templateData = this.data.childrenData?.[1];

        const activeTab = this.tabs.find((i) => i.active);

        if (!activeTab) return [];

        /*生成伪造的数据*/
        const list = (activeTab.list || []).map((item) =>
          deepcopy({
            ...templateData,
            data: {
              ...templateData.data,
              product: item,
            },
          }),
        );
        iterateComponentData((data) => {
          data.childrenData?.forEach((childData) => {
            if (!childData) {
              return;
            }
            childData.data.product = data.data.product;
          });
        }, list);

        /*处理伪造的数据*/
        this.bindingValue.fakeDataManager.resetFakeData(this.data);
        this.bindingValue.fakeDataManager.processFakeData(this.data, list);

        return list;
      },

      /*
       * @Description: 商品模板子节点样式
       * @Author: sunliu
       * @Date: 2022-10-12 11:41:22
       */
      tabsProductChildrenStyles() {
        const width = `calc((100% - ${removeUnit(this.data.data.gutter) * (this.data.data.column - 1)}px)/${this.data.data.column})`;
        return this.tabsProductChildrenData.map((_, index) => ({
          width,
          marginBottom: this.data.data.gutter,
          marginRight: index != null && (index + 1) % this.data.data.column === 0 ? null : this.data.data.gutter,
        }));
      },

      /*
       * @Description: 标题子节点数据
       * @Author: sunliu
       * @Date: 2022-10-12 11:41:54
       */
      tabsTitleChildrenData() {
        if (!this.data.childrenData || !this.data.childrenData[0]) {
          console.error('tabs：当前未配置选项卡组件标题模板');
          return [];
        }
        /*模板数据*/
        const templateData = this.data.childrenData?.[0];
        /*生成伪造的数据*/
        const list = (this.data.data.tabGroup || []).map((item) =>
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
        iterateComponentData((data) => {
          data.childrenData?.forEach((childData) => {
            if (!childData) {
              return;
            }
            childData.data.tab = data.data.tab;
          });
        }, list);

        return list;
      },
    },

    async mounted() {
      this.activeTab = this.tabs[0];

      uni.$on('reachBottom', async () => {
        const activeTab = this.tabs.find((i) => i.active);

        if (activeTab && !activeTab.noMore) {
          activeTab.loading = true;
          await this.getProductListByCode(activeTab);
        }
      });

      await this.getProductListByCode(this.activeTab);
      uni.$on('openCouponExchangePopup', this.onOpenCouponPopup);
    },

    destroyed() {
      uni.$off('reachBottom');
      uni.$off('openCouponExchangePopup', this.onOpenCouponPopup);
    },
    methods: {
      adjustStyles(styles) {
        const { windowHeight, screenWidth } = uni.getSystemInfoSync();
        styles.minHeight = `calc(${(750 / screenWidth) * windowHeight}rpx - env(safe-area-inset-bottom) - env(safe-area-inset-top)`;
      },
      /*
       * @Description: 获取当前页面滚动高度
       * @Author: sunliu
       * @Date: 2022-10-12 11:40:38
       */
      getScrollTop() {
        return this.pageScrollEvent.getScrollTop();
      },
      /*
       * @Description: 获取Head的top值
       * @Author: sunliu
       * @Date: 2022-10-12 11:40:23
       */
      getHeadOffsetTop() {
        const dfd = defer();
        const query = this.createSelectorQuery();
        query.select('.cms-tabs-header-wrapper').boundingClientRect();
        query.exec((res) => {
          dfd.resolve(res[0].top);
        });
        return dfd.promise;
      },

      /*
       * @Description: 根据商品推荐编码查询商品列表
       * @Author: sunliu
       * @Date: 2022-10-12 11:50:51
       */
      async getProductListByCode(tab) {
        const { content, totalElements } = await this.env.getPointProductList({
          params: {
            exchangeableTypeCode: tab.typeCode,
            size,
            page: tab.page,
          },
        });
        this.tabs.splice(tab.index, 1, {
          ...tab,
          list: tab.list.concat(content),
          page: tab.page + 1,
          ...((tab.page + 1) * size <= totalElements && { page: tab.page + 1 }),
        });

        // 延迟一秒等真实的节点数据渲染完成，再展示结束标志
        setTimeout(() => {
          this.tabs.splice(tab.index, 1, {
            ...this.tabs[tab.index],
            loading: false,
            total: totalElements,
            noMore: (tab.page + 1) * size > totalElements,
          });
        }, 73);
      },
      /*
       * @Description: 显示某个tab
       * @Author: sunliu
       * @Date: 2022-10-12 11:40:10
       */
      async showTab(tab) {
        // Tab切换埋点
        trackCmsTabClick({ title: tab.title });
        this.activeIndex = tab.index;
        /*如果已经显示则不做任何处理*/
        if (tab.active) {
          return;
        }
        this.$showLorealLoading();
        const activeTab = this.tabs.find((i) => i.active);

        /*先令所有tab透明不显示*/
        this.opacityControl.hide();

        /*获取当前滚动高度*/
        const pageScrollTop = this.getScrollTop();
        /*获取header与顶部距离*/
        const headOffsetTop = await this.getHeadOffsetTop();
        console.log('headOffsetTop', headOffsetTop, 'headerStickyTop', this.headerStickyTop);
        console.log('tab.scrollTop', tab.index, tab.scrollTop);

        /*如果header与顶部距离等于设置的黏在顶部的距离大小，证明当前已经黏住*/
        if (Math.ceil(headOffsetTop) === parseInt(this.headerStickyTop)) {
          this.isSticky = true;
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
              // uni.pageScrollTo({ scrollTop: this.stickyTop, duration: 0 });
            }
            /*透明度显示*/
            this.opacityControl.show();
          }, 73);
          /*缓存隐藏的tab的滚动位置*/
          this.tabs[activeTab.index].scrollTop = pageScrollTop;
        } else {
          this.isSticky = false;
          /*没有黏住，应用完数据之后什么也不做*/
          setTimeout(() => {
            this.opacityControl.show();
          }, 73);
          /*当前未黏住，将隐藏的tab的scrollTop设置为null，下次打开的时候要么刚好黏住显示，要么未黏住显示*/
          this.tabs[activeTab.index].scrollTop = null;
        }

        /*旧的tab隐藏，新的tab显示*/
        this.tabs[activeTab.index].active = false;

        /*如果显示的tab没有初始化则初始化*/
        if (!tab.init) {
          this.tabs[tab.index].init = true;
          this.tabs[tab.index].loading = true;
          await this.getProductListByCode(tab);
        }
        this.tabs[tab.index].active = true;
        this.activeTab = this.tabs[tab.index];
        setTimeout(() => {
          this.$hideLorealLoading();
        }, 73);
      },
      onOpenCouponPopup(data) {
        this.$refs.couponExchangePopup.open(data);
      },
      jumpPage(product) {
        switch (this.activeTab.typeCode) {
          // 优惠券跳转
          case 'COUPON':
            uni.$emit('openCouponExchangePopup', { ...product });
            break;
          // 线下课程跳转
          case 'COURSE':
            this.$Router.push({
              name: 'offLineProductDetail',
              params: { courseCode: product.platformProductCode },
            });
            break;
          // 商品跳转
          default:
            this.$Router.push({
              name: 'productDetail',
              params: { platformProductCode: product.platformProductCode },
            });
        }
      },
    },
  };
</script>

<style lang="scss">
  .cms-point-tabs {
    .cms-tabs-header-wrapper {
      white-space: nowrap;
      width: 100%;
      position: sticky;
      z-index: 9;
      overflow-x: auto;

      .cms-tabs-header-item {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
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

    .cms-tabs-loading {
      width: 100%;

      .loading {
        display: flex;
        align-items: center;
        font-size: 12px;
        margin-left: -12px;
        justify-content: center;
        padding: 15px 0;
        .o2-image {
          background-color: transparent;
        }
      }

      .empty {
        display: flex;
        align-items: center;
        font-size: 24rpx;
        padding-bottom: 32rpx;
        padding-top: 16rpx;
        justify-content: center;

        image {
          width: 48rpx;
          height: 48rpx;
        }

        .line {
          width: 24rpx;
          height: 2rpx;
          background-color: var(--GREY3);
        }

        .tip {
          padding: 0 16rpx;
        }
      }
    }

    .cms-tabs-content {
      & > view {
        display: inline-block !important;
        vertical-align: top;
      }
    }
    .tabs-product-content {
      width: 331rpx;
      background: #ffffff;
      border-radius: 16rpx;
      margin-bottom: 48rpx;
      &:nth-child(2n + 1) {
        margin-right: 24rpx;
      }
      .tabs-product-image {
        height: 328rpx;
        border-radius: 16rpx;
        .o2-image {
          background-color: transparent !important;
        }
        image {
          border-radius: 16rpx;
        }
      }
      .tabs-product-title {
        font-weight: 400;
        font-size: 28rpx;
        color: #000000;
        @include font-regular();
        margin: 32rpx 24rpx;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .tabs-point-content {
        padding: 0 26rpx 32rpx 24rpx;
        .point {
          text:first-child {
            font-size: 28rpx;
            color: #000000;
            line-height: 28rpx;
            @include font-regular();
            margin-right: 12rpx;
          }
          text:last-child {
            font-size: 24rpx;
            color: #999;
            line-height: 24rpx;
            @include font-regular();
          }
        }
        .change-btn {
          width: 100rpx;
          height: 40rpx;
          background: #2f2f34;
          border-radius: 20rpx;
          text {
            font-size: 22rpx;
            color: #ffffff;
            line-height: 24rpx;
            @include font-regular();
          }
        }
      }
    }
  }
</style>

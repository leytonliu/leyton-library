<!--
 * @Author: shuyan.yin@hand-china.com
 * @Date: 2023-12-01 14:06:22
 * @LastEditTime: 2023-12-19 15:03:46
 * @LastEditors: shuyan.yin@hand-china.com
 * @Description: 图文左右滑动组件
 * @FilePath: \o2-b2c-mall\src\components\cms\packages\components\cms-graphic-slide.vue
-->
<template>
  <view class="graphic-slide-container">
    <view class="graphic-slide-container-background"></view>
    <view :class="classes" :data-component="data.componentCode" :style="styles" v-if="filterChildren.length" @tap="handleTapBaseContainer">
      <swiper :current="activeIndex" :previous-margin="margin" :next-margin="margin" :autoplay="false" :circular="true" :style="swiperStyles" @change="swiperChange">
        <swiper-item v-for="(item, index) in filterChildren" :key="item.componentId">
          <view :class="['swiper-item', activeIndex === index ? 'swiper-item-active' : `swiper-item-default`, 'scale-mode', index === prevIndex && 'transform-right', index === nextIndex && 'transform-left']">
            <cms-base-component :auto-get-rect="autoGetRectId" :children-styles="carouselChildrenStyles" :data="item" :index="index" />
          </view>
        </swiper-item>
      </swiper>
      <!-- 下面不横向滑动的部分 -->
      <view class="graphic-slide-title-container" :style="{ height: `${maxTitleHeight}px`, minHeight: '58px' }">
        <view v-for="(item, index) in titleChildren" :key="item.componentId" :class="['graphic-slide-title', activeIndex === index ? 'graphic-slide-title-show' : `graphic-slide-title-hide`]">
          <cms-base-component :auto-get-rect="autoGetRectTitleId" :data="item" :index="index + data.data.carouselNum" />
        </view>
      </view>
      <view class="indicator-container">
        <view class="indicator-outer">
          <view class="indicator-inner" :style="{ width: `${indicatorWidth}%`, marginLeft: `${indicatorLeft}%` }"></view>
        </view>
      </view>
    </view>
  </view>
</template>
<script>
  import { convertStyleToString } from '@/utils/utils';
  import { CmsComponentMixin } from '@/components/cms/packages/utils/CmsComponentMixin';
  import { createAutoGetRect } from '@/components/cms/packages/utils/createAutoGetRect';
  import { mapState } from 'vuex';

  export default {
    name: 'CmsGraphicSlide',
    mixins: [CmsComponentMixin],
    data() {
      let maxHeight = 0; // 保存子节点返回的高度中最大的一个
      let maxTitleHeight = 0;
      let count = 0; // 计数，判断子节点是否已经全部返回高度
      let titleCount = 0;

      const { id, clear } = createAutoGetRect.create(({ height }) => {
        count++;
        if (maxHeight < height) {
          maxHeight = height;
        }
        if (count === this.filterChildren.length) {
          /*子节点计数完毕，应用最大高度实现自适应高度的效果*/
          this.maxHeight = Math.ceil(maxHeight);
          clear();
        }
      });
      const { id: titleId, clear: titleClear } = createAutoGetRect.create(({ height }) => {
        titleCount++;
        if (maxTitleHeight < height) {
          maxTitleHeight = Math.ceil(height);
        }
        if (titleCount === this.filterChildren.length) {
          /*子节点计数完毕，应用最大高度实现自适应高度的效果*/
          this.maxTitleHeight = Math.ceil(maxTitleHeight);
          titleClear();
        }
      });

      return {
        maxHeight: null,
        maxTitleHeight: 24,
        autoGetRectId: id,
        autoGetRectTitleId: titleId,
        activeIndex: 0,
        margin: '186rpx',
      };
    },
    mounted() {
      // if (this.filterChildren.length > 2) {
      //   this.activeIndex = 1;
      // } else {
      //   this.activeIndex = 0;
      // }
    },
    computed: {
      /**
       * 设置swiper节点高度为最大高度
       * @author  韦胜健
       * @date    2022/9/19 20:53
       */
      swiperStyles() {
        const style = {};
        if (this.maxHeight != null) {
          style.height = `${this.maxHeight}px`;
        } else if (this.data.data.height) {
          style.height = `${this.data.data.height * 2}rpx`;
        } else {
          style.height = '100vw';
        }
        return convertStyleToString(style);
      },
      /**
       * 当有了最大高度之后，令子节点的高度都设置为100%，使得能够垂直居中
       * @author  韦胜健
       * @date    2022/9/19 20:53
       */
      carouselChildrenStyles() {
        /*当读取到最大高度的时候，就设置每个子节点容器高度为100%*/
        return this.maxHeight == null ? {} : { height: '100%' };
      },
      validChildren() {
        const swiperItems = this.data.childrenData.slice(0, this.data.data.carouselNum);
        const titleItems = this.data.childrenData.slice(this.data.data.carouselNum);
        const titleChildren = [];
        const filterChildren = swiperItems.reduce((prev, item, index) => {
          if (item.componentCode !== 'image' || !this.isLogin || this.seedingFlag || (this.isLogin && item.componentCode === 'image' && (!item.data.visibleFlag || (item.data.visibleFlag && this.seedingFlag)))) {
            prev.push(item);
            titleChildren.push(titleItems[index]);
          }
          return prev;
        }, []);
        return { filterChildren, titleChildren };
      },
      filterChildren() {
        // const filterChild = this.data.childrenData.reduce((prev, item) => {
        //   if (item.componentCode !== 'image' || !this.isLogin || this.seedingFlag || (this.isLogin && item.componentCode === 'image' && (!item.data.visibleFlag || (item.data.visibleFlag && this.seedingFlag)))) {
        //     prev.push(item);
        //   }
        //   return prev;
        // }, []);
        return this.validChildren.filterChildren;
      },
      titleChildren() {
        return this.validChildren.titleChildren;
      },
      isLogin() {
        return !!this.$store.state.login.token;
      },
      ...mapState({
        seedingFlag: (state) => state.user.seedingFlag,
        userInfo: (state) => state.user.userInfo,
      }),
      indicatorWidth() {
        return (1 / this.filterChildren.length) * 100;
      },
      indicatorLeft() {
        return this.activeIndex * (1 / this.filterChildren.length) * 100;
      },
      prevIndex() {
        return this.activeIndex === 0 ? this.data.data.carouselNum - 1 : this.activeIndex - 1;
      },
      nextIndex() {
        return this.activeIndex === this.data.data.carouselNum - 1 ? 0 : this.activeIndex + 1;
      },
    },
    methods: {
      swiperChange({ detail: { current } }) {
        this.activeIndex = current;
      },
    },
  };
</script>
<style lang="scss">
  .graphic-slide-container {
    position: relative;
    overflow: hidden;
    padding: 30rpx 0 20rpx;
    .graphic-slide-title-container {
      position: relative;
      overflow: hidden;
      .graphic-slide-title {
        position: absolute;
        top: 0;
        width: 100%;
        transition: all 240ms;
        &-show {
          pointer-events: auto;
          opacity: 1;
        }
        &-hide {
          pointer-events: none;
          opacity: 0;
        }
      }
    }
    .indicator-container {
      position: relative;
      width: 100%;
      height: 54rpx;
      overflow: hidden;
      .indicator-outer {
        position: absolute;
        width: 346rpx;
        height: 2rpx;
        // margin: 0 auto;
        left: calc((100% - 346rpx) / 2);
        bottom: 10rpx;
        background-color: #d8d8d8;
        z-index: 5;

        .indicator-inner {
          height: 2rpx;
          background-color: #000;
          transition: all 0.5s;
        }
      }
    }

    .scale-mode.swiper-item-default {
      transform: scale(0.78);
      &.transform-left {
        transform: scale(0.78) translateX(-11%);
      }
      &.transform-right {
        transform: scale(0.78) translateX(11%);
      }
    }
    .scale-mode {
      transform: scale(1);
      transform-origin: center center;
    }
    .scale-mode.swiper-item {
      transition: transform 0.3s;
    }

    .graphic-slide-container-background {
      position: absolute;
      top: 0;
      bottom: 0;
      left: 32rpx;
      width: calc(100% - 64rpx);
      border-radius: 16rpx;
      z-index: -1;
      background-color: #f5f5f5;
    }
  }
</style>

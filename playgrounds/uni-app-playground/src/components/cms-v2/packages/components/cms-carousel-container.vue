<template>
  <view :class="classes" :data-component="data.componentCode" :style="styles" v-if="filterChildren.length" @tap="handleTapBaseContainer">
    <swiper :current="activeIndex" :previous-margin="data.data.scaleMode ? data.data.prevMargin : 0" :next-margin="data.data.scaleMode ? data.data.nextMargin : 0" :autoplay="data.data.autoplay" :circular="data.data.loop" :style="swiperStyles" @change="swiperChange">
      <swiper-item v-for="(item, index) in filterChildren" :key="item.componentId">
        <view :class="['swiper-item', activeIndex === index ? 'swiper-item-active' : `swiper-item-default`, data.data.scaleMode && 'scale-mode', index === prevIndex && 'transform-right', index === nextIndex && 'transform-left']">
          <cms-base-component :auto-get-rect="autoGetRectId" :children-styles="carouselChildrenStyles" :data="item" :index="index" />
        </view>
      </swiper-item>
    </swiper>
    <view v-if="data.data.paginationType === '2'" class="indicator-outer" :style="{ backgroundColor: data.data.inActiveColor, bottom: `${data.data.marginBottom * 2}rpx` }">
      <view class="indicator-inner" :style="{ width: `${indicatorWidth}%`, marginLeft: `${indicatorLeft}%`, backgroundColor: data.data.activeColor }"></view>
    </view>
  </view>
</template>

<script>
  import { convertStyleToString } from '@/utils/utils';
  import { CmsComponentMixin } from '@/components/cms/packages/utils/CmsComponentMixin';
  import { createAutoGetRect } from '@/components/cms/packages/utils/createAutoGetRect';
  import { mapState } from 'vuex';

  /**
   * 轮播组件，可以支持自适应高度的功能，但是只能实现图片在第一层的自适应高度。如果图片组件在第二层或者更深层，则无法实现自适应高度的效果
   * @author  韦胜健
   * @date    2022/9/19 20:51
   */
  export default {
    name: 'CmsCarouselContainer',
    mixins: [CmsComponentMixin],
    data() {
      let maxHeight = 0; // 保存子节点返回的高度中最大的一个
      let count = 0; // 计数，判断子节点是否已经全部返回高度

      const { id, clear } = createAutoGetRect.create(({ height }) => {
        count++;
        if (maxHeight < height) {
          maxHeight = height;
        }
        if (count === this.data.childrenData.length) {
          /*子节点计数完毕，应用最大高度实现自适应高度的效果*/
          this.maxHeight = maxHeight;
          clear();
        }
      });

      return {
        maxHeight: null,
        autoGetRectId: id,
        activeIndex: 0,
      };
    },
    mounted() {
      if (this.data.data.scaleMode && this.filterChildren.length > 2) {
        this.activeIndex = 1;
      } else {
        this.activeIndex = 0;
      }
    },
    computed: {
      /**
       * 设置swiper节点高度为最大高度
       * @author  韦胜健
       * @date    2022/9/19 20:53
       */
      swiperStyles() {
        const style = {};
        if (this.data.data.height) {
          style.height = `${this.data.data.height * 2}rpx`;
        } else if (this.maxHeight != null) {
          style.height = `${this.maxHeight}px`;
        } else {
          style.height = '100vw';
        }
        // 轮播如果配置圆角，则在swiper组件上加上圆角属性
        if (this.data.style.borderRadius) {
          style.borderRadius = this.data.style.borderRadius;
          style.overflow = 'hidden';
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
      filterChildren() {
        const filterChild = this.data.childrenData.reduce((prev, item) => {
          if (item.componentCode !== 'image' || (item.componentCode === 'image' && !this.isLogin && !item.data.visibleFlag) || (item.componentCode === 'image' && this.isLogin && (!item.data.visibleFlag || (item.data.visibleFlag && this.seedingFlag)))) {
            prev.push(item);
          }
          return prev;
        }, []);
        return filterChild;
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
      swiperChange({ detail: { current, source } }) {
        // if (this.data.data.paginationType === '2') {
        //   this.activeIndex = current;
        // }
        if (source === 'autoplay' || source === 'touch') {
          this.activeIndex = current;
        }
      },
    },
  };
</script>

<style lang="scss">
  .cms-carousel-container {
    .indicator-outer {
      width: 420rpx;
      margin: 0 auto;
      height: 2rpx;
      position: absolute;
      z-index: 5;
      left: 50%;
      margin-left: -210rpx;

      .indicator-inner {
        height: 2rpx;
        transition: all 0.5s;
      }
    }

    .scale-mode.swiper-item-default {
      transform: scale(0.88);
    }
    .transform-left {
      transform-origin: left;
    }
    .transform-right {
      transform-origin: right;
    }
    .scale-mode.swiper-item {
      transition: transform 0.3s;
    }
  }
</style>

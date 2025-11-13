<!--
 * @Author: shuyan.yin@hand-china.com
 * @Date: 2023-11-15 13:54:01
 * @LastEditTime: 2023-12-22 14:58:00
 * @LastEditors: shuyan.yin@hand-china.com
 * @Description: 卡片堆叠组件
 * @FilePath: \o2-b2c-mall\src\components\cms\packages\components\cms-card-stack.vue
-->
<template>
  <view class="cms-card-stack-container" :style="{ height: `${(height || 411) * 2 + 32 * 2}rpx` }">
    <view class="cms-card-stack-items" :style="{ width: `${(width || 301) * 2}rpx` }">
      <view v-for="(data, index) in childrenData" :key="index" class="cms-card-stack-item" :class="childrenClasses[index]" :style="{ height: `${(height || 411) * 2}rpx` }" @touchstart="wxs.touchstart" :bindtouchmove="isIOS ? wxs.IOSTouchmove : wxs.touchmove">
        <cms-base-component :auto-get-rect="autoGetRect" :children-styles="childrenStyles" :data="data.item" :index="index" />
      </view>
    </view>
  </view>
</template>
<script>
  import { CmsComponentMixin } from '@/components/cms/packages/utils/CmsComponentMixin';
  import CmsCardStackTrackMixin from '@/mixin/track/cmsCardStackTrackMixin';

  const SLIDE_NONE = 0;
  const SLIDE_LEFT = 1;
  const SLIDE_RIGHT = 2;
  const HORIZONTAL = 102;
  /**
   * 特殊逻辑说明：
   * - 组件左滑展示下一张，右滑回到第一张
   *     - 所以要给“前一张”图片添加样式
   * - 组件有后两张图的虚像
   *     - 所以要给“后三张”图片添加样式
   * - 组件有无限滚动的需求
   *     - 所以至少需要 5 张图片：前一、当前、后一、后二、后三
   *     - 目前的实现是：不满 5 张图片时，复制子组件，补充到 5 张
   */
  export default {
    name: 'CmsCardStack',
    mixins: [CmsComponentMixin, CmsCardStackTrackMixin],
    data() {
      const sysInfo = wx.getSystemInfoSync();
      return {
        height: 411,
        width: 301,
        currentIndex: 0,
        touchEvent: { x: 0, type: SLIDE_NONE, lastIndex: 0 }, // 左滑右滑
        isIOS: sysInfo.platform === 'ios',
      };
    },
    methods: {
      /** 不满 5 张图片时，复制子组件，补充到 5 张
       * @param {any[]} items 目前的子组件
       * @param {number} count 实际数量`cardNum`
       * @return {{item: any, index: number}}
       */
      padItems(items = [], count) {
        const tempItems = items.map((item, index) => ({
          item: {
            ...item,
            parentComponentCode: 'card-stack',
          },
          index,
        }));
        if (tempItems.length < count) {
          tempItems.push(
            ...Array(count - tempItems.length)
              .fill(null)
              .map((_, i) => ({ item: {}, index: tempItems.length + i })),
          );
        }
        if (!tempItems.length || tempItems.length > 4) {
          return tempItems;
        } else if (tempItems.length === 1) {
          return Array(5).fill(tempItems[0]);
        } else if (tempItems.length === 2) {
          return [...tempItems, ...tempItems, ...tempItems];
        } else {
          return [...tempItems, ...tempItems];
        }
      },
      /** 不满 5 张图片时，复制子组件，补充到 5 张 */
      padNum(count) {
        if (count === 1) return 5;
        if (count === 2 || count === 3) return 6;
        if (count === 4) return 8;
        return count;
      },
      itemClasses(index) {
        const { currentIndex: value } = this; // 当前展示卡片下标
        const realNum = this.realNum;
        const plus = (num) => (num + 1 >= realNum ? num + 1 - realNum : num + 1);
        const prev = value - 1 < 0 ? value - 1 + realNum : value - 1;
        const next1 = plus(value);
        const next2 = plus(next1);
        const next3 = plus(next2);
        switch (index) {
          case value:
            return ['cms-card-stack-item-current'];
          case next1:
            return ['cms-card-stack-item-next'];
          case next2:
            return ['cms-card-stack-item-next-2'];
          case next3:
            return ['cms-card-stack-item-next-3'];
          case prev:
            return ['cms-card-stack-item-prev'];
          default:
            return index < value ? ['cms-card-stack-item-prev'] : ['cms-card-stack-item-next-3'];
        }
      },
      /** 上一张图片 */
      prevPage(curr = this.currentIndex) {
        const realNum = this.realNum;
        if (curr > 0) {
          this.currentIndex = curr - 1;
        } else {
          this.currentIndex = realNum - 1;
        }
      },
      /** 下一张图片 */
      nextPage(curr = this.currentIndex) {
        const realNum = this.realNum;
        if (curr < realNum - 1) {
          this.currentIndex = curr + 1;
        } else {
          this.currentIndex = 0;
        }
      },
      /**
       * 返回第一张图片\
       * 不满 5 张图片时，复制子组件，补充到 5 张\
       * 所以返回第一张图片时不能直接把 index 变成 0
       */
      backToFirstPage(curr = this.currentIndex) {
        let i = 0;
        switch (this.cardNum) {
          case 4:
            i = curr < 4 ? 0 : 4;
            break;
          case 3:
            i = curr < 3 ? 0 : 3;
            break;
          case 2:
            i = curr % 2 === 1 ? curr - 1 : curr;
            break;
          case 1:
            i = curr;
            break;
          default:
            i = 0;
        }
        this.currentIndex = i;
      },
      onTouchStart(e) {
        this.touchEvent = {
          x: e.touches[0].clientX,
          lastIndex: this.currentIndex,
          type: SLIDE_NONE,
        };
      },
      onTouchMove(e) {
        const threshold = 40;
        const { isVOH } = e;
        const moveX = e.touches[0].clientX;
        const { touchEvent } = this;
        const diffX = moveX - touchEvent.x;
        if (isVOH === HORIZONTAL) {
          if (diffX > threshold) {
            // 右滑
            if (!touchEvent.type !== SLIDE_RIGHT) {
              touchEvent.type = SLIDE_RIGHT;
              this.backToFirstPage(touchEvent.lastIndex);
            }
          } else if (diffX < -threshold) {
            // 左滑
            if (!touchEvent.type !== SLIDE_LEFT) {
              touchEvent.type = SLIDE_LEFT;
              this.nextPage(touchEvent.lastIndex);
            }
          } else {
            if (!touchEvent.type !== SLIDE_NONE) {
              touchEvent.type = SLIDE_NONE;
              this.currentIndex = touchEvent.lastIndex;
            }
          }
        }
      },
    },
    computed: {
      childrenData() {
        /** @type {{ item: any; index: number; }} */
        const items = this.padItems(this.data.childrenData, this.cardNum);
        return items;
      },
      childrenClasses() {
        return this.childrenData.map((_, index) => this.itemClasses(index));
      },
      cardNum() {
        return this.data.data.cardNum;
      },
      realNum() {
        return this.padNum(this.cardNum);
      },
    },
  };
</script>
<script lang="wxs" module="wxs" src="./cms-card-stack.wxs"></script>
<style lang="scss">
  .cms-card-stack-container {
    width: 100%;
    .cms-card-stack-items {
      position: relative;
      height: 100%;
      margin: 0 auto;
      .cms-card-stack-item {
        position: absolute;
        left: 0;
        width: 100%;
        opacity: 0;
        transform-origin: top center;
        transform: rotate(0) scale(1);
        transition-duration: 0;
        pointer-events: none;
        overflow: hidden;
        &.cms-card-stack-item-prev {
          top: 18%;
          left: -75%;
          transform: rotate(-20deg) scale(0.93);
          transition-duration: 360ms;
          z-index: 9;
        }
        &.cms-card-stack-item-current {
          top: 64rpx;
          opacity: 1;
          transition-duration: 360ms;
          pointer-events: auto;
          z-index: 7;
        }
        &.cms-card-stack-item-next {
          top: 44rpx;
          opacity: 0.5;
          transform: rotate(0) scale(0.93);
          transition-duration: 360ms;
          z-index: 5;
        }
        &.cms-card-stack-item-next-2 {
          top: 24rpx;
          opacity: 0.25;
          transform: rotate(0) scale(0.86);
          transition-duration: 360ms;
          z-index: 3;
        }
        &.cms-card-stack-item-next-3 {
          top: 4rpx;
          z-index: 1;
        }
      }
    }
  }
</style>

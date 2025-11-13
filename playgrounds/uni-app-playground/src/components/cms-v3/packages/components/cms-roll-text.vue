<template>
  <view :class="classes" :data-component="data.componentCode" :style="styles" @tap="handleTapBaseContainer">
    <view :style="wrapperStyles" class="cms-roll-text-wrapper">
      <view :class="innerClasses" :style="innerStyles">
        <view v-if="!data.data.vertical" :style="textStyles" class="horizontal-scroll-text">
          {{ data.data.textGroup.map((i) => i.text).join('。') }}
        </view>
        <template v-else>
          <swiper :autoplay="true" :interval="playTimer" :style="{ height: data.data.height }" circular vertical>
            <swiper-item v-for="(item, index) in data.data.textGroup" :key="index">
              <view :style="textStyles">
                {{ item.text }}
              </view>
            </swiper-item>
          </swiper>
        </template>
      </view>
    </view>
  </view>
</template>

<script>
  import { convertStyleToString } from '@/utils/utils';
  import { CmsComponentMixin } from '@/components/cms/packages/utils/CmsComponentMixin';

  /**
   * 滚动文字，横向播放的时候使用css @keyframes实现循环滚动，纵向的时候使用swiper实现
   * @author  韦胜健
   * @date    2022/9/19 21:03
   */
  export default {
    name: 'CmsRollText',
    mixins: [CmsComponentMixin],
    data() {
      return {
        horizontalTextWidth: 0,
        innerStyles: {},
      };
    },
    watch: {
      horizontalTextWidth(val) {
        this.innerStyles = convertStyleToString({
          animationDuration: `${this.playTimer / 1000}s`,
          '--end': `${val}px`,
        });
      },
    },
    computed: {
      /**
       * 播放的时间
       * @author  韦胜健
       * @date    2022/9/19 21:03
       */
      playTimer() {
        const timer = this.data.data.timer;
        return timer == null ? (this.data.data.vertical ? 3000 : 6000) : timer;
      },
      innerClasses() {
        return ['cms-roll-text-inner', `cms-roll-text-${this.data.data.vertical ? 'vertical' : 'horizontal'}`];
      },
      wrapperStyles() {
        const styles = {};
        if (this.data.data.vertical) {
          styles.height = this.data.data.height;
          styles.overflow = 'hidden';
        }
        return convertStyleToString(styles);
      },
      textStyles() {
        return convertStyleToString({
          height: this.data.data.height,
          overflow: this.data.data.vertical ? 'hidden' : 'unset',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        });
      },
    },
    mounted() {
      this.$nextTick(() => {
        const query = uni.createSelectorQuery().in(this);
        query
          .selectAll('.horizontal-scroll-text')
          .boundingClientRect((data) => {
            if (data && data[0]) {
              this.horizontalTextWidth = data[0].width;
            }
          })
          .exec();
      });
    },
  };
</script>

<style lang="scss">
  .cms-roll-text {
    .cms-roll-text-wrapper {
      overflow: hidden;

      .cms-roll-text-inner {
        transition-duration: 300ms;

        .horizontal-scroll-text {
          width: fit-content;
        }

        &.cms-roll-text-horizontal {
          @keyframes rollTextHorizontal {
            0% {
              transform: translateX(100%);
            }
            100% {
              transform: translateX(calc(var(--end) * -1));
            }
          }
          animation: rollTextHorizontal linear infinite;
        }
      }
    }
  }
</style>

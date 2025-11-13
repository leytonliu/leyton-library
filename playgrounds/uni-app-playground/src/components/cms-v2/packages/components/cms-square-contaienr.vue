<template>
  <view :class="classes" :data-component="data.componentCode" :style="styles" @tap="handleTapBaseContainer">
    <view :style="wrapperStyles" class="square-container-wrapper">
      <view class="square-container-inner">
        <cms-base-component v-for="(item, index) in data.childrenData" :key="item.componentId" :data="item" :index="index" />
      </view>
    </view>
  </view>
</template>

<script>
  import { CmsComponentMixin } from '@/components/cms/packages/utils/CmsComponentMixin';
  import { convertStyleToString } from '@/utils/utils';

  /**
   * 正方形容器，宽度自适应，高度与宽度相等的正方形容器，子节点内容不会撑开这个正方形范围
   * @author  韦胜健
   * @date    2022/9/19 21:05
   */
  export default {
    name: 'CmsSquareContainer',
    mixins: [CmsComponentMixin],
    computed: {
      wrapperStyles() {
        const styles = {};
        /**
         * 与web端不同，web端设置paddingBottom=100%就可以实现高度与宽度相等的大小，这里小程序端得设置为与width值相等 todo，所以这里是不是得判断H5的情况下的值
         * @author  韦胜健
         * @date    2022/9/19 21:06
         */
        styles.paddingBottom = '100%';
        return convertStyleToString(styles);
      },
    },
  };
</script>

<style lang="scss">
  .cms-square-container {
    width: 100%;

    .square-container-wrapper {
      width: 100%;
      position: relative;

      .square-container-inner {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        overflow: hidden;
      }
    }
  }
</style>
